import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';
import type { Database } from '@/integrations/supabase/types';

// Environment validation
const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url(),
  VITE_SUPABASE_ANON_KEY: z.string().min(1),
});

const env = envSchema.parse({
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
});

// Singleton Supabase client
let supabaseClient: SupabaseClient<Database> | null = null;

export function getSupabaseClient(): SupabaseClient<Database> {
  if (!supabaseClient) {
    supabaseClient = createClient<Database>(
      env.VITE_SUPABASE_URL,
      env.VITE_SUPABASE_ANON_KEY,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          storage: localStorage,
        },
      }
    );
  }
  return supabaseClient;
}

// Error taxonomy
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class NetworkError extends Error {
  constructor(message: string = 'Network request failed') {
    super(message);
    this.name = 'NetworkError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Standardized fetch with timeout and retries
export async function fetchJson<T>(
  url: string,
  options: RequestInit = {},
  retries = 3,
  timeout = 10000
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new ApiError(
        errorText || `HTTP ${response.status}`,
        response.status
      );
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof Error && error.name === 'AbortError') {
      throw new NetworkError('Request timeout');
    }

    if (retries > 0 && error instanceof Error) {
      // Exponential backoff
      await new Promise((resolve) => setTimeout(resolve, (4 - retries) * 1000));
      return fetchJson(url, options, retries - 1, timeout);
    }

    throw new NetworkError(
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

// Request/Response validation schemas
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.unknown().optional(),
  error: z.string().optional(),
});

export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

// Supabase function invoke helper with validation
export async function invokeSupabaseFunction<T>(
  functionName: string,
  payload?: Record<string, unknown>,
  schema?: z.ZodSchema<T>
): Promise<T> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase.functions.invoke(functionName, {
    body: payload,
  });

  if (error) {
    throw new ApiError(error.message, 500, error.name);
  }

  if (schema) {
    try {
      return schema.parse(data);
    } catch (validationError) {
      throw new ValidationError(
        `Invalid response from ${functionName}: ${validationError}`
      );
    }
  }

  return data as T;
}
// Standardized HTTP client for edge functions
export class HttpError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout = 10000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new HttpError('Request timeout', 408);
    }
    throw error;
  }
}

export async function fetchJson<T>(
  url: string,
  options: RequestInit = {},
  retries = 2
): Promise<T> {
  try {
    const response = await fetchWithTimeout(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new HttpError(
        errorText || `HTTP ${response.status}`,
        response.status
      );
    }

    return await response.json();
  } catch (error) {
    if (retries > 0 && error instanceof HttpError && error.status >= 500) {
      // Retry on server errors with exponential backoff
      await new Promise((resolve) => setTimeout(resolve, (3 - retries) * 1000));
      return fetchJson(url, options, retries - 1);
    }
    throw error;
  }
}
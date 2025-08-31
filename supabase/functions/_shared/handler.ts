import { z } from 'https://esm.sh/zod@3.22.4';
import { corsHeaders, handleCors } from './cors.ts';
import { createLogger, Logger } from './logger.ts';
import { getAuthenticatedUser } from './auth.ts';

export interface HandlerOptions {
  requireAuth?: boolean;
  inputSchema?: z.ZodSchema;
  outputSchema?: z.ZodSchema;
}

export interface HandlerContext {
  req: Request;
  logger: Logger;
  user?: any;
  input?: any;
}

export type HandlerFunction = (ctx: HandlerContext) => Promise<Response | any>;

export function createHandler(
  functionName: string,
  handler: HandlerFunction,
  options: HandlerOptions = {}
) {
  return async (req: Request): Promise<Response> => {
    const requestId = crypto.randomUUID();
    const logger = createLogger({ functionName, requestId });

    try {
      logger.step('Function started');

      // Handle CORS preflight
      const corsResponse = handleCors(req);
      if (corsResponse) {
        return corsResponse;
      }

      // Health check endpoint
      if (req.method === 'GET' && new URL(req.url).pathname.endsWith('/health')) {
        return new Response(
          JSON.stringify({ ok: true, function: functionName, timestamp: new Date().toISOString() }),
          {
            status: 200,
            headers: {
              ...corsHeaders(req),
              'Content-Type': 'application/json',
            },
          }
        );
      }

      let user;
      let input;

      // Authentication
      if (options.requireAuth !== false) {
        logger.step('Authenticating user');
        user = await getAuthenticatedUser(req);
        logger.step('User authenticated', { userId: user.id, email: user.email });
      }

      // Input validation
      if (options.inputSchema && req.method !== 'GET') {
        logger.step('Validating input');
        const body = await req.json();
        input = options.inputSchema.parse(body);
        logger.step('Input validated');
      }

      // Execute handler
      const context: HandlerContext = { req, logger, user, input };
      const result = await handler(context);

      // Handle different return types
      if (result instanceof Response) {
        return result;
      }

      // Validate output if schema provided
      let output = result;
      if (options.outputSchema) {
        logger.step('Validating output');
        output = options.outputSchema.parse(result);
      }

      logger.step('Function completed successfully');

      return new Response(JSON.stringify(output), {
        status: 200,
        headers: {
          ...corsHeaders(req),
          'Content-Type': 'application/json',
        },
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorCode = error instanceof Error ? error.name : 'UnknownError';
      
      logger.error('Function failed', { error: errorMessage, code: errorCode });

      // Map common errors to HTTP status codes
      let status = 500;
      if (errorMessage.includes('Authentication') || errorMessage.includes('authorization')) {
        status = 401;
      } else if (errorMessage.includes('permission') || errorMessage.includes('access')) {
        status = 403;
      } else if (errorMessage.includes('not found')) {
        status = 404;
      } else if (errorMessage.includes('validation') || errorMessage.includes('invalid')) {
        status = 400;
      }

      return new Response(
        JSON.stringify({ 
          error: errorMessage,
          code: errorCode,
          function: functionName,
          requestId 
        }),
        {
          status,
          headers: {
            ...corsHeaders(req),
            'Content-Type': 'application/json',
          },
        }
      );
    }
  };
}
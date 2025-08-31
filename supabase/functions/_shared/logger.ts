export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  functionName: string;
  requestId?: string;
  userId?: string;
  [key: string]: unknown;
}

export class Logger {
  constructor(private context: LogContext) {}

  private formatMessage(level: LogLevel, message: string, details?: unknown): string {
    const timestamp = new Date().toISOString();
    const contextStr = JSON.stringify(this.context);
    const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
    
    return `[${timestamp}] [${level.toUpperCase()}] [${this.context.functionName}] ${message}${detailsStr} ${contextStr}`;
  }

  debug(message: string, details?: unknown) {
    console.log(this.formatMessage('debug', message, details));
  }

  info(message: string, details?: unknown) {
    console.log(this.formatMessage('info', message, details));
  }

  warn(message: string, details?: unknown) {
    console.warn(this.formatMessage('warn', message, details));
  }

  error(message: string, details?: unknown) {
    console.error(this.formatMessage('error', message, details));
  }

  step(step: string, details?: unknown) {
    this.info(`Step: ${step}`, details);
  }
}

export function createLogger(context: LogContext): Logger {
  return new Logger(context);
}
/**
 * Logger Service
 * Centralized logging service for consistent error tracking and debugging
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  userId?: string;
  action?: string;
  metadata?: Record<string, unknown>;
  timestamp?: Date;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isProduction = process.env.NODE_ENV === 'production';

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` | ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  private log(level: LogLevel, message: string, context?: LogContext): void {
    // In production, we would send logs to a service like Sentry or LogRocket
    // For now, we'll use console methods appropriately
    const formattedMessage = this.formatMessage(level, message, context);

    switch (level) {
      case 'debug':
        if (this.isDevelopment) {
          console.debug(formattedMessage);
        }
        break;
      case 'info':
        if (!this.isProduction) {
          console.info(formattedMessage);
        }
        break;
      case 'warn':
        console.warn(formattedMessage);
        break;
      case 'error':
        console.error(formattedMessage);
        // In production, this would also send to error tracking service
        if (this.isProduction && context?.metadata) {
          // TODO: Send to Sentry or similar service
        }
        break;
    }
  }

  debug(message: string, context?: LogContext): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: LogContext): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log('warn', message, context);
  }

  /**
   * Log error messages with optional error object and context
   * 
   * @param message - Human-readable error description
   * @param error - Optional Error object or unknown error value
   * @param context - Optional context including userId, action, and metadata
   * 
   * @example
   * logger.error('Failed to upload file', error, {
   *   action: 'fileUpload',
   *   metadata: { fileId: '123', size: 1024 }
   * });
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const errorDetails = error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
    } : error;

    this.log('error', message, {
      ...context,
      metadata: {
        ...context?.metadata,
        error: errorDetails,
      },
    });
  }

  // Track user actions for analytics
  trackAction(action: string, metadata?: Record<string, unknown>): void {
    if (!this.isProduction) {
      this.info(`User Action: ${action}`, {
        action,
        metadata,
        timestamp: new Date(),
      });
    }
    // In production, this would send to analytics service
  }

  // Track performance metrics
  trackPerformance(metric: string, duration: number, metadata?: Record<string, unknown>): void {
    this.info(`Performance: ${metric}`, {
      action: 'performance',
      metadata: {
        metric,
        duration,
        ...metadata,
      },
    });
  }
}

// Export singleton instance
export const logger = new Logger();
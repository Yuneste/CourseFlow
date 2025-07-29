import { env } from './env'

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  userId?: string
  requestId?: string
  route?: string
  [key: string]: any
}

class Logger {
  private context: LogContext = {}

  // Set context that will be included in all logs
  setContext(context: LogContext) {
    this.context = { ...this.context, ...context }
  }

  // Clear context
  clearContext() {
    this.context = {}
  }

  // Core logging method
  private log(level: LogLevel, message: string, data?: any) {
    const timestamp = new Date().toISOString()
    const logEntry = {
      timestamp,
      level,
      message,
      ...this.context,
      ...(data && { data }),
      environment: env.NODE_ENV,
    }

    // In development, use console with colors
    if (env.isDevelopment) {
      const colors = {
        debug: '\x1b[36m', // Cyan
        info: '\x1b[32m',  // Green
        warn: '\x1b[33m',  // Yellow
        error: '\x1b[31m', // Red
      }
      const reset = '\x1b[0m'
      const color = colors[level]
      
      console.log(`${color}[${level.toUpperCase()}]${reset} ${timestamp} - ${message}`, data || '')
    } else {
      // In production, output structured JSON logs
      console.log(JSON.stringify(logEntry))
    }

    // In production, you might want to send logs to a service like:
    // - Datadog
    // - New Relic
    // - Sentry (for errors)
    // - CloudWatch
    // - LogDNA
    if (env.isProduction && level === 'error') {
      // Example: Send to error tracking service
      // Sentry.captureException(new Error(message), { extra: data })
    }
  }

  debug(message: string, data?: any) {
    if (env.isDevelopment) {
      this.log('debug', message, data)
    }
  }

  info(message: string, data?: any) {
    this.log('info', message, data)
  }

  warn(message: string, data?: any) {
    this.log('warn', message, data)
  }

  error(message: string, error?: Error | any, data?: any) {
    const errorData = {
      ...data,
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name,
      } : error,
    }
    this.log('error', message, errorData)
  }

  // Performance logging
  time(label: string) {
    if (env.isDevelopment) {
      console.time(label)
    }
  }

  timeEnd(label: string) {
    if (env.isDevelopment) {
      console.timeEnd(label)
    }
  }

  // API request logging
  logRequest(req: Request, res?: Response, duration?: number) {
    const url = new URL(req.url)
    this.info('API Request', {
      method: req.method,
      path: url.pathname,
      query: Object.fromEntries(url.searchParams),
      status: res?.status,
      duration: duration ? `${duration}ms` : undefined,
      userAgent: req.headers.get('user-agent'),
    })
  }

  // Database query logging
  logQuery(query: string, params?: any[], duration?: number) {
    this.debug('Database Query', {
      query: env.isDevelopment ? query : query.substring(0, 100) + '...', // Truncate in production
      params: env.isDevelopment ? params : undefined, // Don't log params in production
      duration: duration ? `${duration}ms` : undefined,
    })
  }

  // Create child logger with additional context
  child(context: LogContext): Logger {
    const childLogger = new Logger()
    childLogger.setContext({ ...this.context, ...context })
    return childLogger
  }
}

// Export singleton instance
export const logger = new Logger()

// Middleware for request logging
export function loggerMiddleware(req: Request): void {
  const requestId = crypto.randomUUID()
  logger.setContext({ requestId, route: new URL(req.url).pathname })
}
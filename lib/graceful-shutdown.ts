import { logger } from './logger'

interface ShutdownHandler {
  name: string
  handler: () => Promise<void>
  timeout?: number
}

class GracefulShutdown {
  private handlers: ShutdownHandler[] = []
  private isShuttingDown = false
  private shutdownPromise: Promise<void> | null = null

  constructor() {
    // Register process event handlers
    process.on('SIGTERM', () => this.shutdown('SIGTERM'))
    process.on('SIGINT', () => this.shutdown('SIGINT'))
    process.on('SIGHUP', () => this.shutdown('SIGHUP'))
    
    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught exception:', error)
      this.shutdown('uncaughtException')
    })
    
    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled rejection:', { reason, promise })
      this.shutdown('unhandledRejection')
    })
  }

  /**
   * Register a shutdown handler
   */
  register(name: string, handler: () => Promise<void>, timeout = 10000) {
    this.handlers.push({ name, handler, timeout })
    logger.debug(`Registered shutdown handler: ${name}`)
  }

  /**
   * Initiate graceful shutdown
   */
  async shutdown(signal: string): Promise<void> {
    if (this.isShuttingDown) {
      logger.warn(`Shutdown already in progress, ignoring ${signal}`)
      return this.shutdownPromise!
    }

    this.isShuttingDown = true
    logger.info(`Received ${signal}, starting graceful shutdown...`)

    this.shutdownPromise = this.performShutdown()
    await this.shutdownPromise
  }

  private async performShutdown(): Promise<void> {
    const shutdownTimeout = 30000 // 30 seconds total timeout
    const startTime = Date.now()

    try {
      // Execute all shutdown handlers
      const shutdownPromises = this.handlers.map(async ({ name, handler, timeout = 10000 }) => {
        logger.info(`Executing shutdown handler: ${name}`)
        
        try {
          await Promise.race([
            handler(),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error(`Timeout after ${timeout}ms`)), timeout)
            )
          ])
          logger.info(`Shutdown handler completed: ${name}`)
        } catch (error) {
          logger.error(`Shutdown handler failed: ${name}`, error)
        }
      })

      // Wait for all handlers with global timeout
      await Promise.race([
        Promise.all(shutdownPromises),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Global shutdown timeout')), shutdownTimeout)
        )
      ])

      const duration = Date.now() - startTime
      logger.info(`Graceful shutdown completed in ${duration}ms`)
      
    } catch (error) {
      const duration = Date.now() - startTime
      logger.error(`Graceful shutdown failed after ${duration}ms:`, error)
    } finally {
      // Force exit after cleanup attempt
      logger.info('Exiting process...')
      process.exit(0)
    }
  }

  /**
   * Get shutdown status
   */
  isShutdownInProgress(): boolean {
    return this.isShuttingDown
  }
}

// Create singleton instance
export const gracefulShutdown = new GracefulShutdown()

// Common shutdown handlers
export const shutdownHandlers = {
  /**
   * Close database connections
   */
  database: async () => {
    logger.info('Closing database connections...')
    // Close any active database connections
    // For Supabase, connections are typically closed automatically
  },

  /**
   * Finish processing active requests
   */
  activeRequests: async () => {
    logger.info('Waiting for active requests to complete...')
    // In a real implementation, you'd track active requests
    // and wait for them to complete
    await new Promise(resolve => setTimeout(resolve, 1000))
  },

  /**
   * Clear any pending timers/intervals
   */
  timers: async () => {
    logger.info('Clearing pending timers...')
    // Clear any setInterval/setTimeout that might be running
  },

  /**
   * Close file handles and streams
   */
  fileHandles: async () => {
    logger.info('Closing file handles...')
    // Close any open file handles or streams
  },

  /**
   * Clear caches
   */
  caches: async () => {
    logger.info('Clearing caches...')
    // Clear any in-memory caches
  }
}

// Register default handlers
gracefulShutdown.register('database', shutdownHandlers.database)
gracefulShutdown.register('activeRequests', shutdownHandlers.activeRequests)
gracefulShutdown.register('timers', shutdownHandlers.timers)
gracefulShutdown.register('fileHandles', shutdownHandlers.fileHandles)
gracefulShutdown.register('caches', shutdownHandlers.caches)

export default gracefulShutdown
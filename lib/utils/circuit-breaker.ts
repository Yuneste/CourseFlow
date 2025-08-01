import * as Sentry from '@sentry/nextjs';

export interface CircuitBreakerOptions {
  failureThreshold: number;
  resetTimeout: number;
  monitoringPeriod: number;
  halfOpenRequests: number;
}

type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export class CircuitBreaker {
  private state: CircuitState = 'CLOSED';
  private failures = 0;
  private successes = 0;
  private lastFailTime: Date | null = null;
  private halfOpenRequests = 0;
  private readonly options: CircuitBreakerOptions;
  private readonly name: string;

  constructor(name: string, options?: Partial<CircuitBreakerOptions>) {
    this.name = name;
    this.options = {
      failureThreshold: options?.failureThreshold ?? 5,
      resetTimeout: options?.resetTimeout ?? 60000, // 1 minute
      monitoringPeriod: options?.monitoringPeriod ?? 10000, // 10 seconds
      halfOpenRequests: options?.halfOpenRequests ?? 3,
    };
  }

  async execute<T>(
    fn: () => Promise<T>,
    fallback?: () => Promise<T>
  ): Promise<T> {
    if (this.state === 'OPEN') {
      if (this.shouldAttemptReset()) {
        this.state = 'HALF_OPEN';
        this.halfOpenRequests = 0;
      } else {
        Sentry.captureMessage(`Circuit breaker ${this.name} is OPEN`, 'warning');
        
        if (fallback) {
          return fallback();
        }
        throw new Error(`Circuit breaker ${this.name} is OPEN`);
      }
    }

    if (this.state === 'HALF_OPEN' && this.halfOpenRequests >= this.options.halfOpenRequests) {
      if (fallback) {
        return fallback();
      }
      throw new Error(`Circuit breaker ${this.name} is testing in HALF_OPEN state`);
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    
    if (this.state === 'HALF_OPEN') {
      this.successes++;
      this.halfOpenRequests++;
      
      if (this.successes >= this.options.halfOpenRequests) {
        this.state = 'CLOSED';
        this.successes = 0;
        console.log(`Circuit breaker ${this.name} is now CLOSED`);
      }
    }
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailTime = new Date();
    
    if (this.state === 'HALF_OPEN') {
      this.state = 'OPEN';
      this.successes = 0;
      Sentry.captureMessage(`Circuit breaker ${this.name} reopened after HALF_OPEN test`, 'warning');
    } else if (this.failures >= this.options.failureThreshold) {
      this.state = 'OPEN';
      Sentry.captureMessage(`Circuit breaker ${this.name} opened after ${this.failures} failures`, 'error');
    }
  }

  private shouldAttemptReset(): boolean {
    return (
      this.lastFailTime !== null &&
      Date.now() - this.lastFailTime.getTime() >= this.options.resetTimeout
    );
  }

  getState(): CircuitState {
    return this.state;
  }

  getMetrics() {
    return {
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      lastFailTime: this.lastFailTime,
    };
  }

  reset(): void {
    this.state = 'CLOSED';
    this.failures = 0;
    this.successes = 0;
    this.lastFailTime = null;
    this.halfOpenRequests = 0;
  }
}

// Singleton instances for common services
export const circuitBreakers = {
  stripe: new CircuitBreaker('stripe', {
    failureThreshold: 3,
    resetTimeout: 30000, // 30 seconds
  }),
  openai: new CircuitBreaker('openai', {
    failureThreshold: 5,
    resetTimeout: 60000, // 1 minute
  }),
  supabase: new CircuitBreaker('supabase', {
    failureThreshold: 10,
    resetTimeout: 30000, // 30 seconds
  }),
  email: new CircuitBreaker('email', {
    failureThreshold: 3,
    resetTimeout: 300000, // 5 minutes
  }),
};
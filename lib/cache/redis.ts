import 'server-only';
import { Redis } from 'ioredis';
import { env } from '@/lib/env';
import * as Sentry from '@sentry/nextjs';

// Redis client singleton
let redisClient: Redis | null = null;

interface CacheOptions {
  ttl?: number; // Time to live in seconds
  tags?: string[]; // Cache tags for invalidation
}

export function getRedisClient(): Redis | null {
  if (!env.REDIS_URL) {
    return null;
  }

  if (!redisClient) {
    try {
      redisClient = new Redis(env.REDIS_URL, {
        maxRetriesPerRequest: 3,
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        reconnectOnError: (err) => {
          const targetError = 'READONLY';
          if (err.message.includes(targetError)) {
            // Only reconnect when the error contains "READONLY"
            return true;
          }
          return false;
        },
      });

      redisClient.on('error', (error) => {
        console.error('Redis Client Error:', error);
        Sentry.captureException(error);
      });

      redisClient.on('connect', () => {
        console.log('Redis Client Connected');
      });

    } catch (error) {
      console.error('Failed to create Redis client:', error);
      Sentry.captureException(error);
      return null;
    }
  }

  return redisClient;
}

export class Cache {
  private client: Redis | null;
  private prefix: string;

  constructor(prefix: string = 'courseflow') {
    this.client = getRedisClient();
    this.prefix = prefix;
  }

  private getKey(key: string): string {
    return `${this.prefix}:${key}`;
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.client) return null;

    try {
      const value = await this.client.get(this.getKey(key));
      return value ? JSON.parse(value) : null;
    } catch (error) {
      Sentry.captureException(error);
      return null;
    }
  }

  async set<T>(key: string, value: T, options?: CacheOptions): Promise<boolean> {
    if (!this.client) return false;

    try {
      const serialized = JSON.stringify(value);
      const fullKey = this.getKey(key);
      
      if (options?.ttl) {
        await this.client.setex(fullKey, options.ttl, serialized);
      } else {
        await this.client.set(fullKey, serialized);
      }

      // Handle tags for cache invalidation
      if (options?.tags && options.tags.length > 0) {
        const pipeline = this.client.pipeline();
        for (const tag of options.tags) {
          pipeline.sadd(`${this.prefix}:tag:${tag}`, fullKey);
        }
        await pipeline.exec();
      }

      return true;
    } catch (error) {
      Sentry.captureException(error);
      return false;
    }
  }

  async delete(key: string): Promise<boolean> {
    if (!this.client) return false;

    try {
      await this.client.del(this.getKey(key));
      return true;
    } catch (error) {
      Sentry.captureException(error);
      return false;
    }
  }

  async deleteByTag(tag: string): Promise<number> {
    if (!this.client) return 0;

    try {
      const tagKey = `${this.prefix}:tag:${tag}`;
      const keys = await this.client.smembers(tagKey);
      
      if (keys.length === 0) return 0;

      const pipeline = this.client.pipeline();
      for (const key of keys) {
        pipeline.del(key);
      }
      pipeline.del(tagKey);
      
      await pipeline.exec();
      return keys.length;
    } catch (error) {
      Sentry.captureException(error);
      return 0;
    }
  }

  async flush(): Promise<boolean> {
    if (!this.client) return false;

    try {
      // Scan and delete all keys with our prefix
      const stream = this.client.scanStream({
        match: `${this.prefix}:*`,
        count: 100,
      });

      const pipeline = this.client.pipeline();
      let count = 0;

      for await (const keys of stream) {
        for (const key of keys) {
          pipeline.del(key);
          count++;
        }
      }

      if (count > 0) {
        await pipeline.exec();
      }

      return true;
    } catch (error) {
      Sentry.captureException(error);
      return false;
    }
  }

  async remember<T>(
    key: string,
    factory: () => Promise<T>,
    options?: CacheOptions
  ): Promise<T | null> {
    // Try to get from cache first
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Generate the value
    try {
      const value = await factory();
      await this.set(key, value, options);
      return value;
    } catch (error) {
      Sentry.captureException(error);
      return null;
    }
  }

  // Batch operations
  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    if (!this.client || keys.length === 0) {
      return new Array(keys.length).fill(null);
    }

    try {
      const fullKeys = keys.map(key => this.getKey(key));
      const values = await this.client.mget(...fullKeys);
      
      return values.map(value => {
        try {
          return value ? JSON.parse(value) : null;
        } catch {
          return null;
        }
      });
    } catch (error) {
      Sentry.captureException(error);
      return new Array(keys.length).fill(null);
    }
  }

  async mset<T>(items: Record<string, T>, options?: CacheOptions): Promise<boolean> {
    if (!this.client || Object.keys(items).length === 0) return false;

    try {
      const pipeline = this.client.pipeline();
      
      for (const [key, value] of Object.entries(items)) {
        const fullKey = this.getKey(key);
        const serialized = JSON.stringify(value);
        
        if (options?.ttl) {
          pipeline.setex(fullKey, options.ttl, serialized);
        } else {
          pipeline.set(fullKey, serialized);
        }
        
        // Handle tags
        if (options?.tags && options.tags.length > 0) {
          for (const tag of options.tags) {
            pipeline.sadd(`${this.prefix}:tag:${tag}`, fullKey);
          }
        }
      }
      
      await pipeline.exec();
      return true;
    } catch (error) {
      Sentry.captureException(error);
      return false;
    }
  }
}

// Pre-configured cache instances for different use cases
export const caches = {
  default: new Cache(),
  sessions: new Cache('sessions'),
  files: new Cache('files'),
  courses: new Cache('courses'),
  subscriptions: new Cache('subscriptions'),
  ai: new Cache('ai'),
} as const;

// Helper function to create a cache key with user context
export function getUserCacheKey(userId: string, key: string): string {
  return `user:${userId}:${key}`;
}

// Helper function to create a cache key with course context
export function getCourseCacheKey(courseId: string, key: string): string {
  return `course:${courseId}:${key}`;
}
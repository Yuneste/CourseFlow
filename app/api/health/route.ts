import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { circuitBreakers } from '@/lib/utils/circuit-breaker'
import { env } from '@/lib/env'
import * as Sentry from '@sentry/nextjs'

interface HealthCheck {
  service: string
  status: 'healthy' | 'unhealthy' | 'degraded'
  latency?: number
  error?: string
  timestamp: string
  details?: any
}

interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded'
  timestamp: string
  version: string
  uptime: number
  checks: HealthCheck[]
  circuitBreakers?: Record<string, any>
}

const appStartTime = Date.now()

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  const checks: HealthCheck[] = []
  
  // Check if this is a simple liveness probe
  const url = new URL(request.url)
  if (url.searchParams.get('type') === 'liveness') {
    return NextResponse.json({ status: 'ok' })
  }
  
  try {
    // Run all checks in parallel for better performance
    const [dbCheck, storageCheck, stripeCheck, openaiCheck, envCheck, memoryCheck] = await Promise.all([
      checkDatabase(),
      checkStorage(),
      checkStripe(),
      checkOpenAI(),
      checkEnvironmentVariables(),
      checkMemoryUsage()
    ])
    
    checks.push(dbCheck, storageCheck, stripeCheck, openaiCheck, envCheck, memoryCheck)
    
    // Determine overall status
    const hasUnhealthy = checks.some(check => check.status === 'unhealthy')
    const hasDegraded = checks.some(check => check.status === 'degraded')
    
    let overallStatus: 'healthy' | 'unhealthy' | 'degraded' = 'healthy'
    if (hasUnhealthy) {
      overallStatus = 'unhealthy'
    } else if (hasDegraded) {
      overallStatus = 'degraded'
    }
    
    const healthStatus: HealthStatus = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '0.1.0',
      uptime: Math.round((Date.now() - appStartTime) / 1000),
      checks,
      circuitBreakers: getCircuitBreakerStatus()
    }
    
    const statusCode = overallStatus === 'healthy' ? 200 : 
                      overallStatus === 'degraded' ? 200 : 503
    
    return NextResponse.json(healthStatus, { status: statusCode })
    
  } catch (error) {
    Sentry.captureException(error)
    
    const errorCheck: HealthCheck = {
      service: 'health-endpoint',
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }
    
    const healthStatus: HealthStatus = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '0.1.0',
      uptime: Math.round((Date.now() - appStartTime) / 1000),
      checks: [errorCheck]
    }
    
    return NextResponse.json(healthStatus, { status: 503 })
  }
}

async function checkDatabase(): Promise<HealthCheck> {
  const startTime = Date.now()
  
  try {
    const supabase = await createClient()
    
    // Simple query to test connection
    const { error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)
    
    const latency = Date.now() - startTime
    
    if (error) {
      return {
        service: 'database',
        status: 'unhealthy',
        latency,
        error: error.message,
        timestamp: new Date().toISOString()
      }
    }
    
    // Determine status based on latency
    const status = latency > 1000 ? 'degraded' : 'healthy'
    
    return {
      service: 'database',
      status,
      latency,
      timestamp: new Date().toISOString()
    }
    
  } catch (error) {
    return {
      service: 'database',
      status: 'unhealthy',
      latency: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Database connection failed',
      timestamp: new Date().toISOString()
    }
  }
}

async function checkStorage(): Promise<HealthCheck> {
  const startTime = Date.now()
  
  try {
    const supabase = await createClient()
    
    // List buckets to check storage connection
    const { data, error } = await supabase.storage.listBuckets()
    
    if (error) throw error
    
    return {
      service: 'storage',
      status: 'healthy',
      latency: Date.now() - startTime,
      timestamp: new Date().toISOString(),
      details: { buckets: data?.length || 0 }
    }
  } catch (error) {
    return {
      service: 'storage',
      status: 'unhealthy',
      latency: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Storage connection failed',
      timestamp: new Date().toISOString()
    }
  }
}

async function checkStripe(): Promise<HealthCheck> {
  if (!env.STRIPE_SECRET_KEY) {
    return {
      service: 'stripe',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      details: { configured: false }
    }
  }
  
  const startTime = Date.now()
  
  try {
    const { default: Stripe } = await import('stripe')
    const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-07-30.basil',
    })
    
    await circuitBreakers.stripe.execute(async () => {
      await stripe.products.list({ limit: 1 })
    })
    
    return {
      service: 'stripe',
      status: 'healthy',
      latency: Date.now() - startTime,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    return {
      service: 'stripe',
      status: 'unhealthy',
      latency: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Stripe connection failed',
      timestamp: new Date().toISOString()
    }
  }
}

async function checkOpenAI(): Promise<HealthCheck> {
  if (!env.OPENAI_API_KEY) {
    return {
      service: 'openai',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      details: { configured: false }
    }
  }
  
  const startTime = Date.now()
  
  try {
    const response = await circuitBreakers.openai.execute(async () => {
      return await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
        },
      })
    })
    
    if (!response.ok) throw new Error(`OpenAI API error: ${response.status}`)
    
    return {
      service: 'openai',
      status: 'healthy',
      latency: Date.now() - startTime,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    return {
      service: 'openai',
      status: 'unhealthy',
      latency: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'OpenAI connection failed',
      timestamp: new Date().toISOString()
    }
  }
}

function checkEnvironmentVariables(): HealthCheck {
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
  ]
  
  const missingVars = requiredEnvVars.filter(
    varName => !process.env[varName]
  )
  
  if (missingVars.length > 0) {
    return {
      service: 'environment',
      status: 'unhealthy',
      error: `Missing environment variables: ${missingVars.join(', ')}`,
      timestamp: new Date().toISOString()
    }
  }
  
  return {
    service: 'environment',
    status: 'healthy',
    timestamp: new Date().toISOString()
  }
}

function checkMemoryUsage(): HealthCheck {
  try {
    const memUsage = process.memoryUsage()
    const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024)
    const heapTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024)
    const rssMB = Math.round(memUsage.rss / 1024 / 1024)
    const memoryPercentage = (heapUsedMB / heapTotalMB) * 100
    
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'
    
    if (memoryPercentage > 90) {
      status = 'unhealthy'
    } else if (memoryPercentage > 75) {
      status = 'degraded'
    }
    
    return {
      service: 'memory',
      status,
      timestamp: new Date().toISOString(),
      details: {
        heapUsedMB,
        heapTotalMB,
        rssMB,
        heapPercentage: Math.round(memoryPercentage)
      }
    }
    
  } catch (error) {
    return {
      service: 'memory',
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Memory check failed',
      timestamp: new Date().toISOString()
    }
  }
}

function getCircuitBreakerStatus(): Record<string, any> {
  const status: Record<string, any> = {}
  
  Object.entries(circuitBreakers).forEach(([name, breaker]) => {
    const metrics = breaker.getMetrics()
    status[name] = {
      state: metrics.state,
      failures: metrics.failures,
      lastFailTime: metrics.lastFailTime,
    }
  })
  
  return status
}
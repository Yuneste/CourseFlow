import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface HealthCheck {
  service: string
  status: 'healthy' | 'unhealthy' | 'degraded'
  latency?: number
  error?: string
  timestamp: string
}

interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded'
  timestamp: string
  version: string
  uptime: number
  checks: HealthCheck[]
}

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  const checks: HealthCheck[] = []
  
  try {
    // Check database connection
    const dbCheck = await checkDatabase()
    checks.push(dbCheck)
    
    // Check environment variables
    const envCheck = checkEnvironmentVariables()
    checks.push(envCheck)
    
    // Check memory usage
    const memoryCheck = checkMemoryUsage()
    checks.push(memoryCheck)
    
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
      uptime: process.uptime(),
      checks
    }
    
    const statusCode = overallStatus === 'healthy' ? 200 : 
                      overallStatus === 'degraded' ? 200 : 503
    
    return NextResponse.json(healthStatus, { status: statusCode })
    
  } catch (error) {
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
      uptime: process.uptime(),
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

function checkEnvironmentVariables(): HealthCheck {
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
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
      timestamp: new Date().toISOString()
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
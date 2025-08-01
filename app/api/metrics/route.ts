import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { circuitBreakers } from '@/lib/utils/circuit-breaker'
import * as Sentry from '@sentry/nextjs'
import { env } from '@/lib/env'
import { getMetricsStore, recordCustomMetric } from '@/lib/services/metrics.service'

export async function GET(request: NextRequest) {
  try {
    // Check for authorization (in production, use proper auth)
    const authHeader = request.headers.get('authorization')
    if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${env.METRICS_SECRET || ''}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const supabase = await createClient()
    
    // Get metrics
    const metrics = await getComprehensiveMetrics(supabase)
    
    // Format for Prometheus if requested
    const url = new URL(request.url)
    const format = url.searchParams.get('format')
    if (format === 'prometheus') {
      return new Response(formatPrometheus(metrics), {
        headers: { 'Content-Type': 'text/plain' },
      })
    }
    
    return NextResponse.json(metrics)
    
  } catch (error) {
    Sentry.captureException(error)
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Accept web vitals and custom metrics
    const metrics = await request.json()
    
    // Process web vitals if provided
    if (metrics.type === 'web-vitals') {
      const { name, value } = metrics
      recordCustomMetric(`web_vitals_${name}`, value)
    }
    
    // Process custom metrics
    if (metrics.type === 'custom') {
      const { name, value } = metrics
      recordCustomMetric(name, value)
    }
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    Sentry.captureException(error)
    return NextResponse.json(
      { error: 'Failed to process metrics' },
      { status: 500 }
    )
  }
}

async function getComprehensiveMetrics(supabase: any) {
  try {
    // Get all metrics in parallel
    const [
      userCount,
      courseCount,
      fileCount,
      recentUploads,
      subscriptionMetrics
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('courses').select('*', { count: 'exact', head: true }),
      supabase.from('files').select('*', { count: 'exact', head: true }),
      getRecentActivity(supabase),
      getSubscriptionMetrics(supabase)
    ])
    
    // System metrics
    const memUsage = process.memoryUsage()
    const cpuUsage = process.cpuUsage()
    
    return {
      timestamp: new Date().toISOString(),
      application: {
        version: process.env.npm_package_version || '0.1.0',
        uptime: Math.round((Date.now() - getMetricsStore().startTime) / 1000),
        environment: process.env.NODE_ENV || 'development',
      },
      database: {
        users: userCount.count || 0,
        courses: courseCount.count || 0,
        files: fileCount.count || 0,
        recentUploads: recentUploads || 0,
      },
      subscriptions: subscriptionMetrics,
      system: {
        memory: {
          heapUsedMB: Math.round(memUsage.heapUsed / 1024 / 1024),
          heapTotalMB: Math.round(memUsage.heapTotal / 1024 / 1024),
          rssMB: Math.round(memUsage.rss / 1024 / 1024),
          externalMB: Math.round(memUsage.external / 1024 / 1024),
        },
        cpu: {
          user: Math.round(cpuUsage.user / 1000000),
          system: Math.round(cpuUsage.system / 1000000),
        },
      },
      api: getAPIMetrics(),
      circuitBreakers: getCircuitBreakerMetrics(),
      customMetrics: getCustomMetrics(),
    }
  } catch (error) {
    Sentry.captureException(error)
    throw error
  }
}

async function getRecentActivity(supabase: any): Promise<number> {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  
  const { count } = await supabase
    .from('files')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', yesterday.toISOString())
  
  return count || 0
}

async function getSubscriptionMetrics(supabase: any) {
  try {
    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('tier, status')
    
    const metrics = {
      total: subscriptions?.length || 0,
      byTier: {} as Record<string, number>,
      byStatus: {} as Record<string, number>,
    }
    
    subscriptions?.forEach((sub: any) => {
      metrics.byTier[sub.tier] = (metrics.byTier[sub.tier] || 0) + 1
      metrics.byStatus[sub.status] = (metrics.byStatus[sub.status] || 0) + 1
    })
    
    return metrics
  } catch (error) {
    return { total: 0, byTier: {}, byStatus: {} }
  }
}

function getAPIMetrics() {
  const metricsStore = getMetricsStore();
  let totalRequests = 0
  let totalErrors = 0
  let totalTime = 0
  const endpoints: Record<string, any> = {}
  
  metricsStore.requests.forEach((stats, endpoint) => {
    totalRequests += stats.count
    totalErrors += stats.errors
    totalTime += stats.totalTime
    
    endpoints[endpoint] = {
      requests: stats.count,
      errors: stats.errors,
      avgResponseTime: stats.count > 0 ? Math.round(stats.totalTime / stats.count) : 0,
    }
  })
  
  return {
    totalRequests,
    errorRate: totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0,
    avgResponseTime: totalRequests > 0 ? Math.round(totalTime / totalRequests) : 0,
    endpoints,
  }
}

function getCircuitBreakerMetrics() {
  const metrics: Record<string, any> = {}
  
  Object.entries(circuitBreakers).forEach(([name, breaker]) => {
    metrics[name] = breaker.getMetrics()
  })
  
  return metrics
}

function getCustomMetrics(): Record<string, number> {
  const metricsStore = getMetricsStore();
  const metrics: Record<string, number> = {}
  
  metricsStore.customMetrics.forEach((value, key) => {
    metrics[key] = value
  })
  
  return metrics
}

function formatPrometheus(metrics: any): string {
  const lines: string[] = []
  
  // Application metrics
  lines.push(`# HELP app_info Application information`)
  lines.push(`# TYPE app_info gauge`)
  lines.push(`app_info{version="${metrics.application.version}",environment="${metrics.application.environment}"} 1`)
  
  lines.push(`# HELP app_uptime_seconds Application uptime in seconds`)
  lines.push(`# TYPE app_uptime_seconds counter`)
  lines.push(`app_uptime_seconds ${metrics.application.uptime}`)
  
  // Database metrics
  lines.push(`# HELP db_users_total Total number of users`)
  lines.push(`# TYPE db_users_total gauge`)
  lines.push(`db_users_total ${metrics.database.users}`)
  
  lines.push(`# HELP db_files_total Total number of files`)
  lines.push(`# TYPE db_files_total gauge`)
  lines.push(`db_files_total ${metrics.database.files}`)
  
  // System metrics
  lines.push(`# HELP process_heap_bytes Process heap size in bytes`)
  lines.push(`# TYPE process_heap_bytes gauge`)
  lines.push(`process_heap_bytes{type="used"} ${metrics.system.memory.heapUsedMB * 1024 * 1024}`)
  lines.push(`process_heap_bytes{type="total"} ${metrics.system.memory.heapTotalMB * 1024 * 1024}`)
  
  // API metrics
  lines.push(`# HELP http_requests_total Total number of HTTP requests`)
  lines.push(`# TYPE http_requests_total counter`)
  lines.push(`http_requests_total ${metrics.api.totalRequests}`)
  
  // Circuit breaker metrics
  lines.push(`# HELP circuit_breaker_state Circuit breaker state (0=closed, 1=open, 2=half-open)`)
  lines.push(`# TYPE circuit_breaker_state gauge`)
  Object.entries(metrics.circuitBreakers).forEach(([name, breaker]: [string, any]) => {
    const stateValue = breaker.state === 'CLOSED' ? 0 : breaker.state === 'OPEN' ? 1 : 2
    lines.push(`circuit_breaker_state{service="${name}"} ${stateValue}`)
    lines.push(`circuit_breaker_failures{service="${name}"} ${breaker.failures}`)
  })
  
  return lines.join('\n')
}
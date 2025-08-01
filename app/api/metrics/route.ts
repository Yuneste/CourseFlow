import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication for admin access
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', user.id)
      .single()
    
    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || []
    if (!profile || !adminEmails.includes(profile.email)) {
      return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 })
    }
    
    // Get metrics for admin users only
    const metrics = await getApplicationMetrics(supabase)
    
    return NextResponse.json(metrics)
    
  } catch (error) {
    console.error('Metrics endpoint error:', error)
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
    
    // Log metrics (in production, you might send to monitoring service)
    console.log('Received metrics:', metrics)
    
    // Store in database if needed
    // await storeMetrics(metrics)
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Failed to process metrics:', error)
    return NextResponse.json(
      { error: 'Failed to process metrics' },
      { status: 500 }
    )
  }
}

async function getApplicationMetrics(supabase: any) {
  try {
    // Get user count
    const { count: userCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
    
    // Get course count
    const { count: courseCount } = await supabase
      .from('courses')
      .select('*', { count: 'exact', head: true })
    
    // Get file count
    const { count: fileCount } = await supabase
      .from('files')
      .select('*', { count: 'exact', head: true })
    
    // Get recent activity (files uploaded in last 24 hours)
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    
    const { count: recentUploads } = await supabase
      .from('files')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', yesterday.toISOString())
    
    // System metrics
    const systemMetrics = {
      memory: process.memoryUsage(),
      uptime: process.uptime(),
      nodeVersion: process.version,
      platform: process.platform,
      pid: process.pid
    }
    
    return {
      timestamp: new Date().toISOString(),
      application: {
        users: userCount || 0,
        courses: courseCount || 0,
        files: fileCount || 0,
        recentUploads: recentUploads || 0
      },
      system: systemMetrics
    }
    
  } catch (error) {
    console.error('Failed to fetch application metrics:', error)
    throw error
  }
}
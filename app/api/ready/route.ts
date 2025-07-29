import { NextRequest, NextResponse } from 'next/server'

/**
 * Readiness probe endpoint for Kubernetes/Docker deployments
 * Returns 200 when the application is ready to serve requests
 */
export async function GET(request: NextRequest) {
  try {
    // Check if the application is ready to serve requests
    // This is simpler than health check - just ensures app is running
    
    const readiness = {
      status: 'ready',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '0.1.0'
    }
    
    return NextResponse.json(readiness, { status: 200 })
    
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'not ready', 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }, 
      { status: 503 }
    )
  }
}
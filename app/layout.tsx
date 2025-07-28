import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CourseFlow - Academic File Organization',
  description: 'Organize your academic files with AI-powered categorization',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'CourseFlow',
  },
}

export const viewport = {
  themeColor: '#FA8072',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect to Supabase */}
        <link rel="preconnect" href="https://your-supabase-url.supabase.co" />
        <link rel="dns-prefetch" href="https://your-supabase-url.supabase.co" />
        
        {/* Preload critical fonts */}
        <link
          rel="preload"
          href="/fonts/inter-var-latin.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
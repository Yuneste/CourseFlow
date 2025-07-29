import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { Toaster } from 'sonner'
import { ErrorBoundary } from '@/components/ErrorBoundary'

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
  other: {
    'mobile-web-app-capable': 'yes',
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
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ErrorBoundary>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster 
              theme="light"
              position="top-center"
              richColors
              closeButton
              toastOptions={{
                classNames: {
                  toast: 'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
                  description: 'group-[.toast]:text-muted-foreground',
                  actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
                  cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
                },
              }}
            />
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { Toaster } from 'sonner'
import { GlobalErrorBoundary } from '@/components/error-boundaries/GlobalErrorBoundary'
import { SkipLinks } from '@/components/accessibility/SkipLinks'
import { generateMetadata } from '@/components/seo/metadata'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  ...generateMetadata(),
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
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ECF0C0' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1a1a' },
  ],
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
        <GlobalErrorBoundary>
          <SkipLinks />
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            forcedTheme="light"
            disableTransitionOnChange
          >
            {children}
            <Toaster 
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
        </GlobalErrorBoundary>
      </body>
    </html>
  )
}
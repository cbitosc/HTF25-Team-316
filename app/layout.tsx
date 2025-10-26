import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import { PageTransition } from '@/components/page-transition'
import { AuthProvider } from '@/hooks/use-auth'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'EduDash - Educational Dashboard',
  description: 'Modern educational platform for students and teachers with AI-powered learning assistance',
  keywords: ['education', 'learning', 'assignments', 'teachers', 'students', 'AI assistant'],
  authors: [{ name: 'HTF25-Team-316' }],
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased`}>
        <ThemeProvider>
          <AuthProvider>
            <PageTransition>
              {children}
            </PageTransition>
          </AuthProvider>
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}

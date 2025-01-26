import { Inter } from 'next/font/google'
import './globals.css'
import { cn } from '@/lib/utils'
import SupabaseProvider from '@/components/providers/SupabaseProvider'
import { Suspense } from 'react'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Epic Fantasy Game',
  description: 'A web-based RPG game inspired by Shakes & Fidget',
}

const RootLayout = ({
  children,
}: {
  children: React.ReactNode
}) => {
  return (
    <html lang="en" className="h-full">
      <body className={cn(
        "min-h-full bg-background font-sans antialiased",
        inter.className
      )}>
        <Suspense fallback={
          <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">Loading...</div>
          </div>
        }>
          <SupabaseProvider>
            <main className="relative flex min-h-screen flex-col">
              {children}
            </main>
          </SupabaseProvider>
        </Suspense>
      </body>
    </html>
  )
}

export default RootLayout

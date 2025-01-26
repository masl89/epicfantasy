import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const isAuthRoute = request.nextUrl.pathname.startsWith('/auth')
  const isGameRoute = request.nextUrl.pathname.startsWith('/game')
  const isRootRoute = request.nextUrl.pathname === '/'

  // Redirect unauthenticated users to login
  if (!session && isGameRoute) {
    const redirectUrl = new URL('/auth/login', request.url)
    return NextResponse.redirect(redirectUrl)
  }

  // Redirect authenticated users to game
  if (session && (isAuthRoute || isRootRoute)) {
    const redirectUrl = new URL('/game', request.url)
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

// Specify which routes to run the middleware on
export const config = {
  matcher: [
    '/',
    '/auth/:path*',
    '/game/:path*',
  ]
} 
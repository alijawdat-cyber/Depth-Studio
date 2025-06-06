import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }
  
  // Try to get auth info from multiple sources
  const authToken = request.cookies.get('authToken')?.value
  const firebaseToken = request.cookies.get('__session')?.value
  const hasAnyToken = authToken || firebaseToken
  
  // Protected routes that require authentication
  const protectedPaths = ['/admin', '/photographer', '/brand', '/marketing']
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path))
  
  // Authentication routes
  const authPaths = ['/login', '/register', '/phone-login']
  const isAuthPath = authPaths.includes(pathname)
  
  // Special routes that need special handling
  const specialAuthPaths = ['/role-setup', '/pending-approval']
  const isSpecialAuthPath = specialAuthPaths.includes(pathname)
  
  console.log('🚦 Middleware:', { 
    pathname, 
    hasAuthToken: !!authToken,
    hasFirebaseToken: !!firebaseToken,
    hasAnyToken: !!hasAnyToken,
    isProtectedPath, 
    isAuthPath, 
    isSpecialAuthPath 
  })
  
  // ⭐ تبسيط المنطق - خلي AuthWrapper يتعامل مع كل شي
  // Middleware بس يحمي الصفحات الحساسة جداً
  
  // 1. إذا الصفحة محمية والمستخدم ما عنده أي نوع من التوكن
  if (isProtectedPath && !hasAnyToken) {
    console.log('🔄 Middleware: Redirecting to login - protected path without any token')
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  // 2. باقي التوجيه خلي AuthWrapper يتعامل معه
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 
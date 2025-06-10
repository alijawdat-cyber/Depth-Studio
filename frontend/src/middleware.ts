import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * 🔐 Middleware للحماية والتوجيه - Depth Studio
 * =====================================================
 * 
 * 🎯 الأهداف:
 * - حماية مسارات Dashboard من الوصول غير المصرح
 * - التحقق من وجود tokens المصادقة
 * - توجيه المستخدمين غير المصادقين لصفحة تسجيل الدخول
 * - دعم multiple auth sources (authToken + firebaseToken)
 * 
 * 🛡️ المسارات المحمية:
 * - /dashboard/admin/* : لوحة الأدمن (super_admin فقط)
 * - /dashboard/photographer/* : لوحة المصور (photographer فقط)
 * - /dashboard/brand/* : لوحة البراند (brand_coordinator فقط)
 * - /dashboard/marketing/* : لوحة التسويق (marketing_coordinator فقط)
 * - /profile : الملف الشخصي (جميع المستخدمين المصادقين)
 * 
 * 🔄 تدفق المصادقة:
 * 1. فحص وجود authToken أو __session (Firebase)
 * 2. إذا مسار محمي وبدون token → redirect لـ /auth/login
 * 3. باقي التحقق من الأدوار → AuthWrapper يتعامل معه
 */
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
  
  // ======================================
  // 🛡️ Protected routes - المسارات المحمية
  // ======================================
  
  const protectedPaths = [
    '/dashboard/admin',      // ✅ مؤكد موجود - لوحة الأدمن الشاملة
    '/dashboard/photographer', // ✅ مؤكد موجود - لوحة المصور
    '/dashboard/brand',      // ✅ مؤكد موجود - لوحة البراند
    '/dashboard/marketing',  // ✅ مؤكد موجود - لوحة التسويق
    '/profile'               // ✅ مؤكد موجود - الملف الشخصي
  ];
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path))
  
  // ======================================
  // 🔑 Authentication routes - مسارات المصادقة  
  // ======================================
  
  const authPaths = ['/auth/login', '/auth/register', '/phone']
  const isAuthPath = authPaths.some(path => pathname.startsWith(path))
  
  // ======================================
  // ⚡ Special routes - المسارات الخاصة
  // ======================================
  
  const specialAuthPaths = ['/role-setup', '/pending']
  const isSpecialAuthPath = specialAuthPaths.some(path => pathname.startsWith(path))
  
  console.log('🚦 Middleware:', { 
    pathname, 
    hasAuthToken: !!authToken,
    hasFirebaseToken: !!firebaseToken,
    hasAnyToken: !!hasAnyToken,
    isProtectedPath, 
    isAuthPath, 
    isSpecialAuthPath 
  })
  
  // ======================================
  // 🎯 منطق الحماية الذكي
  // ======================================
  
  // ⭐ تبسيط المنطق - خلي AuthWrapper يتعامل مع كل شي
  // Middleware بس يحمي الصفحات الحساسة جداً
  
  // 1. إذا الصفحة محمية والمستخدم ما عنده أي نوع من التوكن
  if (isProtectedPath && !hasAnyToken) {
    console.log('🔄 Middleware: Redirecting to login - protected path without any token')
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
  
  // 2. باقي التوجيه خلي AuthWrapper يتعامل معه
  // (التحقق من الأدوار، انتهاء صلاحية التوكن، إلخ)
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
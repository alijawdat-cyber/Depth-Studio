'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/store/auth-store'

interface AuthWrapperProps {
  children: React.ReactNode
  requireAuth?: boolean
  allowedRoles?: string[]
  redirectTo?: string
}

export function AuthWrapper({ 
  children, 
  requireAuth = false, 
  allowedRoles = [], 
  redirectTo 
}: AuthWrapperProps) {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    // Wait for loading to complete
    if (isLoading) {
      console.log('⏳ AuthWrapper - Still loading...')
      return
    }

    const currentPath = window.location.pathname
    console.log('🔍 AuthWrapper - Analysis:', {
      currentPath,
      isAuthenticated,
      user: user ? {
        id: user.id,
        email: user.email,
        role: user.primary_role,
        status: user.status
      } : null,
      requireAuth,
      allowedRoles
    })

    // 1. إذا الصفحة تحتاج تسجيل دخول والمستخدم مو مسجل - وجهه للتسجيل
    if (requireAuth && !isAuthenticated) {
      console.log('🔄 Redirecting to login - auth required but not authenticated')
      router.push(redirectTo || '/login')
      return
    }

    // 2. إذا المستخدم مسجل دخول
    if (isAuthenticated && user) {
      const userRole = user.primary_role
      const userStatus = user.status

      console.log('🔍 AuthWrapper - User details:', { userRole, userStatus, currentPath })

      // 2.1 المستخدمين الجدد يروحون لإعداد الدور
      if (userRole === 'new_user' && currentPath !== '/role-setup') {
        console.log('🔄 Redirecting new user to role setup...')
        router.push('/role-setup')
        return
      }

      // 2.2 المستخدمين في انتظار الموافقة يروحون لصفحة الانتظار
      if (userStatus === 'pending_approval' && currentPath !== '/pending-approval') {
        console.log('🔄 Redirecting user to pending approval...')
        router.push('/pending-approval')
        return
      }

      // 2.2 فحص الصلاحيات للصفحات المحمية
      if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
        console.log(`🚫 Access denied for role ${userRole}`)
        
        // وجه للداشبورد المناسب
        const dashboardPath = getDashboardPath(userRole)
        router.push(dashboardPath)
        return
      }

      // 2.4 توجيه المستخدمين المسجلين للداشبورد إذا كانوا في صفحات غير مناسبة
      const publicPages = ['/', '/login', '/register', '/auth']
      const shouldRedirectToDashboard = publicPages.some(page => 
        currentPath === page || currentPath.startsWith(page)
      )

      if (shouldRedirectToDashboard && userRole !== 'new_user' && userStatus !== 'pending_approval') {
        console.log(`🔄 Redirecting ${userRole} to appropriate dashboard`)
        const dashboardPath = getDashboardPath(userRole)
        router.push(dashboardPath)
        return
      }
    }
  }, [isAuthenticated, user, isLoading, requireAuth, allowedRoles, redirectTo, router])

  // Helper function to get dashboard path
  function getDashboardPath(role: string): string {
    switch (role) {
      case 'super_admin':
        return '/admin'
      case 'marketing_coordinator':
        return '/marketing'
      case 'brand_coordinator':
        return '/brand'
      case 'photographer':
        return '/photographer'
      default:
        return '/login'
    }
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  // Show auth required message
  if (requireAuth && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">جاري التوجيه لصفحة تسجيل الدخول...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
} 
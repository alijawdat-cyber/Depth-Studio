'use client'

import { useAuth } from '@/store/auth-store'
import { AuthGuard } from './auth-guard'

type UserRole = 'super_admin' | 'marketing_coordinator' | 'brand_coordinator' | 'photographer' | 'new_user'

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles: UserRole[]
  fallback?: React.ReactNode
}

export function RoleGuard({ children, allowedRoles, fallback }: RoleGuardProps) {
  const { user, isAuthenticated } = useAuth()

  // Must be authenticated first
  if (!isAuthenticated || !user) {
    return <AuthGuard>{children}</AuthGuard>
  }

  const userRole = user.primary_role as UserRole

  // Handle new users
  if (userRole === 'new_user') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">جاري التوجيه لإعداد الدور...</p>
        </div>
      </div>
    )
  }

  // Check role permissions
  if (!allowedRoles.includes(userRole)) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-6 bg-red-50 rounded-lg border border-red-200">
          <div className="text-red-600 text-6xl mb-4">🚫</div>
          <h2 className="text-xl font-semibold text-red-800 mb-2">
            غير مصرح لك بالوصول
          </h2>
          <p className="text-red-600 mb-4">
            ليس لديك الصلاحيات المطلوبة للوصول إلى هذه الصفحة
          </p>
          <div className="text-sm text-gray-600">
            دورك الحالي: <span className="font-medium">{userRole}</span>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

// Convenience components for specific roles
export function SuperAdminGuard({ children }: { children: React.ReactNode }) {
  return <RoleGuard allowedRoles={['super_admin']}>{children}</RoleGuard>
}

export function MarketingGuard({ children }: { children: React.ReactNode }) {
  return <RoleGuard allowedRoles={['super_admin', 'marketing_coordinator']}>{children}</RoleGuard>
}

export function BrandGuard({ children }: { children: React.ReactNode }) {
  return <RoleGuard allowedRoles={['super_admin', 'marketing_coordinator', 'brand_coordinator']}>{children}</RoleGuard>
}

export function PhotographerGuard({ children }: { children: React.ReactNode }) {
  return <RoleGuard allowedRoles={['photographer']}>{children}</RoleGuard>
}

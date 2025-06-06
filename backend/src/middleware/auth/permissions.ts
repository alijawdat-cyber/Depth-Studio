/**
 * Permission Checking - Depth Studio Backend
 * Handles permission verification and role-based access control
 */

import { Response, NextFunction } from 'express'
import type { UserPermissions } from '../../types/types'
import type { AuthenticatedRequest } from './types'

// ======================================
// Permission Checking Functions
// ======================================

/**
 * فحص صلاحية محددة للمستخدم
 */
export const checkUserPermission = (permissions: UserPermissions, permission: string): boolean => {
  // فحص الصلاحيات العامة
  if (permissions.screen_permissions && (permissions.screen_permissions as any)[permission]) {
    return true
  }

  // فحص صلاحيات CRUD
  if (permission.includes('.')) {
    const [resource, action] = permission.split('.')
    if (permissions.crud_permissions && 
        permissions.crud_permissions[resource as keyof typeof permissions.crud_permissions] &&
        (permissions.crud_permissions[resource as keyof typeof permissions.crud_permissions] as any)[action]) {
      return true
    }
  }

  // فحص الصلاحيات المخصصة
  if (permissions.custom_permissions && permissions.custom_permissions[permission]) {
    return permissions.custom_permissions[permission].permission_value
  }

  return false
}

/**
 * فحص إذا كان المستخدم لديه واحد من الأدوار المطلوبة
 */
export const hasRequiredRole = (userRole: string, allowedRoles: string[]): boolean => {
  return allowedRoles.includes(userRole)
}

/**
 * فحص إذا كان المستخدم لديه دور إداري
 */
export const hasAdminRole = (userRole: string): boolean => {
  const adminRoles = ['super_admin', 'marketing_coordinator']
  return adminRoles.includes(userRole)
}

// ======================================
// Permission Middleware Functions
// ======================================

/**
 * Middleware للتحقق من دور محدد
 */
export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'authentication_required',
        message: 'المصادقة مطلوبة',
        timestamp: new Date().toISOString()
      })
      return
    }

    const userRole = req.user.primary_role

    if (!hasRequiredRole(userRole, allowedRoles)) {
      res.status(403).json({
        success: false,
        error: 'insufficient_permissions',
        message: 'ليس لديك صلاحية للوصول إلى هذا المورد',
        timestamp: new Date().toISOString(),
        required_roles: allowedRoles,
        user_role: userRole
      })
      return
    }

    next()
  }
}

/**
 * Middleware للتحقق من صلاحية محددة
 */
export const requirePermission = (permission: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !req.permissions) {
      res.status(401).json({
        success: false,
        error: 'authentication_required',
        message: 'المصادقة مطلوبة',
        timestamp: new Date().toISOString()
      })
      return
    }

    const hasPermission = checkUserPermission(req.permissions, permission)

    if (!hasPermission) {
      res.status(403).json({
        success: false,
        error: 'insufficient_permissions',
        message: `ليس لديك صلاحية: ${permission}`,
        timestamp: new Date().toISOString(),
        required_permission: permission
      })
      return
    }

    next()
  }
}

/**
 * Middleware للتحقق من أن المستخدم هو نفسه أو لديه صلاحية إدارية
 */
export const requireOwnershipOrAdmin = (userIdParam: string = 'id') => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'authentication_required',
        message: 'المصادقة مطلوبة',
        timestamp: new Date().toISOString()
      })
      return
    }

    const requestedUserId = req.params[userIdParam]
    const currentUserId = req.user.id
    const userRole = req.user.primary_role

    // إذا كان المستخدم يحاول الوصول إلى بياناته الخاصة
    if (requestedUserId === currentUserId) {
      next()
      return
    }

    // إذا كان لديه دور إداري
    if (hasAdminRole(userRole)) {
      next()
      return
    }

    res.status(403).json({
      success: false,
      error: 'access_denied',
      message: 'ليس لديك صلاحية للوصول إلى هذه البيانات',
      timestamp: new Date().toISOString()
    })
  }
} 
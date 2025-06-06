/**
 * Authorization Middleware - Depth Studio Backend
 * Handles role-based access control and permissions
 */

import { Response, NextFunction } from 'express'
import type { AuthenticatedRequest } from './auth'
import type { UserRole } from '../types/types'

/**
 * Middleware للتحقق من دور المستخدم (Role-based Access Control)
 */
export const authorize = (allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    // التأكد من وجود بيانات المستخدم (authentication middleware يجب أن يكون قبل هذا)
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'authentication_required',
        message: 'يجب تسجيل الدخول أولاً',
        timestamp: new Date().toISOString()
      })
      return
    }

    const userRole = req.user.primary_role

    // التحقق من وجود الدور في القائمة المسموحة
    if (!allowedRoles.includes(userRole)) {
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
 * Middleware للتحقق من صلاحيات CRUD محددة
 */
export const authorizePermission = (resource: string, action: 'create' | 'read' | 'update' | 'delete') => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !req.permissions) {
      res.status(401).json({
        success: false,
        error: 'authentication_required',
        message: 'المصادقة والصلاحيات مطلوبة',
        timestamp: new Date().toISOString()
      })
      return
    }

    // فحص صلاحيات CRUD
    const crudPermissions = req.permissions.crud_permissions
    if (!crudPermissions || !crudPermissions[resource as keyof typeof crudPermissions]) {
      res.status(403).json({
        success: false,
        error: 'resource_access_denied',
        message: `ليس لديك صلاحية للوصول إلى ${resource}`,
        timestamp: new Date().toISOString(),
        required_permission: `${resource}.${action}`
      })
      return
    }

    const resourcePermissions = crudPermissions[resource as keyof typeof crudPermissions] as any
    if (!resourcePermissions || !resourcePermissions[action]) {
      res.status(403).json({
        success: false,
        error: 'action_not_allowed',
        message: `ليس لديك صلاحية ${action} على ${resource}`,
        timestamp: new Date().toISOString(),
        required_permission: `${resource}.${action}`,
        user_permissions: resourcePermissions
      })
      return
    }

    next()
  }
}

/**
 * Middleware للتحقق من الوصول إلى البراند
 */
export const checkBrandPermission = (brandIdParam: string = 'brandId') => {
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

    const requestedBrandId = req.params[brandIdParam]
    const userRole = req.user.primary_role

    // المديرين لديهم وصول لجميع البراندات
    if (['super_admin', 'marketing_coordinator'].includes(userRole)) {
      next()
      return
    }

    // التحقق من صلاحيات البراند للمنسقين والمصورين
    const brandPermissions = req.permissions.brand_permissions
    const hasBrandAccess = brandPermissions?.some(bp => bp.brand_id === requestedBrandId)

    if (!hasBrandAccess) {
      res.status(403).json({
        success: false,
        error: 'brand_access_denied',
        message: 'ليس لديك صلاحية للوصول إلى هذا البراند',
        timestamp: new Date().toISOString(),
        requested_brand: requestedBrandId,
        user_brands: brandPermissions?.map(bp => bp.brand_id) || []
      })
      return
    }

    next()
  }
}

/**
 * Middleware للمديرين فقط
 */
export const adminOnly = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  authorize(['super_admin', 'marketing_coordinator'])(req, res, next)
}

/**
 * Alternative name for authorize function (for backward compatibility)
 */
export const authorizeRoles = authorize

/**
 * Middleware للسوبر أدمن فقط
 */
export const superAdminOnly = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  authorize(['super_admin'])(req, res, next)
}

/**
 * Middleware للمصورين فقط
 */
export const photographersOnly = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  authorize(['photographer'])(req, res, next)
}

/**
 * Middleware لمنسقي البراندات فقط
 */
export const brandCoordinatorsOnly = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  authorize(['brand_coordinator'])(req, res, next)
}

/**
 * Middleware للتحقق من ملكية المورد أو الصلاحية الإدارية
 */
export const authorizeResourceOwnership = (
  ownerField: string = 'user_id',
  adminRoles: UserRole[] = ['super_admin', 'marketing_coordinator']
) => {
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

    const userId = req.user.id
    const userRole = req.user.primary_role

    // التحقق من الدور الإداري
    if (adminRoles.includes(userRole)) {
      next()
      return
    }

    // التحقق من ملكية المورد (سيتم التحقق في الكونترولر)
    // هنا نضع معلومات إضافية للكونترولر
    req.isOwnershipCheckRequired = true
    req.ownerField = ownerField
    req.currentUserId = userId

    next()
  }
}

/**
 * Helper function للتحقق من صلاحية Screen محددة
 */
export const hasScreenPermission = (req: AuthenticatedRequest, screenName: string): boolean => {
  if (!req.permissions?.screen_permissions) {
    return false
  }

  return (req.permissions.screen_permissions as any)[screenName] === true
}

/**
 * Helper function للتحقق من صلاحية مخصصة
 */
export const hasCustomPermission = (req: AuthenticatedRequest, permissionName: string): boolean => {
  if (!req.permissions?.custom_permissions) {
    return false
  }

  const customPerm = req.permissions.custom_permissions[permissionName]
  return customPerm?.permission_value === true
}

/**
 * Middleware مخصص لفحص صلاحيات Screen
 */
export const requireScreenAccess = (screenName: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!hasScreenPermission(req, screenName)) {
      res.status(403).json({
        success: false,
        error: 'screen_access_denied',
        message: `ليس لديك صلاحية للوصول إلى ${screenName}`,
        timestamp: new Date().toISOString(),
        required_screen: screenName
      })
      return
    }

    next()
  }
}

// إضافة الأنواع للـ Request
declare global {
  namespace Express {
    interface Request {
      isOwnershipCheckRequired?: boolean
      ownerField?: string
      currentUserId?: string
    }
  }
} 
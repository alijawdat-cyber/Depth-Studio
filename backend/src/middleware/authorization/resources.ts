/**
 * Resource Access Control - Depth Studio Backend
 * Handles brand and screen access permissions
 */

import { Response, NextFunction } from 'express'
import type { AuthenticatedRequest } from './types'
import { ADMIN_ROLES } from './types'

// ======================================
// Resource Access Functions
// ======================================

/**
 * فحص إذا كان المستخدم لديه وصول للبراند
 */
export const hasBrandAccess = (req: AuthenticatedRequest, brandId: string): boolean => {
  if (!req.user || !req.permissions) {
    return false
  }

  const userRole = req.user.primary_role

  // المديرين لديهم وصول لجميع البراندات
  if (ADMIN_ROLES.includes(userRole)) {
    return true
  }

  // التحقق من صلاحيات البراند للمنسقين والمصورين
  const brandPermissions = req.permissions.brand_permissions
  return brandPermissions?.some(bp => bp.brand_id === brandId) || false
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

// ======================================
// Brand Access Middleware
// ======================================

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
    
    if (!hasBrandAccess(req, requestedBrandId)) {
      res.status(403).json({
        success: false,
        error: 'brand_access_denied',
        message: 'ليس لديك صلاحية للوصول إلى هذا البراند',
        timestamp: new Date().toISOString(),
        requested_brand: requestedBrandId,
        user_brands: req.permissions.brand_permissions?.map(bp => bp.brand_id) || []
      })
      return
    }

    next()
  }
}

// ======================================
// Screen Access Middleware
// ======================================

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

// ======================================
// Custom Permission Middleware
// ======================================

/**
 * Middleware للتحقق من صلاحية مخصصة
 */
export const requireCustomPermission = (permissionName: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!hasCustomPermission(req, permissionName)) {
      res.status(403).json({
        success: false,
        error: 'custom_permission_denied',
        message: `ليس لديك صلاحية: ${permissionName}`,
        timestamp: new Date().toISOString(),
        required_permission: permissionName
      })
      return
    }

    next()
  }
} 
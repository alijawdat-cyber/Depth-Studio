/**
 * CRUD Permissions - Depth Studio Backend
 * Handles CRUD permission verification and resource ownership
 */

import { Response, NextFunction } from 'express'
import type { AuthenticatedRequest, UserRole, CrudAction } from './types'
import { ADMIN_ROLES } from './types'

// ======================================
// Permission Checking Functions
// ======================================

/**
 * فحص صلاحيات CRUD لمورد محدد
 */
export const hasCrudPermission = (
  req: AuthenticatedRequest, 
  resource: string, 
  action: CrudAction
): boolean => {
  if (!req.permissions?.crud_permissions) {
    return false
  }

  const crudPermissions = req.permissions.crud_permissions
  const resourcePermissions = crudPermissions[resource as keyof typeof crudPermissions] as any
  
  return resourcePermissions && resourcePermissions[action] === true
}

// ======================================
// CRUD Permission Middleware
// ======================================

/**
 * Middleware للتحقق من صلاحيات CRUD محددة
 */
export const authorizePermission = (resource: string, action: CrudAction) => {
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

// ======================================
// Resource Ownership Middleware
// ======================================

/**
 * Middleware للتحقق من ملكية المورد أو الصلاحية الإدارية
 */
export const authorizeResourceOwnership = (
  ownerField: string = 'user_id',
  adminRoles: UserRole[] = ADMIN_ROLES
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
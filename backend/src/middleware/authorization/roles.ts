/**
 * Role-Based Access Control - Depth Studio Backend
 * Handles role-based authorization middleware
 */

import { Response, NextFunction } from 'express'
import type { AuthenticatedRequest, UserRole, CrudAction } from './types'
import { ADMIN_ROLES } from './types'

// ======================================
// Core Role Checking Functions
// ======================================

/**
 * فحص إذا كان المستخدم لديه دور مطلوب
 */
export const hasRole = (userRole: UserRole, allowedRoles: UserRole[]): boolean => {
  return allowedRoles.includes(userRole)
}

/**
 * فحص إذا كان المستخدم لديه دور إداري
 */
export const hasAdminRole = (userRole: UserRole): boolean => {
  return ADMIN_ROLES.includes(userRole)
}

// ======================================
// Role-Based Middleware Functions
// ======================================

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
    if (!hasRole(userRole, allowedRoles)) {
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
 * Alternative name for authorize function (for backward compatibility)
 */
export const authorizeRoles = authorize

// ======================================
// Specific Role Middleware
// ======================================

/**
 * Middleware للمديرين فقط
 */
export const adminOnly = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  authorize(['super_admin', 'marketing_coordinator'])(req, res, next)
}

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
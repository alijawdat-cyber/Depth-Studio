/**
 * Authentication Middleware - Depth Studio Backend
 * Handles JWT token verification and user authentication
 */

import { Request, Response, NextFunction } from 'express'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import type { User, UserPermissions } from '../types/types'

const auth = getAuth()
const db = getFirestore()

// Extend Express Request interface to include user data
export interface AuthenticatedRequest extends Request {
  user?: User
  permissions?: UserPermissions
  firebaseUser?: any
}

/**
 * Middleware للتحقق من صحة JWT Token
 */
export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // استخراج التوكن من Header
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'missing_token',
        message: 'رمز المصادقة مطلوب',
        timestamp: new Date().toISOString()
      })
      return
    }

    // التحقق من صحة التوكن مع Firebase
    const decodedToken = await auth.verifyIdToken(token)
    const uid = decodedToken.uid

    // جلب بيانات المستخدم من Firestore
    const userDoc = await db.collection('users').doc(uid).get()
    
    if (!userDoc.exists) {
      res.status(404).json({
        success: false,
        error: 'user_not_found',
        message: 'المستخدم غير موجود في النظام',
        timestamp: new Date().toISOString()
      })
      return
    }

    const userData = userDoc.data() as User

    // التحقق من حالة المستخدم
    if (!userData.is_active) {
      res.status(403).json({
        success: false,
        error: 'account_inactive',
        message: 'الحساب غير مفعل',
        timestamp: new Date().toISOString()
      })
      return
    }

    // جلب صلاحيات المستخدم
    const permissionsDoc = await db.collection('user_permissions').doc(uid).get()
    const userPermissions = permissionsDoc.exists ? permissionsDoc.data() as UserPermissions : undefined

    // إضافة بيانات المستخدم إلى Request
    req.user = userData
    req.permissions = userPermissions
    req.firebaseUser = decodedToken

    // تحديث آخر نشاط للمستخدم
    await updateLastSeen(uid)

    next()

  } catch (error: any) {
    console.error('Authentication error:', error)

    // معالجة أخطاء Firebase Auth
    if (error.code === 'auth/id-token-expired') {
      res.status(401).json({
        success: false,
        error: 'token_expired',
        message: 'انتهت صلاحية رمز المصادقة',
        timestamp: new Date().toISOString()
      })
      return
    }

    if (error.code === 'auth/id-token-revoked') {
      res.status(401).json({
        success: false,
        error: 'token_revoked',
        message: 'تم إلغاء رمز المصادقة',
        timestamp: new Date().toISOString()
      })
      return
    }

    res.status(401).json({
      success: false,
      error: 'authentication_failed',
      message: 'فشل في التحقق من المصادقة',
      timestamp: new Date().toISOString()
    })
  }
}

/**
 * Middleware للتحقق من صحة المستخدم (اختياري)
 * يسمح بالمرور حتى لو لم يكن هناك توكن
 */
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization
  
  if (!authHeader) {
    next()
    return
  }

  // إذا كان هناك توكن، استخدم authenticateToken
  await authenticateToken(req, res, next)
}

/**
 * تحديث آخر نشاط للمستخدم
 */
async function updateLastSeen(uid: string): Promise<void> {
  try {
    await db.collection('users').doc(uid).update({
      last_seen: new Date(),
      is_online: true,
      updated_at: new Date()
    })
  } catch (error) {
    console.error('Error updating last seen:', error)
    // لا نريد إيقاف العملية إذا فشل التحديث
  }
}

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
 * فحص صلاحية محددة للمستخدم
 */
function checkUserPermission(permissions: UserPermissions, permission: string): boolean {
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
    const adminRoles = ['super_admin', 'marketing_coordinator']
    if (adminRoles.includes(userRole)) {
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
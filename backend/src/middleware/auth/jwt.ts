/**
 * JWT Authentication Handler - Depth Studio Backend
 * Handles JWT token verification and Firebase authentication
 */

import { Response, NextFunction } from 'express'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import type { User, UserPermissions } from '../../types/types'
import type { AuthenticatedRequest, FirebaseTokenData } from './types'
import { updateLastSeen } from './user'

const auth = getAuth()
const db = getFirestore()

// ======================================
// Core JWT Functions
// ======================================

/**
 * استخراج وتحقق من JWT token من request headers
 */
export const extractAndVerifyToken = async (authHeader: string | undefined): Promise<FirebaseTokenData> => {
  if (!authHeader) {
    throw new Error('missing_token')
  }

  const token = authHeader.split(' ')[1] // Bearer TOKEN
  if (!token) {
    throw new Error('missing_token')
  }

  try {
    const decodedToken = await auth.verifyIdToken(token)
    return decodedToken as FirebaseTokenData
  } catch (error: any) {
    if (error.code === 'auth/id-token-expired') {
      throw new Error('token_expired')
    }
    if (error.code === 'auth/id-token-revoked') {
      throw new Error('token_revoked')
    }
    console.error('Token verification error:', error)
    throw new Error('authentication_failed')
  }
}

/**
 * جلب بيانات المستخدم من Firestore باستخدام UID
 */
export const fetchUserData = async (uid: string): Promise<User> => {
  try {
    const userDoc = await db.collection('users').doc(uid).get()
    
    if (!userDoc.exists) {
      throw new Error('user_not_found')
    }

    const userData = userDoc.data() as User

    // التحقق من حالة المستخدم
    if (!userData.is_active) {
      throw new Error('account_inactive')
    }

    return userData
  } catch (error: any) {
    if (error instanceof Error && ['user_not_found', 'account_inactive'].includes(error.message)) {
      throw error
    }
    console.error('User data fetch error:', error)
    throw new Error('authentication_failed')
  }
}

/**
 * جلب صلاحيات المستخدم من Firestore
 */
export const fetchUserPermissions = async (uid: string): Promise<UserPermissions | undefined> => {
  try {
    const permissionsDoc = await db.collection('user_permissions').doc(uid).get()
    return permissionsDoc.exists ? permissionsDoc.data() as UserPermissions : undefined
  } catch (error: any) {
    console.error('Permissions fetch error:', error)
    // نرجع undefined بدلاً من رمي خطأ لأن الصلاحيات قد تكون غير موجودة
    return undefined
  }
}

// ======================================
// Main Authentication Middleware
// ======================================

/**
 * Middleware للتحقق من صحة JWT Token
 */
export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // استخراج والتحقق من التوكن
    const decodedToken = await extractAndVerifyToken(req.headers.authorization)
    const uid = decodedToken.uid

    // جلب بيانات المستخدم والصلاحيات
    const [userData, userPermissions] = await Promise.all([
      fetchUserData(uid),
      fetchUserPermissions(uid)
    ])

    // إضافة بيانات المستخدم إلى Request
    req.user = userData
    req.permissions = userPermissions
    req.firebaseUser = decodedToken

    // تحديث آخر نشاط للمستخدم (غير متزامن)
         updateLastSeen(uid).catch((error: any) => {
       console.error('Failed to update last seen:', error)
     })

    next()

  } catch (error: any) {
    console.error('Authentication error:', error)
    
    const errorMessage = error.message || 'authentication_failed'
    
    const errorResponses = {
      missing_token: {
        status: 401,
        error: 'missing_token',
        message: 'رمز المصادقة مطلوب'
      },
      token_expired: {
        status: 401,
        error: 'token_expired',
        message: 'انتهت صلاحية رمز المصادقة'
      },
      token_revoked: {
        status: 401,
        error: 'token_revoked',
        message: 'تم إلغاء رمز المصادقة'
      },
      user_not_found: {
        status: 404,
        error: 'user_not_found',
        message: 'المستخدم غير موجود في النظام'
      },
      account_inactive: {
        status: 403,
        error: 'account_inactive',
        message: 'الحساب غير مفعل'
      },
      authentication_failed: {
        status: 401,
        error: 'authentication_failed',
        message: 'فشل في التحقق من المصادقة'
      }
    }

    const response = errorResponses[errorMessage as keyof typeof errorResponses] || errorResponses.authentication_failed

    res.status(response.status).json({
      success: false,
      error: response.error,
      message: response.message,
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
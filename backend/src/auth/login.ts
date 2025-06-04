/**
 * Login Functions - Depth Studio Backend
 * Handles user authentication and login operations
 */

import { logger } from 'firebase-functions/v2'
import { onCall, CallableRequest, HttpsError } from 'firebase-functions/v2/https'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'

const db = getFirestore()

/**
 * دالة تحديث معلومات تسجيل الدخول
 */
export const updateLoginInfo = onCall(
  {
    cors: true,
    enforceAppCheck: false
  },
  async (request: CallableRequest<{ uid: string }>) => {
    try {
      const { uid } = request.data

      if (!uid) {
        throw new HttpsError('invalid-argument', 'معرف المستخدم مطلوب')
      }

      // التحقق من وجود المستخدم
      const userDoc = await db.collection('users').doc(uid).get()
      if (!userDoc.exists) {
        throw new HttpsError('not-found', 'المستخدم غير موجود')
      }

      const userData = userDoc.data()
      const currentLoginCount = userData?.total_login_count || 0

      // تحديث معلومات آخر تسجيل دخول
      await db.collection('users').doc(uid).update({
        last_login: FieldValue.serverTimestamp(),
        total_login_count: currentLoginCount + 1,
        is_online: true,
        updated_at: FieldValue.serverTimestamp()
      })

      logger.info(`Login info updated for user: ${uid}`)

      return {
        success: true,
        message: 'تم تحديث معلومات تسجيل الدخول'
      }

    } catch (error: any) {
      logger.error('Update login info error:', error)
      
      if (error instanceof HttpsError) {
        throw error
      }
      
      throw new HttpsError('internal', 'خطأ في تحديث معلومات الدخول')
    }
  }
)

/**
 * دالة تحديث حالة المستخدم عند تسجيل الخروج
 */
export const updateLogoutInfo = onCall(
  {
    cors: true,
    enforceAppCheck: false
  },
  async (request: CallableRequest<{ uid: string }>) => {
    try {
      const { uid } = request.data

      if (!uid) {
        throw new HttpsError('invalid-argument', 'معرف المستخدم مطلوب')
      }

      // تحديث حالة المستخدم إلى غير متصل
      await db.collection('users').doc(uid).update({
        is_online: false,
        last_seen: FieldValue.serverTimestamp(),
        updated_at: FieldValue.serverTimestamp()
      })

      logger.info(`Logout info updated for user: ${uid}`)

      return {
        success: true,
        message: 'تم تحديث معلومات تسجيل الخروج'
      }

    } catch (error: any) {
      logger.error('Update logout info error:', error)
      
      if (error instanceof HttpsError) {
        throw error
      }
      
      throw new HttpsError('internal', 'خطأ في تحديث معلومات الخروج')
    }
  }
)

/**
 * دالة التحقق من حالة المستخدم
 */
export const verifyUserStatus = onCall(
  {
    cors: true,
    enforceAppCheck: false
  },
  async (request: CallableRequest<{ uid: string }>) => {
    try {
      const { uid } = request.data

      if (!uid) {
        throw new HttpsError('invalid-argument', 'معرف المستخدم مطلوب')
      }

      // جلب بيانات المستخدم
      const userDoc = await db.collection('users').doc(uid).get()
      if (!userDoc.exists) {
        throw new HttpsError('not-found', 'المستخدم غير موجود')
      }

      const userData = userDoc.data()

      // التحقق من حالة المستخدم
      if (!userData?.is_active) {
        throw new HttpsError('permission-denied', 'الحساب غير مفعل')
      }

      // جلب صلاحيات المستخدم
      let permissions = null
      const permissionsDoc = await db.collection('user_permissions').doc(uid).get()
      if (permissionsDoc.exists) {
        permissions = permissionsDoc.data()
      }

      return {
        success: true,
        user: userData,
        permissions,
        message: 'تم التحقق من حالة المستخدم بنجاح'
      }

    } catch (error: any) {
      logger.error('Verify user status error:', error)
      
      if (error instanceof HttpsError) {
        throw error
      }
      
      throw new HttpsError('internal', 'خطأ في التحقق من حالة المستخدم')
    }
  }
) 
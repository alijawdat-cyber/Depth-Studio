/**
 * Signup Functions - Depth Studio Backend
 * Handles user registration and profile creation
 */

import { logger } from 'firebase-functions/v2'
import { onCall, CallableRequest, HttpsError } from 'firebase-functions/v2/https'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import type { RegisterData } from '../types/shared'

const db = getFirestore()
const auth = getAuth()

/**
 * دالة تسجيل مستخدم جديد
 */
export const registerUser = onCall(
  { 
    cors: true,
    enforceAppCheck: false 
  },
  async (request: CallableRequest<RegisterData>) => {
    try {
      const { email, password, first_name, last_name, phone, primary_role } = request.data

      // التحقق من صحة البيانات
      if (!email || !password || !first_name || !last_name || !primary_role) {
        throw new HttpsError('invalid-argument', 'البيانات المطلوبة مفقودة')
      }

      // إنشاء مستخدم في Firebase Auth
      const userRecord = await auth.createUser({
        email,
        password,
        displayName: `${first_name} ${last_name}`,
        phoneNumber: phone || undefined
      })

      logger.info(`User created in Auth: ${userRecord.uid}`)

      // إنشاء ملف المستخدم في Firestore
      const newUser: any = {
        id: userRecord.uid,
        email,
        display_name: `${first_name} ${last_name}`,
        first_name,
        last_name,
        phone: phone || undefined,
        primary_role,
        is_active: true,
        is_verified: false,
        firebase_uid: userRecord.uid,
        auth_providers: ['email'],
        total_login_count: 0,
        timezone: 'Asia/Baghdad',
        language: 'ar',
        is_online: false,
        created_at: FieldValue.serverTimestamp(),
        updated_at: FieldValue.serverTimestamp()
      }

      // حفظ في users collection
      await db.collection('users').doc(userRecord.uid).set(newUser)

      logger.info(`User profile created: ${userRecord.uid}`)

      return {
        success: true,
        userId: userRecord.uid,
        message: 'تم إنشاء الحساب بنجاح'
      }

    } catch (error: any) {
      logger.error('Registration error:', error)
      
      if (error instanceof HttpsError) {
        throw error
      }
      
      // معالجة أخطاء Firebase Auth
      if (error.code === 'auth/email-already-exists') {
        throw new HttpsError('already-exists', 'البريد الإلكتروني مستخدم مسبقاً')
      }
      
      if (error.code === 'auth/weak-password') {
        throw new HttpsError('invalid-argument', 'كلمة المرور ضعيفة')
      }
      
      throw new HttpsError('internal', 'خطأ في النظام')
    }
  }
)

/**
 * دالة إنشاء ملف المستخدم بعد تسجيل الدخول بـ Google
 */
export const createUserProfile = onCall(
  {
    cors: true,
    enforceAppCheck: false
  },
  async (request: CallableRequest<{ uid: string, userData: any }>) => {
    try {
      const { uid, userData } = request.data

      if (!uid || !userData) {
        throw new HttpsError('invalid-argument', 'معرف المستخدم أو البيانات مفقودة')
      }

      // التحقق من وجود المستخدم في Auth
      const userRecord = await auth.getUser(uid)
      
      // إنشاء ملف المستخدم
      const userProfile: any = {
        id: uid,
        email: userRecord.email || userData.email,
        display_name: userRecord.displayName || userData.displayName || '',
        first_name: userData.first_name || userRecord.displayName?.split(' ')[0] || '',
        last_name: userData.last_name || userRecord.displayName?.split(' ')[1] || '',
        profile_photo_url: userRecord.photoURL || undefined,
        primary_role: userData.primary_role || 'photographer',
        is_active: true,
        is_verified: userRecord.emailVerified || false,
        firebase_uid: uid,
        auth_providers: userRecord.providerData.map(p => p.providerId.replace('.com', '') as any),
        total_login_count: 1,
        timezone: 'Asia/Baghdad',
        language: 'ar',
        is_online: true,
        created_at: FieldValue.serverTimestamp(),
        updated_at: FieldValue.serverTimestamp()
      }

      // التحقق من عدم وجود الملف مسبقاً
      const existingDoc = await db.collection('users').doc(uid).get()
      if (existingDoc.exists) {
        logger.info(`User profile already exists: ${uid}`)
        return {
          success: true,
          message: 'ملف المستخدم موجود مسبقاً'
        }
      }

      // حفظ الملف
      await db.collection('users').doc(uid).set(userProfile)

      logger.info(`User profile created from OAuth: ${uid}`)

      return {
        success: true,
        message: 'تم إنشاء ملف المستخدم بنجاح'
      }

    } catch (error: any) {
      logger.error('Create profile error:', error)
      
      if (error instanceof HttpsError) {
        throw error
      }
      
      throw new HttpsError('internal', 'خطأ في إنشاء ملف المستخدم')
    }
  }
) 
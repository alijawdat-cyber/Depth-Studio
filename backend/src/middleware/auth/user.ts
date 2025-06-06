/**
 * User Operations - Depth Studio Backend
 * Handles user-related operations and updates
 */

import { getFirestore } from 'firebase-admin/firestore'

const db = getFirestore()

// ======================================
// User Activity Updates
// ======================================

/**
 * تحديث آخر نشاط للمستخدم
 */
export const updateLastSeen = async (uid: string): Promise<void> => {
  try {
    await db.collection('users').doc(uid).update({
      last_seen: new Date(),
      is_online: true,
      updated_at: new Date()
    })
  } catch (error) {
    console.error('Error updating last seen:', error)
    // لا نريد إيقاف العملية إذا فشل التحديث
    throw error
  }
}

/**
 * تحديث حالة المستخدم إلى offline
 */
export const updateUserOffline = async (uid: string): Promise<void> => {
  try {
    await db.collection('users').doc(uid).update({
      is_online: false,
      updated_at: new Date()
    })
  } catch (error) {
    console.error('Error updating user offline status:', error)
    throw error
  }
}

/**
 * تحديث معلومات تسجيل الدخول
 */
export const updateLoginInfo = async (uid: string, loginData?: any): Promise<void> => {
  try {
    const updateData: any = {
      last_login: new Date(),
      is_online: true,
      updated_at: new Date()
    }

    if (loginData) {
      if (loginData.device) updateData.last_device = loginData.device
      if (loginData.ip) updateData.last_ip = loginData.ip
      if (loginData.userAgent) updateData.last_user_agent = loginData.userAgent
    }

    await db.collection('users').doc(uid).update(updateData)
  } catch (error) {
    console.error('Error updating login info:', error)
    throw error
  }
}

// ======================================
// User Data Queries
// ======================================

/**
 * فحص إذا كان المستخدم موجود ونشط
 */
export const checkUserExists = async (uid: string): Promise<boolean> => {
  try {
    const userDoc = await db.collection('users').doc(uid).get()
    if (!userDoc.exists) return false
    
    const userData = userDoc.data()
    return userData?.is_active === true
  } catch (error) {
    console.error('Error checking user existence:', error)
    return false
  }
}

/**
 * جلب معلومات المستخدم الأساسية
 */
export const getUserBasicInfo = async (uid: string) => {
  try {
    const userDoc = await db.collection('users').doc(uid).get()
    if (!userDoc.exists) return null
    
    const userData = userDoc.data()
    return {
      id: userData?.id,
      email: userData?.email,
      name: userData?.name,
      primary_role: userData?.primary_role,
      is_active: userData?.is_active,
      is_online: userData?.is_online,
      last_seen: userData?.last_seen
    }
  } catch (error) {
    console.error('Error getting user basic info:', error)
    return null
  }
} 
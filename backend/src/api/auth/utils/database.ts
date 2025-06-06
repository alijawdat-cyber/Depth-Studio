/**
 * Auth Database Operations - Depth Studio Backend
 * Handles database operations for authentication
 */

import { db } from '../../../config/firebase'
import { FieldValue } from 'firebase-admin/firestore'

// ======================================
// Type Definitions
// ======================================

interface UserData {
  uid: string
  display_name?: string
  email?: string
  phone_number?: string
  primary_role?: string
  is_active?: boolean
  last_login?: any
  total_login_count?: number
  is_online?: boolean
  created_at?: any
  updated_at?: any
}

interface UserPermissions {
  uid: string
  screen_permissions?: any
  crud_permissions?: any
  brand_permissions?: any
  special_permissions?: any
  last_updated_by?: string
  updated_at?: any
  changelog?: any[]
}

// ======================================
// User Data Operations
// ======================================

/**
 * Update user login information
 */
export const updateLoginInfo = async (uid: string) => {
  try {
    if (!uid) {
      throw new Error('معرف المستخدم مطلوب')
    }

    // التحقق من وجود المستخدم
    const userDoc = await db.collection('users').doc(uid).get()
    if (!userDoc.exists) {
      throw new Error('المستخدم غير موجود')
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

    console.log(`Login info updated for user: ${uid}`)

    return {
      uid,
      last_login: new Date().toISOString(),
      total_login_count: currentLoginCount + 1,
      is_online: true
    }

  } catch (error) {
    console.error('Update login info error:', error)
    throw error
  }
}

/**
 * Update user logout information
 */
export const updateLogoutInfo = async (uid: string) => {
  try {
    if (!uid) {
      throw new Error('معرف المستخدم مطلوب')
    }

    // تحديث حالة المستخدم إلى غير متصل
    await db.collection('users').doc(uid).update({
      is_online: false,
      last_seen: FieldValue.serverTimestamp(),
      updated_at: FieldValue.serverTimestamp()
    })

    console.log(`Logout info updated for user: ${uid}`)

    return {
      uid,
      is_online: false,
      last_seen: new Date().toISOString()
    }

  } catch (error) {
    console.error('Update logout info error:', error)
    throw error
  }
}

/**
 * Verify user status and get user data
 */
export const verifyUserStatus = async (uid: string) => {
  try {
    if (!uid) {
      throw new Error('معرف المستخدم مطلوب')
    }

    // جلب بيانات المستخدم
    const userDoc = await db.collection('users').doc(uid).get()
    if (!userDoc.exists) {
      throw new Error('المستخدم غير موجود')
    }

    const userData = userDoc.data()

    // التحقق من حالة المستخدم
    if (!userData?.is_active) {
      throw new Error('الحساب غير مفعل')
    }

    // جلب صلاحيات المستخدم
    let permissions = null
    const permissionsDoc = await db.collection('user_permissions').doc(uid).get()
    if (permissionsDoc.exists) {
      permissions = permissionsDoc.data()
    }

    return {
      user: userData,
      permissions,
      verified: true
    }

  } catch (error) {
    console.error('Verify user status error:', error)
    throw error
  }
}

// ======================================
// User Permissions Database Operations
// ======================================

/**
 * Get user permissions from database
 */
export const fetchUserPermissions = async (uid: string) => {
  try {
    if (!uid) {
      throw new Error('معرف المستخدم مطلوب')
    }

    const permissionsDoc = await db.collection('user_permissions').doc(uid).get()
    
    if (!permissionsDoc.exists) {
      return null
    }

    return permissionsDoc.data()

  } catch (error) {
    console.error('Fetch user permissions error:', error)
    throw error
  }
}

/**
 * Save user permissions to database
 */
export const saveUserPermissions = async (uid: string, permissions: any, updatedBy: string) => {
  try {
    if (!uid || !permissions || !updatedBy) {
      throw new Error('البيانات المطلوبة مفقودة')
    }

    // التحقق من وجود المستخدم
    const userDoc = await db.collection('users').doc(uid).get()
    if (!userDoc.exists) {
      throw new Error('المستخدم غير موجود')
    }

    // تحديث الصلاحيات
    const updateData = {
      ...permissions,
      last_updated_by: updatedBy,
      updated_at: FieldValue.serverTimestamp(),
      changelog: FieldValue.arrayUnion({
        action: 'permissions_updated',
        updated_by: updatedBy,
        timestamp: FieldValue.serverTimestamp(),
        changes: permissions
      })
    }

    await db.collection('user_permissions').doc(uid).update(updateData)

    console.log(`Permissions updated for user: ${uid} by ${updatedBy}`)

    return {
      uid,
      updated: true,
      updated_by: updatedBy,
      timestamp: new Date().toISOString()
    }

  } catch (error) {
    console.error('Save user permissions error:', error)
    throw error
  }
}

/**
 * Create default permissions in database
 */
export const createDefaultPermissions = async (uid: string, role: string, screenPermissions: any, crudPermissions: any) => {
  try {
    const defaultPermissions = {
      uid,
      screen_permissions: screenPermissions,
      crud_permissions: crudPermissions,
      brand_permissions: {},
      special_permissions: {},
      created_at: FieldValue.serverTimestamp(),
      updated_at: FieldValue.serverTimestamp()
    }

    await db.collection('user_permissions').doc(uid).set(defaultPermissions)
    console.log(`Default permissions created for user: ${uid} with role: ${role}`)

    return defaultPermissions

  } catch (error) {
    console.error('Create default permissions error:', error)
    throw error
  }
} 
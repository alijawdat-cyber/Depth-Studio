import { db } from '../../config/firebase'
import { FieldValue } from 'firebase-admin/firestore'

// ======================================
// Auth Utilities
// ======================================

// Type definitions
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
// Login/Logout Functions
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
// Permission Functions
// ======================================

/**
 * Get user permissions
 */
export const getUserPermissions = async (uid: string) => {
  try {
    if (!uid) {
      throw new Error('معرف المستخدم مطلوب')
    }

    // جلب صلاحيات المستخدم
    const permissionsDoc = await db.collection('user_permissions').doc(uid).get()
    
    if (!permissionsDoc.exists) {
      // إنشاء صلاحيات افتراضية إذا لم تكن موجودة
      const userDoc = await db.collection('users').doc(uid).get()
      if (!userDoc.exists) {
        throw new Error('المستخدم غير موجود')
      }

      const userData = userDoc.data()
      const role = userData?.primary_role

      await createDefaultPermissions(uid, role)
      const newPermissionsDoc = await db.collection('user_permissions').doc(uid).get()
      
      return {
        permissions: newPermissionsDoc.data(),
        created: true
      }
    }

    return {
      permissions: permissionsDoc.data(),
      created: false
    }

  } catch (error) {
    console.error('Get user permissions error:', error)
    throw error
  }
}

/**
 * Update user permissions
 */
export const updateUserPermissions = async (uid: string, permissions: any, updatedBy: string) => {
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
    console.error('Update user permissions error:', error)
    throw error
  }
}

/**
 * Check specific permission
 */
export const checkPermission = async (uid: string, permission: string, context?: any) => {
  try {
    if (!uid || !permission) {
      throw new Error('معرف المستخدم والصلاحية مطلوبان')
    }

    // جلب صلاحيات المستخدم
    const permissionsDoc = await db.collection('user_permissions').doc(uid).get()
    
    if (!permissionsDoc.exists) {
      return {
        hasPermission: false,
        reason: 'الصلاحيات غير موجودة'
      }
    }

    const userPermissions = permissionsDoc.data()
    const hasPermission = evaluatePermission(userPermissions, permission, context)

    return {
      hasPermission,
      permission,
      context,
      reason: hasPermission ? 'المستخدم لديه الصلاحية' : 'المستخدم ليس لديه الصلاحية'
    }

  } catch (error) {
    console.error('Check permission error:', error)
    throw error
  }
}

// ======================================
// Helper Functions
// ======================================

/**
 * Create default permissions for user
 */
async function createDefaultPermissions(uid: string, role: string) {
  try {
    const defaultPermissions = {
      uid,
      screen_permissions: getDefaultScreenPermissions(role),
      crud_permissions: getDefaultCrudPermissions(role),
      brand_permissions: {},
      special_permissions: {},
      created_at: FieldValue.serverTimestamp(),
      updated_at: FieldValue.serverTimestamp()
    }

    await db.collection('user_permissions').doc(uid).set(defaultPermissions)
    console.log(`Default permissions created for user: ${uid} with role: ${role}`)

  } catch (error) {
    console.error('Create default permissions error:', error)
    throw error
  }
}

/**
 * Get default screen permissions based on role
 */
function getDefaultScreenPermissions(role: string): any {
  const basePermissions = {
    profile: true,
    dashboard: true,
    notifications: true
  }

  switch (role) {
    case 'super_admin':
      return {
        ...basePermissions,
        users: true,
        campaigns: true,
        tasks: true,
        brands: true,
        reports: true,
        settings: true
      }
    case 'marketing_coordinator':
      return {
        ...basePermissions,
        campaigns: true,
        tasks: true,
        brands: true,
        reports: true
      }
    case 'brand_coordinator':
      return {
        ...basePermissions,
        tasks: true,
        campaigns: false,
        reports: false
      }
    case 'photographer':
      return {
        ...basePermissions,
        tasks: true,
        uploads: true
      }
    default:
      return basePermissions
  }
}

/**
 * Get default CRUD permissions based on role
 */
function getDefaultCrudPermissions(role: string): any {
  switch (role) {
    case 'super_admin':
      return {
        users: { create: true, read: true, update: true, delete: true },
        campaigns: { create: true, read: true, update: true, delete: true },
        tasks: { create: true, read: true, update: true, delete: true },
        brands: { create: true, read: true, update: true, delete: true }
      }
    case 'marketing_coordinator':
      return {
        campaigns: { create: true, read: true, update: true, delete: false },
        tasks: { create: true, read: true, update: true, delete: false },
        brands: { create: false, read: true, update: false, delete: false }
      }
    case 'brand_coordinator':
      return {
        tasks: { create: true, read: true, update: true, delete: false }
      }
    case 'photographer':
      return {
        tasks: { create: false, read: true, update: true, delete: false }
      }
    default:
      return {}
  }
}

/**
 * Evaluate if user has specific permission
 */
function evaluatePermission(userPermissions: any, permission: string, context?: any): boolean {
  try {
    // Split permission path (e.g., "campaigns.create", "tasks.read")
    const permissionParts = permission.split('.')
    
    if (permissionParts.length === 1) {
      // Screen permission
      return userPermissions.screen_permissions?.[permission] === true
    }
    
    if (permissionParts.length === 2) {
      // CRUD permission
      const [resource, action] = permissionParts
      return userPermissions.crud_permissions?.[resource]?.[action] === true
    }
    
    // Complex permission with context
    // TODO: Implement more complex permission evaluation
    
    return false
    
  } catch (error) {
    console.error('Evaluate permission error:', error)
    return false
  }
} 
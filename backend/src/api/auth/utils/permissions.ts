/**
 * Permission Logic - Depth Studio Backend
 * Handles permission evaluation and default permission creation
 */

import { fetchUserPermissions, createDefaultPermissions } from './database'

// ======================================
// Permission Evaluation
// ======================================

/**
 * Check specific permission
 */
export const checkPermission = async (uid: string, permission: string, context?: any) => {
  try {
    if (!uid || !permission) {
      throw new Error('معرف المستخدم والصلاحية مطلوبان')
    }

    // جلب صلاحيات المستخدم
    const userPermissions = await fetchUserPermissions(uid)
    
    if (!userPermissions) {
      return {
        hasPermission: false,
        reason: 'الصلاحيات غير موجودة'
      }
    }

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

/**
 * Evaluate if user has specific permission
 */
export const evaluatePermission = (userPermissions: any, permission: string, context?: any): boolean => {
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

// ======================================
// Default Permissions
// ======================================

/**
 * Get user permissions (create if not exists)
 */
export const getUserPermissions = async (uid: string) => {
  try {
    if (!uid) {
      throw new Error('معرف المستخدم مطلوب')
    }

    // جلب صلاحيات المستخدم
    const permissions = await fetchUserPermissions(uid)
    
    if (!permissions) {
      // إنشاء صلاحيات افتراضية إذا لم تكن موجودة
      const { db } = await import('../../../config/firebase')
      const userDoc = await db.collection('users').doc(uid).get()
      
      if (!userDoc.exists) {
        throw new Error('المستخدم غير موجود')
      }

      const userData = userDoc.data()
      const role = userData?.primary_role

      const screenPermissions = getDefaultScreenPermissions(role)
      const crudPermissions = getDefaultCrudPermissions(role)
      
      const newPermissions = await createDefaultPermissions(uid, role, screenPermissions, crudPermissions)
      
      return {
        permissions: newPermissions,
        created: true
      }
    }

    return {
      permissions,
      created: false
    }

  } catch (error) {
    console.error('Get user permissions error:', error)
    throw error
  }
}

/**
 * Get default screen permissions based on role
 */
export const getDefaultScreenPermissions = (role: string): any => {
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
export const getDefaultCrudPermissions = (role: string): any => {
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
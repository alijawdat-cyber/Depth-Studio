/**
 * Auth Validation - Depth Studio Backend
 * Handles validation and user permission updates
 */

import { saveUserPermissions } from './database'

// ======================================
// Validation Functions
// ======================================

/**
 * Validate user ID format
 */
export const validateUserId = (uid: string): boolean => {
  if (!uid || typeof uid !== 'string') {
    return false
  }
  
  // Firebase UID validation (basic)
  return uid.length >= 10 && uid.length <= 128
}

/**
 * Validate permission structure
 */
export const validatePermissionStructure = (permissions: any): boolean => {
  if (!permissions || typeof permissions !== 'object') {
    return false
  }

  // Check required fields
  const requiredFields = ['screen_permissions', 'crud_permissions']
  for (const field of requiredFields) {
    if (!(field in permissions)) {
      return false
    }
  }

  return true
}

/**
 * Validate role format
 */
export const validateRole = (role: string): boolean => {
  const validRoles = ['super_admin', 'marketing_coordinator', 'brand_coordinator', 'photographer']
  return validRoles.includes(role)
}

/**
 * Validate permission name format
 */
export const validatePermissionName = (permission: string): boolean => {
  if (!permission || typeof permission !== 'string') {
    return false
  }

  // Basic permission format validation
  const permissionRegex = /^[a-zA-Z_][a-zA-Z0-9_.]*$/
  return permissionRegex.test(permission)
}

// ======================================
// User Permission Management
// ======================================

/**
 * Update user permissions with validation
 */
export const updateUserPermissions = async (uid: string, permissions: any, updatedBy: string) => {
  try {
    // Validate inputs
    if (!validateUserId(uid)) {
      throw new Error('معرف المستخدم غير صحيح')
    }

    if (!validatePermissionStructure(permissions)) {
      throw new Error('بنية الصلاحيات غير صحيحة')
    }

    if (!validateUserId(updatedBy)) {
      throw new Error('معرف المحدث غير صحيح')
    }

    // Save to database
    const result = await saveUserPermissions(uid, permissions, updatedBy)

    return result

  } catch (error) {
    console.error('Update user permissions validation error:', error)
    throw error
  }
}

/**
 * Sanitize permission data before saving
 */
export const sanitizePermissions = (permissions: any): any => {
  const sanitized = { ...permissions }

  // Remove any undefined or null values
  Object.keys(sanitized).forEach(key => {
    if (sanitized[key] === undefined || sanitized[key] === null) {
      delete sanitized[key]
    }
  })

  // Ensure required structure
  if (!sanitized.screen_permissions) {
    sanitized.screen_permissions = {}
  }

  if (!sanitized.crud_permissions) {
    sanitized.crud_permissions = {}
  }

  if (!sanitized.brand_permissions) {
    sanitized.brand_permissions = {}
  }

  if (!sanitized.special_permissions) {
    sanitized.special_permissions = {}
  }

  return sanitized
}

// ======================================
// Permission Comparison
// ======================================

/**
 * Compare two permission objects to find differences
 */
export const comparePermissions = (oldPermissions: any, newPermissions: any): any => {
  const changes: any = {
    added: {},
    removed: {},
    modified: {}
  }

  // Compare screen permissions
  if (oldPermissions.screen_permissions || newPermissions.screen_permissions) {
    const oldScreen = oldPermissions.screen_permissions || {}
    const newScreen = newPermissions.screen_permissions || {}

    for (const key in newScreen) {
      if (!(key in oldScreen)) {
        changes.added[`screen_permissions.${key}`] = newScreen[key]
      } else if (oldScreen[key] !== newScreen[key]) {
        changes.modified[`screen_permissions.${key}`] = {
          old: oldScreen[key],
          new: newScreen[key]
        }
      }
    }

    for (const key in oldScreen) {
      if (!(key in newScreen)) {
        changes.removed[`screen_permissions.${key}`] = oldScreen[key]
      }
    }
  }

  // Compare CRUD permissions
  if (oldPermissions.crud_permissions || newPermissions.crud_permissions) {
    const oldCrud = oldPermissions.crud_permissions || {}
    const newCrud = newPermissions.crud_permissions || {}

    for (const resource in newCrud) {
      if (!(resource in oldCrud)) {
        changes.added[`crud_permissions.${resource}`] = newCrud[resource]
      } else {
        for (const action in newCrud[resource]) {
          const oldValue = oldCrud[resource]?.[action]
          const newValue = newCrud[resource][action]
          
          if (oldValue !== newValue) {
            changes.modified[`crud_permissions.${resource}.${action}`] = {
              old: oldValue,
              new: newValue
            }
          }
        }
      }
    }
  }

  return changes
} 
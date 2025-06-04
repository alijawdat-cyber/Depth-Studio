/**
 * Permissions Functions - Depth Studio Backend
 * Handles user permissions and authorization
 */

import { logger } from 'firebase-functions/v2'
import { onCall, CallableRequest, HttpsError } from 'firebase-functions/v2/https'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import type { UserRole } from '../types/shared'

const db = getFirestore()

/**
 * دالة جلب صلاحيات المستخدم
 */
export const getUserPermissions = onCall(
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

      // جلب صلاحيات المستخدم
      const permissionsDoc = await db.collection('user_permissions').doc(uid).get()
      
      if (!permissionsDoc.exists) {
        // إنشاء صلاحيات افتراضية إذا لم تكن موجودة
        const userDoc = await db.collection('users').doc(uid).get()
        if (!userDoc.exists) {
          throw new HttpsError('not-found', 'المستخدم غير موجود')
        }

        const userData = userDoc.data()
        const role = userData?.primary_role as UserRole

        await createDefaultPermissions(uid, role)
        const newPermissionsDoc = await db.collection('user_permissions').doc(uid).get()
        
        return {
          success: true,
          permissions: newPermissionsDoc.data(),
          message: 'تم إنشاء صلاحيات افتراضية'
        }
      }

      return {
        success: true,
        permissions: permissionsDoc.data(),
        message: 'تم جلب الصلاحيات بنجاح'
      }

    } catch (error: any) {
      logger.error('Get user permissions error:', error)
      
      if (error instanceof HttpsError) {
        throw error
      }
      
      throw new HttpsError('internal', 'خطأ في جلب الصلاحيات')
    }
  }
)

/**
 * دالة تحديث صلاحيات المستخدم
 */
export const updateUserPermissions = onCall(
  {
    cors: true,
    enforceAppCheck: false
  },
  async (request: CallableRequest<{ 
    uid: string, 
    permissions: any,
    updatedBy: string 
  }>) => {
    try {
      const { uid, permissions, updatedBy } = request.data

      if (!uid || !permissions || !updatedBy) {
        throw new HttpsError('invalid-argument', 'البيانات المطلوبة مفقودة')
      }

      // التحقق من وجود المستخدم
      const userDoc = await db.collection('users').doc(uid).get()
      if (!userDoc.exists) {
        throw new HttpsError('not-found', 'المستخدم غير موجود')
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

      logger.info(`Permissions updated for user: ${uid} by ${updatedBy}`)

      return {
        success: true,
        message: 'تم تحديث الصلاحيات بنجاح'
      }

    } catch (error: any) {
      logger.error('Update user permissions error:', error)
      
      if (error instanceof HttpsError) {
        throw error
      }
      
      throw new HttpsError('internal', 'خطأ في تحديث الصلاحيات')
    }
  }
)

/**
 * دالة التحقق من صلاحية محددة
 */
export const checkPermission = onCall(
  {
    cors: true,
    enforceAppCheck: false
  },
  async (request: CallableRequest<{ 
    uid: string, 
    permission: string,
    context?: any 
  }>) => {
    try {
      const { uid, permission, context } = request.data

      if (!uid || !permission) {
        throw new HttpsError('invalid-argument', 'معرف المستخدم والصلاحية مطلوبان')
      }

      // جلب صلاحيات المستخدم
      const permissionsDoc = await db.collection('user_permissions').doc(uid).get()
      
      if (!permissionsDoc.exists) {
        return {
          success: true,
          hasPermission: false,
          message: 'الصلاحيات غير موجودة'
        }
      }

      const userPermissions = permissionsDoc.data()
      const hasPermission = evaluatePermission(userPermissions, permission, context)

      return {
        success: true,
        hasPermission,
        message: hasPermission ? 'المستخدم لديه الصلاحية' : 'المستخدم ليس لديه الصلاحية'
      }

    } catch (error: any) {
      logger.error('Check permission error:', error)
      
      if (error instanceof HttpsError) {
        throw error
      }
      
      throw new HttpsError('internal', 'خطأ في التحقق من الصلاحية')
    }
  }
)

/**
 * دالة إضافة صلاحية براند للمستخدم
 */
export const addBrandPermission = onCall(
  {
    cors: true,
    enforceAppCheck: false
  },
  async (request: CallableRequest<{ 
    uid: string, 
    brandId: string,
    accessLevel: string,
    grantedBy: string 
  }>) => {
    try {
      const { uid, brandId, accessLevel, grantedBy } = request.data

      if (!uid || !brandId || !accessLevel || !grantedBy) {
        throw new HttpsError('invalid-argument', 'البيانات المطلوبة مفقودة')
      }

      // جلب صلاحيات المستخدم الحالية
      const permissionsDoc = await db.collection('user_permissions').doc(uid).get()
      
      if (!permissionsDoc.exists) {
        throw new HttpsError('not-found', 'صلاحيات المستخدم غير موجودة')
      }

      const userPermissions = permissionsDoc.data()
      const existingBrandPermissions = userPermissions?.brand_permissions || []

      const newBrandPermission = {
        brand_id: brandId,
        access_level: accessLevel,
        can_approve_content: accessLevel === 'full' || accessLevel === 'manager',
        can_edit_tasks: accessLevel === 'full' || accessLevel === 'manager',
        can_view_financials: accessLevel === 'full',
        can_assign_photographers: accessLevel === 'full' || accessLevel === 'manager',
        granted_by: grantedBy,
        granted_at: FieldValue.serverTimestamp()
      }

      const updatedBrandPermissions = [...existingBrandPermissions.filter((bp: any) => bp.brand_id !== brandId), newBrandPermission]

      await db.collection('user_permissions').doc(uid).update({
        brand_permissions: updatedBrandPermissions,
        updated_at: FieldValue.serverTimestamp(),
        last_updated_by: grantedBy,
        changelog: FieldValue.arrayUnion({
          action: 'brand_permission_added',
          brand_id: brandId,
          access_level: accessLevel,
          granted_by: grantedBy,
          timestamp: FieldValue.serverTimestamp()
        })
      })

      logger.info(`Brand permission added for user: ${uid}, brand: ${brandId}`)

      return {
        success: true,
        message: 'تم إضافة صلاحية البراند بنجاح'
      }

    } catch (error: any) {
      logger.error('Add brand permission error:', error)
      
      if (error instanceof HttpsError) {
        throw error
      }
      
      throw new HttpsError('internal', 'خطأ في إضافة صلاحية البراند')
    }
  }
)

// ======================================
// Helper Functions
// ======================================

async function createDefaultPermissions(uid: string, role: UserRole) {
  const defaultPermissions: any = {
    id: uid,
    user_id: uid,
    roles: [{
      role_type: role,
      is_primary: true,
      granted_at: FieldValue.serverTimestamp(),
      granted_by: 'system'
    }],
    screen_permissions: getDefaultScreenPermissions(role),
    crud_permissions: getDefaultCrudPermissions(role),
    brand_permissions: [],
    custom_permissions: {},
    is_active: true,
    last_updated_by: 'system',
    created_at: FieldValue.serverTimestamp(),
    updated_at: FieldValue.serverTimestamp(),
    changelog: []
  }

  await db.collection('user_permissions').doc(uid).set(defaultPermissions)
}

function getDefaultScreenPermissions(role: UserRole): any {
  const permissions = {
    dashboard: true,
    users_management: false,
    brands_management: false,
    campaigns_management: false,
    content_review: false,
    financial_reports: false,
    analytics: false,
    settings: false
  }

  switch (role) {
    case 'super_admin':
      return {
        dashboard: true,
        users_management: true,
        brands_management: true,
        campaigns_management: true,
        content_review: true,
        financial_reports: true,
        analytics: true,
        settings: true
      }
    case 'marketing_coordinator':
      return {
        ...permissions,
        campaigns_management: true,
        content_review: true,
        analytics: true
      }
    case 'brand_coordinator':
      return {
        ...permissions,
        content_review: true
      }
    case 'photographer':
    default:
      return permissions
  }
}

function getDefaultCrudPermissions(role: UserRole): any {
  const basicCrud = { create: false, read: true, update: false, delete: false }
  
  return {
    users: basicCrud,
    brands: basicCrud,
    campaigns: basicCrud,
    tasks: role === 'photographer' ? { ...basicCrud, update: true } : basicCrud,
    content: role === 'photographer' ? { create: true, read: true, update: true, delete: false } : basicCrud,
    payments: { ...basicCrud, read: role === 'photographer' },
    reports: basicCrud
  }
}

function evaluatePermission(userPermissions: any, permission: string, context?: any): boolean {
  // التحقق من أن الصلاحيات مفعلة
  if (!userPermissions?.is_active) {
    return false
  }

  // التحقق من صلاحيات الشاشة
  if (userPermissions.screen_permissions?.[permission]) {
    return true
  }

  // التحقق من صلاحيات CRUD
  if (permission.includes('.') && userPermissions.crud_permissions) {
    const [resource, action] = permission.split('.')
    return userPermissions.crud_permissions[resource]?.[action] || false
  }

  // التحقق من صلاحيات البراند
  if (context?.brandId && userPermissions.brand_permissions) {
    const brandPermission = userPermissions.brand_permissions.find(
      (bp: any) => bp.brand_id === context.brandId
    )
    return brandPermission?.access_level === 'full' || brandPermission?.access_level === 'manager'
  }

  // التحقق من الصلاحيات المخصصة
  if (userPermissions.custom_permissions?.[permission]) {
    return true
  }

  return false
} 
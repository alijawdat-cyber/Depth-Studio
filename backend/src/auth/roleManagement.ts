/**
 * Role Management Functions - Depth Studio Backend
 * Handles user roles, approvals, and permissions
 */

import { logger } from 'firebase-functions/v2'
import { onCall, CallableRequest, HttpsError } from 'firebase-functions/v2/https'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import type { UserRole } from '../types/shared'

const db = getFirestore()

/**
 * دالة تحديث دور المستخدم
 */
export const updateUserRole = onCall(
  {
    cors: true,
    enforceAppCheck: false
  },
  async (request: CallableRequest<{ uid: string, role: UserRole, roleData?: any }>) => {
    try {
      const { uid, role, roleData } = request.data

      if (!uid || !role) {
        throw new HttpsError('invalid-argument', 'معرف المستخدم والدور مطلوبان')
      }

      // التحقق من وجود المستخدم
      const userDoc = await db.collection('users').doc(uid).get()
      if (!userDoc.exists) {
        throw new HttpsError('not-found', 'المستخدم غير موجود')
      }

      // تحديث الدور الأساسي
      await db.collection('users').doc(uid).update({
        primary_role: role,
        updated_at: FieldValue.serverTimestamp()
      })

      // إنشاء ملف خاص بالدور حسب النوع
      if (role === 'photographer' && roleData) {
        await createPhotographerProfile(uid, roleData)
      } else if (role === 'brand_coordinator' && roleData) {
        await createBrandCoordinatorProfile(uid, roleData)
      } else if (role === 'marketing_coordinator' && roleData) {
        await updateMarketingProfile(uid, roleData)
      }

      logger.info(`User role updated: ${uid} -> ${role}`)

      return {
        success: true,
        message: 'تم تحديث الدور بنجاح'
      }

    } catch (error: any) {
      logger.error('Update user role error:', error)
      
      if (error instanceof HttpsError) {
        throw error
      }
      
      throw new HttpsError('internal', 'خطأ في تحديث الدور')
    }
  }
)

/**
 * دالة معالجة طلب الموافقة على الدور
 */
export const processRoleApproval = onCall(
  {
    cors: true,
    enforceAppCheck: false
  },
  async (request: CallableRequest<{ 
    uid: string, 
    action: 'approve' | 'reject', 
    approvedBy: string,
    reason?: string 
  }>) => {
    try {
      const { uid, action, approvedBy, reason } = request.data

      if (!uid || !action || !approvedBy) {
        throw new HttpsError('invalid-argument', 'البيانات المطلوبة مفقودة')
      }

      // جلب بيانات المستخدم
      const userDoc = await db.collection('users').doc(uid).get()
      if (!userDoc.exists) {
        throw new HttpsError('not-found', 'المستخدم غير موجود')
      }

      const userData = userDoc.data()
      const userRole = userData?.primary_role

      if (action === 'approve') {
        // الموافقة على الدور
        await approveUserRole(uid, userRole, approvedBy)
      } else {
        // رفض الطلب
        await rejectUserRole(uid, userRole, approvedBy, reason)
      }

      logger.info(`Role ${action} processed for user: ${uid} by ${approvedBy}`)

      return {
        success: true,
        message: action === 'approve' ? 'تم الموافقة على الطلب' : 'تم رفض الطلب'
      }

    } catch (error: any) {
      logger.error('Process role approval error:', error)
      
      if (error instanceof HttpsError) {
        throw error
      }
      
      throw new HttpsError('internal', 'خطأ في معالجة طلب الموافقة')
    }
  }
)

/**
 * دالة إرسال إشعار طلب الموافقة
 */
export const sendApprovalNotification = onCall(
  {
    cors: true,
    enforceAppCheck: false
  },
  async (request: CallableRequest<{ uid: string, role: UserRole }>) => {
    try {
      const { uid, role } = request.data

      if (!uid || !role) {
        throw new HttpsError('invalid-argument', 'معرف المستخدم والدور مطلوبان')
      }

      // جلب بيانات المستخدم
      const userDoc = await db.collection('users').doc(uid).get()
      if (!userDoc.exists) {
        throw new HttpsError('not-found', 'المستخدم غير موجود')
      }

      const userData = userDoc.data()

      // إنشاء إشعار للمديرين
      const notificationData = {
        id: `approval_${uid}_${Date.now()}`,
        notification_type: 'role_approval_request',
        title: 'طلب موافقة على دور جديد',
        message: `طلب موافقة من ${userData?.display_name} على دور ${getRoleDisplayName(role)}`,
        user_id: uid,
        role_requested: role,
        priority_level: 'medium',
        status: 'pending',
        created_at: FieldValue.serverTimestamp(),
        updated_at: FieldValue.serverTimestamp()
      }

      // حفظ الإشعار
      await db.collection('notifications').add(notificationData)

      logger.info(`Approval notification sent for user: ${uid}, role: ${role}`)

      return {
        success: true,
        message: 'تم إرسال طلب الموافقة'
      }

    } catch (error: any) {
      logger.error('Send approval notification error:', error)
      
      if (error instanceof HttpsError) {
        throw error
      }
      
      throw new HttpsError('internal', 'خطأ في إرسال إشعار الموافقة')
    }
  }
)

// ======================================
// Helper Functions
// ======================================

async function createPhotographerProfile(uid: string, profileData: any) {
  const photographerProfile = {
    id: uid,
    user_id: uid,
    contract_type: profileData.contract_type || 'freelancer',
    specializations: profileData.specializations || [],
    owned_equipment: profileData.owned_equipment || [],
    work_preferences: profileData.work_preferences || {},
    performance_stats: {
      total_tasks_completed: 0,
      average_rating: 0,
      on_time_completion_rate: 0,
      client_satisfaction_score: 0,
      quality_score_average: 0,
      brand_performance: {},
      category_performance: {}
    },
    verification_status: 'pending',
    created_at: FieldValue.serverTimestamp(),
    updated_at: FieldValue.serverTimestamp()
  }

  await db.collection('photographer_profiles').doc(uid).set(photographerProfile)
}

async function createBrandCoordinatorProfile(uid: string, profileData: any) {
  const coordinatorProfile = {
    id: uid,
    user_id: uid,
    brand_id: profileData.brand_id,
    coordinator_title: 'منسق براند',
    job_description: `منسق براند مسؤول عن إدارة وتنسيق أنشطة البراند`,
    responsibilities: profileData.responsibilities || [],
    brand_permissions: {
      can_approve_content: true,
      can_reject_content: true,
      can_assign_tasks: true,
      can_modify_deadlines: false,
      can_view_financials: false,
      can_communicate_with_client: true
    },
    employment_info: {
      start_date: new Date(),
      contract_type: 'full_time',
      compensation_type: 'salary',
      is_exclusive: true
    },
    status: 'pending',
    is_primary_coordinator: false,
    created_at: FieldValue.serverTimestamp(),
    updated_at: FieldValue.serverTimestamp()
  }

  await db.collection('brand_coordinators').doc(uid).set(coordinatorProfile)
}

async function updateMarketingProfile(uid: string, profileData: any) {
  await db.collection('users').doc(uid).update({
    marketing_profile: profileData,
    updated_at: FieldValue.serverTimestamp()
  })
}

async function approveUserRole(uid: string, role: UserRole, approvedBy: string) {
  // تحديث حالة المستخدم
  await db.collection('users').doc(uid).update({
    is_verified: true,
    updated_at: FieldValue.serverTimestamp()
  })

  // تحديث حالة الملف الخاص بالدور
  if (role === 'photographer') {
    await db.collection('photographer_profiles').doc(uid).update({
      verification_status: 'verified',
      verified_by: approvedBy,
      verification_date: FieldValue.serverTimestamp(),
      updated_at: FieldValue.serverTimestamp()
    })
  } else if (role === 'brand_coordinator') {
    await db.collection('brand_coordinators').doc(uid).update({
      status: 'active',
      updated_at: FieldValue.serverTimestamp()
    })
  }

  // إنشاء صلاحيات أساسية
  await createBasicPermissions(uid, role)
}

async function rejectUserRole(uid: string, role: UserRole, rejectedBy: string, reason?: string) {
  if (role === 'photographer') {
    await db.collection('photographer_profiles').doc(uid).update({
      verification_status: 'rejected',
      rejection_reason: reason || 'لم يتم تحديد السبب',
      rejected_by: rejectedBy,
      updated_at: FieldValue.serverTimestamp()
    })
  } else if (role === 'brand_coordinator') {
    await db.collection('brand_coordinators').doc(uid).update({
      status: 'rejected',
      rejection_reason: reason || 'لم يتم تحديد السبب',
      rejected_by: rejectedBy,
      updated_at: FieldValue.serverTimestamp()
    })
  }
}

async function createBasicPermissions(uid: string, role: UserRole) {
  const basicPermissions = {
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

  await db.collection('user_permissions').doc(uid).set(basicPermissions)
}

function getDefaultScreenPermissions(role: UserRole) {
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
      return Object.keys(permissions).reduce((acc, key) => ({ ...acc, [key]: true }), {})
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

function getDefaultCrudPermissions(role: UserRole) {
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

function getRoleDisplayName(role: UserRole): string {
  const roleNames = {
    photographer: 'مصور',
    brand_coordinator: 'منسق براند',
    marketing_coordinator: 'منسق تسويق',
    super_admin: 'مدير عام'
  }
  return roleNames[role] || role
} 
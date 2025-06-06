/**
 * User Triggers - Depth Studio Backend
 * Handles automatic operations when user documents are created/updated
 */

import { logger } from 'firebase-functions/v2'
import { onDocumentCreated, onDocumentUpdated } from 'firebase-functions/v2/firestore'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import type { UserRole } from '../types'

const db = getFirestore()

/**
 * Trigger عند إنشاء مستخدم جديد
 * يقوم بإعداد الصلاحيات الأولية والبيانات الافتراضية
 */
export const onUserCreate = onDocumentCreated(
  'users/{userId}',
  async (event) => {
    try {
      const userId = event.params.userId
      const userData = event.data?.data()

      if (!userData) {
        logger.error('No user data found in trigger')
        return
      }

      logger.info(`User created trigger: ${userId}`)

      // إنشاء صلاحيات أساسية
      await createBasicPermissions(userId, userData.primary_role as UserRole)

      // إضافة المستخدم إلى إحصائيات النظام
      await updateSystemStats('user_created', { userId, role: userData.primary_role })

      // إرسال إشعار ترحيب
      await sendWelcomeNotification(userId, userData)

      logger.info(`User setup completed for: ${userId}`)

    } catch (error) {
      logger.error('Error in onUserCreate trigger:', error)
    }
  }
)

/**
 * Trigger عند تحديث بيانات المستخدم
 * يتعامل مع تغييرات الدور والحالة
 */
export const onUserUpdate = onDocumentUpdated(
  'users/{userId}',
  async (event) => {
    try {
      const userId = event.params.userId
      const beforeData = event.data?.before.data()
      const afterData = event.data?.after.data()

      if (!beforeData || !afterData) {
        logger.error('Missing data in user update trigger')
        return
      }

      logger.info(`User updated trigger: ${userId}`)

      // التحقق من تغيير الدور
      if (beforeData.primary_role !== afterData.primary_role) {
        await handleRoleChange(userId, beforeData.primary_role, afterData.primary_role)
      }

      // التحقق من تغيير حالة التفعيل
      if (beforeData.is_active !== afterData.is_active) {
        await handleActiveStatusChange(userId, afterData.is_active)
      }

      // التحقق من تغيير حالة التحقق
      if (beforeData.is_verified !== afterData.is_verified && afterData.is_verified) {
        await handleUserVerification(userId, afterData)
      }

      logger.info(`User update processing completed for: ${userId}`)

    } catch (error) {
      logger.error('Error in onUserUpdate trigger:', error)
    }
  }
)

/**
 * Trigger عند طلب الموافقة على دور
 */
export const onRoleRequest = onDocumentCreated(
  '{roleCollection}/{profileId}',
  async (event) => {
    try {
      const profileId = event.params.profileId
      const roleCollection = event.params.roleCollection
      const profileData = event.data?.data()

      // التحقق من أن هذا طلب موافقة
      if (!isApprovalRequest(roleCollection, profileData)) {
        return
      }

      logger.info(`Role approval request: ${roleCollection}/${profileId}`)

      // إرسال إشعار للمديرين
      await sendApprovalNotificationToAdmins(profileId, roleCollection, profileData)

      // تحديث إحصائيات الطلبات
      await updateSystemStats('approval_request', { 
        userId: profileId, 
        roleType: roleCollection 
      })

      logger.info(`Approval notification sent for: ${profileId}`)

    } catch (error) {
      logger.error('Error in onRoleRequest trigger:', error)
    }
  }
)

// ======================================
// Helper Functions
// ======================================

async function createBasicPermissions(userId: string, role: UserRole) {
  try {
    const basicPermissions = {
      id: userId,
      user_id: userId,
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
      changelog: [{
        action: 'permissions_created',
        updated_by: 'system',
        timestamp: FieldValue.serverTimestamp(),
        reason: 'Initial user setup'
      }]
    }

    await db.collection('user_permissions').doc(userId).set(basicPermissions)
    logger.info(`Basic permissions created for user: ${userId}`)

  } catch (error) {
    logger.error(`Error creating permissions for user ${userId}:`, error)
    throw error
  }
}

async function updateSystemStats(action: string, data: any) {
  try {
    const statsRef = db.collection('system_stats').doc('general')
    
    await statsRef.update({
      [`${action}_count`]: FieldValue.increment(1),
      [`last_${action}`]: FieldValue.serverTimestamp(),
      [`${action}_details`]: FieldValue.arrayUnion({
        ...data,
        timestamp: FieldValue.serverTimestamp()
      })
    })

  } catch (error) {
    // إنشاء المستند إذا لم يكن موجوداً
    const statsRef = db.collection('system_stats').doc('general')
    await statsRef.set({
      [`${action}_count`]: 1,
      [`last_${action}`]: FieldValue.serverTimestamp(),
      [`${action}_details`]: [{
        ...data,
        timestamp: FieldValue.serverTimestamp()
      }],
      created_at: FieldValue.serverTimestamp()
    }, { merge: true })
  }
}

async function sendWelcomeNotification(userId: string, userData: any) {
  try {
    const welcomeNotification = {
      notification_type: 'welcome',
      title: 'مرحباً بك في Depth Studio',
      message: `أهلاً وسهلاً ${userData.display_name}، تم إنشاء حسابك بنجاح!`,
      user_id: userId,
      priority_level: 'low',
      status: 'unread',
      created_at: FieldValue.serverTimestamp(),
      updated_at: FieldValue.serverTimestamp()
    }

    await db.collection('notifications').add(welcomeNotification)
    logger.info(`Welcome notification sent to: ${userId}`)

  } catch (error) {
    logger.error(`Error sending welcome notification to ${userId}:`, error)
  }
}

async function handleRoleChange(userId: string, oldRole: UserRole, newRole: UserRole) {
  try {
    logger.info(`Role change: ${userId} from ${oldRole} to ${newRole}`)

    // تحديث الصلاحيات حسب الدور الجديد
    await db.collection('user_permissions').doc(userId).update({
      screen_permissions: getDefaultScreenPermissions(newRole),
      crud_permissions: getDefaultCrudPermissions(newRole),
      updated_at: FieldValue.serverTimestamp(),
      last_updated_by: 'system',
      changelog: FieldValue.arrayUnion({
        action: 'role_changed',
        old_role: oldRole,
        new_role: newRole,
        updated_by: 'system',
        timestamp: FieldValue.serverTimestamp()
      })
    })

    // إرسال إشعار بتغيير الدور
    await db.collection('notifications').add({
      notification_type: 'role_change',
      title: 'تم تغيير دورك',
      message: `تم تغيير دورك من ${getRoleDisplayName(oldRole)} إلى ${getRoleDisplayName(newRole)}`,
      user_id: userId,
      priority_level: 'medium',
      status: 'unread',
      created_at: FieldValue.serverTimestamp(),
      updated_at: FieldValue.serverTimestamp()
    })

  } catch (error) {
    logger.error(`Error handling role change for ${userId}:`, error)
  }
}

async function handleActiveStatusChange(userId: string, isActive: boolean) {
  try {
    // تحديث حالة الصلاحيات
    await db.collection('user_permissions').doc(userId).update({
      is_active: isActive,
      updated_at: FieldValue.serverTimestamp(),
      last_updated_by: 'system',
      changelog: FieldValue.arrayUnion({
        action: isActive ? 'account_activated' : 'account_deactivated',
        updated_by: 'system',
        timestamp: FieldValue.serverTimestamp()
      })
    })

    // إرسال إشعار
    const notificationMessage = isActive ? 
      'تم تفعيل حسابك بنجاح' : 
      'تم إلغاء تفعيل حسابك'

    await db.collection('notifications').add({
      notification_type: 'account_status',
      title: 'تغيير حالة الحساب',
      message: notificationMessage,
      user_id: userId,
      priority_level: 'high',
      status: 'unread',
      created_at: FieldValue.serverTimestamp(),
      updated_at: FieldValue.serverTimestamp()
    })

    logger.info(`Active status changed for ${userId}: ${isActive}`)

  } catch (error) {
    logger.error(`Error handling active status change for ${userId}:`, error)
  }
}

async function handleUserVerification(userId: string, userData: any) {
  try {
    // إرسال إشعار تهنئة بالتحقق
    await db.collection('notifications').add({
      notification_type: 'verification_success',
      title: 'تم التحقق من حسابك',
      message: `تهانينا ${userData.display_name}! تم التحقق من حسابك وأصبح بإمكانك الوصول لجميع الميزات`,
      user_id: userId,
      priority_level: 'medium',
      status: 'unread',
      created_at: FieldValue.serverTimestamp(),
      updated_at: FieldValue.serverTimestamp()
    })

    logger.info(`Verification completed for user: ${userId}`)

  } catch (error) {
    logger.error(`Error handling user verification for ${userId}:`, error)
  }
}

async function sendApprovalNotificationToAdmins(profileId: string, roleCollection: string, profileData: any) {
  try {
    // جلب المديرين
    const adminsQuery = await db.collection('users')
      .where('primary_role', 'in', ['super_admin', 'marketing_coordinator'])
      .where('is_active', '==', true)
      .get()

    if (adminsQuery.empty) {
      logger.warn('No admins found to send approval notification')
      return
    }

    // إنشاء إشعار لكل مدير
    const notificationPromises = adminsQuery.docs.map(async (adminDoc) => {
      return db.collection('notifications').add({
        notification_type: 'approval_request',
        title: 'طلب موافقة على دور جديد',
        message: `طلب موافقة من مستخدم جديد على دور ${getRoleDisplayName(roleCollection)}`,
        user_id: adminDoc.id,
        related_user_id: profileId,
        role_collection: roleCollection,
        priority_level: 'medium',
        status: 'unread',
        action_required: true,
        created_at: FieldValue.serverTimestamp(),
        updated_at: FieldValue.serverTimestamp()
      })
    })

    await Promise.all(notificationPromises)
    logger.info(`Approval notifications sent to ${adminsQuery.docs.length} admins`)

  } catch (error) {
    logger.error('Error sending approval notifications to admins:', error)
  }
}

function isApprovalRequest(roleCollection: string, profileData: any): boolean {
  const approvalCollections = ['photographer_profiles', 'brand_coordinators']
  
  if (!approvalCollections.includes(roleCollection)) {
    return false
  }

  // التحقق من حالة الطلب
  if (roleCollection === 'photographer_profiles') {
    return profileData?.verification_status === 'pending'
  } else if (roleCollection === 'brand_coordinators') {
    return profileData?.status === 'pending'
  }

  return false
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

function getRoleDisplayName(role: string): string {
  const roleNames: { [key: string]: string } = {
    photographer: 'مصور',
    photographer_profiles: 'مصور',
    brand_coordinator: 'منسق براند',
    brand_coordinators: 'منسق براند',
    marketing_coordinator: 'منسق تسويق',
    super_admin: 'مدير عام'
  }
  return roleNames[role] || role
} 
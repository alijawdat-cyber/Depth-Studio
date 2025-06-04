import { Request, Response } from 'express';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const db = getFirestore('depth-production');

// Simple logger utility
const logger = {
  info: (message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    if (data) {
      console.log(`[${timestamp}] INFO: ${message}`, data);
    } else {
      console.log(`[${timestamp}] INFO: ${message}`);
    }
  },
  error: (message: string, error?: any) => {
    const timestamp = new Date().toISOString();
    if (error) {
      console.error(`[${timestamp}] ERROR: ${message}`, error);
    } else {
      console.error(`[${timestamp}] ERROR: ${message}`);
    }
  }
};

/**
 * 🆕 API: الموافقة على مستخدم جديد
 * POST /api/users/:userId/approve
 */
export async function approveUser(req: Request, res: Response): Promise<void> {
  try {
    const { userId } = req.params;
    const { approvedBy } = req.body;

    logger.info('🔵 بدء عملية الموافقة على المستخدم:', { userId, approvedBy });

    // التحقق من وجود المستخدم
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      res.status(404).json({
        success: false,
        error: 'المستخدم غير موجود',
        timestamp: new Date().toISOString()
      });
      return;
    }

    const userData = userDoc.data();

    // التحقق من حالة المستخدم
    if (userData?.status === 'active') {
      res.status(400).json({
        success: false,
        error: 'المستخدم معتمد مسبقاً',
        timestamp: new Date().toISOString()
      });
      return;
    }

    // تحديث حالة المستخدم
    await userRef.update({
      status: 'active',
      is_verified: true,
      updated_at: FieldValue.serverTimestamp(),
      updated_by: approvedBy,
      approved_at: FieldValue.serverTimestamp(),
      approved_by: approvedBy
    });

    // إنشاء سجل في تاريخ الموافقات
    await db.collection('user_approvals').add({
      user_id: userId,
      action: 'approved',
      approved_by: approvedBy,
      approved_at: FieldValue.serverTimestamp(),
      previous_status: userData?.status || 'pending_approval',
      notes: 'تمت الموافقة على المستخدم من قبل المدير العام'
    });

    logger.info('✅ تمت الموافقة على المستخدم بنجاح:', { userId, approvedBy });

    res.json({
      success: true,
      message: 'تمت الموافقة على المستخدم بنجاح',
      data: {
        userId,
        newStatus: 'active',
        approvedBy,
        approvedAt: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('❌ خطأ في الموافقة على المستخدم:', error);
    res.status(500).json({
      success: false,
      error: 'خطأ في النظام',
      message: 'حدث خطأ أثناء الموافقة على المستخدم',
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * 🆕 API: رفض مستخدم جديد
 * POST /api/users/:userId/reject
 */
export async function rejectUser(req: Request, res: Response): Promise<void> {
  try {
    const { userId } = req.params;
    const { rejectedBy, reason } = req.body;

    logger.info('🔵 بدء عملية رفض المستخدم:', { userId, rejectedBy, reason });

    // التحقق من وجود المستخدم
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      res.status(404).json({
        success: false,
        error: 'المستخدم غير موجود',
        timestamp: new Date().toISOString()
      });
      return;
    }

    // تحديث حالة المستخدم
    await userRef.update({
      status: 'rejected',
      is_active: false,
      updated_at: FieldValue.serverTimestamp(),
      updated_by: rejectedBy,
      rejected_at: FieldValue.serverTimestamp(),
      rejected_by: rejectedBy,
      rejection_reason: reason || 'لم يتم تحديد السبب'
    });

    logger.info('✅ تم رفض المستخدم بنجاح:', { userId, rejectedBy });

    res.json({
      success: true,
      message: 'تم رفض المستخدم بنجاح',
      data: {
        userId,
        newStatus: 'rejected',
        rejectedBy,
        reason,
        rejectedAt: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('❌ خطأ في رفض المستخدم:', error);
    res.status(500).json({
      success: false,
      error: 'خطأ في النظام',
      message: 'حدث خطأ أثناء رفض المستخدم',
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * 🆕 API: الحصول على قائمة المستخدمين في انتظار الموافقة
 * GET /api/users/pending-approval
 */
export async function getPendingUsers(req: Request, res: Response): Promise<void> {
  try {
    logger.info('🔵 جلب المستخدمين في انتظار الموافقة');

    const usersSnapshot = await db.collection('users')
      .where('status', '==', 'pending_approval')
      .orderBy('created_at', 'desc')
      .get();

    const pendingUsers = usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      created_at: doc.data().created_at?.toDate?.()?.toISOString() || null,
      updated_at: doc.data().updated_at?.toDate?.()?.toISOString() || null
    }));

    logger.info('✅ تم جلب المستخدمين في انتظار الموافقة:', { count: pendingUsers.length });

    res.json({
      success: true,
      data: pendingUsers,
      count: pendingUsers.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('❌ خطأ في جلب المستخدمين في انتظار الموافقة:', error);
    res.status(500).json({
      success: false,
      error: 'خطأ في النظام',
      message: 'حدث خطأ أثناء جلب المستخدمين',
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * 🆕 API: الحصول على إحصائيات المستخدمين للمدير العام
 * GET /api/users/stats
 */
export async function getUserStats(req: Request, res: Response): Promise<void> {
  try {
    logger.info('🔵 جلب إحصائيات المستخدمين');

    // إجمالي المستخدمين
    const totalUsersSnapshot = await db.collection('users').get();
    const totalUsers = totalUsersSnapshot.size;

    // المستخدمين النشطين
    const activeUsersSnapshot = await db.collection('users')
      .where('is_active', '==', true)
      .get();
    const activeUsers = activeUsersSnapshot.size;

    // المستخدمين في انتظار الموافقة
    const pendingUsersSnapshot = await db.collection('users')
      .where('status', '==', 'pending_approval')
      .get();
    const pendingApprovals = pendingUsersSnapshot.size;

    // إحصائيات حسب الدور
    const roleStats: Record<string, number> = {};
    totalUsersSnapshot.docs.forEach(doc => {
      const role = doc.data().primary_role;
      roleStats[role] = (roleStats[role] || 0) + 1;
    });

    const stats = {
      totalUsers,
      activeUsers,
      pendingApprovals,
      roleDistribution: roleStats,
      lastUpdated: new Date().toISOString()
    };

    logger.info('✅ تم جلب إحصائيات المستخدمين:', stats);

    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('❌ خطأ في جلب إحصائيات المستخدمين:', error);
    res.status(500).json({
      success: false,
      error: 'خطأ في النظام',
      message: 'حدث خطأ أثناء جلب الإحصائيات',
      timestamp: new Date().toISOString()
    });
  }
} 
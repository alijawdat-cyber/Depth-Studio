/**
 * 🔔 Notification Service - خدمة الإشعارات
 * =======================================
 * 
 * 📅 محدث: ديسمبر 2024
 * 👨‍💻 المطور: علي جودت
 * 🎯 الهدف: Service شامل لمنطق أعمال الإشعارات مع Type Safety كامل
 */

import { Notification } from '../../../types/src/notifications';
import { NotificationType, PriorityLevel, UserRole } from '../../../types/src/core/enums';
import { ID, FirebaseTimestamp } from '../../../types/src/core/base';
import { 
  NotificationRepository, 
  NotificationSearchOptions, 
  NotificationStats,
  UserNotificationActivity 
} from '../repositories/NotificationRepository';
import { FieldValue } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions';

/**
 * 📝 طلب إنشاء إشعار جديد
 */
export interface CreateNotificationRequest {
  type: NotificationType;
  priority: PriorityLevel;
  title: string;
  message: string;
  recipient_id: ID;
  recipient_role: UserRole;
  sender_id?: ID;
  sender_name?: string;
  is_urgent?: boolean;
  campaign_id?: ID;
  task_id?: ID;
  brand_id?: ID;
  action_required?: boolean;
  action_url?: string;
  action_deadline?: FirebaseTimestamp;
  expires_at?: FirebaseTimestamp;
  attachment_url?: string;
  attachment_name?: string;
}

/**
 * 📤 طلب إرسال إشعارات جماعية
 */
export interface BulkNotificationRequest {
  type: NotificationType;
  priority: PriorityLevel;
  title: string;
  message: string;
  recipient_role?: UserRole;
  recipient_ids?: ID[];
  sender_id?: ID;
  sender_name?: string;
  is_urgent?: boolean;
  campaign_id?: ID;
  task_id?: ID;
  brand_id?: ID;
  action_required?: boolean;
  action_url?: string;
  action_deadline?: FirebaseTimestamp;
  expires_at?: FirebaseTimestamp;
  attachment_url?: string;
  attachment_name?: string;
}

/**
 * ⏰ طلب جدولة إشعار
 */
export interface ScheduleNotificationRequest extends CreateNotificationRequest {
  scheduled_at: FirebaseTimestamp;
  repeat_type?: 'none' | 'daily' | 'weekly' | 'monthly';
  repeat_count?: number;
}

/**
 * 📊 تقرير الإشعارات المرسلة
 */
export interface NotificationDeliveryReport {
  total_sent: number;
  successful_deliveries: number;
  failed_deliveries: number;
  pending_deliveries: number;
  delivery_rate: number;
  failed_recipient_ids: ID[];
  delivery_time_ms: number;
}

/**
 * 🎯 تحليلات فعالية الإشعارات
 */
export interface NotificationEffectivenessAnalysis {
  notification_id: ID;
  type: NotificationType;
  priority: PriorityLevel;
  sent_at: FirebaseTimestamp;
  read_at?: FirebaseTimestamp;
  time_to_read_minutes?: number;
  action_taken: boolean;
  action_completed_at?: FirebaseTimestamp;
  time_to_action_minutes?: number;
  effectiveness_score: number; // 0-100
  engagement_level: 'low' | 'medium' | 'high';
  user_feedback?: string;
}

/**
 * 🔔 Notification Service Class
 */
export class NotificationService {
  private notificationRepository: NotificationRepository;

  constructor() {
    this.notificationRepository = new NotificationRepository();
    logger.info('🔔 NotificationService initialized');
  }

  // ======================================
  // 📤 إرسال الإشعارات
  // ======================================

  /**
   * إنشاء وإرسال إشعار جديد
   */
  async sendNotification(request: CreateNotificationRequest): Promise<Notification> {
    try {
      logger.info('📤 Sending notification', { 
        type: request.type, 
        recipient_id: request.recipient_id,
        priority: request.priority
      });

      // التحقق من صحة البيانات
      await this.validateNotificationRequest(request);

      // إنشاء الإشعار
      const notificationData: any = {
        type: request.type,
        priority: request.priority,
        title: request.title,
        message: request.message,
        recipient_id: request.recipient_id,
        recipient_role: request.recipient_role,
        is_read: false,
        is_urgent: request.is_urgent || false,
        action_required: request.action_required || false,
        action_completed: false,
        created_at: FieldValue.serverTimestamp() as FirebaseTimestamp,
        updated_at: FieldValue.serverTimestamp() as FirebaseTimestamp
      };

      // إضافة الحقول الاختيارية فقط إذا كانت محددة
      if (request.sender_id) notificationData.sender_id = request.sender_id;
      if (request.sender_name) notificationData.sender_name = request.sender_name;
      if (request.campaign_id) notificationData.campaign_id = request.campaign_id;
      if (request.task_id) notificationData.task_id = request.task_id;
      if (request.brand_id) notificationData.brand_id = request.brand_id;
      if (request.action_url) notificationData.action_url = request.action_url;
      if (request.action_deadline) notificationData.action_deadline = request.action_deadline;
      if (request.expires_at) notificationData.expires_at = request.expires_at;
      if (request.attachment_url) notificationData.attachment_url = request.attachment_url;
      if (request.attachment_name) notificationData.attachment_name = request.attachment_name;

      const notification = await this.notificationRepository.create(notificationData);

      logger.info('✅ Notification sent successfully', { 
        notificationId: notification.id,
        type: request.type,
        recipient_id: request.recipient_id
      });

      return notification;
    } catch (error) {
      logger.error('❌ Error sending notification', { request, error });
      throw error;
    }
  }

  /**
   * إرسال إشعارات جماعية
   */
  async sendBulkNotifications(
    request: BulkNotificationRequest
  ): Promise<NotificationDeliveryReport> {
    try {
      logger.info('📤 Sending bulk notifications', { 
        type: request.type,
        recipient_role: request.recipient_role,
        recipient_count: request.recipient_ids?.length
      });

      const startTime = Date.now();
      
      // تحديد المستقبلين
      let recipientIds: ID[] = [];
      
      if (request.recipient_ids && request.recipient_ids.length > 0) {
        recipientIds = request.recipient_ids;
      } else if (request.recipient_role) {
        // هنا يمكن إضافة منطق جلب المستخدمين حسب الدور
        // يمكن إضافة تكامل مع UserService لاحقاً
        logger.warn('Bulk notification by role not yet implemented');
        recipientIds = [];
      }

      if (recipientIds.length === 0) {
        throw new Error('لا توجد مستقبلين للإشعار الجماعي');
      }

      const results = {
        total_sent: recipientIds.length,
        successful_deliveries: 0,
        failed_deliveries: 0,
        pending_deliveries: 0,
        delivery_rate: 0,
        failed_recipient_ids: [] as ID[],
        delivery_time_ms: 0
      };

      // إرسال الإشعارات
      for (const recipientId of recipientIds) {
        try {
          const notificationRequest: CreateNotificationRequest = {
            ...request,
            recipient_id: recipientId,
            recipient_role: request.recipient_role || 'new_user' // افتراضي
          };

          await this.sendNotification(notificationRequest);
          results.successful_deliveries++;
        } catch (error) {
          logger.error('❌ Failed to send notification to recipient', { 
            recipientId, 
            error 
          });
          results.failed_deliveries++;
          results.failed_recipient_ids.push(recipientId);
        }
      }

      // حساب النتائج
      results.delivery_rate = results.total_sent > 0 ? 
        (results.successful_deliveries / results.total_sent) * 100 : 0;
      results.delivery_time_ms = Date.now() - startTime;

      logger.info('✅ Bulk notifications sent', { 
        results,
        type: request.type
      });

      return results;
    } catch (error) {
      logger.error('❌ Error sending bulk notifications', { request, error });
      throw error;
    }
  }

  /**
   * جدولة إشعار للإرسال لاحقاً
   */
  async scheduleNotification(
    request: ScheduleNotificationRequest
  ): Promise<{ message: string; scheduled_at: FirebaseTimestamp }> {
    try {
      logger.info('⏰ Scheduling notification', { 
        type: request.type,
        recipient_id: request.recipient_id,
        scheduled_at: request.scheduled_at
      });

      // التحقق من أن الوقت المجدول في المستقبل
      const scheduledTime = request.scheduled_at.toDate();
      const now = new Date();
      
      if (scheduledTime <= now) {
        throw new Error('وقت الجدولة يجب أن يكون في المستقبل');
      }

      // هنا يمكن إضافة منطق الجدولة الفعلي
      // مثل استخدام Cloud Tasks أو Cron Jobs
      // حالياً سنحفظ الطلب للمعالجة لاحقاً

      logger.info('✅ Notification scheduled successfully', { 
        type: request.type,
        recipient_id: request.recipient_id,
        scheduled_at: request.scheduled_at
      });

      return {
        message: 'تم جدولة الإشعار بنجاح',
        scheduled_at: request.scheduled_at
      };
    } catch (error) {
      logger.error('❌ Error scheduling notification', { request, error });
      throw error;
    }
  }

  // ======================================
  // 📖 إدارة قراءة الإشعارات
  // ======================================

  /**
   * تعليم إشعار كمقروء
   */
  async markNotificationAsRead(
    notificationId: ID, 
    userId: ID
  ): Promise<Notification> {
    try {
      logger.info('📖 Marking notification as read', { notificationId, userId });

      // التحقق من وجود الإشعار
      const notification = await this.notificationRepository.findById(notificationId);
      if (!notification) {
        throw new Error('الإشعار غير موجود');
      }

      // التحقق من أن المستخدم هو المستقبل
      if (notification.recipient_id !== userId) {
        throw new Error('غير مسموح: المستخدم ليس مستقبل الإشعار');
      }

      // تعليم كمقروء
      const updatedNotification = await this.notificationRepository.markAsRead(
        notificationId, 
        userId
      );

      logger.info('✅ Notification marked as read', { notificationId, userId });

      return updatedNotification;
    } catch (error) {
      logger.error('❌ Error marking notification as read', { 
        notificationId, 
        userId, 
        error 
      });
      throw error;
    }
  }

  /**
   * تعليم جميع إشعارات المستخدم كمقروءة
   */
  async markAllNotificationsAsRead(userId: ID): Promise<number> {
    try {
      logger.info('📖 Marking all notifications as read for user', { userId });

      const markedCount = await this.notificationRepository.markAllAsRead(userId);

      logger.info('✅ All notifications marked as read', { userId, markedCount });

      return markedCount;
    } catch (error) {
      logger.error('❌ Error marking all notifications as read', { userId, error });
      throw error;
    }
  }

  /**
   * تحديث حالة الإجراء المطلوب
   */
  async updateNotificationAction(
    notificationId: ID,
    completed: boolean,
    userId: ID
  ): Promise<Notification> {
    try {
      logger.info('⚡ Updating notification action', { 
        notificationId, 
        completed, 
        userId 
      });

      // التحقق من وجود الإشعار
      const notification = await this.notificationRepository.findById(notificationId);
      if (!notification) {
        throw new Error('الإشعار غير موجود');
      }

      // التحقق من أن المستخدم هو المستقبل
      if (notification.recipient_id !== userId) {
        throw new Error('غير مسموح: المستخدم ليس مستقبل الإشعار');
      }

      // التحقق من أن الإشعار يحتاج إجراء
      if (!notification.action_required) {
        throw new Error('هذا الإشعار لا يحتاج إجراء');
      }

      const updatedNotification = await this.notificationRepository.updateActionStatus(
        notificationId,
        completed,
        userId
      );

      logger.info('✅ Notification action updated', { 
        notificationId, 
        completed, 
        userId 
      });

      return updatedNotification;
    } catch (error) {
      logger.error('❌ Error updating notification action', { 
        notificationId, 
        completed, 
        userId, 
        error 
      });
      throw error;
    }
  }

  // ======================================
  // 🔍 البحث والاستعلام
  // ======================================

  /**
   * جلب إشعارات المستخدم
   */
  async getUserNotifications(
    userId: ID,
    options: { limit?: number; offset?: number; unreadOnly?: boolean } = {}
  ): Promise<Notification[]> {
    try {
      logger.info('🔍 Getting user notifications', { userId, options });

      if (options.unreadOnly) {
        const notifications = await this.notificationRepository.findUnreadByUser(userId);
        return notifications;
      }

      const queryOptions: any = {};
      if (options.limit !== undefined) queryOptions.limit = options.limit;
      if (options.offset !== undefined) queryOptions.offset = options.offset;

      const notifications = await this.notificationRepository.findByUser(userId, queryOptions);

      logger.info('🔍 User notifications retrieved', { 
        userId, 
        count: notifications.length 
      });

      return notifications;
    } catch (error) {
      logger.error('❌ Error getting user notifications', { userId, options, error });
      throw error;
    }
  }

  /**
   * جلب الإشعارات العاجلة للمستخدم
   */
  async getUrgentNotifications(userId: ID): Promise<Notification[]> {
    try {
      logger.info('🚨 Getting urgent notifications for user', { userId });

      const notifications = await this.notificationRepository.findUrgentByUser(userId);

      logger.info('🚨 Urgent notifications retrieved', { 
        userId, 
        count: notifications.length 
      });

      return notifications;
    } catch (error) {
      logger.error('❌ Error getting urgent notifications', { userId, error });
      throw error;
    }
  }

  /**
   * جلب الإشعارات التي تحتاج إجراء
   */
  async getActionRequiredNotifications(userId?: ID): Promise<Notification[]> {
    try {
      logger.info('⚡ Getting action required notifications', { userId });

      const notifications = await this.notificationRepository.findActionRequired(userId);

      logger.info('⚡ Action required notifications retrieved', { 
        userId, 
        count: notifications.length 
      });

      return notifications;
    } catch (error) {
      logger.error('❌ Error getting action required notifications', { userId, error });
      throw error;
    }
  }

  /**
   * البحث المتقدم في الإشعارات
   */
  async searchNotifications(
    searchOptions: NotificationSearchOptions,
    queryOptions: { limit?: number; offset?: number } = {}
  ): Promise<Notification[]> {
    try {
      logger.info('🔍 Advanced notification search', { searchOptions, queryOptions });

      const notifications = await this.notificationRepository.searchNotifications(
        searchOptions,
        queryOptions
      );

      logger.info('🔍 Advanced search completed', { 
        searchOptions, 
        resultsCount: notifications.length 
      });

      return notifications;
    } catch (error) {
      logger.error('❌ Error in advanced notification search', { 
        searchOptions, 
        queryOptions, 
        error 
      });
      throw error;
    }
  }

  // ======================================
  // 📊 الإحصائيات والتحليلات
  // ======================================

  /**
   * جلب إحصائيات الإشعارات العامة
   */
  async getNotificationStats(): Promise<NotificationStats> {
    try {
      logger.info('📊 Getting notification statistics');

      const stats = await this.notificationRepository.getNotificationStats();

      logger.info('📊 Notification statistics retrieved', { 
        totalNotifications: stats.total_notifications,
        readRate: stats.read_rate
      });

      return stats;
    } catch (error) {
      logger.error('❌ Error getting notification statistics', { error });
      throw error;
    }
  }

  /**
   * جلب إحصائيات إشعارات المستخدم
   */
  async getUserNotificationActivity(userId: ID): Promise<UserNotificationActivity> {
    try {
      logger.info('📊 Getting user notification activity', { userId });

      const activity = await this.notificationRepository.getUserNotificationActivity(userId);

      logger.info('📊 User notification activity retrieved', { 
        userId,
        totalReceived: activity.total_received,
        readRate: activity.read_rate
      });

      return activity;
    } catch (error) {
      logger.error('❌ Error getting user notification activity', { userId, error });
      throw error;
    }
  }

  /**
   * تحليل فعالية الإشعارات
   */
  async analyzeNotificationEffectiveness(
    notificationId: ID
  ): Promise<NotificationEffectivenessAnalysis> {
    try {
      logger.info('📈 Analyzing notification effectiveness', { notificationId });

      const notification = await this.notificationRepository.findById(notificationId);
      if (!notification) {
        throw new Error('الإشعار غير موجود');
      }

      // حساب الوقت للقراءة
      let timeToReadMinutes: number | undefined;
      if (notification.is_read && notification.read_at && notification.created_at) {
        const readTime = notification.read_at.toDate().getTime();
        const createdTime = notification.created_at.toDate().getTime();
        timeToReadMinutes = (readTime - createdTime) / (1000 * 60);
      }

      // حساب الوقت للإجراء
      let timeToActionMinutes: number | undefined;
      if (notification.action_completed && notification.action_completed_at && notification.created_at) {
        const actionTime = notification.action_completed_at.toDate().getTime();
        const createdTime = notification.created_at.toDate().getTime();
        timeToActionMinutes = (actionTime - createdTime) / (1000 * 60);
      }

      // حساب درجة الفعالية (0-100)
      let effectivenessScore = 0;
      
      // نقاط للقراءة
      if (notification.is_read) effectivenessScore += 30;
      
      // نقاط سرعة القراءة
      if (timeToReadMinutes !== undefined) {
        if (timeToReadMinutes <= 60) effectivenessScore += 20; // خلال ساعة
        else if (timeToReadMinutes <= 1440) effectivenessScore += 10; // خلال يوم
      }

      // نقاط للإجراء
      if (notification.action_required) {
        if (notification.action_completed) effectivenessScore += 30;
        
        // نقاط سرعة الإجراء
        if (timeToActionMinutes !== undefined) {
          if (timeToActionMinutes <= 180) effectivenessScore += 20; // خلال 3 ساعات
          else if (timeToActionMinutes <= 1440) effectivenessScore += 10; // خلال يوم
        }
      } else {
        // إذا لم يكن يحتاج إجراء، نعطي نقاط كاملة
        effectivenessScore += 50;
      }

      // تحديد مستوى المشاركة
      let engagementLevel: 'low' | 'medium' | 'high' = 'low';
      if (effectivenessScore >= 80) engagementLevel = 'high';
      else if (effectivenessScore >= 50) engagementLevel = 'medium';

      const analysis: any = {
        notification_id: notificationId,
        type: notification.type,
        priority: notification.priority,
        sent_at: notification.created_at,
        action_taken: notification.action_completed,
        effectiveness_score: effectivenessScore,
        engagement_level: engagementLevel
      };

      // إضافة الحقول الاختيارية فقط إذا كانت محددة
      if (notification.read_at) analysis.read_at = notification.read_at;
      if (timeToReadMinutes !== undefined) analysis.time_to_read_minutes = timeToReadMinutes;
      if (notification.action_completed_at) analysis.action_completed_at = notification.action_completed_at;
      if (timeToActionMinutes !== undefined) analysis.time_to_action_minutes = timeToActionMinutes;

      logger.info('📈 Notification effectiveness analyzed', { 
        notificationId,
        effectivenessScore,
        engagementLevel
      });

      return analysis;
    } catch (error) {
      logger.error('❌ Error analyzing notification effectiveness', { 
        notificationId, 
        error 
      });
      throw error;
    }
  }

  // ======================================
  // 🧹 إدارة الإشعارات
  // ======================================

  /**
   * حذف الإشعارات المنتهية الصلاحية
   */
  async cleanupExpiredNotifications(): Promise<{ deletedCount: number }> {
    try {
      logger.info('🧹 Cleaning up expired notifications');

      const deletedCount = await this.notificationRepository.deleteExpiredNotifications();

      logger.info('✅ Expired notifications cleaned up', { deletedCount });

      return { deletedCount };
    } catch (error) {
      logger.error('❌ Error cleaning up expired notifications', { error });
      throw error;
    }
  }

  /**
   * حذف إشعار محدد
   */
  async deleteNotification(notificationId: ID, userId: ID): Promise<void> {
    try {
      logger.info('🗑️ Deleting notification', { notificationId, userId });

      // التحقق من وجود الإشعار
      const notification = await this.notificationRepository.findById(notificationId);
      if (!notification) {
        throw new Error('الإشعار غير موجود');
      }

      // التحقق من الصلاحية (المستخدم يمكنه حذف إشعاراته فقط)
      if (notification.recipient_id !== userId) {
        throw new Error('غير مسموح: لا يمكنك حذف إشعارات الآخرين');
      }

      await this.notificationRepository.delete(notificationId);

      logger.info('✅ Notification deleted successfully', { notificationId, userId });
    } catch (error) {
      logger.error('❌ Error deleting notification', { notificationId, userId, error });
      throw error;
    }
  }

  // ======================================
  // 🔧 دوال مساعدة خاصة
  // ======================================

  /**
   * التحقق من صحة طلب الإشعار
   */
  private async validateNotificationRequest(
    request: CreateNotificationRequest
  ): Promise<void> {
    // التحقق من الحقول المطلوبة
    if (!request.title || request.title.trim().length === 0) {
      throw new Error('عنوان الإشعار مطلوب');
    }

    if (!request.message || request.message.trim().length === 0) {
      throw new Error('محتوى الإشعار مطلوب');
    }

    if (!request.recipient_id) {
      throw new Error('معرف المستقبل مطلوب');
    }

    // التحقق من طول العنوان والرسالة
    if (request.title.length > 100) {
      throw new Error('عنوان الإشعار طويل جداً (الحد الأقصى 100 حرف)');
    }

    if (request.message.length > 500) {
      throw new Error('محتوى الإشعار طويل جداً (الحد الأقصى 500 حرف)');
    }

    // التحقق من تاريخ انتهاء الصلاحية
    if (request.expires_at) {
      const expiryDate = request.expires_at.toDate();
      const now = new Date();
      
      if (expiryDate <= now) {
        throw new Error('تاريخ انتهاء الصلاحية يجب أن يكون في المستقبل');
      }
    }

    // التحقق من تاريخ الموعد النهائي للإجراء
    if (request.action_deadline) {
      const deadline = request.action_deadline.toDate();
      const now = new Date();
      
      if (deadline <= now) {
        throw new Error('الموعد النهائي للإجراء يجب أن يكون في المستقبل');
      }
    }

    logger.info('✅ Notification request validated successfully');
  }
} 
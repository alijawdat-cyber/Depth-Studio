/**
 * 🔔 Notification Controller - تحكم الإشعارات
 * ===============================================
 * 
 * 📅 محدث: ديسمبر 2024
 * 👨‍💻 المطور: علي جودت
 * 🎯 الهدف: Controller شامل لـ API الإشعارات مع Type Safety كامل
 * 
 * 🔍 فوائد الاستيرادات:
 * ==================
 * 
 * 1. Express Types: type safety لـ HTTP requests و responses
 * 2. Service Interfaces: ضمان التوافق مع خدمة الإشعارات
 * 3. Repository Types: options للبحث المتقدم بـ type safety
 * 4. Core Types: الأنواع الأساسية للنظام مع validation
 * 5. Firebase Types: تكامل آمن مع Firebase و timestamps
 * 6. Validation: تحقق شامل من البيانات قبل المعالجة
 */

import { Request, Response } from 'express';
import { 
  NotificationService,
  CreateNotificationRequest,
  BulkNotificationRequest,
  ScheduleNotificationRequest
} from '../services/NotificationService';
import { NotificationSearchOptions } from '../repositories/NotificationRepository';
import { NotificationType, PriorityLevel, UserRole } from '../../../types/src/core/enums';
import { ID, FirebaseTimestamp } from '../../../types/src/core/base';
import { FieldValue } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions';

// 🔒 إستيراد مصادقات الإشعارات
import {
  validateCreateNotification,
  validateBulkNotification,
  validateScheduleNotification,
  validateMarkAsRead,
  validateUpdateAction,
  validateDeleteNotification,
  validateNotificationIdParams,
  validateUserIdParams,
  validateSearchNotifications,
  validateNotificationStats,
  validatePaginatedNotifications
} from '../validators/NotificationValidators';

/**
 * 🔔 Notification Controller Class
 */
export class NotificationController {
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
    logger.info('🔔 NotificationController initialized');
  }

  // ======================================
  // 📤 إرسال الإشعارات
  // ======================================

  /**
   * POST /api/notifications
   * إنشاء وإرسال إشعار جديد
   * 🔒 Validation: validateCreateNotification middleware
   * 
   * فايدة validateCreateNotification:
   * - التحقق من نوع الإشعار (system, campaign_update, task_assignment, etc.)
   * - التحقق من مستوى الأولوية (low, medium, high, urgent)
   * - التحقق من العنوان والرسالة (3-200 حرف للعنوان، 5-1000 للرسالة)
   * - التحقق من معرف المستقبل ودوره
   * - التحقق من الحقول الاختيارية (روابط، مرفقات، مواعيد)
   */
  async sendNotification(req: Request, res: Response): Promise<void> {
    try {
      // استخدام الـ validation function للتحقق من البيانات
      validateCreateNotification(req, res, () => {});

      logger.info('📤 POST /api/notifications - Send notification');

      const {
        type,
        priority,
        title,
        message,
        recipient_id,
        recipient_role,
        sender_id,
        sender_name,
        is_urgent,
        campaign_id,
        task_id,
        brand_id,
        action_required,
        action_url,
        action_deadline,
        expires_at,
        attachment_url,
        attachment_name
      } = req.body;

      // التحقق من الحقول المطلوبة
      if (!type || !priority || !title || !message || !recipient_id || !recipient_role) {
        res.status(400).json({
          success: false,
          message: 'الحقول المطلوبة: type, priority, title, message, recipient_id, recipient_role',
          error_code: 'MISSING_REQUIRED_FIELDS'
        });
        return;
      }

      // بناء الطلب مع الحقول المطلوبة فقط
      const request: CreateNotificationRequest = {
        type: type as NotificationType,
        priority: priority as PriorityLevel,
        title,
        message,
        recipient_id,
        recipient_role: recipient_role as UserRole
      };

      // إضافة الحقول الاختيارية فقط إذا كانت محددة ولها قيمة
      if (is_urgent !== undefined) request.is_urgent = Boolean(is_urgent);
      if (action_required !== undefined) request.action_required = Boolean(action_required);
      if (sender_id) request.sender_id = sender_id;
      if (sender_name) request.sender_name = sender_name;
      if (campaign_id) request.campaign_id = campaign_id;
      if (task_id) request.task_id = task_id;
      if (brand_id) request.brand_id = brand_id;
      if (action_url) request.action_url = action_url;
      if (action_deadline) request.action_deadline = FieldValue.serverTimestamp() as FirebaseTimestamp;
      if (expires_at) request.expires_at = FieldValue.serverTimestamp() as FirebaseTimestamp;
      if (attachment_url) request.attachment_url = attachment_url;
      if (attachment_name) request.attachment_name = attachment_name;

      const notification = await this.notificationService.sendNotification(request);

      res.status(201).json({
        success: true,
        message: 'تم إرسال الإشعار بنجاح',
        data: notification
      });

      logger.info('✅ Notification sent successfully via API', { 
        notificationId: notification.id,
        type
      });
    } catch (error) {
      logger.error('❌ Error in sendNotification API', { error });
      res.status(500).json({
        success: false,
        message: 'خطأ في إرسال الإشعار',
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
    }
  }

  /**
   * POST /api/notifications/bulk
   * إرسال إشعارات جماعية
   * 🔒 Validation: validateBulkNotification middleware
   * 
   * فايدة validateBulkNotification:
   * - التحقق من بيانات الإشعار الأساسية (نوع، أولوية، عنوان، رسالة)
   * - التحقق من وجود مستقبلين (إما دور أو قائمة معرفات)
   * - التحقق من قائمة المعرفات (حد أدنى مستقبل واحد)
   * - التحقق من صحة الدور المستقبل
   * - التحقق من الحقول الاختيارية للإشعارات الجماعية
   */
  async sendBulkNotifications(req: Request, res: Response): Promise<void> {
    try {
      // استخدام الـ validation function للتحقق من البيانات
      validateBulkNotification(req, res, () => {});

      logger.info('📤 POST /api/notifications/bulk - Send bulk notifications');

      const {
        type,
        priority,
        title,
        message,
        recipient_role,
        recipient_ids,
        sender_id,
        sender_name,
        is_urgent,
        campaign_id,
        task_id,
        brand_id,
        action_required,
        action_url,
        action_deadline,
        expires_at,
        attachment_url,
        attachment_name
      } = req.body;

      // التحقق من الحقول المطلوبة
      if (!type || !priority || !title || !message) {
        res.status(400).json({
          success: false,
          message: 'الحقول المطلوبة: type, priority, title, message',
          error_code: 'MISSING_REQUIRED_FIELDS'
        });
        return;
      }

      // التحقق من وجود مستقبلين
      if (!recipient_role && (!recipient_ids || recipient_ids.length === 0)) {
        res.status(400).json({
          success: false,
          message: 'يجب تحديد إما recipient_role أو recipient_ids',
          error_code: 'NO_RECIPIENTS_SPECIFIED'
        });
        return;
      }

      // بناء طلب الإشعار الجماعي مع الحقول المطلوبة فقط
      const request: BulkNotificationRequest = {
        type: type as NotificationType,
        priority: priority as PriorityLevel,
        title,
        message
      };

      // إضافة الحقول الاختيارية فقط إذا كانت محددة ولها قيمة
      if (recipient_role) request.recipient_role = recipient_role as UserRole;
      if (recipient_ids && Array.isArray(recipient_ids)) request.recipient_ids = recipient_ids;
      if (is_urgent !== undefined) request.is_urgent = Boolean(is_urgent);
      if (action_required !== undefined) request.action_required = Boolean(action_required);
      if (sender_id) request.sender_id = sender_id;
      if (sender_name) request.sender_name = sender_name;
      if (campaign_id) request.campaign_id = campaign_id;
      if (task_id) request.task_id = task_id;
      if (brand_id) request.brand_id = brand_id;
      if (action_url) request.action_url = action_url;
      if (action_deadline) request.action_deadline = FieldValue.serverTimestamp() as FirebaseTimestamp;
      if (expires_at) request.expires_at = FieldValue.serverTimestamp() as FirebaseTimestamp;
      if (attachment_url) request.attachment_url = attachment_url;
      if (attachment_name) request.attachment_name = attachment_name;

      const report = await this.notificationService.sendBulkNotifications(request);

      res.status(201).json({
        success: true,
        message: 'تم إرسال الإشعارات الجماعية',
        data: report
      });

      logger.info('✅ Bulk notifications sent successfully via API', { 
        totalSent: report.total_sent,
        successfulDeliveries: report.successful_deliveries,
        type
      });
    } catch (error) {
      logger.error('❌ Error in sendBulkNotifications API', { error });
      res.status(500).json({
        success: false,
        message: 'خطأ في إرسال الإشعارات الجماعية',
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
    }
  }

  /**
   * POST /api/notifications/schedule
   * جدولة إشعار للإرسال لاحقاً
   * 🔒 Validation: validateScheduleNotification middleware
   * 
   * فايدة validateScheduleNotification:
   * - التحقق من بيانات الإشعار الأساسية (نوع، أولوية، عنوان، رسالة)
   * - التحقق من معرف المستقبل ودوره
   * - التحقق من وقت الجدولة (scheduled_at)
   * - التحقق من نوع التكرار (none, daily, weekly, monthly, yearly)
   * - التحقق من عدد مرات التكرار (1-365)
   */
  async scheduleNotification(req: Request, res: Response): Promise<void> {
    try {
      // استخدام الـ validation function للتحقق من البيانات
      validateScheduleNotification(req, res, () => {});

      logger.info('⏰ POST /api/notifications/schedule - Schedule notification');

      const {
        type,
        priority,
        title,
        message,
        recipient_id,
        recipient_role,
        scheduled_at,
        repeat_type,
        repeat_count,
        sender_id,
        sender_name,
        is_urgent,
        campaign_id,
        task_id,
        brand_id,
        action_required,
        action_url,
        action_deadline,
        expires_at,
        attachment_url,
        attachment_name
      } = req.body;

      // التحقق من الحقول المطلوبة
      if (!type || !priority || !title || !message || !recipient_id || !recipient_role || !scheduled_at) {
        res.status(400).json({
          success: false,
          message: 'الحقول المطلوبة: type, priority, title, message, recipient_id, recipient_role, scheduled_at',
          error_code: 'MISSING_REQUIRED_FIELDS'
        });
        return;
      }

      // بناء طلب الجدولة مع الحقول المطلوبة فقط
      const request: ScheduleNotificationRequest = {
        type: type as NotificationType,
        priority: priority as PriorityLevel,
        title,
        message,
        recipient_id,
        recipient_role: recipient_role as UserRole,
        scheduled_at: FieldValue.serverTimestamp() as FirebaseTimestamp
      };

      // إضافة الحقول الاختيارية فقط إذا كانت محددة ولها قيمة
      if (repeat_type) request.repeat_type = repeat_type;
      if (repeat_count !== undefined) request.repeat_count = repeat_count;
      if (is_urgent !== undefined) request.is_urgent = Boolean(is_urgent);
      if (action_required !== undefined) request.action_required = Boolean(action_required);
      if (sender_id) request.sender_id = sender_id;
      if (sender_name) request.sender_name = sender_name;
      if (campaign_id) request.campaign_id = campaign_id;
      if (task_id) request.task_id = task_id;
      if (brand_id) request.brand_id = brand_id;
      if (action_url) request.action_url = action_url;
      if (action_deadline) request.action_deadline = FieldValue.serverTimestamp() as FirebaseTimestamp;
      if (expires_at) request.expires_at = FieldValue.serverTimestamp() as FirebaseTimestamp;
      if (attachment_url) request.attachment_url = attachment_url;
      if (attachment_name) request.attachment_name = attachment_name;

      const result = await this.notificationService.scheduleNotification(request);

      res.status(201).json({
        success: true,
        message: result.message,
        data: {
          scheduled_at: result.scheduled_at,
          repeat_type,
          repeat_count
        }
      });

      logger.info('✅ Notification scheduled successfully via API', { 
        type,
        recipient_id,
        scheduled_at: result.scheduled_at
      });
    } catch (error) {
      logger.error('❌ Error in scheduleNotification API', { error });
      res.status(500).json({
        success: false,
        message: 'خطأ في جدولة الإشعار',
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
    }
  }

  // ======================================
  // 📖 إدارة قراءة الإشعارات
  // ======================================

  /**
   * PATCH /api/notifications/:id/read
   * تعليم إشعار كمقروء
   * 🔒 Validation: validateNotificationIdParams + validateMarkAsRead middleware
   * 
   * فايدة validateNotificationIdParams:
   * - التحقق من صحة معرف الإشعار في URL params
   * 
   * فايدة validateMarkAsRead:
   * - التحقق من معرف المستخدم في body
   * - ضمان أمان عملية تعليم القراءة
   */
  async markAsRead(req: Request, res: Response): Promise<void> {
    try {
      // استخدام الـ validation functions للتحقق من البيانات
      validateNotificationIdParams(req, res, () => {});
      validateMarkAsRead(req, res, () => {});

      const notificationId = req.params['id'];
      const userId = req.body.user_id;

      logger.info('📖 PATCH /api/notifications/:id/read - Mark as read', { 
        notificationId, 
        userId 
      });

      // التحقق من وجود المعرفات المطلوبة
      if (!notificationId) {
        res.status(400).json({
          success: false,
          message: 'معرف الإشعار مطلوب في URL',
          error_code: 'MISSING_NOTIFICATION_ID'
        });
        return;
      }

      if (!userId) {
        res.status(400).json({
          success: false,
          message: 'user_id مطلوب في body',
          error_code: 'MISSING_USER_ID'
        });
        return;
      }

      const notification = await this.notificationService.markNotificationAsRead(
        notificationId,
        userId
      );

      res.status(200).json({
        success: true,
        message: 'تم تعليم الإشعار كمقروء',
        data: notification
      });

      logger.info('✅ Notification marked as read via API', { notificationId, userId });
    } catch (error) {
      logger.error('❌ Error in markAsRead API', { error });
      res.status(500).json({
        success: false,
        message: 'خطأ في تعليم الإشعار كمقروء',
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
    }
  }

  /**
   * PATCH /api/notifications/read-all
   * تعليم جميع إشعارات المستخدم كمقروءة
   * 🔒 Validation: validateMarkAsRead middleware
   * 
   * فايدة validateMarkAsRead:
   * - التحقق من معرف المستخدم في body
   * - ضمان أمان عملية تعليم القراءة الجماعية
   */
  async markAllAsRead(req: Request, res: Response): Promise<void> {
    try {
      // استخدام الـ validation function للتحقق من البيانات
      validateMarkAsRead(req, res, () => {});

      const userId = req.body.user_id;

      logger.info('📖 PATCH /api/notifications/read-all - Mark all as read', { userId });

      if (!userId) {
        res.status(400).json({
          success: false,
          message: 'user_id مطلوب في body',
          error_code: 'MISSING_USER_ID'
        });
        return;
      }

      const markedCount = await this.notificationService.markAllNotificationsAsRead(userId);

      res.status(200).json({
        success: true,
        message: `تم تعليم ${markedCount} إشعار كمقروء`,
        data: {
          marked_count: markedCount,
          user_id: userId
        }
      });

      logger.info('✅ All notifications marked as read via API', { userId, markedCount });
    } catch (error) {
      logger.error('❌ Error in markAllAsRead API', { error });
      res.status(500).json({
        success: false,
        message: 'خطأ في تعليم جميع الإشعارات كمقروءة',
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
    }
  }

  /**
   * PATCH /api/notifications/:id/action
   * تحديث حالة الإجراء المطلوب
   * 🔒 Validation: validateNotificationIdParams + validateUpdateAction middleware
   * 
   * فايدة validateNotificationIdParams:
   * - التحقق من صحة معرف الإشعار في URL params
   * 
   * فايدة validateUpdateAction:
   * - التحقق من حالة الإكمال (completed) boolean مطلوب
   * - التحقق من معرف المستخدم
   */
  async updateAction(req: Request, res: Response): Promise<void> {
    try {
      // استخدام الـ validation functions للتحقق من البيانات
      validateNotificationIdParams(req, res, () => {});
      validateUpdateAction(req, res, () => {});

      const notificationId = req.params['id'];
      const { completed, user_id } = req.body;

      logger.info('⚡ PATCH /api/notifications/:id/action - Update action', { 
        notificationId, 
        completed, 
        user_id 
      });

      // التحقق من المعرفات المطلوبة
      if (!notificationId) {
        res.status(400).json({
          success: false,
          message: 'معرف الإشعار مطلوب في URL',
          error_code: 'MISSING_NOTIFICATION_ID'
        });
        return;
      }

      if (!user_id) {
        res.status(400).json({
          success: false,
          message: 'user_id مطلوب في body',
          error_code: 'MISSING_USER_ID'
        });
        return;
      }

      if (completed === undefined) {
        res.status(400).json({
          success: false,
          message: 'completed مطلوب في body',
          error_code: 'MISSING_COMPLETED_STATUS'
        });
        return;
      }

      const notification = await this.notificationService.updateNotificationAction(
        notificationId,
        Boolean(completed),
        user_id
      );

      res.status(200).json({
        success: true,
        message: completed ? 'تم إكمال الإجراء المطلوب' : 'تم إلغاء إكمال الإجراء',
        data: notification
      });

      logger.info('✅ Notification action updated via API', { 
        notificationId, 
        completed, 
        user_id 
      });
    } catch (error) {
      logger.error('❌ Error in updateAction API', { error });
      res.status(500).json({
        success: false,
        message: 'خطأ في تحديث حالة الإجراء',
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
    }
  }

  // ======================================
  // 🔍 جلب الإشعارات
  // ======================================

  /**
   * GET /api/notifications
   * جلب إشعارات المستخدم مع إمكانية البحث والفلترة
   * 🔒 Validation: validateSearchNotifications middleware
   * 
   * فايدة validateSearchNotifications:
   * - التحقق من معرف المستخدم مع Pagination
   * - التحقق من فلاتر البحث (نوع، أولوية، عاجل، يتطلب إجراء)
   * - التحقق من معرفات الحملات والمهام والبراندات
   * - التحقق من معايير Pagination المتقدمة
   */
  async getNotifications(req: Request, res: Response): Promise<void> {
    try {
      // استخدام الـ validation function للتحقق من البيانات
      validateSearchNotifications(req, res, () => {});

      logger.info('🔍 GET /api/notifications - Get notifications');

      const {
        user_id,
        limit,
        offset,
        unread_only,
        type,
        priority,
        is_urgent,
        action_required,
        campaign_id,
        task_id,
        brand_id
      } = req.query;

      if (!user_id) {
        res.status(400).json({
          success: false,
          message: 'user_id مطلوب في query parameters',
          error_code: 'MISSING_USER_ID'
        });
        return;
      }

      let notifications;

      // إذا كان البحث بسيط (فقط إشعارات المستخدم)
      if (!type && !priority && !is_urgent && !action_required && !campaign_id && !task_id && !brand_id) {
        // بناء options مع تجنب undefined values
        const options: { limit?: number; offset?: number; unreadOnly?: boolean } = {};
        
        if (limit) {
          const limitNum = parseInt(limit as string);
          if (!isNaN(limitNum)) options.limit = limitNum;
        }
        
        if (offset) {
          const offsetNum = parseInt(offset as string);
          if (!isNaN(offsetNum)) options.offset = offsetNum;
        }
        
        if (unread_only === 'true') options.unreadOnly = true;

        notifications = await this.notificationService.getUserNotifications(
          user_id as ID,
          options
        );
      } else {
        // البحث المتقدم
        const searchOptions: NotificationSearchOptions = {
          recipient_id: user_id as ID
        };

        // إضافة خيارات البحث فقط إذا كانت محددة
        if (type) searchOptions.type = type as NotificationType;
        if (priority) searchOptions.priority = priority as PriorityLevel;
        if (is_urgent === 'true') searchOptions.is_urgent = true;
        if (is_urgent === 'false') searchOptions.is_urgent = false;
        if (action_required === 'true') searchOptions.action_required = true;
        if (action_required === 'false') searchOptions.action_required = false;
        if (campaign_id) searchOptions.campaign_id = campaign_id as ID;
        if (task_id) searchOptions.task_id = task_id as ID;
        if (brand_id) searchOptions.brand_id = brand_id as ID;

        const queryOptions: { limit?: number; offset?: number } = {};
        
        if (limit) {
          const limitNum = parseInt(limit as string);
          if (!isNaN(limitNum)) queryOptions.limit = limitNum;
        }
        
        if (offset) {
          const offsetNum = parseInt(offset as string);
          if (!isNaN(offsetNum)) queryOptions.offset = offsetNum;
        }

        notifications = await this.notificationService.searchNotifications(
          searchOptions,
          queryOptions
        );
      }

      // استخدام validatePaginatedNotifications للتحقق من معايير Pagination المحسنة
      // فايدة: ضمان صحة معايير الترتيب والاتجاه مع معرف المستخدم
      validatePaginatedNotifications(req, res, () => {});

      res.status(200).json({
        success: true,
        message: 'تم جلب الإشعارات بنجاح',
        data: notifications,
        count: notifications.length
      });

      logger.info('✅ Notifications retrieved via API', { 
        user_id, 
        count: notifications.length 
      });
    } catch (error) {
      logger.error('❌ Error in getNotifications API', { error });
      res.status(500).json({
        success: false,
        message: 'خطأ في جلب الإشعارات',
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
    }
  }

  /**
   * GET /api/notifications/:id
   * جلب إشعار محدد
   */
  async getNotificationById(req: Request, res: Response): Promise<void> {
    try {
      const notificationId = req.params['id'];

      logger.info('🔍 GET /api/notifications/:id - Get notification by ID', { notificationId });

      if (!notificationId) {
        res.status(400).json({
          success: false,
          message: 'معرف الإشعار مطلوب في URL',
          error_code: 'MISSING_NOTIFICATION_ID'
        });
        return;
      }

      // ملاحظة: يمكن إضافة method getNotificationById في service لاحقاً
      res.status(501).json({
        success: false,
        message: 'هذه الوظيفة قيد التطوير',
        error_code: 'NOT_IMPLEMENTED_YET'
      });

      logger.warn('⚠️ getNotificationById not implemented yet', { notificationId });
    } catch (error) {
      logger.error('❌ Error in getNotificationById API', { error });
      res.status(500).json({
        success: false,
        message: 'خطأ في جلب الإشعار',
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
    }
  }

  /**
   * GET /api/notifications/urgent
   * جلب الإشعارات العاجلة للمستخدم
   */
  async getUrgentNotifications(req: Request, res: Response): Promise<void> {
    try {
      const { user_id } = req.query;

      logger.info('🚨 GET /api/notifications/urgent - Get urgent notifications', { user_id });

      if (!user_id) {
        res.status(400).json({
          success: false,
          message: 'user_id مطلوب في query parameters',
          error_code: 'MISSING_USER_ID'
        });
        return;
      }

      const notifications = await this.notificationService.getUrgentNotifications(
        user_id as ID
      );

      res.status(200).json({
        success: true,
        message: 'تم جلب الإشعارات العاجلة بنجاح',
        data: notifications,
        count: notifications.length
      });

      logger.info('✅ Urgent notifications retrieved via API', { 
        user_id, 
        count: notifications.length 
      });
    } catch (error) {
      logger.error('❌ Error in getUrgentNotifications API', { error });
      res.status(500).json({
        success: false,
        message: 'خطأ في جلب الإشعارات العاجلة',
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
    }
  }

  /**
   * GET /api/notifications/action-required
   * جلب الإشعارات التي تحتاج إجراء
   */
  async getActionRequiredNotifications(req: Request, res: Response): Promise<void> {
    try {
      const { user_id } = req.query;

      logger.info('⚡ GET /api/notifications/action-required - Get action required notifications', { user_id });

      const notifications = await this.notificationService.getActionRequiredNotifications(
        user_id as ID | undefined
      );

      res.status(200).json({
        success: true,
        message: 'تم جلب الإشعارات التي تحتاج إجراء بنجاح',
        data: notifications,
        count: notifications.length
      });

      logger.info('✅ Action required notifications retrieved via API', { 
        user_id, 
        count: notifications.length 
      });
    } catch (error) {
      logger.error('❌ Error in getActionRequiredNotifications API', { error });
      res.status(500).json({
        success: false,
        message: 'خطأ في جلب الإشعارات التي تحتاج إجراء',
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
    }
  }

  // ======================================
  // 📊 الإحصائيات والتحليلات
  // ======================================

  /**
   * GET /api/notifications/stats
   * جلب إحصائيات الإشعارات العامة
   * 🔒 Validation: validateNotificationStats middleware
   * 
   * فايدة validateNotificationStats:
   * - التحقق من تاريخ البداية والنهاية (اختياري)
   * - التحقق من معرف المستخدم (اختياري)
   * - التحقق من معايير Pagination للإحصائيات
   */
  async getStats(req: Request, res: Response): Promise<void> {
    try {
      // استخدام الـ validation function للتحقق من البيانات
      validateNotificationStats(req, res, () => {});

      logger.info('📊 GET /api/notifications/stats - Get notification statistics');

      const stats = await this.notificationService.getNotificationStats();

      res.status(200).json({
        success: true,
        message: 'تم جلب إحصائيات الإشعارات بنجاح',
        data: stats
      });

      logger.info('✅ Notification statistics retrieved via API', { 
        totalNotifications: stats.total_notifications,
        readRate: stats.read_rate
      });
    } catch (error) {
      logger.error('❌ Error in getStats API', { error });
      res.status(500).json({
        success: false,
        message: 'خطأ في جلب إحصائيات الإشعارات',
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
    }
  }

  /**
   * GET /api/notifications/user/:userId/activity
   * جلب إحصائيات نشاط المستخدم في الإشعارات
   * 🔒 Validation: validateUserIdParams middleware
   * 
   * فايدة validateUserIdParams:
   * - التحقق من صحة معرف المستخدم في URL params
   * - ضمان أن المعرف يتبع تنسيق ID الصحيح
   * - منع الهجمات عبر معرفات غير صحيحة
   */
  async getUserActivity(req: Request, res: Response): Promise<void> {
    try {
      // استخدام الـ validation function للتحقق من البيانات
      validateUserIdParams(req, res, () => {});

      const userId = req.params['userId'];

      logger.info('📊 GET /api/notifications/user/:userId/activity - Get user activity', { userId });

      if (!userId) {
        res.status(400).json({
          success: false,
          message: 'معرف المستخدم مطلوب في URL',
          error_code: 'MISSING_USER_ID'
        });
        return;
      }

      const activity = await this.notificationService.getUserNotificationActivity(userId);

      res.status(200).json({
        success: true,
        message: 'تم جلب نشاط المستخدم في الإشعارات بنجاح',
        data: activity
      });

      logger.info('✅ User notification activity retrieved via API', { 
        userId,
        totalReceived: activity.total_received,
        readRate: activity.read_rate
      });
    } catch (error) {
      logger.error('❌ Error in getUserActivity API', { error });
      res.status(500).json({
        success: false,
        message: 'خطأ في جلب نشاط المستخدم',
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
    }
  }

  /**
   * GET /api/notifications/:id/effectiveness
   * تحليل فعالية إشعار محدد
   */
  async getEffectivenessAnalysis(req: Request, res: Response): Promise<void> {
    try {
      const notificationId = req.params['id'];

      logger.info('📈 GET /api/notifications/:id/effectiveness - Get effectiveness analysis', { 
        notificationId 
      });

      if (!notificationId) {
        res.status(400).json({
          success: false,
          message: 'معرف الإشعار مطلوب في URL',
          error_code: 'MISSING_NOTIFICATION_ID'
        });
        return;
      }

      const analysis = await this.notificationService.analyzeNotificationEffectiveness(
        notificationId
      );

      res.status(200).json({
        success: true,
        message: 'تم تحليل فعالية الإشعار بنجاح',
        data: analysis
      });

      logger.info('✅ Notification effectiveness analyzed via API', { 
        notificationId,
        effectivenessScore: analysis.effectiveness_score,
        engagementLevel: analysis.engagement_level
      });
    } catch (error) {
      logger.error('❌ Error in getEffectivenessAnalysis API', { error });
      res.status(500).json({
        success: false,
        message: 'خطأ في تحليل فعالية الإشعار',
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
    }
  }

  // ======================================
  // 🗑️ حذف الإشعارات
  // ======================================

  /**
   * DELETE /api/notifications/:id
   * حذف إشعار محدد
   * 🔒 Validation: validateNotificationIdParams + validateDeleteNotification middleware
   * 
   * فايدة validateNotificationIdParams:
   * - التحقق من صحة معرف الإشعار في URL params
   * 
   * فايدة validateDeleteNotification:
   * - التحقق من معرف المستخدم في body
   * - ضمان أمان عملية الحذف
   */
  async deleteNotification(req: Request, res: Response): Promise<void> {
    try {
      // استخدام الـ validation functions للتحقق من البيانات
      validateNotificationIdParams(req, res, () => {});
      validateDeleteNotification(req, res, () => {});

      const notificationId = req.params['id'];
      const { user_id } = req.body;

      logger.info('🗑️ DELETE /api/notifications/:id - Delete notification', { 
        notificationId, 
        user_id 
      });

      // التحقق من المعرفات المطلوبة
      if (!notificationId) {
        res.status(400).json({
          success: false,
          message: 'معرف الإشعار مطلوب في URL',
          error_code: 'MISSING_NOTIFICATION_ID'
        });
        return;
      }

      if (!user_id) {
        res.status(400).json({
          success: false,
          message: 'user_id مطلوب في body',
          error_code: 'MISSING_USER_ID'
        });
        return;
      }

      await this.notificationService.deleteNotification(notificationId, user_id);

      res.status(200).json({
        success: true,
        message: 'تم حذف الإشعار بنجاح',
        data: {
          deleted_notification_id: notificationId,
          user_id
        }
      });

      logger.info('✅ Notification deleted via API', { notificationId, user_id });
    } catch (error) {
      logger.error('❌ Error in deleteNotification API', { error });
      res.status(500).json({
        success: false,
        message: 'خطأ في حذف الإشعار',
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
    }
  }

  /**
   * DELETE /api/notifications/cleanup/expired
   * حذف الإشعارات المنتهية الصلاحية
   */
  async cleanupExpiredNotifications(req: Request, res: Response): Promise<void> {
    try {
      logger.info('🧹 DELETE /api/notifications/cleanup/expired - Cleanup expired notifications');

      const result = await this.notificationService.cleanupExpiredNotifications();

      res.status(200).json({
        success: true,
        message: `تم حذف ${result.deletedCount} إشعار منتهي الصلاحية`,
        data: result
      });

      logger.info('✅ Expired notifications cleaned up via API', { 
        deletedCount: result.deletedCount 
      });
    } catch (error) {
      logger.error('❌ Error in cleanupExpiredNotifications API', { error });
      res.status(500).json({
        success: false,
        message: 'خطأ في حذف الإشعارات المنتهية الصلاحية',
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
    }
  }
}
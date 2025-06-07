/**
 * 🔔 Notification Validators - التحقق من بيانات الإشعارات
 * ==========================================================
 * 
 * جميع schemas التحقق المطلوبة لـ NotificationController
 * مع رسائل خطأ باللغة العربية وتحقق متقدم
 * 
 * 📅 تاريخ الإنشاء: ديسمبر 2024
 * 👨‍💻 المطور: علي جودت
 */

import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { 
  BaseValidator, 
  IDSchema, 
  PaginationSchema,
  DateStringSchema
} from './BaseValidator';

// تعريف قيم الـ enums كـ const arrays لاستخدامها في validation
const NOTIFICATION_TYPES = [
  'system',
  'campaign_update',
  'task_assignment',
  'task_completion',
  'brand_approval',
  'user_registration',
  'payment_received',
  'equipment_maintenance',
  'deadline_reminder',
  'marketing_campaign',
  'brand_message',
  'photographer_booking',
  'content_approval',
  'role_assignment'
] as const;

const PRIORITY_LEVELS = ['low', 'medium', 'high', 'urgent'] as const;

const USER_ROLES = [
  'super_admin',
  'marketing_coordinator', 
  'brand_coordinator',
  'photographer',
  'new_user'
] as const;

const REPEAT_TYPES = ['none', 'daily', 'weekly', 'monthly', 'yearly'] as const;

// ======================================
// 🎯 Validation Schemas للإشعارات
// ======================================

/**
 * إنشاء إشعار جديد
 */
export const CreateNotificationSchema = z.object({
  type: z.enum(NOTIFICATION_TYPES, {
    errorMap: () => ({ message: "نوع الإشعار غير صحيح" })
  }),
  
  priority: z.enum(PRIORITY_LEVELS, {
    errorMap: () => ({ message: "مستوى الأولوية غير صحيح" })
  }),
  
  title: z.string({
    required_error: "عنوان الإشعار مطلوب"
  }).min(3, "العنوان يجب أن يكون على الأقل 3 أحرف").max(200, "العنوان طويل جداً"),
  
  message: z.string({
    required_error: "نص الإشعار مطلوب"
  }).min(5, "النص يجب أن يكون على الأقل 5 أحرف").max(1000, "النص طويل جداً"),
  
  recipient_id: IDSchema,
  
  recipient_role: z.enum(USER_ROLES, {
    errorMap: () => ({ message: "دور المستقبل غير صحيح" })
  }),
  
  // الحقول الاختيارية
  sender_id: IDSchema.optional(),
  sender_name: z.string().min(2).max(100).optional(),
  is_urgent: z.boolean().optional(),
  campaign_id: IDSchema.optional(),
  task_id: IDSchema.optional(),
  brand_id: IDSchema.optional(),
  action_required: z.boolean().optional(),
  action_url: z.string().url("رابط الإجراء غير صحيح").optional(),
  action_deadline: DateStringSchema.optional(),
  expires_at: DateStringSchema.optional(),
  attachment_url: z.string().url("رابط المرفق غير صحيح").optional(),
  attachment_name: z.string().min(1).max(255).optional()
});

/**
 * إرسال إشعارات جماعية
 */
export const BulkNotificationSchema = z.object({
  type: z.enum(NOTIFICATION_TYPES, {
    errorMap: () => ({ message: "نوع الإشعار غير صحيح" })
  }),
  
  priority: z.enum(PRIORITY_LEVELS, {
    errorMap: () => ({ message: "مستوى الأولوية غير صحيح" })
  }),
  
  title: z.string({
    required_error: "عنوان الإشعار مطلوب"
  }).min(3, "العنوان يجب أن يكون على الأقل 3 أحرف").max(200, "العنوان طويل جداً"),
  
  message: z.string({
    required_error: "نص الإشعار مطلوب"
  }).min(5, "النص يجب أن يكون على الأقل 5 أحرف").max(1000, "النص طويل جداً"),
  
  // يجب تحديد إما recipient_role أو recipient_ids
  recipient_role: z.enum(USER_ROLES, {
    errorMap: () => ({ message: "دور المستقبل غير صحيح" })
  }).optional(),
  
  recipient_ids: z.array(IDSchema).min(1, "يجب تحديد مستقبل واحد على الأقل").optional(),
  
  // الحقول الاختيارية
  sender_id: IDSchema.optional(),
  sender_name: z.string().min(2).max(100).optional(),
  is_urgent: z.boolean().optional(),
  campaign_id: IDSchema.optional(),
  task_id: IDSchema.optional(),
  brand_id: IDSchema.optional(),
  action_required: z.boolean().optional(),
  action_url: z.string().url("رابط الإجراء غير صحيح").optional(),
  action_deadline: DateStringSchema.optional(),
  expires_at: DateStringSchema.optional(),
  attachment_url: z.string().url("رابط المرفق غير صحيح").optional(),
  attachment_name: z.string().min(1).max(255).optional()
}).refine(
  data => data.recipient_role || (data.recipient_ids && data.recipient_ids.length > 0),
  {
    message: "يجب تحديد إما recipient_role أو recipient_ids",
    path: ["recipient_role"]
  }
);

/**
 * جدولة إشعار
 */
export const ScheduleNotificationSchema = z.object({
  type: z.enum(NOTIFICATION_TYPES, {
    errorMap: () => ({ message: "نوع الإشعار غير صحيح" })
  }),
  
  priority: z.enum(PRIORITY_LEVELS, {
    errorMap: () => ({ message: "مستوى الأولوية غير صحيح" })
  }),
  
  title: z.string({
    required_error: "عنوان الإشعار مطلوب"
  }).min(3, "العنوان يجب أن يكون على الأقل 3 أحرف").max(200, "العنوان طويل جداً"),
  
  message: z.string({
    required_error: "نص الإشعار مطلوب"
  }).min(5, "النص يجب أن يكون على الأقل 5 أحرف").max(1000, "النص طويل جداً"),
  
  recipient_id: IDSchema,
  
  recipient_role: z.enum(USER_ROLES, {
    errorMap: () => ({ message: "دور المستقبل غير صحيح" })
  }),
  
  scheduled_at: DateStringSchema,
  
  repeat_type: z.enum(REPEAT_TYPES, {
    errorMap: () => ({ message: "نوع التكرار غير صحيح" })
  }).optional(),
  
  repeat_count: z.number().int().min(1).max(365).optional(),
  
  // الحقول الاختيارية
  sender_id: IDSchema.optional(),
  sender_name: z.string().min(2).max(100).optional(),
  is_urgent: z.boolean().optional(),
  campaign_id: IDSchema.optional(),
  task_id: IDSchema.optional(),
  brand_id: IDSchema.optional(),
  action_required: z.boolean().optional(),
  action_url: z.string().url("رابط الإجراء غير صحيح").optional(),
  action_deadline: DateStringSchema.optional(),
  expires_at: DateStringSchema.optional(),
  attachment_url: z.string().url("رابط المرفق غير صحيح").optional(),
  attachment_name: z.string().min(1).max(255).optional()
});

/**
 * تعليم كمقروء
 */
export const MarkAsReadSchema = z.object({
  user_id: IDSchema
});

/**
 * تحديث حالة الإجراء
 */
export const UpdateActionSchema = z.object({
  completed: z.boolean({
    required_error: "حالة الإكمال مطلوبة"
  }),
  user_id: IDSchema
});

/**
 * حذف إشعار
 */
export const DeleteNotificationSchema = z.object({
  user_id: IDSchema
});

/**
 * معايير البحث في الإشعارات مع Pagination
 */
export const SearchNotificationsSchema = PaginationSchema.extend({
  user_id: IDSchema,
  unread_only: z.enum(['true', 'false']).optional(),
  type: z.enum(NOTIFICATION_TYPES).optional(),
  priority: z.enum(PRIORITY_LEVELS).optional(),
  is_urgent: z.enum(['true', 'false']).optional(),
  action_required: z.enum(['true', 'false']).optional(),
  campaign_id: IDSchema.optional(),
  task_id: IDSchema.optional(),
  brand_id: IDSchema.optional()
});

/**
 * معايير الإحصائيات مع Pagination
 */
export const NotificationStatsSchema = PaginationSchema.extend({
  start_date: DateStringSchema.optional(),
  end_date: DateStringSchema.optional(),
  user_id: IDSchema.optional()
});

/**
 * معايير جلب الإشعارات مع Pagination محسن
 */
export const PaginatedNotificationsSchema = PaginationSchema.extend({
  user_id: IDSchema,
  sort_by: z.enum(['created_at', 'updated_at', 'priority', 'read_at']).optional(),
  sort_order: z.enum(['asc', 'desc']).optional()
});

/**
 * معرف الإشعار في params
 */
export const NotificationIdParamsSchema = z.object({
  id: IDSchema
});

/**
 * معرف المستخدم في params
 */
export const UserIdParamsSchema = z.object({
  userId: IDSchema
});

// ======================================
// 🛠️ Middleware Functions
// ======================================

/**
 * Middleware للتحقق من بيانات إنشاء إشعار
 */
export const validateCreateNotification = BaseValidator.createValidationMiddleware(
  CreateNotificationSchema,
  'body'
);

/**
 * Middleware للتحقق من بيانات الإشعارات الجماعية
 */
export const validateBulkNotification = BaseValidator.createValidationMiddleware(
  BulkNotificationSchema,
  'body'
);

/**
 * Middleware للتحقق من بيانات جدولة الإشعار
 */
export const validateScheduleNotification = BaseValidator.createValidationMiddleware(
  ScheduleNotificationSchema,
  'body'
);

/**
 * Middleware للتحقق من بيانات تعليم كمقروء
 */
export const validateMarkAsRead = BaseValidator.createValidationMiddleware(
  MarkAsReadSchema,
  'body'
);

/**
 * Middleware للتحقق من بيانات تحديث الإجراء
 */
export const validateUpdateAction = BaseValidator.createValidationMiddleware(
  UpdateActionSchema,
  'body'
);

/**
 * Middleware للتحقق من بيانات حذف الإشعار
 */
export const validateDeleteNotification = BaseValidator.createValidationMiddleware(
  DeleteNotificationSchema,
  'body'
);

/**
 * Middleware للتحقق من معرف الإشعار في params
 */
export const validateNotificationIdParams = BaseValidator.createValidationMiddleware(
  NotificationIdParamsSchema,
  'params'
);

/**
 * Middleware للتحقق من معرف المستخدم في params
 */
export const validateUserIdParams = BaseValidator.createValidationMiddleware(
  UserIdParamsSchema,
  'params'
);

/**
 * Middleware للتحقق من معايير البحث المتقدم
 */
export const validateSearchNotifications = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const validated = SearchNotificationsSchema.parse(req.query);
    req.query = validated as any;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'معايير البحث غير صحيحة',
        errors: BaseValidator.formatZodErrors(error)
      });
      return;
    }
    next(error);
  }
};

/**
 * Middleware للتحقق من معايير الإحصائيات مع Pagination
 */
export const validateNotificationStats = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const validated = NotificationStatsSchema.parse(req.query);
    req.query = validated as any;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'معايير الإحصائيات غير صحيحة',
        errors: BaseValidator.formatZodErrors(error)
      });
      return;
    }
    next(error);
  }
};

/**
 * Middleware للتحقق من معايير Pagination للإشعارات
 */
export const validatePaginatedNotifications = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const validated = PaginatedNotificationsSchema.parse(req.query);
    req.query = validated as any;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'معايير Pagination للإشعارات غير صحيحة',
        errors: BaseValidator.formatZodErrors(error)
      });
      return;
    }
    next(error);
  }
}; 
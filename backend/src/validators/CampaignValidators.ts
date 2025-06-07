/**
 * 📱 Campaign Validators - التحقق من بيانات الحملات
 * =====================================================
 * 
 * جميع schemas التحقق المطلوبة لـ CampaignController
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
  PositiveNumberSchema,
  CurrencySchema,
  PaginationSchema,
  DateStringSchema
} from './BaseValidator';

// تعريف قيم الأنواع والحالات كـ const arrays لاستخدامها في validation
const CAMPAIGN_STATUSES = [
  'draft',
  'scheduled', 
  'active',
  'paused',
  'completed',
  'cancelled'
] as const;

const CAMPAIGN_TYPES = [
  'product_launch',
  'seasonal',
  'promotional', 
  'brand_awareness',
  'event'
] as const;

const PRIORITY_LEVELS = [
  'low',
  'medium',
  'high',
  'urgent'
] as const;

const TASK_STATUSES = [
  'pending',
  'assigned',
  'in_progress',
  'review',
  'completed',
  'cancelled'
] as const;

// ======================================
// 🎯 Validation Schemas للحملات
// ======================================

/**
 * Timeline للحملة
 */
export const CampaignTimelineSchema = z.object({
  start_date: DateStringSchema,
  end_date: DateStringSchema
}).refine(
  (data) => new Date(data.end_date) > new Date(data.start_date),
  {
    message: "تاريخ الانتهاء يجب أن يكون بعد تاريخ البداية",
    path: ["end_date"]
  }
);

/**
 * معلومات المهمة
 */
export const TaskInfoSchema = z.object({
  title: z.string({
    required_error: "عنوان المهمة مطلوب"
  }).min(3, "عنوان المهمة يجب أن يكون على الأقل 3 أحرف"),
  
  description: z.string({
    required_error: "وصف المهمة مطلوب"
  }).min(10, "وصف المهمة يجب أن يكون على الأقل 10 أحرف"),
  
  assigned_photographer: IDSchema.optional(),
  
  status: z.enum(TASK_STATUSES, {
    errorMap: () => ({ message: "حالة المهمة غير صحيحة" })
  }),
  
  priority: z.enum(PRIORITY_LEVELS, {
    errorMap: () => ({ message: "أولوية المهمة غير صحيحة" })
  }),
  
  due_date: DateStringSchema,
  
  progress_percentage: z.number({
    required_error: "نسبة التقدم مطلوبة"
  }).min(0, "نسبة التقدم لا يمكن أن تكون أقل من 0")
    .max(100, "نسبة التقدم لا يمكن أن تكون أكثر من 100")
});

/**
 * إنشاء حملة جديدة
 */
export const CreateCampaignSchema = z.object({
  name: z.string({
    required_error: "اسم الحملة مطلوب"
  }).min(3, "اسم الحملة يجب أن يكون على الأقل 3 أحرف")
    .max(100, "اسم الحملة لا يمكن أن يكون أكثر من 100 حرف"),
  
  description: z.string({
    required_error: "وصف الحملة مطلوب"
  }).min(10, "وصف الحملة يجب أن يكون على الأقل 10 أحرف")
    .max(1000, "وصف الحملة لا يمكن أن يكون أكثر من 1000 حرف"),
  
  brand_id: IDSchema,
  
  type: z.enum(CAMPAIGN_TYPES, {
    errorMap: () => ({ message: "نوع الحملة غير صحيح" })
  }),
  
  priority: z.enum(PRIORITY_LEVELS, {
    errorMap: () => ({ message: "أولوية الحملة غير صحيحة" })
  }),
  
  timeline: CampaignTimelineSchema,
  
  target_completion_date: DateStringSchema,
  
  total_content_pieces: z.number({
    required_error: "عدد قطع المحتوى مطلوب"
  }).min(1, "يجب أن يكون هناك قطعة محتوى واحدة على الأقل"),
  
  content_requirements: z.array(z.string()).min(1, "يجب تحديد متطلبات المحتوى"),
  
  budget: PositiveNumberSchema,
  currency: CurrencySchema,
  
  enable_smart_assignment: z.boolean().default(true),
  auto_scheduling: z.boolean().default(false),
  
  key_milestones: z.array(z.string()).optional(),
  
  created_by: IDSchema
}).refine(
  (data) => new Date(data.target_completion_date) >= new Date(data.timeline.end_date),
  {
    message: "تاريخ الإنجاز المستهدف يجب أن يكون في أو بعد تاريخ انتهاء الحملة",
    path: ["target_completion_date"]
  }
);

/**
 * البحث عن حملة
 */
export const GetCampaignSchema = z.object({
  id: IDSchema.optional(),
  brand_id: IDSchema.optional(),
  assigned_photographer: IDSchema.optional(),
  name: z.string().optional()
}).refine(
  (data) => data.id || data.brand_id || data.assigned_photographer || data.name,
  {
    message: "يجب تقديم معرف الحملة أو معرف البراند أو معرف المصور أو الاسم",
    path: ["search_criteria"]
  }
);

/**
 * البحث المتقدم في الحملات
 */
export const SearchCampaignsSchema = PaginationSchema.extend({
  search: z.string().optional(),
  searchTerm: z.string().optional(),
  status: z.enum(CAMPAIGN_STATUSES).optional(),
  type: z.enum(CAMPAIGN_TYPES).optional(),
  priority: z.enum(PRIORITY_LEVELS).optional(),
  brand_id: IDSchema.optional(),
  assigned_photographer: IDSchema.optional(),
  created_by: IDSchema.optional(),
  min_budget: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
  max_budget: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
  currency: CurrencySchema.optional(),
  start_date_from: DateStringSchema.optional(),
  start_date_to: DateStringSchema.optional(),
  end_date_from: DateStringSchema.optional(),
  end_date_to: DateStringSchema.optional()
});

/**
 * معرف الحملة في params
 */
export const CampaignParamsSchema = z.object({
  campaignId: IDSchema
});

/**
 * تحديث حالة الحملة
 */
export const UpdateCampaignStatusSchema = z.object({
  status: z.enum(CAMPAIGN_STATUSES, {
    errorMap: () => ({ message: "حالة الحملة غير صحيحة" })
  }),
  updated_by: IDSchema,
  reason: z.string().optional()
});

/**
 * تعيين مصور للحملة
 */
export const AssignPhotographerSchema = z.object({
  photographer_id: IDSchema,
  assigned_by: IDSchema,
  notes: z.string().optional()
});

/**
 * إنشاء مهام الحملة
 */
export const CreateCampaignTasksSchema = z.object({
  tasks: z.array(TaskInfoSchema).min(1, "يجب إنشاء مهمة واحدة على الأقل"),
  created_by: IDSchema
});

/**
 * تخصيص مهمة لمصور
 */
export const AssignTaskToPhotographerSchema = z.object({
  photographer_id: IDSchema,
  assigned_by: IDSchema,
  due_date: DateStringSchema.optional(),
  notes: z.string().optional()
});

/**
 * تحديث حالة المهمة
 */
export const UpdateTaskStatusSchema = z.object({
  status: z.enum(TASK_STATUSES, {
    errorMap: () => ({ message: "حالة المهمة غير صحيحة" })
  }),
  progress_percentage: z.number().min(0).max(100).optional(),
  updated_by: IDSchema,
  notes: z.string().optional()
});

/**
 * معرف المصور في params
 */
export const PhotographerParamsSchema = z.object({
  photographerId: IDSchema
});

/**
 * معرف المهمة في params
 */
export const TaskParamsSchema = z.object({
  taskTitle: z.string({
    required_error: "عنوان المهمة مطلوب"
  })
});

// ======================================
// 🛠️ Middleware Functions
// ======================================

/**
 * Middleware للتحقق من بيانات إنشاء الحملة
 */
export const validateCreateCampaign = BaseValidator.createValidationMiddleware(
  CreateCampaignSchema,
  'body'
);

/**
 * Middleware للتحقق من معايير البحث عن الحملة
 */
export const validateGetCampaign = BaseValidator.createValidationMiddleware(
  GetCampaignSchema,
  'query'
);

/**
 * Middleware للتحقق من معايير البحث المتقدم
 */
export const validateSearchCampaigns = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const validated = SearchCampaignsSchema.parse(req.query);
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
 * Middleware للتحقق من معرف الحملة في params
 */
export const validateCampaignParams = BaseValidator.createValidationMiddleware(
  CampaignParamsSchema,
  'params'
);

/**
 * Middleware للتحقق من بيانات تحديث الحالة
 */
export const validateUpdateCampaignStatus = BaseValidator.createValidationMiddleware(
  UpdateCampaignStatusSchema,
  'body'
);

/**
 * Middleware للتحقق من بيانات تعيين المصور
 */
export const validateAssignPhotographer = BaseValidator.createValidationMiddleware(
  AssignPhotographerSchema,
  'body'
);

/**
 * Middleware للتحقق من بيانات إنشاء المهام
 */
export const validateCreateCampaignTasks = BaseValidator.createValidationMiddleware(
  CreateCampaignTasksSchema,
  'body'
);

/**
 * Middleware للتحقق من بيانات تخصيص المهمة
 */
export const validateAssignTaskToPhotographer = BaseValidator.createValidationMiddleware(
  AssignTaskToPhotographerSchema,
  'body'
);

/**
 * Middleware للتحقق من بيانات تحديث حالة المهمة
 */
export const validateUpdateTaskStatus = BaseValidator.createValidationMiddleware(
  UpdateTaskStatusSchema,
  'body'
);

/**
 * Middleware للتحقق من معرف المصور في params
 */
export const validatePhotographerParams = BaseValidator.createValidationMiddleware(
  PhotographerParamsSchema,
  'params'
);

/**
 * Middleware للتحقق من معرف المهمة في params
 */
export const validateTaskParams = BaseValidator.createValidationMiddleware(
  TaskParamsSchema,
  'params'
);

// ======================================
// 🎯 Type Definitions
// ======================================

export type CreateCampaignInput = z.infer<typeof CreateCampaignSchema>;
export type GetCampaignInput = z.infer<typeof GetCampaignSchema>;
export type SearchCampaignsInput = z.infer<typeof SearchCampaignsSchema>;
export type CampaignParamsInput = z.infer<typeof CampaignParamsSchema>;
export type UpdateCampaignStatusInput = z.infer<typeof UpdateCampaignStatusSchema>;
export type AssignPhotographerInput = z.infer<typeof AssignPhotographerSchema>;
export type CreateCampaignTasksInput = z.infer<typeof CreateCampaignTasksSchema>;
export type AssignTaskToPhotographerInput = z.infer<typeof AssignTaskToPhotographerSchema>;
export type UpdateTaskStatusInput = z.infer<typeof UpdateTaskStatusSchema>;
export type PhotographerParamsInput = z.infer<typeof PhotographerParamsSchema>;
export type TaskParamsInput = z.infer<typeof TaskParamsSchema>;
export type CampaignTimelineInput = z.infer<typeof CampaignTimelineSchema>;
export type TaskInfoInput = z.infer<typeof TaskInfoSchema>;

export default BaseValidator; 
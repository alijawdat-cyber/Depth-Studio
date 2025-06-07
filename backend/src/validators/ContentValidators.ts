/**
 * 📁 Content Validators - التحقق من بيانات المحتوى
 * ==================================================
 * 
 * جميع schemas التحقق المطلوبة لـ ContentController
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
  PaginationSchema,
  DateStringSchema,
  MultiLanguageTextSchema
} from './BaseValidator';

// تعريف قيم الأنواع والحالات كـ const arrays لاستخدامها في validation
const CONTENT_TYPES = [
  'image',
  'video', 
  'graphic_design'
] as const;

const CONTENT_APPROVAL_STATUSES = [
  'pending',
  'approved',
  'rejected',
  'revision_needed'
] as const;

const USAGE_TYPES = [
  'exclusive',
  'non_exclusive',
  'limited',
  'unlimited'
] as const;

const CONTENT_CATEGORIES = [
  'product',
  'lifestyle',
  'fashion',
  'food',
  'architecture',
  'portrait',
  'event',
  'commercial',
  'artistic',
  'documentary'
] as const;

const CONTENT_STYLES = [
  'minimalist',
  'vintage',
  'modern',
  'classic',
  'artistic',
  'commercial',
  'editorial',
  'lifestyle',
  'documentary',
  'creative'
] as const;

// ======================================
// 🎯 Validation Schemas للمحتوى
// ======================================

/**
 * معلومات الملف الأساسية
 */
export const FileInfoSchema = z.object({
  filename: z.string({
    required_error: "اسم الملف مطلوب"
  }).min(1, "اسم الملف لا يمكن أن يكون فارغاً"),
  
  file_size: PositiveNumberSchema,
  
  file_format: z.string({
    required_error: "تنسيق الملف مطلوب"
  }).regex(/^\.(jpg|jpeg|png|gif|svg|mp4|mov|avi|mkv|webm|pdf|ai|psd)$/i, 
    "تنسيق الملف غير مدعوم"),
  
  file_url: z.string().url("رابط الملف غير صحيح"),
  
  thumbnail_url: z.string().url("رابط الصورة المصغرة غير صحيح").optional(),
  
  width: z.number().positive("العرض يجب أن يكون رقماً موجباً").optional(),
  height: z.number().positive("الارتفاع يجب أن يكون رقماً موجباً").optional(),
  duration: z.number().positive("المدة يجب أن تكون رقماً موجباً").optional()
});

/**
 * معلومات التصنيف والعلامات
 */
export const ContentClassificationSchema = z.object({
  category: z.enum(CONTENT_CATEGORIES, {
    errorMap: () => ({ message: "فئة المحتوى غير صحيحة" })
  }),
  
  tags: z.array(z.string().min(1, "العلامة لا يمكن أن تكون فارغة"))
    .min(1, "يجب إضافة علامة واحدة على الأقل")
    .max(20, "لا يمكن إضافة أكثر من 20 علامة"),
  
  style: z.array(z.enum(CONTENT_STYLES))
    .min(1, "يجب اختيار نمط واحد على الأقل")
    .max(5, "لا يمكن اختيار أكثر من 5 أنماط")
});

/**
 * رفع محتوى جديد
 */
export const UploadContentSchema = z.object({
  title: z.string({
    required_error: "عنوان المحتوى مطلوب"
  }).min(3, "عنوان المحتوى يجب أن يكون على الأقل 3 أحرف")
    .max(200, "عنوان المحتوى لا يمكن أن يكون أكثر من 200 حرف"),
  
  description: z.string({
    required_error: "وصف المحتوى مطلوب"
  }).min(10, "وصف المحتوى يجب أن يكون على الأقل 10 أحرف")
    .max(2000, "وصف المحتوى لا يمكن أن يكون أكثر من 2000 حرف"),
  
  type: z.enum(CONTENT_TYPES, {
    errorMap: () => ({ message: "نوع المحتوى غير صحيح" })
  }),
  
  brand_id: IDSchema,
  photographer_id: IDSchema,
  campaign_id: IDSchema.optional(),
  task_id: IDSchema.optional(),
  
  file_info: FileInfoSchema,
  classification: ContentClassificationSchema,
  
  usage_type: z.enum(USAGE_TYPES, {
    errorMap: () => ({ message: "نوع الاستخدام غير صحيح" })
  }),
  
  shooting_location: z.string().optional(),
  shooting_date: DateStringSchema.optional(),
  license_expiry: DateStringSchema.optional()
});

/**
 * البحث عن محتوى
 */
export const GetContentSchema = z.object({
  id: IDSchema.optional(),
  brand_id: IDSchema.optional(),
  photographer_id: IDSchema.optional(),
  campaign_id: IDSchema.optional(),
  title: z.string().optional()
}).refine(
  (data) => data.id || data.brand_id || data.photographer_id || data.campaign_id || data.title,
  {
    message: "يجب تقديم معرف المحتوى أو معرف البراند أو معرف المصور أو معرف الحملة أو العنوان",
    path: ["search_criteria"]
  }
);

/**
 * البحث المتقدم في المحتوى
 */
export const SearchContentSchema = PaginationSchema.extend({
  search: z.string().optional(),
  searchTerm: z.string().optional(),
  type: z.enum(CONTENT_TYPES).optional(),
  status: z.enum(CONTENT_APPROVAL_STATUSES).optional(),
  category: z.enum(CONTENT_CATEGORIES).optional(),
  usage_type: z.enum(USAGE_TYPES).optional(),
  brand_id: IDSchema.optional(),
  photographer_id: IDSchema.optional(),
  campaign_id: IDSchema.optional(),
  min_quality_score: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
  max_quality_score: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
  min_client_rating: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
  max_client_rating: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
  has_thumbnail: z.string().optional().transform(val => val === 'true' ? true : val === 'false' ? false : undefined),
  tags: z.string().optional().transform(val => val ? val.split(',') : undefined),
  styles: z.string().optional().transform(val => val ? val.split(',') : undefined),
  shooting_date_from: DateStringSchema.optional(),
  shooting_date_to: DateStringSchema.optional()
});

/**
 * معرف المحتوى في params
 */
export const ContentParamsSchema = z.object({
  contentId: IDSchema
});

/**
 * الموافقة على المحتوى
 */
export const ApproveContentSchema = z.object({
  approved_by: IDSchema,
  quality_score: z.number({
    required_error: "نقاط الجودة مطلوبة"
  }).min(0, "نقاط الجودة لا يمكن أن تكون أقل من 0")
    .max(100, "نقاط الجودة لا يمكن أن تكون أكثر من 100"),
  notes: z.string().optional()
});

/**
 * رفض المحتوى
 */
export const RejectContentSchema = z.object({
  rejected_by: IDSchema,
  rejection_reason: z.string({
    required_error: "سبب الرفض مطلوب"
  }).min(10, "سبب الرفض يجب أن يكون على الأقل 10 أحرف"),
  suggestions: z.string().optional()
});

/**
 * طلب تعديل على المحتوى
 */
export const RequestRevisionSchema = z.object({
  requested_by: IDSchema,
  revision_notes: z.string({
    required_error: "ملاحظات التعديل مطلوبة"
  }).min(10, "ملاحظات التعديل يجب أن تكون على الأقل 10 أحرف"),
  priority: z.enum(['low', 'medium', 'high', 'urgent'], {
    errorMap: () => ({ message: "أولوية التعديل غير صحيحة" })
  }).default('medium'),
  due_date: DateStringSchema.optional()
});

/**
 * تقييم العميل للمحتوى
 */
export const ClientRatingSchema = z.object({
  rating: z.number({
    required_error: "التقييم مطلوب"
  }).min(1, "التقييم يجب أن يكون بين 1 و 5")
    .max(5, "التقييم يجب أن يكون بين 1 و 5"),
  feedback: z.string().optional(),
  rated_by: IDSchema
});

/**
 * إنشاء فئة محتوى جديدة
 */
export const CreateContentCategorySchema = z.object({
  name: MultiLanguageTextSchema,
  description: MultiLanguageTextSchema,
  type: z.string({
    required_error: "نوع الفئة مطلوب"
  }).min(1, "نوع الفئة لا يمكن أن يكون فارغاً"),
  
  base_price: PositiveNumberSchema,
  estimated_hours: z.number({
    required_error: "الساعات المقدرة مطلوبة"
  }).min(0.5, "الساعات المقدرة يجب أن تكون على الأقل 0.5"),
  
  complexity_factor: z.number({
    required_error: "عامل التعقيد مطلوب"
  }).min(0.1, "عامل التعقيد يجب أن يكون على الأقل 0.1")
    .max(5, "عامل التعقيد لا يمكن أن يكون أكثر من 5"),
  
  default_requirements: z.array(z.string()).min(1, "يجب تحديد متطلبات افتراضية"),
  
  sort_order: z.number().min(1, "ترتيب الفئة يجب أن يكون رقماً موجباً").optional(),
  
  created_by: IDSchema
});

/**
 * اقتراح فئة للمحتوى
 */
export const SuggestCategorySchema = z.object({
  content_type: z.enum(CONTENT_TYPES, {
    errorMap: () => ({ message: "نوع المحتوى غير صحيح" })
  }),
  file_properties: z.object({
    width: z.number().optional(),
    height: z.number().optional(),
    duration: z.number().optional(),
    file_size: z.number().optional()
  }).optional(),
  description: z.string().optional(),
  photographer_specializations: z.array(z.string()).optional()
});

// ======================================
// 🛠️ Middleware Functions
// ======================================

/**
 * Middleware للتحقق من بيانات رفع المحتوى
 */
export const validateUploadContent = BaseValidator.createValidationMiddleware(
  UploadContentSchema,
  'body'
);

/**
 * Middleware للتحقق من معايير البحث عن المحتوى
 */
export const validateGetContent = BaseValidator.createValidationMiddleware(
  GetContentSchema,
  'query'
);

/**
 * Middleware للتحقق من معايير البحث المتقدم
 */
export const validateSearchContent = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const validated = SearchContentSchema.parse(req.query);
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
 * Middleware للتحقق من معرف المحتوى في params
 */
export const validateContentParams = BaseValidator.createValidationMiddleware(
  ContentParamsSchema,
  'params'
);

/**
 * Middleware للتحقق من بيانات الموافقة على المحتوى
 */
export const validateApproveContent = BaseValidator.createValidationMiddleware(
  ApproveContentSchema,
  'body'
);

/**
 * Middleware للتحقق من بيانات رفض المحتوى
 */
export const validateRejectContent = BaseValidator.createValidationMiddleware(
  RejectContentSchema,
  'body'
);

/**
 * Middleware للتحقق من بيانات طلب التعديل
 */
export const validateRequestRevision = BaseValidator.createValidationMiddleware(
  RequestRevisionSchema,
  'body'
);

/**
 * Middleware للتحقق من بيانات تقييم العميل
 */
export const validateClientRating = BaseValidator.createValidationMiddleware(
  ClientRatingSchema,
  'body'
);

/**
 * Middleware للتحقق من بيانات إنشاء فئة المحتوى
 */
export const validateCreateContentCategory = BaseValidator.createValidationMiddleware(
  CreateContentCategorySchema,
  'body'
);

/**
 * Middleware للتحقق من بيانات اقتراح الفئة
 */
export const validateSuggestCategory = BaseValidator.createValidationMiddleware(
  SuggestCategorySchema,
  'body'
);

/**
 * Middleware للتحقق من معرف المستخدم في params
 */
export const validateUserParams = BaseValidator.createValidationMiddleware(
  z.object({
    userId: IDSchema
  }),
  'params'
);

/**
 * Middleware للتحقق من معرف المصور في params
 */
export const validatePhotographerParams = BaseValidator.createValidationMiddleware(
  z.object({
    photographerId: IDSchema
  }),
  'params'
);

/**
 * Middleware للتحقق من معرف البراند في params
 */
export const validateBrandParams = BaseValidator.createValidationMiddleware(
  z.object({
    brandId: IDSchema
  }),
  'params'
);

// ======================================
// 🎯 Type Definitions
// ======================================

export type UploadContentInput = z.infer<typeof UploadContentSchema>;
export type GetContentInput = z.infer<typeof GetContentSchema>;
export type SearchContentInput = z.infer<typeof SearchContentSchema>;
export type ContentParamsInput = z.infer<typeof ContentParamsSchema>;
export type ApproveContentInput = z.infer<typeof ApproveContentSchema>;
export type RejectContentInput = z.infer<typeof RejectContentSchema>;
export type RequestRevisionInput = z.infer<typeof RequestRevisionSchema>;
export type ClientRatingInput = z.infer<typeof ClientRatingSchema>;
export type CreateContentCategoryInput = z.infer<typeof CreateContentCategorySchema>;
export type SuggestCategoryInput = z.infer<typeof SuggestCategorySchema>;
export type FileInfoInput = z.infer<typeof FileInfoSchema>;
export type ContentClassificationInput = z.infer<typeof ContentClassificationSchema>;

export default BaseValidator; 
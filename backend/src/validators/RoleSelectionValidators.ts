/**
 * 🎭 Role Selection Validators - التحقق من بيانات اختيار الأدوار
 * ================================================================
 * 
 * جميع schemas التحقق المطلوبة لـ RoleSelectionController
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
const USER_ROLES = [
  'marketing_coordinator', 
  'brand_coordinator',
  'photographer'
] as const;

const BRAND_TYPES = [
  'local',
  'international', 
  'startup',
  'enterprise'
] as const;

const INDUSTRIES = [
  'fashion',
  'food_beverage',
  'technology',
  'automotive',
  'healthcare',
  'education',
  'real_estate',
  'entertainment',
  'sports',
  'beauty_cosmetics',
  'travel_tourism',
  'finance_banking',
  'retail',
  'manufacturing',
  'other'
] as const;

const BRAND_STATUSES = [
  'pending_approval',
  'active',
  'suspended',
  'archived'
] as const;

const CONTRACT_TYPES = ['freelancer', 'salary'] as const;

const ORDER_DIRECTIONS = ['asc', 'desc'] as const;

const ORDER_BY_FIELDS = ['applied_at', 'updated_at'] as const;

// ======================================
// 🎯 Validation Schemas لاختيار الأدوار
// ======================================

/**
 * البيانات الإضافية لمنسق التسويق
 */
const MarketingCoordinatorDataSchema = z.object({
  experience_years: z.number().int().min(0).max(50).optional(),
  specializations: z.array(z.string()).optional(),
  previous_campaigns: z.number().int().min(0).optional(),
  portfolio_url: z.string().url("رابط المعرض غير صحيح").optional(),
  certifications: z.array(z.string()).optional()
}).optional();

/**
 * البيانات الإضافية لمنسق البراند
 */
const BrandCoordinatorDataSchema = z.object({
  preferred_brand_id: IDSchema.optional(),
  experience_years: z.number().int().min(0).max(50).optional(),
  brand_management_experience: z.boolean().optional(),
  languages: z.array(z.string()).optional(),
  portfolio_url: z.string().url("رابط المعرض غير صحيح").optional(),
  preferred_industries: z.array(z.enum(INDUSTRIES)).optional()
}).optional();

/**
 * البيانات الإضافية للمصور
 */
const PhotographerDataSchema = z.object({
  contract_type: z.enum(CONTRACT_TYPES, {
    errorMap: () => ({ message: "نوع العقد غير صحيح" })
  }),
  experience_years: z.number().int().min(0).max(50).optional(),
  specializations: z.array(z.string()).optional(),
  equipment_owned: z.array(z.string()).optional(),
  portfolio_url: z.string().url("رابط المعرض غير صحيح").optional(),
  hourly_rate: z.number().min(0).optional(),
  availability_hours: z.number().int().min(1).max(168).optional(),
  certifications: z.array(z.string()).optional()
}).optional();

/**
 * تقديم طلب اختيار دور
 */
export const RoleSelectionSubmissionSchema = z.object({
  selected_role: z.enum(USER_ROLES, {
    errorMap: () => ({ message: "الدور المطلوب غير صحيح" })
  }),
  
  motivation: z.string({
    required_error: "سبب اختيار هذا الدور مطلوب"
  }).min(20, "السبب يجب أن يكون على الأقل 20 حرف").max(1000, "السبب طويل جداً"),
  
  additional_data: z.union([
    MarketingCoordinatorDataSchema,
    BrandCoordinatorDataSchema,
    PhotographerDataSchema
  ]).optional()
}).refine(data => {
  // التحقق من البيانات الإضافية حسب نوع الدور
  if (data.selected_role === 'photographer' && data.additional_data) {
    return 'contract_type' in data.additional_data;
  }
  return true;
}, {
  message: "نوع العقد مطلوب للمصورين",
  path: ["additional_data"]
});

/**
 * معايير البحث عن البراندات مع Pagination
 */
export const SearchBrandsSchema = PaginationSchema.extend({
  query: z.string().optional(),
  brand_type: z.enum(BRAND_TYPES).optional(),
  industry: z.enum(INDUSTRIES).optional(),
  status: z.enum(BRAND_STATUSES).optional(),
  has_coordinator: z.enum(['true', 'false']).optional()
});

/**
 * معايير جلب الطلبات المنتظرة مع Pagination
 */
export const PendingApplicationsSchema = PaginationSchema.extend({
  role: z.enum(USER_ROLES).optional(),
  order_by: z.enum(ORDER_BY_FIELDS).optional(),
  order_direction: z.enum(ORDER_DIRECTIONS).optional()
});

/**
 * الموافقة على طلب دور
 */
export const ApproveRoleSchema = z.object({
  approved_by: IDSchema,
  admin_notes: z.string().max(500, "الملاحظات طويلة جداً").optional()
});

/**
 * رفض طلب دور
 */
export const RejectRoleSchema = z.object({
  rejected_by: IDSchema,
  rejection_reason: z.string({
    required_error: "سبب الرفض مطلوب"
  }).min(10, "سبب الرفض يجب أن يكون على الأقل 10 أحرف").max(500, "سبب الرفض طويل جداً"),
  admin_notes: z.string().max(500, "الملاحظات طويلة جداً").optional()
});

/**
 * معايير إحصائيات اختيار الأدوار مع Pagination
 */
export const RoleSelectionStatsSchema = PaginationSchema.extend({
  start_date: DateStringSchema.optional(),
  end_date: DateStringSchema.optional()
});

/**
 * معايير تاريخ طلبات المستخدم مع Pagination
 */
export const UserApplicationHistorySchema = PaginationSchema.extend({
  user_id: IDSchema,
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
  role: z.enum(USER_ROLES).optional(),
  sort_by: z.enum(['applied_at', 'updated_at', 'status']).optional(),
  sort_order: z.enum(['asc', 'desc']).optional()
});

/**
 * معرف الطلب في params
 */
export const ApplicationIdParamsSchema = z.object({
  id: IDSchema
});

/**
 * معرف المستخدم في params
 */
export const UserIdParamsSchema = z.object({
  user_id: IDSchema
});

/**
 * معرف المستخدم في params (مسار مختلف)
 */
export const UserIdInParamsSchema = z.object({
  userId: IDSchema
});

// ======================================
// 🛠️ Middleware Functions
// ======================================

/**
 * Middleware للتحقق من بيانات تقديم طلب الدور
 */
export const validateRoleSelectionSubmission = BaseValidator.createValidationMiddleware(
  RoleSelectionSubmissionSchema,
  'body'
);

/**
 * Middleware للتحقق من بيانات الموافقة على الطلب
 */
export const validateApproveRole = BaseValidator.createValidationMiddleware(
  ApproveRoleSchema,
  'body'
);

/**
 * Middleware للتحقق من بيانات رفض الطلب
 */
export const validateRejectRole = BaseValidator.createValidationMiddleware(
  RejectRoleSchema,
  'body'
);

/**
 * Middleware للتحقق من معرف الطلب في params
 */
export const validateApplicationIdParams = BaseValidator.createValidationMiddleware(
  ApplicationIdParamsSchema,
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
 * Middleware للتحقق من معرف المستخدم في params (مسار مختلف)
 */
export const validateUserIdInParams = BaseValidator.createValidationMiddleware(
  UserIdInParamsSchema,
  'params'
);

/**
 * Middleware للتحقق من معايير البحث عن البراندات
 */
export const validateSearchBrands = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const validated = SearchBrandsSchema.parse(req.query);
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
 * Middleware للتحقق من معايير جلب الطلبات المنتظرة
 */
export const validatePendingApplications = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const validated = PendingApplicationsSchema.parse(req.query);
    req.query = validated as any;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'معايير الطلبات المنتظرة غير صحيحة',
        errors: BaseValidator.formatZodErrors(error)
      });
      return;
    }
    next(error);
  }
};

/**
 * Middleware للتحقق من معايير إحصائيات اختيار الأدوار مع Pagination
 */
export const validateRoleSelectionStats = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const validated = RoleSelectionStatsSchema.parse(req.query);
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
 * Middleware للتحقق من معايير تاريخ طلبات المستخدم
 */
export const validateUserApplicationHistory = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const validated = UserApplicationHistorySchema.parse(req.query);
    req.query = validated as any;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'معايير تاريخ الطلبات غير صحيحة',
        errors: BaseValidator.formatZodErrors(error)
      });
      return;
    }
    next(error);
  }
}; 
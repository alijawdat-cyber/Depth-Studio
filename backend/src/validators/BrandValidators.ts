/**
 * 🏢 Brand Validators - التحقق من بيانات البراندات
 * ===================================================
 * 
 * جميع schemas التحقق المطلوبة لـ BrandController
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
  EmailSchema, 
  IraqiPhoneSchema,
  PositiveNumberSchema,
  CurrencySchema,
  PaginationSchema
} from './BaseValidator';

// تعريف قيم الأنواع والحالات كـ const arrays لاستخدامها في validation
const BRAND_TYPES = [
  'local',
  'international', 
  'startup',
  'enterprise'
] as const;

const BRAND_STATUSES = [
  'pending_approval',
  'active',
  'suspended',
  'archived'
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

const PRICING_TIERS = [
  'basic',
  'premium', 
  'enterprise'
] as const;

// ======================================
// 🎯 Validation Schemas للبراندات
// ======================================

/**
 * النص متعدد اللغات للبراند
 */
export const BrandMultiLanguageTextSchema = z.object({
  ar: z.string({
    required_error: "النص العربي مطلوب"
  }).min(2, "النص العربي يجب أن يكون على الأقل حرفان"),
  
  en: z.string({
    required_error: "النص الإنجليزي مطلوب"
  }).min(2, "النص الإنجليزي يجب أن يكون على الأقل حرفان")
});

/**
 * إنشاء براند جديد
 */
export const CreateBrandSchema = z.object({
  name: BrandMultiLanguageTextSchema,
  description: BrandMultiLanguageTextSchema,
  
  brand_type: z.enum(BRAND_TYPES, {
    errorMap: () => ({ message: "نوع البراند غير صحيح" })
  }),
  
  industry: z.enum(INDUSTRIES, {
    errorMap: () => ({ message: "الصناعة غير صحيحة" })
  }),
  
  // هوية البراند
  logo_url: z.string().url("رابط الشعار غير صحيح").optional(),
  primary_color: z.string({
    required_error: "اللون الأساسي مطلوب"
  }).regex(/^#[0-9A-F]{6}$/i, "اللون الأساسي يجب أن يكون بصيغة hex صحيحة"),
  
  secondary_color: z.string({
    required_error: "اللون الثانوي مطلوب"
  }).regex(/^#[0-9A-F]{6}$/i, "اللون الثانوي يجب أن يكون بصيغة hex صحيحة"),
  
  // معلومات الاتصال
  contact_name: z.string({
    required_error: "اسم الشخص المسؤول مطلوب"
  }).min(2, "اسم الشخص المسؤول يجب أن يكون على الأقل حرفان"),
  
  contact_email: EmailSchema,
  contact_phone: IraqiPhoneSchema,
  
  // الميزانية
  monthly_budget: PositiveNumberSchema,
  currency: CurrencySchema,
  pricing_tier: z.enum(PRICING_TIERS, {
    errorMap: () => ({ message: "مستوى التسعير غير صحيح" })
  }),
  
  // التفضيلات
  preferred_styles: z.array(z.string()).min(1, "يجب اختيار نمط واحد على الأقل").optional(),
  content_categories: z.array(z.string()).min(1, "يجب اختيار فئة محتوى واحدة على الأقل").optional(),
  
  // المنسق (اختياري)
  assigned_coordinator: IDSchema.optional(),
  
  // من أنشأ البراند
  created_by: IDSchema
});

/**
 * البحث عن براند
 */
export const GetBrandSchema = z.object({
  id: IDSchema.optional(),
  name: z.string().optional(),
  coordinatorId: IDSchema.optional()
}).refine(
  (data) => data.id || data.name || data.coordinatorId,
  {
    message: "يجب تقديم معرف البراند أو الاسم أو معرف المنسق",
    path: ["search_criteria"]
  }
);

/**
 * البحث المتقدم في البراندات
 */
export const SearchBrandsSchema = PaginationSchema.extend({
  search: z.string().optional(),
  searchTerm: z.string().optional(),
  brand_type: z.enum(BRAND_TYPES).optional(),
  status: z.enum(BRAND_STATUSES).optional(),
  industry: z.enum(INDUSTRIES).optional(),
  pricing_tier: z.enum(PRICING_TIERS).optional(),
  coordinator: IDSchema.optional(),
  min_budget: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
  max_budget: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
  currency: CurrencySchema.optional()
});

/**
 * معرف البراند في params
 */
export const BrandParamsSchema = z.object({
  brandId: IDSchema
});

// ======================================
// 🛠️ Middleware Functions
// ======================================

/**
 * Middleware للتحقق من بيانات إنشاء البراند
 */
export const validateCreateBrand = BaseValidator.createValidationMiddleware(
  CreateBrandSchema,
  'body'
);

/**
 * Middleware للتحقق من معايير البحث عن البراند
 */
export const validateGetBrand = BaseValidator.createValidationMiddleware(
  GetBrandSchema,
  'query'
);

/**
 * Middleware للتحقق من بيانات الموافقة - params
 */
export const validateApproveBrandParams = BaseValidator.createValidationMiddleware(
  z.object({
    brandId: IDSchema
  }),
  'params'
);

/**
 * Middleware للتحقق من بيانات الموافقة - body
 */
export const validateApproveBrandBody = BaseValidator.createValidationMiddleware(
  z.object({
    approvedBy: IDSchema
  }),
  'body'
);

/**
 * Middleware للتحقق من بيانات تعيين المنسق - params
 */
export const validateAssignCoordinatorParams = BaseValidator.createValidationMiddleware(
  z.object({
    brandId: IDSchema
  }),
  'params'
);

/**
 * Middleware للتحقق من بيانات تعيين المنسق - body
 */
export const validateAssignCoordinatorBody = BaseValidator.createValidationMiddleware(
  z.object({
    coordinatorId: IDSchema,
    assignedBy: IDSchema
  }),
  'body'
);

/**
 * Middleware للتحقق من بيانات تحديث الميزانية - params
 */
export const validateUpdateBudgetParams = BaseValidator.createValidationMiddleware(
  z.object({
    brandId: IDSchema
  }),
  'params'
);

/**
 * Middleware للتحقق من بيانات تحديث الميزانية - body
 */
export const validateUpdateBudgetBody = BaseValidator.createValidationMiddleware(
  z.object({
    monthly_budget: PositiveNumberSchema,
    currency: CurrencySchema,
    updatedBy: IDSchema
  }),
  'body'
);

/**
 * Middleware للتحقق من معايير البحث المتقدم
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
 * Middleware للتحقق من معرف البراند في params
 */
export const validateBrandParams = BaseValidator.createValidationMiddleware(
  BrandParamsSchema,
  'params'
);

// ======================================
// 🎯 Type Definitions
// ======================================

export type CreateBrandInput = z.infer<typeof CreateBrandSchema>;
export type GetBrandInput = z.infer<typeof GetBrandSchema>;
export type SearchBrandsInput = z.infer<typeof SearchBrandsSchema>;
export type BrandParamsInput = z.infer<typeof BrandParamsSchema>;
export type UpdateBudgetBodyInput = {
  monthly_budget: number;
  currency: string;
  updatedBy: string;
};
export type UpdateBrandStatusBodyInput = {
  status: string;
  updatedBy: string;
  reason?: string;
};

export default BaseValidator; 
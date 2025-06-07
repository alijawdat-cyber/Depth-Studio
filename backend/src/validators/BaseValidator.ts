/**
 * 🔍 Base Validator - نظام التحقق الأساسي
 * ==========================================
 * 
 * نظام validation شامل باستخدام Zod مع رسائل خطأ بالعربية
 * يدعم جميع أنواع البيانات والتحقق المتقدم
 * 
 * 📅 تاريخ الإنشاء: ديسمبر 2024
 * 👨‍💻 المطور: علي جودت
 */

import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

// ======================================
// 🎯 أنواع التحقق الأساسية
// ======================================

/**
 * نتيجة التحقق من صحة البيانات
 */
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: ValidationError[];
}

/**
 * خطأ التحقق
 */
export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: any;
}

/**
 * خيارات التحقق
 */
export interface ValidationOptions {
  abortEarly?: boolean;      // توقف عند أول خطأ
  stripUnknown?: boolean;    // إزالة الحقول غير المعروفة
  allowUnknown?: boolean;    // السماح بحقول إضافية
}

// ======================================
// 🌐 رسائل الخطأ بالعربية
// ======================================

export const ARABIC_MESSAGES = {
  // رسائل أساسية
  required: "هذا الحقل مطلوب",
  invalid_type: "نوع البيانات غير صحيح",
  
  // النصوص
  string_empty: "لا يمكن أن يكون النص فارغاً",
  string_min: "يجب أن يكون النص على الأقل {min} أحرف",
  string_max: "يجب أن يكون النص أقل من {max} حرف",
  string_email: "البريد الإلكتروني غير صحيح",
  string_url: "الرابط غير صحيح",
  string_phone: "رقم الهاتف غير صحيح",
  
  // الأرقام
  number_min: "يجب أن يكون الرقم على الأقل {min}",
  number_max: "يجب أن يكون الرقم أقل من {max}",
  number_positive: "يجب أن يكون الرقم موجباً",
  number_integer: "يجب أن يكون الرقم صحيحاً",
  
  // التواريخ
  date_invalid: "التاريخ غير صحيح",
  date_past: "يجب أن يكون التاريخ في الماضي",
  date_future: "يجب أن يكون التاريخ في المستقبل",
  
  // المصفوفات
  array_empty: "يجب أن تحتوي المصفوفة على عنصر واحد على الأقل",
  array_min: "يجب أن تحتوي المصفوفة على {min} عناصر على الأقل",
  array_max: "يجب أن تحتوي المصفوفة على {max} عناصر كحد أقصى",
  
  // Enums
  enum_invalid: "القيمة غير مسموحة، القيم المسموحة: {options}",
  
  // خاص بالمشروع
  user_role_invalid: "دور المستخدم غير صحيح",
  brand_type_invalid: "نوع البراند غير صحيح",
  campaign_status_invalid: "حالة الحملة غير صحيحة",
  content_type_invalid: "نوع المحتوى غير صحيح",
  payment_status_invalid: "حالة الدفع غير صحيحة",
  iraqi_phone_invalid: "رقم الهاتف العراقي يجب أن يبدأ بـ +964",
  password_weak: "كلمة المرور ضعيفة، يجب أن تحتوي على 8 أحرف على الأقل"
} as const;

// ======================================
// 🛠️ Zod Schemas الأساسية
// ======================================

/**
 * معرف Firebase
 */
export const IDSchema = z.string({
  required_error: ARABIC_MESSAGES.required,
  invalid_type_error: ARABIC_MESSAGES.invalid_type
}).min(1, ARABIC_MESSAGES.string_empty);

/**
 * البريد الإلكتروني
 */
export const EmailSchema = z.string({
  required_error: ARABIC_MESSAGES.required
}).email(ARABIC_MESSAGES.string_email);

/**
 * رقم الهاتف العراقي
 */
export const IraqiPhoneSchema = z.string({
  required_error: ARABIC_MESSAGES.required
}).regex(/^\+964[0-9]{10}$/, ARABIC_MESSAGES.iraqi_phone_invalid);

/**
 * كلمة المرور
 */
export const PasswordSchema = z.string({
  required_error: ARABIC_MESSAGES.required
}).min(8, ARABIC_MESSAGES.password_weak);

/**
 * النص متعدد اللغات
 */
export const MultiLanguageTextSchema = z.object({
  ar: z.string().min(1, "النص العربي مطلوب"),
  en: z.string().min(1, "النص الإنجليزي مطلوب")
});

/**
 * التاريخ (ISO string)
 */
export const DateStringSchema = z.string({
  required_error: ARABIC_MESSAGES.required
}).datetime("يجب أن يكون التاريخ بصيغة ISO صحيحة");

/**
 * الرقم الموجب
 */
export const PositiveNumberSchema = z.number({
  required_error: ARABIC_MESSAGES.required,
  invalid_type_error: ARABIC_MESSAGES.invalid_type
}).positive(ARABIC_MESSAGES.number_positive);

/**
 * العملة
 */
export const CurrencySchema = z.enum(['USD', 'EUR', 'IQD'], {
  errorMap: () => ({ message: "العملة يجب أن تكون USD أو EUR أو IQD" })
});

/**
 * الأولوية
 */
export const PrioritySchema = z.enum(['low', 'medium', 'high', 'urgent'], {
  errorMap: () => ({ message: "الأولوية يجب أن تكون low أو medium أو high أو urgent" })
});

// ======================================
// 🏗️ Base Validator Class
// ======================================

export class BaseValidator {
  /**
   * تحويل أخطاء Zod إلى تنسيق عربي
   */
  static formatZodErrors(error: z.ZodError): ValidationError[] {
    return error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code,
      value: err.path.length > 0 ? 'received' in err ? err.received : undefined : undefined
    }));
  }

  /**
   * تحقق من البيانات باستخدام schema
   */
  static validate<T>(
    schema: z.ZodSchema<T>, 
    data: unknown, 
    options: ValidationOptions = {}
  ): ValidationResult<T> {
    try {
      const result = schema.parse(data);
      return {
        success: true,
        data: result
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          errors: this.formatZodErrors(error)
        };
      }
      
      return {
        success: false,
        errors: [{
          field: 'unknown',
          message: 'خطأ غير متوقع في التحقق من البيانات',
          code: 'unknown_error'
        }]
      };
    }
  }

  /**
   * إنشاء middleware للتحقق من البيانات
   */
  static createValidationMiddleware<T>(
    schema: z.ZodSchema<T>,
    dataSource: 'body' | 'query' | 'params' = 'body'
  ) {
    return (req: Request, res: Response, next: NextFunction): void => {
      const data = req[dataSource];
      const result = this.validate(schema, data);

      if (!result.success) {
        res.status(400).json({
          success: false,
          message: 'بيانات غير صحيحة',
          errors: result.errors,
          error_count: result.errors?.length || 0
        });
        return;
      }

      // تحديث البيانات بالنسخة المُتحقق منها
      req[dataSource] = result.data;
      next();
    };
  }

  /**
   * تحقق سريع مع إرجاع استجابة مباشرة
   */
  static validateAndRespond<T>(
    schema: z.ZodSchema<T>,
    data: unknown,
    res: Response
  ): T | null {
    const result = this.validate(schema, data);

    if (!result.success) {
      res.status(400).json({
        success: false,
        message: 'بيانات غير صحيحة',
        errors: result.errors,
        error_count: result.errors?.length || 0
      });
      return null;
    }

    return result.data || null;
  }
}

// ======================================
// 🔧 دوال مساعدة
// ======================================

/**
 * تحقق من أن القيمة موجودة في enum
 */
export function createEnumSchema<T extends Record<string, string>>(
  enumObject: T,
  fieldName: string
) {
  const values = Object.values(enumObject) as [string, ...string[]];
  return z.enum(values, {
    errorMap: () => ({ 
      message: `${fieldName} غير صحيح، القيم المسموحة: ${values.join(', ')}` 
    })
  });
}

/**
 * تحقق من التاريخ مع ضمان أنه في المستقبل
 */
export const FutureDateSchema = DateStringSchema.refine(
  (date) => new Date(date) > new Date(),
  { message: ARABIC_MESSAGES.date_future }
);

/**
 * تحقق من التاريخ مع ضمان أنه في الماضي
 */
export const PastDateSchema = DateStringSchema.refine(
  (date) => new Date(date) < new Date(),
  { message: ARABIC_MESSAGES.date_past }
);

/**
 * schema للبحث والفلترة
 */
export const PaginationSchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
  search: z.string().optional()
});

export default BaseValidator; 
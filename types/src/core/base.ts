/**
 * 🔤 الأنواع الأساسية - Depth Studio
 * ==================================
 * 
 * 📝 الأنواع الأساسية المستخدمة في جميع أنحاء النظام
 */

import { Timestamp } from 'firebase/firestore';  // استيراد نوع الطابع الزمني من Firebase

// ======================================
// 🌍 الأنواع الأساسية
// ======================================

/** معرف فريد */
export type ID = string;  // نوع المعرف الفريد للكيانات (string)

/** الطوابع الزمنية */
export type FirebaseTimestamp = Timestamp;  // نوع الطابع الزمني من Firebase

/** النصوص متعددة اللغات */
export interface MultiLanguageText {
  ar: string;  // النص بالعربية
  en: string;  // النص بالإنجليزية
}

/** نموذج البيانات الأساسي */
export interface BaseEntity {
  id: ID;                           // المعرف الفريد للكيان
  created_at: FirebaseTimestamp;    // تاريخ ووقت الإنشاء
  updated_at: FirebaseTimestamp;    // تاريخ ووقت آخر تحديث
  created_by?: ID;                  // معرف من قام بإنشاء الكيان (اختياري)
  updated_by?: ID;                  // معرف من قام بآخر تحديث (اختياري)
}

/** نموذج البيانات القابلة للتفعيل */
export interface ActivatableEntity extends BaseEntity {
  is_active: boolean;  // حالة تفعيل الكيان (مفعل أم لا)
}

/** معلومات الاتصال */
export interface ContactInfo {
  email?: string;     // البريد الإلكتروني (اختياري)
  phone?: string;     // رقم الهاتف (اختياري)
  whatsapp?: string;  // رقم الواتساب (اختياري)
  address?: string;   // العنوان (اختياري)
}

/** المبالغ المالية */
export interface CurrencyAmount {
  amount: number;   // المبلغ (رقم)
  currency: string; // العملة (مثل USD, IQD)
}

/** نطاق زمني */
export interface DateRange {
  start_date: FirebaseTimestamp;  // تاريخ البداية
  end_date: FirebaseTimestamp;    // تاريخ النهاية
}

/** نطاق وقتي يومي */
export interface TimeRange {
  start_time: string; // وقت البداية بصيغة HH:mm
  end_time: string;   // وقت النهاية بصيغة HH:mm
}

// ======================================
// 🔍 Frontend Repository Pattern
// ======================================

/**
 * خيارات الاستعلام للفرونت إند
 */
export interface FrontendQueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: {
    field: string;
    direction: "asc" | "desc";
  }[];
  where?: {
    field: string;
    operator: string;
    value: unknown;
  }[];
  useCache?: boolean;              // استخدام التخزين المؤقت
  cacheExpiry?: number;           // مدة انتهاء صلاحية التخزين المؤقت (بالثواني)
}

/**
 * نتائج الصفحات للفرونت إند
 */
export interface FrontendPaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
  cached?: boolean;               // هل النتائج من التخزين المؤقت
  cacheTimestamp?: Date;          // وقت التخزين المؤقت
}

/**
 * حالة عملية API
 */
export interface ApiOperationState {
  loading: boolean;
  error: string | null;
  success: boolean;
  lastUpdated?: Date;
}

/**
 * 🏛️ نموذج Repository الأساسي - Frontend
 * متوافق مع BaseRepository في Backend مع إضافات خاصة بالفرونت إند
 */
export abstract class BaseRepository<T extends BaseEntity> {
  protected abstract collectionName: string;

  // ======================================
  // العمليات الأساسية (CRUD)
  // ======================================
  
  /**
   * إنشاء كيان جديد
   */
  abstract create(entity: Omit<T, 'id' | 'created_at' | 'updated_at'>): Promise<T>;

  /**
   * البحث عن كيان بالمعرف
   */
  abstract findById(id: ID): Promise<T | null>;

  /**
   * تحديث كيان موجود
   */
  abstract update(id: ID, updates: Partial<Omit<T, 'id' | 'created_at'>>): Promise<T>;

  /**
   * حذف كيان
   */
  abstract delete(id: ID): Promise<void>;

  /**
   * البحث عن جميع الكيانات
   */
  abstract findAll(options?: FrontendQueryOptions): Promise<T[]>;

  // ======================================
  // العمليات المتقدمة
  // ======================================

  /**
   * البحث مع صفحات
   */
  abstract findPaginated(
    page: number,
    limit: number,
    options?: Omit<FrontendQueryOptions, 'limit' | 'offset'>
  ): Promise<FrontendPaginatedResult<T>>;

  /**
   * عدّ الكيانات
   */
  abstract count(options?: Omit<FrontendQueryOptions, 'limit' | 'offset'>): Promise<number>;

  /**
   * البحث مع نص
   */
  abstract search(query: string, options?: FrontendQueryOptions): Promise<T[]>;

  // ======================================
  // إدارة التخزين المؤقت
  // ======================================

  /**
   * مسح التخزين المؤقت
   */
  abstract clearCache(): Promise<void>;

  /**
   * تحديث التخزين المؤقت
   */
  abstract refreshCache(): Promise<void>;

  // ======================================
  // حالة العمليات
  // ======================================

  /**
   * الحصول على حالة العملية
   */
  abstract getOperationState(): ApiOperationState;
}

// ======================================
// 🔍 Frontend Validation System
// ======================================

/**
 * نتيجة التحقق من صحة البيانات - Frontend
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

/**
 * خطأ التحقق
 */
export interface ValidationError {
  field: string;                  // اسم الحقل
  message: string;               // رسالة الخطأ بالعربية
  code: string;                  // رمز الخطأ
  value?: unknown;               // القيمة المُدخلة
}

/**
 * تحذير التحقق
 */
export interface ValidationWarning {
  field: string;                  // اسم الحقل
  message: string;               // رسالة التحذير بالعربية
  suggestion?: string;           // اقتراح للتحسين
}

/**
 * خيارات التحقق للفرونت إند
 */
export interface FrontendValidationOptions {
  validateOnChange?: boolean;     // التحقق عند تغيير القيمة
  validateOnBlur?: boolean;      // التحقق عند فقدان التركيز
  abortEarly?: boolean;          // توقف عند أول خطأ
  showWarnings?: boolean;        // عرض التحذيرات
  language?: 'ar' | 'en';       // لغة رسائل الخطأ
}

/**
 * 🔍 نموذج Validator الأساسي - Frontend
 * متوافق مع BaseValidator في Backend مع إضافات خاصة بالفرونت إند
 */
export abstract class BaseValidator<T> {
  protected abstract validationRules: Record<string, unknown>;
  protected options: FrontendValidationOptions;

  constructor(options: FrontendValidationOptions = {}) {
    this.options = {
      validateOnChange: true,
      validateOnBlur: true,
      abortEarly: false,
      showWarnings: true,
      language: 'ar',
      ...options
    };
  }

  // ======================================
  // التحقق الأساسي
  // ======================================

  /**
   * التحقق من صحة الكائن كاملاً
   */
  abstract validate(data: T): ValidationResult;

  /**
   * التحقق من صحة حقل واحد
   */
  abstract validateField(fieldName: keyof T, value: unknown): ValidationResult;

  // ======================================
  // التحقق التفاعلي
  // ======================================

  /**
   * التحقق عند تغيير القيمة (real-time)
   */
  validateOnChange(fieldName: keyof T, value: unknown): ValidationResult {
    if (!this.options.validateOnChange) {
      return { isValid: true, errors: [], warnings: [] };
    }
    return this.validateField(fieldName, value);
  }

  /**
   * التحقق عند فقدان التركيز
   */
  validateOnBlur(fieldName: keyof T, value: unknown): ValidationResult {
    if (!this.options.validateOnBlur) {
      return { isValid: true, errors: [], warnings: [] };
    }
    return this.validateField(fieldName, value);
  }

  // ======================================
  // الأدوات المساعدة
  // ======================================

  /**
   * رسائل الخطأ بالعربية
   */
  protected getErrorMessage(errorCode: string, fieldName: string, params?: Record<string, unknown>): string {
    const messages: Record<string, string> = {
      required: `حقل ${fieldName} مطلوب`,
      invalid_type: `نوع البيانات في حقل ${fieldName} غير صحيح`,
      string_empty: `حقل ${fieldName} لا يمكن أن يكون فارغاً`,
      string_min: `حقل ${fieldName} يجب أن يحتوي على ${params?.['min']} أحرف على الأقل`,
      string_max: `حقل ${fieldName} يجب أن يحتوي على ${params?.['max']} أحرف كحد أقصى`,
      email_invalid: `البريد الإلكتروني في حقل ${fieldName} غير صحيح`,
      phone_invalid: `رقم الهاتف في حقل ${fieldName} غير صحيح`,
      number_min: `القيمة في حقل ${fieldName} يجب أن تكون ${params?.['min']} على الأقل`,
      number_max: `القيمة في حقل ${fieldName} يجب أن تكون ${params?.['max']} كحد أقصى`,
      date_invalid: `التاريخ في حقل ${fieldName} غير صحيح`,
      array_empty: `حقل ${fieldName} يجب أن يحتوي على عنصر واحد على الأقل`,
    };

    return messages[errorCode] || `خطأ في حقل ${fieldName}`;
  }

  /**
   * تنسيق النتائج
   */
  protected formatResult(errors: ValidationError[], warnings: ValidationWarning[] = []): ValidationResult {
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
} 
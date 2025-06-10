/**
 * 🔍 Frontend Base Validator - نظام التحقق الأساسي للفرونت إند
 * ================================================================
 * 
 * نظام validation شامل للفرونت إند مع رسائل خطأ باللغة العربية
 * يدعم جميع أنواع البيانات والتحقق المتقدم مع React Integration
 * 
 * 📅 تاريخ الإنشاء: يونيو 2025
 * 👨‍💻 المطور: علي جودت - Depth Studio
 */

import { 
  BaseValidator, 
  ValidationResult, 
  ValidationError, 
  ValidationWarning,
  FrontendValidationOptions 
} from '@depth-studio/types';

// ======================================
// 🌐 رسائل الخطأ والتحذير بالعربية
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
  string_pattern: "تنسيق النص غير صحيح",
  
  // الأرقام
  number_min: "يجب أن يكون الرقم على الأقل {min}",
  number_max: "يجب أن يكون الرقم أقل من {max}",
  number_positive: "يجب أن يكون الرقم موجباً",
  number_negative: "يجب أن يكون الرقم سالباً",
  number_integer: "يجب أن يكون الرقم صحيحاً",
  number_decimal: "يجب أن يكون الرقم عشرياً",
  
  // التواريخ
  date_invalid: "التاريخ غير صحيح",
  date_past: "يجب أن يكون التاريخ في الماضي",
  date_future: "يجب أن يكون التاريخ في المستقبل",
  date_format: "تنسيق التاريخ غير صحيح",
  
  // المصفوفات
  array_empty: "يجب أن تحتوي القائمة على عنصر واحد على الأقل",
  array_min: "يجب أن تحتوي القائمة على {min} عناصر على الأقل",
  array_max: "يجب أن تحتوي القائمة على {max} عناصر كحد أقصى",
  array_unique: "يجب أن تكون جميع العناصر فريدة",
  
  // الكائنات
  object_missing_property: "الخاصية {property} مطلوبة",
  object_invalid_property: "الخاصية {property} غير صحيحة",
  
  // Enums
  enum_invalid: "القيمة غير مسموحة، القيم المسموحة: {options}",
  
  // ملفات
  file_required: "يجب اختيار ملف",
  file_size_max: "حجم الملف يجب أن يكون أقل من {max}",
  file_type_invalid: "نوع الملف غير مدعوم، الأنواع المدعومة: {types}",
  
  // خاص بالمشروع
  user_role_invalid: "دور المستخدم غير صحيح",
  brand_type_invalid: "نوع البراند غير صحيح",
  campaign_status_invalid: "حالة الحملة غير صحيحة",
  content_type_invalid: "نوع المحتوى غير صحيح",
  payment_status_invalid: "حالة الدفع غير صحيحة",
  iraqi_phone_invalid: "رقم الهاتف العراقي يجب أن يبدأ بـ +964",
  password_weak: "كلمة المرور ضعيفة، يجب أن تحتوي على 8 أحرف على الأقل مع أرقام وحروف",
  password_mismatch: "كلمة المرور وتأكيد كلمة المرور غير متطابقان"
} as const;

export const ARABIC_WARNINGS = {
  // تحذيرات النصوص
  string_too_short: "النص قصير جداً، يُفضل أن يكون أطول",
  string_too_long: "النص طويل جداً، يُفضل أن يكون أقصر",
  
  // تحذيرات الأرقام
  number_small: "الرقم صغير جداً",
  number_large: "الرقم كبير جداً",
  
  // تحذيرات كلمة المرور
  password_could_be_stronger: "يمكن تقوية كلمة المرور بإضافة رموز خاصة",
  password_common: "كلمة المرور شائعة، يُفضل استخدام كلمة مرور أكثر تعقيداً",
  
  // تحذيرات البريد الإلكتروني
  email_unusual_domain: "نطاق البريد الإلكتروني غير مألوف",
  
  // تحذيرات الهاتف
  phone_might_be_incorrect: "رقم الهاتف قد يكون غير صحيح"
} as const;

// ======================================
// 🔧 أنواع التحقق المختلفة
// ======================================

export type ValidationRuleType = 
  | 'required'
  | 'string'
  | 'number'
  | 'email'
  | 'phone'
  | 'url'
  | 'date'
  | 'array'
  | 'object'
  | 'enum'
  | 'file'
  | 'custom';

export interface ValidationRule {
  type: ValidationRuleType;
  message?: string;
  params?: Record<string, unknown>;
  customValidator?: (value: unknown) => boolean | Promise<boolean>;
}

export interface FieldValidationRules {
  [fieldName: string]: ValidationRule[];
}

// ======================================
// 🏗️ Frontend Base Validator Implementation
// ======================================

export class FrontendBaseValidator<T extends Record<string, unknown>> extends BaseValidator<T> {
  protected validationRules: FieldValidationRules = {};
  private readonly timeouts: Map<string, NodeJS.Timeout> = new Map();

  constructor(
    rules: FieldValidationRules,
    options: FrontendValidationOptions = {}
  ) {
    super(options);
    this.validationRules = rules;
  }

  // ======================================
  // التحقق الأساسي
  // ======================================

  /**
   * التحقق من جميع البيانات
   */
  validate(data: T): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // التحقق من كل حقل
    for (const [fieldName, rules] of Object.entries(this.validationRules)) {
      const fieldValue = data[fieldName];
      const fieldResult = this.validateFieldWithRules(fieldName, fieldValue, rules);
      
      errors.push(...fieldResult.errors);
      warnings.push(...fieldResult.warnings);

      // إذا كان الخيار هو التوقف عند أول خطأ
      if (this.options.abortEarly && fieldResult.errors.length > 0) {
        break;
      }
    }

    return this.formatResult(errors, warnings);
  }

  /**
   * التحقق من حقل واحد
   */
  validateField(fieldName: keyof T, value: unknown): ValidationResult {
    const fieldNameStr = String(fieldName);
    const rules = this.validationRules[fieldNameStr] || [];
    
    return this.validateFieldWithRules(fieldNameStr, value, rules);
  }

  /**
   * التحقق عند تغيير القيمة (مع تأخير لتحسين الأداء)
   */
  validateOnChange(fieldName: keyof T, value: unknown): ValidationResult {
    if (!this.options.validateOnChange) {
      return this.formatResult([], []);
    }

    const fieldNameStr = String(fieldName);
    
    // إلغاء التحقق السابق إذا كان موجوداً
    const existingTimeout = this.timeouts.get(fieldNameStr);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // تأخير التحقق قليلاً لتحسين الأداء
    return new Promise<ValidationResult>((resolve) => {
      const timeoutId = setTimeout(() => {
        const result = this.validateField(fieldName, value);
        this.timeouts.delete(fieldNameStr);
        resolve(result);
      }, 300); // تأخير 300ms

      this.timeouts.set(fieldNameStr, timeoutId);
    }) as unknown as ValidationResult;
  }

  /**
   * التحقق عند فقدان التركيز
   */
  validateOnBlur(fieldName: keyof T, value: unknown): ValidationResult {
    if (!this.options.validateOnBlur) {
      return this.formatResult([], []);
    }

    return this.validateField(fieldName, value);
  }

  // ======================================
  // التحقق التفصيلي للحقول
  // ======================================

  private validateFieldWithRules(
    fieldName: string, 
    value: unknown, 
    rules: ValidationRule[]
  ): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    for (const rule of rules) {
      const result = this.validateSingleRule(fieldName, value, rule);
      
      if (result.error) {
        errors.push(result.error);
        
        // التوقف عند أول خطأ إذا كان الخيار مفعلاً
        if (this.options.abortEarly) {
          break;
        }
      }
      
      if (result.warning && this.options.showWarnings) {
        warnings.push(result.warning);
      }
    }

    return this.formatResult(errors, warnings);
  }

  private validateSingleRule(
    fieldName: string,
    value: unknown,
    rule: ValidationRule
  ): { error?: ValidationError; warning?: ValidationWarning } {
    
    try {
      switch (rule.type) {
        case 'required':
          return this.validateRequired(fieldName, value, rule);
          
        case 'string':
          return this.validateString(fieldName, value, rule);
          
        case 'number':
          return this.validateNumber(fieldName, value, rule);
          
        case 'email':
          return this.validateEmail(fieldName, value, rule);
          
        case 'phone':
          return this.validatePhone(fieldName, value, rule);
          
        case 'url':
          return this.validateUrl(fieldName, value, rule);
          
        case 'date':
          return this.validateDate(fieldName, value, rule);
          
        case 'array':
          return this.validateArray(fieldName, value, rule);
          
        case 'object':
          return this.validateObject(fieldName, value, rule);
          
        case 'enum':
          return this.validateEnum(fieldName, value, rule);
          
        case 'file':
          return this.validateFile(fieldName, value, rule);
          
        case 'custom':
          return this.validateCustom(fieldName, value, rule);
          
        default:
          return {};
      }
    } catch (validationError) {
      console.error('خطأ في التحقق:', validationError);
      return {
        error: {
          field: fieldName,
          message: 'خطأ غير متوقع في التحقق من البيانات',
          code: 'validation_error',
          value
        }
      };
    }
  }

  // ======================================
  // دوال التحقق المختلفة
  // ======================================

  private validateRequired(
    fieldName: string,
    value: unknown,
    rule: ValidationRule
  ): { error?: ValidationError; warning?: ValidationWarning } {
    
    const isEmpty = value === null || 
                   value === undefined || 
                   value === '' || 
                   (Array.isArray(value) && value.length === 0);

    if (isEmpty) {
      return {
        error: {
          field: fieldName,
          message: rule.message || this.getErrorMessage('required', fieldName),
          code: 'required',
          value
        }
      };
    }

    return {};
  }

  private validateString(
    fieldName: string,
    value: unknown,
    rule: ValidationRule
  ): { error?: ValidationError; warning?: ValidationWarning } {
    
    if (value === null || value === undefined) {
      return {};
    }

    if (typeof value !== 'string') {
      return {
        error: {
          field: fieldName,
          message: rule.message || this.getErrorMessage('invalid_type', fieldName),
          code: 'invalid_type',
          value
        }
      };
    }

    const params = rule.params || {};
    
    // التحقق من الحد الأدنى للطول
    if (params.min && value.length < (params.min as number)) {
      return {
        error: {
          field: fieldName,
          message: rule.message || this.getErrorMessage('string_min', fieldName, params),
          code: 'string_min',
          value
        }
      };
    }

    // التحقق من الحد الأقصى للطول
    if (params.max && value.length > (params.max as number)) {
      return {
        error: {
          field: fieldName,
          message: rule.message || this.getErrorMessage('string_max', fieldName, params),
          code: 'string_max',
          value
        }
      };
    }

    // التحقق من النمط (Pattern)
    if (params.pattern && !(params.pattern as RegExp).test(value)) {
      return {
        error: {
          field: fieldName,
          message: rule.message || this.getErrorMessage('string_pattern', fieldName),
          code: 'string_pattern',
          value
        }
      };
    }

    // تحذيرات
    const warnings: ValidationWarning[] = [];
    
    if (params.warnIfShort && value.length < (params.warnIfShort as number)) {
      warnings.push({
        field: fieldName,
        message: ARABIC_WARNINGS.string_too_short,
        suggestion: `يُفضل أن يكون النص على الأقل ${params.warnIfShort} أحرف`
      });
    }

    return warnings.length > 0 ? { warning: warnings[0] } : {};
  }

  private validateNumber(
    fieldName: string,
    value: unknown,
    rule: ValidationRule
  ): { error?: ValidationError; warning?: ValidationWarning } {
    
    if (value === null || value === undefined) {
      return {};
    }

    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    if (typeof numValue !== 'number' || isNaN(numValue)) {
      return {
        error: {
          field: fieldName,
          message: rule.message || this.getErrorMessage('invalid_type', fieldName),
          code: 'invalid_type',
          value
        }
      };
    }

    const params = rule.params || {};

    // التحقق من الحد الأدنى
    if (params.min && numValue < (params.min as number)) {
      return {
        error: {
          field: fieldName,
          message: rule.message || this.getErrorMessage('number_min', fieldName, params),
          code: 'number_min',
          value
        }
      };
    }

    // التحقق من الحد الأقصى
    if (params.max && numValue > (params.max as number)) {
      return {
        error: {
          field: fieldName,
          message: rule.message || this.getErrorMessage('number_max', fieldName, params),
          code: 'number_max',
          value
        }
      };
    }

    // التحقق من أن الرقم موجب
    if (params.positive && numValue <= 0) {
      return {
        error: {
          field: fieldName,
          message: rule.message || this.getErrorMessage('number_positive', fieldName),
          code: 'number_positive',
          value
        }
      };
    }

    // التحقق من أن الرقم صحيح
    if (params.integer && !Number.isInteger(numValue)) {
      return {
        error: {
          field: fieldName,
          message: rule.message || this.getErrorMessage('number_integer', fieldName),
          code: 'number_integer',
          value
        }
      };
    }

    return {};
  }

  private validateEmail(
    fieldName: string,
    value: unknown,
    rule: ValidationRule
  ): { error?: ValidationError; warning?: ValidationWarning } {
    
    if (value === null || value === undefined || value === '') {
      return {};
    }

    if (typeof value !== 'string') {
      return {
        error: {
          field: fieldName,
          message: rule.message || this.getErrorMessage('invalid_type', fieldName),
          code: 'invalid_type',
          value
        }
      };
    }

    // نمط التحقق من البريد الإلكتروني
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailPattern.test(value)) {
      return {
        error: {
          field: fieldName,
          message: rule.message || this.getErrorMessage('string_email', fieldName),
          code: 'string_email',
          value
        }
      };
    }

    // تحذيرات للنطاقات غير المألوفة
    const commonDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'];
    const domain = value.split('@')[1]?.toLowerCase();
    
    if (domain && !commonDomains.includes(domain)) {
      return {
        warning: {
          field: fieldName,
          message: ARABIC_WARNINGS.email_unusual_domain,
          suggestion: 'تأكد من صحة نطاق البريد الإلكتروني'
        }
      };
    }

    return {};
  }

  private validatePhone(
    fieldName: string,
    value: unknown,
    rule: ValidationRule
  ): { error?: ValidationError; warning?: ValidationWarning } {
    
    if (value === null || value === undefined || value === '') {
      return {};
    }

    if (typeof value !== 'string') {
      return {
        error: {
          field: fieldName,
          message: rule.message || this.getErrorMessage('invalid_type', fieldName),
          code: 'invalid_type',
          value
        }
      };
    }

    const params = rule.params || {};
    
    // نمط الهاتف العراقي كافتراضي
    const pattern = params.pattern as RegExp || /^\+964[0-9]{10}$/;
    
    if (!pattern.test(value)) {
      return {
        error: {
          field: fieldName,
          message: rule.message || this.getErrorMessage('iraqi_phone_invalid', fieldName),
          code: 'iraqi_phone_invalid',
          value
        }
      };
    }

    return {};
  }

  private validateUrl(
    fieldName: string,
    value: unknown,
    rule: ValidationRule
  ): { error?: ValidationError; warning?: ValidationWarning } {
    
    if (value === null || value === undefined || value === '') {
      return {};
    }

    if (typeof value !== 'string') {
      return {
        error: {
          field: fieldName,
          message: rule.message || this.getErrorMessage('invalid_type', fieldName),
          code: 'invalid_type',
          value
        }
      };
    }

    try {
      new URL(value);
      return {};
    } catch {
      return {
        error: {
          field: fieldName,
          message: rule.message || this.getErrorMessage('string_url', fieldName),
          code: 'string_url',
          value
        }
      };
    }
  }

  private validateDate(
    fieldName: string,
    value: unknown,
    rule: ValidationRule
  ): { error?: ValidationError; warning?: ValidationWarning } {
    
    if (value === null || value === undefined || value === '') {
      return {};
    }

    const dateValue = new Date(value as string);
    
    if (isNaN(dateValue.getTime())) {
      return {
        error: {
          field: fieldName,
          message: rule.message || this.getErrorMessage('date_invalid', fieldName),
          code: 'date_invalid',
          value
        }
      };
    }

    const params = rule.params || {};
    const now = new Date();

    // التحقق من أن التاريخ في المستقبل
    if (params.future && dateValue <= now) {
      return {
        error: {
          field: fieldName,
          message: rule.message || this.getErrorMessage('date_future', fieldName),
          code: 'date_future',
          value
        }
      };
    }

    // التحقق من أن التاريخ في الماضي
    if (params.past && dateValue >= now) {
      return {
        error: {
          field: fieldName,
          message: rule.message || this.getErrorMessage('date_past', fieldName),
          code: 'date_past',
          value
        }
      };
    }

    return {};
  }

  private validateArray(
    fieldName: string,
    value: unknown,
    rule: ValidationRule
  ): { error?: ValidationError; warning?: ValidationWarning } {
    
    if (value === null || value === undefined) {
      return {};
    }

    if (!Array.isArray(value)) {
      return {
        error: {
          field: fieldName,
          message: rule.message || this.getErrorMessage('invalid_type', fieldName),
          code: 'invalid_type',
          value
        }
      };
    }

    const params = rule.params || {};

    // التحقق من الحد الأدنى لعدد العناصر
    if (params.min && value.length < (params.min as number)) {
      return {
        error: {
          field: fieldName,
          message: rule.message || this.getErrorMessage('array_min', fieldName, params),
          code: 'array_min',
          value
        }
      };
    }

    // التحقق من الحد الأقصى لعدد العناصر
    if (params.max && value.length > (params.max as number)) {
      return {
        error: {
          field: fieldName,
          message: rule.message || this.getErrorMessage('array_max', fieldName, params),
          code: 'array_max',
          value
        }
      };
    }

    // التحقق من فرادة العناصر
    if (params.unique) {
      const uniqueValues = new Set(value);
      if (uniqueValues.size !== value.length) {
        return {
          error: {
            field: fieldName,
            message: rule.message || this.getErrorMessage('array_unique', fieldName),
            code: 'array_unique',
            value
          }
        };
      }
    }

    return {};
  }

  private validateObject(
    fieldName: string,
    value: unknown,
    rule: ValidationRule
  ): { error?: ValidationError; warning?: ValidationWarning } {
    
    if (value === null || value === undefined) {
      return {};
    }

    if (typeof value !== 'object' || Array.isArray(value)) {
      return {
        error: {
          field: fieldName,
          message: rule.message || this.getErrorMessage('invalid_type', fieldName),
          code: 'invalid_type',
          value
        }
      };
    }

    const params = rule.params || {};
    
    // التحقق من الخصائص المطلوبة
    if (params.requiredProperties && Array.isArray(params.requiredProperties)) {
      for (const prop of params.requiredProperties as string[]) {
        if (!(prop in (value as Record<string, unknown>))) {
          return {
            error: {
              field: fieldName,
              message: rule.message || this.getErrorMessage('object_missing_property', fieldName, { property: prop }),
              code: 'object_missing_property',
              value
            }
          };
        }
      }
    }

    return {};
  }

  private validateEnum(
    fieldName: string,
    value: unknown,
    rule: ValidationRule
  ): { error?: ValidationError; warning?: ValidationWarning } {
    
    if (value === null || value === undefined) {
      return {};
    }

    const params = rule.params || {};
    const allowedValues = params.values as unknown[];

    if (!allowedValues || !allowedValues.includes(value)) {
      return {
        error: {
          field: fieldName,
          message: rule.message || this.getErrorMessage('enum_invalid', fieldName, { 
            options: allowedValues?.join(', ') || '' 
          }),
          code: 'enum_invalid',
          value
        }
      };
    }

    return {};
  }

  private validateFile(
    fieldName: string,
    value: unknown,
    rule: ValidationRule
  ): { error?: ValidationError; warning?: ValidationWarning } {
    
    if (value === null || value === undefined) {
      return {};
    }

    // التحقق من نوع File
    if (!(value instanceof File)) {
      return {
        error: {
          field: fieldName,
          message: rule.message || this.getErrorMessage('file_required', fieldName),
          code: 'file_required',
          value
        }
      };
    }

    const params = rule.params || {};
    
    // التحقق من حجم الملف
    if (params.maxSize && value.size > (params.maxSize as number)) {
      return {
        error: {
          field: fieldName,
          message: rule.message || this.getErrorMessage('file_size_max', fieldName, { 
            max: this.formatFileSize(params.maxSize as number) 
          }),
          code: 'file_size_max',
          value
        }
      };
    }

    // التحقق من نوع الملف
    if (params.allowedTypes && Array.isArray(params.allowedTypes)) {
      const allowedTypes = params.allowedTypes as string[];
      if (!allowedTypes.includes(value.type)) {
        return {
          error: {
            field: fieldName,
            message: rule.message || this.getErrorMessage('file_type_invalid', fieldName, { 
              types: allowedTypes.join(', ') 
            }),
            code: 'file_type_invalid',
            value
          }
        };
      }
    }

    return {};
  }

  private validateCustom(
    fieldName: string,
    value: unknown,
    rule: ValidationRule
  ): { error?: ValidationError; warning?: ValidationWarning } {
    
    if (!rule.customValidator) {
      return {};
    }

    try {
      const isValid = rule.customValidator(value);
      
      if (!isValid) {
        return {
          error: {
            field: fieldName,
            message: rule.message || 'القيمة غير صحيحة',
            code: 'custom_validation_failed',
            value
          }
        };
      }

      return {};
    } catch (customError) {
      console.error('خطأ في التحقق المخصص:', customError);
      return {
        error: {
          field: fieldName,
          message: 'خطأ في التحقق المخصص',
          code: 'custom_validation_error',
          value
        }
      };
    }
  }

  // ======================================
  // دوال مساعدة
  // ======================================

  protected getErrorMessage(
    errorCode: string, 
    fieldName: string, 
    params?: Record<string, unknown>
  ): string {
    let message: string = ARABIC_MESSAGES[errorCode as keyof typeof ARABIC_MESSAGES] || 'خطأ في التحقق من البيانات';
    
    // استبدال المتغيرات في الرسالة
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        message = message.replace(`{${key}}`, String(value));
      }
    }

    return message;
  }

  protected formatResult(
    errors: ValidationError[], 
    warnings: ValidationWarning[] = []
  ): ValidationResult {
    return {
      isValid: errors.length === 0,
      errors,
      warnings: this.options.showWarnings ? warnings : []
    };
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // ======================================
  // دوال تنظيف
  // ======================================

  /**
   * تنظيف جميع المؤقتات عند تدمير المكون
   */
  cleanup(): void {
    this.timeouts.forEach((timeout) => {
      clearTimeout(timeout);
    });
    this.timeouts.clear();
  }
}

// ======================================
// 🔧 دوال مساعدة للإنشاء السريع
// ======================================

/**
 * إنشاء validator بسيط للنماذج
 */
export function createSimpleValidator<T extends Record<string, unknown>>(
  rules: FieldValidationRules,
  options?: FrontendValidationOptions
): FrontendBaseValidator<T> {
  return new FrontendBaseValidator<T>(rules, options);
}

/**
 * إنشاء قواعد تحقق شائعة
 */
export const ValidationRules = {
  required: (): ValidationRule => ({ type: 'required' }),
  
  string: (min?: number, max?: number): ValidationRule => ({ 
    type: 'string', 
    params: { min, max } 
  }),
  
  email: (): ValidationRule => ({ type: 'email' }),
  
  iraqiPhone: (): ValidationRule => ({ type: 'phone' }),
  
  number: (min?: number, max?: number, integer = false): ValidationRule => ({ 
    type: 'number', 
    params: { min, max, integer } 
  }),
  
  positiveNumber: (integer = false): ValidationRule => ({ 
    type: 'number', 
    params: { positive: true, integer } 
  }),
  
  array: (min?: number, max?: number, unique = false): ValidationRule => ({ 
    type: 'array', 
    params: { min, max, unique } 
  }),
  
  enum: (values: unknown[]): ValidationRule => ({ 
    type: 'enum', 
    params: { values } 
  }),
  
  file: (maxSize?: number, allowedTypes?: string[]): ValidationRule => ({ 
    type: 'file', 
    params: { maxSize, allowedTypes } 
  }),
  
  custom: (validator: (value: unknown) => boolean, message?: string): ValidationRule => ({ 
    type: 'custom', 
    customValidator: validator,
    message 
  })
};

export default FrontendBaseValidator; 
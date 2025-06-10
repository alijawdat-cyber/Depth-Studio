/**
 * 🔐 Frontend Auth Validators - تحقق المصادقة في الفرونت إند
 * ==============================================================
 * 
 * نظام validation شامل للمصادقة مع تكامل كامل مع Backend AuthValidators
 * يدعم جميع طرق المصادقة مع رسائل خطأ عربية وتحقق فوري
 * 
 * 📅 تاريخ الإنشاء: يونيو 2025
 * 👨‍💻 المطور: علي جودت
 * 🎯 الهدف: validation متقدم للمصادقة في Frontend
 * 🔗 Backend Reference: AuthValidators.ts (296 سطر)
 * 📋 Types Reference: auth.ts (314 سطر)
 */

import { 
  EmailRegistrationData,
  PhoneRegistrationData,
  GoogleRegistrationData,
  EmailLoginData,
  PhoneLoginData,
  GoogleLoginData,
  OTPSendRequest,
  OTPVerifyRequest,
  ValidationResult,
  ValidationError,
  FrontendValidationOptions
} from '@depth-studio/types';

import { 
  FrontendBaseValidator, 
  ARABIC_MESSAGES,
  FieldValidationRules,
  ValidationRuleType
} from './frontend-base-validator';

// ======================================
// 🌐 رسائل خطأ خاصة بالمصادقة
// ======================================

const AUTH_MESSAGES = {
  ...ARABIC_MESSAGES,
  
  // رسائل المصادقة المخصصة
  email_already_exists: "البريد الإلكتروني مسجل مسبقاً",
  phone_already_exists: "رقم الهاتف مسجل مسبقاً", 
  invalid_credentials: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
  
  // OTP
  otp_expired: "رمز التحقق منتهي الصلاحية",
  otp_invalid: "رمز التحقق غير صحيح",
  
  // كلمة المرور
  password_too_weak: "كلمة المرور ضعيفة جداً",
  password_contains_email: "كلمة المرور لا يجب أن تحتوي على البريد الإلكتروني",
  
  // الهاتف العراقي
  iraqi_phone_format_error: "رقم الهاتف العراقي يجب أن يكون بالتنسيق: 07xxxxxxxx",
  
  // الشروط والأحكام
  terms_not_accepted: "يجب قبول الشروط والأحكام للمتابعة",
  
  // الاسم الكامل
  full_name_too_short: "الاسم قصير جداً، يجب أن يكون على الأقل كلمتان",
  
  // جوجل
  google_token_required: "رمز جوجل مطلوب",
  google_token_invalid: "رمز جوجل غير صحيح"
} as const;

// ======================================
// 🏗️ Auth Validation Rules
// ======================================

const AUTH_VALIDATION_RULES = {
  
  // البريد الإلكتروني المتقدم
  email_advanced: {
    type: 'custom' as ValidationRuleType,
    message: AUTH_MESSAGES.string_email,
    customValidator: (value: unknown): boolean => {
      if (typeof value !== 'string') return false;
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    }
  },
  
  // كلمة المرور القوية
  password_strong: {
    type: 'custom' as ValidationRuleType,
    message: AUTH_MESSAGES.password_too_weak,
    customValidator: (value: unknown): boolean => {
      if (typeof value !== 'string') return false;
      
      if (value.length < 8) return false;
      if (!/[a-z]/.test(value)) return false;
      if (!/[A-Z]/.test(value)) return false;
      if (!/\d/.test(value)) return false;
      
      return true;
    }
  },
  
  // الهاتف العراقي المتقدم
  iraqi_phone_advanced: {
    type: 'custom' as ValidationRuleType,
    message: AUTH_MESSAGES.iraqi_phone_format_error,
    customValidator: (value: unknown): boolean => {
      if (typeof value !== 'string') return false;
      
      const cleanPhone = value.replace(/[\s\-\(\)]/g, '');
      const iraqiPhoneRegex = /^(\+964|964|0)?7[0-9]{9}$/;
      
      return iraqiPhoneRegex.test(cleanPhone);
    }
  },
  
  // الاسم الكامل المحسن
  full_name_enhanced: {
    type: 'custom' as ValidationRuleType,
    message: AUTH_MESSAGES.full_name_too_short,
    customValidator: (value: unknown): boolean => {
      if (typeof value !== 'string') return false;
      
      const trimmedName = value.trim();
      const words = trimmedName.split(/\s+/);
      
      if (words.length < 2) return false;
      if (words.some(word => word.length < 2)) return false;
      
      return true;
    }
  },
  
  // رمز OTP
  otp_code: {
    type: 'custom' as ValidationRuleType,
    message: AUTH_MESSAGES.otp_invalid,
    customValidator: (value: unknown): boolean => {
      if (typeof value !== 'string') return false;
      
      const otpRegex = /^\d{6}$/;
      return otpRegex.test(value);
    }
  },
  
  // رمز جوجل
  google_token: {
    type: 'custom' as ValidationRuleType,
    message: AUTH_MESSAGES.google_token_invalid,
    customValidator: (value: unknown): boolean => {
      if (typeof value !== 'string') return false;
      if (value.length < 10) return false;
      
      const tokenRegex = /^[A-Za-z0-9\.\-_]+$/;
      return tokenRegex.test(value);
    }
  }
} as const;

// ======================================
// 🔐 Frontend Auth Validators
// ======================================

/**
 * Validator للتسجيل بالبريد الإلكتروني
 */
export class EmailRegistrationValidator extends FrontendBaseValidator<EmailRegistrationData & Record<string, unknown>> {
  constructor(options: FrontendValidationOptions = {}) {
    const rules: FieldValidationRules = {
      email: [
        { type: 'required', message: AUTH_MESSAGES.required },
        AUTH_VALIDATION_RULES.email_advanced
      ],
      password: [
        { type: 'required', message: AUTH_MESSAGES.required },
        AUTH_VALIDATION_RULES.password_strong
      ],
      confirm_password: [
        { type: 'required', message: AUTH_MESSAGES.required }
      ],
      full_name: [
        { type: 'required', message: AUTH_MESSAGES.required },
        AUTH_VALIDATION_RULES.full_name_enhanced
      ],
      accept_terms: [
        { type: 'required', message: AUTH_MESSAGES.terms_not_accepted }
      ]
    };
    
    super(rules, { ...options, validateOnChange: true });
  }

  /**
   * تحقق خاص: كلمة المرور لا تحتوي على البريد
   */
  validatePasswordNotContainsEmail(data: EmailRegistrationData): ValidationResult {
    const errors: ValidationError[] = [];
    
    if (data.password && data.email) {
      const emailLocalPart = data.email.split('@')[0].toLowerCase();
      if (data.password.toLowerCase().includes(emailLocalPart)) {
        errors.push({
          field: 'password',
          message: AUTH_MESSAGES.password_contains_email,
          code: 'password_contains_email'
        });
      }
    }
    
    return this.formatResult(errors);
  }
}

/**
 * Validator لتسجيل الدخول بالبريد الإلكتروني
 */
export class EmailLoginValidator extends FrontendBaseValidator<EmailLoginData & Record<string, unknown>> {
  constructor(options: FrontendValidationOptions = {}) {
    const rules: FieldValidationRules = {
      email: [
        { type: 'required', message: AUTH_MESSAGES.required },
        { type: 'email', message: AUTH_MESSAGES.string_email }
      ],
      password: [
        { type: 'required', message: AUTH_MESSAGES.required }
      ]
    };
    
    super(rules, options);
  }
}

/**
 * Validator للتسجيل بالهاتف العراقي
 */
export class PhoneRegistrationValidator extends FrontendBaseValidator<PhoneRegistrationData & Record<string, unknown>> {
  constructor(options: FrontendValidationOptions = {}) {
    const rules: FieldValidationRules = {
      phone: [
        { type: 'required', message: AUTH_MESSAGES.required },
        AUTH_VALIDATION_RULES.iraqi_phone_advanced
      ],
      country_code: [
        { type: 'required', message: AUTH_MESSAGES.required }
      ],
      full_name: [
        { type: 'required', message: AUTH_MESSAGES.required },
        AUTH_VALIDATION_RULES.full_name_enhanced
      ],
      accept_terms: [
        { type: 'required', message: AUTH_MESSAGES.terms_not_accepted }
      ]
    };
    
    super(rules, options);
  }
}

/**
 * Validator لتسجيل الدخول بالهاتف
 */
export class PhoneLoginValidator extends FrontendBaseValidator<PhoneLoginData & Record<string, unknown>> {
  constructor(options: FrontendValidationOptions = {}) {
    const rules: FieldValidationRules = {
      phone: [
        { type: 'required', message: AUTH_MESSAGES.required },
        AUTH_VALIDATION_RULES.iraqi_phone_advanced
      ],
      country_code: [
        { type: 'required', message: AUTH_MESSAGES.required }
      ]
    };
    
    super(rules, options);
  }
}

/**
 * Validator للتسجيل بحساب جوجل
 */
export class GoogleRegistrationValidator extends FrontendBaseValidator<GoogleRegistrationData & Record<string, unknown>> {
  constructor(options: FrontendValidationOptions = {}) {
    const rules: FieldValidationRules = {
      google_token: [
        { type: 'required', message: AUTH_MESSAGES.google_token_required },
        AUTH_VALIDATION_RULES.google_token
      ],
      full_name: [
        { type: 'required', message: AUTH_MESSAGES.required },
        AUTH_VALIDATION_RULES.full_name_enhanced
      ],
      email: [
        { type: 'required', message: AUTH_MESSAGES.required },
        AUTH_VALIDATION_RULES.email_advanced
      ],
      accept_terms: [
        { type: 'required', message: AUTH_MESSAGES.terms_not_accepted }
      ]
    };
    
    super(rules, options);
  }
}

/**
 * Validator لتسجيل الدخول بجوجل
 */
export class GoogleLoginValidator extends FrontendBaseValidator<GoogleLoginData & Record<string, unknown>> {
  constructor(options: FrontendValidationOptions = {}) {
    const rules: FieldValidationRules = {
      google_token: [
        { type: 'required', message: AUTH_MESSAGES.google_token_required },
        AUTH_VALIDATION_RULES.google_token
      ]
    };
    
    super(rules, options);
  }
}

/**
 * Validator لإرسال OTP
 */
export class OTPSendValidator extends FrontendBaseValidator<OTPSendRequest & Record<string, unknown>> {
  constructor(options: FrontendValidationOptions = {}) {
    const rules: FieldValidationRules = {
      phone: [
        { type: 'required', message: AUTH_MESSAGES.required },
        AUTH_VALIDATION_RULES.iraqi_phone_advanced
      ],
      country_code: [
        { type: 'required', message: AUTH_MESSAGES.required }
      ],
      purpose: [
        { type: 'required', message: AUTH_MESSAGES.required }
      ]
    };
    
    super(rules, options);
  }
}

/**
 * Validator للتحقق من OTP
 */
export class OTPVerifyValidator extends FrontendBaseValidator<OTPVerifyRequest & Record<string, unknown>> {
  constructor(options: FrontendValidationOptions = {}) {
    const rules: FieldValidationRules = {
      phone: [
        { type: 'required', message: AUTH_MESSAGES.required },
        AUTH_VALIDATION_RULES.iraqi_phone_advanced
      ],
      country_code: [
        { type: 'required', message: AUTH_MESSAGES.required }
      ],
      otp_code: [
        { type: 'required', message: AUTH_MESSAGES.required },
        AUTH_VALIDATION_RULES.otp_code
      ]
    };
    
    super(rules, options);
  }
}

// ======================================
// 🏭 Factory Functions للاستخدام السهل
// ======================================

export function createEmailRegistrationValidator(options?: FrontendValidationOptions): EmailRegistrationValidator {
  return new EmailRegistrationValidator(options);
}

export function createEmailLoginValidator(options?: FrontendValidationOptions): EmailLoginValidator {
  return new EmailLoginValidator(options);
}

export function createPhoneRegistrationValidator(options?: FrontendValidationOptions): PhoneRegistrationValidator {
  return new PhoneRegistrationValidator(options);
}

export function createPhoneLoginValidator(options?: FrontendValidationOptions): PhoneLoginValidator {
  return new PhoneLoginValidator(options);
}

export function createGoogleRegistrationValidator(options?: FrontendValidationOptions): GoogleRegistrationValidator {
  return new GoogleRegistrationValidator(options);
}

export function createGoogleLoginValidator(options?: FrontendValidationOptions): GoogleLoginValidator {
  return new GoogleLoginValidator(options);
}

export function createOTPSendValidator(options?: FrontendValidationOptions): OTPSendValidator {
  return new OTPSendValidator(options);
}

export function createOTPVerifyValidator(options?: FrontendValidationOptions): OTPVerifyValidator {
  return new OTPVerifyValidator(options);
}

// ======================================
// 🔧 Utility Functions
// ======================================

/**
 * التحقق من قوة كلمة المرور
 */
export function checkPasswordStrength(password: string): {
  score: number;
  level: 'ضعيف' | 'متوسط' | 'قوي' | 'قوي جداً';
  suggestions: string[];
} {
  let score = 0;
  const suggestions: string[] = [];

  if (password.length >= 8) score += 25;
  else suggestions.push("استخدم 8 أحرف على الأقل");

  if (/[a-z]/.test(password)) score += 20;
  else suggestions.push("أضف أحرف صغيرة");

  if (/[A-Z]/.test(password)) score += 20;
  else suggestions.push("أضف أحرف كبيرة");

  if (/\d/.test(password)) score += 20;
  else suggestions.push("أضف أرقام");

  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 15;
  else suggestions.push("أضف رموز خاصة");

  let level: 'ضعيف' | 'متوسط' | 'قوي' | 'قوي جداً';
  if (score < 40) level = 'ضعيف';
  else if (score < 70) level = 'متوسط';
  else if (score < 90) level = 'قوي';
  else level = 'قوي جداً';

  return { score, level, suggestions };
}

/**
 * تنسيق رقم الهاتف العراقي
 */
export function formatIraqiPhone(phone: string): string {
  const cleanPhone = phone.replace(/\D/g, '');
  
  let formattedPhone = cleanPhone;
  if (cleanPhone.startsWith('7')) {
    formattedPhone = '+964' + cleanPhone;
  } else if (cleanPhone.startsWith('07')) {
    formattedPhone = '+964' + cleanPhone.substring(1);
  } else if (cleanPhone.startsWith('964')) {
    formattedPhone = '+' + cleanPhone;
  }
  
  return formattedPhone;
}

/**
 * التحقق من شبكة الهاتف العراقي
 */
export function getIraqiPhoneNetwork(phone: string): string | null {
  const cleanPhone = phone.replace(/\D/g, '');
  const phoneDigits = cleanPhone.replace(/^(964|0)/, '');
  
  if (phoneDigits.length !== 10) return null;
  
  const prefix = phoneDigits.substring(0, 3);
  
  if (['750', '751', '752', '753', '754', '755', '756', '757', '758', '759'].includes(prefix)) {
    return 'آسياسيل';
  } else if (['770', '771', '772', '773', '774', '775', '776', '777', '778', '779'].includes(prefix)) {
    return 'زين';
  } else if (['780', '781', '782', '783', '784', '785', '786', '787', '788', '789'].includes(prefix)) {
    return 'كورك';
  } else if (['790', '791', '792', '793', '794', '795', '796', '797', '798', '799'].includes(prefix)) {
    return 'إيرثلنك';
  }
  
  return null;
} 
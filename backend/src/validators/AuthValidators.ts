/**
 * 🔐 Auth Validators - التحقق من بيانات المصادقة
 * ===============================================
 * 
 * جميع schemas التحقق المطلوبة لـ AuthController
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
  PasswordSchema
} from './BaseValidator';

// تعريف قيم الـ enums كـ const arrays لاستخدامها في validation
const AUTH_PROVIDERS = ['email', 'phone', 'google'] as const;

const OTP_PURPOSES = [
  'registration',
  'login', 
  'phone_verification',
  'password_reset'
] as const;

// ======================================
// 🎯 Validation Schemas للمصادقة
// ======================================

/**
 * تسجيل بالبريد الإلكتروني
 */
export const EmailRegistrationSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
  confirm_password: PasswordSchema,
  full_name: z.string({
    required_error: "الاسم الكامل مطلوب"
  }).min(2, "الاسم يجب أن يكون على الأقل حرفان").max(100, "الاسم طويل جداً"),
  
  phone: IraqiPhoneSchema.optional(),
  
  accept_terms: z.boolean({
    required_error: "يجب قبول الشروط والأحكام"
  }).refine(val => val === true, {
    message: "يجب قبول الشروط والأحكام"
  })
}).refine(data => data.password === data.confirm_password, {
  message: "كلمة المرور وتأكيد كلمة المرور غير متطابقان",
  path: ["confirm_password"]
});

/**
 * دخول بالبريد الإلكتروني
 */
export const EmailLoginSchema = z.object({
  email: EmailSchema,
  password: z.string({
    required_error: "كلمة المرور مطلوبة"
  }).min(1, "كلمة المرور مطلوبة"),
  
  remember_me: z.boolean().optional()
});

/**
 * تسجيل بالهاتف العراقي
 */
export const PhoneRegistrationSchema = z.object({
  phone: IraqiPhoneSchema,
  country_code: z.literal('+964', {
    errorMap: () => ({ message: "رمز البلد يجب أن يكون +964 للعراق" })
  }),
  
  full_name: z.string({
    required_error: "الاسم الكامل مطلوب"
  }).min(2, "الاسم يجب أن يكون على الأقل حرفان").max(100, "الاسم طويل جداً"),
  
  accept_terms: z.boolean({
    required_error: "يجب قبول الشروط والأحكام"
  }).refine(val => val === true, {
    message: "يجب قبول الشروط والأحكام"
  })
});

/**
 * دخول بالهاتف العراقي
 */
export const PhoneLoginSchema = z.object({
  phone: IraqiPhoneSchema,
  country_code: z.literal('+964', {
    errorMap: () => ({ message: "رمز البلد يجب أن يكون +964 للعراق" })
  })
});

/**
 * تسجيل بحساب جوجل
 */
export const GoogleRegistrationSchema = z.object({
  google_token: z.string({
    required_error: "رمز جوجل مطلوب"
  }).min(10, "رمز جوجل غير صحيح"),
  
  full_name: z.string({
    required_error: "الاسم الكامل مطلوب"
  }).min(2, "الاسم يجب أن يكون على الأقل حرفان").max(100, "الاسم طويل جداً"),
  
  email: EmailSchema,
  
  profile_picture: z.string().url("رابط الصورة غير صحيح").optional(),
  
  accept_terms: z.boolean({
    required_error: "يجب قبول الشروط والأحكام"
  }).refine(val => val === true, {
    message: "يجب قبول الشروط والأحكام"
  })
});

/**
 * دخول بحساب جوجل
 */
export const GoogleLoginSchema = z.object({
  google_token: z.string({
    required_error: "رمز جوجل مطلوب"
  }).min(10, "رمز جوجل غير صحيح")
});

/**
 * إرسال OTP
 */
export const OTPSendSchema = z.object({
  phone: IraqiPhoneSchema,
  country_code: z.literal('+964', {
    errorMap: () => ({ message: "رمز البلد يجب أن يكون +964 للعراق" })
  }),
  
  user_id: IDSchema.optional(),
  
  purpose: z.enum(OTP_PURPOSES, {
    errorMap: () => ({ message: "غرض OTP غير صحيح" })
  })
});

/**
 * التحقق من OTP
 */
export const OTPVerifySchema = z.object({
  phone: IraqiPhoneSchema,
  country_code: z.literal('+964', {
    errorMap: () => ({ message: "رمز البلد يجب أن يكون +964 للعراق" })
  }),
  
  otp_code: z.string({
    required_error: "رمز OTP مطلوب"
  }).length(6, "رمز OTP يجب أن يكون 6 أرقام").regex(/^\d{6}$/, "رمز OTP يجب أن يحتوي على أرقام فقط"),
  
  user_id: IDSchema.optional()
});

/**
 * التحقق من صحة الهاتف العراقي
 */
export const ValidatePhoneSchema = z.object({
  phone: IraqiPhoneSchema,
  country_code: z.literal('+964', {
    errorMap: () => ({ message: "رمز البلد يجب أن يكون +964 للعراق" })
  })
});

/**
 * تسجيل الخروج
 */
export const LogoutSchema = z.object({
  user_id: IDSchema.optional()
});

/**
 * التحقق من نوع المصادقة
 */
export const AuthProviderSchema = z.object({
  provider: z.enum(AUTH_PROVIDERS, {
    errorMap: () => ({ message: "نوع المصادقة غير صحيح" })
  })
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
 * Middleware للتحقق من بيانات التسجيل بالبريد
 */
export const validateEmailRegistration = BaseValidator.createValidationMiddleware(
  EmailRegistrationSchema,
  'body'
);

/**
 * Middleware للتحقق من بيانات الدخول بالبريد
 */
export const validateEmailLogin = BaseValidator.createValidationMiddleware(
  EmailLoginSchema,
  'body'
);

/**
 * Middleware للتحقق من بيانات التسجيل بالهاتف
 */
export const validatePhoneRegistration = BaseValidator.createValidationMiddleware(
  PhoneRegistrationSchema,
  'body'
);

/**
 * Middleware للتحقق من بيانات الدخول بالهاتف
 */
export const validatePhoneLogin = BaseValidator.createValidationMiddleware(
  PhoneLoginSchema,
  'body'
);

/**
 * Middleware للتحقق من بيانات التسجيل بجوجل
 */
export const validateGoogleRegistration = BaseValidator.createValidationMiddleware(
  GoogleRegistrationSchema,
  'body'
);

/**
 * Middleware للتحقق من بيانات الدخول بجوجل
 */
export const validateGoogleLogin = BaseValidator.createValidationMiddleware(
  GoogleLoginSchema,
  'body'
);

/**
 * Middleware للتحقق من بيانات إرسال OTP
 */
export const validateOTPSend = BaseValidator.createValidationMiddleware(
  OTPSendSchema,
  'body'
);

/**
 * Middleware للتحقق من بيانات التحقق من OTP
 */
export const validateOTPVerify = BaseValidator.createValidationMiddleware(
  OTPVerifySchema,
  'body'
);

/**
 * Middleware للتحقق من بيانات التحقق من الهاتف
 */
export const validatePhoneValidation = BaseValidator.createValidationMiddleware(
  ValidatePhoneSchema,
  'body'
);

/**
 * Middleware للتحقق من بيانات تسجيل الخروج
 */
export const validateLogout = BaseValidator.createValidationMiddleware(
  LogoutSchema,
  'body'
);

/**
 * Middleware للتحقق من نوع المصادقة
 */
export const validateAuthProvider = BaseValidator.createValidationMiddleware(
  AuthProviderSchema,
  'body'
);

/**
 * Middleware للتحقق من معرف المستخدم في params
 */
export const validateUserIdParams = BaseValidator.createValidationMiddleware(
  UserIdParamsSchema,
  'params'
); 
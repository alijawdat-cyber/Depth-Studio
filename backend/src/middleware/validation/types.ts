/**
 * Validation Types - Depth Studio Backend
 * Type definitions for validation middleware
 */

import { ValidationChain } from 'express-validator'

// ======================================
// Core Types
// ======================================

/**
 * نتيجة التحقق من البيانات
 */
export interface ValidationError {
  field: string
  message: string
  value?: any
  location: string
}

/**
 * استجابة خطأ التحقق
 */
export interface ValidationErrorResponse {
  success: false
  error: 'validation_failed'
  message: string
  validation_errors: ValidationError[]
  timestamp: string
}

/**
 * إعدادات التحقق من الحقول
 */
export interface FieldValidationOptions {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  customMessage?: string
}

/**
 * إعدادات التحقق من الأرقام
 */
export interface NumberValidationOptions {
  required?: boolean
  min?: number
  max?: number
  isInteger?: boolean
  customMessage?: string
}

// ======================================
// Validation Groups Type
// ======================================

/**
 * مجموعة validations لنوع معين
 */
export type ValidationGroup = ValidationChain[]

// ======================================
// Enums for Validation
// ======================================

/**
 * أدوار المستخدمين المسموحة
 */
export const USER_ROLES = [
  'super_admin',
  'marketing_coordinator', 
  'brand_coordinator',
  'photographer'
] as const

export type UserRole = typeof USER_ROLES[number]

/**
 * حالات المستخدم المسموحة
 */
export const USER_STATUSES = [
  'active',
  'inactive', 
  'pending_approval',
  'suspended',
  'rejected'
] as const

export type UserStatus = typeof USER_STATUSES[number]

/**
 * أنواع البراندات المسموحة
 */
export const BRAND_TYPES = [
  'local',
  'international',
  'startup',
  'enterprise',
  'government'
] as const

export type BrandType = typeof BRAND_TYPES[number]

/**
 * الصناعات المسموحة
 */
export const INDUSTRIES = [
  'fashion',
  'food',
  'technology', 
  'healthcare',
  'education',
  'automotive',
  'real_estate',
  'travel',
  'sports',
  'entertainment',
  'finance',
  'retail',
  'beauty',
  'other'
] as const

export type Industry = typeof INDUSTRIES[number]

/**
 * حالات البراند المسموحة
 */
export const BRAND_STATUSES = [
  'active',
  'paused',
  'archived',
  'development'
] as const

export type BrandStatus = typeof BRAND_STATUSES[number]

/**
 * اللغات المدعومة
 */
export const SUPPORTED_LANGUAGES = [
  'ar',
  'en', 
  'both'
] as const

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number]

/**
 * المناطق الزمنية المدعومة
 */
export const SUPPORTED_TIMEZONES = [
  'Asia/Baghdad',
  'Asia/Kuwait',
  'Asia/Riyadh',
  'UTC'
] as const

export type SupportedTimezone = typeof SUPPORTED_TIMEZONES[number]

/**
 * اتجاهات الترتيب
 */
export const SORT_ORDERS = ['asc', 'desc'] as const
export type SortOrder = typeof SORT_ORDERS[number]

// ======================================
// Regular Expressions
// ======================================

/**
 * نمط رقم الهاتف العراقي
 */
export const IRAQI_PHONE_PATTERN = /^\+964(77|75|78|79)\d{7}$/

/**
 * نمط كلمة المرور القوية
 */
export const STRONG_PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/

/**
 * نمط النصوص العربية والإنجليزية
 */
export const ARABIC_ENGLISH_TEXT_PATTERN = /^[\u0600-\u06FF\u0750-\u077F\s\w]+$/

/**
 * نمط الأحرف العربية فقط
 */
export const ARABIC_ONLY_PATTERN = /^[\u0600-\u06FF\u0750-\u077F\s]+$/

/**
 * نمط الأحرف الإنجليزية فقط
 */
export const ENGLISH_ONLY_PATTERN = /^[a-zA-Z\s]+$/

// ======================================
// Default Validation Limits
// ======================================

/**
 * حدود التحقق الافتراضية
 */
export const DEFAULT_LIMITS = {
  // Text fields
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 50,
  MAX_DESCRIPTION_LENGTH: 1000,
  MAX_BIO_LENGTH: 500,
  
  // Password
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
  
  // Search and pagination
  MIN_SEARCH_LENGTH: 1,
  MAX_SEARCH_LENGTH: 100,
  MIN_PAGE_NUMBER: 1,
  MIN_LIMIT: 1,
  MAX_LIMIT: 100,
  
  // IDs
  MIN_ID_LENGTH: 20,
  MAX_ID_LENGTH: 30,
  
  // Percentage
  MIN_PERCENTAGE: 0,
  MAX_PERCENTAGE: 100
} as const

// ======================================
// Validation Messages
// ======================================

/**
 * رسائل الخطأ الافتراضية
 */
export const VALIDATION_MESSAGES = {
  REQUIRED: 'هذا الحقل مطلوب',
  EMAIL_INVALID: 'صيغة البريد الإلكتروني غير صحيحة',
  PHONE_INVALID: 'رقم الهاتف العراقي غير صحيح (مثال: +964770123456)',
  PASSWORD_WEAK: 'كلمة المرور يجب أن تحتوي على حرف صغير وحرف كبير ورقم',
  PASSWORD_LENGTH: `كلمة المرور يجب أن تكون بين ${DEFAULT_LIMITS.MIN_PASSWORD_LENGTH}-${DEFAULT_LIMITS.MAX_PASSWORD_LENGTH} حرف`,
  NAME_LENGTH: `الاسم يجب أن يكون بين ${DEFAULT_LIMITS.MIN_NAME_LENGTH}-${DEFAULT_LIMITS.MAX_NAME_LENGTH} حرف`,
  TEXT_PATTERN: 'يجب أن يحتوي على أحرف عربية أو إنجليزية فقط',
  URL_INVALID: 'يجب أن يكون رابط صحيح',
  DATE_INVALID: 'يجب أن يكون تاريخ صحيح',
  NUMBER_POSITIVE: 'يجب أن يكون رقم موجب',
  PERCENTAGE_RANGE: `يجب أن يكون بين ${DEFAULT_LIMITS.MIN_PERCENTAGE}-${DEFAULT_LIMITS.MAX_PERCENTAGE}`,
  ID_INVALID: 'المعرف غير صحيح',
  ROLE_INVALID: 'الدور المحدد غير صحيح',
  STATUS_INVALID: 'الحالة غير صحيحة',
  LANGUAGE_INVALID: 'اللغة غير صحيحة',
  TIMEZONE_INVALID: 'المنطقة الزمنية غير صحيحة'
} as const 
/**
 * Core Validators - Depth Studio Backend
 * Individual validation functions and field validators
 */

import { body, param, query, ValidationChain } from 'express-validator'
import {
  USER_ROLES,
  USER_STATUSES,
  BRAND_TYPES,
  BRAND_STATUSES,
  INDUSTRIES,
  SUPPORTED_LANGUAGES,
  SUPPORTED_TIMEZONES,
  SORT_ORDERS,
  IRAQI_PHONE_PATTERN,
  STRONG_PASSWORD_PATTERN,
  ARABIC_ENGLISH_TEXT_PATTERN,
  DEFAULT_LIMITS,
  VALIDATION_MESSAGES
} from './types'
import { sanitizeText } from './sanitizers'

// ======================================
// Core Field Validators
// ======================================

/**
 * تحقق من صحة معرف المستخدم
 */
export const validateUserId = [
  param('id')
    .isString()
    .isLength({ min: DEFAULT_LIMITS.MIN_ID_LENGTH, max: DEFAULT_LIMITS.MAX_ID_LENGTH })
    .withMessage(VALIDATION_MESSAGES.ID_INVALID)
]

/**
 * تحقق من صحة معرف البراند
 */
export const validateBrandId = [
  param('id')
    .isString()
    .isLength({ min: DEFAULT_LIMITS.MIN_ID_LENGTH, max: DEFAULT_LIMITS.MAX_ID_LENGTH })
    .withMessage(VALIDATION_MESSAGES.ID_INVALID)
]

// ======================================
// Contact Information Validators
// ======================================

/**
 * تحقق من صحة البريد الإلكتروني العراقي
 */
export const validateIraqiEmail = (field: string = 'email') => {
  return body(field)
    .isEmail()
    .withMessage(VALIDATION_MESSAGES.EMAIL_INVALID)
    .normalizeEmail()
}

/**
 * تحقق من صحة رقم الهاتف العراقي
 */
export const validateIraqiPhone = (field: string = 'phone') => {
  return body(field)
    .optional()
    .matches(IRAQI_PHONE_PATTERN)
    .withMessage(VALIDATION_MESSAGES.PHONE_INVALID)
}

/**
 * تحقق من صحة URL
 */
export const validateUrl = (field: string, isRequired: boolean = false) => {
  const validator = body(field)
    .isURL()
    .withMessage(VALIDATION_MESSAGES.URL_INVALID)

  return isRequired ? validator : validator.optional()
}

// ======================================
// Text Field Validators
// ======================================

/**
 * تحقق من صحة كلمة المرور
 */
export const validatePassword = (field: string = 'password') => {
  return body(field)
    .isLength({ min: DEFAULT_LIMITS.MIN_PASSWORD_LENGTH, max: DEFAULT_LIMITS.MAX_PASSWORD_LENGTH })
    .withMessage(VALIDATION_MESSAGES.PASSWORD_LENGTH)
    .matches(STRONG_PASSWORD_PATTERN)
    .withMessage(VALIDATION_MESSAGES.PASSWORD_WEAK)
}

/**
 * تحقق من صحة الاسم العربي/الإنجليزي
 */
export const validateName = (field: string, isRequired: boolean = true) => {
  const validator = body(field)
    .trim()
    .isLength({ min: DEFAULT_LIMITS.MIN_NAME_LENGTH, max: DEFAULT_LIMITS.MAX_NAME_LENGTH })
    .withMessage(VALIDATION_MESSAGES.NAME_LENGTH)
    .matches(ARABIC_ENGLISH_TEXT_PATTERN)
    .withMessage(VALIDATION_MESSAGES.TEXT_PATTERN)

  return isRequired ? validator : validator.optional()
}

/**
 * تحقق من صحة النص العربي
 */
export const validateArabicText = (field: string, min: number = 2, max: number = 100) => {
  return body(field)
    .custom((value: string) => {
      if (!value) return true // للحقول الاختيارية
      
      const cleanText = sanitizeText(value)
      if (cleanText.length < min || cleanText.length > max) {
        throw new Error(`${field} يجب أن يكون بين ${min}-${max} حرف`)
      }
      
      return true
    })
}

// ======================================
// Enum and Status Validators
// ======================================

/**
 * تحقق من صحة الدور
 */
export const validateUserRole = (field: string = 'primary_role') => {
  return body(field)
    .isIn(USER_ROLES)
    .withMessage(VALIDATION_MESSAGES.ROLE_INVALID)
}

/**
 * تحقق من صحة حالة المستخدم
 */
export const validateUserStatus = (field: string = 'status') => {
  return body(field)
    .optional()
    .isIn(USER_STATUSES)
    .withMessage(VALIDATION_MESSAGES.STATUS_INVALID)
}

/**
 * تحقق من صحة نوع البراند
 */
export const validateBrandType = (field: string = 'brand_type') => {
  return body(field)
    .isIn(BRAND_TYPES)
    .withMessage('نوع البراند غير صحيح')
}

/**
 * تحقق من صحة حالة البراند
 */
export const validateBrandStatus = (field: string = 'status') => {
  return body(field)
    .optional()
    .isIn(BRAND_STATUSES)
    .withMessage('حالة البراند غير صحيحة')
}

/**
 * تحقق من صحة الصناعة
 */
export const validateIndustry = (field: string = 'industry') => {
  return body(field)
    .isIn(INDUSTRIES)
    .withMessage('نوع الصناعة غير صحيح')
}

/**
 * تحقق من صحة اللغة
 */
export const validateLanguage = (field: string = 'language') => {
  return body(field)
    .optional()
    .isIn(SUPPORTED_LANGUAGES)
    .withMessage(VALIDATION_MESSAGES.LANGUAGE_INVALID)
}

/**
 * تحقق من صحة المنطقة الزمنية
 */
export const validateTimezone = (field: string = 'timezone') => {
  return body(field)
    .optional()
    .isIn(SUPPORTED_TIMEZONES)
    .withMessage(VALIDATION_MESSAGES.TIMEZONE_INVALID)
}

// ======================================
// Date and Number Validators
// ======================================

/**
 * تحقق من صحة التاريخ
 */
export const validateDate = (field: string, isRequired: boolean = false) => {
  const validator = body(field)
    .isISO8601()
    .withMessage(VALIDATION_MESSAGES.DATE_INVALID)
    .toDate()

  return isRequired ? validator : validator.optional()
}

/**
 * تحقق من صحة الرقم الموجب
 */
export const validatePositiveNumber = (field: string, isRequired: boolean = false) => {
  const validator = body(field)
    .isFloat({ min: 0 })
    .withMessage(VALIDATION_MESSAGES.NUMBER_POSITIVE)

  return isRequired ? validator : validator.optional()
}

/**
 * تحقق من صحة النسبة المئوية
 */
export const validatePercentage = (field: string, isRequired: boolean = false) => {
  const validator = body(field)
    .isFloat({ min: DEFAULT_LIMITS.MIN_PERCENTAGE, max: DEFAULT_LIMITS.MAX_PERCENTAGE })
    .withMessage(VALIDATION_MESSAGES.PERCENTAGE_RANGE)

  return isRequired ? validator : validator.optional()
}

// ======================================
// Array and ID Validators
// ======================================

/**
 * تحقق من صحة معرفات متعددة
 */
export const validateIds = (field: string = 'ids') => {
  return body(field)
    .isArray({ min: 1 })
    .withMessage('يجب إرسال مصفوفة من المعرفات')
    .custom((ids: string[]) => {
      if (!ids.every(id => typeof id === 'string' && 
          id.length >= DEFAULT_LIMITS.MIN_ID_LENGTH && 
          id.length <= DEFAULT_LIMITS.MAX_ID_LENGTH)) {
        throw new Error('جميع المعرفات يجب أن تكون نصوص صحيحة')
      }
      return true
    })
}

// ======================================
// Search and Pagination Validators
// ======================================

/**
 * مجموعة تحقق للبحث والفلترة
 */
export const validateSearchQuery = [
  query('search')
    .optional()
    .isLength({ min: DEFAULT_LIMITS.MIN_SEARCH_LENGTH, max: DEFAULT_LIMITS.MAX_SEARCH_LENGTH })
    .withMessage(`نص البحث يجب أن يكون بين ${DEFAULT_LIMITS.MIN_SEARCH_LENGTH}-${DEFAULT_LIMITS.MAX_SEARCH_LENGTH} حرف`),
  query('page')
    .optional()
    .isInt({ min: DEFAULT_LIMITS.MIN_PAGE_NUMBER })
    .withMessage('رقم الصفحة يجب أن يكون رقم موجب'),
  query('limit')
    .optional()
    .isInt({ min: DEFAULT_LIMITS.MIN_LIMIT, max: DEFAULT_LIMITS.MAX_LIMIT })
    .withMessage(`عدد العناصر يجب أن يكون بين ${DEFAULT_LIMITS.MIN_LIMIT}-${DEFAULT_LIMITS.MAX_LIMIT}`),
  query('sort_by')
    .optional()
    .isString()
    .isLength({ min: 1, max: 50 })
    .withMessage('حقل الترتيب غير صحيح'),
  query('sort_order')
    .optional()
    .isIn(SORT_ORDERS)
    .withMessage('اتجاه الترتيب يجب أن يكون asc أو desc')
]

// ======================================
// Complex Field Validators
// ======================================

/**
 * تحقق من صحة النبذة التعريفية
 */
export const validateBio = (field: string = 'bio') => {
  return body(field)
    .optional()
    .isLength({ max: DEFAULT_LIMITS.MAX_BIO_LENGTH })
    .withMessage(`النبذة التعريفية يجب أن تكون أقل من ${DEFAULT_LIMITS.MAX_BIO_LENGTH} حرف`)
}

/**
 * تحقق من صحة الوصف
 */
export const validateDescription = (field: string = 'description') => {
  return body(field)
    .optional()
    .isLength({ max: DEFAULT_LIMITS.MAX_DESCRIPTION_LENGTH })
    .withMessage(`الوصف يجب أن يكون أقل من ${DEFAULT_LIMITS.MAX_DESCRIPTION_LENGTH} حرف`)
}

/**
 * تحقق من صحة الحالة المنطقية
 */
export const validateBoolean = (field: string, isRequired: boolean = false) => {
  const validator = body(field)
    .isBoolean()
    .withMessage(`${field} يجب أن يكون true أو false`)

  return isRequired ? validator : validator.optional()
}

// ======================================
// Multi-language Field Validators
// ======================================

/**
 * تحقق من صحة الحقل متعدد اللغات
 */
export const validateMultiLanguageField = (fieldPrefix: string, isRequired: boolean = true) => {
  const validators: ValidationChain[] = []

  // Arabic field
  const arValidator = body(`${fieldPrefix}.ar`)
    .trim()
    .isLength({ min: DEFAULT_LIMITS.MIN_NAME_LENGTH, max: DEFAULT_LIMITS.MAX_NAME_LENGTH })
    .withMessage(`${fieldPrefix} بالعربية يجب أن يكون بين ${DEFAULT_LIMITS.MIN_NAME_LENGTH}-${DEFAULT_LIMITS.MAX_NAME_LENGTH} حرف`)

  // English field  
  const enValidator = body(`${fieldPrefix}.en`)
    .trim()
    .isLength({ min: DEFAULT_LIMITS.MIN_NAME_LENGTH, max: DEFAULT_LIMITS.MAX_NAME_LENGTH })
    .withMessage(`${fieldPrefix} بالإنجليزية يجب أن يكون بين ${DEFAULT_LIMITS.MIN_NAME_LENGTH}-${DEFAULT_LIMITS.MAX_NAME_LENGTH} حرف`)

  if (isRequired) {
    validators.push(
      arValidator.notEmpty().withMessage(`${fieldPrefix} بالعربية مطلوب`),
      enValidator.notEmpty().withMessage(`${fieldPrefix} بالإنجليزية مطلوب`)
    )
  } else {
    validators.push(arValidator.optional(), enValidator.optional())
  }

  return validators
}

// ======================================
// Custom Validation Helpers
// ======================================

/**
 * تحقق مخصص للحقول المتداخلة
 */
export const validateNestedField = (parentField: string, childField: string, customValidator: (value: any) => boolean | Promise<boolean>) => {
  return body(`${parentField}.${childField}`)
    .custom(customValidator)
} 
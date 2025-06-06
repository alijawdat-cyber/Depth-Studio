/**
 * Validation Handlers - Depth Studio Backend
 * Pre-configured validation groups for different operations
 */

import { Request, Response, NextFunction } from 'express'
import { validationResult, ValidationChain } from 'express-validator'
import { ValidationError, ValidationErrorResponse } from './types'
import {
  validateIraqiEmail,
  validatePassword,
  validateName,
  validateIraqiPhone,
  validateUserRole,
  validateUserStatus,
  validateLanguage,
  validateTimezone,
  validateBrandType,
  validateIndustry,
  validateUrl,
  validateDescription,
  validateBio,
  validateBoolean,
  validateMultiLanguageField,
  validateSearchQuery
} from './validators'

// ======================================
// Core Validation Handler
// ======================================

/**
 * Middleware للتحقق من نتائج التحقق وإرجاع أخطاء مفصلة
 */
export const validateInput = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req)
  
  if (!errors.isEmpty()) {
    const errorDetails: ValidationError[] = errors.array().map(error => ({
      field: error.type === 'field' ? (error as any).path : 'unknown',
      message: error.msg,
      value: error.type === 'field' ? (error as any).value : undefined,
      location: error.type === 'field' ? (error as any).location : 'unknown'
    }))

    const response: ValidationErrorResponse = {
      success: false,
      error: 'validation_failed',
      message: 'البيانات المرسلة غير صحيحة',
      validation_errors: errorDetails,
      timestamp: new Date().toISOString()
    }

    res.status(400).json(response)
    return
  }

  next()
}

// ======================================
// User Validation Groups
// ======================================

/**
 * مجموعة تحقق لإنشاء مستخدم جديد
 */
export const validateCreateUser: ValidationChain[] = [
  validateIraqiEmail('email'),
  validatePassword('password'),
  validateName('first_name', true),
  validateName('last_name', true),
  validateIraqiPhone('phone'),
  validateUserRole('primary_role'),
  validateLanguage('language'),
  validateTimezone('timezone'),
  validateBio('bio')
]

/**
 * مجموعة تحقق لتحديث المستخدم
 */
export const validateUpdateUser: ValidationChain[] = [
  validateIraqiEmail('email').optional(),
  validateName('first_name', false),
  validateName('last_name', false),
  validateIraqiPhone('phone'),
  validateUserRole('primary_role').optional(),
  validateUserStatus('status'),
  validateLanguage('language'),
  validateTimezone('timezone'),
  validateBio('bio'),
  validateBoolean('is_active', false)
]

/**
 * مجموعة تحقق لتسجيل الدخول
 */
export const validateUserLogin: ValidationChain[] = [
  validateIraqiEmail('email'),
  validatePassword('password')
]

/**
 * مجموعة تحقق لتغيير كلمة المرور
 */
export const validateChangePassword: ValidationChain[] = [
  validatePassword('current_password'),
  validatePassword('new_password'),
  validatePassword('confirm_password').custom((value, { req }) => {
    if (value !== req.body.new_password) {
      throw new Error('تأكيد كلمة المرور غير متطابق')
    }
    return true
  })
]

/**
 * مجموعة تحقق لإعادة تعيين كلمة المرور
 */
export const validateResetPassword: ValidationChain[] = [
  validateIraqiEmail('email')
]

// ======================================
// Brand Validation Groups
// ======================================

/**
 * مجموعة تحقق لإنشاء براند جديد
 */
export const validateCreateBrand: ValidationChain[] = [
  ...validateMultiLanguageField('name', true),
  ...validateMultiLanguageField('description', false).map(v => v.isLength({ max: 1000 })),
  validateBrandType('brand_type'),
  validateIndustry('industry'),
  validateUrl('contact_info.website_url', false),
  validateIraqiEmail('contact_info.primary_contact_email'),
  validateIraqiPhone('contact_info.primary_contact_phone')
]

/**
 * مجموعة تحقق لتحديث البراند
 */
export const validateUpdateBrand: ValidationChain[] = [
  ...validateMultiLanguageField('name', false),
  ...validateMultiLanguageField('description', false).map(v => v.isLength({ max: 1000 })),
  validateBrandType('brand_type').optional(),
  validateIndustry('industry').optional(),
  validateUrl('contact_info.website_url', false),
  validateIraqiEmail('contact_info.primary_contact_email').optional(),
  validateIraqiPhone('contact_info.primary_contact_phone'),
  validateBoolean('is_active', false)
]

// ======================================
// Campaign Validation Groups
// ======================================

/**
 * مجموعة تحقق لإنشاء حملة جديدة
 */
export const validateCreateCampaign: ValidationChain[] = [
  ...validateMultiLanguageField('name', true),
  ...validateMultiLanguageField('description', false).map(v => v.isLength({ max: 1000 })),
  validateName('brand_id', true),
  validateName('target_audience', true),
  validateBio('campaign_objectives'),
  validateBoolean('is_active', false)
]

/**
 * مجموعة تحقق لتحديث الحملة
 */
export const validateUpdateCampaign: ValidationChain[] = [
  ...validateMultiLanguageField('name', false),
  ...validateMultiLanguageField('description', false).map(v => v.isLength({ max: 1000 })),
  validateName('target_audience', false),
  validateBio('campaign_objectives'),
  validateBoolean('is_active', false)
]

// ======================================
// Profile Validation Groups
// ======================================

/**
 * مجموعة تحقق لتحديث الملف الشخصي
 */
export const validateUpdateProfile: ValidationChain[] = [
  validateName('first_name', false),
  validateName('last_name', false),
  validateIraqiPhone('phone'),
  validateLanguage('language'),
  validateTimezone('timezone'),
  validateBio('bio'),
  validateUrl('social_media.linkedin', false),
  validateUrl('social_media.instagram', false),
  validateUrl('social_media.twitter', false)
]

/**
 * مجموعة تحقق لتحديث الإعدادات
 */
export const validateUpdateSettings: ValidationChain[] = [
  validateLanguage('language'),
  validateTimezone('timezone'),
  validateBoolean('notifications.email_notifications', false),
  validateBoolean('notifications.push_notifications', false),
  validateBoolean('notifications.sms_notifications', false),
  validateBoolean('privacy.profile_visibility', false),
  validateBoolean('privacy.contact_visibility', false)
]

// ======================================
// File Upload Validation Groups
// ======================================

/**
 * مجموعة تحقق لرفع الملفات
 */
export const validateFileUpload: ValidationChain[] = [
  validateName('file_purpose', true),
  validateDescription('file_description'),
  validateBoolean('is_public', false)
]

/**
 * مجموعة تحقق لرفع الصور
 */
export const validateImageUpload: ValidationChain[] = [
  validateName('image_category', true),
  validateDescription('image_description'),
  validateBio('alt_text'),
  validateBoolean('is_public', false)
]

// ======================================
// API and System Validation Groups
// ======================================

/**
 * مجموعة تحقق للبحث والفلترة
 */
export const validateSearchAndFilter = validateSearchQuery

/**
 * مجموعة تحقق لتحديث الحالة
 */
export const validateStatusUpdate: ValidationChain[] = [
  validateName('status', true),
  validateDescription('reason')
]

/**
 * مجموعة تحقق للتعليقات
 */
export const validateComment: ValidationChain[] = [
  validateBio('content'),
  validateName('parent_id', false),
  validateBoolean('is_public', false)
]

/**
 * مجموعة تحقق للتقييمات
 */
export const validateRating: ValidationChain[] = [
  validateName('rating', true).isFloat({ min: 1, max: 5 }).withMessage('التقييم يجب أن يكون بين 1-5'),
  validateBio('review_text'),
  validateBoolean('is_anonymous', false)
]

// ======================================
// Batch Operations Validation Groups
// ======================================

/**
 * مجموعة تحقق للعمليات المتعددة
 */
export const validateBatchOperation: ValidationChain[] = [
  validateName('operation_type', true),
  validateName('target_ids', true).isArray({ min: 1, max: 100 }).withMessage('يجب اختيار 1-100 عنصر'),
  validateDescription('batch_reason')
]

/**
 * مجموعة تحقق لاستيراد البيانات
 */
export const validateDataImport: ValidationChain[] = [
  validateName('import_type', true),
  validateName('file_format', true).isIn(['csv', 'json', 'xlsx']).withMessage('نوع الملف غير مدعوم'),
  validateBoolean('validate_before_import', false),
  validateBoolean('skip_duplicates', false)
]

// ======================================
// Notification Validation Groups
// ======================================

/**
 * مجموعة تحقق لإرسال الإشعارات
 */
export const validateSendNotification: ValidationChain[] = [
  validateName('notification_type', true),
  ...validateMultiLanguageField('title', true),
  ...validateMultiLanguageField('message', true).map(v => v.isLength({ max: 500 })),
  validateName('target_users', false).isArray().withMessage('قائمة المستخدمين يجب أن تكون مصفوفة'),
  validateBoolean('send_immediately', false)
]

// ======================================
// Report Validation Groups
// ======================================

/**
 * مجموعة تحقق لإنشاء التقارير
 */
export const validateCreateReport: ValidationChain[] = [
  validateName('report_type', true),
  validateName('date_range.start', true).isISO8601().withMessage('تاريخ البداية غير صحيح'),
  validateName('date_range.end', true).isISO8601().withMessage('تاريخ النهاية غير صحيح'),
  validateName('filters', false).isObject().withMessage('الفلاتر يجب أن تكون كائن'),
  validateName('export_format', false).isIn(['pdf', 'csv', 'xlsx']).withMessage('نوع التصدير غير مدعوم')
]
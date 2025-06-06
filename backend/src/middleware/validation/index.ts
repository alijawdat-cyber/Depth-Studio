/**
 * Validation Middleware - Depth Studio Backend
 * Main exports for validation functionality
 */

// ======================================
// Core Types and Constants
// ======================================

export {
  // Core Types
  ValidationError,
  ValidationErrorResponse,
  FieldValidationOptions,
  NumberValidationOptions,
  ValidationGroup,
  
  // Type Definitions
  UserRole,
  UserStatus,
  BrandType,
  BrandStatus,
  Industry,
  SupportedLanguage,
  SupportedTimezone,
  SortOrder,
  
  // Constants and Enums
  USER_ROLES,
  USER_STATUSES,
  BRAND_TYPES,
  BRAND_STATUSES,
  INDUSTRIES,
  SUPPORTED_LANGUAGES,
  SUPPORTED_TIMEZONES,
  SORT_ORDERS,
  
  // Patterns and Limits
  IRAQI_PHONE_PATTERN,
  STRONG_PASSWORD_PATTERN,
  ARABIC_ENGLISH_TEXT_PATTERN,
  ARABIC_ONLY_PATTERN,
  ENGLISH_ONLY_PATTERN,
  DEFAULT_LIMITS,
  VALIDATION_MESSAGES
} from './types'

// ======================================
// Sanitization Functions
// ======================================

export {
  // Text Sanitization
  sanitizeText,
  sanitizeArabicText,
  sanitizeEnglishText,
  sanitizeName,
  
  // Contact Information
  sanitizeEmail,
  sanitizeIraqiPhone,
  sanitizeUrl,
  
  // Numbers and Data
  sanitizeNumber,
  sanitizePercentage,
  
  // IDs and Arrays
  sanitizeId,
  sanitizeIdArray,
  
  // HTML and Security
  stripHtmlTags,
  sanitizeHtml,
  
  // Special Formats
  sanitizeSlug,
  sanitizeSearchQuery,
  sanitizeBio,
  
  // Batch Operations
  sanitizeObjectFields
} from './sanitizers'

// ======================================
// Individual Validators
// ======================================

export {
  // Core Field Validators
  validateUserId,
  validateBrandId,
  
  // Contact Information
  validateIraqiEmail,
  validateIraqiPhone,
  validateUrl,
  
  // Text Fields
  validatePassword,
  validateName,
  validateArabicText,
  
  // Enums and Status
  validateUserRole,
  validateUserStatus,
  validateBrandType,
  validateBrandStatus,
  validateIndustry,
  validateLanguage,
  validateTimezone,
  
  // Date and Numbers
  validateDate,
  validatePositiveNumber,
  validatePercentage,
  
  // Arrays and IDs
  validateIds,
  
  // Search and Pagination
  validateSearchQuery,
  
  // Complex Fields
  validateBio,
  validateDescription,
  validateBoolean,
  validateMultiLanguageField,
  validateNestedField
} from './validators'

// ======================================
// Pre-configured Validation Groups
// ======================================

export {
  // Core Handler
  validateInput,
  
  // User Operations
  validateCreateUser,
  validateUpdateUser,
  validateUserLogin,
  validateChangePassword,
  validateResetPassword,
  
  // Brand Operations
  validateCreateBrand,
  validateUpdateBrand,
  
  // Campaign Operations
  validateCreateCampaign,
  validateUpdateCampaign,
  
  // Profile Operations
  validateUpdateProfile,
  validateUpdateSettings,
  
  // File Operations
  validateFileUpload,
  validateImageUpload,
  
  // API Operations
  validateSearchAndFilter,
  validateStatusUpdate,
  validateComment,
  validateRating,
  
  // Batch Operations
  validateBatchOperation,
  validateDataImport,
  
  // Notification Operations
  validateSendNotification,
  
  // Report Operations
  validateCreateReport
} from './handlers'

// ======================================
// Re-export from handlers for convenience
// ======================================

import * as handlers from './handlers'

/**
 * مجموعات التحقق الجاهزة للاستخدام السريع
 */
export const ValidationPresets = {
  // User presets
  user: {
    create: handlers.validateCreateUser,
    update: handlers.validateUpdateUser,
    login: handlers.validateUserLogin,
    changePassword: handlers.validateChangePassword,
    resetPassword: handlers.validateResetPassword
  },
  
  // Brand presets
  brand: {
    create: handlers.validateCreateBrand,
    update: handlers.validateUpdateBrand
  },
  
  // Campaign presets
  campaign: {
    create: handlers.validateCreateCampaign,
    update: handlers.validateUpdateCampaign
  },
  
  // Profile presets
  profile: {
    update: handlers.validateUpdateProfile,
    settings: handlers.validateUpdateSettings
  },
  
  // File presets
  file: {
    upload: handlers.validateFileUpload,
    image: handlers.validateImageUpload
  },
  
  // API presets
  api: {
    search: handlers.validateSearchAndFilter,
    status: handlers.validateStatusUpdate,
    comment: handlers.validateComment,
    rating: handlers.validateRating
  },
  
  // Batch presets
  batch: {
    operation: handlers.validateBatchOperation,
    import: handlers.validateDataImport
  },
  
  // System presets
  system: {
    notification: handlers.validateSendNotification,
    report: handlers.validateCreateReport
  }
}

// ======================================
// Helper Functions
// ======================================

/**
 * دالة مساعدة لتطبيق validation group مع handler
 */
export const applyValidation = (validationGroup: any[]) => {
  return [...validationGroup, handlers.validateInput]
}

/**
 * دالة مساعدة لدمج عدة validation groups
 */
export const combineValidations = (...validationGroups: any[][]) => {
  return validationGroups.flat()
}

/**
 * دالة مساعدة لإنشاء validation مخصص
 */
export const createCustomValidation = (field: string, validator: any, message: string) => {
  return validator.withMessage(message)
}

// ======================================
// Default Export
// ======================================

export default {
  // Core functionality
  validateInput: handlers.validateInput,
  ValidationPresets,
  
  // Helper functions
  applyValidation,
  combineValidations,
  createCustomValidation
} 
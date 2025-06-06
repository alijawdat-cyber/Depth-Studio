import { Request, Response, NextFunction } from 'express'
import { body, param, validationResult } from 'express-validator'

// ======================================
// Auth Request Validators
// ======================================

/**
 * Handle validation errors
 */
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req)
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'خطأ في البيانات المدخلة',
      errors: errors.array().map(error => ({
        field: error.type === 'field' ? error.path : 'unknown',
        message: error.msg,
        value: error.type === 'field' ? error.value : undefined
      }))
    })
  }
  
  next()
}

/**
 * Auth request validators
 */
export const validateAuthRequest = {
  /**
   * Login validation
   */
  login: [
    body('uid')
      .notEmpty()
      .withMessage('معرف المستخدم مطلوب')
      .isString()
      .withMessage('معرف المستخدم يجب أن يكون نص')
      .isLength({ min: 1, max: 100 })
      .withMessage('معرف المستخدم يجب أن يكون بين 1-100 حرف'),
    handleValidationErrors
  ],

  /**
   * Logout validation
   */
  logout: [
    body('uid')
      .notEmpty()
      .withMessage('معرف المستخدم مطلوب')
      .isString()
      .withMessage('معرف المستخدم يجب أن يكون نص'),
    handleValidationErrors
  ],

  /**
   * Verify user validation
   */
  verify: [
    param('uid')
      .notEmpty()
      .withMessage('معرف المستخدم مطلوب')
      .isString()
      .withMessage('معرف المستخدم يجب أن يكون نص'),
    handleValidationErrors
  ],

  /**
   * Refresh token validation
   */
  refresh: [
    body('refreshToken')
      .notEmpty()
      .withMessage('رمز التحديث مطلوب')
      .isString()
      .withMessage('رمز التحديث يجب أن يكون نص'),
    handleValidationErrors
  ],

  /**
   * Get permissions validation
   */
  permissions: [
    param('uid')
      .notEmpty()
      .withMessage('معرف المستخدم مطلوب')
      .isString()
      .withMessage('معرف المستخدم يجب أن يكون نص'),
    handleValidationErrors
  ],

  /**
   * Update permissions validation
   */
  updatePermissions: [
    param('uid')
      .notEmpty()
      .withMessage('معرف المستخدم مطلوب')
      .isString()
      .withMessage('معرف المستخدم يجب أن يكون نص'),
    body('permissions')
      .notEmpty()
      .withMessage('الصلاحيات مطلوبة')
      .isObject()
      .withMessage('الصلاحيات يجب أن تكون كائن'),
    body('updatedBy')
      .notEmpty()
      .withMessage('معرف المحدث مطلوب')
      .isString()
      .withMessage('معرف المحدث يجب أن يكون نص'),
    handleValidationErrors
  ],

  /**
   * Check permission validation
   */
  checkPermission: [
    body('uid')
      .notEmpty()
      .withMessage('معرف المستخدم مطلوب')
      .isString()
      .withMessage('معرف المستخدم يجب أن يكون نص'),
    body('permission')
      .notEmpty()
      .withMessage('الصلاحية مطلوبة')
      .isString()
      .withMessage('الصلاحية يجب أن تكون نص'),
    handleValidationErrors
  ]
} 
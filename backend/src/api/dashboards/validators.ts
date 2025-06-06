import { Request, Response, NextFunction } from 'express'
import { body, param, validationResult } from 'express-validator'

// ======================================
// Dashboard Request Validators
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
 * Dashboard request validators
 */
export const validateDashboardRequest = {
  /**
   * Super Admin Dashboard validation
   */
  superAdmin: [
    // TODO: Add specific validations if needed
    handleValidationErrors
  ],

  /**
   * Marketing Coordinator Dashboard validation
   */
  marketingCoordinator: [
    // TODO: Add specific validations if needed
    handleValidationErrors
  ],

  /**
   * Brand Coordinator Dashboard validation
   */
  brandCoordinator: [
    param('brandId')
      .notEmpty()
      .withMessage('معرف العلامة التجارية مطلوب')
      .isString()
      .withMessage('معرف العلامة التجارية يجب أن يكون نص')
      .isLength({ min: 1, max: 100 })
      .withMessage('معرف العلامة التجارية يجب أن يكون بين 1-100 حرف'),
    handleValidationErrors
  ],

  /**
   * Photographer Dashboard validation
   */
  photographer: [
    param('photographerId')
      .notEmpty()
      .withMessage('معرف المصور مطلوب')
      .isString()
      .withMessage('معرف المصور يجب أن يكون نص')
      .isLength({ min: 1, max: 100 })
      .withMessage('معرف المصور يجب أن يكون بين 1-100 حرف'),
    handleValidationErrors
  ]
} 
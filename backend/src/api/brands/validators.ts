/**
 * 🏢 Brand Validators
 * 
 * تطوير علي جودت - Depth Studio
 * آخر تحديث: يناير 2025
 * 
 * @description Validation schemas for brand operations
 * @version 1.0.0
 */

import { body, param, query } from 'express-validator';

/**
 * Validation for creating a new brand
 */
export const createBrandValidation = [
  body('name').notEmpty().withMessage('Brand name is required'),
  body('name').isLength({ min: 2, max: 100 }).withMessage('Brand name must be between 2 and 100 characters'),
  body('description').optional().isLength({ max: 500 }).withMessage('Description must not exceed 500 characters'),
  body('brand_type').isIn(['local', 'international', 'franchise', 'startup']).withMessage('Invalid brand type'),
  body('industry').notEmpty().withMessage('Industry is required'),
  body('website').optional().isURL().withMessage('Invalid website URL'),
  body('email').optional().isEmail().withMessage('Invalid email format'),
  body('phone').optional().isMobilePhone('any').withMessage('Invalid phone number'),
  body('address').optional().isString().withMessage('Address must be a string'),
  body('assigned_coordinator').optional().isString().withMessage('Assigned coordinator must be a string')
];

/**
 * Validation for updating a brand
 */
export const updateBrandValidation = [
  param('id').notEmpty().withMessage('Brand ID is required'),
  body('name').optional().isLength({ min: 2, max: 100 }).withMessage('Brand name must be between 2 and 100 characters'),
  body('description').optional().isLength({ max: 500 }).withMessage('Description must not exceed 500 characters'),
  body('brand_type').optional().isIn(['local', 'international', 'franchise', 'startup']).withMessage('Invalid brand type'),
  body('industry').optional().isString().withMessage('Industry must be a string'),
  body('website').optional().isURL().withMessage('Invalid website URL'),
  body('email').optional().isEmail().withMessage('Invalid email format'),
  body('phone').optional().isMobilePhone('any').withMessage('Invalid phone number'),
  body('address').optional().isString().withMessage('Address must be a string'),
  body('status').optional().isIn(['active', 'inactive', 'pending', 'suspended']).withMessage('Invalid status'),
  body('assigned_coordinator').optional().isString().withMessage('Assigned coordinator must be a string')
];

/**
 * Validation for getting brand by ID
 */
export const getBrandByIdValidation = [
  param('id').notEmpty().withMessage('Brand ID is required')
];

/**
 * Validation for deleting a brand
 */
export const deleteBrandValidation = [
  param('id').notEmpty().withMessage('Brand ID is required')
];

/**
 * Validation for getting brands list with filters
 */
export const getBrandsValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['active', 'inactive', 'pending', 'suspended']).withMessage('Invalid status filter'),
  query('brand_type').optional().isIn(['local', 'international', 'franchise', 'startup']).withMessage('Invalid brand type filter'),
  query('industry').optional().isString().withMessage('Industry filter must be a string'),
  query('assigned_coordinator').optional().isString().withMessage('Assigned coordinator filter must be a string'),
  query('sort_by').optional().isIn(['created_at', 'updated_at', 'name', 'status']).withMessage('Invalid sort field'),
  query('sort_order').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc'),
  query('created_after').optional().isISO8601().withMessage('Invalid created_after date'),
  query('created_before').optional().isISO8601().withMessage('Invalid created_before date')
];

/**
 * Validation for brand search
 */
export const searchBrandsValidation = [
  query('q').notEmpty().withMessage('Search term is required'),
  query('q').isLength({ min: 2 }).withMessage('Search term must be at least 2 characters'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
];

/**
 * Validation for assigning coordinator to brand
 */
export const assignCoordinatorValidation = [
  param('id').notEmpty().withMessage('Brand ID is required'),
  body('coordinator_id').notEmpty().withMessage('Coordinator ID is required'),
  body('coordinator_id').isString().withMessage('Coordinator ID must be a string')
];

/**
 * Validation for brand statistics
 */
export const getBrandStatsValidation = [
  param('id').notEmpty().withMessage('Brand ID is required'),
  query('period').optional().isIn(['day', 'week', 'month', 'quarter', 'year']).withMessage('Invalid period'),
  query('start_date').optional().isISO8601().withMessage('Invalid start date'),
  query('end_date').optional().isISO8601().withMessage('Invalid end date')
];

export const brandValidators = {
  createBrandValidation,
  updateBrandValidation,
  getBrandByIdValidation,
  deleteBrandValidation,
  getBrandsValidation,
  searchBrandsValidation,
  assignCoordinatorValidation,
  getBrandStatsValidation
}; 
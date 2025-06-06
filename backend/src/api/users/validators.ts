/**
 * ⚡ User Validation Schemas
 * 
 * تطوير علي جودت - Depth Studio
 * آخر تحديث: يناير 2025
 * 
 * @description Validation schemas for user endpoints
 * @version 1.0.0
 */

import { body, param, query } from 'express-validator';

/**
 * Validation for creating a new user
 */
export const createUserValidation = [
  body('email').isEmail().withMessage('Invalid email format'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('first_name').notEmpty().withMessage('First name is required'),
  body('last_name').notEmpty().withMessage('Last name is required'),
  body('phone').optional().isMobilePhone('any').withMessage('Invalid phone number'),
  body('primary_role').isIn(['super_admin', 'marketing_coordinator', 'brand_coordinator', 'photographer']).withMessage('Invalid role'),
  body('language').optional().isIn(['ar', 'en']).withMessage('Language must be ar or en'),
  body('timezone').optional().isString().withMessage('Timezone must be a string')
];

/**
 * Validation for updating a user
 */
export const updateUserValidation = [
  param('id').notEmpty().withMessage('User ID is required'),
  body('email').optional().isEmail().withMessage('Invalid email format'),
  body('first_name').optional().notEmpty().withMessage('First name cannot be empty'),
  body('last_name').optional().notEmpty().withMessage('Last name cannot be empty'),
  body('phone').optional().isMobilePhone('any').withMessage('Invalid phone number'),
  body('primary_role').optional().isIn(['super_admin', 'marketing_coordinator', 'brand_coordinator', 'photographer']).withMessage('Invalid role'),
  body('language').optional().isIn(['ar', 'en']).withMessage('Language must be ar or en'),
  body('status').optional().isIn(['active', 'inactive', 'pending_approval', 'suspended']).withMessage('Invalid status')
];

/**
 * Validation for getting user by ID
 */
export const getUserByIdValidation = [
  param('id').notEmpty().withMessage('User ID is required')
];

/**
 * Validation for deleting a user
 */
export const deleteUserValidation = [
  param('id').notEmpty().withMessage('User ID is required')
];

/**
 * Validation for getting users list with filters
 */
export const getUsersValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('role').optional().isIn(['super_admin', 'marketing_coordinator', 'brand_coordinator', 'photographer']).withMessage('Invalid role filter'),
  query('status').optional().isIn(['active', 'inactive', 'pending_approval', 'suspended']).withMessage('Invalid status filter'),
  query('is_active').optional().isBoolean().withMessage('is_active must be boolean'),
  query('sort_by').optional().isIn(['created_at', 'updated_at', 'first_name', 'last_name', 'email']).withMessage('Invalid sort field'),
  query('sort_order').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc')
];

/**
 * Validation for user search
 */
export const searchUsersValidation = [
  query('search').notEmpty().withMessage('Search term is required'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
];

/**
 * Validation for user activation/deactivation
 */
export const toggleUserStatusValidation = [
  param('id').notEmpty().withMessage('User ID is required'),
  body('reason').optional().isString().withMessage('Reason must be a string')
];

/**
 * Validation for user stats endpoint
 */
export const getUserStatsValidation = [
  query('period').optional().isIn(['day', 'week', 'month', 'year']).withMessage('Invalid period'),
  query('start_date').optional().isISO8601().withMessage('Invalid start date'),
  query('end_date').optional().isISO8601().withMessage('Invalid end date')
];

export const userValidators = {
  createUserValidation,
  updateUserValidation,
  getUserByIdValidation,
  deleteUserValidation,
  getUsersValidation,
  searchUsersValidation,
  toggleUserStatusValidation,
  getUserStatsValidation
}; 
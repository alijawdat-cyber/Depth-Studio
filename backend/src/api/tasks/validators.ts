/**
 * 📋 Task Validators
 * 
 * تطوير علي جودت - Depth Studio
 * آخر تحديث: يناير 2025
 * 
 * @description Validation schemas for task operations
 * @version 1.0.0
 */

import { body, param, query } from 'express-validator';

/**
 * Validation for creating a new task
 */
export const createTaskValidation = [
  body('campaign_id').notEmpty().withMessage('Campaign ID is required'),
  body('task_info.title').notEmpty().withMessage('Task title is required'),
  body('task_info.description').notEmpty().withMessage('Task description is required'),
  body('task_info.priority_level').isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority level'),
  body('timeline.start_date').isISO8601().withMessage('Invalid start date'),
  body('timeline.due_date').isISO8601().withMessage('Invalid due date'),
  body('timeline.estimated_duration').isFloat({ min: 0.5 }).withMessage('Estimated duration must be at least 0.5 hours')
];

/**
 * Validation for getting tasks list
 */
export const getTasksValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('sort_by').optional().isIn(['created_at', 'updated_at', 'due_date', 'priority', 'status']).withMessage('Invalid sort field'),
  query('sort_order').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc'),
  query('status').optional().isIn(['pending', 'assigned', 'in_progress', 'completed', 'cancelled', 'overdue']).withMessage('Invalid status filter'),
  query('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority filter'),
  query('campaign_id').optional().isString().withMessage('Campaign ID must be a string'),
  query('photographer_id').optional().isString().withMessage('Photographer ID must be a string'),
  query('brand_id').optional().isString().withMessage('Brand ID must be a string')
];

/**
 * Validation for getting task by ID
 */
export const getTaskByIdValidation = [
  param('id').notEmpty().withMessage('Task ID is required')
];

/**
 * Validation for updating a task
 */
export const updateTaskValidation = [
  param('id').notEmpty().withMessage('Task ID is required'),
  body('task_info.title').optional().notEmpty().withMessage('Task title cannot be empty'),
  body('task_info.description').optional().notEmpty().withMessage('Task description cannot be empty'),
  body('task_info.priority_level').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority level'),
  body('timeline.start_date').optional().isISO8601().withMessage('Invalid start date'),
  body('timeline.due_date').optional().isISO8601().withMessage('Invalid due date'),
  body('timeline.estimated_duration').optional().isFloat({ min: 0.5 }).withMessage('Estimated duration must be at least 0.5 hours')
];

/**
 * Validation for deleting a task
 */
export const deleteTaskValidation = [
  param('id').notEmpty().withMessage('Task ID is required')
];

/**
 * Validation for assigning a task
 */
export const assignTaskValidation = [
  param('id').notEmpty().withMessage('Task ID is required'),
  body('assigned_photographer').notEmpty().withMessage('Photographer ID is required'),
  body('backup_photographers').optional().isArray().withMessage('Backup photographers must be an array')
];

/**
 * Validation for updating task status
 */
export const updateTaskStatusValidation = [
  param('id').notEmpty().withMessage('Task ID is required'),
  body('status').isIn(['pending', 'assigned', 'in_progress', 'completed', 'cancelled']).withMessage('Invalid status'),
  body('notes').optional().isString().withMessage('Notes must be a string')
];

/**
 * Validation for uploading task deliverables
 */
export const uploadDeliverablesValidation = [
  param('id').notEmpty().withMessage('Task ID is required'),
  body('deliverables').isArray().withMessage('Deliverables must be an array'),
  body('deliverables.*.type').isIn(['image', 'video', 'document']).withMessage('Invalid deliverable type'),
  body('deliverables.*.url').isURL().withMessage('Invalid deliverable URL'),
  body('deliverables.*.filename').notEmpty().withMessage('Filename is required')
];

export const taskValidators = {
  createTaskValidation,
  getTasksValidation,
  getTaskByIdValidation,
  updateTaskValidation,
  deleteTaskValidation,
  assignTaskValidation,
  updateTaskStatusValidation,
  uploadDeliverablesValidation
}; 
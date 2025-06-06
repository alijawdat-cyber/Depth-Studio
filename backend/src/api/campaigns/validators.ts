/**
 * 📱 Campaign Validators
 * 
 * تطوير علي جودت - Depth Studio
 * آخر تحديث: يناير 2025
 * 
 * @description Validation schemas for campaign operations
 * @version 1.0.0
 */

import { body, param, query } from 'express-validator';

/**
 * Create campaign validation
 */
export const createCampaignValidation = [
  // TODO: Move validation logic from campaigns.ts
  body('campaign_info.name').notEmpty().withMessage('Campaign name is required'),
  body('campaign_info.brand_id').notEmpty().withMessage('Brand ID is required'),
  body('campaign_info.campaign_type').isIn(['product_launch', 'seasonal', 'promotional', 'brand_awareness', 'event', 'ongoing']).withMessage('Invalid campaign type'),
  body('campaign_info.priority_level').isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority level'),
  body('timeline.campaign_start_date').isISO8601().withMessage('Invalid start date'),
  body('timeline.campaign_end_date').isISO8601().withMessage('Invalid end date'),
  body('campaign_goals.total_content_pieces').isInt({ min: 1 }).withMessage('Total content pieces must be at least 1'),
  body('budget_management.total_budget').isFloat({ min: 0 }).withMessage('Budget must be non-negative')
];

/**
 * Get campaigns validation
 */
export const getCampaignsValidation = [
  // TODO: Move validation logic from campaigns.ts
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('sort_by').optional().isIn(['created_at', 'updated_at', 'name', 'status', 'priority']).withMessage('Invalid sort field'),
  query('sort_order').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc')
];

/**
 * Campaign ID validation
 */
export const campaignIdValidation = [
  param('id').notEmpty().withMessage('Campaign ID is required')
];

/**
 * Update campaign validation
 */
export const updateCampaignValidation = [
  // TODO: Move validation logic from campaigns.ts
  param('id').notEmpty().withMessage('Campaign ID is required'),
  body('campaign_info.name').optional().notEmpty().withMessage('Campaign name cannot be empty'),
  body('campaign_info.campaign_type').optional().isIn(['product_launch', 'seasonal', 'promotional', 'brand_awareness', 'event', 'ongoing']).withMessage('Invalid campaign type'),
  body('campaign_info.priority_level').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority level')
];

/**
 * Campaign tasks validation
 */
export const getCampaignTasksValidation = [
  param('id').notEmpty().withMessage('Campaign ID is required'),
  query('status').optional().isIn(['pending', 'assigned', 'in_progress', 'review', 'revision_needed', 'completed', 'cancelled']).withMessage('Invalid task status'),
  query('photographer_id').optional().isString().withMessage('Photographer ID must be a string')
];

/**
 * Pause campaign validation
 */
export const pauseCampaignValidation = [
  param('id').notEmpty().withMessage('Campaign ID is required'),
  body('reason').optional().isString().withMessage('Reason must be a string')
];

/**
 * Complete campaign validation
 */
export const completeCampaignValidation = [
  param('id').notEmpty().withMessage('Campaign ID is required'),
  body('completion_notes').optional().isString().withMessage('Completion notes must be a string')
];

export const campaignValidators = {
  createCampaignValidation,
  getCampaignsValidation,
  campaignIdValidation,
  updateCampaignValidation,
  getCampaignTasksValidation,
  pauseCampaignValidation,
  completeCampaignValidation
}; 
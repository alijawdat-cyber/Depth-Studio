/**
 * 📱 Campaigns API - Main Router
 * 
 * تطوير علي جودت - Depth Studio
 * آخر تحديث: يناير 2025
 * 
 * @description Main router for campaigns management
 * @version 1.0.0
 */

import { Router } from 'express';
import { campaignHandlers } from './handlers';
// import { campaignMiddleware } from './middleware'; // TODO: Use when needed
import { campaignValidators } from './validators';
import { authenticateToken } from '../../middleware/auth';
import { authorizeRoles } from '../../middleware/authorization';
import { validateInput } from '../../middleware/validation';
import { applyRateLimit } from '../../middleware/rateLimiting';
import { requestLogger } from '../../middleware/logging';

const router = Router();

/**
 * POST /api/campaigns
 * إنشاء حملة جديدة
 */
router.post(
  '/',
  applyRateLimit('campaigns', 10, 60),
  authenticateToken,
  authorizeRoles(['super_admin', 'marketing_coordinator', 'brand_coordinator']),
  requestLogger(),
  campaignValidators.createCampaignValidation,
  validateInput,
  campaignHandlers.createCampaign
);

/**
 * GET /api/campaigns
 * قائمة الحملات مع فلتر وpagination
 */
router.get(
  '/',
  applyRateLimit('campaigns', 30, 60),
  authenticateToken,
  authorizeRoles(['super_admin', 'marketing_coordinator', 'brand_coordinator']),
  requestLogger(),
  campaignValidators.getCampaignsValidation,
  validateInput,
  campaignHandlers.getCampaigns
);

/**
 * GET /api/campaigns/:id
 * جلب بيانات حملة محددة
 */
router.get(
  '/:id',
  applyRateLimit('campaigns', 60, 60),
  authenticateToken,
  authorizeRoles(['super_admin', 'marketing_coordinator', 'brand_coordinator', 'photographer']),
  requestLogger(),
  campaignValidators.campaignIdValidation,
  validateInput,
  campaignHandlers.getCampaignById
);

/**
 * PUT /api/campaigns/:id
 * تحديث بيانات الحملة
 */
router.put(
  '/:id',
  applyRateLimit('campaigns', 20, 60),
  authenticateToken,
  authorizeRoles(['super_admin', 'marketing_coordinator', 'brand_coordinator']),
  requestLogger(),
  campaignValidators.updateCampaignValidation,
  validateInput,
  campaignHandlers.updateCampaign
);

/**
 * DELETE /api/campaigns/:id
 * حذف الحملة
 */
router.delete(
  '/:id',
  applyRateLimit('campaigns', 10, 60),
  authenticateToken,
  authorizeRoles(['super_admin', 'marketing_coordinator']),
  requestLogger(),
  campaignValidators.campaignIdValidation,
  validateInput,
  campaignHandlers.deleteCampaign
);

/**
 * POST /api/campaigns/:id/start
 * بدء الحملة
 */
router.post(
  '/:id/start',
  applyRateLimit('campaigns', 10, 60),
  authenticateToken,
  authorizeRoles(['super_admin', 'marketing_coordinator', 'brand_coordinator']),
  requestLogger(),
  campaignValidators.campaignIdValidation,
  validateInput,
  campaignHandlers.startCampaign
);

/**
 * POST /api/campaigns/:id/pause
 * إيقاف الحملة مؤقتاً
 */
router.post(
  '/:id/pause',
  applyRateLimit('campaigns', 10, 60),
  authenticateToken,
  authorizeRoles(['super_admin', 'marketing_coordinator', 'brand_coordinator']),
  requestLogger(),
  campaignValidators.pauseCampaignValidation,
  validateInput,
  campaignHandlers.pauseCampaign
);

/**
 * POST /api/campaigns/:id/complete
 * إنهاء الحملة
 */
router.post(
  '/:id/complete',
  applyRateLimit('campaigns', 10, 60),
  authenticateToken,
  authorizeRoles(['super_admin', 'marketing_coordinator', 'brand_coordinator']),
  requestLogger(),
  campaignValidators.completeCampaignValidation,
  validateInput,
  campaignHandlers.completeCampaign
);

/**
 * GET /api/campaigns/:id/tasks
 * مهام الحملة
 */
router.get(
  '/:id/tasks',
  applyRateLimit('campaigns', 30, 60),
  authenticateToken,
  authorizeRoles(['super_admin', 'marketing_coordinator', 'brand_coordinator', 'photographer']),
  requestLogger(),
  campaignValidators.getCampaignTasksValidation,
  validateInput,
  campaignHandlers.getCampaignTasks
);

/**
 * GET /api/campaigns/:id/analytics
 * تحليلات الحملة
 */
router.get(
  '/:id/analytics',
  applyRateLimit('campaigns', 20, 60),
  authenticateToken,
  authorizeRoles(['super_admin', 'marketing_coordinator', 'brand_coordinator']),
  requestLogger(),
  campaignValidators.campaignIdValidation,
  validateInput,
  campaignHandlers.getCampaignAnalytics
);

export default router; 
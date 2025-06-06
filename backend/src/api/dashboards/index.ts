import { Router } from 'express'
// import { authMiddleware } from '../../middleware/auth' // TODO: Fix import
import { rateLimitMiddleware } from './middleware'
import { validateDashboardRequest } from './validators'
import {
  getSuperAdminDashboard,
  getMarketingCoordinatorDashboard,
  getBrandCoordinatorDashboard,
  getPhotographerDashboard
} from './handlers'

const router = Router()

// ======================================
// Dashboard Routes
// ======================================

/**
 * Super Admin Dashboard
 * GET /api/dashboards/super-admin
 */
router.get('/super-admin', [
  // authMiddleware, // TODO: Add auth middleware
  rateLimitMiddleware.dashboard,
  validateDashboardRequest.superAdmin
], getSuperAdminDashboard)

/**
 * Marketing Coordinator Dashboard
 * GET /api/dashboards/marketing-coordinator
 */
router.get('/marketing-coordinator', [
  // authMiddleware, // TODO: Add auth middleware
  rateLimitMiddleware.dashboard,
  validateDashboardRequest.marketingCoordinator
], getMarketingCoordinatorDashboard)

/**
 * Brand Coordinator Dashboard
 * GET /api/dashboards/brand-coordinator/:brandId
 */
router.get('/brand-coordinator/:brandId', [
  // authMiddleware, // TODO: Add auth middleware
  rateLimitMiddleware.dashboard,
  validateDashboardRequest.brandCoordinator
], getBrandCoordinatorDashboard)

/**
 * Photographer Dashboard
 * GET /api/dashboards/photographer/:photographerId
 */
router.get('/photographer/:photographerId', [
  // authMiddleware, // TODO: Add auth middleware
  rateLimitMiddleware.dashboard,
  validateDashboardRequest.photographer
], getPhotographerDashboard)

export default router 
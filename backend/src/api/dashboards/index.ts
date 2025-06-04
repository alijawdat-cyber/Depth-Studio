import { Router } from 'express'
import { superAdminDashboard } from './superAdminStats'
import { marketingCoordinatorDashboard } from './marketingCoordinatorStats'
import { brandCoordinatorDashboard } from './brandCoordinatorStats'
import { photographerDashboard } from './photographerStats'

const router = Router()

// ======================================
// Dashboard Routes
// ======================================

// Super Admin Dashboard
router.get('/super-admin', superAdminDashboard)

// Marketing Coordinator Dashboard
router.get('/marketing-coordinator', marketingCoordinatorDashboard)

// Brand Coordinator Dashboard (NAVA specific)
router.get('/brand-coordinator/:brandId', brandCoordinatorDashboard)

// Photographer Dashboard (unified)
router.get('/photographer/:photographerId', photographerDashboard)

export default router 
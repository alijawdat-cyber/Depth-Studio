/**
 * 🏢 Brands Module
 * 
 * تطوير علي جودت - Depth Studio
 * آخر تحديث: يناير 2025
 * 
 * @description Complete brands management module
 * @version 1.0.0
 */

import { Router } from 'express';

// Middleware imports
import { authenticateToken } from '../../middleware/auth';
import { authorize, checkBrandPermission, superAdminOnly } from '../../middleware/authorization';
import { requestLogger, auditLogger } from '../../middleware/logging';
// Note: using local validators instead of global ones

// Local imports
import { brandHandlers } from './handlers';
import { brandValidators } from './validators';
import { brandMiddleware } from './middleware';

const router = Router();

/**
 * GET /api/brands - قائمة البراندات مع فلتر وpagination
 */
router.get('/', 
  brandMiddleware.brandGeneralRateLimit,
  authenticateToken,
  authorize(['super_admin', 'marketing_coordinator', 'brand_coordinator']),
  brandValidators.getBrandsValidation,
  requestLogger(),
  brandHandlers.getBrands
);

/**
 * GET /api/brands/search - البحث في البراندات
 */
router.get('/search',
  brandMiddleware.brandGeneralRateLimit,
  authenticateToken,
  authorize(['super_admin', 'marketing_coordinator', 'brand_coordinator']),
  brandValidators.searchBrandsValidation,
  brandHandlers.searchBrandsHandler
);

/**
 * GET /api/brands/:id - جلب بيانات براند محدد
 */
router.get('/:id',
  brandMiddleware.brandGeneralRateLimit,
  authenticateToken,
  brandValidators.getBrandByIdValidation,
  checkBrandPermission('id'),
  requestLogger(),
  brandHandlers.getBrandById
);

/**
 * GET /api/brands/:id/statistics - إحصائيات البراند
 */
router.get('/:id/statistics',
  brandMiddleware.brandGeneralRateLimit,
  authenticateToken,
  brandValidators.getBrandStatsValidation,
  checkBrandPermission('id'),
  brandHandlers.getBrandStats
);

/**
 * POST /api/brands - إنشاء براند جديد
 */
router.post('/',
  brandMiddleware.brandAuthRateLimit,
  authenticateToken,
  authorize(['super_admin', 'marketing_coordinator']),
  brandValidators.createBrandValidation,
  auditLogger('create_brand'),
  brandHandlers.createBrand
);

/**
 * POST /api/brands/:id/assign-coordinator - تعيين منسق براند
 */
router.post('/:id/assign-coordinator',
  brandMiddleware.brandAuthRateLimit,
  authenticateToken,
  authorize(['super_admin', 'marketing_coordinator']),
  brandValidators.assignCoordinatorValidation,
  auditLogger('assign_brand_coordinator'),
  brandHandlers.assignCoordinator
);

/**
 * PUT /api/brands/:id - تحديث بيانات البراند
 */
router.put('/:id',
  brandMiddleware.brandGeneralRateLimit,
  authenticateToken,
  brandValidators.updateBrandValidation,
  checkBrandPermission('id'),
  auditLogger('update_brand'),
  brandHandlers.updateBrand
);

/**
 * DELETE /api/brands/:id - حذف البراند (soft delete)
 */
router.delete('/:id',
  brandMiddleware.brandAuthRateLimit,
  authenticateToken,
  superAdminOnly,
  brandValidators.deleteBrandValidation,
  auditLogger('delete_brand'),
  brandHandlers.deleteBrand
);

export default router; 
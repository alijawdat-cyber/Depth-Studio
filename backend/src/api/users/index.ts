/**
 * 👥 Users Module
 * 
 * تطوير علي جودت - Depth Studio
 * آخر تحديث: يناير 2025
 * 
 * @description Complete users management module
 * @version 1.0.0
 */

import { Router } from 'express';

// Middleware imports
import { authenticateToken } from '../../middleware/auth';
import { authorize, adminOnly, superAdminOnly } from '../../middleware/authorization';
import { requestLogger, auditLogger } from '../../middleware/logging';

// New Zod validation imports
import { 
  validateBody, 
  validateQuery, 
  validateParams 
} from '../../validators/middleware';
import {
  CreateUserSchema,
  UpdateUserSchema,
  SearchUsersSchema
} from '../../validators/schemas';
import { z } from 'zod';

// Local imports
import { userHandlers } from './handlers';
import { userMiddleware } from './middleware';

const router = Router();

/**
 * GET /api/users - قائمة المستخدمين مع فلتر وpagination
 */
router.get('/', 
  userMiddleware.userGeneralRateLimit,
  authenticateToken,
  authorize(['super_admin', 'marketing_coordinator']),
  validateQuery(SearchUsersSchema), // 🆕 Zod validation
  requestLogger(),
  userHandlers.getUsers
);

/**
 * GET /api/users/search - البحث في المستخدمين
 */
router.get('/search',
  userMiddleware.userGeneralRateLimit,
  authenticateToken,
  authorize(['super_admin', 'marketing_coordinator', 'brand_coordinator']),
  validateQuery(SearchUsersSchema), // 🆕 Zod validation
  userHandlers.searchUsersHandler
);

/**
 * GET /api/users/stats - إحصائيات المستخدمين (للمديرين)
 */
router.get('/stats',
  userMiddleware.userGeneralRateLimit,
  authenticateToken,
  adminOnly,
  userHandlers.getUserStats
);

/**
 * GET /api/users/:id - جلب بيانات مستخدم محدد
 */
router.get('/:id',
  userMiddleware.userGeneralRateLimit,
  authenticateToken,
  validateParams(z.object({ id: z.string().regex(/^[0-9a-fA-F]{24}$/) })), // 🆕 ID validation
  requestLogger(),
  userHandlers.getUserById
);

/**
 * POST /api/users - إنشاء مستخدم جديد
 */
router.post('/',
  userMiddleware.userAuthRateLimit,
  authenticateToken,
  adminOnly,
  validateBody(CreateUserSchema), // 🆕 Zod validation
  auditLogger('create_user'),
  userHandlers.createUser
);

/**
 * PUT /api/users/:id - تحديث بيانات المستخدم
 */
router.put('/:id',
  userMiddleware.userGeneralRateLimit,
  authenticateToken,
  validateParams(z.object({ id: z.string().regex(/^[0-9a-fA-F]{24}$/) })), // 🆕 ID validation
  validateBody(UpdateUserSchema), // 🆕 Zod validation
  auditLogger('update_user'),
  userHandlers.updateUser
);

/**
 * DELETE /api/users/:id - حذف مستخدم
 */
router.delete('/:id',
  userMiddleware.userAuthRateLimit,
  authenticateToken,
  superAdminOnly,
  validateParams(z.object({ id: z.string().regex(/^[0-9a-fA-F]{24}$/) })), // 🆕 ID validation
  auditLogger('delete_user'),
  userHandlers.deleteUser
);

/**
 * POST /api/users/:id/activate - تفعيل المستخدم
 */
router.post('/:id/activate',
  userMiddleware.userAuthRateLimit,
  authenticateToken,
  adminOnly,
  validateParams(z.object({ id: z.string().regex(/^[0-9a-fA-F]{24}$/) })), // 🆕 ID validation
  auditLogger('activate_user'),
  userHandlers.activateUser
);

/**
 * POST /api/users/:id/deactivate - إلغاء تفعيل المستخدم
 */
router.post('/:id/deactivate',
  userMiddleware.userAuthRateLimit,
  authenticateToken,
  adminOnly,
  validateParams(z.object({ id: z.string().regex(/^[0-9a-fA-F]{24}$/) })), // 🆕 ID validation
  auditLogger('deactivate_user'),
  userHandlers.deactivateUser
);

export default router; 
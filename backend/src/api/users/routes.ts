/**
 * 🛣️ User Routes with Validation
 * 
 * تطوير علي جودت - Depth Studio
 * آخر تحديث: يونيو 2025
 * 
 * @description User API routes مع Zod validation
 * @version 1.0.0
 */

import { Router } from 'express';
import { 
  validateBody, 
  validateQuery, 
  validateParams,
  validateOptional 
} from '../../validators/middleware';
import {
  CreateUserSchema,
  UpdateUserSchema,
  SearchUsersSchema
} from '../../validators/schemas';
import { z } from 'zod';
import {
  createUser,
  updateUser,
  getUsers,
  getUserById,
  deleteUser,
  activateUser,
  deactivateUser,
  searchUsersHandler,
  getUserStats
} from './handlers';

const router = Router();

// ======================================
// Schemas
// ======================================

const ParamsIdSchema = z.object({ 
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId format') 
});

// ======================================
// User Routes with Validation
// ======================================

/**
 * GET /users - قائمة المستخدمين
 */
router.get(
  '/',
  validateQuery(SearchUsersSchema),
  getUsers
);

/**
 * GET /users/search - بحث في المستخدمين
 */
router.get(
  '/search',
  validateQuery(SearchUsersSchema),
  searchUsersHandler
);

/**
 * GET /users/stats - إحصائيات المستخدمين
 */
router.get('/stats', getUserStats);

/**
 * GET /users/:id - جلب مستخدم محدد
 */
router.get(
  '/:id',
  validateParams(ParamsIdSchema),
  getUserById
);

/**
 * POST /users - إنشاء مستخدم جديد
 */
router.post(
  '/',
  validateBody(CreateUserSchema),
  createUser
);

/**
 * PATCH /users/:id - تحديث بيانات المستخدم
 */
router.patch(
  '/:id',
  validateParams(ParamsIdSchema),
  validateOptional(UpdateUserSchema),
  updateUser
);

/**
 * DELETE /users/:id - حذف مستخدم
 */
router.delete(
  '/:id',
  validateParams(ParamsIdSchema),
  deleteUser
);

/**
 * POST /users/:id/activate - تفعيل مستخدم
 */
router.post(
  '/:id/activate',
  validateParams(ParamsIdSchema),
  activateUser
);

/**
 * POST /users/:id/deactivate - إلغاء تفعيل مستخدم
 */
router.post(
  '/:id/deactivate',
  validateParams(ParamsIdSchema),
  deactivateUser
);

export default router; 
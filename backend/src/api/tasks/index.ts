/**
 * 📋 Tasks API Routes
 * 
 * تطوير علي جودت - Depth Studio
 * آخر تحديث: يناير 2025
 * 
 * @description Complete task management API routes
 * @version 1.0.0
 */

import { Router } from 'express';
import { authenticateToken } from '../../middleware/auth';
import { authorize } from '../../middleware/authorization';
import { validateInput } from '../../middleware/validation';
import { requestLogger } from '../../middleware/logging';
import { taskRateLimiters } from './middleware';
import { taskValidators } from './validators';
import { taskHandlers } from './handlers';

const router = Router();

// ======================================
// 📋 Task Management Endpoints
// ======================================

/**
 * POST /api/tasks
 * إنشاء مهمة جديدة
 */
router.post(
  '/',
  taskRateLimiters.createTask,
  authenticateToken,
  authorize(['super_admin', 'marketing_coordinator', 'brand_coordinator']),
  requestLogger(),
  taskValidators.createTaskValidation,
  validateInput,
  taskHandlers.createTask
);

/**
 * GET /api/tasks
 * قائمة المهام مع فلتر وpagination
 */
router.get(
  '/',
  taskRateLimiters.getTasks,
  authenticateToken,
  authorize(['super_admin', 'marketing_coordinator', 'brand_coordinator', 'photographer']),
  requestLogger(),
  taskValidators.getTasksValidation,
  validateInput,
  taskHandlers.getTasks
);

/**
 * GET /api/tasks/:id
 * جلب بيانات مهمة محددة
 */
router.get(
  '/:id',
  taskRateLimiters.getTaskById,
  authenticateToken,
  authorize(['super_admin', 'marketing_coordinator', 'brand_coordinator', 'photographer']),
  requestLogger(),
  taskValidators.getTaskByIdValidation,
  validateInput,
  taskHandlers.getTaskById
);

/**
 * PUT /api/tasks/:id
 * تحديث بيانات المهمة
 */
router.put(
  '/:id',
  taskRateLimiters.updateTask,
  authenticateToken,
  authorize(['super_admin', 'marketing_coordinator', 'brand_coordinator', 'photographer']),
  requestLogger(),
  taskValidators.updateTaskValidation,
  validateInput,
  taskHandlers.updateTask
);

/**
 * DELETE /api/tasks/:id
 * حذف المهمة
 */
router.delete(
  '/:id',
  taskRateLimiters.deleteTask,
  authenticateToken,
  authorize(['super_admin', 'marketing_coordinator']),
  requestLogger(),
  taskValidators.deleteTaskValidation,
  validateInput,
  taskHandlers.deleteTask
);

// ======================================
// 📋 Additional Task Operations
// ======================================

/**
 * POST /api/tasks/:id/assign
 * تعيين مصور للمهمة
 */
router.post(
  '/:id/assign',
  taskRateLimiters.assignTask,
  authenticateToken,
  authorize(['super_admin', 'marketing_coordinator', 'brand_coordinator']),
  requestLogger(),
  taskValidators.assignTaskValidation,
  validateInput,
  async (req: any, res: any, next: any) => {
    try {
      const userId = req.user?.uid;
      const taskId = req.params.id;
      const { assigned_photographer, auto_assign } = req.body;
      
      let result;
      
      if (auto_assign) {
        // تعيين تلقائي
        const { autoAssignTask } = await import('./assignment');
        result = await autoAssignTask(taskId, userId);
      } else if (assigned_photographer) {
        // تعيين يدوي
        const { assignTaskToPhotographer } = await import('./assignment');
        result = await assignTaskToPhotographer(taskId, assigned_photographer, userId);
      } else {
        res.status(400).json({
          success: false,
          error: 'Either assigned_photographer or auto_assign must be provided',
          message: 'يجب تحديد المصور أو اختيار التعيين التلقائي',
          timestamp: new Date().toISOString()
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        data: result,
        message: 'تم تعيين المهمة بنجاح',
        timestamp: new Date().toISOString()
      });
      
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
        message: 'فشل في تعيين المهمة',
        timestamp: new Date().toISOString()
      });
    }
  }
);

/**
 * PUT /api/tasks/:id/status
 * تحديث حالة المهمة
 */
router.put(
  '/:id/status',
  taskRateLimiters.updateTaskStatus,
  authenticateToken,
  authorize(['super_admin', 'marketing_coordinator', 'brand_coordinator', 'photographer']),
  requestLogger(),
  taskValidators.updateTaskStatusValidation,
  validateInput,
  async (req: any, res: any, next: any) => {
    // TODO: Implement update task status handler
    res.status(501).json({
      success: false,
      error: 'Not implemented yet',
      message: 'هذه الميزة قيد التطوير',
      timestamp: new Date().toISOString()
    });
  }
);

/**
 * DELETE /api/tasks/:id/assign
 * إلغاء تعيين المهمة
 */
router.delete(
  '/:id/assign',
  taskRateLimiters.assignTask,
  authenticateToken,
  authorize(['super_admin', 'marketing_coordinator', 'brand_coordinator']),
  requestLogger(),
  taskValidators.getTaskByIdValidation,
  validateInput,
  async (req: any, res: any, next: any) => {
    try {
      const userId = req.user?.uid;
      const taskId = req.params.id;
      const { reason } = req.body;
      
      const { unassignTask } = await import('./assignment');
      const result = await unassignTask(taskId, userId, reason);
      
      res.status(200).json({
        success: true,
        data: result,
        message: 'تم إلغاء تعيين المهمة بنجاح',
        timestamp: new Date().toISOString()
      });
      
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
        message: 'فشل في إلغاء تعيين المهمة',
        timestamp: new Date().toISOString()
      });
    }
  }
);

/**
 * POST /api/tasks/:id/deliverables
 * رفع مخرجات المهمة
 */
router.post(
  '/:id/deliverables',
  taskRateLimiters.uploadDeliverables,
  authenticateToken,
  authorize(['super_admin', 'marketing_coordinator', 'brand_coordinator', 'photographer']),
  requestLogger(),
  taskValidators.uploadDeliverablesValidation,
  validateInput,
  async (req: any, res: any, next: any) => {
    // TODO: Implement upload deliverables handler
    res.status(501).json({
      success: false,
      error: 'Not implemented yet',
      message: 'هذه الميزة قيد التطوير',
      timestamp: new Date().toISOString()
    });
  }
);

export default router; 
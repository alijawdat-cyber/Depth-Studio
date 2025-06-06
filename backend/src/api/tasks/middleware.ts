/**
 * 🔧 Task Middleware Functions
 * 
 * تطوير علي جودت - Depth Studio
 * آخر تحديث: يناير 2025
 * 
 * @description Middleware functions for task operations
 * @version 1.0.0
 */

import { createRateLimit } from '../../middleware/rateLimiting';

/**
 * إنشاء Rate Limiter للمهام
 */
export const createTaskRateLimit = (maxRequests: number, windowMinutes: number = 1) => {
  return createRateLimit({
    windowMs: windowMinutes * 60 * 1000,
    maxRequests,
    message: `تم تجاوز الحد المسموح للمهام (${maxRequests} طلب / ${windowMinutes} دقيقة)`
  });
};

/**
 * Rate limiters for different task operations
 */
export const taskRateLimiters = {
  // إنشاء المهام
  createTask: createTaskRateLimit(15, 1),
  
  // قراءة المهام
  getTasks: createTaskRateLimit(50, 1),
  getTaskById: createTaskRateLimit(100, 1),
  
  // تحديث المهام
  updateTask: createTaskRateLimit(30, 1),
  
  // حذف المهام
  deleteTask: createTaskRateLimit(10, 1),
  
  // عمليات إضافية
  assignTask: createTaskRateLimit(20, 1),
  updateTaskStatus: createTaskRateLimit(40, 1),
  uploadDeliverables: createTaskRateLimit(5, 1)
}; 
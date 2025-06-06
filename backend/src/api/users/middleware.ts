/**
 * 🔐 User Middleware
 * 
 * تطوير علي جودت - Depth Studio
 * آخر تحديث: يناير 2025
 * 
 * @description Middleware for user operations
 * @version 1.0.0
 */

import { generalRateLimit, authRateLimit } from '../../middleware/rateLimiting';

/**
 * استخدام rate limiters موجودة مع تخصيص للمستخدمين
 */

// استخدام general rate limit للعمليات العادية
export const userGeneralRateLimit = generalRateLimit;

// استخدام auth rate limit للعمليات الحساسة (إنشاء، تحديث، حذف)
export const userAuthRateLimit = authRateLimit;

export const userMiddleware = {
  userGeneralRateLimit,
  userAuthRateLimit
}; 
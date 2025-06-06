/**
 * 🔐 Brand Middleware
 * 
 * تطوير علي جودت - Depth Studio
 * آخر تحديث: يناير 2025
 * 
 * @description Middleware for brand operations
 * @version 1.0.0
 */

import { generalRateLimit, authRateLimit } from '../../middleware/rateLimiting';

/**
 * استخدام rate limiters موجودة مع تخصيص للبراندات
 */

// استخدام general rate limit للعمليات العادية
export const brandGeneralRateLimit = generalRateLimit;

// استخدام auth rate limit للعمليات الحساسة (إنشاء، تحديث، حذف)
export const brandAuthRateLimit = authRateLimit;

export const brandMiddleware = {
  brandGeneralRateLimit,
  brandAuthRateLimit
}; 
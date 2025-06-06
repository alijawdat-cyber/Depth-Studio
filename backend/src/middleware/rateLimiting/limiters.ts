/**
 * Rate Limiters - Depth Studio Backend
 * Core rate limiting functions and pre-configured limiters
 */

import { Request, Response, NextFunction } from 'express'
import type { AuthenticatedRequest } from '../auth'
import { 
  RateLimitOptions, 
  UserRateLimitOptions, 
  RateLimitErrorResponse,
  DEFAULT_RATE_LIMITS,
  RATE_LIMIT_HEADERS
} from './types'
import { 
  rateLimitStore, 
  getRateLimitEntry, 
  setRateLimitEntry, 
  cleanupExpiredEntries 
} from './store'

// ======================================
// Core Rate Limiter Factory
// ======================================

/**
 * إنشاء Rate Limiter مخصص
 */
export const createRateLimit = (options: RateLimitOptions) => {
  const {
    windowMs,
    maxRequests,
    message = 'تم تجاوز الحد المسموح من الطلبات، حاول مرة أخرى لاحقاً',
    keyGenerator = (req) => req.ip || 'unknown'
  } = options

  return (req: Request, res: Response, next: NextFunction): void => {
    const key = keyGenerator(req)
    const now = Date.now()
    
    // تنظيف البيانات المنتهية الصلاحية
    cleanupExpiredEntries(now)
    
    let entry = getRateLimitEntry(key)
    
    if (!entry || now > entry.resetTime) {
      // إنشاء entry جديد أو إعادة تعيين
      entry = {
        count: 0,
        resetTime: now + windowMs,
        lastRequest: now
      }
    }
    
    // زيادة العداد
    entry.count++
    entry.lastRequest = now
    setRateLimitEntry(key, entry)
    
    // فحص الحد الأقصى
    if (entry.count > maxRequests) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000)
      
      const errorResponse: RateLimitErrorResponse = {
        success: false,
        error: 'rate_limit_exceeded',
        message,
        details: {
          limit: maxRequests,
          remaining: 0,
          reset: new Date(entry.resetTime).toISOString(),
          retryAfter
        },
        timestamp: new Date().toISOString()
      }
      
      res.status(429).json(errorResponse)
      return
    }
    
    // إضافة headers للمعلومات
    res.set({
      [RATE_LIMIT_HEADERS.LIMIT]: maxRequests.toString(),
      [RATE_LIMIT_HEADERS.REMAINING]: (maxRequests - entry.count).toString(),
      [RATE_LIMIT_HEADERS.RESET]: new Date(entry.resetTime).toISOString(),
      [RATE_LIMIT_HEADERS.WINDOW]: windowMs.toString()
    })
    
    next()
  }
}

/**
 * Rate limiter حسب المستخدم المصادق
 */
export const createUserRateLimit = (options: UserRateLimitOptions) => {
  return createRateLimit({
    ...options,
    keyGenerator: (req: Request) => {
      const authReq = req as AuthenticatedRequest
      return authReq.user?.id || req.ip || 'unknown'
    }
  })
}

// ======================================
// Pre-configured Rate Limiters
// ======================================

/**
 * Rate limiter عام للـ API
 */
export const generalRateLimit = createRateLimit({
  windowMs: DEFAULT_RATE_LIMITS.GENERAL.WINDOW_MS,
  maxRequests: DEFAULT_RATE_LIMITS.GENERAL.MAX_REQUESTS,
  message: DEFAULT_RATE_LIMITS.GENERAL.MESSAGE
})

/**
 * Rate limiter للمصادقة (أكثر صرامة)
 */
export const authRateLimit = createRateLimit({
  windowMs: DEFAULT_RATE_LIMITS.AUTH.WINDOW_MS,
  maxRequests: DEFAULT_RATE_LIMITS.AUTH.MAX_REQUESTS,
  message: DEFAULT_RATE_LIMITS.AUTH.MESSAGE
})

/**
 * Rate limiter للتسجيل (صارم جداً)
 */
export const signupRateLimit = createRateLimit({
  windowMs: DEFAULT_RATE_LIMITS.SIGNUP.WINDOW_MS,
  maxRequests: DEFAULT_RATE_LIMITS.SIGNUP.MAX_REQUESTS,
  message: DEFAULT_RATE_LIMITS.SIGNUP.MESSAGE
})

/**
 * Rate limiter للبحث
 */
export const searchRateLimit = createRateLimit({
  windowMs: DEFAULT_RATE_LIMITS.SEARCH.WINDOW_MS,
  maxRequests: DEFAULT_RATE_LIMITS.SEARCH.MAX_REQUESTS,
  message: DEFAULT_RATE_LIMITS.SEARCH.MESSAGE
})

/**
 * Rate limiter لرفع الملفات
 */
export const uploadRateLimit = createRateLimit({
  windowMs: DEFAULT_RATE_LIMITS.UPLOAD.WINDOW_MS,
  maxRequests: DEFAULT_RATE_LIMITS.UPLOAD.MAX_REQUESTS,
  message: DEFAULT_RATE_LIMITS.UPLOAD.MESSAGE
})

/**
 * Rate limiter للعمليات الحساسة (إرسال إيميل، SMS، إلخ)
 */
export const sensitiveOperationRateLimit = createRateLimit({
  windowMs: DEFAULT_RATE_LIMITS.SENSITIVE.WINDOW_MS,
  maxRequests: DEFAULT_RATE_LIMITS.SENSITIVE.MAX_REQUESTS,
  message: DEFAULT_RATE_LIMITS.SENSITIVE.MESSAGE
})

/**
 * Rate limiter مخصص للحالات الطارئة
 */
export const emergencyRateLimit = createRateLimit({
  windowMs: DEFAULT_RATE_LIMITS.EMERGENCY.WINDOW_MS,
  maxRequests: DEFAULT_RATE_LIMITS.EMERGENCY.MAX_REQUESTS,
  message: DEFAULT_RATE_LIMITS.EMERGENCY.MESSAGE
})

// ======================================
// Role-based Rate Limiters
// ======================================

/**
 * Rate limiter للمديرين (حدود أعلى)
 */
export const adminRateLimit = createUserRateLimit({
  windowMs: DEFAULT_RATE_LIMITS.ADMIN.WINDOW_MS,
  maxRequests: DEFAULT_RATE_LIMITS.ADMIN.MAX_REQUESTS,
  message: DEFAULT_RATE_LIMITS.ADMIN.MESSAGE
})

/**
 * Rate limiter للمصورين
 */
export const photographerRateLimit = createUserRateLimit({
  windowMs: DEFAULT_RATE_LIMITS.PHOTOGRAPHER.WINDOW_MS,
  maxRequests: DEFAULT_RATE_LIMITS.PHOTOGRAPHER.MAX_REQUESTS,
  message: DEFAULT_RATE_LIMITS.PHOTOGRAPHER.MESSAGE
})

/**
 * Rate limiter للمنسقين
 */
export const coordinatorRateLimit = createUserRateLimit({
  windowMs: DEFAULT_RATE_LIMITS.COORDINATOR.WINDOW_MS,
  maxRequests: DEFAULT_RATE_LIMITS.COORDINATOR.MAX_REQUESTS,
  message: DEFAULT_RATE_LIMITS.COORDINATOR.MESSAGE
})

// ======================================
// Dynamic Rate Limiters
// ======================================

/**
 * Rate limiter مخصص للموارد
 */
export const applyRateLimit = (resource: string, maxRequests: number, windowMinutes: number) => {
  return createRateLimit({
    windowMs: windowMinutes * 60 * 1000,
    maxRequests,
    message: `تم تجاوز الحد المسموح لـ ${resource} (${maxRequests} طلب / ${windowMinutes} دقيقة)`
  })
}

/**
 * Rate limiter متدرج حسب عدد الطلبات
 */
export const createTieredRateLimit = (tiers: Array<{
  threshold: number,
  windowMs: number,
  maxRequests: number
}>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const key = req.ip || 'unknown'
    const entry = getRateLimitEntry(key)
    
    // تحديد الطبقة المناسبة بناءً على الاستخدام السابق
    let currentTier = tiers[0]
    if (entry) {
      for (const tier of tiers) {
        if (entry.count >= tier.threshold) {
          currentTier = tier
        }
      }
    }
    
    // تطبيق Rate Limiter للطبقة المحددة
    const limiter = createRateLimit({
      windowMs: currentTier.windowMs,
      maxRequests: currentTier.maxRequests,
      message: `تم تجاوز الحد المسموح للطبقة الحالية (${currentTier.maxRequests} طلب)`
    })
    
    limiter(req, res, next)
  }
}

/**
 * Rate limiter مع whitelist
 */
export const createWhitelistRateLimit = (options: RateLimitOptions, whitelist: string[]) => {
  const baseRateLimit = createRateLimit(options)
  
  return (req: Request, res: Response, next: NextFunction): void => {
    const key = req.ip || 'unknown'
    
    // فحص الـ whitelist
    if (whitelist.includes(key)) {
      next()
      return
    }
    
    baseRateLimit(req, res, next)
  }
}

/**
 * Rate limiter مع blacklist (حظر فوري)
 */
export const createBlacklistRateLimit = (options: RateLimitOptions, blacklist: string[]) => {
  const baseRateLimit = createRateLimit(options)
  
  return (req: Request, res: Response, next: NextFunction): void => {
    const key = req.ip || 'unknown'
    
    // فحص الـ blacklist
    if (blacklist.includes(key)) {
      const errorResponse: RateLimitErrorResponse = {
        success: false,
        error: 'rate_limit_exceeded',
        message: 'تم حظر هذا العنوان بشكل دائم',
        details: {
          limit: 0,
          remaining: 0,
          reset: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          retryAfter: 86400 // 24 ساعة
        },
        timestamp: new Date().toISOString()
      }
      
      res.status(429).json(errorResponse)
      return
    }
    
    baseRateLimit(req, res, next)
  }
}

// ======================================
// Conditional Rate Limiters
// ======================================

/**
 * Rate limiter حسب حجم الطلب
 */
export const createSizeBasedRateLimit = (baseOptions: RateLimitOptions, sizeMultiplier: number = 2) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.get('content-length') || '0', 10)
    const sizeFactor = Math.ceil(contentLength / 1024) // KB
    
    const adjustedMaxRequests = Math.max(1, Math.floor(baseOptions.maxRequests / (sizeFactor * sizeMultiplier)))
    
    const sizeBasedLimiter = createRateLimit({
      ...baseOptions,
      maxRequests: adjustedMaxRequests,
      message: `تم تجاوز الحد المسموح للطلبات الكبيرة (${adjustedMaxRequests} طلب)`
    })
    
    sizeBasedLimiter(req, res, next)
  }
}

/**
 * Rate limiter حسب وقت اليوم
 */
export const createTimeBasedRateLimit = (
  peakHoursOptions: RateLimitOptions,
  offHoursOptions: RateLimitOptions,
  peakHours: { start: number, end: number } = { start: 9, end: 17 }
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const currentHour = new Date().getHours()
    const isPeakHours = currentHour >= peakHours.start && currentHour < peakHours.end
    
    const selectedOptions = isPeakHours ? peakHoursOptions : offHoursOptions
    const timeBasedLimiter = createRateLimit(selectedOptions)
    
    timeBasedLimiter(req, res, next)
  }
} 
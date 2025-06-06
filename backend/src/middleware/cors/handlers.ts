/**
 * CORS Handlers - Depth Studio Backend
 * CORS middleware handlers and validation functions
 */

import { Request, Response, NextFunction } from 'express'
import type { AuthenticatedRequest } from '../auth'
import { 
  CorsOptions, 
  DEFAULT_CORS_OPTIONS,
  SUSPICIOUS_ORIGIN_PATTERNS,
  UserRole
} from './types'
import { 
  getCorsConfigByRole,
  getCorsConfigByEnvironment,
  getPublicApiCorsConfig,
  getDevelopmentCorsConfig
} from './config'

// ======================================
// Statistics Management
// ======================================

// متغيرات الإحصائيات
let corsStats = {
  total: 0,
  allowed: 0,
  blocked: 0,
  preflight: 0,
  origins: {} as Record<string, number>
}

/**
 * تحديث إحصائيات CORS
 */
export const updateCorsStats = (origin: string | undefined, allowed: boolean, isPreflight: boolean = false): void => {
  corsStats.total++
  
  if (allowed) {
    corsStats.allowed++
  } else {
    corsStats.blocked++
  }
  
  if (isPreflight) {
    corsStats.preflight++
  }
  
  if (origin) {
    corsStats.origins[origin] = (corsStats.origins[origin] || 0) + 1
  }
}

/**
 * الحصول على إحصائيات CORS
 */
export const getCorsStats = () => {
  const topOrigins = Object.entries(corsStats.origins)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([origin, count]) => ({ origin, count }))
  
  return {
    totalRequests: corsStats.total,
    allowedRequests: corsStats.allowed,
    blockedRequests: corsStats.blocked,
    topOrigins,
    preflightRequests: corsStats.preflight
  }
}

/**
 * إعادة تعيين إحصائيات CORS
 */
export const resetCorsStats = (): void => {
  corsStats = {
    total: 0,
    allowed: 0,
    blocked: 0,
    preflight: 0,
    origins: {}
  }
}

// ======================================
// Utility Functions
// ======================================

/**
 * فحص ما إذا كان الأصل مسموح
 */
function isOriginAllowed(origin: string | undefined, allowedOrigins: string[]): boolean {
  if (!origin) {
    // السماح للطلبات من نفس الأصل (same-origin)
    return true
  }
  
  // فحص القائمة المسموحة
  if (allowedOrigins.includes('*')) {
    return true
  }
  
  return allowedOrigins.some(allowedOrigin => {
    // فحص التطابق الكامل
    if (allowedOrigin === origin) {
      return true
    }
    
    // فحص النمط البري (wildcard)
    if (allowedOrigin.includes('*')) {
      const pattern = allowedOrigin.replace(/\*/g, '.*')
      const regex = new RegExp(`^${pattern}$`)
      return regex.test(origin)
    }
    
    return false
  })
}

// ======================================
// Main CORS Handlers
// ======================================

/**
 * معالج CORS الرئيسي
 */
export const corsHandler = (options: Partial<CorsOptions> = {}) => {
  const config = { ...DEFAULT_CORS_OPTIONS, ...options }
  
  return (req: Request, res: Response, next: NextFunction): void => {
    const origin = req.headers.origin
    const method = req.method
    const isPreflight = method === 'OPTIONS'
    
    // فحص الأصل المطلوب
    const isAllowed = isOriginAllowed(origin, config.allowedOrigins)
    
    if (isAllowed) {
      res.header('Access-Control-Allow-Origin', origin || '*')
    } else {
      // تسجيل المحاولة غير المسموحة
      console.warn(`CORS: Origin not allowed: ${origin}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.originalUrl,
        method: req.method
      })
    }
    
    // إعداد الصلاحيات
    if (config.allowCredentials) {
      res.header('Access-Control-Allow-Credentials', 'true')
    }
    
    // إعداد الطرق المسموحة
    res.header('Access-Control-Allow-Methods', config.allowedMethods.join(', '))
    
    // إعداد الـ Headers المسموحة
    res.header('Access-Control-Allow-Headers', config.allowedHeaders.join(', '))
    
    // إعداد الـ Headers المكشوفة
    if (config.exposedHeaders.length > 0) {
      res.header('Access-Control-Expose-Headers', config.exposedHeaders.join(', '))
    }
    
    // إعداد Max-Age للـ preflight cache
    res.header('Access-Control-Max-Age', config.maxAge.toString())
    
    // تحديث الإحصائيات
    updateCorsStats(origin, isAllowed, isPreflight)
    
    // معالجة طلبات Preflight (OPTIONS)
    if (isPreflight) {
      if (config.preflightContinue) {
        next()
      } else {
        res.status(config.optionsSuccessStatus).end()
      }
      return
    }
    
    next()
  }
}

/**
 * CORS مبسط للتطوير
 */
export const developmentCors = (req: Request, res: Response, next: NextFunction): void => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Credentials', 'true')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
  res.header('Access-Control-Allow-Headers', '*')
  res.header('Access-Control-Expose-Headers', '*')
  
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }
  
  next()
}

// ======================================
// Specialized CORS Handlers
// ======================================

/**
 * CORS للإنتاج
 */
export const productionCors = corsHandler(getCorsConfigByEnvironment('production'))

/**
 * CORS للواجهات العامة
 */
export const publicApiCors = corsHandler(getPublicApiCorsConfig())

/**
 * CORS حسب دور المستخدم
 */
export const roleBasedCors = (req: Request, res: Response, next: NextFunction): void => {
  const authReq = req as AuthenticatedRequest
  
  // إذا لم يكن هناك مستخدم مصادق، استخدم CORS العام
  if (!authReq.user) {
    corsHandler()(req, res, next)
    return
  }
  
  const userRole = authReq.user.primary_role as UserRole
  const roleConfig = getCorsConfigByRole(userRole)
  
  corsHandler(roleConfig)(req, res, next)
}

/**
 * CORS حسب البيئة
 */
export const environmentCors = corsHandler(getCorsConfigByEnvironment())

// ======================================
// Security Validation
// ======================================

/**
 * فحص أمان الأصل المطلوب
 */
export const validateOriginSecurity = (req: Request, res: Response, next: NextFunction): void => {
  const origin = req.headers.origin
  const referer = req.headers.referer
  const userAgent = req.headers['user-agent']
  
  if (process.env.NODE_ENV === 'production' && origin) {
    const isSuspicious = SUSPICIOUS_ORIGIN_PATTERNS.some(pattern => pattern.test(origin))
    
    if (isSuspicious) {
      console.warn(`Suspicious origin detected: ${origin}`, {
        referer,
        userAgent,
        ip: req.ip,
        url: req.originalUrl
      })
      
      res.status(403).json({
        success: false,
        error: 'ORIGIN_NOT_ALLOWED',
        message: 'الأصل المطلوب غير مسموح',
        timestamp: new Date().toISOString()
      })
      return
    }
  }
  
  next()
}

/**
 * فحص أصل الـ referer
 */
export const validateRefererOrigin = (req: Request, res: Response, next: NextFunction): void => {
  const referer = req.headers.referer
  const origin = req.headers.origin
  
  // في حالة عدم وجود referer أو origin، السماح بالمرور
  if (!referer && !origin) {
    next()
    return
  }
  
  try {
    if (referer) {
      const refererUrl = new URL(referer)
      const refererOrigin = `${refererUrl.protocol}//${refererUrl.host}`
      
      // التحقق من تطابق الـ origin مع الـ referer
      if (origin && origin !== refererOrigin) {
        console.warn(`Origin/Referer mismatch: origin=${origin}, referer=${refererOrigin}`)
      }
    }
  } catch (error) {
    console.warn(`Invalid referer URL: ${referer}`)
  }
  
  next()
} 
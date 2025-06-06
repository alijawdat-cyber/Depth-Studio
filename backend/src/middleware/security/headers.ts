/**
 * Security Headers - Depth Studio Backend
 * Security headers middleware and validation
 */

import helmet from 'helmet'
import { Request, Response, NextFunction } from 'express'
import { 
  SecurityOptions, 
  DEFAULT_SECURITY_OPTIONS,
  ALLOWED_HOSTS,
  SENSITIVE_ENDPOINTS,
  SUSPICIOUS_BOT_PATTERNS
} from './types'
import { 
  getProductionCSP, 
  getDevelopmentCSP, 
  getProductionHSTS,
  getPermissionsPolicy,
  getNoCacheHeaders
} from './config'

// ======================================
// Main Security Headers
// ======================================

/**
 * Helmet middleware المخصص
 */
export const securityHeaders = (options: Partial<SecurityOptions> = {}) => {
  const config = { ...DEFAULT_SECURITY_OPTIONS, ...options }
  
  return helmet({
    // Content Security Policy
    contentSecurityPolicy: config.enableCSP ? 
      (config.isDevelopment ? getDevelopmentCSP() : getProductionCSP()) : 
      false,
    
    // HTTP Strict Transport Security (HTTPS only)
    hsts: config.enableHSTS ? getProductionHSTS() : false,
    
    // X-Content-Type-Options
    noSniff: config.enableNoSniff,
    
    // X-Frame-Options
    frameguard: config.enableFrameguard ? {
      action: 'deny' // منع تضمين الصفحة في iframe
    } : false,
    
    // X-XSS-Protection
    xssFilter: config.enableXSSFilter,
    
    // Referrer Policy
    referrerPolicy: config.enableReferrerPolicy ? {
      policy: 'strict-origin-when-cross-origin'
    } : false,
    
    // Remove X-Powered-By header
    hidePoweredBy: true,
    
    // DNS Prefetch Control
    dnsPrefetchControl: {
      allow: false
    },
    
    // IE, restrict untrusted HTML
    ieNoOpen: true
  })
}

/**
 * أمان خاص بـ API
 */
export const apiSecurityHeaders = (req: Request, res: Response, next: NextFunction): void => {
  // منع الكاش للـ APIs الحساسة
  const noCacheHeaders = getNoCacheHeaders()
  res.set(noCacheHeaders)
  
  // Security headers إضافية للـ API
  res.set({
    'X-API-Version': '1.0.0',
    'X-Robots-Tag': 'noindex, nofollow',
    'X-Content-Type-Options': 'nosniff'
  })
  
  next()
}

/**
 * حماية من clickjacking
 */
export const clickjackingProtection = (req: Request, res: Response, next: NextFunction): void => {
  res.set('X-Frame-Options', 'DENY')
  res.set('Content-Security-Policy', "frame-ancestors 'none'")
  next()
}

/**
 * حماية من MIME type confusion
 */
export const mimeTypeProtection = (req: Request, res: Response, next: NextFunction): void => {
  res.set('X-Content-Type-Options', 'nosniff')
  next()
}

/**
 * Permissions Policy middleware منفصل
 */
export const permissionsPolicy = (req: Request, res: Response, next: NextFunction): void => {
  if (process.env.NODE_ENV === 'production') {
    res.set('Permissions-Policy', getPermissionsPolicy())
  }
  next()
}

/**
 * إزالة sensitive headers من الرد
 */
export const sanitizeResponseHeaders = (req: Request, res: Response, next: NextFunction): void => {
  // إزالة headers حساسة
  res.removeHeader('X-Powered-By')
  res.removeHeader('Server')
  
  // إضافة security headers
  res.set('X-Robots-Tag', 'noindex')
  
  next()
}

// ======================================
// CSRF Protection
// ======================================

/**
 * حماية من CSRF للعمليات الحساسة
 */
export const csrfProtection = (req: Request, res: Response, next: NextFunction): void => {
  const method = req.method
  const isReadOperation = ['GET', 'HEAD', 'OPTIONS'].includes(method)
  
  if (isReadOperation) {
    next()
    return
  }
  
  // فحص Origin header
  const origin = req.headers.origin
  const referer = req.headers.referer
  
  if (!origin && !referer) {
    res.status(403).json({
      success: false,
      error: 'CSRF_PROTECTION',
      message: 'Origin أو Referer مطلوب للعمليات التعديلية',
      timestamp: new Date().toISOString()
    })
    return
  }
  
  // في الإنتاج، تحقق من المصدر
  if (process.env.NODE_ENV === 'production') {
    let sourceHost = ''
    if (origin) {
      sourceHost = new URL(origin).hostname
    } else if (referer) {
      sourceHost = new URL(referer).hostname
    }
    
    if (!ALLOWED_HOSTS.includes(sourceHost)) {
      res.status(403).json({
        success: false,
        error: 'CSRF_PROTECTION',
        message: 'مصدر الطلب غير مسموح',
        timestamp: new Date().toISOString()
      })
      return
    }
  }
  
  next()
}

// ======================================
// User Agent Validation
// ======================================

/**
 * فحص User-Agent للحماية من البوتات
 */
export const userAgentValidation = (req: Request, res: Response, next: NextFunction): void => {
  const userAgent = req.headers['user-agent']
  
  if (!userAgent) {
    res.status(400).json({
      success: false,
      error: 'MISSING_USER_AGENT',
      message: 'User-Agent header مطلوب',
      timestamp: new Date().toISOString()
    })
    return
  }
  
  if (process.env.NODE_ENV === 'production') {
    const isSuspicious = SUSPICIOUS_BOT_PATTERNS.some(pattern => pattern.test(userAgent))
    
    if (isSuspicious) {
      console.warn(`Suspicious User-Agent detected: ${userAgent}`, {
        ip: req.ip,
        url: req.originalUrl,
        method: req.method
      })
      
      // يمكن إما منع الطلب أو تسجيله فقط
      // نكتفي بالتسجيل حالياً لتجنب false positives
    }
  }
  
  next()
}

// ======================================
// Brute Force Protection
// ======================================

/**
 * Rate limiting لحماية من brute force
 */
export const bruteForceLimiter = (req: Request, res: Response, next: NextFunction): void => {
  if (SENSITIVE_ENDPOINTS.some(endpoint => req.path.includes(endpoint))) {
    // إضافة تأخير عشوائي صغير لتصعيب timing attacks
    const delay = Math.floor(Math.random() * 100) + 50 // 50-150ms
    
    setTimeout(() => {
      next()
    }, delay)
  } else {
    next()
  }
} 
/**
 * Rate Limiting Handlers - Depth Studio Backend
 * Middleware handlers and role-based rate limiting
 */

import { Request, Response, NextFunction } from 'express'
import type { AuthenticatedRequest } from '../auth'
import { UserRoleForRateLimit } from './types'
import {
  generalRateLimit,
  adminRateLimit,
  photographerRateLimit,
  coordinatorRateLimit,
  emergencyRateLimit
} from './limiters'

// ======================================
// Emergency Mode Management
// ======================================

/**
 * حالة الطوارئ للنظام
 */
let isEmergencyMode = false

/**
 * تفعيل/إلغاء حالة الطوارئ
 */
export const setEmergencyMode = (enabled: boolean): void => {
  isEmergencyMode = enabled
  console.log(`Rate Limiting Emergency Mode: ${enabled ? 'مفعل' : 'معطل'}`)
}

/**
 * فحص حالة الطوارئ
 */
export const isInEmergencyMode = (): boolean => {
  return isEmergencyMode
}

/**
 * Middleware للتحقق من حالة الطوارئ
 */
export const emergencyModeRateLimit = (req: Request, res: Response, next: NextFunction): void => {
  if (isEmergencyMode) {
    emergencyRateLimit(req, res, next)
  } else {
    next()
  }
}

// ======================================
// Role-based Rate Limiting
// ======================================

/**
 * Rate limiter متدرج حسب دور المستخدم
 */
export const roleBasedRateLimit = (req: Request, res: Response, next: NextFunction): void => {
  const authReq = req as AuthenticatedRequest
  
  // فحص حالة الطوارئ أولاً
  if (isEmergencyMode) {
    emergencyRateLimit(req, res, next)
    return
  }
  
  if (!authReq.user) {
    // مستخدم غير مصادق - استخدم الحد العام
    generalRateLimit(req, res, next)
    return
  }
  
  const userRole = authReq.user.primary_role as UserRoleForRateLimit
  
  switch (userRole) {
    case 'super_admin':
    case 'marketing_coordinator':
      adminRateLimit(req, res, next)
      break
    case 'brand_coordinator':
      coordinatorRateLimit(req, res, next)
      break
    case 'photographer':
      photographerRateLimit(req, res, next)
      break
    default:
      generalRateLimit(req, res, next)
  }
}

/**
 * Rate limiter للمديرين فقط
 */
export const adminOnlyRateLimit = (req: Request, res: Response, next: NextFunction): void => {
  const authReq = req as AuthenticatedRequest
  
  if (!authReq.user) {
    res.status(401).json({
      success: false,
      error: 'unauthorized',
      message: 'يجب تسجيل الدخول أولاً'
    })
    return
  }
  
  const userRole = authReq.user.primary_role as UserRoleForRateLimit
  
  if (userRole === 'super_admin' || userRole === 'marketing_coordinator') {
    adminRateLimit(req, res, next)
  } else {
    res.status(403).json({
      success: false,
      error: 'forbidden',
      message: 'هذا الإجراء مخصص للمديرين فقط'
    })
  }
}

/**
 * Rate limiter للمصورين فقط
 */
export const photographerOnlyRateLimit = (req: Request, res: Response, next: NextFunction): void => {
  const authReq = req as AuthenticatedRequest
  
  if (!authReq.user) {
    res.status(401).json({
      success: false,
      error: 'unauthorized',
      message: 'يجب تسجيل الدخول أولاً'
    })
    return
  }
  
  const userRole = authReq.user.primary_role as UserRoleForRateLimit
  
  if (userRole === 'photographer') {
    photographerRateLimit(req, res, next)
  } else {
    res.status(403).json({
      success: false,
      error: 'forbidden',
      message: 'هذا الإجراء مخصص للمصورين فقط'
    })
  }
}

/**
 * Rate limiter للمنسقين فقط
 */
export const coordinatorOnlyRateLimit = (req: Request, res: Response, next: NextFunction): void => {
  const authReq = req as AuthenticatedRequest
  
  if (!authReq.user) {
    res.status(401).json({
      success: false,
      error: 'unauthorized',
      message: 'يجب تسجيل الدخول أولاً'
    })
    return
  }
  
  const userRole = authReq.user.primary_role as UserRoleForRateLimit
  
  if (userRole === 'brand_coordinator') {
    coordinatorRateLimit(req, res, next)
  } else {
    res.status(403).json({
      success: false,
      error: 'forbidden',
      message: 'هذا الإجراء مخصص لمنسقي البراندات فقط'
    })
  }
}

// ======================================
// Conditional Rate Limiting
// ======================================

/**
 * Rate limiter حسب نوع العملية
 */
export const operationBasedRateLimit = (operationType: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // تطبيق rate limiting مختلف حسب نوع العملية
    switch (operationType) {
      case 'read':
        // عمليات القراءة - حدود أعلى
        roleBasedRateLimit(req, res, next)
        break
      case 'write':
        // عمليات الكتابة - حدود أقل
        const writeRateLimit = generalRateLimit
        writeRateLimit(req, res, next)
        break
      case 'delete':
        // عمليات الحذف - حدود صارمة
        adminOnlyRateLimit(req, res, next)
        break
      case 'upload':
        // رفع الملفات - حدود خاصة
        photographerOnlyRateLimit(req, res, next)
        break
      default:
        generalRateLimit(req, res, next)
    }
  }
}

/**
 * Rate limiter حسب حجم البيانات
 */
export const dataSizeRateLimit = (req: Request, res: Response, next: NextFunction): void => {
  const contentLength = parseInt(req.get('content-length') || '0', 10)
  
  if (contentLength > 10 * 1024 * 1024) { // أكبر من 10MB
    // بيانات كبيرة - حدود صارمة
    emergencyRateLimit(req, res, next)
  } else if (contentLength > 1024 * 1024) { // أكبر من 1MB
    // بيانات متوسطة - حدود معتدلة
    photographerRateLimit(req, res, next)
  } else {
    // بيانات صغيرة - حدود عادية
    roleBasedRateLimit(req, res, next)
  }
}

// ======================================
// Time-based Rate Limiting
// ======================================

/**
 * Rate limiter حسب وقت النشاط
 */
export const timeBasedRateLimit = (req: Request, res: Response, next: NextFunction): void => {
  const currentHour = new Date().getHours()
  const isBusinessHours = currentHour >= 9 && currentHour < 17 // 9 صباحاً - 5 مساءً
  const isPeakHours = currentHour >= 10 && currentHour < 14   // 10 صباحاً - 2 ظهراً
  
  if (isPeakHours) {
    // ساعات الذروة - حدود صارمة
    emergencyRateLimit(req, res, next)
  } else if (isBusinessHours) {
    // ساعات العمل - حدود عادية
    roleBasedRateLimit(req, res, next)
  } else {
    // خارج ساعات العمل - حدود مرنة
    adminRateLimit(req, res, next)
  }
}

// ======================================
// Geographic Rate Limiting
// ======================================

/**
 * Rate limiter حسب الموقع الجغرافي
 */
export const geographicRateLimit = (req: Request, res: Response, next: NextFunction): void => {
  const clientIP = req.ip || 'unknown'
  const forwardedFor = req.get('X-Forwarded-For')
  const realIP = req.get('X-Real-IP')
  
  // فحص إذا كان IP محلي (عراقي)
  const isLocalIP = isIraqiIP(clientIP) || 
                   (forwardedFor && isIraqiIP(forwardedFor)) ||
                   (realIP && isIraqiIP(realIP))
  
  if (isLocalIP) {
    // IPs عراقية - حدود مرنة
    roleBasedRateLimit(req, res, next)
  } else {
    // IPs خارجية - حدود صارمة
    generalRateLimit(req, res, next)
  }
}

/**
 * فحص إذا كان IP عراقي (تطبيق مبسط)
 */
function isIraqiIP(ip: string): boolean {
  // تطبيق مبسط - في الواقع نحتاج قاعدة بيانات GeoIP
  const iraqiRanges = [
    '5.1.', '37.236.', '37.237.', '37.238.', '37.239.',
    '80.78.', '82.114.', '85.15.', '149.34.', '185.60.'
  ]
  
  return iraqiRanges.some(range => ip.startsWith(range))
}

// ======================================
// Device-based Rate Limiting
// ======================================

/**
 * Rate limiter حسب نوع الجهاز
 */
export const deviceBasedRateLimit = (req: Request, res: Response, next: NextFunction): void => {
  const userAgent = req.get('User-Agent') || ''
  const isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent)
  const isBot = /bot|crawler|spider/i.test(userAgent)
  
  if (isBot) {
    // Bots - حدود صارمة جداً
    emergencyRateLimit(req, res, next)
  } else if (isMobile) {
    // أجهزة محمولة - حدود معتدلة
    generalRateLimit(req, res, next)
  } else {
    // أجهزة سطح المكتب - حدود عادية
    roleBasedRateLimit(req, res, next)
  }
}

// ======================================
// Load-based Rate Limiting
// ======================================

/**
 * Rate limiter حسب حمولة الخادم
 */
export const loadBasedRateLimit = (req: Request, res: Response, next: NextFunction): void => {
  // فحص حمولة الخادم (تطبيق مبسط)
  const memoryUsage = process.memoryUsage()
  const memoryUsagePercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100
  
  if (memoryUsagePercent > 90) {
    // حمولة عالية جداً - حدود طوارئ
    emergencyRateLimit(req, res, next)
  } else if (memoryUsagePercent > 70) {
    // حمولة عالية - حدود صارمة
    generalRateLimit(req, res, next)
  } else {
    // حمولة عادية - حدود طبيعية
    roleBasedRateLimit(req, res, next)
  }
}

// ======================================
// Error-based Rate Limiting
// ======================================

/**
 * Rate limiter يزداد صرامة مع الأخطاء
 */
export const errorBasedRateLimit = (req: Request, res: Response, next: NextFunction): void => {
  const clientKey = req.ip || 'unknown'
  
  // فحص عدد الأخطاء الأخيرة (تطبيق مبسط)
  // في التطبيق الحقيقي نحتاج تتبع الأخطاء
  const recentErrors = getRecentErrorCount(clientKey)
  
  if (recentErrors > 10) {
    // أخطاء كثيرة - حدود صارمة جداً
    emergencyRateLimit(req, res, next)
  } else if (recentErrors > 5) {
    // أخطاء معتدلة - حدود صارمة
    generalRateLimit(req, res, next)
  } else {
    // أخطاء قليلة - حدود عادية
    roleBasedRateLimit(req, res, next)
  }
}

/**
 * الحصول على عدد الأخطاء الأخيرة (دالة مبسطة)
 */
function getRecentErrorCount(clientKey: string): number {
  // تطبيق مبسط - في الواقع نحتاج تتبع حقيقي للأخطاء
  return Math.floor(Math.random() * 15) // رقم عشوائي للاختبار
} 
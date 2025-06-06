/**
 * Logging Handlers - Depth Studio Backend
 * Middleware functions for comprehensive request/response logging
 */

import { Request, Response, NextFunction } from 'express'
import type { AuthenticatedRequest } from '../auth'
import { 
  LogEntry, 
  LogLevel, 
  LoggingOptions, 
  DEFAULT_LOGGING_OPTIONS,
  ErrorLogEntry,
  AuditLogEntry,
  AdminLogEntry
} from './types'
import { 
  getClientIP, 
  generateRequestId, 
  sanitizeHeaders, 
  sanitizeAndTruncateBody,
  sanitizeObject,
  formatLogMessage,
  getLogLevelFromStatus,
  updateLogStats
} from './utils'

// ======================================
// Main Request Logger
// ======================================

/**
 * Middleware للتسجيل الشامل
 */
export const requestLogger = (options: Partial<LoggingOptions> = {}) => {
  const config = { ...DEFAULT_LOGGING_OPTIONS, ...options }
  
  return (req: Request, res: Response, next: NextFunction): void => {
    const startTime = Date.now()
    const authReq = req as AuthenticatedRequest
    
    // فحص المسارات المستبعدة
    if (config.excludePaths.some(path => req.path.includes(path))) {
      next()
      return
    }
    
    // إنشاء معرف فريد للطلب
    const requestId = generateRequestId()
    
    // إضافة معرف الطلب للـ headers
    res.set('X-Request-ID', requestId)
    
    // تجهيز بيانات التسجيل الأولية
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl,
      path: req.path,
      query: config.logQuery ? sanitizeObject(req.query, config.sensitiveFields) : undefined,
      headers: config.logHeaders ? sanitizeHeaders(req.headers, config.excludeHeaders) : undefined,
      body: config.logBody ? sanitizeAndTruncateBody(req.body, config) : undefined,
      user: config.logUserInfo && authReq.user ? {
        id: authReq.user.id,
        role: authReq.user.primary_role,
        email: authReq.user.email
      } : undefined,
      ip: getClientIP(req),
      userAgent: req.get('User-Agent') || 'unknown'
    }
    
    // تسجيل بداية الطلب
    logRequest(logEntry, LogLevel.INFO, requestId)
    
    // حفظ الوقت الأصلي للـ response
    const originalSend = res.send
    const originalJson = res.json
    
    // مراقبة الرد
    res.send = function(body: any) {
      logResponse(logEntry, res, startTime, body, requestId)
      return originalSend.call(this, body)
    }
    
    res.json = function(obj: any) {
      logResponse(logEntry, res, startTime, obj, requestId)
      return originalJson.call(this, obj)
    }
    
    // مراقبة الأخطاء
    res.on('error', (error) => {
      logEntry.error = {
        message: error.message,
        stack: error.stack,
        name: error.name
      }
      logRequest(logEntry, LogLevel.ERROR, requestId)
    })
    
    next()
  }
}

// ======================================
// Specific Loggers
// ======================================

/**
 * Middleware للتسجيل السريع (للإنتاج)
 */
export const simpleLogger = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now()
  
  res.on('finish', () => {
    const responseTime = Date.now() - startTime
    const logMessage = `${req.method} ${req.originalUrl} - ${res.statusCode} - ${responseTime}ms - ${getClientIP(req)}`
    
    if (res.statusCode >= 400) {
      console.error(logMessage)
    } else {
      console.log(logMessage)
    }
    
    // تحديث الإحصائيات
    updateLogStats(res.statusCode, responseTime, req.path, getClientIP(req))
  })
  
  next()
}

/**
 * Middleware لتسجيل أخطاء العمليات
 */
export const errorLogger = (error: any, req: Request, res: Response, next: NextFunction): void => {
  const authReq = req as AuthenticatedRequest
  const requestId = res.get('X-Request-ID') || generateRequestId()
  
  const errorLog: ErrorLogEntry = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
    path: req.path,
    user: authReq.user ? {
      id: authReq.user.id,
      role: authReq.user.primary_role,
      email: authReq.user.email
    } : undefined,
    ip: getClientIP(req),
    userAgent: req.get('User-Agent') || 'unknown',
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code
    }
  }
  
  console.error(`[ERROR] [${requestId}]`, formatLogMessage('ERROR', requestId, errorLog))
  
  next(error)
}

/**
 * Middleware لتسجيل العمليات الحساسة
 */
export const auditLogger = (operation: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authReq = req as AuthenticatedRequest
    const requestId = res.get('X-Request-ID') || generateRequestId()
    
    const auditLog: AuditLogEntry = {
      operation,
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl,
      path: req.path,
      user: authReq.user ? {
        id: authReq.user.id,
        role: authReq.user.primary_role,
        email: authReq.user.email
      } : undefined,
      ip: getClientIP(req),
      userAgent: req.get('User-Agent') || 'unknown',
      changes: sanitizeObject(req.body, DEFAULT_LOGGING_OPTIONS.sensitiveFields)
    }
    
    console.log(`[AUDIT] [${requestId}]`, formatLogMessage('AUDIT', requestId, auditLog))
    
    next()
  }
}

/**
 * Middleware للتسجيل المتقدم للمديرين
 */
export const adminActionLogger = (req: Request, res: Response, next: NextFunction): void => {
  const authReq = req as AuthenticatedRequest
  
  // فقط للمديرين
  if (!authReq.user || !['super_admin', 'marketing_coordinator'].includes(authReq.user.primary_role)) {
    next()
    return
  }
  
  const requestId = res.get('X-Request-ID') || generateRequestId()
  
  const adminLog: AdminLogEntry = {
    type: 'ADMIN_ACTION',
    requestId,
    timestamp: new Date().toISOString(),
    admin: {
      id: authReq.user.id,
      role: authReq.user.primary_role,
      email: authReq.user.email
    },
    action: {
      method: req.method,
      url: req.originalUrl,
      path: req.path,
      body: sanitizeObject(req.body, DEFAULT_LOGGING_OPTIONS.sensitiveFields)
    },
    ip: getClientIP(req),
    userAgent: req.get('User-Agent') || 'unknown'
  }
  
  console.warn(`[ADMIN] [${requestId}]`, formatLogMessage('ADMIN_ACTION', requestId, adminLog))
  
  next()
}

// ======================================
// Helper Functions
// ======================================

/**
 * تسجيل بيانات الطلب
 */
export function logRequest(entry: LogEntry, level: LogLevel, requestId: string): void {
  const logMessage = formatLogMessage('REQUEST', requestId, entry)
  console.log(`[${level.toUpperCase()}] [${requestId}]`, logMessage)
}

/**
 * تسجيل بيانات الرد
 */
function logResponse(entry: LogEntry, res: Response, startTime: number, body: any, requestId: string): void {
  const responseTime = Date.now() - startTime
  const statusCode = res.statusCode
  
  entry.responseTime = responseTime
  entry.statusCode = statusCode
  entry.responseSize = JSON.stringify(body).length
  
  const level = getLogLevelFromStatus(statusCode)
  
  const responseData = {
    ...entry,
    responseTime: `${responseTime}ms`,
    responseSize: `${entry.responseSize} bytes`
  }
  
  const logMessage = formatLogMessage('RESPONSE', requestId, responseData)
  console.log(`[${level}] [${requestId}]`, logMessage)
  
  // تحديث الإحصائيات
  updateLogStats(statusCode, responseTime, entry.path, entry.ip)
} 
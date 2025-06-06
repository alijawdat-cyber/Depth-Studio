/**
 * Error Utilities - Depth Studio Backend
 * Utility functions for error handling and logging
 */

import { Request, Response, NextFunction } from 'express'
import type { AuthenticatedRequest } from '../auth'
import { ErrorLogDetails, AppError } from './types'

// ======================================
// Logging Functions
// ======================================

/**
 * تسجيل الأخطاء
 */
export function logError(error: any, req: Request, requestId: string): void {
  const authReq = req as AuthenticatedRequest
  
  const errorLog: ErrorLogDetails = {
    type: 'APPLICATION_ERROR',
    requestId,
    timestamp: new Date().toISOString(),
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: error.code,
      statusCode: error.statusCode
    },
    request: {
      method: req.method,
      url: req.originalUrl,
      path: req.path,
      headers: sanitizeHeaders(req.headers),
      body: sanitizeBody(req.body),
      query: req.query,
      params: req.params
    },
    user: authReq.user ? {
      id: authReq.user.id,
      role: authReq.user.primary_role,
      email: authReq.user.email
    } : undefined,
    ip: getClientIP(req),
    userAgent: req.get('User-Agent')
  }
  
  // تسجيل حسب نوع الخطأ
  if (error instanceof AppError && error.statusCode < 500) {
    console.warn(`[WARN] [${requestId}]`, JSON.stringify(errorLog, null, 2))
  } else {
    console.error(`[ERROR] [${requestId}]`, JSON.stringify(errorLog, null, 2))
  }
}

// ======================================
// Data Sanitization Functions
// ======================================

/**
 * تنظيف البيانات الحساسة من Headers
 */
export function sanitizeHeaders(headers: any): any {
  const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key']
  const sanitized = { ...headers }
  
  sensitiveHeaders.forEach(header => {
    if (sanitized[header]) {
      sanitized[header] = '[REDACTED]'
    }
  })
  
  return sanitized
}

/**
 * تنظيف البيانات الحساسة من Body
 */
export function sanitizeBody(body: any): any {
  if (!body || typeof body !== 'object') return body
  
  const sensitiveFields = ['password', 'token', 'secret', 'key']
  const sanitized = { ...body }
  
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]'
    }
  })
  
  return sanitized
}

/**
 * الحصول على IP العميل
 */
export function getClientIP(req: Request): string {
  return (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
         req.headers['x-real-ip'] as string ||
         req.connection?.remoteAddress ||
         req.socket?.remoteAddress ||
         'unknown'
}

// ======================================
// Special Error Handlers
// ======================================

/**
 * معالج الطلبات غير الموجودة (404)
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error = new AppError(`المسار ${req.originalUrl} غير موجود`, 404, 'NOT_FOUND_ERROR')
  next(error)
}

/**
 * معالج timeout للطلبات
 */
export const timeoutHandler = (timeoutMs: number = 30000) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const timeout = setTimeout(() => {
      if (!res.headersSent) {
        res.status(408).json({
          success: false,
          error: 'REQUEST_TIMEOUT',
          message: `انتهت مهلة الطلب (${timeoutMs}ms)`,
          timestamp: new Date().toISOString(),
          requestId: res.get('X-Request-ID') || 'unknown'
        })
      }
    }, timeoutMs)
    
    res.on('finish', () => {
      clearTimeout(timeout)
    })
    
    next()
  }
}

// ======================================
// Global Error Handlers
// ======================================

/**
 * معالج الأخطاء غير المتوقعة
 */
export const uncaughtExceptionHandler = (error: Error): void => {
  console.error('Uncaught Exception:', error)
  
  // تسجيل الخطأ
  const errorLog = {
    type: 'UNCAUGHT_EXCEPTION',
    timestamp: new Date().toISOString(),
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack
    }
  }
  
  console.error('[FATAL]', JSON.stringify(errorLog, null, 2))
  
  // إنهاء التطبيق بأمان
  process.exit(1)
}

/**
 * معالج الوعود المرفوضة غير المعالجة
 */
export const unhandledRejectionHandler = (reason: any, promise: Promise<any>): void => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
  
  const errorLog = {
    type: 'UNHANDLED_REJECTION',
    timestamp: new Date().toISOString(),
    reason: reason.toString(),
    stack: reason.stack
  }
  
  console.error('[FATAL]', JSON.stringify(errorLog, null, 2))
  
  // إنهاء التطبيق بأمان
  process.exit(1)
}

/**
 * إعداد معالجات الأخطاء العامة
 */
export const setupGlobalErrorHandlers = (): void => {
  process.on('uncaughtException', uncaughtExceptionHandler)
  process.on('unhandledRejection', unhandledRejectionHandler)
  
  // معالج إيقاف التطبيق بأمان
  process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...')
    process.exit(0)
  })
  
  process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully...')
    process.exit(0)
  })
} 
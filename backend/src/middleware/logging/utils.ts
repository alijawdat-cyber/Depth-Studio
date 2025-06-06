/**
 * Logging Utilities - Depth Studio Backend
 * Utility functions for logging operations
 */

import { Request } from 'express'
import { LoggingOptions, LogStats } from './types'

// ======================================
// Data Sanitization Functions
// ======================================

/**
 * إزالة البيانات الحساسة من الكائن
 */
export function sanitizeObject(obj: any, sensitiveFields: string[]): any {
  if (!obj || typeof obj !== 'object') return obj
  
  const sanitized = { ...obj }
  
  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]'
    }
  }
  
  // إزالة البيانات الحساسة من الكائنات المدمجة
  for (const key in sanitized) {
    if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeObject(sanitized[key], sensitiveFields)
    }
  }
  
  return sanitized
}

/**
 * تنظيف الـ headers من البيانات الحساسة
 */
export function sanitizeHeaders(headers: any, excludeHeaders: string[]): any {
  const sanitized = { ...headers }
  
  for (const header of excludeHeaders) {
    if (sanitized[header]) {
      sanitized[header] = '[REDACTED]'
    }
  }
  
  return sanitized
}

/**
 * تصغير حجم الكائن للتسجيل
 */
export function truncateBody(body: any, maxSize: number): any {
  const bodyString = JSON.stringify(body)
  
  if (bodyString.length <= maxSize) {
    return body
  }
  
  return {
    _truncated: true,
    _originalSize: bodyString.length,
    _preview: bodyString.substring(0, maxSize) + '...'
  }
}

/**
 * تنظيف وتصغير الـ body
 */
export function sanitizeAndTruncateBody(body: any, config: LoggingOptions): any {
  if (!body) return undefined
  
  const sanitized = sanitizeObject(body, config.sensitiveFields)
  return truncateBody(sanitized, config.maxBodySize)
}

// ======================================
// Request Utilities
// ======================================

/**
 * الحصول على IP الحقيقي للعميل
 */
export function getClientIP(req: Request): string {
  return (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
         req.headers['x-real-ip'] as string ||
         req.connection?.remoteAddress ||
         req.socket?.remoteAddress ||
         'unknown'
}

/**
 * إنشاء معرف فريد للطلب
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

// ======================================
// Statistics Management
// ======================================

// متغيرات للإحصائيات (في الإنتاج استخدم قاعدة بيانات)
let requestStats = {
  total: 0,
  errors: 0,
  totalResponseTime: 0,
  statusCodes: {} as Record<number, number>,
  paths: {} as Record<string, number>,
  ips: {} as Record<string, number>
}

/**
 * تحديث الإحصائيات
 */
export const updateLogStats = (statusCode: number, responseTime: number, path: string, ip: string): void => {
  requestStats.total++
  requestStats.totalResponseTime += responseTime
  
  if (statusCode >= 400) {
    requestStats.errors++
  }
  
  requestStats.statusCodes[statusCode] = (requestStats.statusCodes[statusCode] || 0) + 1
  requestStats.paths[path] = (requestStats.paths[path] || 0) + 1
  requestStats.ips[ip] = (requestStats.ips[ip] || 0) + 1
}

/**
 * الحصول على إحصائيات التسجيل
 */
export const getLogStats = (): LogStats => {
  const topPaths = Object.entries(requestStats.paths)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([path, count]) => ({ path, count }))
  
  const topIPs = Object.entries(requestStats.ips)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([ip, count]) => ({ ip, count }))
  
  return {
    totalRequests: requestStats.total,
    errorCount: requestStats.errors,
    averageResponseTime: requestStats.total > 0 ? requestStats.totalResponseTime / requestStats.total : 0,
    statusCodeDistribution: requestStats.statusCodes,
    topPaths,
    topIPs
  }
}

/**
 * إعادة تعيين الإحصائيات
 */
export const resetLogStats = (): void => {
  requestStats = {
    total: 0,
    errors: 0,
    totalResponseTime: 0,
    statusCodes: {},
    paths: {},
    ips: {}
  }
}

// ======================================
// Log Formatting
// ======================================

/**
 * تنسيق رسالة Log للطباعة
 */
export function formatLogMessage(type: string, requestId: string, data: any): string {
  const logMessage = {
    type,
    requestId,
    timestamp: new Date().toISOString(),
    ...data
  }
  
  return JSON.stringify(logMessage, null, 2)
}

/**
 * تحديد مستوى التسجيل بناءً على status code
 */
export function getLogLevelFromStatus(statusCode: number): 'ERROR' | 'WARN' | 'INFO' {
  if (statusCode >= 500) return 'ERROR'
  if (statusCode >= 400) return 'WARN'
  return 'INFO'
} 
/**
 * Logging Types - Depth Studio Backend
 * Type definitions for the logging system
 */

// ======================================
// Core Types
// ======================================

/**
 * تسجيل معلومات الطلب
 */
export interface LogEntry {
  timestamp: string
  method: string
  url: string
  path: string
  query?: any
  headers?: any
  body?: any
  user?: {
    id: string
    role: string
    email: string
  }
  ip: string
  userAgent: string
  responseTime?: number
  statusCode?: number
  responseSize?: number
  error?: any
}

/**
 * مستويات التسجيل
 */
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn', 
  INFO = 'info',
  DEBUG = 'debug'
}

/**
 * إعدادات التسجيل
 */
export interface LoggingOptions {
  logLevel: LogLevel
  logBody: boolean
  logHeaders: boolean
  logQuery: boolean
  logUserInfo: boolean
  excludePaths: string[]
  excludeHeaders: string[]
  maxBodySize: number
  sensitiveFields: string[]
}

/**
 * إحصائيات التسجيل
 */
export interface LogStats {
  totalRequests: number
  errorCount: number
  averageResponseTime: number
  statusCodeDistribution: Record<number, number>
  topPaths: Array<{ path: string; count: number }>
  topIPs: Array<{ ip: string; count: number }>
}

/**
 * رسالة تسجيل موحدة
 */
export interface LogMessage {
  type: 'REQUEST' | 'RESPONSE' | 'ERROR' | 'AUDIT' | 'ADMIN_ACTION'
  requestId: string
  timestamp: string
  [key: string]: any
}

/**
 * تسجيل أخطاء
 */
export interface ErrorLogEntry extends LogEntry {
  error: {
    message: string
    stack?: string
    name: string
    code?: string | number
  }
}

/**
 * تسجيل العمليات الحساسة
 */
export interface AuditLogEntry extends LogEntry {
  operation: string
  changes?: any
}

/**
 * تسجيل عمليات المديرين
 */
export interface AdminLogEntry {
  type: 'ADMIN_ACTION'
  requestId: string
  timestamp: string
  admin: {
    id: string
    role: string
    email: string
  }
  action: {
    method: string
    url: string
    path: string
    body?: any
  }
  ip: string
  userAgent: string
}

// ======================================
// Configuration
// ======================================

/**
 * الإعدادات الافتراضية للتسجيل
 */
export const DEFAULT_LOGGING_OPTIONS: LoggingOptions = {
  logLevel: LogLevel.INFO,
  logBody: true,
  logHeaders: true,
  logQuery: true,
  logUserInfo: true,
  excludePaths: ['/health', '/metrics'],
  excludeHeaders: ['authorization', 'cookie', 'x-api-key'],
  maxBodySize: 10000, // 10KB
  sensitiveFields: ['password', 'token', 'secret', 'key', 'credit_card']
} 
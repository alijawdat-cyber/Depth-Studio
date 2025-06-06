/**
 * Error Types - Depth Studio Backend
 * Custom error classes and type definitions
 */

// ======================================
// Base Error Classes
// ======================================

/**
 * خطأ التطبيق الأساسي
 */
export class AppError extends Error {
  public statusCode: number
  public isOperational: boolean
  public errorCode: string
  
  constructor(message: string, statusCode: number = 500, errorCode: string = 'INTERNAL_ERROR') {
    super(message)
    this.statusCode = statusCode
    this.isOperational = true
    this.errorCode = errorCode
    
    Error.captureStackTrace(this, this.constructor)
  }
}

/**
 * أخطاء التحقق من صحة البيانات
 */
export class ValidationError extends AppError {
  public validationErrors: any[]
  
  constructor(message: string, validationErrors: any[] = []) {
    super(message, 400, 'VALIDATION_ERROR')
    this.validationErrors = validationErrors
  }
}

/**
 * أخطاء المصادقة
 */
export class AuthenticationError extends AppError {
  constructor(message: string = 'مطلوب تسجيل الدخول') {
    super(message, 401, 'AUTHENTICATION_ERROR')
  }
}

/**
 * أخطاء التفويض
 */
export class AuthorizationError extends AppError {
  constructor(message: string = 'ليس لديك صلاحية للوصول إلى هذا المورد') {
    super(message, 403, 'AUTHORIZATION_ERROR')
  }
}

/**
 * أخطاء عدم وجود المورد
 */
export class NotFoundError extends AppError {
  constructor(resource: string = 'المورد') {
    super(`${resource} غير موجود`, 404, 'NOT_FOUND_ERROR')
  }
}

/**
 * أخطاء التعارض
 */
export class ConflictError extends AppError {
  constructor(message: string = 'تعارض في البيانات') {
    super(message, 409, 'CONFLICT_ERROR')
  }
}

/**
 * أخطاء تجاوز الحد المسموح
 */
export class RateLimitError extends AppError {
  constructor(message: string = 'تم تجاوز الحد المسموح من الطلبات') {
    super(message, 429, 'RATE_LIMIT_ERROR')
  }
}

/**
 * أخطاء الخدمة غير متاحة
 */
export class ServiceUnavailableError extends AppError {
  constructor(message: string = 'الخدمة غير متاحة حالياً') {
    super(message, 503, 'SERVICE_UNAVAILABLE_ERROR')
  }
}

// ======================================
// Type Interfaces
// ======================================

/**
 * تفاصيل الخطأ للـ logging
 */
export interface ErrorLogDetails {
  type: string
  requestId: string
  timestamp: string
  error: {
    name: string
    message: string
    stack?: string
    code?: string | number
    statusCode?: number
  }
  request: {
    method: string
    url: string
    path: string
    headers: any
    body: any
    query: any
    params: any
  }
  user?: {
    id: string
    role: string
    email: string
  }
  ip: string
  userAgent?: string
}

/**
 * استجابة الخطأ القياسية
 */
export interface ErrorResponse {
  success: false
  error: string
  message: string
  details?: any
  validation_errors?: any[]
  timestamp: string
  requestId: string
} 
/**
 * Error Handlers - Depth Studio Backend
 * Specific error handling functions for different error types
 */

import { Request, Response } from 'express'
import type { AuthenticatedRequest } from '../auth'
import { 
  AppError, 
  ValidationError,
  ErrorLogDetails,
  ErrorResponse 
} from './types'
import { logError, getClientIP, sanitizeHeaders, sanitizeBody } from './utils'

// ======================================
// Main Error Handler
// ======================================

/**
 * معالج الأخطاء الرئيسي
 */
export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: Function
): void => {
  const requestId = res.get('X-Request-ID') || 'unknown'
  
  // تسجيل الخطأ
  logError(error, req, requestId)
  
  // معالجة أنواع الأخطاء المختلفة
  if (error instanceof AppError) {
    handleAppError(error, res, requestId)
  } else if (error.name === 'ValidationError') {
    handleValidationError(error, res, requestId)
  } else if (error.name === 'CastError') {
    handleCastError(error, res, requestId)
  } else if (error.code === 11000) {
    handleDuplicateFieldError(error, res, requestId)
  } else if (error.name === 'JsonWebTokenError') {
    handleJWTError(error, res, requestId)
  } else if (error.name === 'TokenExpiredError') {
    handleJWTExpiredError(error, res, requestId)
  } else if (error.code === 'auth/id-token-expired') {
    handleFirebaseTokenExpired(error, res, requestId)
  } else if (error.code && error.code.startsWith('auth/')) {
    handleFirebaseAuthError(error, res, requestId)
  } else {
    handleGenericError(error, res, requestId)
  }
}

// ======================================
// Specific Error Handlers
// ======================================

/**
 * معالجة أخطاء التطبيق المخصصة
 */
export function handleAppError(error: AppError, res: Response, requestId: string): void {
  const responseBody: ErrorResponse = {
    success: false,
    error: error.errorCode,
    message: error.message,
    timestamp: new Date().toISOString(),
    requestId
  }
  
  // إضافة تفاصيل إضافية للأخطاء المحددة
  if (error instanceof ValidationError) {
    responseBody.validation_errors = error.validationErrors
  }
  
  res.status(error.statusCode).json(responseBody)
}

/**
 * معالجة أخطاء التحقق من صحة البيانات
 */
export function handleValidationError(error: any, res: Response, requestId: string): void {
  const errors = Object.values(error.errors).map((err: any) => ({
    field: err.path,
    message: err.message,
    value: err.value
  }))
  
  res.status(400).json({
    success: false,
    error: 'VALIDATION_ERROR',
    message: 'البيانات المرسلة غير صحيحة',
    validation_errors: errors,
    timestamp: new Date().toISOString(),
    requestId
  })
}

/**
 * معالجة أخطاء تحويل البيانات
 */
export function handleCastError(error: any, res: Response, requestId: string): void {
  res.status(400).json({
    success: false,
    error: 'INVALID_DATA_FORMAT',
    message: `صيغة البيانات غير صحيحة للحقل: ${error.path}`,
    details: {
      field: error.path,
      value: error.value,
      expectedType: error.kind
    },
    timestamp: new Date().toISOString(),
    requestId
  })
}

/**
 * معالجة أخطاء الحقول المكررة
 */
export function handleDuplicateFieldError(error: any, res: Response, requestId: string): void {
  const field = Object.keys(error.keyValue)[0]
  const value = error.keyValue[field]
  
  res.status(409).json({
    success: false,
    error: 'DUPLICATE_FIELD',
    message: `القيمة '${value}' موجودة مسبقاً للحقل '${field}'`,
    details: {
      field,
      value
    },
    timestamp: new Date().toISOString(),
    requestId
  })
}

/**
 * معالجة أخطاء JWT
 */
export function handleJWTError(error: any, res: Response, requestId: string): void {
  res.status(401).json({
    success: false,
    error: 'INVALID_TOKEN',
    message: 'الرمز المميز غير صحيح',
    timestamp: new Date().toISOString(),
    requestId
  })
}

/**
 * معالجة انتهاء صلاحية JWT
 */
export function handleJWTExpiredError(error: any, res: Response, requestId: string): void {
  res.status(401).json({
    success: false,
    error: 'TOKEN_EXPIRED',
    message: 'انتهت صلاحية الرمز المميز',
    timestamp: new Date().toISOString(),
    requestId
  })
}

/**
 * معالجة انتهاء صلاحية رمز Firebase
 */
export function handleFirebaseTokenExpired(error: any, res: Response, requestId: string): void {
  res.status(401).json({
    success: false,
    error: 'FIREBASE_TOKEN_EXPIRED',
    message: 'انتهت صلاحية رمز Firebase',
    timestamp: new Date().toISOString(),
    requestId
  })
}

/**
 * معالجة أخطاء Firebase Auth
 */
export function handleFirebaseAuthError(error: any, res: Response, requestId: string): void {
  const firebaseErrors: { [key: string]: string } = {
    'auth/invalid-id-token': 'رمز التحقق غير صحيح',
    'auth/id-token-expired': 'انتهت صلاحية رمز التحقق',
    'auth/user-not-found': 'المستخدم غير موجود',
    'auth/user-disabled': 'المستخدم معطل',
    'auth/too-many-requests': 'كثرة الطلبات، حاول لاحقاً'
  }
  
  const message = firebaseErrors[error.code] || 'خطأ في المصادقة'
  
  res.status(401).json({
    success: false,
    error: 'FIREBASE_AUTH_ERROR',
    message,
    details: {
      code: error.code
    },
    timestamp: new Date().toISOString(),
    requestId
  })
}

/**
 * معالجة الأخطاء العامة
 */
export function handleGenericError(error: any, res: Response, requestId: string): void {
  // في الإنتاج، لا نريد كشف تفاصيل الأخطاء الداخلية
  const isDevelopment = process.env.NODE_ENV === 'development'
  
  res.status(500).json({
    success: false,
    error: 'INTERNAL_SERVER_ERROR',
    message: 'حدث خطأ داخلي في الخادم',
    ...(isDevelopment && {
      details: {
        message: error.message,
        stack: error.stack
      }
    }),
    timestamp: new Date().toISOString(),
    requestId
  })
} 
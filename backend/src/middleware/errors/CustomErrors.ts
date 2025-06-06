/**
 * 🚨 Custom Error Classes
 * 
 * تطوير علي جودت - Depth Studio
 * آخر تحديث: يونيو 2025
 * 
 * @description Enhanced custom error classes with proper typing and codes
 * @version 2.0.0
 */

// ======================================
// Enhanced Base Error Class
// ======================================

/**
 * Base Application Error - Enhanced version
 */
export abstract class BaseError extends Error {
  public readonly name: string;
  public readonly statusCode: number;
  public readonly errorCode: string;
  public readonly isOperational: boolean;
  public readonly context?: Record<string, any>;
  public readonly timestamp: string;
  public readonly severity: 'low' | 'medium' | 'high' | 'critical';

  constructor(
    message: string,
    statusCode: number,
    errorCode: string,
    isOperational: boolean = true,
    context?: Record<string, any>,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ) {
    super(message);
    
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = isOperational;
    this.context = context;
    this.timestamp = new Date().toISOString();
    this.severity = severity;

    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Convert error to JSON for logging
   */
  public toJSON(): Record<string, any> {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      errorCode: this.errorCode,
      isOperational: this.isOperational,
      context: this.context,
      timestamp: this.timestamp,
      severity: this.severity,
      stack: this.stack
    };
  }
}

// ======================================
// Validation Errors (400)
// ======================================

export class ValidationError extends BaseError {
  public readonly validationErrors: Array<{
    field: string;
    message: string;
    value?: any;
    code?: string;
  }>;

  constructor(
    message: string = 'البيانات المرسلة غير صحيحة',
    validationErrors: Array<{ field: string; message: string; value?: any; code?: string }> = [],
    context?: Record<string, any>
  ) {
    super(message, 400, 'VALIDATION_ERROR', true, context, 'low');
    this.validationErrors = validationErrors;
  }
}

export class InvalidInputError extends BaseError {
  constructor(
    field: string,
    value: any,
    expectedFormat: string,
    context?: Record<string, any>
  ) {
    super(
      `القيمة '${value}' غير صحيحة للحقل '${field}'. المطلوب: ${expectedFormat}`,
      400,
      'INVALID_INPUT',
      true,
      { field, value, expectedFormat, ...context },
      'low'
    );
  }
}

export class MissingFieldError extends BaseError {
  constructor(
    fields: string | string[],
    context?: Record<string, any>
  ) {
    const fieldList = Array.isArray(fields) ? fields.join(', ') : fields;
    super(
      `الحقول التالية مطلوبة: ${fieldList}`,
      400,
      'MISSING_REQUIRED_FIELDS',
      true,
      { missingFields: fields, ...context },
      'low'
    );
  }
}

// ======================================
// Authentication Errors (401)
// ======================================

export class AuthenticationError extends BaseError {
  constructor(
    message: string = 'مطلوب تسجيل الدخول',
    context?: Record<string, any>
  ) {
    super(message, 401, 'AUTHENTICATION_REQUIRED', true, context, 'medium');
  }
}

export class InvalidTokenError extends BaseError {
  constructor(
    tokenType: string = 'access_token',
    context?: Record<string, any>
  ) {
    super(
      `رمز ${tokenType} غير صحيح`,
      401,
      'INVALID_TOKEN',
      true,
      { tokenType, ...context },
      'medium'
    );
  }
}

export class TokenExpiredError extends BaseError {
  constructor(
    tokenType: string = 'access_token',
    expiryTime?: string,
    context?: Record<string, any>
  ) {
    super(
      `انتهت صلاحية رمز ${tokenType}`,
      401,
      'TOKEN_EXPIRED',
      true,
      { tokenType, expiryTime, ...context },
      'medium'
    );
  }
}

export class InvalidCredentialsError extends BaseError {
  constructor(
    context?: Record<string, any>
  ) {
    super(
      'بيانات الدخول غير صحيحة',
      401,
      'INVALID_CREDENTIALS',
      true,
      context,
      'medium'
    );
  }
}

// ======================================
// Authorization Errors (403)
// ======================================

export class AuthorizationError extends BaseError {
  constructor(
    resource: string = 'هذا المورد',
    action: string = 'الوصول إلى',
    context?: Record<string, any>
  ) {
    super(
      `ليس لديك صلاحية ${action} ${resource}`,
      403,
      'INSUFFICIENT_PERMISSIONS',
      true,
      { resource, action, ...context },
      'medium'
    );
  }
}

export class RoleRequiredError extends BaseError {
  constructor(
    requiredRole: string | string[],
    currentRole?: string,
    context?: Record<string, any>
  ) {
    const roleList = Array.isArray(requiredRole) ? requiredRole.join(' أو ') : requiredRole;
    super(
      `يتطلب صلاحية ${roleList} للوصول إلى هذا المورد`,
      403,
      'ROLE_REQUIRED',
      true,
      { requiredRole, currentRole, ...context },
      'medium'
    );
  }
}

export class AccountSuspendedError extends BaseError {
  constructor(
    reason?: string,
    suspensionDate?: string,
    context?: Record<string, any>
  ) {
    super(
      `حسابك معلق${reason ? ': ' + reason : ''}`,
      403,
      'ACCOUNT_SUSPENDED',
      true,
      { reason, suspensionDate, ...context },
      'high'
    );
  }
}

// ======================================
// Not Found Errors (404)
// ======================================

export class NotFoundError extends BaseError {
  constructor(
    resource: string = 'المورد',
    identifier?: string,
    context?: Record<string, any>
  ) {
    super(
      `${resource}${identifier ? ` (${identifier})` : ''} غير موجود`,
      404,
      'RESOURCE_NOT_FOUND',
      true,
      { resource, identifier, ...context },
      'low'
    );
  }
}

export class UserNotFoundError extends BaseError {
  constructor(
    identifier: string,
    context?: Record<string, any>
  ) {
    super(
      `المستخدم ${identifier} غير موجود`,
      404,
      'USER_NOT_FOUND',
      true,
      { identifier, ...context },
      'low'
    );
  }
}

export class BrandNotFoundError extends BaseError {
  constructor(
    identifier: string,
    context?: Record<string, any>
  ) {
    super(
      `البراند ${identifier} غير موجود`,
      404,
      'BRAND_NOT_FOUND',
      true,
      { identifier, ...context },
      'low'
    );
  }
}

export class CampaignNotFoundError extends BaseError {
  constructor(
    identifier: string,
    context?: Record<string, any>
  ) {
    super(
      `الحملة ${identifier} غير موجودة`,
      404,
      'CAMPAIGN_NOT_FOUND',
      true,
      { identifier, ...context },
      'low'
    );
  }
}

// ======================================
// Conflict Errors (409)
// ======================================

export class ConflictError extends BaseError {
  constructor(
    message: string = 'تعارض في البيانات',
    context?: Record<string, any>
  ) {
    super(message, 409, 'DATA_CONFLICT', true, context, 'medium');
  }
}

export class DuplicateResourceError extends BaseError {
  constructor(
    resource: string,
    field: string,
    value: any,
    context?: Record<string, any>
  ) {
    super(
      `${resource} مع ${field} '${value}' موجود مسبقاً`,
      409,
      'DUPLICATE_RESOURCE',
      true,
      { resource, field, value, ...context },
      'low'
    );
  }
}

export class StateConflictError extends BaseError {
  constructor(
    resource: string,
    currentState: string,
    requiredState: string,
    context?: Record<string, any>
  ) {
    super(
      `${resource} في حالة '${currentState}' ولا يمكن تنفيذ العملية. مطلوب حالة '${requiredState}'`,
      409,
      'STATE_CONFLICT',
      true,
      { resource, currentState, requiredState, ...context },
      'medium'
    );
  }
}

// ======================================
// Rate Limiting Errors (429)
// ======================================

export class RateLimitError extends BaseError {
  constructor(
    limit: number,
    windowMs: number,
    retryAfter?: number,
    context?: Record<string, any>
  ) {
    super(
      `تم تجاوز الحد المسموح: ${limit} طلبات خلال ${windowMs}ms`,
      429,
      'RATE_LIMIT_EXCEEDED',
      true,
      { limit, windowMs, retryAfter, ...context },
      'medium'
    );
  }
}

// ======================================
// Server Errors (500+)
// ======================================

export class InternalServerError extends BaseError {
  constructor(
    message: string = 'خطأ داخلي في الخادم',
    context?: Record<string, any>,
    originalError?: Error
  ) {
    super(
      message,
      500,
      'INTERNAL_SERVER_ERROR',
      false,
      { originalError: originalError?.message, ...context },
      'critical'
    );
  }
}

export class DatabaseError extends BaseError {
  constructor(
    operation: string,
    collection?: string,
    originalError?: Error,
    context?: Record<string, any>
  ) {
    super(
      `خطأ في قاعدة البيانات أثناء ${operation}${collection ? ` في ${collection}` : ''}`,
      500,
      'DATABASE_ERROR',
      false,
      { operation, collection, originalError: originalError?.message, ...context },
      'high'
    );
  }
}

export class ExternalServiceError extends BaseError {
  constructor(
    serviceName: string,
    operation: string,
    statusCode?: number,
    context?: Record<string, any>
  ) {
    super(
      `خطأ في خدمة ${serviceName} أثناء ${operation}`,
      502,
      'EXTERNAL_SERVICE_ERROR',
      true,
      { serviceName, operation, externalStatusCode: statusCode, ...context },
      'high'
    );
  }
}

export class ServiceUnavailableError extends BaseError {
  constructor(
    serviceName?: string,
    estimatedRecoveryTime?: string,
    context?: Record<string, any>
  ) {
    super(
      `${serviceName || 'الخدمة'} غير متاحة حالياً${estimatedRecoveryTime ? `. وقت الاستعادة المتوقع: ${estimatedRecoveryTime}` : ''}`,
      503,
      'SERVICE_UNAVAILABLE',
      true,
      { serviceName, estimatedRecoveryTime, ...context },
      'high'
    );
  }
}

// ======================================
// Business Logic Errors
// ======================================

export class BusinessRuleViolationError extends BaseError {
  constructor(
    rule: string,
    context?: Record<string, any>
  ) {
    super(
      `انتهاك قاعدة العمل: ${rule}`,
      422,
      'BUSINESS_RULE_VIOLATION',
      true,
      { rule, ...context },
      'medium'
    );
  }
}

export class InsufficientResourcesError extends BaseError {
  constructor(
    resource: string,
    required: number,
    available: number,
    context?: Record<string, any>
  ) {
    super(
      `${resource} غير كافي. مطلوب: ${required}، متاح: ${available}`,
      422,
      'INSUFFICIENT_RESOURCES',
      true,
      { resource, required, available, ...context },
      'medium'
    );
  }
}

// ======================================
// Error Factory Functions
// ======================================

/**
 * Create error from HTTP status code
 */
export const createErrorFromStatus = (
  statusCode: number,
  message?: string,
  context?: Record<string, any>
): BaseError => {
  switch (statusCode) {
    case 400:
      return new ValidationError(message, [], context);
    case 401:
      return new AuthenticationError(message, context);
    case 403:
      return new AuthorizationError('المورد', 'الوصول إلى', context);
    case 404:
      return new NotFoundError('المورد', undefined, context);
    case 409:
      return new ConflictError(message, context);
    case 429:
      return new RateLimitError(100, 60000, undefined, context);
    case 500:
      return new InternalServerError(message, context);
    case 502:
      return new ExternalServiceError('خدمة خارجية', 'عملية', statusCode, context);
    case 503:
      return new ServiceUnavailableError(undefined, undefined, context);
    default:
      return new InternalServerError(message || 'خطأ غير معروف', context);
  }
};

/**
 * Check if error is operational (expected/handled)
 */
export const isOperationalError = (error: any): boolean => {
  return error instanceof BaseError && error.isOperational;
};

/**
 * Get error severity level
 */
export const getErrorSeverity = (error: any): string => {
  if (error instanceof BaseError) {
    return error.severity;
  }
  return 'critical'; // Unknown errors are critical
}; 
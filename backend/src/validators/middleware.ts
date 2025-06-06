/**
 * 🔒 Validation Middleware
 * 
 * تطوير علي جودت - Depth Studio
 * آخر تحديث: يونيو 2025
 * 
 * @description Middleware للتحقق من صحة البيانات باستخدام Zod schemas
 * @version 1.0.0
 */

import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from '../middleware/errors/CustomErrors';
import { logger } from '../utils/logger';

/**
 * Validation Target Types
 */
export type ValidationTarget = 'body' | 'query' | 'params';

/**
 * Validation Options
 */
export interface ValidationOptions {
  stripUnknown?: boolean;
  allowEmpty?: boolean;
  transform?: boolean;
}

/**
 * Validation Result Interface
 */
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: Array<{
    path: string[];
    message: string;
    code: string;
    received: unknown;
  }>;
}

/**
 * Generic Validation Function
 */
export function validateData<T>(
  schema: ZodSchema<T>,
  data: unknown,
  options: ValidationOptions = {}
): ValidationResult<T> {
  try {
    const result = schema.parse(data);
    
    return {
      success: true,
      data: result
    };
  } catch (error) {
    if (error instanceof ZodError) {
      const validationErrors = error.errors.map(err => ({
        path: err.path.map(p => p.toString()),
        message: err.message,
        code: err.code,
        received: 'received' in err ? err.received : undefined
      }));

      return {
        success: false,
        errors: validationErrors
      };
    }

    // Unexpected error
    logger.error('Unexpected validation error', error);
    return {
      success: false,
      errors: [{
        path: [],
        message: 'خطأ غير متوقع في التحقق من صحة البيانات',
        code: 'internal_error',
        received: data
      }]
    };
  }
}

/**
 * Create Validation Middleware
 */
export function validateRequest<T>(
  schema: ZodSchema<T>,
  target: ValidationTarget = 'body',
  options: ValidationOptions = {}
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Get data from the specified target
      let data: unknown;
      switch (target) {
        case 'body':
          data = req.body;
          break;
        case 'query':
          data = req.query;
          break;
        case 'params':
          data = req.params;
          break;
        default:
          data = req.body;
      }

      // Validate data
      const validation = validateData(schema, data, options);

      if (!validation.success) {
        const validationErrors = validation.errors?.map(err => ({
          field: err.path.join('.') || target,
          message: err.message,
          value: err.received,
          code: err.code
        })) || [];

        const error = new ValidationError(
          `خطأ في التحقق من صحة البيانات في ${target}`,
          validationErrors,
          {
            target,
            originalData: data,
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] as string || 'unknown'
          }
        );

        logger.warn('Validation failed', {
          target,
          errors: validationErrors,
          requestId: req.headers['x-request-id'],
          endpoint: req.path,
          method: req.method
        });

        return next(error);
      }

      // Attach validated data to request
      switch (target) {
        case 'body':
          req.body = validation.data;
          break;
        case 'query':
          req.query = validation.data as any;
          break;
        case 'params':
          req.params = validation.data as any;
          break;
      }

      // Add validation metadata
      if (!req.validationResults) {
        req.validationResults = {};
      }
      req.validationResults[target] = {
        success: true,
        schema: schema.constructor.name,
        timestamp: new Date().toISOString()
      };

      next();
    } catch (error) {
      logger.error('Validation middleware error', error);
      next(new ValidationError(
        'خطأ في معالج التحقق من صحة البيانات',
        [],
        { target, error: error instanceof Error ? error.message : 'Unknown error' }
      ));
    }
  };
}

/**
 * Validate Body Middleware
 */
export const validateBody = <T>(schema: ZodSchema<T>, options?: ValidationOptions) =>
  validateRequest(schema, 'body', options);

/**
 * Validate Query Middleware
 */
export const validateQuery = <T>(schema: ZodSchema<T>, options?: ValidationOptions) =>
  validateRequest(schema, 'query', options);

/**
 * Validate Params Middleware
 */
export const validateParams = <T>(schema: ZodSchema<T>, options?: ValidationOptions) =>
  validateRequest(schema, 'params', options);

/**
 * Multiple Validation Middleware
 */
export function validateMultiple(validations: {
  body?: ZodSchema<any>;
  query?: ZodSchema<any>;
  params?: ZodSchema<any>;
}, options: ValidationOptions = {}) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: Array<{
      target: ValidationTarget;
      field: string;
      message: string;
      value: unknown;
      code: string;
    }> = [];

    // Validate each target
    for (const [target, schema] of Object.entries(validations)) {
      if (!schema) continue;

      const targetData = target === 'body' ? req.body : 
                        target === 'query' ? req.query : req.params;

      const validation = validateData(schema, targetData, options);
      
      if (!validation.success) {
        const targetErrors = validation.errors?.map(err => ({
          target: target as ValidationTarget,
          field: err.path.join('.') || target,
          message: err.message,
          value: err.received,
          code: err.code
        })) || [];
        
        errors.push(...targetErrors);
      } else {
        // Update request with validated data
        switch (target) {
          case 'body':
            req.body = validation.data;
            break;
          case 'query':
            req.query = validation.data as any;
            break;
          case 'params':
            req.params = validation.data as any;
            break;
        }
      }
    }

    if (errors.length > 0) {
      const error = new ValidationError(
        'خطأ في التحقق من صحة البيانات',
        errors,
        {
          targets: Object.keys(validations),
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string || 'unknown'
        }
      );

      logger.warn('Multiple validation failed', {
        errors,
        requestId: req.headers['x-request-id'],
        endpoint: req.path,
        method: req.method
      });

      return next(error);
    }

    next();
  };
}

/**
 * Optional Validation (for PATCH requests)
 */
export function validateOptional<T>(
  schema: ZodSchema<T>,
  target: ValidationTarget = 'body',
  options: ValidationOptions = {}
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const data = target === 'body' ? req.body : 
                 target === 'query' ? req.query : req.params;

    // Skip validation if data is empty (for optional updates)
    if (!data || (typeof data === 'object' && Object.keys(data).length === 0)) {
      return next();
    }

    // Use regular schema for optional validation
    return validateRequest(schema, target, options)(req, res, next);
  };
}

/**
 * Custom Validation Function Type
 */
export type CustomValidator<T = any> = (
  value: T,
  req: Request
) => Promise<boolean> | boolean;

/**
 * Custom Validation Middleware
 */
export function customValidation<T>(
  validator: CustomValidator<T>,
  errorMessage: string = 'فشل التحقق المخصص',
  target: ValidationTarget = 'body'
) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = target === 'body' ? req.body : 
                   target === 'query' ? req.query : req.params;

      const isValid = await validator(data, req);
      
      if (!isValid) {
        const error = new ValidationError(
          errorMessage,
          [{
            field: target,
            message: errorMessage,
            value: data,
            code: 'custom_validation_failed'
          }],
          {
            target,
            customValidator: validator.name || 'anonymous',
            timestamp: new Date().toISOString()
          }
        );

        return next(error);
      }

      next();
    } catch (error) {
      logger.error('Custom validation error', error);
      next(new ValidationError(
        'خطأ في التحقق المخصص',
        [],
        { target, error: error instanceof Error ? error.message : 'Unknown error' }
      ));
    }
  };
}

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      validationResults?: {
        [key in ValidationTarget]?: {
          success: boolean;
          schema: string;
          timestamp: string;
        };
      };
    }
  }
} 
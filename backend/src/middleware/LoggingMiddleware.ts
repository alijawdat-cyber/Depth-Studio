/**
 * 📝 Logging Middleware - Depth Studio
 * =====================================
 * 
 * 📅 محدث: ديسمبر 2024
 * 👨‍💻 المطور: علي جودت
 * 🎯 الهدف: نظام تسجيل شامل مع مراقبة الأداء والأخطاء
 * 
 * 🔍 المسؤوليات:
 * - Request/Response Logging
 * - Error Logging
 * - Performance Monitoring
 * - Security Event Logging
 * - Analytics Data Collection
 */

import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../../../types/src/core/enums';
import { ID } from '../../../types/src/core/base';
import { AuthenticatedUser } from './AuthenticationMiddleware';
import { logger } from 'firebase-functions';

/**
 * 📊 مستويات التسجيل
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical';

/**
 * 🎯 أنواع الأحداث
 */
export type LogEventType = 
  | 'request' | 'response' | 'error' | 'security' 
  | 'performance' | 'authentication' | 'authorization'
  | 'database' | 'file_operation' | 'payment' | 'notification';

/**
 * 📋 معلومات الطلب المفصلة
 */
interface RequestInfo {
  method: string;
  url: string;
  path: string;
  query: Record<string, unknown>;
  headers: Record<string, string | string[] | undefined>;
  ip: string;
  userAgent: string;
  referer?: string | undefined;
  timestamp: string;
  requestId: string;
}

/**
 * 📤 معلومات الاستجابة المفصلة
 */
interface ResponseInfo {
  statusCode: number;
  statusMessage: string;
  headers: Record<string, string | string[] | number | undefined>;
  contentLength?: number | undefined;
  responseTime: number;
  timestamp: string;
}

/**
 * 👤 معلومات المستخدم للتسجيل
 */
interface UserLogInfo {
  userId: ID;
  role: UserRole;
  email: string;
  isVerified: boolean;
  sessionId?: string;
}

/**
 * 🔒 حدث أمني
 */
interface SecurityEvent {
  type: 'login_attempt' | 'access_denied' | 'suspicious_activity' | 'rate_limit_exceeded';
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: Record<string, unknown>;
  ip: string;
  userId?: ID | undefined;
  timestamp: string;
}

/**
 * ⚡ معلومات الأداء
 */
interface PerformanceMetrics {
  requestTime: number;
  responseTime: number;
  memoryUsage: NodeJS.MemoryUsage;
  cpuUsage?: NodeJS.CpuUsage;
  databaseQueries?: number;
  cacheHits?: number;
  cacheMisses?: number;
}

/**
 * ⚙️ إعدادات التسجيل
 */
export interface LoggingConfig {
  enableRequestLogging: boolean;
  enableResponseLogging: boolean;
  enableErrorLogging: boolean;
  enablePerformanceMonitoring: boolean;
  enableSecurityLogging: boolean;
  logLevel: LogLevel;
  excludePaths: string[];
  includeHeaders: boolean;
  includeBody: boolean;
  maxBodySize: number;
  sensitiveFields: string[];
}

/**
 * 📝 Logging Middleware Class
 */
export class LoggingMiddleware {
  private config: LoggingConfig;
  private performanceMetrics: Map<string, PerformanceMetrics>;
  private requestIdCounter: number;

  constructor(config: Partial<LoggingConfig> = {}) {
    this.config = {
      enableRequestLogging: true,
      enableResponseLogging: true,
      enableErrorLogging: true,
      enablePerformanceMonitoring: true,
      enableSecurityLogging: true,
      logLevel: 'info',
      excludePaths: ['/health', '/metrics', '/favicon.ico'],
      includeHeaders: true,
      includeBody: false,
      maxBodySize: 1024 * 10, // 10KB
      sensitiveFields: ['password', 'token', 'authorization', 'cookie'],
      ...config
    };
    
    this.performanceMetrics = new Map();
    this.requestIdCounter = 0;
    
    logger.info('📝 LoggingMiddleware initialized', { config: this.config });
  }

  // ======================================
  // 🆔 Request ID Generation
  // ======================================

  /**
   * إنشاء معرف فريد للطلب
   */
  private generateRequestId(): string {
    const timestamp = Date.now();
    const counter = ++this.requestIdCounter;
    return `req_${timestamp}_${counter}`;
  }

  // ======================================
  // 🔍 Data Extraction & Sanitization
  // ======================================

  /**
   * استخراج معلومات الطلب
   */
  private extractRequestInfo(req: Request): RequestInfo {
    const requestId = this.generateRequestId();
    
    // إضافة requestId للـ request للاستخدام لاحقاً
    (req as any).requestId = requestId;

    return {
      method: req.method,
      url: req.url,
      path: req.path,
      query: this.sanitizeData(req.query),
      headers: this.config.includeHeaders ? this.sanitizeHeaders(req.headers) : {},
      ip: this.getClientIP(req),
      userAgent: req.get('User-Agent') || 'unknown',
      referer: req.get('Referer'),
      timestamp: new Date().toISOString(),
      requestId
    };
  }

  /**
   * استخراج معلومات الاستجابة
   */
  private extractResponseInfo(res: Response, startTime: number): ResponseInfo {
    const responseTime = Date.now() - startTime;

    return {
      statusCode: res.statusCode,
      statusMessage: res.statusMessage || '',
      headers: this.config.includeHeaders ? this.sanitizeHeaders(res.getHeaders()) : {},
      contentLength: res.get('Content-Length') ? parseInt(res.get('Content-Length')!) : undefined,
      responseTime,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * استخراج معلومات المستخدم للتسجيل
   */
  private extractUserInfo(user: AuthenticatedUser): UserLogInfo {
    return {
      userId: user.user.id,
      role: user.role,
      email: user.email,
      isVerified: user.isVerified,
      sessionId: user.uid
    };
  }

  /**
   * الحصول على IP العميل
   */
  private getClientIP(req: Request): string {
    const forwardedFor = req.headers['x-forwarded-for'];
    const realIp = req.headers['x-real-ip'];
    const connectionIp = req.connection?.remoteAddress;
    const socketIp = req.socket?.remoteAddress;
    
    let ip = 'unknown';
    
    if (typeof forwardedFor === 'string') {
      ip = forwardedFor;
    } else if (Array.isArray(forwardedFor) && forwardedFor.length > 0 && typeof forwardedFor[0] === 'string') {
      ip = forwardedFor[0];
    } else if (typeof realIp === 'string') {
      ip = realIp;
    } else if (Array.isArray(realIp) && realIp.length > 0 && typeof realIp[0] === 'string') {
      ip = realIp[0];
    } else if (typeof connectionIp === 'string') {
      ip = connectionIp;
    } else if (typeof socketIp === 'string') {
      ip = socketIp;
    }
    
    if (ip === 'unknown') {
      return 'unknown';
    }
    
         const ipParts = ip.split(',');
     return ipParts.length > 0 && ipParts[0] ? ipParts[0].trim() : 'unknown';
  }

  // ======================================
  // 🛡️ Data Sanitization
  // ======================================

  /**
   * تنظيف البيانات الحساسة
   */
  private sanitizeData(data: any): any {
    if (!data || typeof data !== 'object') {
      return data;
    }

    const sanitized = Array.isArray(data) ? [] : {};
    
    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();
      
      if (this.config.sensitiveFields.some(field => lowerKey.includes(field))) {
        (sanitized as any)[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        (sanitized as any)[key] = this.sanitizeData(value);
      } else {
        (sanitized as any)[key] = value;
      }
    }
    
    return sanitized;
  }

  /**
   * تنظيف headers
   */
  private sanitizeHeaders(headers: Record<string, any>): Record<string, string | string[] | undefined> {
    const sanitized: Record<string, string | string[] | undefined> = {};
    
    for (const [key, value] of Object.entries(headers)) {
      const lowerKey = key.toLowerCase();
      
      if (this.config.sensitiveFields.some(field => lowerKey.includes(field))) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  }

  // ======================================
  // ⚡ Performance Monitoring
  // ======================================

  /**
   * بدء مراقبة الأداء
   */
  private startPerformanceMonitoring(requestId: string): void {
    if (!this.config.enablePerformanceMonitoring) return;

    const startTime = process.hrtime.bigint();
    const memoryUsage = process.memoryUsage();
    
    this.performanceMetrics.set(requestId, {
      requestTime: Number(startTime),
      responseTime: 0,
      memoryUsage,
      databaseQueries: 0,
      cacheHits: 0,
      cacheMisses: 0
    });
  }

  /**
   * إنهاء مراقبة الأداء
   */
  private endPerformanceMonitoring(requestId: string): PerformanceMetrics | null {
    if (!this.config.enablePerformanceMonitoring) return null;

    const metrics = this.performanceMetrics.get(requestId);
    if (!metrics) return null;

    const endTime = process.hrtime.bigint();
    metrics.responseTime = Number(endTime - BigInt(metrics.requestTime)) / 1_000_000; // Convert to milliseconds

    this.performanceMetrics.delete(requestId);
    return metrics;
  }

  // ======================================
  // 🔒 Security Logging
  // ======================================

  /**
   * تسجيل حدث أمني
   */
  logSecurityEvent(event: SecurityEvent): void {
    if (!this.config.enableSecurityLogging) return;

    const logEntry = {
      category: 'SECURITY',
      event_type: event.type,
      severity: event.severity,
      details: event.details,
      ip: event.ip,
      user_id: event.userId,
      timestamp: event.timestamp
    };

    switch (event.severity) {
      case 'critical':
        logger.error('🚨 CRITICAL SECURITY EVENT', logEntry);
        break;
      case 'high':
        logger.warn('⚠️ HIGH SECURITY EVENT', logEntry);
        break;
      case 'medium':
        logger.warn('🔸 MEDIUM SECURITY EVENT', logEntry);
        break;
      case 'low':
        logger.info('ℹ️ LOW SECURITY EVENT', logEntry);
        break;
    }
  }

  // ======================================
  // 🌐 Main Middleware Functions
  // ======================================

  /**
   * Middleware رئيسي للتسجيل
   */
  requestLogger(): (req: Request, res: Response, next: NextFunction) => void {
    return (req: Request, res: Response, next: NextFunction): void => {
      const startTime = Date.now();
      
      try {
        // التحقق من المسارات المستثناة
        if (this.shouldSkipLogging(req.path)) {
          return next();
        }

        // استخراج معلومات الطلب
        const requestInfo = this.extractRequestInfo(req);
        const requestId = requestInfo.requestId;

        // بدء مراقبة الأداء
        this.startPerformanceMonitoring(requestId);

        // تسجيل الطلب
        if (this.config.enableRequestLogging) {
          const logData: any = {
            category: 'REQUEST',
            request_id: requestId,
            ...requestInfo
          };

          // إضافة معلومات المستخدم إذا كان مصادقاً
          if (req.user) {
            logData.user = this.extractUserInfo(req.user);
          }

          logger.info('📥 Incoming Request', logData);
        }

        // مراقبة الاستجابة
        const originalSend = res.send;
        const self = this;
        res.send = function(body: any) {
          // تسجيل الاستجابة
          if (self.config.enableResponseLogging) {
            const responseInfo = self.extractResponseInfo(res, startTime);
            const performanceMetrics = self.endPerformanceMonitoring(requestId);

            const logData: any = {
              category: 'RESPONSE',
              request_id: requestId,
              ...responseInfo
            };

            if (performanceMetrics) {
              logData.performance = performanceMetrics;
            }

            // إضافة body إذا كان مسموحاً
            if (self.config.includeBody && body) {
              const bodyStr = typeof body === 'string' ? body : JSON.stringify(body);
              if (bodyStr.length <= self.config.maxBodySize) {
                logData.response_body = self.sanitizeData(body);
              }
            }

            logger.info('📤 Outgoing Response', logData);
          }

          return originalSend.call(res, body);
        };

        next();
      } catch (error) {
        logger.error('💥 Logging middleware error', {
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          path: req.path,
          method: req.method
        });
        
        next();
      }
    };
  }

  /**
   * Middleware تسجيل الأخطاء
   */
  errorLogger(): (error: Error, req: Request, res: Response, next: NextFunction) => void {
    return (error: Error, req: Request, res: Response, next: NextFunction): void => {
      if (!this.config.enableErrorLogging) {
        return next(error);
      }

      const requestId = (req as any).requestId || 'unknown';
      
      const errorLog = {
        category: 'ERROR',
        request_id: requestId,
        error_name: error.name,
        error_message: error.message,
        error_stack: error.stack,
        request_method: req.method,
        request_path: req.path,
        request_ip: this.getClientIP(req),
        user_id: req.user?.user.id,
        timestamp: new Date().toISOString()
      };

      logger.error('❌ Request Error', errorLog);

      // تسجيل كحدث أمني إذا كان خطأ مهم
      if (this.isSecurityRelevantError(error)) {
        this.logSecurityEvent({
          type: 'suspicious_activity',
          severity: 'medium',
          details: { error: error.message, path: req.path },
          ip: this.getClientIP(req),
          userId: req.user?.user.id,
          timestamp: new Date().toISOString()
        });
      }

      next(error);
    };
  }

  // ======================================
  // 🔧 Helper Methods
  // ======================================

  /**
   * التحقق من ضرورة تخطي التسجيل
   */
  private shouldSkipLogging(path: string): boolean {
    return this.config.excludePaths.some(excludePath => {
      if (excludePath.includes('*')) {
        const pattern = excludePath.replace('*', '.*');
        return new RegExp(`^${pattern}$`).test(path);
      }
      return path === excludePath || path.startsWith(excludePath);
    });
  }

  /**
   * التحقق من كون الخطأ مرتبط بالأمان
   */
  private isSecurityRelevantError(error: Error): boolean {
    const securityKeywords = [
      'unauthorized', 'forbidden', 'authentication', 'authorization',
      'token', 'permission', 'access', 'security'
    ];
    
    const errorMessage = error.message.toLowerCase();
    return securityKeywords.some(keyword => errorMessage.includes(keyword));
  }

  // ======================================
  // 📊 Analytics & Statistics
  // ======================================

  /**
   * إحصائيات التسجيل
   */
  getLoggingStats(): {
    activePerformanceMonitors: number;
    config: LoggingConfig;
  } {
    return {
      activePerformanceMonitors: this.performanceMetrics.size,
      config: { ...this.config }
    };
  }

  /**
   * تنظيف metrics القديمة
   */
  cleanupOldMetrics(): void {
    // تنظيف metrics أقدم من 10 دقائق
    const tenMinutesAgo = Date.now() - (10 * 60 * 1000);
    
    for (const [requestId, metrics] of this.performanceMetrics.entries()) {
      if (metrics.requestTime < tenMinutesAgo) {
        this.performanceMetrics.delete(requestId);
      }
    }
  }

  // ======================================
  // 🎯 Specialized Loggers
  // ======================================

  /**
   * تسجيل عمليات قاعدة البيانات
   */
  logDatabaseOperation(operation: string, collection: string, duration: number, userId?: ID): void {
    logger.info('🗄️ Database Operation', {
      category: 'DATABASE',
      operation,
      collection,
      duration_ms: duration,
      user_id: userId,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * تسجيل عمليات رفع الملفات
   */
  logFileOperation(operation: string, filename: string, size: number, userId?: ID): void {
    logger.info('📁 File Operation', {
      category: 'FILE',
      operation,
      filename,
      file_size: size,
      user_id: userId,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * تسجيل العمليات المالية
   */
  logPaymentOperation(operation: string, amount: number, userId: ID): void {
    logger.info('💳 Payment Operation', {
      category: 'PAYMENT',
      operation,
      amount,
      user_id: userId,
      timestamp: new Date().toISOString()
    });
  }
}

// ======================================
// 🏭 Factory & Export
// ======================================

/**
 * إنشاء instance افتراضي
 */
export const loggingMiddleware = new LoggingMiddleware({
  enableRequestLogging: true,
  enableResponseLogging: true,
  enableErrorLogging: true,
  enablePerformanceMonitoring: true,
  logLevel: 'info'
});

/**
 * Quick access methods للاستخدام المباشر
 */
export const requestLogger = loggingMiddleware.requestLogger();
export const errorLogger = loggingMiddleware.errorLogger(); 
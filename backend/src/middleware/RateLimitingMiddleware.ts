/**
 * 🚫 Rate Limiting Middleware - Depth Studio
 * ==========================================
 * 
 * 📅 محدث: ديسمبر 2024
 * 👨‍💻 المطور: علي جودت
 * 🎯 الهدف: نظام حماية شامل من هجمات الـ DDoS والاستخدام المفرط
 * 
 * 🔍 المسؤوليات:
 * - API Rate Limiting
 * - User-based Limits
 * - IP-based Limits
 * - Dynamic Rate Adjustment
 * - Attack Detection & Prevention
 */

import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../../../types/src/core/enums';
import { ID } from '../../../types/src/core/base';
import { AuthenticatedUser } from './AuthenticationMiddleware';
import { logger } from 'firebase-functions';

/**
 * 📊 أنواع النشاط المختلفة
 */
export type ActivityType = 
  | 'api_request' | 'login_attempt' | 'file_upload'
  | 'content_submission' | 'payment_request' | 'search_query'
  | 'notification_send' | 'report_generation';

/**
 * ⚙️ إعدادات Rate Limiting
 */
export interface RateLimitConfig {
  windowMs: number;           // مدة النافذة الزمنية (بالمللي ثانية)
  maxRequests: number;        // عدد الطلبات المسموح
  skipSuccessfulRequests?: boolean;  // تخطي الطلبات الناجحة
  skipFailedRequests?: boolean;      // تخطي الطلبات الفاشلة
  message?: string;           // رسالة خطأ مخصصة
  keyGenerator?: (req: Request) => string;  // مولد المفتاح
}

/**
 * 👤 إعدادات حسب الدور
 * 🎯 فائدة UserRole: ضمان type safety للأدوار المدعومة
 */
export type RoleBasedLimits = {
  [K in UserRole | 'anonymous']: RateLimitConfig;
};

/**
 * 📈 إحصائيات الاستخدام
 */
interface UsageStats {
  requests: number;
  resetTime: number;
  firstRequest: number;
  lastRequest: number;
  blockedRequests: number;
}

/**
 * 🚨 معلومات الأنشطة المشبوهة
 */
interface SuspiciousActivity {
  ip: string;
  userId?: ID;
  activityType: ActivityType;
  requestCount: number;
  timeWindow: number;
  detectedAt: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * 🚫 Rate Limiting Middleware Class
 */
export class RateLimitingMiddleware {
  private usageStore: Map<string, UsageStats>;
  private suspiciousActivities: SuspiciousActivity[];
  private blacklistedIPs: Set<string>;
  private whitelistedIPs: Set<string>;
  private roleBasedLimits: RoleBasedLimits;

  constructor() {
    this.usageStore = new Map();
    this.suspiciousActivities = [];
    this.blacklistedIPs = new Set();
    this.whitelistedIPs = new Set(['127.0.0.1', '::1']); // localhost
    this.roleBasedLimits = this.initializeRoleBasedLimits();
    
    // تنظيف البيانات كل 10 دقائق
    setInterval(() => this.cleanupExpiredData(), 10 * 60 * 1000);
    
    logger.info('🚫 RateLimitingMiddleware initialized');
  }

  // ======================================
  // ⚙️ Configuration Setup
  // ======================================

  /**
   * تهيئة حدود Rate Limiting حسب الدور
   */
  private initializeRoleBasedLimits(): RoleBasedLimits {
    return {
      // 👑 Super Admin - حدود عالية
      'super_admin': {
        windowMs: 15 * 60 * 1000,    // 15 دقيقة
        maxRequests: 2000,           // 2000 طلب
        message: 'تم تجاوز الحد المسموح للـ Super Admin'
      },

      // 📈 Marketing Coordinator - حدود متوسطة عالية
      'marketing_coordinator': {
        windowMs: 15 * 60 * 1000,    // 15 دقيقة
        maxRequests: 1000,           // 1000 طلب
        message: 'تم تجاوز الحد المسموح للمنسق التسويقي'
      },

      // 🏢 Brand Coordinator - حدود متوسطة
      'brand_coordinator': {
        windowMs: 15 * 60 * 1000,    // 15 دقيقة
        maxRequests: 500,            // 500 طلب
        message: 'تم تجاوز الحد المسموح لمنسق البراند'
      },

      // 📸 Photographer - حدود أساسية
      'photographer': {
        windowMs: 15 * 60 * 1000,    // 15 دقيقة
        maxRequests: 200,            // 200 طلب
        message: 'تم تجاوز الحد المسموح للمصور'
      },

      // 👤 New User - حدود محدودة
      'new_user': {
        windowMs: 15 * 60 * 1000,    // 15 دقيقة
        maxRequests: 50,             // 50 طلب فقط
        message: 'تم تجاوز الحد المسموح للمستخدم الجديد'
      },

      // 🌐 Anonymous - حدود صارمة
      'anonymous': {
        windowMs: 15 * 60 * 1000,    // 15 دقيقة
        maxRequests: 20,             // 20 طلب فقط
        message: 'تم تجاوز الحد المسموح للمستخدمين غير المسجلين'
      }
    };
  }

  // ======================================
  // 🔑 Key Generation
  // ======================================

     /**
    * إنشاء مفتاح فريد للطلب
    * 🎯 فائدة UserRole: التحقق من نوع المستخدم لتحديد استراتيجية التتبع
    */
  private generateKey(req: Request, type: 'ip' | 'user' | 'combined' = 'combined'): string {
    const ip = this.getClientIP(req);
    const userId = req.user?.user.id;
    const userRole: UserRole | undefined = req.user?.role;

    // إضافة معرف الدور للمفتاح للتحكم أفضل
    const rolePrefix = userRole ? `${userRole}:` : '';

    switch (type) {
      case 'ip':
        return `${rolePrefix}ip:${ip}`;
      case 'user':
        return userId ? `${rolePrefix}user:${userId}` : `${rolePrefix}ip:${ip}`;
      case 'combined':
        return userId ? `${rolePrefix}combined:${userId}:${ip}` : `${rolePrefix}ip:${ip}`;
      default:
        return `${rolePrefix}ip:${ip}`;
    }
  }

  /**
   * استخراج IP الحقيقي للعميل
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
  // 📊 Usage Tracking
  // ======================================

  /**
   * تسجيل استخدام طلب
   */
  private recordUsage(key: string, windowMs: number): UsageStats {
    const now = Date.now();
    const existing = this.usageStore.get(key);

    if (!existing || (now - existing.firstRequest) >= windowMs) {
      // إنشاء نافذة جديدة
      const newStats: UsageStats = {
        requests: 1,
        resetTime: now + windowMs,
        firstRequest: now,
        lastRequest: now,
        blockedRequests: 0
      };
      this.usageStore.set(key, newStats);
      return newStats;
    } else {
      // تحديث النافذة الموجودة
      existing.requests += 1;
      existing.lastRequest = now;
      this.usageStore.set(key, existing);
      return existing;
    }
  }

  /**
   * تسجيل طلب محظور
   */
  private recordBlockedRequest(key: string): void {
    const stats = this.usageStore.get(key);
    if (stats) {
      stats.blockedRequests += 1;
      this.usageStore.set(key, stats);
    }
  }

  // ======================================
  // 🚨 Security & Detection
  // ======================================

  /**
   * اكتشاف النشاط المشبوه
   */
  private detectSuspiciousActivity(
    req: Request,
    stats: UsageStats,
    config: RateLimitConfig
  ): void {
    const ip = this.getClientIP(req);
    const userId = req.user?.user.id;
    const now = Date.now();

    // تحديد مستوى الخطورة
    let severity: SuspiciousActivity['severity'] = 'low';
    const requestRatio = stats.requests / config.maxRequests;

    if (requestRatio >= 2) severity = 'critical';
    else if (requestRatio >= 1.5) severity = 'high';
    else if (requestRatio >= 1.2) severity = 'medium';

    const suspiciousActivity: SuspiciousActivity = {
      ip,
      activityType: 'api_request',
      requestCount: stats.requests,
      timeWindow: config.windowMs,
      detectedAt: now,
      severity,
      ...(userId && { userId })
    };

    this.suspiciousActivities.push(suspiciousActivity);

    // إضافة IP للقائمة السوداء إذا كان النشاط حرجاً
    if (severity === 'critical') {
      this.blacklistedIPs.add(ip);
      logger.warn('🚨 IP added to blacklist due to critical activity', {
        ip,
        userId,
        requestCount: stats.requests,
        maxAllowed: config.maxRequests
      });
    }

    logger.warn('🚨 Suspicious activity detected', suspiciousActivity);
  }

  /**
   * التحقق من القائمة السوداء/البيضاء
   */
  private checkIPLists(ip: string): { blocked: boolean; whitelisted: boolean } {
    return {
      blocked: this.blacklistedIPs.has(ip),
      whitelisted: this.whitelistedIPs.has(ip)
    };
  }

  // ======================================
  // 🧹 Cleanup & Maintenance
  // ======================================

  /**
   * تنظيف البيانات المنتهية الصلاحية
   */
  private cleanupExpiredData(): void {
    const now = Date.now();
    let cleaned = 0;

    // تنظيف usage store
    for (const [key, stats] of this.usageStore.entries()) {
      if (now >= stats.resetTime) {
        this.usageStore.delete(key);
        cleaned++;
      }
    }

    // تنظيف الأنشطة المشبوهة (الاحتفاظ بآخر 24 ساعة)
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    this.suspiciousActivities = this.suspiciousActivities.filter(
      activity => activity.detectedAt > oneDayAgo
    );

    logger.debug('🧹 Cleaned up expired rate limit data', { 
      cleanedEntries: cleaned,
      remainingEntries: this.usageStore.size,
      suspiciousActivities: this.suspiciousActivities.length
    });
  }

  // ======================================
  // 🌐 Middleware Functions
  // ======================================

  /**
   * Middleware رئيسي للـ Rate Limiting
   */
  rateLimit(config?: Partial<RateLimitConfig>): (req: Request, res: Response, next: NextFunction) => void {
    return (req: Request, res: Response, next: NextFunction): void => {
      try {
        const ip = this.getClientIP(req);
        const userInfo = this.extractUserInfo(req);
        const user = userInfo.user;
        
        // التحقق من القوائم
        const { blocked, whitelisted } = this.checkIPLists(ip);
        
        if (blocked) {
          logger.warn('🚫 Request blocked: IP in blacklist', { 
            ip, 
            path: req.path,
            userId: user?.user.id 
          });
          
          res.status(429).json({
            success: false,
            message: 'تم حظر عنوان IP هذا بسبب نشاط مشبوه',
            error_code: 'IP_BLACKLISTED',
            retry_after: 3600 // ساعة واحدة
          });
          return;
        }

        if (whitelisted) {
          logger.debug('✅ Request whitelisted', { ip, path: req.path });
          return next();
        }

                 // تحديد الإعدادات المناسبة
         const userRole = user?.role || 'anonymous';
         const defaultConfig = this.roleBasedLimits[userRole] || this.roleBasedLimits['anonymous'];
         const finalConfig: RateLimitConfig = { 
           ...defaultConfig, 
           ...(config && Object.fromEntries(
             Object.entries(config).filter(([, value]) => value !== undefined)
           ))
         };

        // إنشاء مفتاح التتبع
        const key = finalConfig.keyGenerator 
          ? finalConfig.keyGenerator(req)
          : this.generateKey(req);

        // تسجيل الاستخدام
        const stats = this.recordUsage(key, finalConfig.windowMs);

        // التحقق من تجاوز الحد
        if (stats.requests > finalConfig.maxRequests) {
          this.recordBlockedRequest(key);
          this.detectSuspiciousActivity(req, stats, finalConfig);

          logger.warn('🚫 Rate limit exceeded', {
            key,
            requests: stats.requests,
            maxRequests: finalConfig.maxRequests,
            ip,
            userId: user?.user.id,
            path: req.path,
            userAgent: req.get('User-Agent')
          });

          const retryAfter = Math.ceil((stats.resetTime - Date.now()) / 1000);
          
          res.set({
            'X-RateLimit-Limit': finalConfig.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': stats.resetTime.toString(),
            'Retry-After': retryAfter.toString()
          });

          res.status(429).json({
            success: false,
            message: finalConfig.message || 'تم تجاوز عدد الطلبات المسموح',
            error_code: 'RATE_LIMIT_EXCEEDED',
            retry_after: retryAfter,
            requests_made: stats.requests,
            max_requests: finalConfig.maxRequests
          });
          return;
        }

        // إضافة headers معلوماتية
        const remaining = Math.max(0, finalConfig.maxRequests - stats.requests);
        res.set({
          'X-RateLimit-Limit': finalConfig.maxRequests.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': stats.resetTime.toString()
        });

        logger.debug('✅ Rate limit check passed', {
          key,
          requests: stats.requests,
          maxRequests: finalConfig.maxRequests,
          remaining,
          ip,
          userId: user?.user.id
        });

        next();
      } catch (error) {
        logger.error('💥 Rate limiting middleware error', {
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          path: req.path,
          method: req.method
        });

        // في حالة الخطأ، السماح بالمرور لتجنب إيقاف الخدمة
        next();
      }
    };
  }

  // ======================================
  // 🎯 Specialized Rate Limiters
  // ======================================

  /**
   * Rate limiter للـ Login
   */
  loginRateLimit(): (req: Request, res: Response, next: NextFunction) => void {
    return this.rateLimit({
      windowMs: 15 * 60 * 1000,  // 15 دقيقة
      maxRequests: 5,            // 5 محاولات فقط
      message: 'تم تجاوز عدد محاولات تسجيل الدخول المسموح',
      keyGenerator: (req: Request) => `login:${this.getClientIP(req)}`
    });
  }

  /**
   * Rate limiter لرفع الملفات
   */
  fileUploadRateLimit(): (req: Request, res: Response, next: NextFunction) => void {
    return this.rateLimit({
      windowMs: 60 * 60 * 1000,  // ساعة واحدة
      maxRequests: 50,           // 50 ملف
      message: 'تم تجاوز عدد الملفات المرفوعة المسموح',
      keyGenerator: (req: Request) => `upload:${this.generateKey(req, 'user')}`
    });
  }

  /**
   * Rate limiter للبحث
   */
  searchRateLimit(): (req: Request, res: Response, next: NextFunction) => void {
    return this.rateLimit({
      windowMs: 5 * 60 * 1000,   // 5 دقائق
      maxRequests: 100,          // 100 بحث
      message: 'تم تجاوز عدد عمليات البحث المسموح',
      keyGenerator: (req: Request) => `search:${this.generateKey(req, 'user')}`
    });
  }

  /**
   * Rate limiter للـ API الحساسة
   */
  strictRateLimit(): (req: Request, res: Response, next: NextFunction) => void {
    return this.rateLimit({
      windowMs: 60 * 60 * 1000,  // ساعة واحدة
      maxRequests: 10,           // 10 طلبات فقط
      message: 'تم تجاوز الحد المسموح للعمليات الحساسة',
      keyGenerator: (req: Request) => `strict:${this.generateKey(req, 'combined')}`
    });
  }

  // ======================================
  // 👤 User Management & Type Safety
  // ======================================

  /**
   * استخراج معلومات المستخدم المصادق بأمان
   * 🎯 فائدة AuthenticatedUser: ضمان type safety لبيانات المستخدم
   */
  private extractUserInfo(req: Request): {
    user: AuthenticatedUser | null;
    userId: ID | null;
    role: UserRole | null;
    isAuthenticated: boolean;
  } {
    const authenticatedUser: AuthenticatedUser | undefined = req.user;
    
    if (!authenticatedUser) {
      return {
        user: null,
        userId: null,
        role: null,
        isAuthenticated: false
      };
    }

    return {
      user: authenticatedUser,
      userId: authenticatedUser.user.id,
      role: authenticatedUser.role,
      isAuthenticated: true
    };
  }

  /**
   * التحقق من صحة بيانات المستخدم المصادق
   * 🎯 فائدة AuthenticatedUser: التأكد من مطابقة البيانات للنوع المطلوب
   */
  private validateAuthenticatedUser(user: AuthenticatedUser): boolean {
    return !!(
      user.uid &&
      user.email &&
      user.role &&
      user.user &&
      user.user.id &&
      typeof user.emailVerified === 'boolean' &&
      typeof user.isVerified === 'boolean'
    );
  }

  // ======================================
  // 📊 Management & Statistics
  // ======================================

  /**
   * إضافة IP للقائمة البيضاء
   */
  addToWhitelist(ip: string): void {
    this.whitelistedIPs.add(ip);
    logger.info('✅ IP added to whitelist', { ip });
  }

  /**
   * إضافة IP للقائمة السوداء
   */
  addToBlacklist(ip: string): void {
    this.blacklistedIPs.add(ip);
    logger.warn('🚫 IP added to blacklist', { ip });
  }

  /**
   * إزالة IP من القائمة السوداء
   */
  removeFromBlacklist(ip: string): boolean {
    const removed = this.blacklistedIPs.delete(ip);
    if (removed) {
      logger.info('✅ IP removed from blacklist', { ip });
    }
    return removed;
  }

  /**
   * إحصائيات الاستخدام
   */
  getUsageStats(): {
    totalActiveWindows: number;
    totalSuspiciousActivities: number;
    blacklistedIPs: string[];
    whitelistedIPs: string[];
  } {
    return {
      totalActiveWindows: this.usageStore.size,
      totalSuspiciousActivities: this.suspiciousActivities.length,
      blacklistedIPs: Array.from(this.blacklistedIPs),
      whitelistedIPs: Array.from(this.whitelistedIPs)
    };
  }

  /**
   * الحصول على الأنشطة المشبوهة
   */
  getSuspiciousActivities(severity?: SuspiciousActivity['severity']): SuspiciousActivity[] {
    if (severity) {
      return this.suspiciousActivities.filter(activity => activity.severity === severity);
    }
    return [...this.suspiciousActivities];
  }
}

// ======================================
// 🏭 Factory & Export
// ======================================

/**
 * إنشاء instance افتراضي
 */
export const rateLimitMiddleware = new RateLimitingMiddleware();

/**
 * Quick access methods للاستخدام المباشر
 */
export const generalRateLimit = rateLimitMiddleware.rateLimit();
export const loginRateLimit = rateLimitMiddleware.loginRateLimit();
export const fileUploadRateLimit = rateLimitMiddleware.fileUploadRateLimit();
export const searchRateLimit = rateLimitMiddleware.searchRateLimit();
export const strictRateLimit = rateLimitMiddleware.strictRateLimit(); 
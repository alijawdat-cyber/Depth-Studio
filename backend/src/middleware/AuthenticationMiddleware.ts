/**
 * 🛡️ Authentication Middleware - Depth Studio
 * ============================================
 * 
 * 📅 محدث: ديسمبر 2024
 * 👨‍💻 المطور: علي جودت
 * 🎯 الهدف: نظام مصادقة شامل مع Firebase Auth integration
 * 
 * 🔍 المسؤوليات:
 * - JWT Token Validation
 * - Firebase Auth Integration  
 * - Session Management
 * - User Authentication State
 * - Security Headers
 */

import { Request, Response, NextFunction } from 'express';
import { auth } from 'firebase-admin';
import { UserRepository } from '../repositories/UserRepository';
import { User } from '../../../types/src/users';
import { UserRole, UserStatus } from '../../../types/src/core/enums';
import { ID } from '../../../types/src/core/base';
import { logger } from 'firebase-functions';

/**
 * 🔐 واجهة المستخدم المصادق
 */
export interface AuthenticatedUser {
  uid: string;
  email: string;
  emailVerified: boolean;
  role: UserRole;
  status: UserStatus;
  isVerified: boolean;
  user: User;
}

/**
 * 🌐 تمديد Express Request للمصادقة
 */
declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthenticatedUser;
    firebaseToken?: auth.DecodedIdToken;
  }
}

/**
 * 📋 خيارات المصادقة
 */
export interface AuthenticationOptions {
  required?: boolean;
  allowedRoles?: UserRole[];
  requireVerification?: boolean;
  requireActiveStatus?: boolean;
}

/**
 * ⚙️ إعدادات الـ Middleware
 */
export interface MiddlewareConfig {
  skipAuthForRoutes?: string[];
  requireAuthForRoutes?: string[];
  securityHeaders?: boolean;
  sessionTimeout?: number; // بالدقائق
}

/**
 * 🛡️ Authentication Middleware Class
 */
export class AuthenticationMiddleware {
  private userRepository: UserRepository;
  private config: MiddlewareConfig;

  constructor(config: MiddlewareConfig = {}) {
    this.userRepository = new UserRepository();
    this.config = {
      skipAuthForRoutes: ['/health', '/', '/api/auth/login', '/api/auth/register'],
      requireAuthForRoutes: ['/api/users', '/api/brands', '/api/campaigns', '/api/content', '/api/payments', '/api/equipment', '/api/notifications'],
      securityHeaders: true,
      sessionTimeout: 480, // 8 ساعات
      ...config
    };
    
    logger.info('🛡️ AuthenticationMiddleware initialized', { 
      config: this.config 
    });
  }

  // ======================================
  // 🔑 Firebase Token Validation
  // ======================================

  /**
   * التحقق من Firebase ID Token
   */
  private async verifyFirebaseToken(token: string): Promise<auth.DecodedIdToken | null> {
    try {
      const decodedToken = await auth().verifyIdToken(token);
      
      logger.debug('🔑 Firebase token verified', {
        uid: decodedToken.uid,
        email: decodedToken.email
      });
      
      return decodedToken;
    } catch (error) {
      logger.warn('❌ Firebase token verification failed', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        token: token.substring(0, 10) + '...' // جزء آمن من التوكن للتتبع
      });
      return null;
    }
  }

  /**
   * استخراج Token من Request
   */
  private extractToken(req: Request): string | null {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return null;
    }
    
    if (authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    
    return authHeader;
  }

  // ======================================
  // 👤 User Data Management
  // ======================================

  /**
   * جلب بيانات المستخدم من Database
   */
  private async getUserFromDatabase(firebaseUid: string): Promise<User | null> {
    try {
      const user = await this.userRepository.findByFirebaseUid(firebaseUid);
      
      if (!user) {
        logger.warn('👤 User not found in database', { firebaseUid });
        return null;
      }
      
      // تحديث آخر نشاط عبر updateOnlineStatus
      await this.userRepository.updateOnlineStatus(user.id, true);
      
      return user;
    } catch (error) {
      logger.error('❌ Error fetching user from database', { 
        firebaseUid,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return null;
    }
  }

  /**
   * إنشاء AuthenticatedUser object
   */
  private createAuthenticatedUser(
    firebaseToken: auth.DecodedIdToken,
    user: User
  ): AuthenticatedUser {
    return {
      uid: firebaseToken.uid,
      email: firebaseToken.email || user.email,
      emailVerified: firebaseToken.email_verified || false,
      role: user.primary_role,
      status: user.status,
      isVerified: user.is_verified,
      user
    };
  }

  // ======================================
  // 🔒 Authorization Checks
  // ======================================

  /**
   * التحقق من الصلاحيات
   */
  private checkAuthorization(
    user: AuthenticatedUser,
    options: AuthenticationOptions
  ): { authorized: boolean; reason?: string } {
    // التحقق من الأدوار المسموحة
    if (options.allowedRoles && options.allowedRoles.length > 0) {
      if (!options.allowedRoles.includes(user.role)) {
        return {
          authorized: false,
          reason: `الدور المطلوب: ${options.allowedRoles.join(', ')}، الدور الحالي: ${user.role}`
        };
      }
    }
    
    // التحقق من التفعيل
    if (options.requireVerification && !user.isVerified) {
      return {
        authorized: false,
        reason: 'يتطلب تفعيل الحساب'
      };
    }
    
    // التحقق من الحالة النشطة
    if (options.requireActiveStatus && user.status !== 'active') {
      return {
        authorized: false,
        reason: `حالة الحساب غير نشطة: ${user.status}`
      };
    }
    
    return { authorized: true };
  }

  // ======================================
  // 🌐 Main Middleware Functions
  // ======================================

  /**
   * Middleware رئيسي للمصادقة
   */
  authenticate(options: AuthenticationOptions = {}): (req: Request, res: Response, next: NextFunction) => Promise<void> {
    const defaultOptions: AuthenticationOptions = {
      required: true,
      requireVerification: false,
      requireActiveStatus: true,
      ...options
    };

    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        // إضافة Security Headers
        if (this.config.securityHeaders) {
          this.addSecurityHeaders(res);
        }

        // تسجيل الطلب
        logger.info('🔍 Authentication check', {
          method: req.method,
          path: req.path,
          userAgent: req.get('User-Agent'),
          ip: req.ip
        });

        // التحقق من المسارات المستثناة
        if (this.shouldSkipAuth(req.path)) {
          logger.debug('⏭️ Skipping auth for route', { path: req.path });
          return next();
        }

        // استخراج التوكن
        const token = this.extractToken(req);
        
        if (!token) {
          if (defaultOptions.required) {
            logger.warn('❌ No token provided', { 
              path: req.path,
              method: req.method
            });
            
            res.status(401).json({
              success: false,
              message: 'التوكن مطلوب للوصول',
              error_code: 'NO_TOKEN_PROVIDED'
            });
            return;
          } else {
            return next();
          }
        }

        // التحقق من Firebase Token
        const firebaseToken = await this.verifyFirebaseToken(token);
        
        if (!firebaseToken) {
          logger.warn('❌ Invalid Firebase token', { 
            path: req.path,
            method: req.method
          });
          
          res.status(401).json({
            success: false,
            message: 'التوكن غير صالح',
            error_code: 'INVALID_TOKEN'
          });
          return;
        }

        // جلب بيانات المستخدم
        const user = await this.getUserFromDatabase(firebaseToken.uid);
        
        if (!user) {
          logger.warn('❌ User not found in database', { 
            firebaseUid: firebaseToken.uid,
            email: firebaseToken.email
          });
          
          res.status(401).json({
            success: false,
            message: 'المستخدم غير موجود في النظام',
            error_code: 'USER_NOT_FOUND'
          });
          return;
        }

        // إنشاء AuthenticatedUser
        const authenticatedUser = this.createAuthenticatedUser(firebaseToken, user);

        // التحقق من الصلاحيات
        const authCheck = this.checkAuthorization(authenticatedUser, defaultOptions);
        
        if (!authCheck.authorized) {
          logger.warn('❌ Authorization failed', {
            userId: user.id,
            role: user.primary_role,
            reason: authCheck.reason
          });
          
          res.status(403).json({
            success: false,
            message: authCheck.reason || 'غير مخول للوصول',
            error_code: 'INSUFFICIENT_PERMISSIONS'
          });
          return;
        }

        // إضافة البيانات للـ Request
        req.user = authenticatedUser;
        req.firebaseToken = firebaseToken;

        logger.info('✅ Authentication successful', {
          userId: user.id,
          email: user.email,
          role: user.primary_role,
          path: req.path
        });

        next();
      } catch (error) {
        logger.error('💥 Authentication middleware error', {
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          path: req.path,
          method: req.method
        });
        
        res.status(500).json({
          success: false,
          message: 'خطأ في نظام المصادقة',
          error_code: 'AUTHENTICATION_ERROR'
        });
      }
    };
  }

  /**
   * Middleware اختياري للمصادقة
   */
  optionalAuthenticate(): (req: Request, res: Response, next: NextFunction) => Promise<void> {
    return this.authenticate({ required: false });
  }

  /**
   * التحقق من المسارات المستثناة
   */
  private shouldSkipAuth(path: string): boolean {
    return this.config.skipAuthForRoutes?.some(route => {
      if (route.includes('*')) {
        const pattern = route.replace('*', '.*');
        return new RegExp(`^${pattern}$`).test(path);
      }
      return path === route || path.startsWith(route);
    }) || false;
  }

  // ======================================
  // 🛡️ Security Headers
  // ======================================

  /**
   * إضافة Security Headers
   */
  private addSecurityHeaders(res: Response): void {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Content-Security-Policy', "default-src 'self'");
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  // ======================================
  // 📊 Utility Methods
  // ======================================

  /**
   * التحقق من انتهاء صلاحية الجلسة
   */
  private isSessionExpired(lastActivity: number): boolean {
    const now = Date.now();
    const sessionTimeoutMs = (this.config.sessionTimeout || 480) * 60 * 1000;
    return (now - lastActivity) > sessionTimeoutMs;
  }

  /**
   * تحديث معلومات الجلسة
   */
  async updateSessionActivity(userId: ID): Promise<void> {
    try {
      await this.userRepository.updateOnlineStatus(userId, true);
    } catch (error) {
      logger.error('❌ Failed to update session activity', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // ======================================
  // 🎯 Quick Access Methods
  // ======================================

  /**
   * Middleware للـ Super Admin فقط
   */
  requireSuperAdmin(): (req: Request, res: Response, next: NextFunction) => Promise<void> {
    return this.authenticate({
      required: true,
      allowedRoles: ['super_admin'],
      requireVerification: true,
      requireActiveStatus: true
    });
  }

  /**
   * Middleware للـ Coordinators وما فوق
   */
  requireCoordinator(): (req: Request, res: Response, next: NextFunction) => Promise<void> {
    return this.authenticate({
      required: true,
      allowedRoles: ['super_admin', 'marketing_coordinator', 'brand_coordinator'],
      requireVerification: true,
      requireActiveStatus: true
    });
  }

  /**
   * Middleware للمصورين وما فوق
   */
  requirePhotographer(): (req: Request, res: Response, next: NextFunction) => Promise<void> {
    return this.authenticate({
      required: true,
      allowedRoles: ['super_admin', 'marketing_coordinator', 'brand_coordinator', 'photographer'],
      requireVerification: true,
      requireActiveStatus: true
    });
  }

  /**
   * Middleware لأي مستخدم مفعل
   */
  requireActiveUser(): (req: Request, res: Response, next: NextFunction) => Promise<void> {
    return this.authenticate({
      required: true,
      requireVerification: true,
      requireActiveStatus: true
    });
  }
}

// ======================================
// 🏭 Factory & Export
// ======================================

/**
 * إنشاء instance افتراضي
 */
export const authMiddleware = new AuthenticationMiddleware({
  securityHeaders: true,
  sessionTimeout: 480 // 8 ساعات
});

/**
 * Quick access methods للاستخدام المباشر
 */
export const requireAuth = authMiddleware.authenticate();
export const optionalAuth = authMiddleware.optionalAuthenticate();
export const requireSuperAdmin = authMiddleware.requireSuperAdmin();
export const requireCoordinator = authMiddleware.requireCoordinator();
export const requirePhotographer = authMiddleware.requirePhotographer();
export const requireActiveUser = authMiddleware.requireActiveUser(); 
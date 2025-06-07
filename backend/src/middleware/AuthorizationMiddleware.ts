/**
 * 🔑 Authorization Middleware - Depth Studio
 * ==========================================
 * 
 * 📅 محدث: ديسمبر 2024
 * 👨‍💻 المطور: علي جودت
 * 🎯 الهدف: نظام صلاحيات شامل مع Role-Based Access Control
 * 
 * 🔍 المسؤوليات:
 * - Role-Based Access Control (RBAC)
 * - Permission Checking
 * - Route Protection
 * - Resource Access Control
 * - Dynamic Permission Validation
 */

import { Request, Response, NextFunction } from 'express';
import { UserPermissions } from '../../../types/src/users';
import { UserRole } from '../../../types/src/core/enums';
import { ID } from '../../../types/src/core/base';
import { UserRepository } from '../repositories/UserRepository';
import { AuthenticatedUser } from './AuthenticationMiddleware';
import { logger } from 'firebase-functions';

/**
 * 🎯 أنواع الصلاحيات
 */
export type Permission = 
  | 'users:read' | 'users:write' | 'users:manage'
  | 'brands:read' | 'brands:write' | 'brands:manage' | 'brands:approve'
  | 'campaigns:read' | 'campaigns:write' | 'campaigns:manage'
  | 'content:read' | 'content:write' | 'content:approve' | 'content:reject'
  | 'payments:read' | 'payments:write' | 'payments:approve'
  | 'equipment:read' | 'equipment:write' | 'equipment:manage'
  | 'notifications:read' | 'notifications:write' | 'notifications:manage'
  | 'reports:read' | 'reports:generate'
  | 'system:admin';

/**
 * 📋 خريطة الأدوار والصلاحيات
 */
export interface RolePermissionMap {
  [key: string]: Permission[];
}

/**
 * ⚙️ خيارات التحقق من الصلاحيات
 */
export interface AuthorizationOptions {
  permissions?: Permission[];
  roles?: UserRole[];
  requireAll?: boolean; // هل نحتاج كل الصلاحيات أم واحدة فقط
  allowOwnerAccess?: boolean; // السماح للمالك بالوصول
  resourceOwnerField?: string; // اسم الحقل في الـ resource للمالك
  skipForSuperAdmin?: boolean; // تخطي التحقق للـ super admin
}

/**
 * 🏗️ نتيجة التحقق من الصلاحيات
 */
interface AuthorizationResult {
  authorized: boolean;
  reason?: string;
  missingPermissions?: Permission[];
}

/**
 * 🔑 Authorization Middleware Class
 */
export class AuthorizationMiddleware {
  private userRepository: UserRepository;
  private rolePermissions: RolePermissionMap;

  constructor() {
    this.userRepository = new UserRepository();
    this.rolePermissions = this.initializeRolePermissions();
    
    logger.info('🔑 AuthorizationMiddleware initialized');
  }

  // ======================================
  // 📊 Database Permission Management
  // ======================================

  /**
   * جلب صلاحيات المستخدم من قاعدة البيانات
   * 🎯 فائدة UserPermissions: صلاحيات ديناميكية مخصصة لكل مستخدم
   */
  private async getUserPermissionsFromDB(userId: ID): Promise<UserPermissions | null> {
    try {
      // هنا سنبحث عن UserPermissions في قاعدة البيانات
      // مؤقتاً سنرجع null حتى ننشئ UserPermissionsRepository
      logger.debug('🔍 Fetching user permissions from database', { userId });
      return null;
    } catch (error) {
      logger.error('❌ Error fetching user permissions', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return null;
    }
  }

  /**
   * التحقق من الصلاحيات المخصصة للمستخدم
   * 🎯 فائدة UserPermissions: تحكم دقيق في الصلاحيات للبراندات والوظائف
   */
  private checkDynamicPermissions(
    userPermissions: UserPermissions,
    requestedPermission: Permission,
    brandId?: ID
  ): boolean {
    // التحقق من حالة الصلاحيات
    if (!userPermissions.is_active) {
      return false;
    }

    // التحقق من صلاحيات البراندات المحددة
    if (brandId && !userPermissions.brand_access.includes(brandId)) {
      logger.debug('❌ User does not have access to brand', { 
        userId: userPermissions.user_id, 
        brandId 
      });
      return false;
    }

    // ربط الصلاحيات المخصصة مع النظام العام
    switch (requestedPermission) {
      case 'content:approve':
        return userPermissions.can_approve_content;
      case 'users:manage':
        return userPermissions.can_manage_users;
      case 'brands:manage':
        return userPermissions.can_manage_brands;
      case 'campaigns:manage':
        return userPermissions.can_manage_campaigns;
      case 'reports:read':
      case 'reports:generate':
        return userPermissions.can_view_reports;
      case 'payments:read':
        return userPermissions.can_view_financials;
      default:
        return false;
    }
  }

  // ======================================
  // 🎯 Permission System Setup
  // ======================================

  /**
   * تهيئة خريطة الأدوار والصلاحيات
   */
  private initializeRolePermissions(): RolePermissionMap {
    return {
      // 👑 Super Admin - كامل الصلاحيات
      'super_admin': [
        'users:read', 'users:write', 'users:manage',
        'brands:read', 'brands:write', 'brands:manage', 'brands:approve',
        'campaigns:read', 'campaigns:write', 'campaigns:manage',
        'content:read', 'content:write', 'content:approve', 'content:reject',
        'payments:read', 'payments:write', 'payments:approve',
        'equipment:read', 'equipment:write', 'equipment:manage',
        'notifications:read', 'notifications:write', 'notifications:manage',
        'reports:read', 'reports:generate',
        'system:admin'
      ],

      // 📈 Marketing Coordinator - إدارة التسويق
      'marketing_coordinator': [
        'users:read',
        'brands:read', 'brands:write', 'brands:manage', 'brands:approve',
        'campaigns:read', 'campaigns:write', 'campaigns:manage',
        'content:read', 'content:write', 'content:approve', 'content:reject',
        'payments:read',
        'equipment:read', 'equipment:write',
        'notifications:read', 'notifications:write',
        'reports:read', 'reports:generate'
      ],

      // 🏢 Brand Coordinator - إدارة البراند
      'brand_coordinator': [
        'users:read',
        'brands:read', 'brands:write',
        'campaigns:read', 'campaigns:write',
        'content:read', 'content:write', 'content:approve', 'content:reject',
        'payments:read',
        'equipment:read',
        'notifications:read', 'notifications:write',
        'reports:read'
      ],

      // 📸 Photographer - المصور
      'photographer': [
        'campaigns:read',
        'content:read', 'content:write',
        'equipment:read',
        'notifications:read',
        'reports:read'
      ],

      // 👤 New User - مستخدم جديد
      'new_user': [
        'notifications:read'
      ]
    };
  }

  /**
   * الحصول على صلاحيات الدور
   */
  private getRolePermissions(role: UserRole): Permission[] {
    return this.rolePermissions[role] || [];
  }

  // ======================================
  // 🔍 Permission Checking
  // ======================================

  /**
   * التحقق من صلاحية واحدة
   */
  private hasPermission(userRole: UserRole, permission: Permission): boolean {
    const rolePermissions = this.getRolePermissions(userRole);
    return rolePermissions.includes(permission);
  }

  /**
   * التحقق من صلاحيات متعددة
   */
  private hasPermissions(
    userRole: UserRole, 
    permissions: Permission[], 
    requireAll: boolean = false
  ): { hasAccess: boolean; missingPermissions: Permission[] } {
    const rolePermissions = this.getRolePermissions(userRole);
    const missingPermissions = permissions.filter(
      permission => !rolePermissions.includes(permission)
    );

    const hasAccess = requireAll 
      ? missingPermissions.length === 0
      : permissions.length > missingPermissions.length;

    return { hasAccess, missingPermissions };
  }

  /**
   * التحقق من الأدوار المسموحة
   */
  private hasAllowedRole(userRole: UserRole, allowedRoles: UserRole[]): boolean {
    return allowedRoles.includes(userRole);
  }

  // ======================================
  // 👤 Resource Owner Checking
  // ======================================

  /**
   * التحقق من ملكية المورد
   */
  private async checkResourceOwnership(
    req: Request,
    userId: ID,
    resourceOwnerField: string
  ): Promise<boolean> {
    try {
      // استخراج معرف المورد من الـ params
      const resourceId = req.params['id'] || req.params['resourceId'];
      
      if (!resourceId) {
        logger.warn('🔍 No resource ID found for ownership check', { 
          path: req.path,
          params: req.params 
        });
        return false;
      }

      // هنا يمكن إضافة منطق للتحقق من ملكية المورد
      // حالياً سنعتبر أن المستخدم مالك إذا كان معرفه يطابق resourceOwnerField
      const resourceUserId = req.body[resourceOwnerField] || req.query[resourceOwnerField];
      
      const isOwner = resourceUserId === userId;
      
      logger.debug('🔍 Resource ownership check', {
        userId,
        resourceId,
        resourceOwnerField,
        resourceUserId,
        isOwner
      });

      return isOwner;
    } catch (error) {
      logger.error('❌ Error checking resource ownership', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        resourceOwnerField
      });
      return false;
    }
  }

  // ======================================
  // 🛡️ Authorization Logic
  // ======================================

  /**
   * التحقق الرئيسي من الصلاحيات
   */
  private async checkAuthorization(
    user: AuthenticatedUser,
    req: Request,
    options: AuthorizationOptions
  ): Promise<AuthorizationResult> {
    const { role } = user;

    // Super Admin bypass
    if (options.skipForSuperAdmin && role === 'super_admin') {
      logger.debug('🚀 Super admin bypassing authorization', { 
        userId: user.user.id, 
        path: req.path 
      });
      return { authorized: true };
    }

    // التحقق من الأدوار المسموحة
    if (options.roles && options.roles.length > 0) {
      if (!this.hasAllowedRole(role, options.roles)) {
        return {
          authorized: false,
          reason: `الدور المطلوب: ${options.roles.join(' أو ')}، الدور الحالي: ${role}`
        };
      }
    }

    // التحقق من الصلاحيات
    if (options.permissions && options.permissions.length > 0) {
      // جلب الصلاحيات المخصصة من قاعدة البيانات
      const userPermissions = await this.getUserPermissionsFromDB(user.user.id);
      
      const { hasAccess, missingPermissions } = this.hasPermissions(
        role,
        options.permissions,
        options.requireAll
      );

      if (!hasAccess) {
        // التحقق من الصلاحيات المخصصة إذا كانت متوفرة
        if (userPermissions) {
          const brandId = req.params['brandId'] || req.body['brand_id'] || req.query['brand_id'] as ID;
          
          // التحقق من كل صلاحية مطلوبة باستخدام النظام المخصص
          const dynamicPermissionCheck = options.permissions.some(permission => 
            this.checkDynamicPermissions(userPermissions, permission, brandId)
          );

          if (dynamicPermissionCheck) {
            logger.debug('✅ Access granted through dynamic permissions', {
              userId: user.user.id,
              path: req.path,
              brandId
            });
            return { authorized: true };
          }
        }

        // التحقق من ملكية المورد إذا كان مسموحاً
        if (options.allowOwnerAccess && options.resourceOwnerField) {
          const isOwner = await this.checkResourceOwnership(
            req,
            user.user.id,
            options.resourceOwnerField
          );

          if (isOwner) {
            logger.debug('✅ Access granted through resource ownership', {
              userId: user.user.id,
              path: req.path
            });
            return { authorized: true };
          }
        }

        return {
          authorized: false,
          reason: `صلاحيات غير كافية. مطلوب: ${options.permissions.join(', ')}`,
          missingPermissions
        };
      }
    }

    return { authorized: true };
  }

  // ======================================
  // 🌐 Middleware Functions
  // ======================================

  /**
   * Middleware رئيسي للتحقق من الصلاحيات
   */
  authorize(options: AuthorizationOptions = {}): (req: Request, res: Response, next: NextFunction) => Promise<void> {
    const defaultOptions: AuthorizationOptions = {
      requireAll: false,
      allowOwnerAccess: false,
      skipForSuperAdmin: true,
      ...options
    };

    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        // التحقق من وجود المستخدم المصادق
        if (!req.user) {
          logger.warn('❌ No authenticated user found for authorization', {
            path: req.path,
            method: req.method
          });

          res.status(401).json({
            success: false,
            message: 'يجب تسجيل الدخول أولاً',
            error_code: 'AUTHENTICATION_REQUIRED'
          });
          return;
        }

        logger.info('🔍 Authorization check', {
          userId: req.user.user.id,
          role: req.user.role,
          path: req.path,
          method: req.method,
          permissions: defaultOptions.permissions,
          roles: defaultOptions.roles
        });

        // التحقق من الصلاحيات
        const authResult = await this.checkAuthorization(req.user, req, defaultOptions);

        if (!authResult.authorized) {
          logger.warn('❌ Authorization failed', {
            userId: req.user.user.id,
            role: req.user.role,
            path: req.path,
            reason: authResult.reason,
            missingPermissions: authResult.missingPermissions
          });

          res.status(403).json({
            success: false,
            message: authResult.reason || 'غير مخول للوصول',
            error_code: 'INSUFFICIENT_PERMISSIONS',
            missing_permissions: authResult.missingPermissions
          });
          return;
        }

        logger.info('✅ Authorization successful', {
          userId: req.user.user.id,
          role: req.user.role,
          path: req.path
        });

        next();
      } catch (error) {
        logger.error('💥 Authorization middleware error', {
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          path: req.path,
          method: req.method,
          userId: req.user?.user.id
        });

        res.status(500).json({
          success: false,
          message: 'خطأ في نظام الصلاحيات',
          error_code: 'AUTHORIZATION_ERROR'
        });
      }
    };
  }

  // ======================================
  // 🎯 Quick Access Methods
  // ======================================

  /**
   * صلاحية قراءة المستخدمين
   */
  requireUsersRead(): (req: Request, res: Response, next: NextFunction) => Promise<void> {
    return this.authorize({
      permissions: ['users:read']
    });
  }

  /**
   * صلاحية إدارة المستخدمين
   */
  requireUsersManage(): (req: Request, res: Response, next: NextFunction) => Promise<void> {
    return this.authorize({
      permissions: ['users:manage']
    });
  }

  /**
   * صلاحية الموافقة على البراندات
   */
  requireBrandsApprove(): (req: Request, res: Response, next: NextFunction) => Promise<void> {
    return this.authorize({
      permissions: ['brands:approve']
    });
  }

  /**
   * صلاحية إدارة الحملات
   */
  requireCampaignsManage(): (req: Request, res: Response, next: NextFunction) => Promise<void> {
    return this.authorize({
      permissions: ['campaigns:manage']
    });
  }

  /**
   * صلاحية الموافقة على المحتوى
   */
  requireContentApprove(): (req: Request, res: Response, next: NextFunction) => Promise<void> {
    return this.authorize({
      permissions: ['content:approve']
    });
  }

  /**
   * صلاحية الموافقة على المدفوعات
   */
  requirePaymentsApprove(): (req: Request, res: Response, next: NextFunction) => Promise<void> {
    return this.authorize({
      permissions: ['payments:approve']
    });
  }

  /**
   * صلاحية إدارة المعدات
   */
  requireEquipmentManage(): (req: Request, res: Response, next: NextFunction) => Promise<void> {
    return this.authorize({
      permissions: ['equipment:manage']
    });
  }

  /**
   * صلاحية إنشاء التقارير
   */
  requireReportsGenerate(): (req: Request, res: Response, next: NextFunction) => Promise<void> {
    return this.authorize({
      permissions: ['reports:generate']
    });
  }

  /**
   * صلاحية إدارة النظام (Super Admin فقط)
   */
  requireSystemAdmin(): (req: Request, res: Response, next: NextFunction) => Promise<void> {
    return this.authorize({
      permissions: ['system:admin'],
      skipForSuperAdmin: false // حتى الـ super admin يحتاج التحقق هنا
    });
  }

  /**
   * السماح للمالك أو الصلاحية المطلوبة
   */
  requireOwnerOrPermission(
    permission: Permission, 
    resourceOwnerField: string = 'user_id'
  ): (req: Request, res: Response, next: NextFunction) => Promise<void> {
    return this.authorize({
      permissions: [permission],
      allowOwnerAccess: true,
      resourceOwnerField
    });
  }

  // ======================================
  // 📊 Utility Methods
  // ======================================

  /**
   * الحصول على قائمة الصلاحيات للدور
   */
  getUserPermissions(role: UserRole): Permission[] {
    return this.getRolePermissions(role);
  }

  /**
   * التحقق من صلاحية بدون middleware
   */
  checkUserPermission(role: UserRole, permission: Permission): boolean {
    return this.hasPermission(role, permission);
  }

  /**
   * الحصول على جميع الأدوار والصلاحيات
   */
  getAllRolePermissions(): RolePermissionMap {
    return { ...this.rolePermissions };
  }

  /**
   * التحقق من صلاحية المستخدم لبراند محدد
   * 🎯 فائدة UserPermissions: تحكم دقيق في الوصول للبراندات
   */
  async checkBrandAccess(userId: ID, brandId: ID): Promise<boolean> {
    try {
      const userPermissions = await this.getUserPermissionsFromDB(userId);
      
      if (!userPermissions || !userPermissions.is_active) {
        return false;
      }

      return userPermissions.brand_access.includes(brandId);
    } catch (error) {
      logger.error('❌ Error checking brand access', {
        userId,
        brandId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  }

  /**
   * التحقق من وجود صلاحيات مخصصة للمستخدم
   * 🎯 فائدة UserPermissions: معرفة وجود تخصيصات خاصة
   */
  async hasCustomPermissions(userId: ID): Promise<boolean> {
    try {
      const userPermissions = await this.getUserPermissionsFromDB(userId);
      return userPermissions !== null && userPermissions.is_active;
    } catch (error) {
      logger.error('❌ Error checking custom permissions', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  }
}

// ======================================
// 🏭 Factory & Export
// ======================================

/**
 * إنشاء instance افتراضي
 */
export const authzMiddleware = new AuthorizationMiddleware();

/**
 * Quick access methods للاستخدام المباشر
 */
export const requireUsersRead = authzMiddleware.requireUsersRead();
export const requireUsersManage = authzMiddleware.requireUsersManage();
export const requireBrandsApprove = authzMiddleware.requireBrandsApprove();
export const requireCampaignsManage = authzMiddleware.requireCampaignsManage();
export const requireContentApprove = authzMiddleware.requireContentApprove();
export const requirePaymentsApprove = authzMiddleware.requirePaymentsApprove();
export const requireEquipmentManage = authzMiddleware.requireEquipmentManage();
export const requireReportsGenerate = authzMiddleware.requireReportsGenerate();
export const requireSystemAdmin = authzMiddleware.requireSystemAdmin(); 
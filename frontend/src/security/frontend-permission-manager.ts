/**
 * 🔑 Frontend Permission Manager - نظام إدارة الصلاحيات للفرونت إند
 * =================================================================
 * 
 * نظام إدارة صلاحيات متقدم للفرونت إند مع تكامل كامل مع AuthorizationMiddleware
 * يوفر تحكم دقيق في الواجهات والعمليات حسب أدوار وصلاحيات المستخدمين
 * 
 * 📅 تاريخ الإنشاء: يونيو 2025
 * 👨‍💻 المطور: علي جودت
 * 🎯 الهدف: إدارة صلاحيات UI متقدمة مع تكامل Backend
 * 🔗 Backend Reference: AuthorizationMiddleware.ts (669 سطر)
 * 📋 Types Reference: users.ts (143 سطر), core/enums.ts (144 سطر)
 * 🤝 Frontend Integration: frontend-auth-guard.ts (588 سطر)
 * 
 * ✨ الفوائد الرئيسية:
 * - 🎯 تكامل كامل مع Backend AuthorizationMiddleware
 * - 🔒 نظام صلاحيات ديناميكي متقدم مع UserPermissions  
 * - 🏢 إدارة وصول البراندات والموارد المخصصة
 * - 🖥️ UI helpers للتحكم في عرض العناصر والعمليات
 * - ⚡ فحص فوري وسريع للصلاحيات في الواجهات
 * - 🔄 مزامنة تلقائية مع أدوار وصلاحيات Backend
 */

import { 
  User,
  UserPermissions
} from '@depth-studio/types';

import { 
  UserRole
} from '@depth-studio/types';

import { ID } from '@depth-studio/types';

// ======================================
// 🎯 أنواع الصلاحيات (متوافق مع Backend)
// ======================================

/** أنواع الصلاحيات - متطابقة مع AuthorizationMiddleware */
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

/** خريطة الأدوار والصلاحيات */
export interface RolePermissionMap {
  [key: string]: Permission[];
}

/** خيارات فحص الصلاحيات */
export interface PermissionCheckOptions {
  permissions?: Permission[];
  roles?: UserRole[];
  requireAll?: boolean;          // هل نحتاج كل الصلاحيات أم واحدة فقط
  allowOwnerAccess?: boolean;    // السماح للمالك بالوصول
  skipForSuperAdmin?: boolean;   // تخطي التحقق للـ super admin
  brandId?: ID;                  // معرف البراند للتحقق من الوصول
}

/** نتيجة فحص الصلاحيات */
export interface PermissionCheckResult {
  authorized: boolean;
  reason?: string;
  missingPermissions?: Permission[];
  userRole?: UserRole;
  hasCustomPermissions?: boolean;
}

/** معلومات الصلاحيات الشاملة */
export interface UserPermissionInfo {
  user: User;
  rolePermissions: Permission[];
  customPermissions: UserPermissions | null;
  effectivePermissions: Permission[];
  brandAccess: ID[];
  isActive: boolean;
}

// ======================================
// 🔑 Frontend Permission Manager Class
// ======================================

export class FrontendPermissionManager {
  private rolePermissions: RolePermissionMap;

  constructor() {
    this.rolePermissions = this.initializeRolePermissions();
  }

  // ======================================
  // 🎯 تهيئة خريطة الأدوار والصلاحيات
  // ======================================

  /**
   * تهيئة خريطة الأدوار والصلاحيات - متطابقة مع Backend
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

  // ======================================
  // 🔍 فحص الصلاحيات الأساسي
  // ======================================

  /**
   * فحص صلاحية واحدة للمستخدم
   */
  checkPermission(
    user: User | null, 
    permission: Permission,
    options: PermissionCheckOptions = {}
  ): PermissionCheckResult {
    // فحص وجود المستخدم
    if (!user) {
      return {
        authorized: false,
        reason: 'المستخدم غير مسجل دخول'
      };
    }

    // فحص حالة المستخدم
    if (user.status !== 'active') {
      return {
        authorized: false,
        reason: 'حساب المستخدم غير نشط',
        userRole: user.primary_role || user.role
      };
    }

    // فحص دور المستخدم
    const userRole = user.primary_role || user.role;
    if (!userRole || userRole === 'new_user') {
      return {
        authorized: false,
        reason: 'المستخدم لم يحدد دوره في النظام بعد',
        userRole
      };
    }

    // تخطي التحقق للـ Super Admin إذا كان مطلوب
    if (options.skipForSuperAdmin !== false && userRole === 'super_admin') {
      return {
        authorized: true,
        userRole,
        hasCustomPermissions: false
      };
    }

    // فحص صلاحيات الدور
    const rolePermissions = this.getRolePermissions(userRole);
    const hasRolePermission = rolePermissions.includes(permission);

    if (hasRolePermission) {
      return {
        authorized: true,
        userRole,
        hasCustomPermissions: false
      };
    }

    return {
      authorized: false,
      reason: `ليس لديك صلاحية ${this.getPermissionDisplayName(permission)}`,
      missingPermissions: [permission],
      userRole,
      hasCustomPermissions: false
    };
  }

  /**
   * فحص صلاحيات متعددة
   */
  checkPermissions(
    user: User | null,
    permissions: Permission[],
    options: PermissionCheckOptions = {}
  ): PermissionCheckResult {
    if (!user || permissions.length === 0) {
      return {
        authorized: false,
        reason: 'معطيات غير صحيحة للفحص'
      };
    }

    const userRole = user.primary_role || user.role;
    const rolePermissions = this.getRolePermissions(userRole);
    
    // تخطي التحقق للـ Super Admin
    if (options.skipForSuperAdmin !== false && userRole === 'super_admin') {
      return {
        authorized: true,
        userRole,
        hasCustomPermissions: false
      };
    }

    const missingPermissions = permissions.filter(
      permission => !rolePermissions.includes(permission)
    );

    const requireAll = options.requireAll !== false; // افتراضياً نحتاج كل الصلاحيات
    const hasAccess = requireAll 
      ? missingPermissions.length === 0
      : permissions.length > missingPermissions.length;

    if (hasAccess) {
      return {
        authorized: true,
        userRole,
        hasCustomPermissions: false
      };
    }

    return {
      authorized: false,
      reason: requireAll 
        ? 'ليس لديك جميع الصلاحيات المطلوبة'
        : 'ليس لديك أي من الصلاحيات المطلوبة',
      missingPermissions,
      userRole,
      hasCustomPermissions: false
    };
  }

  /**
   * فحص صلاحية الدور
   */
  checkRoleAccess(
    user: User | null,
    allowedRoles: UserRole[]
  ): PermissionCheckResult {
    if (!user) {
      return {
        authorized: false,
        reason: 'المستخدم غير مسجل دخول'
      };
    }

    const userRole = user.primary_role || user.role;
    
    if (!userRole || !allowedRoles.includes(userRole)) {
      return {
        authorized: false,
        reason: 'دورك الحالي لا يسمح بالوصول لهذا المحتوى',
        userRole
      };
    }

    return {
      authorized: true,
      userRole
    };
  }

  // ======================================
  // 🔐 فحص الصلاحيات المخصصة
  // ======================================

  /**
   * فحص الصلاحيات المخصصة للمستخدم
   */
  checkCustomPermissions(
    user: User | null,
    customPermissions: UserPermissions | null,
    permission: Permission,
    brandId?: ID
  ): PermissionCheckResult {
    if (!user || !customPermissions) {
      return this.checkPermission(user, permission);
    }

    // فحص حالة الصلاحيات المخصصة
    if (!customPermissions.is_active) {
      return {
        authorized: false,
        reason: 'صلاحياتك المخصصة معطلة',
        userRole: user.primary_role || user.role,
        hasCustomPermissions: true
      };
    }

    // فحص صلاحيات البراند إذا كان مطلوب
    if (brandId && !customPermissions.brand_access.includes(brandId)) {
      return {
        authorized: false,
        reason: 'ليس لديك وصول لهذا البراند',
        userRole: user.primary_role || user.role,
        hasCustomPermissions: true
      };
    }

    // ربط الصلاحيات المخصصة مع النظام العام
    const hasCustomPermission = this.checkDynamicPermission(
      customPermissions, 
      permission
    );

    if (hasCustomPermission) {
      return {
        authorized: true,
        userRole: user.primary_role || user.role,
        hasCustomPermissions: true
      };
    }

    // العودة للفحص العادي إذا لم تكن موجودة في المخصصة
    return this.checkPermission(user, permission);
  }

  /**
   * فحص الصلاحيات الديناميكية
   */
  private checkDynamicPermission(
    userPermissions: UserPermissions,
    requestedPermission: Permission
  ): boolean {
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
  // 🎯 مساعدات UI للواجهات
  // ======================================

  /**
   * فحص إمكانية عرض عنصر UI
   */
  canShowUIElement(
    user: User | null,
    permission: Permission,
    customPermissions?: UserPermissions | null
  ): boolean {
    if (customPermissions) {
      const result = this.checkCustomPermissions(user, customPermissions, permission);
      return result.authorized;
    }

    const result = this.checkPermission(user, permission);
    return result.authorized;
  }

  /**
   * فحص إمكانية تنفيذ عملية
   */
  canPerformAction(
    user: User | null,
    action: Permission,
    resourceOwnerId?: ID,
    customPermissions?: UserPermissions | null
  ): boolean {
    // فحص ملكية المورد
    if (resourceOwnerId && user?.id === resourceOwnerId) {
      return true;
    }

    return this.canShowUIElement(user, action, customPermissions);
  }

  /**
   * فحص إمكانية الوصول لصفحة
   */
  canAccessPage(
    user: User | null,
    requiredPermissions: Permission[],
    requiredRoles?: UserRole[]
  ): { canAccess: boolean; reason?: string } {
    if (!user) {
      return {
        canAccess: false,
        reason: 'يجب تسجيل الدخول أولاً'
      };
    }

    // فحص الأدوار إذا كانت مطلوبة
    if (requiredRoles && requiredRoles.length > 0) {
      const roleCheck = this.checkRoleAccess(user, requiredRoles);
      if (!roleCheck.authorized) {
        return {
          canAccess: false,
          reason: roleCheck.reason
        };
      }
    }

    // فحص الصلاحيات
    if (requiredPermissions.length > 0) {
      const permissionCheck = this.checkPermissions(user, requiredPermissions, {
        requireAll: false // يكفي صلاحية واحدة للوصول للصفحة
      });

      if (!permissionCheck.authorized) {
        return {
          canAccess: false,
          reason: permissionCheck.reason
        };
      }
    }

    return { canAccess: true };
  }

  // ======================================
  // 🔧 دوال مساعدة
  // ======================================

  /**
   * الحصول على صلاحيات الدور
   */
  getRolePermissions(role: UserRole): Permission[] {
    return this.rolePermissions[role] || [];
  }

  /**
   * الحصول على جميع صلاحيات المستخدم
   */
  getUserPermissionInfo(
    user: User,
    customPermissions?: UserPermissions | null
  ): UserPermissionInfo {
    const userRole = user.primary_role || user.role;
    const rolePermissions = this.getRolePermissions(userRole);
    
    // بناء قائمة الصلاحيات الفعلية (الأساسية + المخصصة)
    const effectivePermissions = [...rolePermissions];
    
    if (customPermissions && customPermissions.is_active) {
      // إضافة الصلاحيات المخصصة بناءً على UserPermissions من types
      const customPermissionMappings: Array<{
        condition: boolean;
        permission: Permission;
      }> = [
        { condition: customPermissions.can_approve_content, permission: 'content:approve' },
        { condition: customPermissions.can_manage_users, permission: 'users:manage' },
        { condition: customPermissions.can_manage_brands, permission: 'brands:manage' },
        { condition: customPermissions.can_manage_campaigns, permission: 'campaigns:manage' },
        { condition: customPermissions.can_view_reports, permission: 'reports:read' },
        { condition: customPermissions.can_view_financials, permission: 'payments:read' }
      ];

      // إضافة الصلاحيات المخصصة إذا لم تكن موجودة
      customPermissionMappings.forEach(({ condition, permission }) => {
        if (condition && !effectivePermissions.includes(permission)) {
          effectivePermissions.push(permission);
        }
      });
    }

    return {
      user,
      rolePermissions,
      customPermissions: customPermissions || null,
      effectivePermissions,
      brandAccess: customPermissions?.brand_access || [],
      isActive: user.status === 'active' && user.is_verified
    };
  }

  /**
   * الحصول على اسم الصلاحية بالعربية
   */
  getPermissionDisplayName(permission: Permission): string {
    const permissionNames: Record<Permission, string> = {
      // المستخدمين
      'users:read': 'عرض المستخدمين',
      'users:write': 'تعديل المستخدمين',
      'users:manage': 'إدارة المستخدمين',

      // البراندات
      'brands:read': 'عرض البراندات',
      'brands:write': 'تعديل البراندات',
      'brands:manage': 'إدارة البراندات',
      'brands:approve': 'موافقة البراندات',

      // الحملات
      'campaigns:read': 'عرض الحملات',
      'campaigns:write': 'تعديل الحملات',
      'campaigns:manage': 'إدارة الحملات',

      // المحتوى
      'content:read': 'عرض المحتوى',
      'content:write': 'رفع المحتوى',
      'content:approve': 'موافقة المحتوى',
      'content:reject': 'رفض المحتوى',

      // المدفوعات
      'payments:read': 'عرض المدفوعات',
      'payments:write': 'إدارة المدفوعات',
      'payments:approve': 'موافقة المدفوعات',

      // المعدات
      'equipment:read': 'عرض المعدات',
      'equipment:write': 'تعديل المعدات',
      'equipment:manage': 'إدارة المعدات',

      // الإشعارات
      'notifications:read': 'عرض الإشعارات',
      'notifications:write': 'إرسال الإشعارات',
      'notifications:manage': 'إدارة الإشعارات',

      // التقارير
      'reports:read': 'عرض التقارير',
      'reports:generate': 'إنشاء التقارير',

      // النظام
      'system:admin': 'إدارة النظام'
    };

    return permissionNames[permission] || permission;
  }

  /**
   * الحصول على جميع الأدوار والصلاحيات
   */
  getAllRolePermissions(): RolePermissionMap {
    return { ...this.rolePermissions };
  }

  /**
   * فحص إذا كان لدى المستخدم صلاحيات مخصصة
   */
  hasCustomPermissions(customPermissions: UserPermissions | null): boolean {
    return customPermissions !== null && customPermissions.is_active;
  }

  /**
   * فحص وصول البراند
   */
  canAccessBrand(
    user: User | null,
    brandId: ID,
    customPermissions?: UserPermissions | null
  ): boolean {
    if (!user) return false;

    // Super Admin يصل لكل شيء
    const userRole = user.primary_role || user.role;
    if (userRole === 'super_admin') return true;

    // فحص الوصول المخصص للبراند
    if (customPermissions && customPermissions.is_active) {
      return customPermissions.brand_access.includes(brandId);
    }

    // بقية الأدوار تحتاج صلاحيات مخصصة للوصول لبراندات محددة
    return false;
  }
}

// ======================================
// 🏭 Factory Functions
// ======================================

/**
 * إنشاء Permission Manager مع إعدادات افتراضية
 */
export const createPermissionManager = (): FrontendPermissionManager => {
  return new FrontendPermissionManager();
};

/**
 * Permission Manager افتراضي للاستخدام العام
 */
export const defaultPermissionManager = createPermissionManager();

// ======================================
// 🪝 Utility Functions
// ======================================

/**
 * فحص سريع للصلاحية
 */
export const hasPermission = (
  user: User | null, 
  permission: Permission,
  customPermissions?: UserPermissions | null
): boolean => {
  if (customPermissions) {
    const result = defaultPermissionManager.checkCustomPermissions(
      user, 
      customPermissions, 
      permission
    );
    return result.authorized;
  }

  const result = defaultPermissionManager.checkPermission(user, permission);
  return result.authorized;
};

/**
 * فحص سريع للأدوار
 */
export const hasRole = (user: User | null, roles: UserRole[]): boolean => {
  const result = defaultPermissionManager.checkRoleAccess(user, roles);
  return result.authorized;
};

/**
 * فحص سريع لعرض UI
 */
export const canShow = (
  user: User | null, 
  permission: Permission,
  customPermissions?: UserPermissions | null
): boolean => {
  return defaultPermissionManager.canShowUIElement(user, permission, customPermissions);
};

/**
 * فحص سريع لتنفيذ عملية
 */
export const canPerform = (
  user: User | null,
  action: Permission,
  resourceOwnerId?: ID,
  customPermissions?: UserPermissions | null
): boolean => {
  return defaultPermissionManager.canPerformAction(
    user, 
    action, 
    resourceOwnerId, 
    customPermissions
  );
};

/**
 * فحص سريع للوصول لصفحة
 */
export const canAccessPage = (
  user: User | null,
  requiredPermissions: Permission[],
  requiredRoles?: UserRole[]
): boolean => {
  const result = defaultPermissionManager.canAccessPage(
    user, 
    requiredPermissions, 
    requiredRoles
  );
  return result.canAccess;
};

/**
 * الحصول على صلاحيات المستخدم
 */
export const getUserPermissions = (role: UserRole): Permission[] => {
  return defaultPermissionManager.getRolePermissions(role);
};

/**
 * الحصول على اسم الصلاحية
 */
export const getPermissionName = (permission: Permission): string => {
  return defaultPermissionManager.getPermissionDisplayName(permission);
}; 
/**
 * 🛡️ Frontend Auth Guard - نظام حماية الفرونت إند المتطور
 * =======================================================
 * 
 * 🎯 **الهدف:** نظام حماية شامل للطرق والمكونات مع تكامل كامل مع Backend
 * 🔒 **الوظائف:** حماية متقدمة، إدارة صلاحيات ذكية، مراقبة الجلسات
 * 🌐 **التكامل:** متوافق مع AuthenticationMiddleware (502 سطر) في الباك إند
 * 
 * 📅 تاريخ الإنشاء: يونيو 2025
 * 👨‍💻 المطور: علي جودت
 * 🔗 مراجع: auth.ts (314 سطر), users.ts (143 سطر), frontend-permission-manager.ts (726 سطر)
 */

// ======================================
// 📥 الاستيرادات الأساسية من أنواع Depth Studio
// ======================================

import { 
  User,              // 👤 نوع المستخدم الأساسي - يحتوي على جميع بيانات المستخدم (الأدوار، الحالة، الصلاحيات)
  AuthSessionState,  // 🔐 حالة جلسة المصادقة - تتبع المستخدم المصادق وحالة الجلسة الحالية
  UserPermissions,   // 🛡️ صلاحيات المستخدم المخصصة - صلاحيات إضافية مخصصة للمستخدم خارج الدور الأساسي
  FirebaseTimestamp  // ⏰ نوع الطابع الزمني من Firebase - للتوافق مع قاعدة البيانات
} from '@depth-studio/types';

// ======================================
// 📊 التعدادات والحالات من الأنواع الأساسية
// ======================================

import { 
  UserRole,   // 🎭 أدوار المستخدم - (super_admin, photographer, brand_coordinator, marketing_coordinator, new_user)
  UserStatus  // 📊 حالات المستخدم - (pending_role_setup, pending_approval, active, suspended, archived)
} from '@depth-studio/types';

// ======================================
// 🔧 مدير الصلاحيات والدوال المساعدة
// ======================================

import { 
  FrontendPermissionManager,           // 🏛️ مدير الصلاحيات الرئيسي - يدير فحص الصلاحيات والأدوار
  Permission,                          // 🔑 نوع الصلاحيات - (users:read, content:approve, campaigns:manage, إلخ)
  hasPermission,                       // ✅ دالة فحص الصلاحية - فحص إذا كان المستخدم لديه صلاحية محددة
  hasRole as permissionManagerHasRole, // 🎯 دالة فحص الدور - تم إعادة تسمية لتجنب التضارب مع دالتنا المحلية
  canAccessPage                        // 📄 دالة فحص الوصول للصفحة - فحص الوصول لصفحة حسب الصلاحيات والأدوار
} from './frontend-permission-manager';

// ======================================
// 🎯 واجهات الحماية - تعريف خيارات وقواعد الحماية
// ======================================

/**
 * 🔧 خيارات حماية الطرق - يحدد قواعد الوصول للطرق والصفحات
 * 
 * **الاستخدام:** تمرر هذه الخيارات لـ checkRouteAccess() لتحديد شروط الوصول
 * **مثال:** { requireAuth: true, allowedRoles: ['photographer'], requiredPermissions: ['content:read'] }
 */
export interface RouteProtectionOptions {
  requireAuth?: boolean;                 // 🔐 هل يتطلب مصادقة المستخدم أولاً
  allowedRoles?: UserRole[];            // 🎭 الأدوار المسموح لها بالوصول (photographer, admin, إلخ)
  requireVerification?: boolean;         // ✅ هل يتطلب تحقق البريد/الهاتف
  requireActiveStatus?: boolean;         // 🟢 هل يتطلب حالة نشطة (ليس محظور أو معلق)
  redirectTo?: string;                  // 🔄 مسار التوجيه المخصص عند رفض الوصول
  customCheck?: (user: User) => boolean; // 🧪 فحص مخصص إضافي (مثل فحص عضوية VIP)
  requiredPermissions?: Permission[];    // 🔑 الصلاحيات المحددة المطلوبة للوصول
  userPermissions?: UserPermissions | null; // 🛡️ صلاحيات المستخدم المخصصة الإضافية
}

/**
 * 📊 نتيجة فحص الحماية - تحتوي على تفاصيل شاملة لنتيجة فحص الوصول
 * 
 * **الغرض:** إرجاع معلومات مفصلة عن سبب السماح/الرفض مع إرشادات للمطور والمستخدم
 * **مثال الاستخدام:** 
 * ```typescript
 * const result = authGuard.checkRouteAccess('/admin', user);
 * if (!result.allowed) {
 *   console.log(result.reason); // "تحتاج صلاحية users:manage"
 *   router.push(result.redirectPath); // "/unauthorized"
 * }
 * ```
 */
export interface ProtectionCheckResult {
  allowed: boolean;                     // 🚦 هل الوصول مسموح أم لا
  reason?: string;                      // 📝 سبب الرفض بالعربية (للعرض للمستخدم)
  redirectPath?: string;                // 🔄 مسار التوجيه المقترح عند الرفض
  userInfo?: User | null;              // 👤 بيانات المستخدم الذي تم فحصه
  checkedPermissions?: Permission[];    // 🔍 قائمة الصلاحيات التي تم فحصها
  missingPermissions?: Permission[];    // ❌ الصلاحيات المفقودة (سبب الرفض)
}

/** إعدادات Auth Guard */
export interface AuthGuardConfig {
  publicRoutes: string[];               // الطرق العامة
  protectedRoutes: string[];            // الطرق المحمية
  roleBasedRoutes: Record<string, UserRole[]>; // طرق حسب الأدوار
  permissionBasedRoutes: Record<string, Permission[]>; // طرق حسب الصلاحيات
  redirects: {                          // توجيهات مخصصة
    unauthorized: string;               // غير مخول
    unauthenticated: string;           // غير مصادق
    roleSelection: string;             // اختيار دور
    verification: string;              // تحقق
  };
  sessionTimeout: number;               // انتهاء الجلسة (بالدقائق)
  enablePermissionChecks: boolean;      // تفعيل فحص الصلاحيات
}

/** معلومات الجلسة المحسنة */
export interface EnhancedSessionInfo {
  user: User | null;                    // بيانات المستخدم
  isValid: boolean;                     // هل الجلسة صحيحة
  expiresAt: Date | null;              // متى تنتهي
  lastActivity: Date | null;           // آخر نشاط
  permissions: Permission[];           // الصلاحيات
  role: UserRole | null;               // الدور الحالي
  status: UserStatus | null;           // حالة المستخدم
  customPermissions: UserPermissions | null; // الصلاحيات المخصصة
}

// ======================================
// 🛡️ الكلاس الرئيسي - Frontend Auth Guard
// ======================================

/**
 * 🏛️ كلاس Frontend Auth Guard - نظام الحماية الشامل للفرونت إند
 * 
 * **🎯 الهدف الرئيسي:**
 * - حماية الطرق والصفحات حسب الأدوار والصلاحيات
 * - إدارة جلسات المستخدمين مع انتهاء الصلاحية التلقائي
 * - فحص الصلاحيات المتقدم مع دعم UserPermissions المخصصة
 * - تكامل كامل مع Backend AuthenticationMiddleware
 * 
 * **🔧 الاستخدام:**
 * ```typescript
 * // إنشاء instance
 * const authGuard = new FrontendAuthGuard({
 *   sessionTimeout: 480, // 8 ساعات
 *   enablePermissionChecks: true
 * });
 * 
 * // فحص وصول
 * const result = authGuard.checkRouteAccess('/admin/users', user, {
 *   requiredPermissions: ['users:manage']
 * });
 * 
 * if (!result.allowed) {
 *   router.push(result.redirectPath);
 * }
 * ```
 * 
 * **🌟 الميزات:**
 * ✅ فحص الأدوار (Role-based Access Control)
 * ✅ فحص الصلاحيات (Permission-based Access Control) 
 * ✅ إدارة الجلسات مع Session Timeout
 * ✅ دعم الصلاحيات المخصصة (UserPermissions)
 * ✅ مراقبة النشاط التلقائية
 * ✅ تكامل مع FrontendPermissionManager
 * ✅ تطابق كامل مع Backend AuthenticationMiddleware
 */
export class FrontendAuthGuard {
  private config: AuthGuardConfig;
  private sessionCheckInterval: NodeJS.Timeout | null = null;
  private readonly STORAGE_KEY = 'depth_auth_session';
  private permissionManager: FrontendPermissionManager;

  constructor(config?: Partial<AuthGuardConfig>) {
    this.config = {
      publicRoutes: [
        '/',
        '/login',
        '/register',
        '/phone-login',
        '/about',
        '/contact'
      ],
      protectedRoutes: [
        '/dashboard',
        '/profile',
        '/settings'
      ],
      roleBasedRoutes: {
        '/admin': ['super_admin'],
        '/photographer': ['photographer'],
        '/brand': ['brand_coordinator'],
        '/marketing': ['marketing_coordinator'],
        '/campaigns': ['super_admin', 'brand_coordinator', 'marketing_coordinator'],
        '/content': ['super_admin', 'photographer', 'brand_coordinator'],
        '/equipment': ['super_admin', 'photographer'],
        '/payments': ['super_admin', 'photographer'],
        '/analytics': ['super_admin', 'brand_coordinator', 'marketing_coordinator']
      },
      permissionBasedRoutes: {
        '/admin/users': ['users:manage', 'system:admin'],
        '/admin/brands': ['brands:manage'],
        '/admin/payments': ['payments:approve'],
        '/content/approve': ['content:approve'],
        '/reports': ['reports:read', 'reports:generate']
      },
      redirects: {
        unauthorized: '/unauthorized',
        unauthenticated: '/login',
        roleSelection: '/role-setup',
        verification: '/verify'
      },
      sessionTimeout: 480, // 8 ساعات - متطابق مع Backend
      enablePermissionChecks: true,
      ...config
    };

    // تهيئة مدير الصلاحيات
    this.permissionManager = new FrontendPermissionManager();

    this.initializeSessionMonitoring();
  }

  // ======================================
  // 🔍 فحص الصلاحيات الأساسي
  // ======================================

  /**
   * 🔍 فحص صلاحيات الوصول لطريق معين - الدالة الرئيسية للحماية
   * 
   * **🎯 الهدف:** فحص شامل لجميع شروط الوصول للطريق المحدد
   * 
   * **📋 خطوات الفحص بالترتيب:**
   * 1. 🌐 فحص إذا كان طريق عام (public route)
   * 2. 🔐 فحص المصادقة المطلوبة (authentication required)
   * 3. 🟢 فحص حالة المستخدم النشطة (active status)
   * 4. ✅ فحص التحقق المطلوب (verification required)
   * 5. 🎭 فحص اختيار الدور (role selection)
   * 6. 👑 فحص الأدوار المسموحة (allowed roles)
   * 7. 🔑 فحص الصلاحيات المطلوبة (required permissions) - يستخدم hasPermission()
   * 8. 📄 فحص الوصول للصفحة (page access) - يستخدم canAccessPage()
   * 9. 🧪 فحص مخصص إضافي (custom checks)
   * 
   * **💡 استخدام الاستيرادات:**
   * - hasPermission() → فحص صلاحية محددة للمستخدم
   * - canAccessPage() → فحص مجموعة صلاحيات للصفحة
   * - UserPermissions → دعم الصلاحيات المخصصة الإضافية
   * - Permission[] → نوع الصلاحيات المطلوبة
   * 
   * @param pathname - مسار الطريق المراد فحصه (مثل '/admin/users')
   * @param user - بيانات المستخدم (User | null)
   * @param options - خيارات الحماية الإضافية (RouteProtectionOptions)
   * @returns نتيجة فحص مفصلة (ProtectionCheckResult) تحتوي على allowed, reason, redirectPath, etc.
   */
  checkRouteAccess(
    pathname: string, 
    user: User | null,
    options: RouteProtectionOptions = {}
  ): ProtectionCheckResult {
    // فحص الطرق العامة
    if (this.isPublicRoute(pathname)) {
      return {
        allowed: true,
        userInfo: user,
        checkedPermissions: []
      };
    }

    // فحص المصادقة المطلوبة
    if (options.requireAuth !== false && !user) {
      return {
        allowed: false,
        reason: 'المصادقة مطلوبة للوصول لهذه الصفحة',
        redirectPath: this.config.redirects.unauthenticated,
        checkedPermissions: []
      };
    }

    // إذا لم يكن هناك مستخدم للفحوصات التالية
    if (!user) {
      return { 
        allowed: true, 
        userInfo: null,
        checkedPermissions: []
      };
    }

    // فحص حالة المستخدم
    if (options.requireActiveStatus !== false && user.status !== 'active') {
      return {
        allowed: false,
        reason: 'حسابك غير نشط، يرجى التواصل مع الإدارة',
        redirectPath: '/account-suspended',
        userInfo: user,
        checkedPermissions: []
      };
    }

    // فحص التحقق المطلوب
    if (options.requireVerification !== false && !user.is_verified) {
      return {
        allowed: false,
        reason: 'يجب تحقق حسابك أولاً',
        redirectPath: this.config.redirects.verification,
        userInfo: user,
        checkedPermissions: []
      };
    }

    // فحص اختيار الدور
    if (!user.primary_role || user.primary_role === 'new_user') {
      return {
        allowed: false,
        reason: 'يجب اختيار دورك في النظام أولاً',
        redirectPath: this.config.redirects.roleSelection,
        userInfo: user,
        checkedPermissions: []
      };
    }

    // فحص الأدوار المسموحة للطريق
    const requiredRoles = this.getRequiredRolesForRoute(pathname);
    if (requiredRoles.length > 0 && !requiredRoles.includes(user.primary_role)) {
      return {
        allowed: false,
        reason: 'ليس لديك صلاحية للوصول لهذه الصفحة',
        redirectPath: this.config.redirects.unauthorized,
        userInfo: user,
        checkedPermissions: []
      };
    }

    // فحص الأدوار من الخيارات
    if (options.allowedRoles && 
        options.allowedRoles.length > 0 && 
        !options.allowedRoles.includes(user.primary_role)) {
      return {
        allowed: false,
        reason: 'دورك الحالي لا يسمح بالوصول لهذا المحتوى',
        redirectPath: this.config.redirects.unauthorized,
        userInfo: user,
        checkedPermissions: []
      };
    }

    // فحص الصلاحيات المطلوبة باستخدام hasPermission المستورد
    let checkedPermissions: Permission[] = [];
    const missingPermissions: Permission[] = [];

    if (this.config.enablePermissionChecks) {
      // فحص الصلاحيات المطلوبة للطريق
      const requiredPermissions = this.getRequiredPermissionsForRoute(pathname);
      
      // دمج الصلاحيات من الخيارات
      if (options.requiredPermissions) {
        requiredPermissions.push(...options.requiredPermissions);
      }

      if (requiredPermissions.length > 0) {
        checkedPermissions = requiredPermissions;
        
                 for (const permission of requiredPermissions) {
           if (!hasPermission(user, permission, options.userPermissions ?? null)) {
             missingPermissions.push(permission);
           }
         }

        if (missingPermissions.length > 0) {
          return {
            allowed: false,
            reason: `تحتاج الصلاحيات التالية: ${missingPermissions.join(', ')}`,
            redirectPath: this.config.redirects.unauthorized,
            userInfo: user,
            checkedPermissions,
            missingPermissions
          };
        }
      }

      // فحص الوصول للصفحة باستخدام canAccessPage المستورد
      if (requiredPermissions.length > 0) {
        const pageAccess = canAccessPage(user, requiredPermissions, options.allowedRoles);
        if (!pageAccess) {
          return {
            allowed: false,
            reason: 'لا تملك الصلاحيات الكافية للوصول لهذه الصفحة',
            redirectPath: this.config.redirects.unauthorized,
            userInfo: user,
            checkedPermissions,
            missingPermissions: requiredPermissions
          };
        }
      }
    }

    // فحص مخصص - استخدام user parameter
    if (options.customCheck && !options.customCheck(user)) {
      return {
        allowed: false,
        reason: 'لا تستوفي شروط الوصول لهذا المحتوى',
        redirectPath: options.redirectTo || this.config.redirects.unauthorized,
        userInfo: user,
        checkedPermissions
      };
    }

    return {
      allowed: true,
      userInfo: user,
      checkedPermissions
    };
  }

  /**
   * فحص صلاحيات دور محدد باستخدام permissionManagerHasRole
   */
  checkRolePermissions(userRole: UserRole, requiredRoles: UserRole[]): boolean {
    // إنشاء user مؤقت للفحص
    const tempUser: User = {
      id: 'temp',
      email: 'temp@temp.com',
      full_name: 'Temp User',
      role: userRole,
      primary_role: userRole,
      status: 'active',
      is_verified: true,
      auth_methods: [],
      registration_method: 'email',
      phone_verified: false,
      role_selected: true,
      role_selection_history: [],
      google_linked: false,
      permissions: [],
      preferences: {
        language: 'ar',
        notifications_enabled: true,
        email_notifications: true,
        sms_notifications: true,
        theme: 'light'
      },
      profile: {
        bio: '',
        avatar_url: '',
        social_links: {}
      },
             created_at: { seconds: Date.now() / 1000, nanoseconds: 0 } as FirebaseTimestamp,
       updated_at: { seconds: Date.now() / 1000, nanoseconds: 0 } as FirebaseTimestamp,
      is_active: true
    };

    return permissionManagerHasRole(tempUser, requiredRoles);
  }

  /**
   * فحص صلاحيات عملية محددة باستخدام hasPermission
   */
  checkOperationPermission(
    user: User | null, 
    operation: Permission,
    userPermissions?: UserPermissions | null
  ): boolean {
    if (!user || !user.primary_role || user.primary_role === 'new_user') {
      return false;
    }

    return hasPermission(user, operation, userPermissions);
  }

  // ======================================
  // 🔐 إدارة الجلسة مع UserPermissions
  // ======================================

  /**
   * التحقق من صحة الجلسة مع دعم UserPermissions
   */
  validateSession(
    sessionState: AuthSessionState, 
    userPermissions?: UserPermissions | null
  ): EnhancedSessionInfo {
    // فحص وجود المستخدم والمصادقة
    if (!sessionState.user || !sessionState.isAuthenticated) {
      return {
        user: null,
        isValid: false,
        expiresAt: null,
        lastActivity: null,
        permissions: [],
        role: null,
        status: null,
        customPermissions: null
      };
    }

    // فحص انتهاء الجلسة
    const lastActivity = this.getLastActivity();
    if (lastActivity && this.isSessionExpired(lastActivity)) {
      return {
        user: sessionState.user,
        isValid: false,
        expiresAt: new Date(lastActivity.getTime() + (this.config.sessionTimeout * 60000)),
        lastActivity,
        permissions: [],
        role: sessionState.user.primary_role || null,
        status: sessionState.user.status,
        customPermissions: userPermissions ?? null
      };
    }

    // جلسة صحيحة مع جمع الصلاحيات
    const permissions = sessionState.user.primary_role && sessionState.user.primary_role !== 'new_user' ? 
      this.getRolePermissions(sessionState.user.primary_role) : [];

    return {
      user: sessionState.user,
      isValid: true,
      expiresAt: lastActivity ? 
        new Date(lastActivity.getTime() + (this.config.sessionTimeout * 60000)) : null,
      lastActivity,
      permissions,
      role: sessionState.user.primary_role || null,
      status: sessionState.user.status,
      customPermissions: userPermissions ?? null
    };
  }

  /**
   * تحديث نشاط الجلسة
   */
  updateSessionActivity(): void {
    const now = new Date();
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${this.STORAGE_KEY}_activity`, now.toISOString());
    }
  }

  /**
   * مسح بيانات الجلسة
   */
  clearSession(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`${this.STORAGE_KEY}_activity`);
      localStorage.removeItem('depth-auth-storage');
    }
  }

  // ======================================
  // 🎯 مساعدات الأدوار والصلاحيات
  // ======================================

  /**
   * فحص دور Super Admin
   */
  isSuperAdmin(user: User | null): boolean {
    return user?.primary_role === 'super_admin';
  }

  /**
   * فحص دور المصور
   */
  isPhotographer(user: User | null): boolean {
    return user?.primary_role === 'photographer';
  }

  /**
   * فحص دور منسق البراند
   */
  isBrandCoordinator(user: User | null): boolean {
    return user?.primary_role === 'brand_coordinator';
  }

  /**
   * فحص دور منسق التسويق
   */
  isMarketingCoordinator(user: User | null): boolean {
    return user?.primary_role === 'marketing_coordinator';
  }

  /**
   * فحص إذا كان منسق (أي نوع)
   */
  isCoordinator(user: User | null): boolean {
    return this.isBrandCoordinator(user) || this.isMarketingCoordinator(user);
  }

  /**
   * فحص إذا كان له صلاحيات إدارية
   */
  hasAdminAccess(user: User | null): boolean {
    return this.isSuperAdmin(user) || this.isCoordinator(user);
  }

  /**
   * فحص إذا كان مستخدم جديد يحتاج اختيار دور
   */
  needsRoleSelection(user: User | null): boolean {
    return !user?.primary_role || user.primary_role === 'new_user';
  }

  // ======================================
  // 🔧 دوال مساعدة داخلية
  // ======================================

  /**
   * فحص إذا كان الطريق عام
   */
  private isPublicRoute(pathname: string): boolean {
    return this.config.publicRoutes.some(route => {
      // دعم wildcards
      if (route.endsWith('/*')) {
        return pathname.startsWith(route.slice(0, -2));
      }
      return pathname === route || pathname.startsWith(route + '/');
    });
  }

  /**
   * جلب الأدوار المطلوبة لطريق
   */
  private getRequiredRolesForRoute(pathname: string): UserRole[] {
    for (const [routePattern, roles] of Object.entries(this.config.roleBasedRoutes)) {
      if (pathname.startsWith(routePattern)) {
        return roles;
      }
    }
    return [];
  }

  /**
   * جلب الصلاحيات المطلوبة لطريق - استخدام Permission type
   */
  private getRequiredPermissionsForRoute(pathname: string): Permission[] {
    for (const [routePattern, permissions] of Object.entries(this.config.permissionBasedRoutes)) {
      if (pathname.startsWith(routePattern)) {
        return permissions;
      }
    }
    return [];
  }

  /**
   * جلب صلاحيات دور محدد - إرجاع Permission[]
   */
  private getRolePermissions(role: UserRole): Permission[] {
    const permissions: Record<Exclude<UserRole, 'new_user'>, Permission[]> = {
      super_admin: ['system:admin'], // جميع الصلاحيات
      photographer: [
        'content:read',
        'content:write',
        'equipment:read'
      ],
      brand_coordinator: [
        'content:read',
        'content:approve',
        'campaigns:read',
        'campaigns:write',
        'brands:read'
      ],
      marketing_coordinator: [
        'campaigns:read',
        'campaigns:write',
        'content:read',
        'reports:read'
      ]
    };

    // التعامل مع new_user
    if (role === 'new_user') {
      return [];
    }

    return permissions[role] || [];
  }

  /**
   * جلب آخر نشاط للجلسة
   */
  private getLastActivity(): Date | null {
    if (typeof window === 'undefined') return null;
    
    const activityString = localStorage.getItem(`${this.STORAGE_KEY}_activity`);
    return activityString ? new Date(activityString) : null;
  }

  /**
   * فحص انتهاء الجلسة
   */
  private isSessionExpired(lastActivity: Date): boolean {
    const now = new Date();
    const timeoutMs = this.config.sessionTimeout * 60 * 1000; // تحويل لميلي ثانية
    return (now.getTime() - lastActivity.getTime()) > timeoutMs;
  }

  /**
   * تهيئة مراقبة الجلسة
   */
  private initializeSessionMonitoring(): void {
    if (typeof window === 'undefined') return;

    // تحديث النشاط عند التفاعل
    const updateActivity = () => this.updateSessionActivity();
    
    window.addEventListener('click', updateActivity);
    window.addEventListener('keypress', updateActivity);
    window.addEventListener('scroll', updateActivity);

    // فحص دوري للجلسة (كل دقيقة)
    this.sessionCheckInterval = setInterval(() => {
      const lastActivity = this.getLastActivity();
      if (lastActivity && this.isSessionExpired(lastActivity)) {
        this.clearSession();
        // يمكن إضافة callback للتوجيه أو إشعار المستخدم
        window.dispatchEvent(new CustomEvent('sessionExpired'));
      }
    }, 60000); // كل دقيقة
  }

  /**
   * تنظيف الموارد
   */
  cleanup(): void {
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
      this.sessionCheckInterval = null;
    }

    if (typeof window !== 'undefined') {
      window.removeEventListener('click', this.updateSessionActivity);
      window.removeEventListener('keypress', this.updateSessionActivity);
      window.removeEventListener('scroll', this.updateSessionActivity);
    }
  }
}

// ======================================
// 🏭 Factory Functions
// ======================================

/**
 * إنشاء Auth Guard مع إعدادات افتراضية
 */
export const createAuthGuard = (config?: Partial<AuthGuardConfig>): FrontendAuthGuard => {
  return new FrontendAuthGuard(config);
};

/**
 * Auth Guard افتراضي للاستخدام العام
 */
export const defaultAuthGuard = createAuthGuard();

// ======================================
// 🪝 Utility Functions - تم إعادة تسمية hasRole لتجنب التضارب
// ======================================

/**
 * فحص سريع للمصادقة
 */
export const isAuthenticated = (sessionState: AuthSessionState): boolean => {
  return sessionState.isAuthenticated && !!sessionState.user;
};

/**
 * فحص سريع للدور - تمت إعادة تسمية لتجنب التضارب
 */
export const checkUserRole = (user: User | null, role: UserRole): boolean => {
  return user?.primary_role === role;
};

/**
 * فحص سريع لأي من الأدوار
 */
export const hasAnyRole = (user: User | null, roles: UserRole[]): boolean => {
  return user?.primary_role ? roles.includes(user.primary_role) : false;
};

/**
 * فحص سريع للحالة النشطة
 */
export const isActiveUser = (user: User | null): boolean => {
  return user?.status === 'active' && user?.is_verified;
};

/**
 * الحصول على اسم الدور بالعربية
 */
export const getRoleDisplayName = (role: UserRole): string => {
  const roleNames: Record<UserRole, string> = {
    super_admin: 'المدير العام',
    photographer: 'مصور',
    brand_coordinator: 'منسق براند',
    marketing_coordinator: 'منسق تسويق',
    new_user: 'مستخدم جديد'
  };

  return roleNames[role] || role;
};

/**
 * جلب لون الدور للعرض
 */
export const getRoleColor = (role: UserRole): string => {
  const roleColors: Record<UserRole, string> = {
    super_admin: '#e11d48', // أحمر
    photographer: '#059669', // أخضر
    brand_coordinator: '#3b82f6', // أزرق
    marketing_coordinator: '#7c3aed', // بنفسجي
    new_user: '#6b7280' // رمادي
  };

  return roleColors[role] || '#6b7280';
};

// ======================================
// 📚 دليل الاستخدام الشامل والفوائد
// ======================================

/**
 * 🎯 **ملخص فوائد Frontend Auth Guard:**
 * 
 * **🛡️ 1. الحماية الشاملة:**
 * - حماية الطرق حسب الأدوار (photographer, admin, brand_coordinator)
 * - حماية الصفحات حسب الصلاحيات (users:manage, content:approve)
 * - فحص حالة المستخدم (active, verified, role_selected)
 * - منع الوصول غير المخول مع توجيه تلقائي
 * 
 * **🔗 2. التكامل المتقدم:**
 * - متطابق 100% مع Backend AuthenticationMiddleware (502 سطر)
 * - يستخدم نفس User interface من @depth-studio/types
 * - متكامل مع FrontendPermissionManager (726 سطر)
 * - دعم كامل للـ UserPermissions المخصصة
 * 
 * **⚡ 3. الأداء والكفاءة:**
 * - فحص سريع للطرق العامة بدون معالجة إضافية
 * - تخزين إعدادات الحماية في الذاكرة
 * - مراقبة نشاط الجلسة بكفاءة (كل دقيقة)
 * - تنظيف تلقائي للموارد عند انتهاء الاستخدام
 * 
 * **🎨 4. تجربة المستخدم:**
 * - رسائل خطأ واضحة بالعربية
 * - توجيه ذكي حسب سبب الرفض (login, verification, role-setup)
 * - معلومات مفصلة للمطورين (checkedPermissions, missingPermissions)
 * - دعم الفحوصات المخصصة (customCheck functions)
 * 
 * **🔧 5. سهولة الاستخدام:**
 * ```typescript
 * // مثال بسيط - فحص وصول
 * const result = defaultAuthGuard.checkRouteAccess('/admin', user);
 * if (!result.allowed) {
 *   router.push(result.redirectPath);
 *   toast.error(result.reason);
 * }
 * 
 * // مثال متقدم - فحص صلاحيات محددة
 * const canManageUsers = defaultAuthGuard.checkOperationPermission(
 *   user, 
 *   'users:manage', 
 *   customPermissions
 * );
 * 
 * // مثال إدارة الجلسة
 * const sessionInfo = defaultAuthGuard.validateSession(authState, userPermissions);
 * if (!sessionInfo.isValid) {
 *   // الجلسة منتهية - توجيه للدخول
 *   authStore.signOut();
 * }
 * ```
 * 
 * **📊 6. التتبع والمراقبة:**
 * - تتبع الصلاحيات المفحوصة والمفقودة
 * - مراقبة نشاط الجلسة التلقائية
 * - معلومات مفصلة للتشخيص والتطوير
 * - دعم events مخصصة (sessionExpired)
 * 
 * **🌟 7. المرونة والتوسع:**
 * - دعم إعدادات مخصصة لكل تطبيق
 * - إمكانية إضافة فحوصات مخصصة
 * - دعم الطرق الديناميكية مع wildcards
 * - تكامل سهل مع Next.js middleware
 * 
 * **🔒 8. الأمان المتقدم:**
 * - فحص متعدد المستويات (auth → status → role → permissions)
 * - دعم الصلاحيات الهجينة (role + custom permissions)
 * - انتهاء جلسة تلقائي لمنع الوصول غير المخول
 * - تطابق كامل مع معايير الأمان في Backend
 * 
 * **🚀 النتيجة:**
 * نظام حماية متكامل وقوي يضمن أمان التطبيق مع تجربة مستخدم ممتازة
 * ومرونة عالية للمطورين مع تكامل كامل مع البنية التحتية الموجودة.
 */ 
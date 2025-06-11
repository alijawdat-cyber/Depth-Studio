'use client';

import React, { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/auth.store';
import { UserRole, User } from '@depth-studio/types';
import { Permission } from '@/security/frontend-permission-manager';
import { createAuthGuard, RouteProtectionOptions, ProtectionCheckResult } from '@/security/frontend-auth-guard';

// ======================================
// 📦 استيراد نظام الحماية المتقدم
// ======================================

// 🔧 createAuthGuard: إنشاء instance من نظام الحماية المتقدم
// 📋 الفائدة: حماية شاملة مع تكامل Backend AuthenticationMiddleware
// 🎯 المميزات: Role-based + Permission-based + Session management

// ======================================
// 🏷️ أنواع البيانات
// ======================================

// 🔧 UserRole: أدوار المستخدمين للتحقق من الصلاحيات
// 🔧 User: نوع المستخدم للتحقق من البيانات

interface AuthWrapperProps {
  children: ReactNode;                          // المحتوى المراد حمايته
  requireAuth?: boolean;                        // هل يتطلب مصادقة (افتراضي: true)
  allowedRoles?: UserRole[];                   // الأدوار المسموح لها
  requiredPermissions?: Permission[];          // الصلاحيات المطلوبة
  requireVerification?: boolean;               // هل يتطلب تحقق الهاتف/البريد
  requireActiveStatus?: boolean;               // هل يتطلب حالة نشطة
  fallback?: ReactNode;                        // عنصر بديل أثناء التحميل
  unauthorizedFallback?: ReactNode;            // عنصر عند رفض الوصول
  redirectTo?: string;                         // مسار مخصص للتوجيه
  customCheck?: (user: User) => boolean;       // فحص مخصص إضافي
  onAccessDenied?: (result: ProtectionCheckResult) => void; // callback عند رفض الوصول
  enableLogging?: boolean;                     // تفعيل سجل الحماية
}

/**
 * 🛡️ AuthWrapper - مكون الحماية المركزي
 * ========================================
 * 
 * 🎯 **الهدف:** توفير حماية مركزية لجميع المكونات والصفحات
 * 🔒 **الوظائف:** تلقائياً يفحص المصادقة والأدوار والصلاحيات
 * 🚀 **الفوائد:** يزيل تكرار كود الحماية من layouts المختلفة
 * 
 * **🔧 الاستخدام البسيط:**
 * ```tsx
 * <AuthWrapper requireAuth={true}>
 *   <DashboardContent />
 * </AuthWrapper>
 * ```
 * 
 * **🎭 الاستخدام مع الأدوار:**
 * ```tsx
 * <AuthWrapper 
 *   allowedRoles={['super_admin', 'photographer']}
 *   requiredPermissions={['content:read', 'content:approve']}
 * >
 *   <ContentManagement />
 * </AuthWrapper>
 * ```
 * 
 * **⚡ مميزات متقدمة:**
 * ```tsx
 * <AuthWrapper 
 *   requireAuth={true}
 *   requireVerification={true}
 *   requireActiveStatus={true}
 *   customCheck={(user) => user.subscription === 'premium'}
 *   onAccessDenied={(result) => analytics.track('access_denied', result)}
 *   fallback={<Loading />}
 *   unauthorizedFallback={<UnauthorizedPage />}
 * >
 *   <PremiumFeature />
 * </AuthWrapper>
 * ```
 */
export default function AuthWrapper({
  children,
  requireAuth = true,
  allowedRoles,
  requiredPermissions,
  requireVerification = false,
  requireActiveStatus = true,
  fallback,
  unauthorizedFallback,
  redirectTo,
  customCheck,
  onAccessDenied,
  enableLogging = false
}: AuthWrapperProps) {
  // ======================================
  // 🔐 إدارة حالة المصادقة
  // ======================================
  
  const { user, isLoading } = useAuth();
  const router = useRouter();
  
  // ======================================
  // 🛡️ إعداد نظام الحماية
  // ======================================
  
  const [authGuard] = useState(() => createAuthGuard({
    sessionTimeout: 480, // 8 ساعات
    enablePermissionChecks: true,
    redirects: {
      unauthorized: '/unauthorized',
      unauthenticated: '/auth/login', 
      roleSelection: '/role-setup',
      verification: '/verify'
    }
  }));
  
  // ======================================
  // 🔍 فحص الحماية والوصول
  // ======================================
  
  const [protectionResult, setProtectionResult] = useState<ProtectionCheckResult | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  
  useEffect(() => {
    const checkAccess = () => {
      // إذا التحميل مازال جاري، انتظر
      if (isLoading) {
        setIsChecking(true);
        return;
      }
      
      // إعداد خيارات الحماية
      const options: RouteProtectionOptions = {
        requireAuth,
        allowedRoles,
        requiredPermissions,
        requireVerification,
        requireActiveStatus,
        redirectTo,
        customCheck
      };
      
      // فحص الوصول باستخدام AuthGuard
      const currentPath = window.location.pathname;
      const result = authGuard.checkRouteAccess(currentPath, user, options);
      
      // تسجيل النتيجة إذا مفعل
      if (enableLogging) {
        console.log('🛡️ AuthWrapper Check:', {
          path: currentPath,
          user: user?.full_name || 'غير مصادق',
          role: user?.role || 'لا يوجد',
          result: result.allowed ? '✅ مسموح' : '❌ مرفوض',
          reason: result.reason || 'لا يوجد',
          options
        });
      }
      
      setProtectionResult(result);
      setIsChecking(false);
      
      // تنفيذ callback عند رفض الوصول
      if (!result.allowed && onAccessDenied) {
        onAccessDenied(result);
      }
      
      // التوجيه التلقائي إذا مرفوض ولديه مسار
      if (!result.allowed && result.redirectPath) {
        router.push(result.redirectPath);
      }
    };
    
    checkAccess();
  }, [
    user, 
    isLoading, 
    requireAuth,
    allowedRoles,
    requiredPermissions,
    requireVerification,
    requireActiveStatus,
    redirectTo,
    customCheck,
    onAccessDenied,
    enableLogging,
    authGuard,
    router
  ]);
  
  // ======================================
  // 🎨 عرض حالات مختلفة
  // ======================================
  
  // حالة التحميل الأولي
  if (isLoading || isChecking) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen bg-gray-50" dir="rtl">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 text-lg">جاري التحقق من الصلاحيات...</p>
            <p className="text-gray-500 text-sm">
              {requireAuth && 'فحص المصادقة'}
              {allowedRoles && ` • فحص الأدوار (${allowedRoles.length})`}
              {requiredPermissions && ` • فحص الصلاحيات (${requiredPermissions.length})`}
            </p>
          </div>
        </div>
      )
    );
  }
  
  // حالة رفض الوصول
  if (protectionResult && !protectionResult.allowed) {
    return (
      unauthorizedFallback || (
        <div className="flex items-center justify-center min-h-screen bg-gray-50" dir="rtl">
          <div className="max-w-md mx-auto text-center p-8">
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              غير مخول للوصول
            </h1>
            
            <p className="text-gray-600 mb-6">
              {protectionResult.reason || 'ليس لديك الصلاحية للوصول لهذه الصفحة'}
            </p>
            
            {/* معلومات إضافية للمطورين */}
            {process.env.NODE_ENV === 'development' && protectionResult && (
              <div className="bg-gray-100 rounded-lg p-4 text-left text-xs mb-6">
                <p><strong>User:</strong> {protectionResult.userInfo?.full_name || 'غير مصادق'}</p>
                <p><strong>Role:</strong> {protectionResult.userInfo?.role || 'لا يوجد'}</p>
                <p><strong>Required Roles:</strong> {allowedRoles?.join(', ') || 'لا يوجد'}</p>
                <p><strong>Required Permissions:</strong> {requiredPermissions?.join(', ') || 'لا يوجد'}</p>
                {protectionResult.missingPermissions && protectionResult.missingPermissions.length > 0 && (
                  <p><strong>Missing:</strong> {protectionResult.missingPermissions.join(', ')}</p>
                )}
              </div>
            )}
            
            <div className="space-x-4 space-x-reverse">
              <button
                onClick={() => router.back()}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                العودة للخلف
              </button>
              
              <button
                onClick={() => router.push('/')}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                الصفحة الرئيسية
              </button>
            </div>
          </div>
        </div>
      )
    );
  }
  
  // حالة السماح - عرض المحتوى
  if (protectionResult && protectionResult.allowed) {
    return <>{children}</>;
  }
  
  // حالة احتياطية (لا يجب الوصول لها)
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50" dir="rtl">
      <div className="text-center">
        <p className="text-gray-600">حدث خطأ في نظام الحماية</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          إعادة تحميل الصفحة
        </button>
      </div>
    </div>
  );
}

// ======================================
// 🔧 مكونات مساعدة مخصصة
// ======================================

/**
 * 🛡️ AdminOnly - حماية للأدمن فقط
 */
export function AdminOnly({ children }: { children: ReactNode }) {
  return (
    <AuthWrapper 
      allowedRoles={['super_admin']}
      enableLogging={true}
    >
      {children}
    </AuthWrapper>
  );
}

/**
 * 📸 PhotographerOnly - حماية للمصور فقط
 */
export function PhotographerOnly({ children }: { children: ReactNode }) {
  return (
    <AuthWrapper 
      allowedRoles={['photographer']}
      requireVerification={true}
      enableLogging={true}
    >
      {children}
    </AuthWrapper>
  );
}

/**
 * 🏢 BrandCoordinatorOnly - حماية لمنسق البراند فقط
 */
export function BrandCoordinatorOnly({ children }: { children: ReactNode }) {
  return (
    <AuthWrapper 
      allowedRoles={['brand_coordinator']}
      requireVerification={true}
      enableLogging={true}
    >
      {children}
    </AuthWrapper>
  );
}

/**
 * 📈 MarketingCoordinatorOnly - حماية لمنسق التسويق فقط
 */
export function MarketingCoordinatorOnly({ children }: { children: ReactNode }) {
  return (
    <AuthWrapper 
      allowedRoles={['marketing_coordinator']}
      requireVerification={true}
      enableLogging={true}
    >
      {children}
    </AuthWrapper>
  );
}

/**
 * 🎭 CoordinatorsOnly - حماية للمنسقين (براند + تسويق)
 */
export function CoordinatorsOnly({ children }: { children: ReactNode }) {
  return (
    <AuthWrapper 
      allowedRoles={['brand_coordinator', 'marketing_coordinator']}
      requireVerification={true}
      enableLogging={true}
    >
      {children}
    </AuthWrapper>
  );
}

/**
 * ⚡ RequirePermission - حماية بالصلاحيات
 */
export function RequirePermission({ 
  children, 
  permissions 
}: { 
  children: ReactNode;
  permissions: Permission[];
}) {
  return (
    <AuthWrapper 
      requiredPermissions={permissions}
      enableLogging={true}
    >
      {children}
    </AuthWrapper>
  );
}

// ======================================
// 📋 ملخص AuthWrapper وفوائده
// ======================================

/**
 * 🎯 ملخص مكون AuthWrapper المتطور:
 * ===================================
 * 
 * ✅ **الفوائد المحققة:**
 * 
 * 🔐 **حماية مركزية شاملة:**
 *    - تكامل مع FrontendAuthGuard (877 سطر) للحماية المتقدمة
 *    - دعم Role-based و Permission-based access control
 *    - فحص تلقائي للمصادقة والتحقق والحالة النشطة
 *    - إزالة تكرار كود الحماية من جميع الـ layouts
 * 
 * 🎭 **مكونات متخصصة جاهزة:**
 *    - AdminOnly: حماية لصفحات الأدمن فقط
 *    - PhotographerOnly: حماية لصفحات المصور
 *    - BrandCoordinatorOnly: حماية لمنسقي البراند
 *    - MarketingCoordinatorOnly: حماية لمنسقي التسويق
 *    - CoordinatorsOnly: حماية للمنسقين عموماً
 *    - RequirePermission: حماية بالصلاحيات المحددة
 * 
 * 🚀 **مرونة عالية:**
 *    - خيارات تخصيص شاملة (requireAuth، allowedRoles، requiredPermissions)
 *    - دعم فحص مخصص مع customCheck function
 *    - إعدادات مخصصة للتوجيه والرسائل
 *    - تكامل مع onAccessDenied callbacks
 * 
 * 🎨 **تجربة مستخدم محسنة:**
 *    - شاشات تحميل مخصصة أثناء فحص الصلاحيات
 *    - صفحات خطأ واضحة مع إرشادات للمستخدم
 *    - معلومات مطور في development mode
 *    - أزرار تنقل ذكية (العودة، الرئيسية)
 * 
 * 🔧 **تكامل متقدم:**
 *    - ربط مع useAuth store للحصول على بيانات المستخدم
 *    - استخدام createAuthGuard للحماية المتقدمة
 *    - تسجيل اختياري للحماية (enableLogging)
 *    - توافق كامل مع Backend AuthenticationMiddleware
 * 
 * 💡 **النتيجة النهائية:**
 *    نظام حماية مركزي قوي يقلل التعقيد ويزيد الأمان
 *    مع تجربة مطور ممتازة ومرونة عالية للتخصيص
 */ 
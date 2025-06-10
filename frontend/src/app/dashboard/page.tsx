'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// ======================================
// 🏪 إدارة الحالة
// ======================================

import { useAuth } from '@/store/auth.store';
// 🔧 useAuth: جلب بيانات المستخدم ودوره للتوجيه المناسب
// 📋 الفائدة: توجيه تلقائي لوحة التحكم المناسبة حسب الدور

// ======================================
// 🏷️ أنواع البيانات
// ======================================

import { UserRole } from '@depth-studio/types';
// 🔧 UserRole: أنواع أدوار المستخدمين (super_admin, photographer, brand_coordinator, marketing_coordinator)
// 📋 المصدر: types/src/enums.ts - مُستخدم لتحديد التوجيه المناسب

/**
 * 🏠 صفحة Dashboard الرئيسية - Depth Studio
 * ==========================================
 * 
 * 🎯 الأهداف:
 * - توجيه ذكي للوحة التحكم المناسبة حسب دور المستخدم
 * - عرض إحصائيات عامة سريعة
 * - نقطة دخول موحدة لجميع الأدوار
 * - تجربة مستخدم سلسة مع loading states
 * 
 * 🔄 منطق التوجيه:
 * - super_admin → /dashboard/admin
 * - photographer → /dashboard/photographer  
 * - brand_coordinator → /dashboard/brand
 * - marketing_coordinator → /dashboard/marketing
 * - غير محدد → عرض اختيار الدور
 * 
 * 📋 المميزات:
 * - تحقق من المصادقة والدور
 * - توجيه تلقائي سريع
 * - معالجة حالات الخطأ
 * - تصميم loading مناسب
 */
export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    // انتظار انتهاء التحميل
    if (isLoading) return;

    // التحقق من المصادقة
    if (!isAuthenticated || !user) {
      router.push('/auth/login');
      return;
    }

    // التحقق من وجود دور للمستخدم
    if (!user.role) {
      // إذا لم يكن للمستخدم دور، توجيه لاختيار الدور
      router.push('/role-setup');
      return;
    }

    // التوجيه حسب الدور
    const roleRoutes: Partial<Record<UserRole, string>> = {
      super_admin: '/dashboard/admin',
      photographer: '/dashboard/photographer',
      brand_coordinator: '/dashboard/brand',
      marketing_coordinator: '/dashboard/marketing'
    };

    const targetRoute = roleRoutes[user.role];
    if (targetRoute) {
      console.log(`🎯 توجيه ${user.role} إلى: ${targetRoute}`);
      router.push(targetRoute);
    } else {
      // دور غير معروف، توجيه لاختيار الدور
      console.warn('⚠️ دور غير معروف:', user.role);
      router.push('/role-setup');
    }
  }, [isLoading, isAuthenticated, user, router]);

  // عرض loading أثناء التحقق والتوجيه
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-6">
        {/* Loading Animation */}
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
        </div>
        
        {/* Loading Messages */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">
            مرحباً بك في Depth Studio
          </h2>
          
          {isLoading ? (
            <p className="text-gray-600">
              جاري التحقق من بياناتك...
            </p>
          ) : user ? (
            <div className="space-y-1">
              <p className="text-gray-600">
                أهلاً وسهلاً، {user.full_name || user.email}
              </p>
              <p className="text-sm text-blue-600">
                جاري توجيهك للوحة التحكم المناسبة...
              </p>
            </div>
          ) : (
            <p className="text-gray-600">
              جاري التحقق من حالة تسجيل الدخول...
            </p>
          )}
        </div>

        {/* Quick Stats Preview (اختياري) */}
        {user && (
          <div className="grid grid-cols-2 gap-4 mt-8 max-w-md mx-auto">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {user.role === 'super_admin' ? '∞' : '12'}
              </div>
              <div className="text-sm text-gray-600">
                {user.role === 'super_admin' ? 'صلاحيات كاملة' : 'مهام نشطة'}
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {user.role === 'photographer' ? '8' : '24'}
              </div>
              <div className="text-sm text-gray-600">
                {user.role === 'photographer' ? 'مشاريع' : 'إشعارات'}
              </div>
            </div>
          </div>
        )}

        {/* Footer Info */}
        <div className="text-xs text-gray-400 mt-8">
          منصة إدارة التصوير والمحتوى الرقمي المتطورة
        </div>
      </div>
    </div>
  );
} 
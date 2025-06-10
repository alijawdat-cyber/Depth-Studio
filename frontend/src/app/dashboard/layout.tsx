'use client';

import { ReactNode } from 'react';
import { redirect } from 'next/navigation';

// ======================================
// 📦 استيراد مكونات Layout الموجودة
// ======================================

import { AppBar } from '@/components/layout/appbar';
// 🔧 AppBar: الشريط العلوي مع navigation وuser menu (122 سطر موجود)
// 📋 المميزات: notifications، user dropdown، responsive design

import { Sidebar } from '@/components/layout/sidebar';
// 🔧 Sidebar: القائمة الجانبية للتنقل (518 سطر موجود ومطور)
// 📋 المميزات: role-based navigation، dynamic menu، responsive design

import { Breadcrumb, BreadcrumbItem } from '@/components/ui/breadcrumb';
// 🔧 Breadcrumb: مسار التنقل التفاعلي (181 سطر موجود)
// 📋 المميزات: auto-generation، custom mapping، icons support

// ======================================
// 🏪 إدارة الحالة
// ======================================

import { useAuth } from '@/store/auth.store';
// 🔧 useAuth: التحقق من حالة المصادقة للوصول للوحة التحكم
// 📋 الفائدة: التأكد من أن المستخدم مُصادق قبل عرض Dashboard

import { useUIStore } from '@/store/ui.store';
// 🔧 useUIStore: إدارة حالة واجهة المستخدم (sidebar open/closed)
// 📋 التكامل: موجود في ui.store.ts (312 سطر) مع sidebar state management

// ======================================
// 🔐 حماية وتوجيه
// ======================================

import { useEffect, useMemo } from 'react';
import { usePathname } from 'next/navigation';

interface DashboardLayoutProps {
  children: ReactNode;
}

/**
 * Layout موحد لجميع صفحات لوحة التحكم
 * 
 * 🎯 الأهداف المحققة:
 * - ربط AppBar + Sidebar + Breadcrumb في layout واحد
 * - حماية المسارات والتأكد من المصادقة
 * - تصميم متجاوب للموبايل والديسكتوب
 * - إدارة حالة Sidebar (open/collapsed)
 * - دعم RTL للغة العربية
 * - تكامل مع auth system موجود
 * 
 * 🔧 التكامل مع المكونات الموجودة:
 * - AppBar: موجود ومكتمل (notifications + user menu)
 * - Sidebar: موجود لكن يحتاج تطوير role-based
 * - Breadcrumb: موجود ومتقدم
 * - UI Store: موجود مع sidebar state management
 * 
 * 📋 الخطوات التالية:
 * - تطوير Sidebar ليكون role-based (المهمة التالية)
 * - إضافة dashboard content للأدوار المختلفة
 * - تحسين responsive behavior
 */
export default function DashboardLayout({ children }: DashboardLayoutProps) {
  // ======================================
  // 🔐 التحقق من المصادقة
  // ======================================
  
  const { isAuthenticated, isLoading, user } = useAuth();
  
  // التحقق من المصادقة عند تحميل الصفحة
  useEffect(() => {
    // إذا انتهى التحميل والمستخدم غير مُصادق، توجيه لتسجيل الدخول
    if (!isLoading && !isAuthenticated) {
      redirect('/auth/login');
    }
  }, [isLoading, isAuthenticated]);
  
  // ======================================
  // 🎨 إدارة حالة UI
  // ======================================
  
  const { sidebarState, toggleSidebar } = useUIStore();
  const isSidebarOpen = sidebarState === 'open';
  
  // ======================================
  // 🧭 إعداد مسار التنقل (Breadcrumb)
  // ======================================
  
  const pathname = usePathname();
  
  // خريطة المسارات للعرض باللغة العربية
  const pathMapping = useMemo(() => ({
    '/dashboard': 'لوحة التحكم',
    '/dashboard/admin': 'إدارة النظام',
    '/dashboard/admin/users': 'إدارة المستخدمين',
    '/dashboard/admin/users/new': 'إضافة مستخدم',
    '/dashboard/admin/photographers': 'المصورين',
    '/dashboard/admin/brand-coordinators': 'منسقي البراند',
    '/dashboard/admin/marketing-coordinators': 'منسقي التسويق',
    '/dashboard/admin/analytics': 'إحصائيات النظام',
    '/dashboard/admin/reports': 'التقارير',
    '/dashboard/admin/reports/financial': 'التقارير المالية',
    '/dashboard/admin/reports/performance': 'تقارير الأداء',
    '/dashboard/admin/reports/projects': 'تقارير المشاريع',
    '/dashboard/photographer': 'لوحة المصور',
    '/dashboard/photographer/tasks': 'المهام',
    '/dashboard/photographer/tasks/current': 'المهام الحالية',
    '/dashboard/photographer/tasks/upcoming': 'المهام القادمة',
    '/dashboard/photographer/tasks/completed': 'المهام المكتملة',
    '/dashboard/photographer/portfolio': 'معرض الأعمال',
    '/dashboard/photographer/schedule': 'الجدول الزمني',
    '/dashboard/photographer/earnings': 'الأرباح',
    '/dashboard/photographer/profile': 'الملف الشخصي',
    '/dashboard/brand': 'لوحة البراند',
    '/dashboard/brand/campaigns': 'الحملات',
    '/dashboard/brand/campaigns/active': 'الحملات النشطة',
    '/dashboard/brand/campaigns/draft': 'المسودات',
    '/dashboard/brand/campaigns/completed': 'الحملات المكتملة',
    '/dashboard/brand/campaigns/new': 'إنشاء حملة',
    '/dashboard/brand/content': 'إدارة المحتوى',
    '/dashboard/brand/analytics': 'تحليلات البراند',
    '/dashboard/marketing': 'لوحة التسويق',
    '/dashboard/marketing/analytics': 'التحليلات التسويقية',
    '/dashboard/marketing/analytics/campaigns': 'أداء الحملات',
    '/dashboard/marketing/analytics/roi': 'عائد الاستثمار',
    '/dashboard/marketing/campaigns': 'إدارة الحملات',
    '/dashboard/marketing/reports': 'تقارير الأداء'
  }), []);
  
  // إنشاء عناصر Breadcrumb تلقائياً
  const breadcrumbItems = useMemo(() => {
    const paths = pathname.split('/').filter(Boolean);
    const items: BreadcrumbItem[] = [];
    
    let currentPath = '';
    
    paths.forEach((path, index) => {
      currentPath += `/${path}`;
      const isLast = index === paths.length - 1;
      
      // البحث عن تسمية مخصصة
      const label = (pathMapping as Record<string, string>)[currentPath] || 
                   path.charAt(0).toUpperCase() + path.slice(1);
      
      items.push({
        label,
        href: isLast ? undefined : currentPath,
        active: isLast
      });
    });
    
    return items;
  }, [pathname, pathMapping]);
  
  // عرض تحميل أثناء التحقق من المصادقة
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">جاري تحميل لوحة التحكم...</p>
        </div>
      </div>
    );
  }
  
  // إذا المستخدم غير مُصادق، لا تعرض أي شيء (redirect سيحدث)
  if (!isAuthenticated || !user) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* ======================================
          📱 AppBar - الشريط العلوي
          ====================================== */}
      <AppBar onMenuClick={toggleSidebar} />
      
      <div className="flex">
        {/* ======================================
            📋 Sidebar - القائمة الجانبية
            ====================================== */}
                 <Sidebar 
           isOpen={isSidebarOpen}
           onClose={() => useUIStore.getState().setSidebarState('closed')}
         />
        
        {/* ======================================
            📄 المحتوى الرئيسي
            ====================================== */}
        <main 
          className={`
            flex-1 transition-all duration-300 ease-in-out
            ${isSidebarOpen ? 'mr-64' : 'mr-0'}
            lg:${isSidebarOpen ? 'mr-64' : 'mr-16'}
          `}
        >
          {/* Container للمحتوى مع padding مناسب */}
          <div className="p-6 pt-20"> {/* pt-20 لترك مساحة للـ AppBar */}
            
            {/* ======================================
                🧭 مسار التنقل (Breadcrumb)
                ====================================== */}
            {breadcrumbItems.length > 1 && (
              <div className="mb-6">
                <Breadcrumb 
                  items={breadcrumbItems}
                  className="text-sm"
                  showHome={true}
                />
              </div>
            )}
            
            {/* ======================================
                🎯 محتوى الصفحة
                ====================================== */}
            <div className="bg-white rounded-lg shadow-sm min-h-[calc(100vh-140px)]">
              {children}
            </div>
          </div>
        </main>
      </div>
      
      {/* ======================================
          📱 Overlay للموبايل عند فتح Sidebar
          ====================================== */}
      {isSidebarOpen && (
                 <div 
           className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
           onClick={() => useUIStore.getState().setSidebarState('closed')}
         />
      )}
    </div>
  );
} 
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  FaHome, 
  FaUsers, 
  FaChartBar, 
  FaCog, 
  FaFileAlt, 
  FaShoppingCart,
  FaChevronDown,
  FaChevronRight,
  FaCamera,
  FaBullhorn,
  FaTasks,
  FaDollarSign,
  FaCalendarAlt,
  FaEye
} from 'react-icons/fa'
import clsx from 'clsx'

// ======================================
// 🏪 إدارة الحالة
// ======================================

import { useAuth } from '@/store/auth.store'
// 🔧 useAuth: جلب دور المستخدم لعرض القائمة المناسبة
// 📋 الفائدة: تخصيص navigation حسب صلاحيات كل دور

// ======================================
// 🏷️ أنواع البيانات
// ======================================

import { UserRole } from '@depth-studio/types'
// 🔧 UserRole: أنواع أدوار المستخدمين لتحديد القوائم المناسبة
// 📋 المصدر: types/src/enums.ts - مُستخدم في تخصيص menuItems

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

interface MenuItem {
  label: string
  href?: string
  icon: React.ReactNode
  children?: MenuItem[]
  roles?: UserRole[]  // 🔒 الأدوار المصرح لها بالوصول لهذا العنصر
}

/**
 * 🎯 دالة إنشاء قوائم التنقل حسب دور المستخدم
 * ==============================================
 * 
 * تقوم بإرجاع قائمة menuItems مخصصة لكل دور:
 * 
 * 🛡️ super_admin: إدارة شاملة للنظام (FaUsers, FaChartBar, FaCog)
 * 📸 photographer: مهام ومشاريع (FaCamera, FaTasks, FaDollarSign, FaCalendarAlt)  
 * 🏢 brand_coordinator: حملات ومحتوى (FaBullhorn, FaFileAlt, FaEye)
 * 📈 marketing_coordinator: تحليلات وتسويق (FaChartBar, FaEye, FaDollarSign)
 * 👤 new_user: قائمة محدودة للمستخدمين الجدد
 * 
 * 📋 كل icon مُستخدم حسب طبيعة الدور ومهامه
 * 🔗 المسارات تطابق dashboard routes المُنشأة مسبقاً
 */
const getMenuItemsByRole = (userRole: UserRole | null): MenuItem[] => {
  // ======================================
  // 🏠 القائمة الأساسية لجميع الأدوار
  // ======================================
  const baseItems: MenuItem[] = [
    {
      label: 'الرئيسية',
      href: '/dashboard',
      icon: <FaHome className="w-5 h-5" />, // 🏠 أيقونة البيت - متاحة للجميع
      roles: ['super_admin', 'photographer', 'brand_coordinator', 'marketing_coordinator', 'new_user']
    }
  ];

  // ======================================
  // 🛡️ قوائم الأدمن الشاملة
  // ======================================
  if (userRole === 'super_admin') {
    return [
      ...baseItems,
      {
        label: 'إدارة المستخدمين',
        icon: <FaUsers className="w-5 h-5" />, // 👥 أيقونة المستخدمين - إدارة الحسابات
        children: [
          { label: 'جميع المستخدمين', href: '/dashboard/admin/users', icon: <></> },
          { label: 'المصورين', href: '/dashboard/admin/photographers', icon: <></> },
          { label: 'منسقي البراند', href: '/dashboard/admin/brand-coordinators', icon: <></> },
          { label: 'منسقي التسويق', href: '/dashboard/admin/marketing-coordinators', icon: <></> },
          { label: 'إضافة مستخدم', href: '/dashboard/admin/users/new', icon: <></> }
        ]
      },
      {
        label: 'التقارير والإحصائيات',
        icon: <FaChartBar className="w-5 h-5" />, // 📊 أيقونة التقارير - تحليل البيانات
        children: [
          { label: 'تقارير المبيعات', href: '/dashboard/admin/reports/financial', icon: <></> },
          { label: 'تقارير الأداء', href: '/dashboard/admin/reports/performance', icon: <></> },
          { label: 'تقارير المشاريع', href: '/dashboard/admin/reports/projects', icon: <></> },
          { label: 'إحصائيات النظام', href: '/dashboard/admin/analytics', icon: <></> }
        ]
      },
      {
        label: 'إدارة البراندات',
        href: '/dashboard/admin/brands',
        icon: <FaShoppingCart className="w-5 h-5" /> // 🛒 أيقونة المنتجات - إدارة البراندات
      },
      {
        label: 'إدارة المحتوى',
        href: '/dashboard/admin/content',
        icon: <FaFileAlt className="w-5 h-5" /> // 📄 أيقونة الملفات - إدارة المحتوى
      },
      {
        label: 'إعدادات النظام',
        href: '/dashboard/admin/settings',
        icon: <FaCog className="w-5 h-5" /> // ⚙️ أيقونة الإعدادات - تكوين النظام
      }
    ];
  }

  // ======================================
  // 📸 قوائم المصور المتخصصة
  // ======================================
  if (userRole === 'photographer') {
    return [
      ...baseItems,
      {
        label: 'مهامي',
        icon: <FaTasks className="w-5 h-5" />, // ✅ أيقونة المهام - إدارة المهام المكلف بها
        children: [
          { label: 'المهام الحالية', href: '/dashboard/photographer/tasks/current', icon: <></> },
          { label: 'المهام القادمة', href: '/dashboard/photographer/tasks/upcoming', icon: <></> },
          { label: 'المهام المكتملة', href: '/dashboard/photographer/tasks/completed', icon: <></> },

        ]
      },
      {
        label: 'معرض أعمالي',
        href: '/dashboard/photographer/portfolio',
        icon: <FaCamera className="w-5 h-5" /> // 📷 أيقونة الكاميرا - عرض الأعمال المنجزة
      },
      {
        label: 'الجدول الزمني',
        href: '/dashboard/photographer/schedule',
        icon: <FaCalendarAlt className="w-5 h-5" /> // 📅 أيقونة التقويم - إدارة المواعيد
      },
      {
        label: 'الأرباح والمدفوعات',
        href: '/dashboard/photographer/earnings',
        icon: <FaDollarSign className="w-5 h-5" /> // 💰 أيقونة الدولار - متابعة الأرباح
      },
      {
        label: 'الملف الشخصي',
        href: '/dashboard/photographer/profile',
        icon: <FaCog className="w-5 h-5" /> // ⚙️ أيقونة الإعدادات - تحديث البيانات الشخصية
      }
    ];
  }

  // ======================================
  // 🏢 قوائم منسق البراند
  // ======================================
  if (userRole === 'brand_coordinator') {
    return [
      ...baseItems,
      {
        label: 'الحملات',
        icon: <FaBullhorn className="w-5 h-5" />, // 📢 أيقونة البوق - إدارة حملات البراند
        children: [
          { label: 'الحملات النشطة', href: '/dashboard/brand/campaigns/active', icon: <></> },
          { label: 'حملات قيد التطوير', href: '/dashboard/brand/campaigns/draft', icon: <></> },
          { label: 'الحملات المكتملة', href: '/dashboard/brand/campaigns/completed', icon: <></> },
          { label: 'إنشاء حملة جديدة', href: '/dashboard/brand/campaigns/new', icon: <></> }
        ]
      },
      {
        label: 'إدارة المحتوى',
        href: '/dashboard/brand/content',
        icon: <FaFileAlt className="w-5 h-5" /> // 📄 أيقونة الملفات - إدارة محتوى البراند
      },
      {
        label: 'تحليلات الأداء',
        href: '/dashboard/brand/analytics',
        icon: <FaEye className="w-5 h-5" /> // 👁️ أيقونة العين - مراقبة أداء الحملات
      },

    ];
  }

  // ======================================
  // 📈 قوائم منسق التسويق
  // ======================================
  if (userRole === 'marketing_coordinator') {
    return [
      ...baseItems,
      {
        label: 'التحليلات التسويقية',
        icon: <FaChartBar className="w-5 h-5" />, // 📊 أيقونة التقارير - تحليل البيانات التسويقية
        children: [
          { label: 'أداء الحملات', href: '/dashboard/marketing/analytics/campaigns', icon: <></> },

          { label: 'عائد الاستثمار', href: '/dashboard/marketing/analytics/roi', icon: <></> }
        ]
      },
      {
        label: 'إدارة الحملات',
        href: '/dashboard/marketing/campaigns',
        icon: <FaBullhorn className="w-5 h-5" /> // 📢 أيقونة البوق - إدارة الحملات التسويقية
      },

      {
        label: 'تقارير الأداء',
        href: '/dashboard/marketing/reports',
        icon: <FaEye className="w-5 h-5" /> // 👁️ أيقونة العين - مراقبة نتائج التسويق
      },

    ];
  }

  // ======================================
  // 👤 قائمة محدودة للمستخدمين الجدد
  // ======================================
  if (userRole === 'new_user' || !userRole) {
    return [
      ...baseItems,
      {
        label: 'اختيار الدور',
        href: '/role-setup',
        icon: <FaUsers className="w-5 h-5" /> // 👥 أيقونة المستخدمين - اختيار دور المستخدم
      },
      {
        label: 'الملف الشخصي',
        href: '/profile',
        icon: <FaCog className="w-5 h-5" /> // ⚙️ أيقونة الإعدادات - إدارة الحساب الشخصي
      }
    ];
  }

  // ======================================
  // 🚫 العودة للقائمة الأساسية في حالة دور غير معروف
  // ======================================
  return baseItems;
};

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  
  // ======================================
  // 🔐 جلب بيانات المستخدم والدور
  // ======================================
  
  const { user } = useAuth();
  // 🔧 useAuth: استخراج بيانات المستخدم من auth.store.ts
  // 📋 الفائدة: الحصول على user.role لتحديد القائمة المناسبة
  // 🔗 التوافق: يستخدم User interface من @depth-studio/types
  // 💡 يحتوي على: user.role (UserRole), user.full_name, user.email وغيرها
  
  const userRole = user?.role || null;
  // 🎭 استخراج دور المستخدم من بيانات المصادقة
  // 📋 الأدوار المتاحة: super_admin, photographer, brand_coordinator, marketing_coordinator, new_user
  // 🔒 في حالة عدم وجود user أو role، يُستخدم null للحصول على القائمة الأساسية
  
  // ======================================
  // 🎯 إنشاء قائمة التنقل حسب الدور
  // ======================================
  
  const menuItems = getMenuItemsByRole(userRole);
  // 🔧 getMenuItemsByRole: دالة ذكية تُرجع قائمة مخصصة حسب دور المستخدم
  // 📋 المدخل: UserRole | null (من user.role)
  // 🎯 المخرج: MenuItem[] مُصممة خصيصاً لدور المستخدم
  // 💼 كل دور له قائمة مختلفة من الصفحات والصلاحيات
  
  // ======================================
  // 🔧 وظائف مساعدة
  // ======================================

  const toggleExpanded = (label: string) => {
    setExpandedItems(prev => 
      prev.includes(label) 
        ? prev.filter(item => item !== label)
        : [...prev, label]
    )
  }

  // ======================================
  // 🎨 دالة رسم عناصر القائمة (المحسنة)
  // ======================================
  
  const renderMenuItem = (item: MenuItem, level = 0) => {
    // 🔧 renderMenuItem: دالة ذكية لعرض عناصر القائمة بطريقة تفاعلية
    // 📋 المدخلات: 
    //    - item: MenuItem (العنصر المراد عرضه مع icon وlabel وchildren)
    //    - level: number (مستوى التداخل للتصميم الهرمي)
    // 🎯 المخرجات: JSX Element مُصمم حسب نوع العنصر (dropdown أو link)
    
    const hasChildren = item.children && item.children.length > 0;
    // 📂 hasChildren: فحص وجود عناصر فرعية (children) لإنشاء dropdown menu
    // 🔗 يُستخدم في قوائم مثل "إدارة المستخدمين" التي تحتوي على "جميع المستخدمين"، "إضافة مستخدم"
    
    const isExpanded = expandedItems.includes(item.label);
    // 📤 isExpanded: فحص حالة توسيع القائمة الفرعية (مفتوحة أم مغلقة)
    // 🔄 يتحكم في عرض/إخفاء العناصر الفرعية وتغيير أيقونة السهم
    
    const isActive = item.href === pathname;
    // ✨ isActive: فحص الصفحة النشطة الحالية لتمييزها بصرياً
    // 🎨 يُستخدم لتطبيق تصميم مختلف (لون مميز وborder) للصفحة الحالية
    
    // ======================================
    // 📂 عرض القوائم الفرعية (Dropdown Menu)
    // ======================================
    
    if (hasChildren) {
      return (
        <div key={item.label}>
          {/* زر القائمة الرئيسية مع إمكانية التوسيع */}
          <button
            onClick={() => toggleExpanded(item.label)}
            className={clsx(
              'w-full flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors',
              level > 0 && 'pr-8' // 📏 مسافة إضافية للعناصر الفرعية
            )}
          >
            <div className="flex items-center space-x-3 space-x-reverse">
              {item.icon} {/* 🎨 الأيقونة المخصصة للعنصر (مثل FaUsers، FaChartBar) */}
              <span className="font-medium">{item.label}</span> {/* 📝 نص العنصر */}
            </div>
            {/* 🔄 أيقونة السهم تتغير حسب حالة التوسيع */}
            {isExpanded ? (
              <FaChevronDown className="w-4 h-4" /> // ⬇️ سهم لأسفل عند الفتح
            ) : (
              <FaChevronRight className="w-4 h-4" /> // ➡️ سهم لليمين عند الإغلاق
            )}
          </button>
          
          {/* العناصر الفرعية المخفية/المعروضة */}
          {isExpanded && (
            <div className="bg-gray-50"> {/* 🎨 خلفية مختلفة للعناصر الفرعية */}
              {item.children?.map(child => renderMenuItem(child, level + 1))}
              {/* 🔄 استدعاء تكراري لعرض العناصر الفرعية مع زيادة مستوى التداخل */}
            </div>
          )}
        </div>
      );
    }

    // ======================================
    // 🔗 عرض الروابط المباشرة (Direct Links)
    // ======================================
    
    return (
      <Link
        key={item.label}
        href={item.href || '#'} // 🔗 الرابط أو # كـ fallback
        onClick={onClose} // 📱 إغلاق Sidebar تلقائياً في الموبايل عند النقر
        className={clsx(
          'flex items-center space-x-3 space-x-reverse px-4 py-3 transition-colors',
          level > 0 && 'pr-8', // 📏 مسافة إضافية للعناصر الفرعية
          isActive 
            ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-500' // 🎯 تصميم الصفحة النشطة
            : 'text-gray-700 hover:bg-gray-100' // 🎨 تصميم الحالة العادية والhover
        )}
      >
        {item.icon} {/* 🎨 الأيقونة المخصصة (FaCamera، FaDollarSign، etc.) */}
        <span className="font-medium">{item.label}</span> {/* 📝 نص الرابط */}
      </Link>
    );
  };

  // ======================================
  // 🎨 عرض المكون النهائي (JSX Return)
  // ======================================
  
  return (
    <>
      {/* ======================================
          📱 Overlay الموبايل (الطبقة الخلفية)
          ====================================== */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
          // 🔧 Overlay: طبقة شفافة سوداء تظهر خلف Sidebar في الموبايل فقط
          // 📱 تُستخدم لإغلاق القائمة عند النقر خارجها
          // 🖥️ مخفية في الشاشات الكبيرة (lg:hidden)
        />
      )}
      
      {/* ======================================
          🗂️ Sidebar الرئيسي (القائمة الجانبية)
          ====================================== */}
      <aside className={clsx(
        'fixed lg:static inset-y-0 right-0 z-50 w-64 bg-white border-l border-gray-200 transform transition-transform duration-300 ease-in-out lg:transform-none',
        isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        // 🔧 التصميم المتجاوب:
        // 📱 الموبايل: fixed position مع انزلاق من اليمين (translate-x)
        // 🖥️ الديسكتوب: static position دائماً مرئي
        // ⚡ انتقال سلس مع transition-transform
      )}>
        {/* ======================================
            🏷️ Header الـ Sidebar
            ====================================== */}
        <div className="flex items-center justify-center h-16 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">
            {/* 🎯 عنوان ديناميكي حسب دور المستخدم */}
            {userRole === 'super_admin' ? 'لوحة الأدمن' :
             userRole === 'photographer' ? 'لوحة المصور' :
             userRole === 'brand_coordinator' ? 'لوحة البراند' :
             userRole === 'marketing_coordinator' ? 'لوحة التسويق' :
             'لوحة التحكم'}
          </h1>
          {/* 🔧 العنوان يتغير حسب دور المستخدم لتوضيح السياق */}
          {/* 📋 يُظهر للمستخدم نوع اللوحة التي يستخدمها */}
        </div>
        
        {/* ======================================
            🧭 منطقة التنقل (Navigation Area)
            ====================================== */}
        <nav className="mt-4">
          {menuItems.map(item => renderMenuItem(item))}
          {/* 🔧 عرض قائمة العناصر المُنشأة بواسطة getMenuItemsByRole */}
          {/* 🎯 كل عنصر يُعرض بواسطة renderMenuItem مع التصميم المناسب */}
          {/* 📱 تلقائياً متوافق مع جميع الأدوار والأجهزة */}
        </nav>
        
        {/* ======================================
            👤 معلومات المستخدم (اختياري)
            ====================================== */}
        {user && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-3 space-x-reverse">
              {/* 📸 صورة المستخدم أو أيقونة افتراضية */}
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-medium text-sm">
                  {user.full_name?.charAt(0) || user.email?.charAt(0) || '👤'}
                </span>
              </div>
              {/* 📝 اسم المستخدم */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.full_name || user.email}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {userRole === 'super_admin' ? 'مدير النظام' :
                   userRole === 'photographer' ? 'مصور' :
                   userRole === 'brand_coordinator' ? 'منسق براند' :
                   userRole === 'marketing_coordinator' ? 'منسق تسويق' :
                   'مستخدم جديد'}
                </p>
              </div>
            </div>
          </div>
        )}
        {/* 🔧 قسم معلومات المستخدم في أسفل Sidebar */}
        {/* 📋 يُظهر اسم المستخدم ودوره مع صورة أو أول حرف من الاسم */}
        {/* 💡 يساعد المستخدم في تأكيد هويته ودوره الحالي */}
      </aside>
    </>
  );
}

// ======================================
// 📋 ملخص المكون وفوائده
// ======================================

/**
 * 🎯 ملخص مكون Sidebar المتطور:
 * ===============================
 * 
 * ✅ المميزات المُنجزة:
 * 
 * 🔐 Dynamic Role-Based Navigation:
 *    - قوائم مخصصة لكل دور (super_admin, photographer, brand_coordinator, marketing_coordinator)
 *    - استخدام User.role من @depth-studio/types للتحقق من الصلاحيات
 *    - تكامل كامل مع auth.store.ts للحصول على بيانات المستخدم
 * 
 * 🎨 تصميم متجاوب محسن:
 *    - Sidebar منزلق في الموبايل مع overlay
 *    - ثابت في الشاشات الكبيرة 
 *    - انتقالات سلسة مع CSS transitions
 * 
 * 🧭 نظام تنقل ذكي:
 *    - قوائم فرعية قابلة للطي/التوسيع
 *    - تمييز الصفحة النشطة بصرياً
 *    - أيقونات مناسبة لكل نوع من المحتوى
 * 
 * 🔗 توافق كامل مع النظام:
 *    - استخدام UserRole enum من types
 *    - ربط مع auth.store.ts للمصادقة
 *    - مسارات تطابق dashboard routes المُنشأة
 * 
 * 👤 تجربة مستخدم محسنة:
 *    - عرض معلومات المستخدم في الأسفل
 *    - عناوين ديناميكية حسب الدور
 *    - إغلاق تلقائي في الموبايل عند النقر
 * 
 * 🚀 الأيقونات المستخدمة بذكاء:
 *    - FaHome: الصفحة الرئيسية (جميع الأدوار)
 *    - FaUsers: إدارة المستخدمين (أدمن) / فريق العمل (براند)
 *    - FaChartBar: التقارير والتحليلات
 *    - FaCamera: معرض الأعمال (مصور)
 *    - FaTasks: المهام (مصور)
 *    - FaDollarSign: الأرباح والميزانيات
 *    - FaBullhorn: الحملات (براند/تسويق)
 *    - FaFileAlt: المحتوى والملفات
 *    - FaCalendarAlt: الجدول الزمني (مصور)
 *    - FaEye: التحليلات والمراقبة
 *    - FaCog: الإعدادات (جميع الأدوار)
 * 
 * 💡 النتيجة النهائية:
 *    Navigation system ديناميكي وذكي يتكيف مع دور كل مستخدم
 *    ويوفر تجربة مخصصة ومُحسنة لكل نوع من المستخدمين
 */
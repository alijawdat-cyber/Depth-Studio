'use client';

/**
 * 🔄 صفحة انتظار موافقة المدير العام - Depth Studio
 * ================================================
 * 
 * 📅 تاريخ الإنشاء: يونيو 2025
 * 👨‍💻 المطور: علي جودت  
 * 🎯 الهدف: عرض حالة طلب اختيار الدور وانتظار الموافقة
 * 
 * 🔄 المميزات الرئيسية:
 * - عرض مراحل العملية بصرياً مع progress indicators
 * - تحديث تلقائي للحالة كل دقيقة لتتبع التقدم
 * - زر تحديث يدوي للتحقق من الموافقة فوراً
 * - إشعارات وقت المراجعة المتوقع (24-48 ساعة)
 * - رابط مباشر للتواصل مع الدعم الفني
 * - تصميم user-friendly مع رسائل عربية واضحة
 * 
 * 🎭 دعم جميع الأدوار:
 * - المصور (photographer) - عرض تفاصيل نوع العقد
 * - منسق البراند (brand_coordinator) - عرض البراند المختار
 * - منسق التسويق (marketing_coordinator) - عرض الخبرة التسويقية
 * 
 * 🔗 التكامل:
 * - استخدام roleSelection.service.ts للحصول على حالة الطلب
 * - استخدام AuthStore للحصول على المستخدم الحالي
 * - تحديث تلقائي باستخدام useEffect وsetInterval
 * - معالجة جميع حالات الطلب (pending, approved, rejected)
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// ======================================
// 🎨 استيرادات الأيقونات من react-icons
// ======================================

import { 
  AiOutlineClockCircle as Clock,           // ⏰ أيقونة الساعة - لعرض أوقات الانتظار والتقدم
  AiOutlineCheckCircle as CheckCircle,     // ✅ أيقونة الصح - للمراحل المكتملة والنجاح
  AiOutlineCloseCircle as XCircle,         // ❌ أيقونة الخطأ - للأخطاء والرفض
  AiOutlineReload as RefreshCw,            // 🔄 أيقونة التحديث - لزر تحديث الحالة
  AiOutlineMessage as MessageCircle,       // 💬 أيقونة الرسالة - للتواصل مع الدعم
  AiOutlineWarning as AlertCircle,         // ⚠️ أيقونة التحذير - للتنبيهات والملاحظات
  AiOutlineCheckSquare as CheckSquare,     // ☑️ أيقونة المربع المحدد - للمهام المكتملة
  AiOutlineCalendar as Calendar,           // 📅 أيقونة التقويم - لعرض التواريخ والأوقات
  AiOutlineUser as UserIcon                // 👤 أيقونة المستخدم - لبيانات المستخدم (تجنب تضارب مع User type)
} from 'react-icons/ai';

// ======================================
// 📦 استيرادات الأنواع من @depth-studio/types
// ======================================

import {
  // 🎭 أنواع اختيار الأدوار - للتعامل مع طلبات الأدوار وحالاتها
  RoleSelection,                    // 📋 طلب اختيار الدور مع جميع التفاصيل (user_id, status, applied_at, etc.)
                                    // يحتوي على: user_id, selected_role, additional_data, status, applied_at, reviewed_at
  
  // 👥 أنواع المستخدمين - للتعامل مع بيانات المستخدم  
  User,                             // 👤 نوع المستخدم الكامل - مستخدم فعلياً في UserRoleStatus.user (سطر 490+)
                                    // 🔗 التكامل: UserRoleStatus.user: User (من roleSelection.service.ts)
                                    // 📊 يحتوي على: id, email, full_name, phone, role, status, created_at
                                    // ✅ مستخدم في: العنوان الرئيسي (userRoleStatus.user?.full_name) والإيميل (userRoleStatus.user?.email)
                                    // 🔒 مطلوب لضمان type safety عند الوصول للخصائص في userRoleStatus.user
  
  // 🎯 التعدادات المطلوبة - لفهم الأدوار والعقود والحالات
  UserRole,                         // 🎭 أدوار المستخدمين (photographer, brand_coordinator, marketing_coordinator)
                                    // القيم المتاحة: 'super_admin' | 'marketing_coordinator' | 'brand_coordinator' | 'photographer' | 'new_user'
  ContractType,                     // 📄 أنواع عقود المصورين (freelancer, salary)
                                    // القيم المتاحة: 'freelancer' | 'salary' - لتحديد نوع العقد للمصورين
  BrandType,                        // 🏢 أنواع البراندات (local, international, startup, enterprise)
                                    // القيم المتاحة: 'local' | 'international' | 'startup' | 'enterprise'
  Industry,                         // 🏭 الصناعات (fashion, food, technology, etc.)
                                    // القيم المتاحة: 'fashion' | 'food' | 'technology' | 'healthcare' | 'education' | 'automotive' | 'real_estate' | 'travel' | 'beauty' | 'other'
  
  // ⏰ أنواع الطوابع الزمنية - لحساب أوقات الانتظار والمراجعة
  FirebaseTimestamp                 // 📅 طوابع زمنية Firebase - لحساب الوقت المنقضي ووقت المراجعة المتوقع
                                    // يوفر دوال: toDate(), seconds, nanoseconds لمعالجة التواريخ والأوقات
} from '@depth-studio/types';

// ======================================
// 🔗 استيرادات الخدمات المطلوبة
// ======================================

import { 
  roleSelectionService,             // 🎭 خدمة اختيار الأدوار للحصول على حالة الطلب
                                    // توفر: getUserRoleStatus(), submitRoleSelection(), getContractTypes(), searchBrands()
  UserRoleStatus                    // 👤 نوع حالة دور المستخدم - مستورد من الخدمة لأنه غير موجود في types
                                    // يحتوي على: user_id, user, current_role, has_pending_application, pending_application, role_selection_history
} from '../../services/roleSelection.service';  
import { useAuthStore } from '../../store/auth.store';                        // 🔐 متجر المصادقة للحصول على المستخدم الحالي
                                                                              // يوفر: user, token, isAuthenticated, signOut(), getCurrentUser()

// ======================================
// 🎨 واجهات مخصصة لهذه الصفحة
// ======================================

/** مراحل عملية اختيار الدور */
interface ProcessStep {
  id: number;                           // معرف المرحلة
  title: string;                        // عنوان المرحلة
  description: string;                  // وصف المرحلة
  status: 'completed' | 'current' | 'pending'; // حالة المرحلة
  icon: React.ElementType;              // أيقونة المرحلة
  estimatedTime?: string;               // الوقت المتوقع لإكمال المرحلة
}

/** معلومات التواصل مع الدعم */
interface SupportInfo {
  whatsapp: string;                     // رقم الواتساب
  email: string;                        // البريد الإلكتروني
  workingHours: string;                 // ساعات العمل
}

/** إحصائيات وقت الانتظار */
interface WaitingTimeStats {
  elapsed: string;                      // الوقت المنقضي منذ التقديم
  estimated: string;                    // الوقت المتوقع للمراجعة
  progress: number;                     // نسبة التقدم (0-100)
  isOverdue: boolean;                   // هل تجاوز الوقت المتوقع
}

// ======================================
// 🔄 صفحة انتظار الموافقة الرئيسية
// ======================================

export default function PendingApprovalPage(): React.JSX.Element {
  
  // ======================================
  // 📊 الحالة المحلية للصفحة
  // ======================================
  
  const [userRoleStatus, setUserRoleStatus] = useState<UserRoleStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [timeElapsed, setTimeElapsed] = useState<string>('');
  
  // ======================================
  // 🔗 الخدمات والأدوات المطلوبة
  // ======================================
  
  const { user } = useAuthStore();                    // 🔐 المستخدم الحالي من متجر المصادقة
  const router = useRouter();                         // 📍 للتنقل بين الصفحات
  
  // ======================================
  // 🔒 دوال التحقق من الأنواع (Type Guards)
  // ======================================
  
  /**
   * 🛡️ التحقق من صحة بيانات المستخدم
   * يتأكد أن المستخدم من نوع User وله الخصائص المطلوبة
   * 
   * 📋 الفائدة: ضمان type safety عند الوصول لخصائص المستخدم
   * 🔗 يستخدم User type بشكل صريح لتجنب أخطاء TypeScript
   */
  const isValidUser = useCallback((user: unknown): user is User => {
    return user !== null && 
           typeof user === 'object' &&
           user !== undefined &&
           'id' in user &&
           'full_name' in user &&
           'email' in user;
  }, []);

  // ======================================
  // 🔄 دوال مساعدة لحساب الوقت
  // ======================================
  
  /**
   * حساب الوقت المنقضي منذ تقديم الطلب
   * يحسب الفرق بين تاريخ التقديم والوقت الحالي ويعرضه بصيغة مفهومة
   */
  const calculateElapsedTime = useCallback((appliedAt: FirebaseTimestamp): string => {
    const appliedDate = appliedAt.toDate();           // تحويل Firebase timestamp إلى Date
    const now = new Date();
    const diffMs = now.getTime() - appliedDate.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours >= 24) {
      const days = Math.floor(diffHours / 24);
      const remainingHours = diffHours % 24;
      return `${days} يوم و ${remainingHours} ساعة`;
    } else if (diffHours > 0) {
      return `${diffHours} ساعة و ${diffMinutes} دقيقة`;
    } else {
      return `${diffMinutes} دقيقة`;
    }
  }, []);
  
  /**
   * حساب إحصائيات وقت الانتظار
   * يوفر معلومات شاملة عن التقدم والوقت المتوقع
   */
  const calculateWaitingStats = useCallback((appliedAt: FirebaseTimestamp): WaitingTimeStats => {
    const appliedDate = appliedAt.toDate();
    const now = new Date();
    const diffMs = now.getTime() - appliedDate.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    
    // الوقت المتوقع للمراجعة: 24-48 ساعة
    const minHours = 24;
    const maxHours = 48;
    
    // حساب نسبة التقدم
    let progress = 0;
    if (diffHours >= maxHours) {
      progress = 100;
    } else if (diffHours >= minHours) {
      progress = 50 + ((diffHours - minHours) / (maxHours - minHours)) * 50;
    } else {
      progress = (diffHours / minHours) * 50;
    }
    
    return {
      elapsed: calculateElapsedTime(appliedAt),
      estimated: diffHours < maxHours ? `${Math.ceil(maxHours - diffHours)} ساعة` : 'قريباً',
      progress: Math.min(progress, 100),
      isOverdue: diffHours > maxHours
    };
  }, [calculateElapsedTime]);
  
  // ======================================
  // 🎭 دوال تنسيق الأدوار والبيانات
  // ======================================
  
  /**
   * تنسيق اسم الدور بالعربية
   * يحول UserRole enum إلى نص عربي مفهوم
   * يدعم جميع الأدوار المتاحة في النظام: super_admin, marketing_coordinator, brand_coordinator, photographer, new_user
   */
  const formatRoleNameArabic = useCallback((role: UserRole): string => {
    const roleNames: Record<UserRole, string> = {
      super_admin: 'مدير عام',                    // المدير العام للنظام
      marketing_coordinator: 'منسق تسويق',        // منسق الحملات التسويقية
      brand_coordinator: 'منسق براند',            // منسق البراندات والعلامات التجارية
      photographer: 'مصور',                      // المصور المحترف
      new_user: 'مستخدم جديد'                    // مستخدم جديد لم يختر دور بعد
    };
    return roleNames[role] || role;
  }, []);
  
  /**
   * تنسيق نوع العقد بالعربية
   * يحول ContractType enum إلى نص عربي مفهوم
   */
  const formatContractTypeArabic = useCallback((contractType: ContractType): string => {
    const contractTypes: Record<ContractType, string> = {
      freelancer: 'مستقل (Freelancer)',
      salary: 'راتب ثابت'
    };
    return contractTypes[contractType] || contractType;
  }, []);
  
  /**
   * 🎨 تنسيق نوع البراند بالعربية
   * يحول BrandType enum إلى نص عربي مفهوم
   * 
   * 📋 الفائدة: جاهز للاستخدام في المستقبل لعرض تفاصيل البراندات
   * 🔮 سيُستخدم عند إضافة معلومات البراند في UserRoleStatus أو تفاصيل الطلبات
   * 📊 يدعم: local, international, startup, enterprise
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  const formatBrandTypeArabic = useCallback((brandType: BrandType): string => {
    const brandTypes: Record<BrandType, string> = {
      local: 'محلي',                           // براند محلي عراقي
      international: 'دولي',                   // براند عالمي
      startup: 'ناشئ',                        // شركة ناشئة
      enterprise: 'مؤسسة كبيرة'                // مؤسسة كبيرة راسخة
    };
    return brandTypes[brandType] || brandType;
  }, []);
  
  /**
   * 🏭 تنسيق الصناعة بالعربية  
   * يحول Industry enum إلى نص عربي مفهوم
   * 
   * 📋 الفائدة: جاهز للاستخدام في المستقبل لعرض تفاصيل البراندات والحملات
   * 🔮 سيُستخدم عند إضافة تصنيف الصناعات في البراندات أو تفاصيل المشاريع
   * 📊 يدعم جميع الصناعات المتاحة في النظام حسب types/src/core/enums.ts
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  const formatIndustryArabic = useCallback((industry: Industry): string => {
    const industries: Record<Industry, string> = {
      fashion: 'أزياء',                          // صناعة الأزياء والملابس
      food: 'طعام ومشروبات',                    // المطاعم والأطعمة
      technology: 'تكنولوجيا',                  // التكنولوجيا والبرمجيات
      healthcare: 'صحة',                        // القطاع الصحي والطبي
      education: 'تعليم',                       // التعليم والتدريب
      automotive: 'سيارات',                     // صناعة السيارات والمركبات
      real_estate: 'عقارات',                    // العقارات والاستثمار العقاري
      travel: 'سفر وسياحة',                     // السفر والسياحة
      beauty: 'جمال وعناية',                    // منتجات التجميل والعناية
      other: 'أخرى'                            // صناعات أخرى غير مصنفة
    };
    return industries[industry] || industry;
  }, []);
  
  // ======================================
  // 🔄 دوال إدارة البيانات
  // ======================================
  
  /**
   * جلب حالة دور المستخدم من الخدمة
   * يحصل على آخر طلب وحالته من Backend
   */
  const fetchUserRoleStatus = useCallback(async (): Promise<void> => {
    if (!user?.id) {
      setError('لم يتم العثور على بيانات المستخدم');
      setIsLoading(false);
      return;
    }
    
    try {
      setError(null);
      const response = await roleSelectionService.getUserRoleStatus(user.id);
      
      if (response.status) {
        setUserRoleStatus(response.status);
        
        // إذا تم قبول أو رفض الطلب، توجيه إلى صفحة مناسبة
        if (response.status.pending_application?.status === 'approved') {
          router.push('/dashboard');
          return;
        }
        
        if (response.status.pending_application?.status === 'rejected') {
          router.push('/role-setup?rejected=true');
          return;
        }
      } else {
        // إذا لم يوجد طلب منتظر، توجيه إلى صفحة اختيار الدور
        router.push('/role-setup');
        return;
      }
      
    } catch (error) {
      console.error('❌ خطأ في جلب حالة الدور:', error);
      setError(error instanceof Error ? error.message : 'حدث خطأ في جلب البيانات');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      setLastRefresh(new Date());
    }
  }, [user?.id, router]);
  
  /**
   * تحديث البيانات يدوياً
   * يتيح للمستخدم تحديث الحالة فوراً
   */
  const handleRefresh = useCallback(async (): Promise<void> => {
    setIsRefreshing(true);
    await fetchUserRoleStatus();
  }, [fetchUserRoleStatus]);
  
  // ======================================
  // ⚡ التأثيرات الجانبية والتحديث التلقائي
  // ======================================
  
  /**
   * جلب البيانات عند تحميل الصفحة
   * يحصل على حالة الطلب فور دخول المستخدم للصفحة
   */
  useEffect(() => {
    fetchUserRoleStatus();
  }, [fetchUserRoleStatus]);
  
  /**
   * التحديث التلقائي كل دقيقة
   * يفحص حالة الطلب تلقائياً لتتبع أي تغييرات
   */
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isRefreshing && !isLoading) {
        fetchUserRoleStatus();
      }
    }, 60000); // كل دقيقة (60 ثانية)
    
    return () => clearInterval(interval);
  }, [fetchUserRoleStatus, isRefreshing, isLoading]);
  
  /**
   * تحديث الوقت المنقضي كل ثانية
   * يحدث العداد التصاعدي للوقت المنقضي
   */
  useEffect(() => {
    if (userRoleStatus?.pending_application?.applied_at) {
      const updateElapsedTime = (): void => {
        const elapsed = calculateElapsedTime(userRoleStatus.pending_application!.applied_at);
        setTimeElapsed(elapsed);
      };
      
      updateElapsedTime(); // تحديث فوري
      const interval = setInterval(updateElapsedTime, 1000); // كل ثانية
      
      return () => clearInterval(interval);
    }
  }, [userRoleStatus?.pending_application?.applied_at, userRoleStatus?.pending_application, calculateElapsedTime]);
  
  // ======================================
  // 🎨 بناء مراحل العملية
  // ======================================
  
  /**
   * إنشاء مراحل العملية بناءً على حالة الطلب
   * يوفر تمثيل بصري واضح لمراحل الموافقة
   */
  const getProcessSteps = useCallback((roleSelection: RoleSelection): ProcessStep[] => {
    const steps: ProcessStep[] = [
      {
        id: 1,
        title: 'تقديم الطلب',
        description: 'تم تقديم طلب اختيار الدور بنجاح',
        status: 'completed',
        icon: CheckSquare,
        estimatedTime: 'مكتمل'
      },
      {
        id: 2,
        title: 'مراجعة البيانات',
        description: 'جاري التحقق من صحة البيانات المقدمة',
        status: roleSelection.status === 'pending' ? 'current' : 'completed',
        icon: AlertCircle,
        estimatedTime: '2-6 ساعات'
      },
      {
        id: 3,
        title: 'موافقة المدير العام',
        description: 'انتظار موافقة المدير العام على الطلب',
        status: roleSelection.status === 'pending' ? 'pending' : 
                roleSelection.status === 'approved' ? 'completed' : 'current',
        icon: roleSelection.status === 'approved' ? CheckCircle : 
              roleSelection.status === 'rejected' ? XCircle : Clock,
        estimatedTime: '24-48 ساعة'
      },
      {
        id: 4,
        title: 'تفعيل الحساب',
        description: 'تفعيل الدور الجديد والوصول للوحة التحكم',
        status: roleSelection.status === 'approved' ? 'completed' : 'pending',
        icon: UserIcon,                     // استخدام UserIcon بدلاً من User لتجنب التضارب مع النوع
        estimatedTime: 'فوري'
      }
    ];
    
    return steps;
  }, []);
  
  // ======================================
  // 📞 معلومات الدعم الفني
  // ======================================
  
  /**
   * معلومات التواصل مع الدعم الفني
   * يوفر طرق متعددة للتواصل مع فريق الدعم
   */
  const supportInfo: SupportInfo = {
    whatsapp: '+964750123456',                        // رقم الواتساب للدعم السريع
    email: 'support@depthstudio.com',                 // البريد الإلكتروني للاستفسارات
    workingHours: 'الأحد - الخميس، 9:00 ص - 6:00 م'    // ساعات العمل
  };
  
  // ======================================
  // 🎨 عرض واجهة المستخدم
  // ======================================
  
  // عرض شاشة التحميل أثناء جلب البيانات
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">جاري تحميل حالة طلبك...</p>
        </div>
      </div>
    );
  }
  
  // عرض رسالة الخطأ إذا حدث مشكلة
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center" dir="rtl">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">حدث خطأ</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg disabled:opacity-50"
          >
            {isRefreshing ? 'جاري المحاولة...' : 'المحاولة مرة أخرى'}
          </button>
        </div>
      </div>
    );
  }
  
  // التأكد من وجود طلب منتظر
  if (!userRoleStatus?.pending_application) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 flex items-center justify-center" dir="rtl">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">لا يوجد طلب منتظر</h2>
          <p className="text-gray-600 mb-4">لم يتم العثور على طلب اختيار دور منتظر للموافقة</p>
          <button
            onClick={() => router.push('/role-setup')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            اختيار دور جديد
          </button>
        </div>
      </div>
    );
  }
  
  // البيانات الأساسية
  const pendingApplication = userRoleStatus.pending_application;
  const processSteps = getProcessSteps(pendingApplication);
  const waitingStats = calculateWaitingStats(pendingApplication.applied_at);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100" dir="rtl">
      <div className="container mx-auto px-4 py-8">
        {/* العنوان الرئيسي */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-100 rounded-full mb-4">
            <Clock className="w-10 h-10 text-yellow-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">طلبك قيد المراجعة</h1>
          <p className="text-gray-600 text-lg">
            أهلاً {isValidUser(userRoleStatus.user) ? userRoleStatus.user.full_name : 'بك'}، جاري مراجعة طلب اختيار الدور من قبل فريق الإدارة
          </p>
          {isValidUser(userRoleStatus.user) && userRoleStatus.user.email && (
            <p className="text-sm text-gray-500 mt-1">
              سنرسل تحديثات حول طلبك على: {userRoleStatus.user.email}
            </p>
          )}
        </div>
        
        {/* إحصائيات الوقت */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* الوقت المنقضي */}
              <div className="text-center">
                <Calendar className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-800 mb-1">الوقت المنقضي</h3>
                <p className="text-2xl font-bold text-blue-600">{timeElapsed || waitingStats.elapsed}</p>
                <p className="text-sm text-gray-500">منذ تقديم الطلب</p>
              </div>
              
              {/* الوقت المتوقع المتبقي */}
              <div className="text-center">
                <Clock className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-800 mb-1">الوقت المتوقع المتبقي</h3>
                <p className={`text-2xl font-bold ${waitingStats.isOverdue ? 'text-red-600' : 'text-green-600'}`}>
                  {waitingStats.estimated}
                </p>
                <p className="text-sm text-gray-500">للحصول على الرد</p>
              </div>
              
              {/* نسبة التقدم */}
              <div className="text-center">
                <CheckCircle className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-800 mb-1">نسبة التقدم</h3>
                <p className="text-2xl font-bold text-purple-600">{Math.round(waitingStats.progress)}%</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${waitingStats.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* تفاصيل الطلب */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">تفاصيل طلبك</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">الدور المطلوب</h3>
                <p className="text-lg text-blue-600 font-semibold">
                  {formatRoleNameArabic(pendingApplication.selected_role)}
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">تاريخ التقديم</h3>
                <p className="text-lg text-gray-800">
                  {pendingApplication.applied_at.toDate().toLocaleDateString('ar-EG', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              
              {/* تفاصيل إضافية حسب نوع الدور */}
              {pendingApplication.additional_data && (
                <>
                  {/* تفاصيل المصور */}
                  {pendingApplication.selected_role === 'photographer' && pendingApplication.additional_data.contract_type && (
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-2">نوع العقد</h3>
                      <p className="text-lg text-gray-800">
                        {formatContractTypeArabic(pendingApplication.additional_data.contract_type)}
                      </p>
                    </div>
                  )}
                  
                  {/* تفاصيل منسق البراند */}
                  {pendingApplication.selected_role === 'brand_coordinator' && (
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-2">طلب منسق البراند</h3>
                      <div className="text-lg text-gray-800">
                        {pendingApplication.additional_data?.selected_brand_id && (
                          <p className="mb-2">
                            <span className="font-medium">البراند المختار:</span> {pendingApplication.additional_data.selected_brand_id}
                          </p>
                        )}
                        {pendingApplication.additional_data?.brand_search_query && (
                          <p className="mb-2">
                            <span className="font-medium">البحث:</span> {pendingApplication.additional_data.brand_search_query}
                          </p>
                        )}
                        {pendingApplication.additional_data?.brand_coordinator_experience && (
                          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                            <span className="font-medium">الخبرة:</span> {pendingApplication.additional_data.brand_coordinator_experience}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* خبرة التسويق */}
                  {pendingApplication.additional_data.marketing_experience && (
                    <div className="md:col-span-2">
                      <h3 className="font-semibold text-gray-700 mb-2">الخبرة التسويقية</h3>
                      <p className="text-gray-800 bg-gray-50 p-3 rounded">
                        {pendingApplication.additional_data.marketing_experience}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* مراحل العملية */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">مراحل عملية الموافقة</h2>
            <div className="space-y-6">
              {processSteps.map((step, index) => (
                <div key={step.id} className="flex items-start space-x-4 space-x-reverse">
                  {/* أيقونة المرحلة */}
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                    step.status === 'completed' ? 'bg-green-100 text-green-600' :
                    step.status === 'current' ? 'bg-blue-100 text-blue-600' :
                    'bg-gray-100 text-gray-400'
                  }`}>
                    <step.icon className="w-6 h-6" />
                  </div>
                  
                  {/* محتوى المرحلة */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className={`font-semibold ${
                        step.status === 'completed' ? 'text-green-600' :
                        step.status === 'current' ? 'text-blue-600' :
                        'text-gray-500'
                      }`}>
                        {step.title}
                      </h3>
                      <span className="text-sm text-gray-500">{step.estimatedTime}</span>
                    </div>
                    <p className="text-gray-600 mt-1">{step.description}</p>
                    
                    {/* شريط التقدم بين المراحل */}
                    {index < processSteps.length - 1 && (
                      <div className="mt-4 mr-6">
                        <div className={`w-1 h-8 ${
                          step.status === 'completed' ? 'bg-green-300' : 'bg-gray-200'
                        }`}></div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* أزرار التحكم */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {/* زر التحديث */}
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center justify-center px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshCw className={`w-5 h-5 ml-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'جاري التحديث...' : 'تحديث الحالة'}
              </button>
              
              {/* زر التواصل مع الدعم */}
              <a
                href={`https://wa.me/${supportInfo.whatsapp.replace('+', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
              >
                <MessageCircle className="w-5 h-5 ml-2" />
                تواصل مع الدعم
              </a>
            </div>
            
            {/* آخر تحديث */}
            <div className="text-center mt-4 text-sm text-gray-500">
              آخر تحديث: {lastRefresh.toLocaleTimeString('ar-EG')}
            </div>
          </div>
        </div>
        
        {/* معلومات الدعم الفني */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <MessageCircle className="w-5 h-5 ml-2 text-green-600" />
              تحتاج مساعدة؟
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <h3 className="font-semibold text-gray-700">واتساب</h3>
                <p className="text-green-600">{supportInfo.whatsapp}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700">البريد الإلكتروني</h3>
                <p className="text-blue-600">{supportInfo.email}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700">ساعات العمل</h3>
                <p className="text-gray-600">{supportInfo.workingHours}</p>
              </div>
            </div>
            <div className="mt-4 p-4 bg-white rounded border-r-4 border-blue-500">
              <p className="text-gray-700">
                <strong>💡 نصيحة:</strong> يتم مراجعة جميع الطلبات خلال 24-48 ساعة عمل. 
                سنرسل لك إشعاراً فور اتخاذ قرار بشأن طلبك.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
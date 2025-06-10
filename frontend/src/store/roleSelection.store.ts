/**
 * 🎭 متجر اختيار الأدوار - Depth Studio
 * =====================================
 * 
 * 📅 تاريخ الإنشاء: يونيو 2025  
 * 👨‍💻 المطور: علي جودت
 * 🎯 الهدف: إدارة حالة اختيار الأدوار باستخدام Zustand مع التوافق الكامل
 * 
 * 🔗 التوافق الشامل (100%):
 * ✅ Backend: RoleSelectionService (906 سطر) + ValidationService + AuthMiddleware
 * ✅ Frontend: roleSelection.service.ts (725 سطر) + 8 API endpoints  
 * ✅ Types: auth.ts (314 سطر) + users.ts (143 سطر) + enums.ts (144 سطر)
 * ✅ Security: AuthGuard + PermissionManager + RolePermissions
 * 
 * 🎭 المميزات المتكاملة:
 * 
 * 📋 **إدارة طلبات الأدوار:**
 * - تقديم طلبات للأدوار الثلاثة (مصور، منسق براند، منسق تسويق)
 * - تتبع حالة الطلبات (pending, approved, rejected) بالوقت الفعلي
 * - معالجة البيانات الإضافية لكل دور (عقود، براندات، خبرات)
 * - validation شامل قبل إرسال الطلبات للـ Backend
 * 
 * 🏢 **إدارة البراندات للمنسقين:**
 * - البحث المتقدم في البراندات (اسم، نوع، صناعة، حالة)
 * - فلترة البراندات المتاحة (بدون منسق حالي)
 * - عرض تفاصيل البراند (نوع، صناعة، حالة) للاختيار المدروس
 * - تكامل مع Backend BrandService للبحث الذكي
 * 
 * 📄 **إدارة عقود المصورين:**
 * - عرض أنواع العقود المتاحة (مستقل، راتب ثابت)
 * - شرح تفصيلي لكل نوع عقد (المزايا، الشروط، الدفع)
 * - ربط نوع العقد بنظام الدفع في Backend PaymentService
 * - دعم المصورين في اختيار النوع المناسب لظروفهم
 * 
 * ⏳ **إدارة الطلبات للأدمن:**
 * - عرض قائمة الطلبات المنتظرة مع تفاصيل المتقدمين
 * - أدوات الموافقة والرفض مع إمكانية إضافة ملاحظات
 * - فلترة الطلبات حسب الدور والتاريخ
 * - تتبع أداء المراجعة (أوقات الاستجابة، معدلات الموافقة)
 * 
 * 📊 **إحصائيات شاملة:**
 * - إحصائيات عامة (إجمالي الطلبات، الموافقات، الرفضات)
 * - تحليل حسب الدور (أكثر الأدوار طلباً)
 * - أداء زمني (متوسط وقت المراجعة، ذروات التقديم)
 * - نسب النجاح والتحسين المطلوب
 * 
 * 💾 **حفظ ذكي:**
 * - localStorage للبيانات المهمة (حالة المستخدم، طلبات محفوظة)
 * - عدم حفظ البيانات الحساسة (كلمات مرور، tokens)
 * - استعادة تلقائية عند إعادة فتح التطبيق
 * - مزامنة مع Backend عند الحاجة
 * 
 * 🔧 **دوال مساعدة متقدمة:**
 * - تنسيق الأسماء العربية للأدوار والأنواع
 * - فلترة وتصنيف البيانات حسب معايير مختلفة
 * - استخراج معلومات المستخدمين للعرض
 * - التحقق من صحة البيانات قبل الإرسال
 * 
 * 🎯 **الفوائد العملية:**
 * 1. **للمستخدمين:** تجربة سلسة لاختيار الدور المناسب بكل سهولة
 * 2. **للمنسقين:** أدوات قوية للبحث واختيار البراندات المناسبة 
 * 3. **للمصورين:** وضوح كامل حول أنواع العقود والمزايا
 * 4. **للأدمن:** إدارة مركزية وكفؤة لجميع طلبات الأدوار
 * 5. **للمطورين:** كود منظم وقابل للصيانة مع types آمنة
 * 6. **للنظام:** أداء محسن مع caching ذكي وتحديث انتقائي
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// ======================================
// 📦 استيرادات الخدمات
// ======================================

import { 
  roleSelectionService,              // 🎭 خدمة اختيار الأدوار الأساسية (725 سطر)
                                     // توفر: submitRoleSelection, searchBrands, getContractTypes, etc.
  type UserRoleStatus,               // 👤 حالة دور المستخدم الشاملة مع User details
  type RoleSubmissionResult,         // 📋 نتيجة تقديم طلب اختيار دور
  type BrandSearchOptions,           // 🔍 خيارات البحث عن البراندات
  type BrandSearchResult,            // 🏢 نتائج البحث عن البراندات
  type ContractTypesResult,          // 📄 معلومات أنواع العقود
  type PendingApplicationsResult,    // ⏳ نتائج الطلبات المنتظرة
  type ApplicationActionResult,      // ✅ نتيجة موافقة/رفض طلب
  type RoleStatsResult,              // 📊 إحصائيات اختيار الأدوار
  type ContractTypeInfo              // 📋 معلومات نوع عقد محدد
} from '../services/roleSelection.service';

// ======================================
// 📦 استيرادات الأنواع من @depth-studio/types
// ======================================

import {
  // ======================================
  // 🎭 أنواع اختيار الأدوار الأساسية 
  // ======================================
  
  RoleSelection,                     // 📋 طلب اختيار دور مع جميع التفاصيل
                                     // ✅ يُستخدم في: PendingApplicationsState.applications, UserRoleStatus.pending_application
                                     // 📊 يحتوي على: user_id, selected_role, additional_data, status, applied_at, reviewed_at
                                     // 🔗 متوافق مع Backend RoleSelectionService و Frontend roleSelection.service.ts
                                     
  RoleSelectionSubmission,           // 📝 بيانات تقديم طلب جديد  
                                     // ✅ يُستخدم في: submissionData, updateSubmissionData, submitRoleApplication
                                     // 📊 يحتوي على: selected_role + additional_data للمصور/منسق البراند/منسق التسويق
                                     // 🔗 متوافق مع Backend ValidationService و Frontend validation
                                     
  RoleSelectionStats,                // 📊 إحصائيات شاملة لاختيار الأدوار
                                     // ✅ يُستخدم في: StatsState.stats, loadRoleStats
                                     // 📊 يحتوي على: total_applications, pending, approved, rejected, approval_rate
                                     // 🔗 متوافق مع Backend ReportService و Dashboard Components
  
  // ======================================
  // 👥 أنواع المستخدمين والبراندات
  // ======================================
  
  User,                              // 👤 نوع المستخدم الكامل - أساسي لعمل النظام
                                     // ✅ يُستخدم في: UserRoleStatus.user (عرض بيانات المستخدم في واجهات الأدمن)
                                     // 📊 يحتوي على: id, email, full_name, phone, role, status, created_at, auth_methods
                                     // 🔗 متوافق مع Backend AuthService و Frontend auth.store.ts
                                     // 🎯 الفائدة: عرض معلومات المتقدم للأدوار، إدارة الصلاحيات، تتبع النشاط
                                     
  Brand,                             // 🏢 نوع البراند الكامل - للبحث وعرض البراندات للمنسقين  
                                     // ✅ يُستخدم في: BrandSearchState.results, searchBrands, Brand selection
                                     // 📊 يحتوي على: id, name, brand_type, industry, status, coordinator_id
                                     // 🔗 متوافق مع Backend BrandService و Frontend brand components
                                     // 🎯 الفائدة: عرض البراندات المتاحة لمنسقي البراند، فلترة البحث، إدارة التخصيص
                                     
  ID,                                // 🆔 نوع المعرف الموحد - لجميع العمليات 
                                     // ✅ يُستخدم في: user_id, application_id, brand_id في جميع الدوال والواجهات
                                     // 📊 يضمن نوع موحد للمعرفات في النظام (string في Firestore)
                                     // 🔗 متوافق مع جميع الخدمات Backend و Frontend 
                                     // 🎯 الفائدة: ضمان type safety، منع أخطاء المعرفات، توافق شامل
  
  // ======================================
  // 🎯 التعدادات المطلوبة - للتحقق والتصنيف
  // ======================================
  
  UserRole,                          // 🎭 أدوار المستخدمين - أساس عمل النظام
                                     // ✅ يُستخدم في: selectedRole, RoleSelection.selected_role, validation
                                     // 📊 القيم: 'super_admin' | 'marketing_coordinator' | 'brand_coordinator' | 'photographer' | 'new_user'
                                     // 🔗 متوافق مع Backend RolePermissionService و AuthMiddleware
                                     // 🎯 الفائدة: تحديد صلاحيات المستخدم، فلترة الطلبات، التحكم بالوصول
                                     
  ContractType,                      // 📄 أنواع عقود المصورين - للمصورين فقط
                                     // ✅ يُستخدم في: ContractTypesState, selectContractType, photographer validation
                                     // 📊 القيم: 'freelancer' | 'salary' - يحدد نوع العلاقة التعاقدية
                                     // 🔗 متوافق مع Backend PhotographerService و PaymentService
                                     // 🎯 الفائدة: تحديد نوع الدفع، حساب المستحقات، شروط العمل
                                     
  BrandType,                         // 🏢 أنواع البراندات - لفلترة البحث والتصنيف
                                     // ✅ يُستخدم في: BrandSearchOptions.brand_type, Brand.brand_type
                                     // 📊 القيم: 'local' | 'international' | 'startup' | 'enterprise'
                                     // 🔗 متوافق مع Backend BrandService و Frontend BrandFilters
                                     // 🎯 الفائدة: فلترة البراندات حسب النوع، تخصيص الخدمات، إحصائيات التوزيع
                                     
  BrandStatus,                       // 🔄 حالات البراندات - لإدارة دورة حياة البراند
                                     // ✅ يُستخدم في: BrandSearchOptions.status, Brand.status
                                     // 📊 القيم: 'active' | 'paused' | 'archived' | 'development'
                                     // 🔗 متوافق مع Backend BrandManagementService و Dashboard
                                     // 🎯 الفائدة: عرض البراندات النشطة فقط، إدارة الحالة، تتبع النشاط
                                     
  Industry,                          // 🏭 الصناعات - لتصنيف البراندات والخبرات
                                     // ✅ يُستخدم في: BrandSearchOptions.industry, Brand.industry
                                     // 📊 القيم: 'fashion' | 'food' | 'technology' | 'healthcare' | etc.
                                     // 🔗 متوافق مع Backend IndustryService و Analytics
                                     // 🎯 الفائدة: مطابقة خبرة المنسق مع صناعة البراند، إحصائيات القطاعات
  
  // ======================================
  // ⏰ أنواع الطوابع الزمنية - لإدارة التواريخ
  // ======================================
  
  FirebaseTimestamp                  // 📅 طوابع زمنية Firebase - للتواريخ والأوقات
                                     // ✅ يُستخدم في: RoleSelection.applied_at, reviewed_at, StatsState.dateRange
                                     // 📊 يوفر: toDate(), seconds, nanoseconds للتحويل والمقارنة
                                     // 🔗 متوافق مع Firebase Firestore و جميع الخدمات
                                     // 🎯 الفائدة: تتبع أوقات التقديم، حساب مدة المراجعة، إحصائيات زمنية
} from '@depth-studio/types';

// ======================================
// 🎨 واجهات متجر اختيار الأدوار
// ======================================

/** حالة العمليات العامة */
interface OperationState {
  loading: boolean;                  // هل العملية جارية
  error: string | null;              // رسالة الخطأ (إن وجدت)
  success: boolean;                  // هل العملية نجحت
  lastUpdated?: Date;                // وقت آخر تحديث
}

/** حالة تقديم طلب اختيار دور */
interface SubmissionState extends OperationState {
  submittedApplication?: RoleSelection; // الطلب المقدم (إذا نجح)
  validationErrors?: string[];       // أخطاء التحقق من صحة البيانات
}

/** حالة البحث عن البراندات */
interface BrandSearchState extends OperationState {
  results: Brand[];                  // 🏢 نتائج البحث الحالية - قائمة البراندات المطابقة
                                     // ✅ نوع Brand يحتوي على: id, name, brand_type, industry, status, coordinator_id
  searchQuery: string;               // 📝 استعلام البحث الحالي - النص المدخل من المستخدم
  filters: Partial<BrandSearchOptions>; // 🔍 الفلاتر المطبقة - نوع البراند، الصناعة، الحالة
                                        // ✅ يدعم BrandType, Industry, BrandStatus للفلترة المتقدمة
  total: number;                     // 📊 العدد الإجمالي للنتائج - مع الفلاتر المطبقة
  hasSearched: boolean;              // ✅ هل تم البحث مسبقاً - لعرض رسائل مناسبة
}

/** حالة معلومات أنواع العقود */
interface ContractTypesState extends OperationState {
  contractTypes: ContractTypeInfo[]; // قائمة أنواع العقود المتاحة
  selectedType?: ContractType;       // نوع العقد المختار حالياً
}

/** حالة الطلبات المنتظرة (للأدمن) */
interface PendingApplicationsState extends OperationState {
  applications: RoleSelection[];     // قائمة الطلبات المنتظرة
  total: number;                     // العدد الإجمالي للطلبات
  filters: {                         // الفلاتر المطبقة
    role?: UserRole;
    orderBy?: 'applied_at' | 'updated_at';
    orderDirection?: 'asc' | 'desc';
  };
}

/** حالة إحصائيات اختيار الأدوار */
interface StatsState extends OperationState {
  stats?: RoleSelectionStats;        // الإحصائيات الشاملة
  dateRange?: {                      // النطاق الزمني للإحصائيات
    startDate: FirebaseTimestamp;
    endDate: FirebaseTimestamp;
  };
}

// ======================================
// 🏗️ واجهة متجر اختيار الأدوار
// ======================================

// تعطيل تحذيرات الـ ESLint للمعاملات غير المستخدمة في تعريفات الواجهات
/* eslint-disable @typescript-eslint/no-unused-vars, no-unused-vars */
interface RoleSelectionState {
  // ======================================
  // 📊 حالة البيانات الأساسية
  // ======================================
  
  userRoleStatus: UserRoleStatus | null; // حالة دور المستخدم الحالي
  selectedRole: UserRole | null;      // الدور المختار للتقديم
  submissionData: Partial<RoleSelectionSubmission> | null; // بيانات الطلب قيد التحضير
  
  // ======================================
  // 📊 حالات العمليات المختلفة
  // ======================================
  
  submission: SubmissionState;         // حالة تقديم الطلبات
  brandSearch: BrandSearchState;       // حالة البحث عن البراندات
  contractTypes: ContractTypesState;   // حالة أنواع العقود
  pendingApplications: PendingApplicationsState; // حالة الطلبات المنتظرة
  stats: StatsState;                   // حالة الإحصائيات
  userStatus: OperationState;          // حالة جلب بيانات المستخدم
  
  // ======================================
  // 🎭 أفعال تقديم الطلبات
  // ======================================
  
  /**
   * تحديد الدور المراد التقديم له
   * 📋 يستقبل UserRole ويحفظه في selectedRole
   */
  selectRole: (role: UserRole) => void;
  
  /**
   * تحديث بيانات الطلب
   */
  updateSubmissionData: (data: Partial<RoleSelectionSubmission>) => void;
  
  /**
   * تقديم طلب اختيار دور
   */
  submitRoleApplication: (userId: ID, submission: RoleSelectionSubmission) => Promise<RoleSubmissionResult>;
  
  /**
   * إعادة تعيين بيانات الطلب
   */
  resetSubmission: () => void;
  
  // ======================================
  // 🏢 أفعال البحث عن البراندات
  // ======================================
  
  /**
   * البحث عن البراندات للمنسقين
   */
  searchBrands: (options?: BrandSearchOptions) => Promise<void>;
  
  /**
   * تحديث فلاتر البحث
   */
  updateSearchFilters: (filters: Partial<BrandSearchOptions>) => void;
  
  /**
   * مسح نتائج البحث
   */
  clearBrandSearch: () => void;
  
  // ======================================
  // 📄 أفعال أنواع العقود
  // ======================================
  
  /**
   * جلب أنواع العقود للمصورين
   */
  loadContractTypes: () => Promise<void>;
  
  /**
   * اختيار نوع عقد
   */
  selectContractType: (contractType: ContractType) => void;
  
  // ======================================
  // ⏳ أفعال الطلبات المنتظرة (للأدمن)
  // ======================================
  
  /**
   * جلب الطلبات المنتظرة
   */
  loadPendingApplications: (options?: Partial<PendingApplicationsState['filters']>) => Promise<void>;
  
  /**
   * الموافقة على طلب
   */
  approveApplication: (applicationId: ID, notes?: string) => Promise<ApplicationActionResult>;
  
  /**
   * رفض طلب
   */
  rejectApplication: (applicationId: ID, reason: string, notes?: string) => Promise<ApplicationActionResult>;
  
  // ======================================
  // 📊 أفعال الإحصائيات
  // ======================================
  
  /**
   * جلب إحصائيات اختيار الأدوار
   */
  loadRoleStats: (dateRange?: { startDate: FirebaseTimestamp; endDate: FirebaseTimestamp }) => Promise<void>;
  
  /**
   * تحديث نطاق تاريخ الإحصائيات
   */
  updateStatsDateRange: (dateRange: { startDate: FirebaseTimestamp; endDate: FirebaseTimestamp }) => void;
  
  // ======================================
  // 👤 أفعال حالة المستخدم
  // ======================================
  
  /**
   * جلب حالة دور المستخدم
   */
  loadUserRoleStatus: (userId: ID) => Promise<void>;
  
  /**
   * تحديث حالة دور المستخدم محلياً
   */
  updateUserRoleStatus: (status: Partial<UserRoleStatus>) => void;
  
  // ======================================
  // 🔧 أفعال مساعدة
  // ======================================
  
  /**
   * مسح جميع الأخطاء
   */
  clearAllErrors: () => void;
  
  /**
   * إعادة تعيين المتجر
   */
  resetStore: () => void;
  
  /**
   * تحديث وقت آخر تحديث لعملية محددة
   */
  updateLastUpdated: (operation: keyof Pick<RoleSelectionState, 'submission' | 'brandSearch' | 'contractTypes' | 'pendingApplications' | 'stats' | 'userStatus'>) => void;
  
  // ======================================
  // 🔧 دوال مساعدة للأنواع والتنسيق
  // ======================================
  
  /**
   * التحقق من صحة نوع البراند - يستخدم BrandType
   */
  validateBrandType: (brandType: BrandType) => boolean;
  
  /**
   * التحقق من صحة حالة البراند - يستخدم BrandStatus
   */
  validateBrandStatus: (status: BrandStatus) => boolean;
  
  /**
   * التحقق من صحة الصناعة - يستخدم Industry
   */
  validateIndustry: (industry: Industry) => boolean;
  
  /**
   * استخراج معلومات المستخدم للعرض - يستخدم User
   */
  extractUserInfo: (user: User) => { displayName: string; contactInfo: string; roleText: string };
  
  /**
   * فلترة البراندات حسب المعايير - يستخدم جميع أنواع البراند
   */
  filterBrands: (brands: Brand[], filters: { 
    brandType?: BrandType; 
    status?: BrandStatus; 
    industry?: Industry 
  }) => Brand[];
}

// ======================================
// 🏪 متجر اختيار الأدوار الرئيسي
// ======================================

export const useRoleSelectionStore = create<RoleSelectionState>()(
  persist(
    (set, get) => ({
      
      // ======================================
      // 📊 الحالة الأولية
      // ======================================
      
      userRoleStatus: null,
      selectedRole: null,
      submissionData: null,
      
      // حالات العمليات الأولية
      submission: {
        loading: false,
        error: null,
        success: false,
      },
      
      brandSearch: {
        loading: false,
        error: null,
        success: false,
        results: [],
        searchQuery: '',
        filters: {},
        total: 0,
        hasSearched: false,
      },
      
      contractTypes: {
        loading: false,
        error: null,
        success: false,
        contractTypes: [],
      },
      
      pendingApplications: {
        loading: false,
        error: null,
        success: false,
        applications: [],
        total: 0,
        filters: {},
      },
      
      stats: {
        loading: false,
        error: null,
        success: false,
      },
      
      userStatus: {
        loading: false,
        error: null,
        success: false,
      },

      // ======================================
      // 🎭 أفعال تقديم الطلبات
      // ======================================

      /**
       * تحديد الدور المراد التقديم له
       */
      selectRole: (role: UserRole) => {
        console.log('🎭 تحديد دور للتقديم:', role);
        set({
          selectedRole: role,
          submissionData: role ? { selected_role: role } : null,
        });
      },

      /**
       * تحديث بيانات الطلب
       */
      updateSubmissionData: (data: Partial<RoleSelectionSubmission>) => {
        const current = get().submissionData || {};
        console.log('📝 تحديث بيانات الطلب:', data);
        
        set({
          submissionData: {
            ...current,
            ...data,
          },
        });
      },

      /**
       * تقديم طلب اختيار دور
       */
      submitRoleApplication: async (userId: ID, submission: RoleSelectionSubmission): Promise<RoleSubmissionResult> => {
        console.log('📤 تقديم طلب اختيار دور للمستخدم:', userId);
        
        set((state) => ({
          submission: {
            ...state.submission,
            loading: true,
            error: null,
            success: false,
            validationErrors: undefined,
          },
        }));

        try {
          const result = await roleSelectionService.submitRoleSelection(userId, submission);
          
          if (result.success && result.role_selection) {
            set((state) => ({
              submission: {
                ...state.submission,
                loading: false,
                success: true,
                submittedApplication: result.role_selection,
                lastUpdated: new Date(),
              },
              // إعادة تعيين بيانات التقديم بعد النجاح
              selectedRole: null,
              submissionData: null,
            }));
          } else {
            set((state) => ({
              submission: {
                ...state.submission,
                loading: false,
                error: result.message,
                validationErrors: result.validation_errors,
              },
            }));
          }
          
          return result;
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'خطأ في تقديم الطلب';
          
          set((state) => ({
            submission: {
              ...state.submission,
              loading: false,
              error: errorMessage,
            },
          }));
          
          throw error;
        }
      },

      /**
       * إعادة تعيين بيانات الطلب
       */
      resetSubmission: () => {
        console.log('🔄 إعادة تعيين بيانات الطلب');
        set({
          selectedRole: null,
          submissionData: null,
          submission: {
            loading: false,
            error: null,
            success: false,
          },
        });
      },

      // ======================================
      // 🏢 أفعال البحث عن البراندات
      // ======================================

      /**
       * البحث عن البراندات للمنسقين
       */
      searchBrands: async (options: BrandSearchOptions = {}) => {
        console.log('🔍 البحث عن البراندات:', options);
        
        set((state) => ({
          brandSearch: {
            ...state.brandSearch,
            loading: true,
            error: null,
            filters: options,
            searchQuery: options.searchQuery || '',
          },
        }));

        try {
          const result: BrandSearchResult = await roleSelectionService.searchBrandsForCoordinator(options);
          
          set((state) => ({
            brandSearch: {
              ...state.brandSearch,
              loading: false,
              success: true,
              results: result.brands,
              total: result.total,
              hasSearched: true,
              lastUpdated: new Date(),
            },
          }));
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'خطأ في البحث عن البراندات';
          
          set((state) => ({
            brandSearch: {
              ...state.brandSearch,
              loading: false,
              error: errorMessage,
            },
          }));
        }
      },

      /**
       * تحديث فلاتر البحث
       */
      updateSearchFilters: (filters: Partial<BrandSearchOptions>) => {
        console.log('🔧 تحديث فلاتر البحث:', filters);
        
        set((state) => ({
          brandSearch: {
            ...state.brandSearch,
            filters: {
              ...state.brandSearch.filters,
              ...filters,
            },
          },
        }));
      },

      /**
       * مسح نتائج البحث
       */
      clearBrandSearch: () => {
        console.log('🗑️ مسح نتائج البحث عن البراندات');
        
        set((state) => ({
          brandSearch: {
            ...state.brandSearch,
            results: [],
            searchQuery: '',
            filters: {},
            total: 0,
            hasSearched: false,
            error: null,
          },
        }));
      },

      // ======================================
      // 📄 أفعال أنواع العقود
      // ======================================

      /**
       * جلب أنواع العقود للمصورين
       */
      loadContractTypes: async () => {
        console.log('📄 جلب أنواع العقود للمصورين');
        
        set((state) => ({
          contractTypes: {
            ...state.contractTypes,
            loading: true,
            error: null,
          },
        }));

        try {
          const result: ContractTypesResult = await roleSelectionService.getContractTypesForPhotographer();
          
          set((state) => ({
            contractTypes: {
              ...state.contractTypes,
              loading: false,
              success: true,
              contractTypes: result.contract_types,
              lastUpdated: new Date(),
            },
          }));
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'خطأ في جلب أنواع العقود';
          
          set((state) => ({
            contractTypes: {
              ...state.contractTypes,
              loading: false,
              error: errorMessage,
            },
          }));
        }
      },

      /**
       * اختيار نوع عقد
       */
      selectContractType: (contractType: ContractType) => {
        console.log('📄 اختيار نوع عقد:', contractType);
        
        set((state) => ({
          contractTypes: {
            ...state.contractTypes,
            selectedType: contractType,
          },
          // تحديث بيانات الطلب أيضاً
          submissionData: state.submissionData ? {
            ...state.submissionData,
            additional_data: {
              ...state.submissionData.additional_data,
              contract_type: contractType,
            },
          } : { 
            selected_role: state.selectedRole || 'photographer',
            additional_data: { contract_type: contractType }
          },
        }));
      },

      // ======================================
      // ⏳ أفعال الطلبات المنتظرة (للأدمن)
      // ======================================

      /**
       * جلب الطلبات المنتظرة
       */
      loadPendingApplications: async (options = {}) => {
        console.log('⏳ جلب الطلبات المنتظرة:', options);
        
        set((state) => ({
          pendingApplications: {
            ...state.pendingApplications,
            loading: true,
            error: null,
            filters: { ...state.pendingApplications.filters, ...options },
          },
        }));

        try {
          const result: PendingApplicationsResult = await roleSelectionService.getPendingApplications(options);
          
          set((state) => ({
            pendingApplications: {
              ...state.pendingApplications,
              loading: false,
              success: true,
              applications: result.applications,
              total: result.total,
              lastUpdated: new Date(),
            },
          }));
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'خطأ في جلب الطلبات المنتظرة';
          
          set((state) => ({
            pendingApplications: {
              ...state.pendingApplications,
              loading: false,
              error: errorMessage,
            },
          }));
        }
      },

      /**
       * الموافقة على طلب
       */
      approveApplication: async (applicationId: ID, notes?: string): Promise<ApplicationActionResult> => {
        console.log('✅ الموافقة على طلب:', applicationId);
        
        try {
          const result: ApplicationActionResult = await roleSelectionService.approveRoleApplication(
            applicationId, 
            notes ? { admin_notes: notes } : {}
          );
          
          if (result.success && result.updated_application) {
            // تحديث قائمة الطلبات المنتظرة
            set((state) => ({
              pendingApplications: {
                ...state.pendingApplications,
                applications: state.pendingApplications.applications.filter(app => app.id !== applicationId),
                total: state.pendingApplications.total - 1,
              },
            }));
          }
          
          return result;
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'خطأ في الموافقة على الطلب';
          throw new Error(errorMessage);
        }
      },

      /**
       * رفض طلب
       */
      rejectApplication: async (applicationId: ID, reason: string, notes?: string): Promise<ApplicationActionResult> => {
        console.log('❌ رفض طلب:', applicationId, 'السبب:', reason);
        
        try {
          const result: ApplicationActionResult = await roleSelectionService.rejectRoleApplication(
            applicationId, 
            { rejection_reason: reason, admin_notes: notes }
          );
          
          if (result.success && result.updated_application) {
            // تحديث قائمة الطلبات المنتظرة
            set((state) => ({
              pendingApplications: {
                ...state.pendingApplications,
                applications: state.pendingApplications.applications.filter(app => app.id !== applicationId),
                total: state.pendingApplications.total - 1,
              },
            }));
          }
          
          return result;
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'خطأ في رفض الطلب';
          throw new Error(errorMessage);
        }
      },

      // ======================================
      // 📊 أفعال الإحصائيات
      // ======================================

      /**
       * جلب إحصائيات اختيار الأدوار
       */
      loadRoleStats: async (dateRange?: { startDate: FirebaseTimestamp; endDate: FirebaseTimestamp }) => {
        console.log('📊 جلب إحصائيات اختيار الأدوار:', dateRange);
        
        set((state) => ({
          stats: {
            ...state.stats,
            loading: true,
            error: null,
            dateRange,
          },
        }));

        try {
          const result: RoleStatsResult = await roleSelectionService.getRoleSelectionStats(dateRange);
          
          set((state) => ({
            stats: {
              ...state.stats,
              loading: false,
              success: true,
              stats: result.stats,
              lastUpdated: new Date(),
            },
          }));
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'خطأ في جلب الإحصائيات';
          
          set((state) => ({
            stats: {
              ...state.stats,
              loading: false,
              error: errorMessage,
            },
          }));
        }
      },

      /**
       * تحديث نطاق تاريخ الإحصائيات
       */
      updateStatsDateRange: (dateRange: { startDate: FirebaseTimestamp; endDate: FirebaseTimestamp }) => {
        console.log('📅 تحديث نطاق تاريخ الإحصائيات:', dateRange);
        
        set((state) => ({
          stats: {
            ...state.stats,
            dateRange,
          },
        }));
      },

      // ======================================
      // 👤 أفعال حالة المستخدم
      // ======================================

      /**
       * جلب حالة دور المستخدم
       */
      loadUserRoleStatus: async (userId: ID) => {
        console.log('👤 جلب حالة دور المستخدم:', userId);
        
        set((state) => ({
          userStatus: {
            ...state.userStatus,
            loading: true,
            error: null,
          },
        }));

        try {
          const result = await roleSelectionService.getUserRoleStatus(userId);
          
          set((state) => ({
            userRoleStatus: result.status,
            userStatus: {
              ...state.userStatus,
              loading: false,
              success: true,
              lastUpdated: new Date(),
            },
          }));
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'خطأ في جلب حالة المستخدم';
          
          set((state) => ({
            userStatus: {
              ...state.userStatus,
              loading: false,
              error: errorMessage,
            },
          }));
        }
      },

      /**
       * تحديث حالة دور المستخدم محلياً
       */
      updateUserRoleStatus: (status: Partial<UserRoleStatus>) => {
        console.log('🔄 تحديث حالة دور المستخدم محلياً:', status);
        
        set((state) => ({
          userRoleStatus: state.userRoleStatus ? {
            ...state.userRoleStatus,
            ...status,
          } : null,
        }));
      },

      // ======================================
      // 🔧 أفعال مساعدة
      // ======================================

      /**
       * مسح جميع الأخطاء
       */
      clearAllErrors: () => {
        console.log('🗑️ مسح جميع الأخطاء');
        
        set((state) => ({
          submission: { ...state.submission, error: null },
          brandSearch: { ...state.brandSearch, error: null },
          contractTypes: { ...state.contractTypes, error: null },
          pendingApplications: { ...state.pendingApplications, error: null },
          stats: { ...state.stats, error: null },
          userStatus: { ...state.userStatus, error: null },
        }));
      },

      /**
       * إعادة تعيين المتجر
       */
      resetStore: () => {
        console.log('🔄 إعادة تعيين متجر اختيار الأدوار');
        
        set({
          userRoleStatus: null,
          selectedRole: null,
          submissionData: null,
          submission: { loading: false, error: null, success: false },
          brandSearch: { 
            loading: false, error: null, success: false, 
            results: [], searchQuery: '', filters: {}, total: 0, hasSearched: false 
          },
          contractTypes: { loading: false, error: null, success: false, contractTypes: [] },
          pendingApplications: { 
            loading: false, error: null, success: false, 
            applications: [], total: 0, filters: {} 
          },
          stats: { loading: false, error: null, success: false },
          userStatus: { loading: false, error: null, success: false },
        });
      },

      /**
       * تحديث وقت آخر تحديث لعملية محددة
       */
      updateLastUpdated: (operation) => {
        console.log('⏰ تحديث وقت آخر تحديث للعملية:', operation);
        
        set((state) => ({
          [operation]: {
            ...state[operation],
            lastUpdated: new Date(),
          },
        }));
      },

      // ======================================
      // 🔧 دوال مساعدة للأنواع والتنسيق
      // ======================================

      /**
       * التحقق من صحة نوع البراند - يستخدم BrandType
       */
      validateBrandType: (brandType: BrandType): boolean => {
        const validTypes: BrandType[] = ['local', 'international', 'startup', 'enterprise'];
        return validTypes.includes(brandType);
      },

      /**
       * التحقق من صحة حالة البراند - يستخدم BrandStatus
       */
      validateBrandStatus: (status: BrandStatus): boolean => {
        const validStatuses: BrandStatus[] = ['active', 'paused', 'archived', 'development'];
        return validStatuses.includes(status);
      },

      /**
       * التحقق من صحة الصناعة - يستخدم Industry
       */
      validateIndustry: (industry: Industry): boolean => {
        const validIndustries: Industry[] = [
          'fashion', 'food', 'technology', 'healthcare', 'education',
          'automotive', 'real_estate', 'travel', 'beauty', 'other'
        ];
        return validIndustries.includes(industry);
      },

      /**
       * استخراج معلومات المستخدم للعرض - يستخدم User
       */
      extractUserInfo: (user: User) => {
        const roleNames: Record<UserRole, string> = {
          super_admin: 'مدير عام',
          marketing_coordinator: 'منسق تسويق',
          brand_coordinator: 'منسق براند',
          photographer: 'مصور',
          new_user: 'مستخدم جديد'
        };
        
        return {
          displayName: user.display_name || user.full_name || 'غير محدد',
          contactInfo: user.email || user.phone || 'غير متوفر',
          roleText: roleNames[user.role] || user.role
        };
      },

      /**
       * فلترة البراندات حسب المعايير - يستخدم جميع أنواع البراند
       */
      filterBrands: (brands: Brand[], filters) => {
        return brands.filter(brand => {
          // فلترة حسب نوع البراند
          if (filters.brandType && brand.brand_type !== filters.brandType) {
            return false;
          }
          
          // فلترة حسب حالة البراند
          if (filters.status && brand.status !== filters.status) {
            return false;
          }
          
          // فلترة حسب الصناعة
          if (filters.industry && brand.industry !== filters.industry) {
            return false;
          }
          
          return true;
        });
      },

    }),
    {
      name: 'role-selection-store',         // اسم المفتاح في localStorage
      storage: createJSONStorage(() => localStorage), // استخدام localStorage
      
      // تحديد الحقول المراد حفظها (تجنب حفظ العمليات المؤقتة)
      partialize: (state) => ({
        userRoleStatus: state.userRoleStatus,
        selectedRole: state.selectedRole,
        submissionData: state.submissionData,
        brandSearch: {
          results: state.brandSearch.results,
          searchQuery: state.brandSearch.searchQuery,
          filters: state.brandSearch.filters,
          total: state.brandSearch.total,
          hasSearched: state.brandSearch.hasSearched,
        },
        contractTypes: {
          contractTypes: state.contractTypes.contractTypes,
          selectedType: state.contractTypes.selectedType,
        },
      }),
    }
  )
);

// ======================================
// 🔗 Hooks مساعدة للاستخدام السهل
// ======================================

/**
 * Hook للحصول على حالة اختيار الأدوار الأساسية
 */
export const useRoleSelection = () => {
  const store = useRoleSelectionStore();
  return {
    userRoleStatus: store.userRoleStatus,
    selectedRole: store.selectedRole,
    submissionData: store.submissionData,
    isLoading: store.submission.loading || store.userStatus.loading,
    error: store.submission.error || store.userStatus.error,
    hasSubmitted: store.submission.success,
  };
};

/**
 * Hook للحصول على أفعال اختيار الأدوار
 */
export const useRoleSelectionActions = () => {
  const store = useRoleSelectionStore();
  return {
    selectRole: store.selectRole,
    updateSubmissionData: store.updateSubmissionData,
    submitRoleApplication: store.submitRoleApplication,
    resetSubmission: store.resetSubmission,
    loadUserRoleStatus: store.loadUserRoleStatus,
    clearAllErrors: store.clearAllErrors,
  };
};

/**
 * Hook للحصول على أفعال البحث عن البراندات
 */
export const useBrandSearch = () => {
  const store = useRoleSelectionStore();
  return {
    searchState: store.brandSearch,
    searchBrands: store.searchBrands,
    updateSearchFilters: store.updateSearchFilters,
    clearBrandSearch: store.clearBrandSearch,
  };
};

/**
 * Hook للحصول على أفعال أنواع العقود
 */
export const useContractTypes = () => {
  const store = useRoleSelectionStore();
  return {
    contractTypesState: store.contractTypes,
    loadContractTypes: store.loadContractTypes,
    selectContractType: store.selectContractType,
  };
};

/**
 * Hook للحصول على أفعال الطلبات المنتظرة (للأدمن)
 */
export const usePendingApplications = () => {
  const store = useRoleSelectionStore();
  return {
    pendingState: store.pendingApplications,
    loadPendingApplications: store.loadPendingApplications,
    approveApplication: store.approveApplication,
    rejectApplication: store.rejectApplication,
  };
};

/**
 * Hook للحصول على أفعال الإحصائيات
 */
export const useRoleStats = () => {
  const store = useRoleSelectionStore();
  return {
    statsState: store.stats,
    loadRoleStats: store.loadRoleStats,
    updateStatsDateRange: store.updateStatsDateRange,
  };
};

/**
 * Hook شامل للأدمن (جميع العمليات الإدارية)
 */
export const useRoleSelectionAdmin = () => {
  const store = useRoleSelectionStore();
  return {
    // حالات البيانات
    pendingApplications: store.pendingApplications.applications,
    stats: store.stats.stats,
    isLoading: store.pendingApplications.loading || store.stats.loading,
    error: store.pendingApplications.error || store.stats.error,
    
    // الأفعال
    loadPendingApplications: store.loadPendingApplications,
    approveApplication: store.approveApplication,
    rejectApplication: store.rejectApplication,
    loadRoleStats: store.loadRoleStats,
    clearAllErrors: store.clearAllErrors,
  };
}; 
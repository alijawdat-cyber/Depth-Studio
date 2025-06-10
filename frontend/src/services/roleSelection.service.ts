/**
 * 🎭 خدمة اختيار الأدوار - Depth Studio Frontend
 * ==============================================
 * 
 * 📅 محدث: يونيو 2025
 * 👨‍💻 المطور: علي جودت
 * 🎯 الهدف: إدارة عملية اختيار الأدوار في الفرونت إند بالكامل
 * 
 * 🎭 الأدوار المدعومة:
 * - منسق التسويق (marketing_coordinator)
 * - منسق البراند (brand_coordinator) 
 * - مصور (photographer)
 * 
 * 🔑 المميزات الرئيسية:
 * - تقديم طلبات اختيار الأدوار مع validation شامل
 * - البحث عن البراندات المتاحة لمنسقي البراند
 * - عرض أنواع العقود المتاحة للمصورين
 * - متابعة حالة الطلبات المقدمة
 * - إحصائيات شاملة لاختيار الأدوار
 * - تكامل كامل مع Backend RoleSelectionService (906 سطر)
 * 
 * 🔗 APIs المربوطة (8 endpoints متوافقة مع Backend):
 * - submitRoleSelection: POST /api/roles/:user_id/select
 * - getBrandsList: GET /api/roles/brands/search
 * - getContractTypes: GET /api/roles/photographer/contract-types
 * - getPendingApplications: GET /api/roles/pending-applications
 * - approveApplication: PATCH /api/roles/applications/:id/approve
 * - rejectApplication: PATCH /api/roles/applications/:id/reject
 * - getSelectionStats: GET /api/roles/selection-stats
 * - getRoleStatus: GET /api/roles/user/:userId/status
 */

import { apiClient } from './api/api-client';

// ======================================
// 📦 استيرادات الأنواع من @depth-studio/types
// ======================================

import {
  // 🎭 أنواع اختيار الأدوار - الأساسية لعمل الخدمة
  RoleSelection,                    // 📋 يمثل طلب اختيار دور مع جميع بياناته (user_id, selected_role, status, etc.)
  RoleSelectionSubmission,          // 📝 بيانات تقديم طلب جديد (selected_role + additional_data للمصور/منسق)
  RoleSelectionStats,               // 📊 إحصائيات شاملة لاختيار الأدوار (عدد الطلبات، نسب الموافقة، etc.)
  
  // 👥 أنواع المستخدمين والبراندات - للتعامل مع بيانات المستخدمين والبراندات
  User,                             // 👤 نوع المستخدم الكامل - يُستخدم في UserRoleStatus و تفاصيل المتقدمين
  Brand,                            // 🏢 نوع البراند الكامل - للبحث وعرض البراندات للمنسقين
  ID,                               // 🆔 نوع المعرف الموحد - لجميع معرفات المستخدمين والطلبات والبراندات
  
  // 🎯 التعدادات المطلوبة - لفهم أنواع الأدوار والعقود والبراندات
  UserRole,                         // 🎭 أدوار المستخدمين (photographer, brand_coordinator, marketing_coordinator)
  ContractType,                     // 📄 أنواع عقود المصورين (freelancer, salary)
  BrandType,                        // 🏢 أنواع البراندات (local, international, startup, enterprise)
  BrandStatus,                      // 🔄 حالات البراندات (active, paused, archived, development)
  Industry,                         // 🏭 الصناعات (fashion, food, technology, etc.)
  
  // ⏰ أنواع الطوابع الزمنية - لإدارة التواريخ والأوقات
  FirebaseTimestamp                 // 📅 طوابع زمنية Firebase - للتعامل مع تواريخ التقديم والموافقة
} from '@depth-studio/types';

// ======================================
// 🎭 واجهات خاصة بخدمة اختيار الأدوار
// ======================================

/** خيارات البحث عن البراندات لمنسقي البراند */
export interface BrandSearchOptions {
  searchQuery?: string;                  // نص البحث في اسم البراند
  brand_type?: BrandType;                // نوع البراند للفلترة
  industry?: Industry;                   // الصناعة للفلترة
  status?: BrandStatus;                  // حالة البراند للفلترة
  has_coordinator?: boolean;             // فلترة البراندات التي لديها/ليس لديها منسق
  limit?: number;                        // عدد النتائج المطلوبة
}

/** نتيجة البحث عن البراندات */
export interface BrandSearchResult {
  brands: Brand[];                       // قائمة البراندات المطابقة للبحث
  total: number;                         // العدد الإجمالي للنتائج
  message: string;                       // رسالة توضيحية للنتيجة
}

/** معلومات أنواع العقود للمصورين */
export interface ContractTypeInfo {
  type: ContractType;                    // نوع العقد (freelancer أو salary)
  name_ar: string;                       // الاسم بالعربية
  name_en: string;                       // الاسم بالإنجليزية
  description: string;                   // وصف العقد ومتطلباته
  benefits: string[];                    // قائمة المزايا لهذا النوع من العقد
}

/** نتيجة الحصول على أنواع العقود */
export interface ContractTypesResult {
  contract_types: ContractTypeInfo[];    // قائمة أنواع العقود المتاحة
  message: string;                       // رسالة توضيحية
}

/** خيارات الحصول على الطلبات المنتظرة */
export interface PendingApplicationsOptions {
  role?: UserRole;                       // فلترة حسب الدور المطلوب
  limit?: number;                        // عدد النتائج المطلوبة
  orderBy?: 'applied_at' | 'updated_at'; // ترتيب حسب تاريخ التقديم أو التحديث
  orderDirection?: 'asc' | 'desc';       // اتجاه الترتيب (تصاعدي أو تنازلي)
}

/** نتيجة الحصول على الطلبات المنتظرة */
export interface PendingApplicationsResult {
  applications: RoleSelection[];         // قائمة طلبات اختيار الأدوار المنتظرة
  total: number;                         // العدد الإجمالي للطلبات
  message: string;                       // رسالة توضيحية
}

/** خيارات موافقة على طلب */
export interface ApprovalOptions {
  admin_notes?: string;                  // ملاحظات الأدمن على الموافقة
}

/** خيارات رفض طلب */
export interface RejectionOptions {
  rejection_reason: string;              // سبب الرفض (مطلوب)
  admin_notes?: string;                  // ملاحظات إضافية من الأدمن
}

/** نتيجة عملية الموافقة أو الرفض */
export interface ApplicationActionResult {
  success: boolean;                      // هل العملية نجحت
  message: string;                       // رسالة توضيحية للنتيجة
  updated_application?: RoleSelection;   // الطلب المحدث بعد العملية
}

/** نتيجة الحصول على إحصائيات اختيار الأدوار */
export interface RoleStatsResult {
  stats: RoleSelectionStats;             // الإحصائيات الشاملة
  message: string;                       // رسالة توضيحية
}

/** حالة دور المستخدم الشاملة */
export interface UserRoleStatus {
  user_id: ID;                           // معرف المستخدم
  user: User;                            // 👤 بيانات المستخدم الكاملة (الاسم، البريد، الهاتف، etc.)
  current_role: UserRole;                // الدور الحالي للمستخدم
  has_pending_application: boolean;      // هل لديه طلب منتظر للموافقة
  pending_application?: RoleSelection;   // الطلب المنتظر (إن وجد)
  role_selection_history: RoleSelection[]; // تاريخ جميع طلبات الأدوار السابقة
  last_application_date?: FirebaseTimestamp; // تاريخ آخر طلب قدمه
  approval_rate: number;                 // معدل الموافقة على طلباته (نسبة مئوية)
  total_applications: number;            // إجمالي عدد الطلبات المقدمة
  approved_applications: number;         // عدد الطلبات المقبولة
  rejected_applications: number;         // عدد الطلبات المرفوضة
}

/** نتيجة تقديم طلب اختيار دور */
export interface RoleSubmissionResult {
  success: boolean;                      // هل العملية نجحت
  role_selection?: RoleSelection;        // بيانات الطلب المقدم (إذا نجح)
  message: string;                       // رسالة توضيحية للنتيجة
  validation_errors?: string[];          // قائمة أخطاء التحقق (إن وجدت)
}

/** إحصائيات متقدمة للأدوار */
export interface AdvancedRoleStats {
  stats: RoleSelectionStats;             // الإحصائيات الأساسية
  trends: {                              // اتجاهات الطلبات
    weekly_applications: number[];       // عدد الطلبات الأسبوعية
    monthly_approvals: number[];         // عدد الموافقات الشهرية
    popular_roles: Array<{               // الأدوار الأكثر طلباً
      role: UserRole;
      count: number;
      percentage: number;
    }>;
  };
  performance: {                         // أداء النظام
    average_response_time_hours: number; // متوسط وقت الاستجابة
    fastest_approval_hours: number;      // أسرع موافقة
    slowest_approval_hours: number;      // أبطأ موافقة
  };
}

// ======================================
// 🎭 خدمة اختيار الأدوار الرئيسية
// ======================================

/**
 * خدمة اختيار الأدوار - متكاملة مع Backend RoleSelectionService
 * 
 * تدير جميع عمليات اختيار الأدوار في النظام:
 * - تقديم طلبات الأدوار مع التحقق المسبق
 * - البحث عن البراندات للمنسقين
 * - إدارة أنواع العقود للمصورين
 * - متابعة الطلبات والموافقات
 * - إحصائيات شاملة للأدوار
 * 
 * 🔗 متوافقة 100% مع Backend RoleSelectionService (906 سطر)
 */
export class RoleSelectionService {
  
  // الأدوار المسموحة للاختيار (متطابقة مع Backend)
  private readonly allowedRoles: UserRole[] = [
    'marketing_coordinator',
    'brand_coordinator', 
    'photographer'
  ];

  // أنواع العقود المتاحة للمصورين (متطابقة مع Backend)
  private readonly contractTypes: ContractType[] = [
    'freelancer',
    'salary'
  ];

  // ======================================
  // 📝 تقديم طلبات اختيار الأدوار
  // ======================================

  /**
   * تقديم طلب اختيار دور جديد
   * 🔗 يتكامل مع: POST /api/roles/:user_id/select
   * 
   * يستقبل معرف المستخدم وبيانات الطلب، يتحقق من صحتها،
   * ثم يرسلها للباك إند لحفظها ومعالجتها
   */
  async submitRoleSelection(
    userId: ID, 
    submission: RoleSelectionSubmission
  ): Promise<RoleSubmissionResult> {
    try {
      // التحقق من صحة البيانات قبل الإرسال للباك إند
      const validationResult = this.validateRoleSubmission(submission);
      if (!validationResult.isValid) {
        return {
          success: false,
          message: 'بيانات الطلب غير صحيحة',
          validation_errors: validationResult.errors
        };
      }

      // إرسال الطلب للباك إند مع معرف المستخدم في URL
      const response = await apiClient.post<RoleSubmissionResult>(
        `/api/roles/${userId}/select`,
        submission
      );

      if (response.data.success) {
        return {
          success: true,
          role_selection: response.data.role_selection,
          message: response.data.message || 'تم تقديم طلبك بنجاح وهو قيد المراجعة'
        };
      } else {
        return {
          success: false,
          message: response.data.message || 'خطأ في تقديم الطلب'
        };
      }

    } catch (error) {
      console.error('❌ خطأ في تقديم طلب اختيار الدور:', error);
      return {
        success: false,
        message: 'حدث خطأ أثناء تقديم الطلب، يرجى المحاولة مرة أخرى'
      };
    }
  }

  /**
   * البحث عن البراندات المتاحة لمنسقي البراند
   * 🔗 يتكامل مع: GET /api/roles/brands/search
   * 
   * يبحث في البراندات المتاحة حسب المعايير المطلوبة
   * ويعيد قائمة Brand[] للاختيار من بينها
   */
  async searchBrandsForCoordinator(options: BrandSearchOptions = {}): Promise<BrandSearchResult> {
    try {
      // إعداد معاملات البحث للإرسال مع الطلب
      const searchParams = new URLSearchParams();
      
      if (options.searchQuery) {
        searchParams.append('q', options.searchQuery);
      }
      if (options.brand_type) {
        searchParams.append('brand_type', options.brand_type);
      }
      if (options.industry) {
        searchParams.append('industry', options.industry);
      }
      if (options.status) {
        searchParams.append('status', options.status);
      }
      if (options.has_coordinator !== undefined) {
        searchParams.append('has_coordinator', options.has_coordinator.toString());
      }
      if (options.limit) {
        searchParams.append('limit', options.limit.toString());
      }

      // إرسال طلب البحث للباك إند
      const response = await apiClient.get<BrandSearchResult>(
        `/api/roles/brands/search?${searchParams.toString()}`
      );

      return response.data;

    } catch (error) {
      console.error('❌ خطأ في البحث عن البراندات:', error);
      return {
        brands: [],
        total: 0,
        message: 'حدث خطأ أثناء البحث عن البراندات'
      };
    }
  }

  /**
   * الحصول على أنواع العقود المتاحة للمصورين
   * 🔗 يتكامل مع: GET /api/roles/photographer/contract-types
   * 
   * يعيد قائمة ContractTypeInfo[] مع تفاصيل كل نوع عقد
   * (freelancer vs salary) مع المزايا والأوصاف
   */
  async getContractTypesForPhotographer(): Promise<ContractTypesResult> {
    try {
      const response = await apiClient.get<ContractTypesResult>(
        '/api/roles/photographer/contract-types'
      );

      return response.data;

    } catch (error) {
      console.error('❌ خطأ في الحصول على أنواع العقود:', error);
      return {
        contract_types: [],
        message: 'حدث خطأ أثناء الحصول على أنواع العقود'
      };
    }
  }

  // ======================================
  // 📋 إدارة الطلبات (للأدمنز)
  // ======================================

  /**
   * الحصول على الطلبات المنتظرة للموافقة
   * 🔗 يتكامل مع: GET /api/roles/pending-applications
   * 
   * يعيد قائمة RoleSelection[] للطلبات المنتظرة مع إمكانية الفلترة والترتيب
   */
  async getPendingApplications(options: PendingApplicationsOptions = {}): Promise<PendingApplicationsResult> {
    try {
      const searchParams = new URLSearchParams();
      
      if (options.role) {
        searchParams.append('role', options.role);
      }
      if (options.limit) {
        searchParams.append('limit', options.limit.toString());
      }
      if (options.orderBy) {
        searchParams.append('orderBy', options.orderBy);
      }
      if (options.orderDirection) {
        searchParams.append('orderDirection', options.orderDirection);
      }

      const response = await apiClient.get<PendingApplicationsResult>(
        `/api/roles/pending-applications?${searchParams.toString()}`
      );

      return response.data;

    } catch (error) {
      console.error('❌ خطأ في الحصول على الطلبات المنتظرة:', error);
      return {
        applications: [],
        total: 0,
        message: 'حدث خطأ أثناء الحصول على الطلبات المنتظرة'
      };
    }
  }

  /**
   * الموافقة على طلب اختيار دور
   * 🔗 يتكامل مع: PATCH /api/roles/applications/:id/approve
   * 
   * يوافق على طلب معين ويحديث حالة المستخدم
   */
  async approveRoleApplication(
    applicationId: ID,
    options: ApprovalOptions = {}
  ): Promise<ApplicationActionResult> {
    try {
      const response = await apiClient.patch<ApplicationActionResult>(
        `/api/roles/applications/${applicationId}/approve`,
        options
      );

      return response.data;

    } catch (error) {
      console.error('❌ خطأ في الموافقة على الطلب:', error);
      return {
        success: false,
        message: 'حدث خطأ أثناء الموافقة على الطلب'
      };
    }
  }

  /**
   * رفض طلب اختيار دور
   * 🔗 يتكامل مع: PATCH /api/roles/applications/:id/reject
   * 
   * يرفض طلب معين مع تسجيل سبب الرفض
   */
  async rejectRoleApplication(
    applicationId: ID,
    options: RejectionOptions
  ): Promise<ApplicationActionResult> {
    try {
      const response = await apiClient.patch<ApplicationActionResult>(
        `/api/roles/applications/${applicationId}/reject`,
        options
      );

      return response.data;

    } catch (error) {
      console.error('❌ خطأ في رفض الطلب:', error);
      return {
        success: false,
        message: 'حدث خطأ أثناء رفض الطلب'
      };
    }
  }

  // ======================================
  // 📊 الإحصائيات والتحليلات
  // ======================================

  /**
   * الحصول على إحصائيات اختيار الأدوار
   * 🔗 يتكامل مع: GET /api/roles/selection-stats
   * 
   * يعيد RoleSelectionStats شاملة مع إمكانية فلترة حسب فترة زمنية
   */
  async getRoleSelectionStats(
    dateRange?: {
      startDate: FirebaseTimestamp;
      endDate: FirebaseTimestamp;
    }
  ): Promise<RoleStatsResult> {
    try {
      const searchParams = new URLSearchParams();
      
      if (dateRange?.startDate) {
        searchParams.append('startDate', dateRange.startDate.toDate().toISOString());
      }
      if (dateRange?.endDate) {
        searchParams.append('endDate', dateRange.endDate.toDate().toISOString());
      }

      const response = await apiClient.get<RoleStatsResult>(
        `/api/roles/selection-stats?${searchParams.toString()}`
      );

      return response.data;

    } catch (error) {
      console.error('❌ خطأ في الحصول على إحصائيات الأدوار:', error);
      return {
        stats: {
          total_applications: 0,
          pending_applications: 0,
          approved_applications: 0,
          rejected_applications: 0,
          applications_by_role: {},
          average_approval_time_hours: 0,
          approval_rate_percentage: 0
        },
        message: 'حدث خطأ أثناء الحصول على الإحصائيات'
      };
    }
  }

  /**
   * الحصول على حالة دور مستخدم معين
   * 🔗 يتكامل مع: GET /api/roles/user/:userId/status
   * 
   * يعيد UserRoleStatus شاملة تتضمن User وتاريخ الطلبات والإحصائيات
   */
  async getUserRoleStatus(userId: ID): Promise<{
    status: UserRoleStatus | null;
    message: string;
  }> {
    try {
      const response = await apiClient.get<{
        status: UserRoleStatus;
        message: string;
      }>(`/api/roles/user/${userId}/status`);

      return response.data;

    } catch (error) {
      console.error('❌ خطأ في الحصول على حالة دور المستخدم:', error);
      return {
        status: null,
        message: 'حدث خطأ أثناء الحصول على حالة الدور'
      };
    }
  }

  // ======================================
  // 🔧 دوال مساعدة وValidation
  // ======================================

  /**
   * التحقق من صحة بيانات تقديم طلب الدور
   * يستخدم UserRole وContractType للتحقق من صحة البيانات
   */
  private validateRoleSubmission(submission: RoleSelectionSubmission): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // التحقق من الدور المختار باستخدام allowedRoles
    if (!this.allowedRoles.includes(submission.selected_role)) {
      errors.push('الدور المختار غير مدعوم');
    }

    // التحقق من متطلبات دور المصور
    if (submission.selected_role === 'photographer') {
      if (!submission.additional_data?.contract_type) {
        errors.push('نوع العقد مطلوب للمصورين');
      } else if (!this.contractTypes.includes(submission.additional_data.contract_type)) {
        errors.push('نوع العقد المختار غير صحيح');
      }

      if (!submission.additional_data?.specializations || submission.additional_data.specializations.length === 0) {
        errors.push('التخصصات مطلوبة للمصورين');
      }

      if (!submission.additional_data?.experience_years || submission.additional_data.experience_years < 0) {
        errors.push('سنوات الخبرة مطلوبة ويجب أن تكون أكبر من أو تساوي الصفر');
      }
    }

    // التحقق من متطلبات منسق البراند - يحتاج Brand ID
    if (submission.selected_role === 'brand_coordinator') {
      if (!submission.additional_data?.selected_brand_id) {
        errors.push('يجب اختيار براند للعمل معه');
      }
    }

    // التحقق من متطلبات منسق التسويق
    if (submission.selected_role === 'marketing_coordinator') {
      if (!submission.additional_data?.marketing_experience) {
        errors.push('الخبرة التسويقية مطلوبة لمنسقي التسويق');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * التحقق من السماح بالدور - يستخدم UserRole
   */
  isRoleAllowed(role: UserRole): boolean {
    return this.allowedRoles.includes(role);
  }

  /**
   * الحصول على أنواع العقود المدعومة - يعيد ContractType[]
   */
  getSupportedContractTypes(): ContractType[] {
    return [...this.contractTypes];
  }

  /**
   * الحصول على الأدوار المدعومة - يعيد UserRole[]
   */
  getSupportedRoles(): UserRole[] {
    return [...this.allowedRoles];
  }

  /**
   * تنسيق اسم الدور باللغة العربية - يستخدم UserRole
   */
  formatRoleNameArabic(role: UserRole): string {
    const roleNames: Record<UserRole, string> = {
      'super_admin': 'مدير النظام',
      'marketing_coordinator': 'منسق التسويق',
      'brand_coordinator': 'منسق البراند',
      'photographer': 'مصور',
      'new_user': 'مستخدم جديد'
    };

    return roleNames[role] || role;
  }

  /**
   * تنسيق اسم نوع العقد باللغة العربية - يستخدم ContractType
   */
  formatContractTypeArabic(contractType: ContractType): string {
    const contractNames: Record<ContractType, string> = {
      'freelancer': 'عمل حر',
      'salary': 'راتب ثابت'
    };

    return contractNames[contractType] || contractType;
  }

  /**
   * تنسيق اسم نوع البراند باللغة العربية - يستخدم BrandType
   */
  formatBrandTypeArabic(brandType: BrandType): string {
    const brandTypeNames: Record<BrandType, string> = {
      'local': 'محلي',
      'international': 'دولي',
      'startup': 'ناشئ',
      'enterprise': 'مؤسسي'
    };

    return brandTypeNames[brandType] || brandType;
  }

  /**
   * تنسيق اسم الصناعة باللغة العربية - يستخدم Industry
   */
  formatIndustryArabic(industry: Industry): string {
    const industryNames: Record<Industry, string> = {
      'fashion': 'الأزياء',
      'food': 'الطعام',
      'technology': 'التكنولوجيا',
      'healthcare': 'الرعاية الصحية',
      'education': 'التعليم',
      'automotive': 'السيارات',
      'real_estate': 'العقارات',
      'travel': 'السفر',
      'beauty': 'الجمال',
      'other': 'أخرى'
    };

    return industryNames[industry] || industry;
  }

  /**
   * تنسيق اسم حالة البراند باللغة العربية - يستخدم BrandStatus
   */
  formatBrandStatusArabic(status: BrandStatus): string {
    const statusNames: Record<BrandStatus, string> = {
      'active': 'نشط',
      'paused': 'متوقف',
      'archived': 'مؤرشف',
      'development': 'قيد التطوير'
    };

    return statusNames[status] || status;
  }

  /**
   * حساب معدل الموافقة على الطلبات
   */
  calculateApprovalRate(approved: number, total: number): number {
    return total > 0 ? Math.round((approved / total) * 100) : 0;
  }

  /**
   * تنسيق وقت الموافقة بالساعات - يستخدم مع FirebaseTimestamp
   */
  formatApprovalTimeHours(hours: number): string {
    if (hours < 1) {
      return 'أقل من ساعة';
    } else if (hours < 24) {
      return `${Math.round(hours)} ساعة`;
    } else {
      const days = Math.round(hours / 24);
      return `${days} ${days === 1 ? 'يوم' : 'أيام'}`;
    }
  }

  /**
   * استخراج معلومات مفيدة من User في UserRoleStatus
   */
  extractUserDisplayInfo(user: User): {
    displayName: string;
    contactInfo: string;
    authMethods: string[];
  } {
    return {
      displayName: user.display_name || user.full_name || 'غير محدد',
      contactInfo: user.email || user.phone || 'غير متوفر',
      authMethods: user.auth_methods?.map(method => method.type) || []
    };
  }

  /**
   * فلترة البراندات حسب معايير متقدمة
   */
  filterBrands(brands: Brand[], criteria: Partial<BrandSearchOptions>): Brand[] {
    return brands.filter(brand => {
      if (criteria.brand_type && brand.brand_type !== criteria.brand_type) {
        return false;
      }
      if (criteria.industry && brand.industry !== criteria.industry) {
        return false;
      }
      if (criteria.status && brand.status !== criteria.status) {
        return false;
      }
      if (criteria.has_coordinator !== undefined) {
        const hasCoordinator = !!brand.assigned_coordinator;
        if (criteria.has_coordinator !== hasCoordinator) {
          return false;
        }
      }
      return true;
    });
  }
}

// إنشاء نسخة واحدة من الخدمة للاستخدام المشترك
export const roleSelectionService = new RoleSelectionService();

// التصدير الافتراضي
export default roleSelectionService; 
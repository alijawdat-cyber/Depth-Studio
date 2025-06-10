/**
 * 👥 Frontend User Validators - تحقق المستخدمين في الفرونت إند
 * ================================================================
 * 
 * نظام validation شامل للمستخدمين مع تكامل كامل مع Backend UserValidators
 * يدعم جميع عمليات المستخدمين مع رسائل خطأ عربية وتحقق فوري
 * 
 * 📅 تاريخ الإنشاء: يونيو 2025
 * 👨‍💻 المطور: علي جودت
 * 🎯 الهدف: validation متقدم للمستخدمين في Frontend
 * 🔗 Backend Reference: UserValidators.ts (338 سطر)
 * 📋 Types Reference: users.ts (143 سطر)
 */

import { 
  User,
  UserPermissions,
  PhotographerInfo,
  ValidationResult,
  ValidationError,
  FrontendValidationOptions
} from '@depth-studio/types';

import { 
  UserRole,
  UserStatus,
  AuthProvider,
  ContractType,
  DayOfWeek,
  LocationType,
  VerificationStatus
} from '@depth-studio/types';

import { 
  FrontendBaseValidator, 
  ARABIC_MESSAGES,
  FieldValidationRules,
  ValidationRuleType
} from './frontend-base-validator';

// ======================================
// 🌐 رسائل خطأ خاصة بالمستخدمين
// ======================================

const USER_MESSAGES = {
  ...ARABIC_MESSAGES,
  
  // إضافة الرسائل المفقودة من auth validators
  full_name_too_short: "الاسم قصير جداً، يجب أن يكون على الأقل كلمتان",
  full_name_invalid_format: "الاسم يجب أن يحتوي على حروف فقط",
  
  // رسائل المستخدمين المخصصة
  user_not_found: "المستخدم غير موجود",
  user_already_exists: "المستخدم موجود مسبقاً",
  user_inactive: "المستخدم غير مفعل",
  user_suspended: "المستخدم موقوف",
  
  // الأدوار والصلاحيات
  role_invalid: "الدور المحدد غير صحيح",
  role_not_allowed: "غير مسموح بهذا الدور",
  permission_denied: "ليس لديك صلاحية لهذا الإجراء",
  insufficient_permissions: "صلاحياتك غير كافية",
  
  // الحالة
  status_invalid: "حالة المستخدم غير صحيحة",
  status_transition_invalid: "لا يمكن تغيير الحالة من الحالة الحالية",
  
  // الملف الشخصي
  display_name_too_short: "اسم العرض قصير جداً",
  display_name_invalid_chars: "اسم العرض يحتوي على أحرف غير مسموحة",
  bio_too_long: "الوصف الشخصي طويل جداً (الحد الأقصى 500 حرف)",
  
  // مقدم المصادقة
  auth_provider_invalid: "طريقة المصادقة غير صحيحة",
  auth_provider_required: "طريقة المصادقة مطلوبة",
  
  // المصور
  contract_type_invalid: "نوع العقد غير صحيح",
  salary_invalid: "الراتب يجب أن يكون رقم موجب",
  task_rate_invalid: "سعر المهمة يجب أن يكون رقم موجب",
  specialization_required: "يجب تحديد تخصص واحد على الأقل",
  skill_level_invalid: "مستوى المهارة غير صحيح",
  availability_days_required: "يجب تحديد يوم واحد متاح على الأقل",
  max_tasks_invalid: "عدد المهام المتزامنة يجب أن يكون بين 1 و 10",
  location_type_invalid: "نوع الموقع غير صحيح",
  
  // التحقق
  verification_status_invalid: "حالة التحقق غير صحيحة",
  phone_not_verified: "رقم الهاتف غير محقق",
  email_not_verified: "البريد الإلكتروني غير محقق",
  
  // البحث
  search_term_too_short: "مصطلح البحث قصير جداً (3 أحرف على الأقل)",
  search_no_criteria: "يجب تحديد معايير البحث",
  
  // الصفحات
  page_number_invalid: "رقم الصفحة يجب أن يكون رقم موجب",
  page_limit_invalid: "حد الصفحة يجب أن يكون بين 1 و 100"
} as const;

// ======================================
// 🏗️ User Validation Rules
// ======================================

const USER_VALIDATION_RULES = {
  
  // الاسم الكامل المحسن (متوافق مع Backend)
  full_name_enhanced: {
    type: 'custom' as ValidationRuleType,
    message: USER_MESSAGES.full_name_too_short,
    customValidator: (value: unknown): boolean => {
      if (typeof value !== 'string') return false;
      
      const trimmedName = value.trim();
      const words = trimmedName.split(/\s+/);
      
      // يجب أن يحتوي على كلمتين على الأقل (متوافق مع Backend)
      if (words.length < 2) return false;
      if (words.some(word => word.length < 2)) return false;
      
      // دعم الأحرف العربية والإنجليزية
      const allowedChars = /^[a-zA-Zا-ي\s]+$/;
      return allowedChars.test(trimmedName);
    }
  },
  
  // اسم العرض
  display_name: {
    type: 'custom' as ValidationRuleType,
    message: USER_MESSAGES.display_name_too_short,
    customValidator: (value: unknown): boolean => {
      if (typeof value !== 'string') return false;
      
      const trimmedName = value.trim();
      if (trimmedName.length < 2) return false;
      if (trimmedName.length > 50) return false;
      
      // أحرف وأرقام ومسافات فقط
      const allowedChars = /^[a-zA-Zا-ي0-9\s]+$/;
      return allowedChars.test(trimmedName);
    }
  },
  
  // الوصف الشخصي
  bio: {
    type: 'custom' as ValidationRuleType,
    message: USER_MESSAGES.bio_too_long,
    customValidator: (value: unknown): boolean => {
      if (typeof value !== 'string') return false;
      return value.length <= 500;
    }
  },
  
  // الدور (متوافق مع Backend)
  user_role: {
    type: 'custom' as ValidationRuleType,
    message: USER_MESSAGES.role_invalid,
    customValidator: (value: unknown): boolean => {
      const validRoles: UserRole[] = [
        'super_admin',
        'marketing_coordinator',
        'brand_coordinator',
        'photographer',
        'new_user'
      ];
      return validRoles.includes(value as UserRole);
    }
  },
  
  // حالة المستخدم (متوافق مع Backend)
  user_status: {
    type: 'custom' as ValidationRuleType,
    message: USER_MESSAGES.status_invalid,
    customValidator: (value: unknown): boolean => {
      const validStatuses: UserStatus[] = [
        'pending_role_setup',
        'pending_approval',
        'active',
        'suspended',
        'archived'
      ];
      return validStatuses.includes(value as UserStatus);
    }
  },
  
  // مقدم المصادقة (استخدام AuthProvider)
  auth_provider: {
    type: 'custom' as ValidationRuleType,
    message: USER_MESSAGES.auth_provider_invalid,
    customValidator: (value: unknown): boolean => {
      const validProviders: AuthProvider[] = ['email', 'phone', 'google'];
      return validProviders.includes(value as AuthProvider);
    }
  },
  
  // نوع العقد
  contract_type: {
    type: 'custom' as ValidationRuleType,
    message: USER_MESSAGES.contract_type_invalid,
    customValidator: (value: unknown): boolean => {
      const validTypes: ContractType[] = ['freelancer', 'salary'];
      return validTypes.includes(value as ContractType);
    }
  },
  
  // الراتب الشهري
  monthly_salary: {
    type: 'custom' as ValidationRuleType,
    message: USER_MESSAGES.salary_invalid,
    customValidator: (value: unknown): boolean => {
      if (typeof value !== 'number') return false;
      return value > 0 && value <= 10000000; // حد أقصى 10 مليون
    }
  },
  
  // سعر المهمة
  task_rate: {
    type: 'custom' as ValidationRuleType,
    message: USER_MESSAGES.task_rate_invalid,
    customValidator: (value: unknown): boolean => {
      if (typeof value !== 'number') return false;
      return value > 0 && value <= 1000000; // حد أقصى مليون
    }
  },
  
  // التخصصات
  specializations: {
    type: 'custom' as ValidationRuleType,
    message: USER_MESSAGES.specialization_required,
    customValidator: (value: unknown): boolean => {
      if (!Array.isArray(value)) return false;
      return value.length > 0 && value.every(spec => typeof spec === 'string' && spec.trim().length > 0);
    }
  },
  
  // الأيام المتاحة (استخدام DayOfWeek)
  available_days: {
    type: 'custom' as ValidationRuleType,
    message: USER_MESSAGES.availability_days_required,
    customValidator: (value: unknown): boolean => {
      if (!Array.isArray(value)) return false;
      const validDays: DayOfWeek[] = [
        'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'
      ];
      return value.length > 0 && value.every(day => validDays.includes(day as DayOfWeek));
    }
  },
  
  // المواقع المفضلة (استخدام LocationType)
  preferred_locations: {
    type: 'custom' as ValidationRuleType,
    message: USER_MESSAGES.location_type_invalid,
    customValidator: (value: unknown): boolean => {
      if (!Array.isArray(value)) return false;
      const validLocations: LocationType[] = ['studio', 'client_location', 'outdoor', 'home', 'travel'];
      return value.every(location => validLocations.includes(location as LocationType));
    }
  },
  
  // حالة التحقق (استخدام VerificationStatus)
  verification_status: {
    type: 'custom' as ValidationRuleType,
    message: USER_MESSAGES.verification_status_invalid,
    customValidator: (value: unknown): boolean => {
      const validStatuses: VerificationStatus[] = ['pending', 'verified', 'suspended', 'rejected'];
      return validStatuses.includes(value as VerificationStatus);
    }
  },
  
  // عدد المهام المتزامنة
  max_concurrent_tasks: {
    type: 'custom' as ValidationRuleType,
    message: USER_MESSAGES.max_tasks_invalid,
    customValidator: (value: unknown): boolean => {
      if (typeof value !== 'number') return false;
      return value >= 1 && value <= 10;
    }
  },
  
  // مصطلح البحث
  search_term: {
    type: 'custom' as ValidationRuleType,
    message: USER_MESSAGES.search_term_too_short,
    customValidator: (value: unknown): boolean => {
      if (typeof value !== 'string') return false;
      return value.trim().length >= 3;
    }
  },
  
  // رقم الصفحة
  page_number: {
    type: 'custom' as ValidationRuleType,
    message: USER_MESSAGES.page_number_invalid,
    customValidator: (value: unknown): boolean => {
      if (typeof value !== 'number') return false;
      return value >= 1;
    }
  },
  
  // حد الصفحة
  page_limit: {
    type: 'custom' as ValidationRuleType,
    message: USER_MESSAGES.page_limit_invalid,
    customValidator: (value: unknown): boolean => {
      if (typeof value !== 'number') return false;
      return value >= 1 && value <= 100;
    }
  }
} as const;

// ======================================
// 👥 Frontend User Validators
// ======================================

/**
 * Validator لإنشاء مستخدم جديد (متوافق مع Backend CreateUserSchema)
 */
export class CreateUserValidator extends FrontendBaseValidator<Partial<User> & Record<string, unknown>> {
  constructor(options: FrontendValidationOptions = {}) {
    const rules: FieldValidationRules = {
      email: [
        { type: 'required', message: USER_MESSAGES.required },
        { type: 'email', message: USER_MESSAGES.string_email }
      ],
      full_name: [
        { type: 'required', message: USER_MESSAGES.required },
        USER_VALIDATION_RULES.full_name_enhanced
      ],
      role: [
        { type: 'required', message: USER_MESSAGES.required },
        USER_VALIDATION_RULES.user_role
      ],
      phone: [
        // اختياري لكن إذا تم تقديمه يجب أن يكون صحيح
        { type: 'phone', message: USER_MESSAGES.iraqi_phone_invalid }
      ],
      registration_method: [
        { type: 'required', message: USER_MESSAGES.required },
        USER_VALIDATION_RULES.auth_provider
      ]
    };
    
    super(rules, { ...options, validateOnChange: true });
  }
}

/**
 * Validator لتحديث بيانات المستخدم
 */
export class UpdateUserValidator extends FrontendBaseValidator<Partial<User> & Record<string, unknown>> {
  constructor(options: FrontendValidationOptions = {}) {
    const rules: FieldValidationRules = {
      full_name: [
        USER_VALIDATION_RULES.full_name_enhanced
      ],
      display_name: [
        USER_VALIDATION_RULES.display_name
      ],
      bio: [
        USER_VALIDATION_RULES.bio
      ],
      role: [
        USER_VALIDATION_RULES.user_role
      ],
      status: [
        USER_VALIDATION_RULES.user_status
      ]
    };
    
    super(rules, options);
  }
}

/**
 * Validator لبحث المستخدمين (متوافق مع Backend SearchUsersSchema)
 */
export class SearchUsersValidator extends FrontendBaseValidator<{
  search?: string;
  searchTerm?: string;
  role?: UserRole;
  status?: UserStatus;
  page?: number;
  limit?: number;
  isActive?: boolean;
} & Record<string, unknown>> {
  constructor(options: FrontendValidationOptions = {}) {
    const rules: FieldValidationRules = {
      search: [
        USER_VALIDATION_RULES.search_term
      ],
      searchTerm: [
        USER_VALIDATION_RULES.search_term
      ],
      role: [
        USER_VALIDATION_RULES.user_role
      ],
      status: [
        USER_VALIDATION_RULES.user_status
      ],
      page: [
        USER_VALIDATION_RULES.page_number
      ],
      limit: [
        USER_VALIDATION_RULES.page_limit
      ]
    };
    
    super(rules, options);
  }
}

/**
 * Validator لتحديث دور المستخدم (متوافق مع Backend UpdateUserRoleSchema)
 */
export class UpdateUserRoleValidator extends FrontendBaseValidator<{
  userId: string;
  newRole: UserRole;
  updatedBy: string;
} & Record<string, unknown>> {
  constructor(options: FrontendValidationOptions = {}) {
    const rules: FieldValidationRules = {
      userId: [
        { type: 'required', message: USER_MESSAGES.required }
      ],
      newRole: [
        { type: 'required', message: USER_MESSAGES.required },
        USER_VALIDATION_RULES.user_role
      ],
      updatedBy: [
        { type: 'required', message: USER_MESSAGES.required }
      ]
    };
    
    super(rules, options);
  }
}

/**
 * Validator لصلاحيات المستخدم
 */
export class UserPermissionsValidator extends FrontendBaseValidator<Partial<UserPermissions> & Record<string, unknown>> {
  constructor(options: FrontendValidationOptions = {}) {
    const rules: FieldValidationRules = {
      user_id: [
        { type: 'required', message: USER_MESSAGES.required }
      ],
      role: [
        { type: 'required', message: USER_MESSAGES.required },
        USER_VALIDATION_RULES.user_role
      ],
      brand_access: [
        {
          type: 'custom',
          message: "يجب تحديد براند واحد على الأقل",
          customValidator: (value: unknown): boolean => {
            if (!Array.isArray(value)) return false;
            return value.length > 0;
          }
        }
      ]
    };
    
    super(rules, options);
  }
}

/**
 * Validator لمعلومات المصور (متوافق مع Backend PhotographerInfo)
 */
export class PhotographerInfoValidator extends FrontendBaseValidator<Partial<PhotographerInfo> & Record<string, unknown>> {
  constructor(options: FrontendValidationOptions = {}) {
    const rules: FieldValidationRules = {
      user_id: [
        { type: 'required', message: USER_MESSAGES.required }
      ],
      contract_type: [
        { type: 'required', message: USER_MESSAGES.required },
        USER_VALIDATION_RULES.contract_type
      ],
      monthly_salary: [
        USER_VALIDATION_RULES.monthly_salary
      ],
      task_base_rate: [
        USER_VALIDATION_RULES.task_rate
      ],
      specializations: [
        { type: 'required', message: USER_MESSAGES.required },
        USER_VALIDATION_RULES.specializations
      ],
      available_days: [
        { type: 'required', message: USER_MESSAGES.required },
        USER_VALIDATION_RULES.available_days
      ],
      preferred_locations: [
        USER_VALIDATION_RULES.preferred_locations
      ],
      max_concurrent_tasks: [
        { type: 'required', message: USER_MESSAGES.required },
        USER_VALIDATION_RULES.max_concurrent_tasks
      ],
      verification_status: [
        USER_VALIDATION_RULES.verification_status
      ],
      experience_years: [
        {
          type: 'custom',
          message: "سنوات الخبرة يجب أن تكون بين 0 و 50",
          customValidator: (value: unknown): boolean => {
            if (typeof value !== 'number') return false;
            return value >= 0 && value <= 50;
          }
        }
      ]
    };
    
    super(rules, options);
  }

  /**
   * تحقق خاص: التأكد من تطابق نوع العقد مع بيانات الدفع
   */
  validateContractPaymentConsistency(data: Partial<PhotographerInfo>): ValidationResult {
    const errors: ValidationError[] = [];
    
    if (data.contract_type === 'salary' && !data.monthly_salary) {
      errors.push({
        field: 'monthly_salary',
        message: "الراتب الشهري مطلوب للعقد الثابت",
        code: 'salary_required_for_contract'
      });
    }
    
    if (data.contract_type === 'freelancer' && !data.task_base_rate) {
      errors.push({
        field: 'task_base_rate',
        message: "سعر المهمة الأساسي مطلوب للفريلانسر",
        code: 'task_rate_required_for_freelancer'
      });
    }
    
    return this.formatResult(errors);
  }
}

// ======================================
// 🏭 Factory Functions للاستخدام السهل
// ======================================

export function createUserValidator(options?: FrontendValidationOptions): CreateUserValidator {
  return new CreateUserValidator(options);
}

export function createUpdateUserValidator(options?: FrontendValidationOptions): UpdateUserValidator {
  return new UpdateUserValidator(options);
}

export function createSearchUsersValidator(options?: FrontendValidationOptions): SearchUsersValidator {
  return new SearchUsersValidator(options);
}

export function createUpdateUserRoleValidator(options?: FrontendValidationOptions): UpdateUserRoleValidator {
  return new UpdateUserRoleValidator(options);
}

export function createUserPermissionsValidator(options?: FrontendValidationOptions): UserPermissionsValidator {
  return new UserPermissionsValidator(options);
}

export function createPhotographerInfoValidator(options?: FrontendValidationOptions): PhotographerInfoValidator {
  return new PhotographerInfoValidator(options);
}

// ======================================
// 🔧 Utility Functions
// ======================================

/**
 * التحقق من صحة انتقال الحالة
 */
export function validateStatusTransition(
  currentStatus: UserStatus,
  newStatus: UserStatus
): { isValid: boolean; message?: string } {
  
  const validTransitions: Record<UserStatus, UserStatus[]> = {
    'pending_role_setup': ['pending_approval', 'archived'],
    'pending_approval': ['active', 'archived'],
    'active': ['suspended', 'archived'],
    'suspended': ['active', 'archived'],
    'archived': [] // لا يمكن الانتقال من archived
  };
  
  const allowedTransitions = validTransitions[currentStatus] || [];
  
  if (!allowedTransitions.includes(newStatus)) {
    return {
      isValid: false,
      message: `لا يمكن تغيير الحالة من "${currentStatus}" إلى "${newStatus}"`
    };
  }
  
  return { isValid: true };
}

/**
 * التحقق من صحة الصلاحيات للدور
 */
export function validateRolePermissions(
  role: UserRole,
  permissions: string[]
): { isValid: boolean; invalidPermissions: string[] } {
  
  const rolePermissions: Record<UserRole, string[]> = {
    'super_admin': ['*'], // جميع الصلاحيات
    'marketing_coordinator': [
      'view_campaigns', 'create_campaigns', 'edit_campaigns',
      'view_content', 'approve_content', 'view_reports'
    ],
    'brand_coordinator': [
      'view_campaigns', 'view_content', 'approve_content',
      'view_brand_reports'
    ],
    'photographer': [
      'view_tasks', 'upload_content', 'view_own_reports'
    ],
    'new_user': [] // لا توجد صلاحيات
  };
  
  const allowedPermissions = rolePermissions[role] || [];
  
  if (allowedPermissions.includes('*')) {
    return { isValid: true, invalidPermissions: [] };
  }
  
  const invalidPermissions = permissions.filter(
    permission => !allowedPermissions.includes(permission)
  );
  
  return {
    isValid: invalidPermissions.length === 0,
    invalidPermissions
  };
}

/**
 * تنسيق اسم المستخدم للعرض
 */
export function formatUserDisplayName(user: Partial<User>): string {
  if (user.display_name) {
    return user.display_name;
  }
  
  if (user.full_name) {
    return user.full_name;
  }
  
  if (user.first_name && user.last_name) {
    return `${user.first_name} ${user.last_name}`;
  }
  
  if (user.email) {
    return user.email.split('@')[0];
  }
  
  return 'مستخدم غير معروف';
}

/**
 * التحقق من نشاط المستخدم
 */
export function checkUserActivity(user: User): {
  isOnline: boolean;
  lastSeenText: string;
  activityStatus: 'online' | 'recently_active' | 'inactive';
} {
  const now = new Date();
  const lastSeen = user.last_seen ? new Date(user.last_seen.seconds * 1000) : null;
  
  if (user.is_online) {
    return {
      isOnline: true,
      lastSeenText: 'متصل الآن',
      activityStatus: 'online'
    };
  }
  
  if (!lastSeen) {
    return {
      isOnline: false,
      lastSeenText: 'لم يتم تسجيل الدخول مطلقاً',
      activityStatus: 'inactive'
    };
  }
  
  const diffMinutes = Math.floor((now.getTime() - lastSeen.getTime()) / (1000 * 60));
  
  if (diffMinutes < 5) {
    return {
      isOnline: false,
      lastSeenText: 'نشط منذ دقائق',
      activityStatus: 'recently_active'
    };
  } else if (diffMinutes < 60) {
    return {
      isOnline: false,
      lastSeenText: `نشط منذ ${diffMinutes} دقيقة`,
      activityStatus: 'recently_active'
    };
  } else if (diffMinutes < 1440) { // أقل من يوم
    const hours = Math.floor(diffMinutes / 60);
    return {
      isOnline: false,
      lastSeenText: `نشط منذ ${hours} ساعة`,
      activityStatus: 'inactive'
    };
  } else {
    const days = Math.floor(diffMinutes / 1440);
    return {
      isOnline: false,
      lastSeenText: `نشط منذ ${days} يوم`,
      activityStatus: 'inactive'
    };
  }
}

/**
 * حساب إحصائيات المصور
 */
export function calculatePhotographerStats(photographer: PhotographerInfo): {
  efficiency: number;
  reliability: number;
  overallScore: number;
  level: 'مبتدئ' | 'متوسط' | 'متقدم' | 'خبير';
} {
  const tasksCompleted = photographer.total_tasks_completed || 0;
  const rating = photographer.average_rating || 0;
  const experienceYears = photographer.experience_years || 0;
  
  // حساب الكفاءة (بناءً على المهام المكتملة والتقييم)
  const efficiency = Math.min(100, (tasksCompleted * 2) + (rating * 20));
  
  // حساب الموثوقية (بناءً على التقييم وسنوات الخبرة)
  const reliability = Math.min(100, (rating * 15) + (experienceYears * 5));
  
  // النتيجة الإجمالية
  const overallScore = (efficiency + reliability) / 2;
  
  // تحديد المستوى
  let level: 'مبتدئ' | 'متوسط' | 'متقدم' | 'خبير';
  if (overallScore < 25) level = 'مبتدئ';
  else if (overallScore < 50) level = 'متوسط';
  else if (overallScore < 75) level = 'متقدم';
  else level = 'خبير';
  
  return {
    efficiency: Math.round(efficiency),
    reliability: Math.round(reliability),
    overallScore: Math.round(overallScore),
    level
  };
}

/**
 * التحقق من دعم طريقة المصادقة للمستخدم
 */
export function validateUserAuthMethods(
  user: Partial<User>,
  requiredMethod: AuthProvider
): { isSupported: boolean; message?: string } {
  
  if (!user.auth_methods || user.auth_methods.length === 0) {
    return {
      isSupported: false,
      message: "لا توجد طرق مصادقة مفعلة لهذا المستخدم"
    };
  }
  
  const hasMethod = user.auth_methods.some(method => method.type === requiredMethod);
  
  if (!hasMethod) {
    const methodNames = {
      email: 'البريد الإلكتروني',
      phone: 'رقم الهاتف',
      google: 'جوجل'
    };
    
    return {
      isSupported: false,
      message: `طريقة المصادقة بـ${methodNames[requiredMethod]} غير مفعلة لهذا المستخدم`
    };
  }
  
  return { isSupported: true };
}

/**
 * التحقق من أهلية المصور للمواقع المختلفة
 */
export function validatePhotographerLocationEligibility(
  photographer: PhotographerInfo,
  requiredLocation: LocationType
): { isEligible: boolean; message?: string } {
  
  if (!photographer.preferred_locations || photographer.preferred_locations.length === 0) {
    return {
      isEligible: false,
      message: "لم يتم تحديد المواقع المفضلة للمصور"
    };
  }
  
  const isLocationSupported = photographer.preferred_locations.includes(requiredLocation);
  
  if (!isLocationSupported) {
    const locationNames = {
      studio: 'الاستوديو',
      client_location: 'موقع العميل',
      outdoor: 'التصوير الخارجي',
      home: 'المنزل',
      travel: 'السفر'
    };
    
    return {
      isEligible: false,
      message: `المصور لا يعمل في ${locationNames[requiredLocation]}`
    };
  }
  
  return { isEligible: true };
} 
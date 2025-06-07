/**
 * 🔐 أنواع المصادقة - Depth Studio
 * ===================================
 * 
 * 📱 نظام مصادقة متعدد الطرق:
 * - تسجيل بالبريد الإلكتروني + كلمة مرور
 * - تسجيل برقم الهاتف العراقي + OTP
 * - تسجيل بحساب جوجل
 * 
 * 🎭 نظام اختيار الأدوار:
 * - 3 بطاقات للاختيار (منسق تسويق، منسق براند، مصور)
 * - موافقة شاملة من الأدمن لجميع الأدوار
 * - دعم خاص للمصورين (نوع العقد) ومنسقي البراند (اختيار براند)
 */

import { 
  BaseEntity, 
  FirebaseTimestamp, 
  ID 
} from './core/base';

import { 
  AuthProvider, 
  UserRole, 
  ContractType, 
  VerificationStatus 
} from './core/enums';

import { User } from './users';

// ======================================
// 🔐 طرق المصادقة
// ======================================

/** طريقة مصادقة للمستخدم */
export interface AuthMethod {
  type: AuthProvider;                    // نوع المصادقة (email, phone, google)
  verified: boolean;                     // هل تم التحقق من هذه الطريقة
  created_at: FirebaseTimestamp;         // متى تم إضافة هذه الطريقة
  last_used?: FirebaseTimestamp;         // آخر استخدام لهذه الطريقة
  metadata?: {
    // للبريد الإلكتروني
    email_verified?: boolean;
    // للهاتف
    phone_country_code?: string;
    phone_verified?: boolean;
    // لجوجل
    google_id?: string;
    google_email?: string;
    google_picture?: string;
  };
}

// ======================================
// 📱 التحقق من الهاتف العراقي + OTP
// ======================================

/** بيانات التحقق من رقم الهاتف العراقي */
export interface PhoneVerification extends BaseEntity {
  phone: string;                         // رقم الهاتف (بدون رمز البلد)
  country_code: string;                  // رمز البلد (+964 للعراق)
  full_phone: string;                    // الرقم الكامل مع رمز البلد
  otp_code: string;                      // رمز OTP (6 أرقام)
  expires_at: FirebaseTimestamp;         // متى ينتهي صلاحية الرمز
  attempts: number;                      // عدد محاولات التحقق
  max_attempts: number;                  // الحد الأقصى للمحاولات (افتراضي: 3)
  verified: boolean;                     // هل تم التحقق بنجاح
  status: VerificationStatus;            // حالة التحقق
  user_id?: ID;                          // معرف المستخدم (إن وجد)
  ip_address?: string;                   // عنوان IP للأمان
}

/** بيانات إرسال OTP */
export interface OTPSendRequest {
  phone: string;                         // رقم الهاتف
  country_code: string;                  // رمز البلد
  user_id?: ID;                          // معرف المستخدم (للمستخدمين المسجلين)
  purpose: 'registration' | 'login' | 'phone_verification' | 'password_reset';
}

/** نتيجة إرسال OTP */
export interface OTPSendResult {
  success: boolean;                      // هل تم الإرسال بنجاح
  message: string;                       // رسالة للمستخدم
  expires_at: FirebaseTimestamp;         // متى ينتهي صلاحية الرمز
  attempts_remaining: number;            // عدد المحاولات المتبقية
  can_resend_at: FirebaseTimestamp;      // متى يمكن إعادة الإرسال
}

/** بيانات التحقق من OTP */
export interface OTPVerifyRequest {
  phone: string;                         // رقم الهاتف
  country_code: string;                  // رمز البلد
  otp_code: string;                      // رمز OTP المدخل
  user_id?: ID;                          // معرف المستخدم (إن وجد)
}

/** نتيجة التحقق من OTP */
export interface OTPVerifyResult {
  success: boolean;                      // هل التحقق نجح
  message: string;                       // رسالة للمستخدم
  user?: User;                           // بيانات المستخدم (إذا نجح التحقق)
  token?: string;                        // JWT token (إذا نجح التحقق)
  needs_role_selection: boolean;         // هل يحتاج اختيار دور
}

// ======================================
// 🎭 اختيار الأدوار
// ======================================

/** طلب اختيار دور جديد */
export interface RoleSelection extends BaseEntity {
  user_id: ID;                           // معرف المستخدم
  selected_role: UserRole;               // الدور المختار
  additional_data?: {
    // للمصور
    contract_type?: ContractType;        // نوع العقد (freelancer/salary)
    specializations?: string[];          // التخصصات
    experience_years?: number;           // سنوات الخبرة
    portfolio_links?: string[];          // روابط معرض الأعمال
    equipment_owned?: string[];          // المعدات المملوكة
    
    // لمنسق البراند  
    selected_brand_id?: ID;              // معرف البراند المختار
    brand_search_query?: string;         // استعلام البحث عن البراند
    brand_coordinator_experience?: string; // خبرة في تنسيق البراندات
    
    // لمنسق التسويق
    marketing_experience?: string;       // خبرة تسويقية
    campaigns_managed?: number;          // عدد الحملات المدارة سابقاً
  };
  status: 'pending' | 'approved' | 'rejected'; // حالة الطلب
  applied_at: FirebaseTimestamp;         // تاريخ تقديم الطلب
  reviewed_at?: FirebaseTimestamp;       // تاريخ المراجعة
  approved_by?: ID;                      // من وافق على الطلب
  rejection_reason?: string;             // سبب الرفض
  admin_notes?: string;                  // ملاحظات الأدمن
}

/** بيانات تقديم طلب اختيار دور */
export interface RoleSelectionSubmission {
  selected_role: UserRole;               // الدور المطلوب
  additional_data?: RoleSelection['additional_data']; // البيانات الإضافية
  motivation?: string;                   // دافع اختيار هذا الدور
}

/** إحصائيات اختيار الأدوار */
export interface RoleSelectionStats {
  total_applications: number;            // إجمالي الطلبات
  pending_applications: number;          // الطلبات المنتظرة
  approved_applications: number;         // الطلبات المقبولة
  rejected_applications: number;         // الطلبات المرفوضة
  applications_by_role: {
    [role in UserRole]?: number;         // الطلبات حسب الدور
  };
  average_approval_time_hours: number;   // متوسط وقت الموافقة بالساعات
  approval_rate_percentage: number;     // نسبة الموافقة
}

// ======================================
// 📝 بيانات التسجيل
// ======================================

/** بيانات التسجيل بالبريد الإلكتروني */
export interface EmailRegistrationData {
  email: string;                         // البريد الإلكتروني
  password: string;                      // كلمة المرور
  confirm_password: string;              // تأكيد كلمة المرور
  full_name: string;                     // الاسم الكامل
  phone?: string;                        // رقم الهاتف (اختياري)
  accept_terms: boolean;                 // موافقة على الشروط
}

/** بيانات التسجيل برقم الهاتف */
export interface PhoneRegistrationData {
  phone: string;                         // رقم الهاتف
  country_code: string;                  // رمز البلد
  full_name: string;                     // الاسم الكامل
  accept_terms: boolean;                 // موافقة على الشروط
}

/** بيانات التسجيل بحساب جوجل */
export interface GoogleRegistrationData {
  google_token: string;                  // رمز مصادقة جوجل
  full_name: string;                     // الاسم الكامل
  email: string;                         // البريد من جوجل
  profile_picture?: string;              // صورة الملف الشخصي
  accept_terms: boolean;                 // موافقة على الشروط
}

// ======================================
// 🔑 بيانات تسجيل الدخول
// ======================================

/** بيانات تسجيل الدخول بالبريد */
export interface EmailLoginData {
  email: string;                         // البريد الإلكتروني
  password: string;                      // كلمة المرور
  remember_me?: boolean;                 // تذكرني
}

/** بيانات تسجيل الدخول بالهاتف */
export interface PhoneLoginData {
  phone: string;                         // رقم الهاتف
  country_code: string;                  // رمز البلد
}

/** بيانات تسجيل الدخول بجوجل */
export interface GoogleLoginData {
  google_token: string;                  // رمز مصادقة جوجل
}

// ======================================
// 🎯 نتائج المصادقة
// ======================================

/** نتيجة عملية المصادقة */
export interface AuthResult {
  success: boolean;                      // هل العملية نجحت
  user?: User;                           // بيانات المستخدم
  token?: string;                        // JWT token
  refresh_token?: string;                // رمز التحديث
  needs_role_selection: boolean;         // هل يحتاج اختيار دور
  needs_phone_verification: boolean;     // هل يحتاج تحقق هاتف
  needs_email_verification: boolean;     // هل يحتاج تحقق بريد
  message: string;                       // رسالة للمستخدم
  expires_at?: FirebaseTimestamp;        // متى ينتهي التوكن
}

/** حالة المصادقة للجلسة */
export interface AuthSessionState {
  user: User | null;                     // المستخدم الحالي
  isAuthenticated: boolean;              // هل مصادق
  isLoading: boolean;                    // هل يتم التحميل
  token: string | null;                  // التوكن الحالي
  error: string | null;                  // آخر خطأ
  needs_role_selection: boolean;         // يحتاج اختيار دور
}

// ======================================
// 📊 إحصائيات المصادقة
// ======================================

/** إحصائيات طرق التسجيل */
export interface RegistrationStats {
  email_registrations: number;           // التسجيل بالبريد
  phone_registrations: number;           // التسجيل بالهاتف
  google_registrations: number;          // التسجيل بجوجل
  total_registrations: number;           // إجمالي التسجيلات
  conversion_rates: {                    // معدلات التحويل
    email_to_verified: number;          // من التسجيل للتحقق (بريد)
    phone_to_verified: number;          // من التسجيل للتحقق (هاتف)
    google_to_active: number;           // من التسجيل للتفعيل (جوجل)
  };
  daily_registrations: {                 // التسجيلات اليومية
    date: string;                       // التاريخ
    email: number;                      // تسجيلات البريد
    phone: number;                      // تسجيلات الهاتف
    google: number;                     // تسجيلات جوجل
  }[];
}

/** إحصائيات استخدام طرق المصادقة */
export interface AuthMethodUsageStats {
  total_users: number;                   // إجمالي المستخدمين
  users_with_email: number;              // مستخدمون لديهم بريد
  users_with_phone: number;              // مستخدمون لديهم هاتف
  users_with_google: number;             // مستخدمون لديهم جوجل
  users_with_multiple_methods: number;   // مستخدمون بطرق متعددة
  preferred_login_method: {              // الطريقة المفضلة للدخول
    email: number;
    phone: number;
    google: number;
  };
}

// ======================================
// 🛡️ أمان إضافي
// ======================================

/** سجل أنشطة المصادقة */
export interface AuthActivityLog extends BaseEntity {
  user_id?: ID;                          // معرف المستخدم (إن وجد)
  activity_type: 'login_attempt' | 'login_success' | 'login_failed' | 
                 'registration_attempt' | 'registration_success' | 
                 'otp_sent' | 'otp_verified' | 'otp_failed' |
                 'logout' | 'token_refresh';
  auth_method: AuthProvider;             // طريقة المصادقة المستخدمة
  ip_address: string;                    // عنوان IP
  user_agent: string;                    // معلومات المتصفح
  location?: {                           // الموقع الجغرافي
    country: string;
    city: string;
    lat?: number;
    lng?: number;
  };
  success: boolean;                      // هل العملية نجحت
  failure_reason?: string;               // سبب الفشل
  additional_data?: Record<string, any>; // بيانات إضافية
}

/** إعدادات أمان المصادقة */
export interface AuthSecuritySettings {
  max_login_attempts: number;            // الحد الأقصى لمحاولات الدخول
  login_lockout_duration_minutes: number; // مدة الحجب بالدقائق
  otp_expiry_minutes: number;            // مدة انتهاء OTP بالدقائق
  max_otp_attempts: number;              // الحد الأقصى لمحاولات OTP
  session_timeout_hours: number;        // انتهاء الجلسة بالساعات
  require_phone_verification: boolean;   // إلزام تحقق الهاتف
  require_email_verification: boolean;   // إلزام تحقق البريد
  allow_multiple_sessions: boolean;      // السماح بجلسات متعددة
  password_min_length: number;          // الحد الأدنى لطول كلمة المرور
  password_require_special_chars: boolean; // إلزام رموز خاصة
} 
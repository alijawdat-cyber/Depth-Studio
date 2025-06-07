/**
 * 👥 أنواع المستخدمين - Depth Studio (مبسط)
 * ==============================================
 * 
 * ✨ تم التبسيط الجذري:
 * من 189 سطر إلى ~60 سطر (-68%)
 * من 9 واجهات إلى 3 واجهات (-67%)
 * 🎯 نفس الوظائف، كود أقل وأوضح
 */

import { BaseEntity, ActivatableEntity, ContactInfo, FirebaseTimestamp, ID } from './core/base';
import { UserRole, UserStatus, AuthProvider, ContractType, DayOfWeek, LocationType, VerificationStatus } from './core/enums';
import { AuthMethod, RoleSelection } from './auth';

// ======================================
// 👤 المستخدم الأساسي (مبسط)
// ======================================

/** المستخدم - مبسط وفعال مع دعم المصادقة المتعددة */
export interface User extends ActivatableEntity {
  // معلومات أساسية
  email: string;
  phone?: string;
  full_name: string;        // اسم كامل موحد
  display_name?: string;    // اسم العرض (اختياري)
  first_name?: string;      // الاسم الأول (اختياري)
  last_name?: string;       // الاسم الأخير (اختياري)
  profile_photo_url?: string;
  
  // الدور والحالة
  role: UserRole;           // الدور الحالي
  primary_role?: UserRole;  // الدور الأساسي (للمحافظة على التوافق)
  status: UserStatus;
  is_verified: boolean;
  
  // المصادقة المتعددة 🆕
  auth_methods: AuthMethod[];
  registration_method: AuthProvider;
  phone_verified: boolean;
  role_selected: boolean;
  role_selection_history: RoleSelection[];
  google_linked: boolean;
  
  // الصلاحيات
  permissions: string[];
  
  // الإعدادات الشخصية
  preferences: {
    language: string;
    notifications_enabled: boolean;
    email_notifications: boolean;
    sms_notifications: boolean;
    theme: 'light' | 'dark';
  };
  
  // الملف الشخصي
  profile: {
    bio: string;
    avatar_url: string;
    social_links: Record<string, string>;
  };
  
  // معلومات إضافية مهمة
  location?: string;
  timezone?: string;
  
  // Firebase
  firebase_uid?: string;    // للمحافظة على التوافق
  auth_providers?: AuthProvider[]; // للمحافظة على التوافق
  
  // تتبع النشاط البسيط
  last_login?: FirebaseTimestamp;
  last_seen?: FirebaseTimestamp;
  is_online?: boolean;
}

// ======================================
// 🔐 الصلاحيات (مبسطة)
// ======================================

/** صلاحيات المستخدم - نسخة مبسطة وعملية */
export interface UserPermissions extends BaseEntity {
  user_id: ID;
  
  // دور المستخدم
  role: UserRole;
  
  // صلاحيات البراندات (مبسطة)
  brand_access: ID[];  // قائمة معرفات البراندات المتاحة
  can_approve_content: boolean;
  can_view_financials: boolean;
  
  // صلاحيات عامة مبسطة
  can_manage_users: boolean;
  can_manage_brands: boolean;
  can_manage_campaigns: boolean;
  can_view_reports: boolean;
  
  // حالة
  is_active: boolean;
  granted_by: ID;
  granted_at: FirebaseTimestamp;
}

// ======================================
// 📸 معلومات المصور (مبسطة)
// ======================================

/** معلومات المصور - تركيز على الأساسيات */
export interface PhotographerInfo extends BaseEntity {
  user_id: ID;
  
  // نوع العقد
  contract_type: ContractType;
  
  // معلومات الدفع (مبسطة)
  monthly_salary?: number;      // للراتب الثابت
  task_base_rate?: number;      // للفريلانسر - السعر الأساسي
  
  // التخصصات (مبسطة)
  specializations: string[];    // قائمة بسيطة من أسماء التخصصات
  skill_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  
  // توفر العمل (مبسط)
  available_days: DayOfWeek[];
  preferred_locations: LocationType[];
  max_concurrent_tasks: number;
  availability_status: 'available' | 'busy' | 'unavailable';
  
  // معلومات العقد
  hire_date: FirebaseTimestamp;
  verification_status: VerificationStatus;
  
  // إحصائيات بسيطة
  total_tasks_completed: number;
  total_earnings_ytd: number;
  average_rating: number;
  experience_years: number;
  rating: number;
  
  // حالة
  is_available_for_work: boolean;
} 
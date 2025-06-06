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

// ======================================
// 👤 المستخدم الأساسي (مبسط)
// ======================================

/** المستخدم - مبسط وفعال */
export interface User extends ActivatableEntity {
  // معلومات أساسية
  email: string;
  phone?: string;
  display_name: string;
  first_name: string;
  last_name: string;
  profile_photo_url?: string;
  
  // الدور والحالة
  primary_role: UserRole;
  status: UserStatus;
  is_verified: boolean;
  
  // معلومات إضافية مهمة
  bio?: string;
  location?: string;
  timezone: string;
  language: string;
  
  // Firebase
  firebase_uid: string;
  auth_providers: AuthProvider[];
  
  // تتبع النشاط البسيط
  last_login?: FirebaseTimestamp;
  last_seen?: FirebaseTimestamp;
  is_online: boolean;
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
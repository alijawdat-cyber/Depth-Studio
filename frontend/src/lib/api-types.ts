// API Types based on ACTUAL Firebase Database Structure
// Analyzed from depth-production database - January 2025

// ======================================
// 👥 User Types (Based on Firebase users collection)
// ======================================

export interface User {
  id: string
  email: string
  phone?: string
  display_name: string
  first_name: string
  last_name: string
  profile_photo_url?: string
  primary_role: UserRole
  status?: UserStatus // ⭐ إضافة حقل status
  is_active: boolean
  is_verified: boolean
  bio?: string
  location?: string
  timezone: string
  language: string
  firebase_uid: string
  auth_providers: AuthProvider[]
  last_seen?: FirebaseTimestamp
  is_online: boolean
  created_at: FirebaseTimestamp
  updated_at: FirebaseTimestamp
  created_by?: string
  updated_by?: string
  fixed_by?: string
  fix_date?: FirebaseTimestamp
  last_login?: FirebaseTimestamp
  total_login_count: number
}

export type UserRole = 
  | 'super_admin'
  | 'marketing_coordinator' 
  | 'brand_coordinator'
  | 'photographer'
  | 'new_user'

export type UserStatus = 
  | 'pending_role_setup'    // في انتظار اختيار الدور
  | 'pending_approval'      // في انتظار موافقة الإدارة
  | 'active'                // مفعل ومعتمد
  | 'suspended'             // معلق مؤقتاً
  | 'archived'              // مؤرشف

export type AuthProvider = 'email' | 'phone' | 'google'

export interface FirebaseTimestamp {
  _seconds: number
  _nanoseconds: number
}

// ======================================
// 🔑 Role Types (Based on Firebase roles collection)
// ======================================

export interface Role {
  id: string
  role_name: UserRole
  display_name: string
  description: string
  permissions: Record<string, string[]>
  hierarchy_level: number
  can_assign_roles: UserRole[]
  is_active: boolean
  created_at: FirebaseTimestamp
  updated_at: FirebaseTimestamp
}

// ======================================
// 🏢 Brand Types (Based on Firebase brands collection)
// ======================================

export interface Brand {
  id: string
  name: {
    ar: string
    en: string
  }
  description: {
    ar: string
    en: string
  }
  brand_type: string
  industry: string
  status: BrandStatus
  brand_identity: BrandIdentity
  contact_info: BrandContactInfo
  assigned_coordinator?: string
  budget_settings: BrandBudgetSettings
  content_preferences: BrandContentPreferences
  statistics: BrandStatistics
  is_active: boolean
  created_at: FirebaseTimestamp
  updated_at: FirebaseTimestamp
  created_by: string
}

export type BrandStatus = 'active' | 'inactive' | 'paused' | 'archived'

export interface BrandIdentity {
  logo_url?: string
  primary_color: string
  secondary_color: string
  font_family: string
  brand_guidelines_url?: string
}

export interface BrandContactInfo {
  primary_contact_name: string
  primary_contact_email: string
  primary_contact_phone?: string
  company_address: string
  website_url?: string
  social_media: Record<string, string>
}

export interface BrandBudgetSettings {
  monthly_budget: number
  currency: string
  pricing_tier: string
  payment_terms: string
  budget_alerts_enabled: boolean
}

export interface BrandContentPreferences {
  preferred_styles: string[]
  content_categories: string[]
  quality_requirements: string
  delivery_format: string[]
  usage_rights: string
}

export interface BrandStatistics {
  total_campaigns: number
  total_content_pieces: number
  average_project_rating: number
  total_spent: number
  active_campaigns: number
}

// ======================================
// 📊 Dashboard Stats Types (Based on Backend Functions)
// ======================================

// Note: These are return types from Firebase Functions
// Not direct database collections

export interface SuperAdminStatsResponse {
  users: {
    total: number
    active: number
    by_role: Record<UserRole, number>
    new_this_month: number
  }
  brands: {
    total: number
    active: number
    by_status: Record<BrandStatus, number>
  }
  campaigns: {
    total: number
    active: number
    completed_this_month: number
  }
  system: {
    collections_count: number
    total_documents: number
    storage_used: string
    last_backup: string
  }
}

export interface MarketingStatsResponse {
  campaigns: {
    total: number
    active: number
    completed: number
    completion_rate: number
  }
  content: {
    total_pieces: number
    approved: number
    pending_review: number
    approval_rate: number
  }
  performance: {
    average_project_rating: number
    on_time_delivery_rate: number
    client_satisfaction: number
  }
}

export interface BrandStatsResponse {
  brand_id: string
  campaigns: {
    total: number
    active: number
    completed: number
  }
  budget: {
    total_budget: number
    spent: number
    remaining: number
    utilization_percentage: number
  }
  content: {
    total_pieces: number
    approved: number
    pending: number
  }
  performance: {
    average_rating: number
    completion_rate: number
  }
}

export interface PhotographerStatsResponse {
  photographer_id: string
  tasks: {
    total: number
    completed: number
    in_progress: number
    completion_rate: number
  }
  earnings: {
    total_earned: number
    this_month: number
    pending_payments: number
  }
  performance: {
    average_rating: number
    on_time_rate: number
    quality_score: number
  }
  brands_worked_with: string[]
}

// ======================================
// 🔧 User Management Types
// ======================================

export interface CreateUserData {
  email: string
  first_name: string
  last_name: string
  phone?: string
  primary_role: UserRole
  bio?: string
  location?: string
}

export interface UpdateUserData {
  first_name?: string
  last_name?: string
  phone?: string
  display_name?: string
  bio?: string
  location?: string
  timezone?: string
  language?: string
  primary_role?: UserRole
  is_active?: boolean
}

export interface UsersListResponse {
  users: User[]
  total: number
  page: number
  limit: number
}

// ======================================
// 📋 API Parameters
// ======================================

export interface DashboardStatsParams {
  start_date?: string
  end_date?: string
  period?: 'day' | 'week' | 'month' | 'year'
  brand_id?: string
  include_details?: boolean
}

export interface UserQueryParams {
  role?: UserRole
  is_active?: boolean
  search?: string
  page?: number
  limit?: number
  sort_by?: 'created_at' | 'updated_at' | 'last_login' | 'display_name'
  sort_order?: 'asc' | 'desc'
}

// ======================================
// 🔄 API Response Wrappers
// ======================================

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
  timestamp?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    total_pages: number
    has_next: boolean
    has_prev: boolean
  }
}

export interface SuccessResponse {
  success: true
  message: string
  data?: unknown
}

export interface ErrorResponse {
  success: false
  error: string
  code?: string
  details?: unknown
}

// ======================================
// 🎯 Function Call Types
// ======================================

export interface FunctionCallParams {
  [key: string]: unknown
}

export interface FunctionCallResponse<T = unknown> {
  data: T
}

// ======================================
// 📂 File Upload Types
// ======================================

export interface FileUploadResponse {
  url: string
  file_name: string
  file_size: number
  content_type: string
  upload_path: string
}

// ======================================
// 🔍 Search & Filter Types
// ======================================

export interface SearchFilters {
  [key: string]: unknown
}

export interface SortOptions {
  field: string
  direction: 'asc' | 'desc'
}

export interface QueryOptions {
  filters?: SearchFilters
  sort?: SortOptions
  page?: number
  limit?: number
  include_deleted?: boolean
} 
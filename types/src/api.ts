/**
 * 🌐 أنواع API - Depth Studio (مبسط)
 * ====================================
 * 
 * ✨ تم التبسيط الذكي:
 * من 154 سطر إلى ~70 سطر (-55%)
 * إزالة الفلاتر المعقدة والمتخصصة
 * 🎯 المحافظة على كل واجهات API الأساسية
 */

import { ID } from './core/base';

// ======================================
// 🌐 استجابات API الأساسية
// ======================================

/** استجابة API موحدة */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
  request_id?: string;
}

/** استجابة مع pagination */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  data: T[];
  pagination: PaginationInfo;
}

/** معلومات الصفحات */
export interface PaginationInfo {
  current_page: number;
  total_pages: number;
  total_items: number;
  items_per_page: number;
  has_next: boolean;
  has_prev: boolean;
}

/** خيارات البحث العامة (مبسطة) */
export interface QueryOptions {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, any>;  // فلتر مرن لجميع الاحتياجات
  include_inactive?: boolean;
}

// ======================================
// 🔐 المصادقة
// ======================================

/** بيانات تسجيل الدخول */
export interface LoginCredentials {
  email: string;
  password: string;
  remember_me?: boolean;
}

/** بيانات التسجيل */
export interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
}

/** حالة المصادقة */
export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

/** المستخدم المصادق */
export interface AuthUser {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  emailVerified: boolean;
  phoneNumber?: string;
}

// ======================================
// 🛠️ Repository Pattern (مبسط)
// ======================================

/** فلتر الاستعلامات العام */
export interface QueryFilter {
  field: string;
  operator: '==' | '!=' | '<' | '<=' | '>' | '>=' | 'array-contains' | 'in' | 'not-in';
  value: any;
}

/** خيارات استعلام Repository */
export interface RepositoryQueryOptions {
  filters?: QueryFilter[];
  orderBy?: {
    field: string;
    direction: 'asc' | 'desc';
  }[];
  limit?: number;
  offset?: number;
}

/** نتيجة Pagination */
export interface RepositoryPaginationResult<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
} 
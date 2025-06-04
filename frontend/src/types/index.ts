// ======================================
// إعادة تصدير الأنواع المشتركة
// ======================================
export type {
  // Auth Types
  AuthUser,
  AuthState,
  LoginCredentials,
  RegisterData,
  
  // User Types  
  User,
  UserRole,
  UserPermissions,
  UserRoleAssignment,
  
  // Brand Types
  Brand,
  BrandStatus,
  
  // Common Types
  ApiResponse,
  PaginatedResponse
} from '../../../shared/types'

import type { UserRole } from '../../../shared/types'

// ======================================
// أنواع محلية للفرونت إند
// ======================================

export interface RouteGuard {
  requiresAuth?: boolean
  requiresGuest?: boolean
  requiredRole?: UserRole
  title?: string
}

export interface FormValidation {
  isValid: boolean
  errors: string[]
}

export interface LoadingState {
  isLoading: boolean
  message?: string
} 
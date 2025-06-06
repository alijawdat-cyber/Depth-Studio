/**
 * Authentication Types - Depth Studio Backend
 * Type definitions and interfaces for authentication middleware
 */

import { Request } from 'express'
import type { User, UserPermissions } from '../../types/types'

// ======================================
// Core Interfaces
// ======================================

/**
 * Extended Express Request interface with authentication data
 */
export interface AuthenticatedRequest extends Request {
  user?: User
  permissions?: UserPermissions
  firebaseUser?: any
  isOwnershipCheckRequired?: boolean
  ownerField?: string
  currentUserId?: string
}

// ======================================
// Error Types
// ======================================

/**
 * Authentication error codes
 */
export type AuthErrorCode = 
  | 'missing_token'
  | 'token_expired'
  | 'token_revoked'
  | 'user_not_found'
  | 'account_inactive'
  | 'authentication_failed'
  | 'authentication_required'
  | 'insufficient_permissions'
  | 'access_denied'

/**
 * Authentication error response structure
 */
export interface AuthErrorResponse {
  success: false
  error: AuthErrorCode
  message: string
  timestamp: string
  required_roles?: string[]
  user_role?: string
  required_permission?: string
  requested_brand?: string
  user_brands?: string[]
}

// ======================================
// Configuration Types
// ======================================

/**
 * Firebase authentication token data
 */
export interface FirebaseTokenData {
  uid: string
  email?: string
  iss: string
  aud: string
  auth_time: number
  user_id: string
  sub: string
  iat: number
  exp: number
  firebase: {
    identities: Record<string, any>
    sign_in_provider: string
  }
} 
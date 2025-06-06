/**
 * Authorization Types - Depth Studio Backend
 * Type definitions for authorization middleware
 */

import type { UserRole } from '../../types/types'
import type { AuthenticatedRequest } from '../auth/types'

// ======================================
// Re-export for convenience
// ======================================

export type { AuthenticatedRequest, UserRole }

// ======================================
// CRUD Action Types
// ======================================

export type CrudAction = 'create' | 'read' | 'update' | 'delete'

// ======================================
// Authorization Configuration
// ======================================

/**
 * Admin roles configuration
 */
export const ADMIN_ROLES: UserRole[] = ['super_admin', 'marketing_coordinator']

/**
 * Role hierarchy for access control
 */
export const ROLE_HIERARCHY = {
  super_admin: 4,
  marketing_coordinator: 3,
  brand_coordinator: 2,
  photographer: 1
} as const

// ======================================
// Global Extensions
// ======================================

declare global {
  namespace Express {
    interface Request {
      isOwnershipCheckRequired?: boolean
      ownerField?: string
      currentUserId?: string
    }
  }
} 
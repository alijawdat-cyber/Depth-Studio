/**
 * Authorization Middleware - Depth Studio Backend
 * Main exports for authorization functionality
 */

// ======================================
// Type Definitions
// ======================================

export type {
  AuthenticatedRequest,
  UserRole,
  CrudAction
} from './types'

export {
  ADMIN_ROLES,
  ROLE_HIERARCHY
} from './types'

// ======================================
// Role-Based Access Control
// ======================================

export {
  authorize,
  authorizeRoles,
  hasRole,
  hasAdminRole,
  adminOnly,
  superAdminOnly,
  photographersOnly,
  brandCoordinatorsOnly
} from './roles'

// ======================================
// CRUD Permissions
// ======================================

export {
  authorizePermission,
  authorizeResourceOwnership,
  hasCrudPermission
} from './permissions'

// ======================================
// Resource Access Control
// ======================================

export {
  checkBrandPermission,
  requireScreenAccess,
  requireCustomPermission,
  hasBrandAccess,
  hasScreenPermission,
  hasCustomPermission
} from './resources'

// ======================================
// Main export for backward compatibility
// ======================================

export { authorize as default } from './roles' 
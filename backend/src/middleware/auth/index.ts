/**
 * Authentication Middleware - Depth Studio Backend
 * Main exports for authentication functionality
 */

// ======================================
// Type Definitions
// ======================================

export type {
  AuthenticatedRequest,
  AuthErrorCode,
  AuthErrorResponse,
  FirebaseTokenData
} from './types'

// ======================================
// JWT Authentication
// ======================================

export {
  authenticateToken,
  optionalAuth,
  extractAndVerifyToken,
  fetchUserData,
  fetchUserPermissions
} from './jwt'

// ======================================
// User Operations
// ======================================

export {
  updateLastSeen,
  updateUserOffline,
  updateLoginInfo,
  checkUserExists,
  getUserBasicInfo
} from './user'

// ======================================
// Permission Checking
// ======================================

export {
  requireRole,
  requirePermission,
  requireOwnershipOrAdmin,
  checkUserPermission,
  hasRequiredRole,
  hasAdminRole
} from './permissions'

// ======================================
// Re-exports for backward compatibility
// ======================================

// Main authentication middleware (most commonly used)
export { authenticateToken as default } from './jwt' 
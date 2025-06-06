/**
 * Auth Utils - Depth Studio Backend
 * Main exports for authentication utilities
 */

// ======================================
// Database Operations
// ======================================

export {
  updateLoginInfo,
  updateLogoutInfo,
  verifyUserStatus,
  fetchUserPermissions,
  saveUserPermissions,
  createDefaultPermissions
} from './database'

// ======================================
// Permission Logic
// ======================================

export {
  checkPermission,
  evaluatePermission,
  getUserPermissions,
  getDefaultScreenPermissions,
  getDefaultCrudPermissions
} from './permissions'

// ======================================
// Validation & Updates
// ======================================

export {
  updateUserPermissions,
  validateUserId,
  validatePermissionStructure,
  validateRole,
  validatePermissionName,
  sanitizePermissions,
  comparePermissions
} from './validation'

// ======================================
// Backward Compatibility Exports
// ======================================

// Re-export main functions for backward compatibility
export { updateLoginInfo as default } from './database' 
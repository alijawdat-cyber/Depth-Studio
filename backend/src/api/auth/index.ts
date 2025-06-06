import { Router } from 'express'
import { rateLimitMiddleware } from './middleware'
import { validateAuthRequest } from './validators'
import {
  loginHandler,
  logoutHandler,
  verifyUserHandler,
  refreshTokenHandler,
  updateUserPermissionsHandler,
  getUserPermissionsHandler,
  checkPermissionHandler
} from './handlers'

const router = Router()

// ======================================
// Authentication Routes
// ======================================

/**
 * User Login
 * POST /api/auth/login
 */
router.post('/login', [
  rateLimitMiddleware.login,
  validateAuthRequest.login
], loginHandler)

/**
 * User Logout
 * POST /api/auth/logout
 */
router.post('/logout', [
  rateLimitMiddleware.auth,
  validateAuthRequest.logout
], logoutHandler)

/**
 * Verify User Status
 * GET /api/auth/verify/:uid
 */
router.get('/verify/:uid', [
  rateLimitMiddleware.auth,
  validateAuthRequest.verify
], verifyUserHandler)

/**
 * Refresh Token
 * POST /api/auth/refresh
 */
router.post('/refresh', [
  rateLimitMiddleware.refresh,
  validateAuthRequest.refresh
], refreshTokenHandler)

// ======================================
// Permission Routes
// ======================================

/**
 * Get User Permissions
 * GET /api/auth/permissions/:uid
 */
router.get('/permissions/:uid', [
  rateLimitMiddleware.auth,
  validateAuthRequest.permissions
], getUserPermissionsHandler)

/**
 * Update User Permissions
 * PUT /api/auth/permissions/:uid
 */
router.put('/permissions/:uid', [
  rateLimitMiddleware.auth,
  validateAuthRequest.updatePermissions
], updateUserPermissionsHandler)

/**
 * Check Specific Permission
 * POST /api/auth/check-permission
 */
router.post('/check-permission', [
  rateLimitMiddleware.auth,
  validateAuthRequest.checkPermission
], checkPermissionHandler)

export default router 
/**
 * Rate Limiting Middleware - Depth Studio Backend
 * Main exports for rate limiting functionality
 */

// ======================================
// Core Types and Constants
// ======================================

export {
  // Core Types
  RateLimitEntry,
  RateLimitOptions,
  UserRateLimitOptions,
  RateLimitErrorResponse,
  RateLimitStats,
  StoreStats,
  IPEntry,
  
  // Type Definitions
  UserRoleForRateLimit,
  RateLimitCategory,
  RateLimitStore,
  
  // Constants and Enums
  USER_ROLES_FOR_RATE_LIMIT,
  RATE_LIMIT_CATEGORIES,
  DEFAULT_RATE_LIMITS,
  TIME_WINDOWS,
  RATE_LIMIT_HEADERS,
  RATE_LIMIT_MESSAGES
} from './types'

// ======================================
// Store Management
// ======================================

export {
  // Store Instance
  rateLimitStore,
  
  // Store Management
  setRateLimitEntry,
  getRateLimitEntry,
  deleteRateLimitEntry,
  hasRateLimitEntry,
  getStoreSize,
  
  // Store Cleanup
  cleanupExpiredEntries,
  clearAllRateLimits,
  clearUserRateLimits,
  clearIPRateLimits,
  
  // Store Statistics
  getRateLimitStats,
  getStoreStats,
  getTopActiveIPs,
  getExpiredEntries,
  
  // Store Search
  findEntriesByPattern,
  getUserEntries,
  getIPEntries,
  
  // Emergency Functions
  resetUserRateLimit,
  resetIPRateLimit,
  resetEntriesOlderThan,
  
  // Periodic Cleanup
  startPeriodicCleanup,
  stopPeriodicCleanup
} from './store'

// ======================================
// Core Rate Limiters
// ======================================

export {
  // Core Factory Functions
  createRateLimit,
  createUserRateLimit,
  
  // Pre-configured Limiters
  generalRateLimit,
  authRateLimit,
  signupRateLimit,
  searchRateLimit,
  uploadRateLimit,
  sensitiveOperationRateLimit,
  emergencyRateLimit,
  
  // Role-based Limiters
  adminRateLimit,
  photographerRateLimit,
  coordinatorRateLimit,
  
  // Dynamic Limiters
  applyRateLimit,
  createTieredRateLimit,
  createWhitelistRateLimit,
  createBlacklistRateLimit,
  
  // Conditional Limiters
  createSizeBasedRateLimit,
  createTimeBasedRateLimit
} from './limiters'

// ======================================
// Middleware Handlers
// ======================================

export {
  // Emergency Mode
  setEmergencyMode,
  isInEmergencyMode,
  emergencyModeRateLimit,
  
  // Role-based Handlers
  roleBasedRateLimit,
  adminOnlyRateLimit,
  photographerOnlyRateLimit,
  coordinatorOnlyRateLimit,
  
  // Conditional Handlers
  operationBasedRateLimit,
  dataSizeRateLimit,
  timeBasedRateLimit,
  geographicRateLimit,
  deviceBasedRateLimit,
  loadBasedRateLimit,
  errorBasedRateLimit
} from './handlers'

// ======================================
// Rate Limiting Presets
// ======================================

// Re-import for presets
import * as limiters from './limiters'
import * as handlers from './handlers'

/**
 * مجموعات rate limiting جاهزة للاستخدام السريع
 */
export const RateLimitPresets = {
  // Basic presets
  general: limiters.generalRateLimit,
  auth: limiters.authRateLimit,
  signup: limiters.signupRateLimit,
  search: limiters.searchRateLimit,
  upload: limiters.uploadRateLimit,
  sensitive: limiters.sensitiveOperationRateLimit,
  emergency: limiters.emergencyRateLimit,
  
  // Role-based presets
  admin: limiters.adminRateLimit,
  photographer: limiters.photographerRateLimit,
  coordinator: limiters.coordinatorRateLimit,
  roleBased: handlers.roleBasedRateLimit,
  
  // Conditional presets
  timeBasedLimit: handlers.timeBasedRateLimit,
  dataSizeLimit: handlers.dataSizeRateLimit,
  deviceBasedLimit: handlers.deviceBasedRateLimit,
  loadBasedLimit: handlers.loadBasedRateLimit,
  geographicLimit: handlers.geographicRateLimit,
  errorBasedLimit: handlers.errorBasedRateLimit,
  
  // Operation-based presets
  operations: {
    read: handlers.operationBasedRateLimit('read'),
    write: handlers.operationBasedRateLimit('write'),
    delete: handlers.operationBasedRateLimit('delete'),
    upload: handlers.operationBasedRateLimit('upload')
  }
}

// ======================================
// Utility Functions
// ======================================

/**
 * دالة مساعدة لتطبيق rate limiting مع تنظيف دوري
 */
export const applyRateLimitWithCleanup = (rateLimit: any, cleanupMinutes: number = 5) => {
  import('./store').then(store => store.startPeriodicCleanup(cleanupMinutes))
  return rateLimit
}

/**
 * دالة مساعدة لدمج عدة rate limiters
 */
export const combineRateLimits = (...rateLimits: any[]) => {
  return (req: any, res: any, next: any) => {
    let index = 0
    
    const applyNext = () => {
      if (index >= rateLimits.length) {
        next()
        return
      }
      
      const currentLimiter = rateLimits[index++]
      currentLimiter(req, res, (err: any) => {
        if (err) {
          next(err)
        } else {
          applyNext()
        }
      })
    }
    
    applyNext()
  }
}

/**
 * دالة مساعدة لإنشاء rate limiter مخصص بسهولة
 */
export const createCustomRateLimit = (
  maxRequests: number,
  windowMinutes: number,
  message?: string
) => {
  return limiters.createRateLimit({
    windowMs: windowMinutes * 60 * 1000,
    maxRequests,
    message: message || `تم تجاوز الحد المسموح (${maxRequests} طلب / ${windowMinutes} دقيقة)`
  })
}

// ======================================
// Default Export
// ======================================

export default {
  // Core functionality
  createRateLimit: limiters.createRateLimit,
  createUserRateLimit: limiters.createUserRateLimit,
  roleBasedRateLimit: handlers.roleBasedRateLimit,
  setEmergencyMode: handlers.setEmergencyMode,
  
  // Presets
  RateLimitPresets,
  
  // Utility functions
  applyRateLimitWithCleanup,
  combineRateLimits,
  createCustomRateLimit
} 
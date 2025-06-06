/**
 * Security Module Index - Depth Studio Backend
 * Main exports and security presets
 */

// Export all types and configurations
export * from './types'
export * from './config'
export * from './headers'

// Re-export main components
export { 
  securityHeaders,
  apiSecurityHeaders,
  csrfProtection,
  clickjackingProtection,
  mimeTypeProtection,
  permissionsPolicy,
  sanitizeResponseHeaders,
  userAgentValidation,
  bruteForceLimiter
} from './headers'

export {
  SecurityLevel,
  SecurityOptions,
  DEFAULT_SECURITY_OPTIONS,
  ALLOWED_HOSTS,
  SENSITIVE_ENDPOINTS
} from './types'

import { 
  securityHeaders,
  apiSecurityHeaders,
  csrfProtection,
  clickjackingProtection,
  mimeTypeProtection,
  permissionsPolicy,
  sanitizeResponseHeaders,
  userAgentValidation,
  bruteForceLimiter
} from './headers'
import { SecurityLevel } from './types'

// ======================================
// Security Presets
// ======================================

/**
 * Security middleware للإنتاج
 */
export const productionSecurity = [
  securityHeaders({ isDevelopment: false }),
  permissionsPolicy,
  apiSecurityHeaders,
  csrfProtection,
  clickjackingProtection,
  mimeTypeProtection,
  sanitizeResponseHeaders,
  bruteForceLimiter,
  userAgentValidation
]

/**
 * Security middleware للتطوير
 */
export const developmentSecurity = [
  securityHeaders({ isDevelopment: true }),
  apiSecurityHeaders,
  sanitizeResponseHeaders
]

/**
 * Security middleware حسب البيئة
 */
export const environmentSecurity = process.env.NODE_ENV === 'production' 
  ? productionSecurity 
  : developmentSecurity

/**
 * تطبيق الأمان على route محدد
 */
export const applySecurityToRoute = (securityLevel: SecurityLevel = 'basic') => {
  switch (securityLevel) {
    case 'maximum':
      return [
        securityHeaders(),
        apiSecurityHeaders,
        csrfProtection,
        clickjackingProtection,
        bruteForceLimiter,
        userAgentValidation
      ]
    
    case 'enhanced':
      return [
        securityHeaders(),
        apiSecurityHeaders,
        csrfProtection,
        sanitizeResponseHeaders
      ]
    
    case 'basic':
    default:
      return [
        securityHeaders(),
        apiSecurityHeaders
      ]
  }
} 
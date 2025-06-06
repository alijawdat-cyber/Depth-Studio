/**
 * Error Module Index - Depth Studio Backend
 * Main exports for the error handling system
 */

// Export error types and classes
export * from './types'

// Export error handlers
export * from './handlers'

// Export utility functions
export * from './utils'

// Re-export main components for convenience
export { errorHandler } from './handlers'
export { setupGlobalErrorHandlers, notFoundHandler, timeoutHandler } from './utils'
export { 
  AppError, 
  ValidationError, 
  AuthenticationError, 
  AuthorizationError, 
  NotFoundError, 
  ConflictError, 
  RateLimitError, 
  ServiceUnavailableError 
} from './types' 
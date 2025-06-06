/**
 * Logging Module Index - Depth Studio Backend
 * Main exports for the logging system
 */

// Export types and enums
export * from './types'

// Export utility functions
export * from './utils'

// Export handlers and middleware
export * from './handlers'

// Re-export main components for convenience
export { 
  requestLogger, 
  simpleLogger, 
  errorLogger, 
  auditLogger, 
  adminActionLogger 
} from './handlers'

export { 
  getLogStats, 
  updateLogStats, 
  resetLogStats,
  generateRequestId,
  getClientIP
} from './utils'

export { 
  LogLevel, 
  DEFAULT_LOGGING_OPTIONS,
  type LogEntry,
  type LoggingOptions,
  type LogStats
} from './types' 
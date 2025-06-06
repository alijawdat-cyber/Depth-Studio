/**
 * CORS Module Index - Depth Studio Backend
 * Main exports for the CORS system
 */

// Export all types and configurations
export * from './types'
export * from './config'
export * from './handlers'

// Re-export main components
export { 
  corsHandler,
  developmentCors,
  productionCors,
  publicApiCors,
  roleBasedCors,
  environmentCors,
  validateOriginSecurity,
  validateRefererOrigin,
  getCorsStats,
  updateCorsStats,
  resetCorsStats
} from './handlers'

export {
  getAllowedOrigins,
  getCorsConfigByRole,
  getCorsConfigByEnvironment,
  getAdminCorsConfig,
  getPhotographerCorsConfig,
  getBrandCorsConfig,
  getPublicApiCorsConfig
} from './config'

export {
  CorsOptions,
  CorsStats,
  Environment,
  UserRole,
  CorsLevel,
  DEFAULT_CORS_OPTIONS,
  ENVIRONMENT_ORIGINS,
  ROLE_BASED_ORIGINS
} from './types'

// Main CORS middleware based on environment
export const defaultCors = process.env.NODE_ENV === 'production' 
  ? productionCors 
  : developmentCors

// Export convenient presets
import { 
  corsHandler,
  developmentCors,
  productionCors,
  publicApiCors,
  roleBasedCors,
  environmentCors
} from './handlers'

export const corsPresets = {
  development: developmentCors,
  production: productionCors,
  public: publicApiCors,
  roleBased: roleBasedCors,
  environment: environmentCors,
  custom: corsHandler
} 
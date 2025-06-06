/**
 * CORS Configuration - Depth Studio Backend
 * CORS configurations for different environments and roles
 */

import { 
  CorsOptions, 
  Environment, 
  UserRole,
  ENVIRONMENT_ORIGINS,
  ROLE_BASED_ORIGINS,
  DEFAULT_ALLOWED_HEADERS,
  DEFAULT_EXPOSED_HEADERS
} from './types'

// ======================================
// Environment-based Configurations
// ======================================

/**
 * الحصول على الأصول المسموحة حسب البيئة
 */
export const getAllowedOrigins = (environment?: Environment): string[] => {
  const env = environment || (process.env.NODE_ENV as Environment) || 'development'
  return ENVIRONMENT_ORIGINS[env] || ENVIRONMENT_ORIGINS.development
}

/**
 * إعدادات CORS للتطوير
 */
export const getDevelopmentCorsConfig = (): CorsOptions => ({
  allowedOrigins: ['*'], // مفتوح للجميع في التطوير
  allowCredentials: true,
  allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['*'],
  exposedHeaders: ['*'],
  maxAge: 3600, // ساعة واحدة
  preflightContinue: false,
  optionsSuccessStatus: 200
})

/**
 * إعدادات CORS للإنتاج
 */
export const getProductionCorsConfig = (): CorsOptions => ({
  allowedOrigins: [
    'https://depth-studio.com',
    'https://www.depth-studio.com',
    'https://admin.depth-studio.com'
  ],
  allowCredentials: true,
  allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: DEFAULT_ALLOWED_HEADERS,
  exposedHeaders: DEFAULT_EXPOSED_HEADERS,
  maxAge: 86400, // 24 ساعة
  preflightContinue: false,
  optionsSuccessStatus: 200
})

/**
 * إعدادات CORS للتجريب
 */
export const getStagingCorsConfig = (): CorsOptions => ({
  allowedOrigins: [
    'https://staging.depth-studio.com',
    'https://test.depth-studio.com',
    'http://localhost:3000',
    'http://localhost:3001'
  ],
  allowCredentials: true,
  allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: DEFAULT_ALLOWED_HEADERS,
  exposedHeaders: DEFAULT_EXPOSED_HEADERS,
  maxAge: 7200, // ساعتان
  preflightContinue: false,
  optionsSuccessStatus: 200
})

// ======================================
// Role-based Configurations
// ======================================

/**
 * إعدادات CORS للمديرين
 */
export const getAdminCorsConfig = (): CorsOptions => ({
  allowedOrigins: [
    'https://admin.depth-studio.com',
    'https://dashboard.depth-studio.com',
    ...(process.env.NODE_ENV === 'development' ? ['http://localhost:3000', 'http://localhost:3001'] : [])
  ],
  allowCredentials: true,
  allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: DEFAULT_ALLOWED_HEADERS,
  exposedHeaders: DEFAULT_EXPOSED_HEADERS,
  maxAge: 3600, // ساعة واحدة
  preflightContinue: false,
  optionsSuccessStatus: 200
})

/**
 * إعدادات CORS للمصورين
 */
export const getPhotographerCorsConfig = (): CorsOptions => ({
  allowedOrigins: [
    'https://photographer.depth-studio.com',
    ...(process.env.NODE_ENV === 'development' ? ['http://localhost:3000'] : [])
  ],
  allowCredentials: true,
  allowedMethods: ['GET', 'POST', 'PUT', 'PATCH'], // بدون DELETE
  allowedHeaders: DEFAULT_ALLOWED_HEADERS,
  exposedHeaders: DEFAULT_EXPOSED_HEADERS,
  maxAge: 3600,
  preflightContinue: false,
  optionsSuccessStatus: 200
})

/**
 * إعدادات CORS للبراندات
 */
export const getBrandCorsConfig = (): CorsOptions => ({
  allowedOrigins: [
    'https://brand.depth-studio.com',
    ...(process.env.NODE_ENV === 'development' ? ['http://localhost:3001'] : [])
  ],
  allowCredentials: true,
  allowedMethods: ['GET', 'POST', 'PUT', 'PATCH'],
  allowedHeaders: DEFAULT_ALLOWED_HEADERS,
  exposedHeaders: DEFAULT_EXPOSED_HEADERS,
  maxAge: 3600,
  preflightContinue: false,
  optionsSuccessStatus: 200
})

/**
 * إعدادات CORS للواجهات العامة
 */
export const getPublicApiCorsConfig = (): CorsOptions => ({
  allowedOrigins: ['*'],
  allowCredentials: false,
  allowedMethods: ['GET', 'POST'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'X-API-Key'
  ],
  exposedHeaders: [
    'X-Request-ID',
    'X-Response-Time',
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining'
  ],
  maxAge: 3600,
  preflightContinue: false,
  optionsSuccessStatus: 200
})

// ======================================
// Configuration Factory
// ======================================

/**
 * الحصول على إعدادات CORS حسب الدور
 */
export const getCorsConfigByRole = (role: UserRole): CorsOptions => {
  switch (role) {
    case 'super_admin':
    case 'marketing_coordinator':
      return getAdminCorsConfig()
    case 'brand_coordinator':
      return getBrandCorsConfig()
    case 'photographer':
      return getPhotographerCorsConfig()
    default:
      return getProductionCorsConfig()
  }
}

/**
 * الحصول على إعدادات CORS حسب البيئة
 */
export const getCorsConfigByEnvironment = (environment?: Environment): CorsOptions => {
  const env = environment || (process.env.NODE_ENV as Environment) || 'development'
  
  switch (env) {
    case 'production':
      return getProductionCorsConfig()
    case 'staging':
      return getStagingCorsConfig()
    case 'development':
    default:
      return getDevelopmentCorsConfig()
  }
} 
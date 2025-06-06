/**
 * CORS Types - Depth Studio Backend
 * Type definitions for CORS middleware
 */

// ======================================
// Core Types
// ======================================

/**
 * إعدادات CORS
 */
export interface CorsOptions {
  allowedOrigins: string[]
  allowCredentials: boolean
  allowedMethods: string[]
  allowedHeaders: string[]
  exposedHeaders: string[]
  maxAge: number
  preflightContinue: boolean
  optionsSuccessStatus: number
}

/**
 * إحصائيات طلبات CORS
 */
export interface CorsStats {
  totalRequests: number
  allowedRequests: number
  blockedRequests: number
  topOrigins: Array<{ origin: string; count: number }>
  preflightRequests: number
}

/**
 * أنواع البيئات
 */
export type Environment = 'development' | 'staging' | 'production'

/**
 * مستويات CORS
 */
export type CorsLevel = 'public' | 'authenticated' | 'admin' | 'restricted'

/**
 * أدوار المستخدمين للـ CORS
 */
export type UserRole = 
  | 'super_admin' 
  | 'marketing_coordinator' 
  | 'brand_coordinator' 
  | 'photographer'

// ======================================
// Configuration Constants
// ======================================

/**
 * الأصول المسموحة حسب البيئة
 */
export const ENVIRONMENT_ORIGINS: Record<Environment, string[]> = {
  production: [
    'https://depth-studio.com',
    'https://www.depth-studio.com',
    'https://admin.depth-studio.com',
    'https://dashboard.depth-studio.com'
  ],
  staging: [
    'https://staging.depth-studio.com',
    'https://test.depth-studio.com',
    'http://localhost:3000',
    'http://localhost:3001'
  ],
  development: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173',  // Vite
    'http://localhost:8080',  // Vue/Webpack
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:5173'
  ]
}

/**
 * الأصول حسب دور المستخدم
 */
export const ROLE_BASED_ORIGINS: Record<UserRole, string[]> = {
  super_admin: [
    'https://admin.depth-studio.com',
    'https://dashboard.depth-studio.com'
  ],
  marketing_coordinator: [
    'https://admin.depth-studio.com',
    'https://dashboard.depth-studio.com'
  ],
  brand_coordinator: [
    'https://brand.depth-studio.com'
  ],
  photographer: [
    'https://photographer.depth-studio.com'
  ]
}

/**
 * Headers مسموحة افتراضياً
 */
export const DEFAULT_ALLOWED_HEADERS = [
  'Origin',
  'X-Requested-With',
  'Content-Type',
  'Accept',
  'Authorization',
  'X-Request-ID',
  'X-API-Key',
  'X-User-Role',
  'X-Brand-ID',
  'Cache-Control',
  'Pragma'
]

/**
 * Headers مكشوفة افتراضياً
 */
export const DEFAULT_EXPOSED_HEADERS = [
  'X-Request-ID',
  'X-Response-Time',
  'X-RateLimit-Limit',
  'X-RateLimit-Remaining',
  'X-RateLimit-Reset',
  'X-Total-Count',
  'X-Page-Count',
  'Link'
]

/**
 * طرق HTTP مسموحة افتراضياً
 */
export const DEFAULT_ALLOWED_METHODS = [
  'GET', 
  'POST', 
  'PUT', 
  'DELETE', 
  'PATCH', 
  'OPTIONS'
]

/**
 * أنماط أصول مشبوهة
 */
export const SUSPICIOUS_ORIGIN_PATTERNS = [
  /localhost:\d{4}/, // localhost ports (في الإنتاج)
  /\d+\.\d+\.\d+\.\d+/, // IP addresses
  /[a-z0-9]+\.ngrok\.io/, // Ngrok tunnels
  /[a-z0-9]+\.github\.io/, // GitHub pages
  /[a-z0-9]+\.herokuapp\.com/, // Heroku apps
  /[a-z0-9]+\.vercel\.app/, // Vercel deployments
  /[a-z0-9]+\.netlify\.app/ // Netlify deployments
]

// ======================================
// Default Configurations
// ======================================

/**
 * الإعدادات الافتراضية لـ CORS
 */
export const DEFAULT_CORS_OPTIONS: CorsOptions = {
  allowedOrigins: ENVIRONMENT_ORIGINS[process.env.NODE_ENV as Environment || 'development'],
  allowCredentials: true,
  allowedMethods: DEFAULT_ALLOWED_METHODS,
  allowedHeaders: DEFAULT_ALLOWED_HEADERS,
  exposedHeaders: DEFAULT_EXPOSED_HEADERS,
  maxAge: 86400, // 24 ساعة
  preflightContinue: false,
  optionsSuccessStatus: 200
} 
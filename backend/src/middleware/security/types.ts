/**
 * Security Types - Depth Studio Backend
 * Type definitions for security middleware
 */

// ======================================
// Core Types
// ======================================

/**
 * إعدادات الأمان المخصصة
 */
export interface SecurityOptions {
  enableCSP: boolean
  enableHSTS: boolean
  enableNoSniff: boolean
  enableFrameguard: boolean
  enableXSSFilter: boolean
  enableReferrerPolicy: boolean
  enablePermissionsPolicy: boolean
  customCSP?: string
  isDevelopment: boolean
}

/**
 * مستويات الأمان
 */
export type SecurityLevel = 'basic' | 'enhanced' | 'maximum'

/**
 * إعدادات Content Security Policy
 */
export interface CSPConfig {
  directives: {
    defaultSrc?: string[]
    scriptSrc?: string[]
    styleSrc?: string[]
    fontSrc?: string[]
    imgSrc?: string[]
    mediaSrc?: string[]
    connectSrc?: string[]
    frameSrc?: string[]
    objectSrc?: string[]
    upgradeInsecureRequests?: string[]
  }
}

/**
 * إعدادات HSTS
 */
export interface HSTSConfig {
  maxAge: number
  includeSubDomains: boolean
  preload: boolean
}

/**
 * إعدادات Rate Limiting للأمان
 */
export interface SecurityRateLimitConfig {
  windowMs: number
  maxRequests: number
  delayMs?: number
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
}

/**
 * إعدادات User Agent validation
 */
export interface UserAgentConfig {
  allowedPatterns?: RegExp[]
  blockedPatterns?: RegExp[]
  strict?: boolean
}

/**
 * Security headers mapping
 */
export interface SecurityHeaders {
  'Content-Security-Policy'?: string
  'Strict-Transport-Security'?: string
  'X-Content-Type-Options'?: string
  'X-Frame-Options'?: string
  'X-XSS-Protection'?: string
  'Referrer-Policy'?: string
  'Permissions-Policy'?: string
  'X-API-Version'?: string
  'X-Robots-Tag'?: string
  'Cache-Control'?: string
  'Pragma'?: string
  'Expires'?: string
}

// ======================================
// Configuration Constants
// ======================================

/**
 * الإعدادات الافتراضية للأمان
 */
export const DEFAULT_SECURITY_OPTIONS: SecurityOptions = {
  enableCSP: true,
  enableHSTS: true,
  enableNoSniff: true,
  enableFrameguard: true,
  enableXSSFilter: true,
  enableReferrerPolicy: true,
  enablePermissionsPolicy: true,
  isDevelopment: process.env.NODE_ENV === 'development'
}

/**
 * المضيفات المسموحة في الإنتاج
 */
export const ALLOWED_HOSTS = [
  'depth-studio.com',
  'www.depth-studio.com',
  'admin.depth-studio.com'
]

/**
 * الـ endpoints الحساسة
 */
export const SENSITIVE_ENDPOINTS = [
  '/auth/login',
  '/auth/signup', 
  '/auth/reset-password',
  '/admin',
  '/users/delete',
  '/campaigns/delete'
]

/**
 * Bot patterns مشبوهة
 */
export const SUSPICIOUS_BOT_PATTERNS = [
  /curl/i,
  /wget/i,
  /python/i,
  /bot/i,
  /crawler/i,
  /scanner/i,
  /sqlmap/i,
  /nikto/i
] 
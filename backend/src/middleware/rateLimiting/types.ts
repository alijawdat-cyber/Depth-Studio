/**
 * Rate Limiting Types - Depth Studio Backend
 * Type definitions for rate limiting middleware
 */

import { Request } from 'express'

// ======================================
// Core Types
// ======================================

/**
 * بيانات Rate Limit لكل مفتاح (IP أو User)
 */
export interface RateLimitEntry {
  count: number
  resetTime: number
  lastRequest: number
}

/**
 * إعدادات Rate Limiter
 */
export interface RateLimitOptions {
  windowMs: number      // فترة النافذة بالميلي ثانية
  maxRequests: number   // عدد الطلبات المسموحة
  message?: string      // رسالة مخصصة
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
  keyGenerator?: (req: Request) => string
}

/**
 * إعدادات Rate Limiter للمستخدمين
 */
export interface UserRateLimitOptions {
  windowMs: number
  maxRequests: number
  message?: string
}

/**
 * استجابة خطأ Rate Limit
 */
export interface RateLimitErrorResponse {
  success: false
  error: 'rate_limit_exceeded'
  message: string
  details: {
    limit: number
    remaining: number
    reset: string
    retryAfter: number
  }
  timestamp: string
}

/**
 * إحصائيات Rate Limiting
 */
export interface RateLimitStats {
  totalEntries: number
  activeEntries: number
  topIPs: Array<{
    ip: string
    count: number
    resetTime: number
  }>
}

/**
 * معلومات IP مع عدد الطلبات
 */
export interface IPEntry {
  ip: string
  count: number
  resetTime: number
}

// ======================================
// User Role Types
// ======================================

/**
 * أدوار المستخدمين للـ rate limiting
 */
export const USER_ROLES_FOR_RATE_LIMIT = [
  'super_admin',
  'marketing_coordinator',
  'brand_coordinator',
  'photographer'
] as const

export type UserRoleForRateLimit = typeof USER_ROLES_FOR_RATE_LIMIT[number]

/**
 * إعدادات Rate Limit لكل دور
 */
export interface RoleBasedLimits {
  [key: string]: {
    windowMs: number
    maxRequests: number
    message: string
  }
}

// ======================================
// Rate Limit Categories
// ======================================

/**
 * أنواع العمليات للـ rate limiting
 */
export const RATE_LIMIT_CATEGORIES = [
  'general',
  'auth',
  'signup',
  'search',
  'upload',
  'admin',
  'photographer',
  'coordinator',
  'sensitive',
  'emergency'
] as const

export type RateLimitCategory = typeof RATE_LIMIT_CATEGORIES[number]

/**
 * إعدادات مختلفة لكل فئة
 */
export interface CategoryLimits {
  general: RateLimitOptions
  auth: RateLimitOptions
  signup: RateLimitOptions
  search: RateLimitOptions
  upload: RateLimitOptions
  admin: RateLimitOptions
  photographer: RateLimitOptions
  coordinator: RateLimitOptions
  sensitive: RateLimitOptions
  emergency: RateLimitOptions
}

// ======================================
// Default Limits Configuration
// ======================================

/**
 * الحدود الافتراضية للـ rate limiting
 */
export const DEFAULT_RATE_LIMITS = {
  // عام للجميع
  GENERAL: {
    WINDOW_MS: 15 * 60 * 1000, // 15 دقيقة
    MAX_REQUESTS: 1000,         // 1000 طلب
    MESSAGE: 'تم تجاوز الحد العام للطلبات (1000 طلب / 15 دقيقة)'
  },

  // المصادقة
  AUTH: {
    WINDOW_MS: 15 * 60 * 1000, // 15 دقيقة
    MAX_REQUESTS: 10,          // 10 محاولات
    MESSAGE: 'تم تجاوز الحد المسموح لمحاولات تسجيل الدخول (10 محاولات / 15 دقيقة)'
  },

  // التسجيل
  SIGNUP: {
    WINDOW_MS: 60 * 60 * 1000, // ساعة واحدة
    MAX_REQUESTS: 3,           // 3 تسجيلات
    MESSAGE: 'تم تجاوز الحد المسموح للتسجيل (3 حسابات / ساعة)'
  },

  // البحث
  SEARCH: {
    WINDOW_MS: 1 * 60 * 1000,  // دقيقة واحدة
    MAX_REQUESTS: 60,          // 60 بحث
    MESSAGE: 'تم تجاوز الحد المسموح للبحث (60 بحث / دقيقة)'
  },

  // رفع الملفات
  UPLOAD: {
    WINDOW_MS: 10 * 60 * 1000, // 10 دقائق
    MAX_REQUESTS: 20,          // 20 رفع
    MESSAGE: 'تم تجاوز الحد المسموح لرفع الملفات (20 ملف / 10 دقائق)'
  },

  // المديرين
  ADMIN: {
    WINDOW_MS: 15 * 60 * 1000, // 15 دقيقة
    MAX_REQUESTS: 5000,        // 5000 طلب
    MESSAGE: 'تم تجاوز الحد المسموح للمديرين (5000 طلب / 15 دقيقة)'
  },

  // المصورين
  PHOTOGRAPHER: {
    WINDOW_MS: 15 * 60 * 1000, // 15 دقيقة
    MAX_REQUESTS: 500,         // 500 طلب
    MESSAGE: 'تم تجاوز الحد المسموح للمصورين (500 طلب / 15 دقيقة)'
  },

  // المنسقين
  COORDINATOR: {
    WINDOW_MS: 15 * 60 * 1000, // 15 دقيقة
    MAX_REQUESTS: 2000,        // 2000 طلب
    MESSAGE: 'تم تجاوز الحد المسموح للمنسقين (2000 طلب / 15 دقيقة)'
  },

  // العمليات الحساسة
  SENSITIVE: {
    WINDOW_MS: 60 * 60 * 1000, // ساعة واحدة
    MAX_REQUESTS: 5,           // 5 عمليات
    MESSAGE: 'تم تجاوز الحد المسموح للعمليات الحساسة (5 عمليات / ساعة)'
  },

  // حالة الطوارئ
  EMERGENCY: {
    WINDOW_MS: 1 * 60 * 1000,  // دقيقة واحدة
    MAX_REQUESTS: 10,          // 10 طلبات
    MESSAGE: 'النظام في حالة طوارئ - الحد المسموح 10 طلبات / دقيقة'
  }
} as const

// ======================================
// Time Constants
// ======================================

/**
 * ثوابت الوقت بالميلي ثانية
 */
export const TIME_WINDOWS = {
  ONE_MINUTE: 1 * 60 * 1000,
  FIVE_MINUTES: 5 * 60 * 1000,
  TEN_MINUTES: 10 * 60 * 1000,
  FIFTEEN_MINUTES: 15 * 60 * 1000,
  THIRTY_MINUTES: 30 * 60 * 1000,
  ONE_HOUR: 60 * 60 * 1000,
  SIX_HOURS: 6 * 60 * 60 * 1000,
  TWELVE_HOURS: 12 * 60 * 60 * 1000,
  ONE_DAY: 24 * 60 * 60 * 1000
} as const

// ======================================
// HTTP Headers
// ======================================

/**
 * أسماء headers الخاصة بـ rate limiting
 */
export const RATE_LIMIT_HEADERS = {
  LIMIT: 'X-RateLimit-Limit',
  REMAINING: 'X-RateLimit-Remaining',
  RESET: 'X-RateLimit-Reset',
  WINDOW: 'X-RateLimit-Window',
  RETRY_AFTER: 'Retry-After'
} as const

// ======================================
// Error Messages
// ======================================

/**
 * رسائل خطأ افتراضية
 */
export const RATE_LIMIT_MESSAGES = {
  DEFAULT: 'تم تجاوز الحد المسموح من الطلبات، حاول مرة أخرى لاحقاً',
  AUTH_FAILED: 'تم تجاوز الحد المسموح لمحاولات تسجيل الدخول',
  SIGNUP_FAILED: 'تم تجاوز الحد المسموح للتسجيل',
  SEARCH_FAILED: 'تم تجاوز الحد المسموح للبحث',
  UPLOAD_FAILED: 'تم تجاوز الحد المسموح لرفع الملفات',
  SENSITIVE_FAILED: 'تم تجاوز الحد المسموح للعمليات الحساسة',
  EMERGENCY_MODE: 'النظام في حالة طوارئ - معدل الطلبات محدود'
} as const

// ======================================
// Store Types
// ======================================

/**
 * نوع المخزن لبيانات Rate Limiting
 */
export type RateLimitStore = Map<string, RateLimitEntry>

/**
 * إحصائيات المخزن
 */
export interface StoreStats {
  size: number
  memoryUsage: number
  oldestEntry: number
  newestEntry: number
} 
/**
 * Security Configuration - Depth Studio Backend
 * CSP and security configurations
 */

import { CSPConfig, HSTSConfig } from './types'

// ======================================
// Content Security Policy Configurations
// ======================================

/**
 * Content Security Policy للإنتاج
 */
export const getProductionCSP = (): CSPConfig => ({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: [
      "'self'",
      "'unsafe-inline'", // مطلوب لـ Firebase
      "https://www.gstatic.com",
      "https://www.googleapis.com",
      "https://apis.google.com",
      "https://securetoken.googleapis.com"
    ],
    styleSrc: [
      "'self'",
      "'unsafe-inline'",
      "https://fonts.googleapis.com"
    ],
    fontSrc: [
      "'self'",
      "https://fonts.gstatic.com"
    ],
    imgSrc: [
      "'self'",
      "data:",
      "https:",
      "https://firebasestorage.googleapis.com",
      "https://storage.googleapis.com"
    ],
    mediaSrc: [
      "'self'",
      "https://firebasestorage.googleapis.com",
      "https://storage.googleapis.com"
    ],
    connectSrc: [
      "'self'",
      "https://api.depth-studio.com",
      "https://depth-studio.firebaseio.com",
      "https://firestore.googleapis.com",
      "https://identitytoolkit.googleapis.com",
      "https://securetoken.googleapis.com"
    ],
    frameSrc: [
      "'self'",
      "https://depth-studio.firebaseapp.com"
    ],
    objectSrc: ["'none'"],
    upgradeInsecureRequests: []
  }
})

/**
 * Content Security Policy للتطوير (أكثر مرونة)
 */
export const getDevelopmentCSP = (): CSPConfig => ({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: [
      "'self'",
      "'unsafe-inline'",
      "'unsafe-eval'", // مطلوب للتطوير
      "http://localhost:*",
      "https://www.gstatic.com",
      "https://www.googleapis.com"
    ],
    styleSrc: [
      "'self'",
      "'unsafe-inline'",
      "http://localhost:*"
    ],
    imgSrc: [
      "'self'",
      "data:",
      "http:",
      "https:"
    ],
    connectSrc: [
      "'self'",
      "http://localhost:*",
      "ws://localhost:*",
      "https:"
    ],
    fontSrc: [
      "'self'",
      "data:",
      "http:",
      "https:"
    ],
    frameSrc: ["'self'", "http://localhost:*"],
    objectSrc: ["'none'"]
  }
})

// ======================================
// HSTS Configuration
// ======================================

/**
 * إعدادات HSTS للإنتاج
 */
export const getProductionHSTS = (): HSTSConfig => ({
  maxAge: 31536000, // سنة واحدة
  includeSubDomains: true,
  preload: true
})

/**
 * إعدادات HSTS للتطوير
 */
export const getDevelopmentHSTS = (): HSTSConfig => ({
  maxAge: 86400, // يوم واحد
  includeSubDomains: false,
  preload: false
})

// ======================================
// Permissions Policy
// ======================================

/**
 * Permissions Policy للإنتاج
 */
export const getPermissionsPolicy = (): string => {
  return [
    'camera=(self)',
    'microphone=(self)', 
    'geolocation=(self)',
    'notifications=(self)',
    'push=(self)',
    'fullscreen=(self)',
    'payment=(self)',
    'usb=()',
    'accelerometer=()',
    'gyroscope=()',
    'magnetometer=()'
  ].join(', ')
}

// ======================================
// Cache Control Headers
// ======================================

/**
 * Cache control للـ APIs الحساسة
 */
export const getNoCacheHeaders = () => ({
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
  'Surrogate-Control': 'no-store'
})

/**
 * Cache control للـ static assets
 */
export const getStaticCacheHeaders = () => ({
  'Cache-Control': 'public, max-age=31536000, immutable' // سنة واحدة
}) 
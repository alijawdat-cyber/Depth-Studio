/**
 * Rate Limiting Store - Depth Studio Backend
 * In-memory storage and management for rate limiting data
 */

import { RateLimitEntry, RateLimitStore, RateLimitStats, StoreStats, IPEntry } from './types'

// ======================================
// Global Store Instance
// ======================================

/**
 * المخزن الرئيسي لبيانات Rate Limiting
 * (في الإنتاج استخدم Redis)
 */
export const rateLimitStore: RateLimitStore = new Map<string, RateLimitEntry>()

// ======================================
// Store Management Functions
// ======================================

/**
 * إضافة أو تحديث entry في المخزن
 */
export const setRateLimitEntry = (key: string, entry: RateLimitEntry): void => {
  rateLimitStore.set(key, entry)
}

/**
 * الحصول على entry من المخزن
 */
export const getRateLimitEntry = (key: string): RateLimitEntry | undefined => {
  return rateLimitStore.get(key)
}

/**
 * حذف entry من المخزن
 */
export const deleteRateLimitEntry = (key: string): boolean => {
  return rateLimitStore.delete(key)
}

/**
 * فحص وجود entry في المخزن
 */
export const hasRateLimitEntry = (key: string): boolean => {
  return rateLimitStore.has(key)
}

/**
 * الحصول على حجم المخزن
 */
export const getStoreSize = (): number => {
  return rateLimitStore.size
}

// ======================================
// Store Cleanup Functions
// ======================================

/**
 * تنظيف البيانات المنتهية الصلاحية من الذاكرة
 */
export const cleanupExpiredEntries = (currentTime: number): number => {
  let cleanedCount = 0
  
  for (const [key, entry] of rateLimitStore.entries()) {
    if (currentTime > entry.resetTime) {
      rateLimitStore.delete(key)
      cleanedCount++
    }
  }
  
  return cleanedCount
}

/**
 * تنظيف شامل للمخزن - حذف جميع البيانات
 */
export const clearAllRateLimits = (): void => {
  rateLimitStore.clear()
}

/**
 * تنظيف entries لمستخدم محدد
 */
export const clearUserRateLimits = (userId: string): number => {
  let clearedCount = 0
  const keysToDelete: string[] = []
  
  for (const [key] of rateLimitStore.entries()) {
    if (key.includes(userId)) {
      keysToDelete.push(key)
    }
  }
  
  keysToDelete.forEach(key => {
    if (rateLimitStore.delete(key)) {
      clearedCount++
    }
  })
  
  return clearedCount
}

/**
 * تنظيف entries لـ IP محدد
 */
export const clearIPRateLimits = (ip: string): number => {
  let clearedCount = 0
  const keysToDelete: string[] = []
  
  for (const [key] of rateLimitStore.entries()) {
    if (key === ip || key.startsWith(`${ip}:`)) {
      keysToDelete.push(key)
    }
  }
  
  keysToDelete.forEach(key => {
    if (rateLimitStore.delete(key)) {
      clearedCount++
    }
  })
  
  return clearedCount
}

// ======================================
// Store Statistics Functions
// ======================================

/**
 * الحصول على إحصائيات شاملة للمخزن
 */
export const getRateLimitStats = (): RateLimitStats => {
  const now = Date.now()
  const activeEntries: IPEntry[] = []
  
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now <= entry.resetTime) {
      activeEntries.push({
        ip: key,
        count: entry.count,
        resetTime: entry.resetTime
      })
    }
  }
  
  // ترتيب حسب عدد الطلبات
  activeEntries.sort((a, b) => b.count - a.count)
  
  return {
    totalEntries: rateLimitStore.size,
    activeEntries: activeEntries.length,
    topIPs: activeEntries.slice(0, 10) // أعلى 10 IPs
  }
}

/**
 * الحصول على إحصائيات أداء المخزن
 */
export const getStoreStats = (): StoreStats => {
  const entries = Array.from(rateLimitStore.values())
  const now = Date.now()
  
  let oldestEntry = now
  let newestEntry = 0
  let memoryUsage = 0
  
  entries.forEach(entry => {
    // حساب استخدام الذاكرة التقريبي
    memoryUsage += JSON.stringify(entry).length
    
    // العثور على أقدم وأحدث entries
    if (entry.lastRequest < oldestEntry) {
      oldestEntry = entry.lastRequest
    }
    if (entry.lastRequest > newestEntry) {
      newestEntry = entry.lastRequest
    }
  })
  
  return {
    size: rateLimitStore.size,
    memoryUsage: memoryUsage,
    oldestEntry: oldestEntry === now ? 0 : oldestEntry,
    newestEntry: newestEntry
  }
}

/**
 * الحصول على أكثر IPs نشاطاً
 */
export const getTopActiveIPs = (limit: number = 10): IPEntry[] => {
  const now = Date.now()
  const activeEntries: IPEntry[] = []
  
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now <= entry.resetTime) {
      activeEntries.push({
        ip: key,
        count: entry.count,
        resetTime: entry.resetTime
      })
    }
  }
  
  return activeEntries
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

/**
 * الحصول على entries منتهية الصلاحية
 */
export const getExpiredEntries = (): string[] => {
  const now = Date.now()
  const expiredKeys: string[] = []
  
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      expiredKeys.push(key)
    }
  }
  
  return expiredKeys
}

// ======================================
// Store Search Functions
// ======================================

/**
 * البحث عن entries بناءً على pattern
 */
export const findEntriesByPattern = (pattern: string): Map<string, RateLimitEntry> => {
  const results = new Map<string, RateLimitEntry>()
  const regex = new RegExp(pattern, 'i')
  
  for (const [key, entry] of rateLimitStore.entries()) {
    if (regex.test(key)) {
      results.set(key, entry)
    }
  }
  
  return results
}

/**
 * البحث عن entries للمستخدمين فقط
 */
export const getUserEntries = (): Map<string, RateLimitEntry> => {
  const userEntries = new Map<string, RateLimitEntry>()
  
  for (const [key, entry] of rateLimitStore.entries()) {
    // افتراض أن معرفات المستخدمين تحتوي على أحرف وأرقام
    if (key.length > 15 && /^[a-zA-Z0-9]+$/.test(key)) {
      userEntries.set(key, entry)
    }
  }
  
  return userEntries
}

/**
 * البحث عن entries للـ IPs فقط
 */
export const getIPEntries = (): Map<string, RateLimitEntry> => {
  const ipEntries = new Map<string, RateLimitEntry>()
  const ipRegex = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/
  
  for (const [key, entry] of rateLimitStore.entries()) {
    if (ipRegex.test(key)) {
      ipEntries.set(key, entry)
    }
  }
  
  return ipEntries
}

// ======================================
// Emergency Functions
// ======================================

/**
 * إعادة تعيين Rate Limit لمستخدم محدد (للطوارئ)
 */
export const resetUserRateLimit = (userId: string): boolean => {
  return deleteRateLimitEntry(userId)
}

/**
 * إعادة تعيين Rate Limit لـ IP محدد
 */
export const resetIPRateLimit = (ip: string): boolean => {
  return deleteRateLimitEntry(ip)
}

/**
 * إعادة تعيين جميع entries لمدة محددة
 */
export const resetEntriesOlderThan = (minutes: number): number => {
  const cutoffTime = Date.now() - (minutes * 60 * 1000)
  let resetCount = 0
  
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.lastRequest < cutoffTime) {
      rateLimitStore.delete(key)
      resetCount++
    }
  }
  
  return resetCount
}

// ======================================
// Periodic Cleanup
// ======================================

/**
 * تشغيل تنظيف دوري كل فترة محددة
 */
let cleanupInterval: NodeJS.Timeout | null = null

export const startPeriodicCleanup = (intervalMinutes: number = 5): void => {
  if (cleanupInterval) {
    clearInterval(cleanupInterval)
  }
  
  cleanupInterval = setInterval(() => {
    const now = Date.now()
    const cleanedCount = cleanupExpiredEntries(now)
    
    if (cleanedCount > 0) {
      console.log(`Rate Limit Store: تم تنظيف ${cleanedCount} entries منتهية الصلاحية`)
    }
  }, intervalMinutes * 60 * 1000)
}

/**
 * إيقاف التنظيف الدوري
 */
export const stopPeriodicCleanup = (): void => {
  if (cleanupInterval) {
    clearInterval(cleanupInterval)
    cleanupInterval = null
  }
}

// ======================================
// Export Store Instance
// ======================================

export default rateLimitStore 
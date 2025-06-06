/**
 * Data Sanitizers - Depth Studio Backend
 * Functions for cleaning and sanitizing input data
 */

// ======================================
// Text Sanitization
// ======================================

/**
 * تنظيف النصوص العربية والإنجليزية
 */
export const sanitizeText = (text: string): string => {
  return text
    .trim()
    .replace(/\s+/g, ' ') // استبدال المسافات المتعددة بمسافة واحدة
    .replace(/[<>]/g, '') // إزالة علامات HTML الأساسية
}

/**
 * تنظيف النص العربي
 */
export const sanitizeArabicText = (text: string): string => {
  return text
    .trim()
    .replace(/[ىة]/g, 'ه') // توحيد الهاء
    .replace(/[أإآ]/g, 'ا') // توحيد الألف
    .replace(/\s+/g, ' ') // توحيد المسافات
    .replace(/[<>]/g, '') // إزالة HTML
}

/**
 * تنظيف النص الإنجليزي
 */
export const sanitizeEnglishText = (text: string): string => {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ') // توحيد المسافات
    .replace(/[<>]/g, '') // إزالة HTML
}

/**
 * تنظيف الاسم (عربي أو إنجليزي)
 */
export const sanitizeName = (name: string): string => {
  return name
    .trim()
    .replace(/\s+/g, ' ') // توحيد المسافات
    .replace(/[<>]/g, '') // إزالة HTML
    .replace(/^\w/, c => c.toUpperCase()) // كبتل الحرف الأول
}

// ======================================
// Contact Information Sanitization
// ======================================

/**
 * تنظيف البريد الإلكتروني
 */
export const sanitizeEmail = (email: string): string => {
  return email
    .trim()
    .toLowerCase()
    .replace(/\s/g, '') // إزالة المسافات
}

/**
 * تنظيف رقم الهاتف العراقي
 */
export const sanitizeIraqiPhone = (phone: string): string => {
  return phone
    .trim()
    .replace(/\s/g, '') // إزالة المسافات
    .replace(/^0/, '+964') // تحويل 0 إلى +964
    .replace(/^\+9640/, '+964') // إصلاح الخطأ الشائع
}

/**
 * تنظيف URL
 */
export const sanitizeUrl = (url: string): string => {
  const cleanUrl = url.trim().toLowerCase()
  
  // إضافة https إذا لم يكن موجود
  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    return `https://${cleanUrl}`
  }
  
  return cleanUrl
}

// ======================================
// Numerical Data Sanitization
// ======================================

/**
 * تنظيف الأرقام
 */
export const sanitizeNumber = (value: string | number): number => {
  if (typeof value === 'number') return value
  
  const cleanValue = value
    .toString()
    .trim()
    .replace(/[^\d.-]/g, '') // إزالة كل شيء عدا الأرقام والنقطة والسالب
  
  return parseFloat(cleanValue) || 0
}

/**
 * تنظيف النسبة المئوية
 */
export const sanitizePercentage = (value: string | number): number => {
  const num = sanitizeNumber(value)
  return Math.min(Math.max(num, 0), 100) // ضمان القيمة بين 0-100
}

// ======================================
// ID and Array Sanitization
// ======================================

/**
 * تنظيف المعرف
 */
export const sanitizeId = (id: string): string => {
  return id
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, '') // إزالة الأحرف غير المسموحة
}

/**
 * تنظيف مصفوفة المعرفات
 */
export const sanitizeIdArray = (ids: string[]): string[] => {
  return ids
    .filter(id => typeof id === 'string' && id.trim().length > 0)
    .map(id => sanitizeId(id))
    .filter((id, index, arr) => arr.indexOf(id) === index) // إزالة المكرر
}

// ======================================
// HTML and XSS Prevention
// ======================================

/**
 * إزالة HTML tags
 */
export const stripHtmlTags = (html: string): string => {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // إزالة script tags
    .replace(/<[^>]*>/g, '') // إزالة جميع HTML tags
    .trim()
}

/**
 * تعقيم الـ HTML من XSS
 */
export const sanitizeHtml = (html: string): string => {
  return html
    .replace(/javascript:/gi, '') // إزالة javascript:
    .replace(/on\w+\s*=/gi, '') // إزالة event handlers
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // إزالة scripts
    .replace(/<iframe[^>]*>/gi, '') // إزالة iframes
    .replace(/<object[^>]*>/gi, '') // إزالة objects
    .replace(/<embed[^>]*>/gi, '') // إزالة embeds
}

// ======================================
// Special Format Sanitization
// ======================================

/**
 * تنظيف slug (للروابط الودية)
 */
export const sanitizeSlug = (text: string): string => {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // إزالة الأحرف الخاصة
    .replace(/\s+/g, '-') // تحويل المسافات لخطوط
    .replace(/-+/g, '-') // دمج الخطوط المتعددة
    .replace(/^-|-$/g, '') // إزالة الخطوط من البداية والنهاية
}

/**
 * تنظيف البحث
 */
export const sanitizeSearchQuery = (query: string): string => {
  return query
    .trim()
    .replace(/[<>]/g, '') // إزالة HTML
    .replace(/[^\w\s\u0600-\u06FF\u0750-\u077F]/g, '') // السماح بالعربية والإنجليزية فقط
    .replace(/\s+/g, ' ') // توحيد المسافات
    .slice(0, 100) // تحديد الطول
}

/**
 * تنظيف البيانات التعريفية (bio/description)
 */
export const sanitizeBio = (bio: string): string => {
  return bio
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // إزالة scripts
    .replace(/javascript:/gi, '') // إزالة javascript
    .replace(/\s+/g, ' ') // توحيد المسافات
    .slice(0, 500) // تحديد الطول
}

// ======================================
// Batch Sanitization
// ======================================

/**
 * تنظيف كائن البيانات بالكامل
 */
export const sanitizeObjectFields = (obj: Record<string, any>): Record<string, any> => {
  const sanitized: Record<string, any> = {}
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      // تطبيق تنظيف مناسب حسب اسم الحقل
      if (key.includes('email')) {
        sanitized[key] = sanitizeEmail(value)
      } else if (key.includes('phone')) {
        sanitized[key] = sanitizeIraqiPhone(value)
      } else if (key.includes('url') || key.includes('website')) {
        sanitized[key] = sanitizeUrl(value)
      } else if (key.includes('name')) {
        sanitized[key] = sanitizeName(value)
      } else if (key.includes('bio') || key.includes('description')) {
        sanitized[key] = sanitizeBio(value)
      } else {
        sanitized[key] = sanitizeText(value)
      }
    } else if (typeof value === 'number') {
      sanitized[key] = sanitizeNumber(value)
    } else if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'string') {
      sanitized[key] = sanitizeIdArray(value)
    } else {
      sanitized[key] = value
    }
  }
  
  return sanitized
} 
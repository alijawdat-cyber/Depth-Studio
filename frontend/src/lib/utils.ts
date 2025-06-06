import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * دمج classes بطريقة ذكية مع Tailwind
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * تنسيق الأرقام العربية والإنجليزية
 */
export function formatNumber(num: number, locale: string = 'ar'): string {
  return new Intl.NumberFormat(locale).format(num)
}

/**
 * تنسيق التاريخ
 */
export function formatDate(date: Date | string, locale: string = 'ar-IQ'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(dateObj)
}

/**
 * تنسيق الوقت
 */
export function formatTime(date: Date | string, locale: string = 'ar-IQ'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(dateObj)
}

/**
 * تحويل الأحجام إلى readable format
 */
export function formatFileSize(bytes: number): string {
  const sizes = ['بايت', 'كيلوبايت', 'ميجابايت', 'جيجابايت']
  if (bytes === 0) return '0 بايت'
  
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
}

/**
 * تقصير النص مع نقاط
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

/**
 * sleep function للـ delays
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * تحديد إذا كان الجهاز mobile
 */
export function isMobile(): boolean {
  if (typeof window === 'undefined') return false
  return window.innerWidth < 768
}

/**
 * copy نص للحافظة
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    console.error('فشل النسخ:', err)
    return false
  }
}

/**
 * تحديد لون بناءً على النص
 */
export function getColorFromText(text: string): string {
  const colors = [
    'bg-primary-100 text-primary-700',
    'bg-secondary-100 text-secondary-700', 
    'bg-success-100 text-success-700',
    'bg-warning-100 text-warning-700',
    'bg-info-100 text-info-700',
    'bg-depth-100 text-depth-700'
  ]
  
  let hash = 0
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  return colors[Math.abs(hash) % colors.length]
}

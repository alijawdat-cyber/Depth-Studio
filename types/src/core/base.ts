/**
 * 🔤 الأنواع الأساسية - Depth Studio
 * ==================================
 * 
 * 📝 الأنواع الأساسية المستخدمة في جميع أنحاء النظام
 */

import { Timestamp } from 'firebase/firestore';  // استيراد نوع الطابع الزمني من Firebase

// ======================================
// 🌍 الأنواع الأساسية
// ======================================

/** معرف فريد */
export type ID = string;  // نوع المعرف الفريد للكيانات (string)

/** الطوابع الزمنية */
export type FirebaseTimestamp = Timestamp;  // نوع الطابع الزمني من Firebase

/** النصوص متعددة اللغات */
export interface MultiLanguageText {
  ar: string;  // النص بالعربية
  en: string;  // النص بالإنجليزية
}

/** نموذج البيانات الأساسي */
export interface BaseEntity {
  id: ID;                           // المعرف الفريد للكيان
  created_at: FirebaseTimestamp;    // تاريخ ووقت الإنشاء
  updated_at: FirebaseTimestamp;    // تاريخ ووقت آخر تحديث
  created_by?: ID;                  // معرف من قام بإنشاء الكيان (اختياري)
  updated_by?: ID;                  // معرف من قام بآخر تحديث (اختياري)
}

/** نموذج البيانات القابلة للتفعيل */
export interface ActivatableEntity extends BaseEntity {
  is_active: boolean;  // حالة تفعيل الكيان (مفعل أم لا)
}

/** معلومات الاتصال */
export interface ContactInfo {
  email?: string;     // البريد الإلكتروني (اختياري)
  phone?: string;     // رقم الهاتف (اختياري)
  whatsapp?: string;  // رقم الواتساب (اختياري)
  address?: string;   // العنوان (اختياري)
}

/** المبالغ المالية */
export interface CurrencyAmount {
  amount: number;   // المبلغ (رقم)
  currency: string; // العملة (مثل USD, IQD)
}

/** نطاق زمني */
export interface DateRange {
  start_date: FirebaseTimestamp;  // تاريخ البداية
  end_date: FirebaseTimestamp;    // تاريخ النهاية
}

/** نطاق وقتي يومي */
export interface TimeRange {
  start_time: string; // وقت البداية بصيغة HH:mm
  end_time: string;   // وقت النهاية بصيغة HH:mm
} 
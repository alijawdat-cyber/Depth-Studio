/**
 * 📁 أنواع نظام رفع الملفات - Depth Studio
 * ==========================================
 * 
 * 📅 محدث: ديسمبر 2024
 * 👨‍💻 المطور: علي جودت
 * 🎯 الهدف: تحديد أنواع شاملة لنظام رفع الملفات الآمن
 * 
 * 🔗 التوافق:
 * ✅ Backend: FileUploadService.ts (884 سطر)
 * ✅ Firebase: Storage Rules و Configuration
 * ✅ Frontend: Components و Services
 */

import { ID, FirebaseTimestamp } from './core/base';
import { ContentType } from './core/enums';

// ======================================
// 📤 أنواع رفع الملفات الأساسية
// ======================================

/**
 * معلومات الملف المرفوع - من Client
 * يُستخدم عند إرسال الملف من Frontend إلى Backend
 */
export interface FileUploadInfo {
  original_name: string;              // اسم الملف الأصلي
  file_buffer?: Buffer;               // محتوى الملف (Backend)
  file?: File;                        // كائن الملف (Frontend)
  mime_type: string;                  // نوع MIME
  file_size: number;                  // حجم الملف بالبايت
  content_type: ContentType;          // نوع المحتوى
  photographer_id: ID;                // معرف المصور
  brand_id: ID;                       // معرف البراند
  campaign_id?: ID;                   // معرف الحملة (اختياري)
}

/**
 * نتيجة رفع الملف - من Server
 * تُعرد من Backend بعد رفع الملف بنجاح
 */
export interface FileUploadResult {
  file_url: string;                   // رابط الملف العام
  filename: string;                   // اسم الملف النهائي
  file_size: number;                  // حجم الملف
  file_format: string;                // امتداد الملف
  thumbnail_url?: string;             // رابط الصورة المصغرة
  width?: number;                     // عرض الصورة
  height?: number;                    // ارتفاع الصورة
  duration?: number;                  // مدة الفيديو (بالثواني)
  metadata: FileMetadata;             // معلومات تفصيلية
}

/**
 * معلومات تفصيلية للملف
 * تحتوي على بيانات التحليل والمعالجة
 */
export interface FileMetadata {
  upload_timestamp: FirebaseTimestamp; // وقت الرفع
  original_filename: string;           // اسم الملف الأصلي
  file_hash: string;                   // hash للتحقق من التكرار
  storage_path: string;                // مسار التخزين في Firebase
  processing_status: FileProcessingStatus; // حالة المعالجة
  quality_check: FileQualityCheck;     // نتائج فحص الجودة
}

/**
 * حالة معالجة الملف
 */
export type FileProcessingStatus = 
  | 'pending'      // في الانتظار
  | 'processing'   // قيد المعالجة
  | 'completed'    // مُكتمل
  | 'failed';      // فشل

/**
 * نتائج فحص جودة الملف
 */
export interface FileQualityCheck {
  passed: boolean;                     // هل نجح الفحص
  issues: string[];                    // قائمة المشاكل المكتشفة
  score: number;                       // نقاط الجودة (0-10)
}

// ======================================
// 🖼️ أنواع معالجة الصور
// ======================================

/**
 * خيارات معالجة الصور
 */
export interface ImageProcessingOptions {
  generate_thumbnail: boolean;         // إنشاء صورة مصغرة
  thumbnail_size: {                    // حجم الصورة المصغرة
    width: number;
    height: number;
  };
  optimize_quality: boolean;           // تحسين الجودة
  target_quality: number;              // الجودة المستهدفة (1-100)
  max_width: number;                   // أقصى عرض
  max_height: number;                  // أقصى ارتفاع
  watermark: WatermarkOptions;         // خيارات العلامة المائية
}

/**
 * خيارات العلامة المائية
 */
export interface WatermarkOptions {
  enabled: boolean;                    // تفعيل العلامة المائية
  text: string;                        // نص العلامة
  position: WatermarkPosition;         // موضع العلامة
  opacity: number;                     // شفافية العلامة (0-1)
}

/**
 * مواضع العلامة المائية
 */
export type WatermarkPosition = 
  | 'top-left' | 'top-right'
  | 'bottom-left' | 'bottom-right'
  | 'center';

// ======================================
// 🎥 أنواع معالجة الفيديو
// ======================================

/**
 * خيارات معالجة الفيديو
 */
export interface VideoProcessingOptions {
  generate_thumbnail: boolean;         // إنشاء صورة مصغرة
  thumbnail_timestamps: number[];     // الأوقات لاستخراج الصور (بالثواني)
  compress: boolean;                   // ضغط الفيديو
  target_resolution: VideoResolution; // الدقة المستهدفة
  max_duration: number;                // أقصى مدة (بالثواني)
}

/**
 * دقة الفيديو المدعومة
 */
export type VideoResolution = 
  | '480p' | '720p' | '1080p' | '4K';

// ======================================
// 💾 أنواع التخزين
// ======================================

/**
 * خيارات التخزين
 */
export interface StorageOptions {
  bucket_name?: string;                // اسم bucket (افتراضي: default)
  folder_structure: FolderStructure;   // هيكل المجلدات
  enable_cdn: boolean;                 // تفعيل CDN
  backup_enabled: boolean;             // تفعيل النسخ الاحتياطي
  retention_days?: number;             // مدة الاحتفاظ (بالأيام)
}

/**
 * هيكل تنظيم المجلدات
 */
export type FolderStructure = 
  | 'by_date'      // حسب التاريخ
  | 'by_brand'     // حسب البراند
  | 'by_campaign'  // حسب الحملة
  | 'by_type';     // حسب نوع المحتوى

// ======================================
// 🔒 أنواع الأمان والتحقق
// ======================================

/**
 * نتيجة التحقق من أمان الملف
 */
export interface FileSecurityCheck {
  is_safe: boolean;                    // هل الملف آمن
  threats_detected: SecurityThreat[]; // التهديدات المكتشفة
  scan_timestamp: FirebaseTimestamp;  // وقت الفحص
  scanner_version: string;             // إصدار الماسح
}

/**
 * أنواع التهديدات الأمنية
 */
export interface SecurityThreat {
  type: ThreatType;                    // نوع التهديد
  severity: ThreatSeverity;            // مستوى الخطورة
  description: string;                 // وصف التهديد
}

/**
 * أنواع التهديدات
 */
export type ThreatType = 
  | 'virus'        // فيروس
  | 'malware'      // برمجية خبيثة
  | 'suspicious'   // مشبوه
  | 'forbidden';   // محظور

/**
 * مستويات خطورة التهديد
 */
export type ThreatSeverity = 
  | 'low'     // منخفض
  | 'medium'  // متوسط
  | 'high'    // عالي
  | 'critical'; // حرج

// ======================================
// 📊 أنواع التتبع والإحصائيات
// ======================================

/**
 * إحصائيات رفع الملفات
 */
export interface FileUploadStats {
  total_uploads: number;               // إجمالي الرفعات
  successful_uploads: number;          // الرفعات الناجحة
  failed_uploads: number;              // الرفعات الفاشلة
  total_size_uploaded: number;         // إجمالي الحجم المرفوع (بايت)
  average_upload_time: number;         // متوسط وقت الرفع (ثانية)
  most_uploaded_type: ContentType;     // النوع الأكثر رفعاً
  upload_history: FileUploadRecord[];  // سجل الرفعات
}

/**
 * سجل رفع ملف واحد
 */
export interface FileUploadRecord {
  id: ID;                              // معرف السجل
  filename: string;                    // اسم الملف
  file_size: number;                   // حجم الملف
  content_type: ContentType;           // نوع المحتوى
  upload_timestamp: FirebaseTimestamp; // وقت الرفع
  upload_duration: number;             // مدة الرفع (ثانية)
  photographer_id: ID;                 // معرف المصور
  brand_id: ID;                        // معرف البراند
  success: boolean;                    // هل نجح الرفع
  error_message?: string;              // رسالة الخطأ (إن وجدت)
}

// ======================================
// 🎛️ أنواع التحكم والإعدادات
// ======================================

/**
 * إعدادات رفع الملفات للمستخدم
 */
export interface UserUploadPreferences {
  auto_optimize_images: boolean;       // تحسين الصور تلقائياً
  generate_thumbnails: boolean;        // إنشاء صور مصغرة
  preferred_image_quality: number;     // جودة الصور المفضلة (1-100)
  max_file_size: number;               // أقصى حجم ملف (ميجابايت)
  allowed_file_types: string[];        // أنواع الملفات المسموحة
  enable_watermark: boolean;           // تفعيل العلامة المائية
  watermark_text: string;              // نص العلامة المائية
  auto_backup: boolean;                // النسخ الاحتياطي التلقائي
}

/**
 * حدود النظام للرفع
 */
export interface SystemUploadLimits {
  max_file_size_mb: number;            // أقصى حجم ملف (ميجابايت)
  max_files_per_hour: number;          // أقصى عدد ملفات في الساعة
  max_total_size_per_day_gb: number;   // أقصى حجم إجمالي يومي (جيجابايت)
  allowed_mime_types: string[];        // أنواع MIME المسموحة
  prohibited_extensions: string[];     // الامتدادات المحظورة
  scan_timeout_seconds: number;        // مهلة فحص الأمان (ثانية)
}

// ======================================
// 🔄 أنواع مزامنة الملفات
// ======================================

/**
 * حالة مزامنة الملف
 */
export interface FileSyncStatus {
  file_id: ID;                         // معرف الملف
  local_path?: string;                 // المسار المحلي
  remote_url: string;                  // الرابط البعيد
  last_sync: FirebaseTimestamp;        // آخر مزامنة
  sync_status: SyncStatus;             // حالة المزامنة
  conflict_detected: boolean;          // تضارب مكتشف
  conflict_resolution?: ConflictResolution; // حل التضارب
}

/**
 * حالة المزامنة
 */
export type SyncStatus = 
  | 'synced'      // متزامن
  | 'pending'     // في الانتظار
  | 'syncing'     // قيد المزامنة
  | 'conflict'    // تضارب
  | 'error';      // خطأ

/**
 * طرق حل التضارب
 */
export type ConflictResolution = 
  | 'keep_local'   // الاحتفاظ بالمحلي
  | 'keep_remote'  // الاحتفاظ بالبعيد
  | 'merge'        // دمج
  | 'manual';      // يدوي 
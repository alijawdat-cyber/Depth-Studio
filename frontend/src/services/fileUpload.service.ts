/**
 * 📤 خدمة رفع الملفات - Depth Studio Frontend
 * ============================================
 * 
 * 📅 محدث: ديسمبر 2024
 * 👨‍💻 المطور: علي جودت
 * 🎯 الهدف: خدمة شاملة لرفع الملفات مع تكامل Backend وFirebase
 * 
 * 🔗 التوافق:
 * ✅ Backend: FileUploadService.ts (884 سطر) - جميع API endpoints
 * ✅ Backend: ContentController.uploadContent - تكامل رفع المحتوى
 * ✅ Firebase: Storage Rules للحماية الشاملة
 * ✅ Types: files.ts (347 سطر) - جميع الأنواع المطلوبة
 * ✅ Frontend: api-client.ts للـ HTTP requests
 * 
 * 📋 شرح الاستيرادات المستخدمة بالتفصيل:
 * 
 * 🔹 FileUploadInfo: معلومات الملف المُراد رفعه
 *   - الفائدة: تجمع كل بيانات الملف (اسم، حجم، نوع، مراجع) في مكان واحد
 *   - الاستخدام: عند بدء عملية الرفع من الفرونت إند للباك إند
 *   - الحقول: original_name, file, mime_type, file_size, content_type, photographer_id, brand_id, campaign_id
 * 
 * 🔹 FileUploadResult: نتيجة رفع الملف من الخادم
 *   - الفائدة: تحتوي على معلومات الملف المرفوع بنجاح والروابط للوصول إليه
 *   - الاستخدام: لعرض نتائج الرفع وحفظ معلومات الملف في قاعدة البيانات
 *   - الحقول: file_url, filename, file_size, file_format, thumbnail_url, width, height, duration, metadata
 * 
 * 🔹 FileMetadata: معلومات تفصيلية عن الملف
 *   - الفائدة: معلومات تقنية للتتبع والأمان والجودة
 *   - الاستخدام: لمراقبة حالة الملف وفحص الجودة وحل المشاكل
 *   - الحقول: upload_timestamp, original_filename, file_hash, storage_path, processing_status, quality_check
 * 
 * 🔹 ImageProcessingOptions: خيارات معالجة الصور
 *   - الفائدة: تحكم كامل في كيفية معالجة الصور (تحسين، تصغير، علامة مائية)
 *   - الاستخدام: لتخصيص جودة وأبعاد الصور حسب الاحتياج
 *   - الحقول: generate_thumbnail, thumbnail_size, optimize_quality, target_quality, max_width, max_height, watermark
 * 
 * 🔹 VideoProcessingOptions: خيارات معالجة الفيديو
 *   - الفائدة: تحكم في معالجة الفيديوهات (ضغط، استخراج صور مصغرة، دقة)
 *   - الاستخدام: لتحسين أداء الفيديوهات وتوفير معاينات سريعة
 *   - الحقول: generate_thumbnail, thumbnail_timestamps, compress, target_resolution, max_duration
 * 
 * 🔹 FileUploadStats: إحصائيات رفع الملفات
 *   - الفائدة: تتبع أداء النظام وسلوك المستخدمين في رفع الملفات
 *   - الاستخدام: لتحليل الاستخدام وتحديد المشاكل وتحسين النظام
 *   - الحقول: total_uploads, successful_uploads, failed_uploads, total_size_uploaded, average_upload_time, most_uploaded_type, upload_history
 * 
 * 🔹 UserUploadPreferences: إعدادات المستخدم الشخصية
 *   - الفائدة: تخصيص تجربة الرفع حسب تفضيلات كل مستخدم
 *   - الاستخدام: لحفظ إعدادات الجودة والأنواع المفضلة والعلامات المائية
 *   - الحقول: auto_optimize_images, generate_thumbnails, preferred_image_quality, max_file_size, allowed_file_types, enable_watermark, watermark_text, auto_backup
 * 
 * 🔹 SystemUploadLimits: حدود النظام العامة
 *   - الفائدة: حماية الخادم من التحميل الزائد والملفات الضارة
 *   - الاستخدام: للتحقق من صحة الملفات قبل الرفع ومنع تجاوز الحدود
 *   - الحقول: max_file_size_mb, max_files_per_hour, max_total_size_per_day_gb, allowed_mime_types, prohibited_extensions, scan_timeout_seconds
 * 
 * 🔹 ContentType: تصنيف نوع المحتوى
 *   - الفائدة: تصنيف الملفات لتطبيق قواعد وخيارات معالجة مختلفة
 *   - الاستخدام: لتحديد طريقة المعالجة والعرض المناسبة
 *   - القيم: 'image' | 'video' | 'graphic_design'
 * 
 * 🔹 ID: معرف فريد للكيانات
 *   - الفائدة: ربط الملفات بالمستخدمين والحملات والبراندات
 *   - الاستخدام: لتتبع ملكية الملفات وصلاحيات الوصول
 *   - النوع: string (معرف فريد في Firebase)
 * 
 * 🔹 ValidationResult: نتيجة التحقق من صحة البيانات
 *   - الفائدة: إرجاع تفاصيل دقيقة عن مشاكل الملف مع اقتراحات للحل
 *   - الاستخدام: لعرض رسائل خطأ مفهومة للمستخدم وتوجيهه لحل المشاكل
 *   - الحقول: isValid, errors[], warnings[]
 * 
 * 🔹 ValidationError: تفاصيل الأخطاء
 *   - الفائدة: معلومات دقيقة عن كل خطأ (الحقل، الرسالة، الكود، القيمة)
 *   - الاستخدام: لعرض رسائل خطأ محددة وقابلة للترجمة
 *   - الحقول: field, message, code, value?
 * 
 * 🔹 ValidationWarning: تحذيرات قابلة للتجاهل
 *   - الفائدة: إرشاد المستخدم لتحسين جودة الملفات دون منع الرفع
 *   - الاستخدام: لاقتراح تحسينات على الملفات (أبعاد أفضل، جودة أعلى)
 *   - الحقول: field, message, suggestion?
 */

import { 
  FileUploadInfo, 
  FileUploadResult, 
  FileMetadata,
  ImageProcessingOptions,
  VideoProcessingOptions,
  FileUploadStats,
  UserUploadPreferences,
  SystemUploadLimits,
  ContentType,
  ID,
  ValidationResult,
  ValidationError,
  ValidationWarning
} from '@depth-studio/types';
import { apiClient } from './api/api-client';

// ======================================
// 📋 واجهات إضافية للفرونت إند
// ======================================

/**
 * حالة رفع الملف في الفرونت إند
 * تُستخدم لتتبع تقدم الرفع وحالة الملف
 */
export interface FileUploadProgress {
  file_id: string;                     // معرف الملف المحلي
  filename: string;                    // اسم الملف
  progress: number;                    // نسبة التقدم (0-100)
  status: 'preparing' | 'uploading' | 'processing' | 'completed' | 'failed'; // حالة الرفع
  error_message?: string;              // رسالة الخطأ إن وجدت
  upload_start_time: number;           // وقت بدء الرفع (timestamp)
  upload_speed?: number;               // سرعة الرفع (bytes/sec)
  estimated_time_remaining?: number;   // الوقت المقدر للانتهاء (seconds)
}

/**
 * خيارات رفع الملف من الفرونت إند
 */
export interface UploadOptions {
  auto_start?: boolean;                // بدء الرفع تلقائياً
  chunk_size?: number;                 // حجم القطعة (للملفات الكبيرة)
  retry_attempts?: number;             // عدد محاولات إعادة الرفع
  validate_before_upload?: boolean;    // التحقق قبل الرفع
  image_options?: ImageProcessingOptions; // خيارات معالجة الصور
  video_options?: VideoProcessingOptions; // خيارات معالجة الفيديو
  onProgress?: ((progress: FileUploadProgress) => void) | undefined; // callback للتقدم - يستقبل معلومات التقدم الحالية
  onComplete?: ((result: FileUploadResult) => void) | undefined;     // callback للانتهاء - يستقبل نتيجة الرفع النهائية  
  onError?: ((error: string) => void) | undefined;   // callback للخطأ - يستقبل رسالة الخطأ للعرض
}

/**
 * معلومات ملف محلي قبل الرفع
 */
export interface LocalFileInfo {
  id: string;                          // معرف محلي فريد
  file: File;                          // كائن الملف
  preview_url?: string;                // رابط المعاينة المحلية
  thumbnail_url?: string;              // رابط الصورة المصغرة المحلية
  validation_result?: ValidationResult; // نتيجة التحقق المحلي
}

// ======================================
// 🏗️ كلاس خدمة رفع الملفات
// ======================================

/**
 * 📤 خدمة رفع الملفات - Frontend Service
 * تتضمن جميع وظائف رفع وإدارة الملفات مع تكامل شامل
 */
export class FileUploadService {
  private uploadQueue: Map<string, FileUploadProgress> = new Map(); // طابور الرفع
  private activeUploads: Set<string> = new Set();                  // الرفعات النشطة
  private userPreferences: UserUploadPreferences | null = null;    // إعدادات المستخدم
  private systemLimits: SystemUploadLimits | null = null;          // حدود النظام

  // ======================================
  // 🚀 وظائف الرفع الأساسية
  // ======================================

  /**
   * رفع ملف واحد مع خيارات متقدمة
   * 🎯 الوظائف المشمولة:
   * ✅ التحقق من الملف محلياً
   * ✅ رفع الملف إلى الخادم
   * ✅ تتبع التقدم
   * ✅ معالجة الأخطاء
   * ✅ إرجاع النتيجة النهائية
   */
  async uploadSingleFile(
    fileInfo: FileUploadInfo, 
    options: UploadOptions = {}
  ): Promise<FileUploadResult> {
    try {
      const fileId = this.generateFileId();
      
      // إنشاء سجل التقدم
      const progress: FileUploadProgress = {
        file_id: fileId,
        filename: fileInfo.original_name,
        progress: 0,
        status: 'preparing',
        upload_start_time: Date.now()
      };
      
      this.uploadQueue.set(fileId, progress);
      this.activeUploads.add(fileId);

      // التحقق من الملف محلياً
      if (options.validate_before_upload !== false) {
        this.updateProgress(fileId, 10, 'preparing');
        const validation = await this.validateFile(fileInfo);
        if (!validation.isValid) {
          throw new Error(`فشل التحقق من الملف: ${validation.errors.join(', ')}`);
        }
      }

      // تحضير البيانات للرفع
      this.updateProgress(fileId, 20, 'uploading');
      
      // إنشاء FormData للرفع
      const formData = this.createFormData(fileInfo, options);
      
      // رفع الملف إلى الخادم
      const result = await this.performUpload(formData, fileId, options);
      
      // تحديث حالة الانتهاء
      this.updateProgress(fileId, 100, 'completed');
      
      // استدعاء callback الانتهاء
      if (options.onComplete) {
        options.onComplete(result);
      }

      // تنظيف السجلات
      this.cleanupUpload(fileId);
      
      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'خطأ غير معروف في رفع الملف';
      
      if (options.onError) {
        options.onError(errorMessage);
      }
      
      throw new Error(errorMessage);
    }
  }

  /**
   * رفع ملفات متعددة بشكل متوازي
   * يدعم رفع حتى 5 ملفات في نفس الوقت
   */
  async uploadMultipleFiles(
    files: FileUploadInfo[], 
    options: UploadOptions = {}
  ): Promise<FileUploadResult[]> {
    try {
      // التحقق من الحد الأقصى للملفات
      const maxConcurrent = 5;
      const results: FileUploadResult[] = [];
      
      // تقسيم الملفات إلى مجموعات
      for (let i = 0; i < files.length; i += maxConcurrent) {
        const batch = files.slice(i, i + maxConcurrent);
        
        // رفع المجموعة الحالية بشكل متوازي
        const batchPromises = batch.map(fileInfo => 
          this.uploadSingleFile(fileInfo, options)
        );
        
        const batchResults = await Promise.allSettled(batchPromises);
        
        // معالجة النتائج
        batchResults.forEach(result => {
          if (result.status === 'fulfilled') {
            results.push(result.value);
          } else {
            console.error('فشل رفع ملف:', result.reason);
          }
        });
      }
      
      return results;

    } catch (error) {
      throw new Error(`خطأ في رفع الملفات المتعددة: ${error}`);
    }
  }

  /**
   * رفع صورة الملف الشخصي
   * وظيفة مخصصة لصور البروفايل مع معالجة خاصة
   */
  async uploadProfilePhoto(
    file: File, 
    userId: ID,
    options: UploadOptions = {}
  ): Promise<FileUploadResult> {
    try {
      // إعداد خاص لصور الملف الشخصي
      const fileInfo: FileUploadInfo = {
        original_name: file.name,
        file: file,
        mime_type: file.type,
        file_size: file.size,
        content_type: 'image' as ContentType,
        photographer_id: userId,
        brand_id: userId, // نفس المستخدم
      };

      // خيارات معالجة مُحسنة للبروفايل
      const profileOptions: UploadOptions = {
        ...options,
        image_options: {
          generate_thumbnail: true,
          thumbnail_size: { width: 150, height: 150 },
          optimize_quality: true,
          target_quality: 90,
          max_width: 1024,
          max_height: 1024,
          watermark: {
            enabled: false,
            text: '',
            position: 'center',
            opacity: 0
          }
        }
      };

      return await this.uploadSingleFile(fileInfo, profileOptions);

    } catch (error) {
      throw new Error(`خطأ في رفع صورة الملف الشخصي: ${error}`);
    }
  }

  // ======================================
  // 🔍 وظائف التحقق والتحليل
  // ======================================

  /**
   * التحقق من صحة الملف محلياً
   * فحص النوع والحجم والامتداد قبل الرفع
   */
  async validateFile(fileInfo: FileUploadInfo): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    try {
      // التحقق من وجود الملف
      if (!fileInfo.file && !fileInfo.file_buffer) {
        errors.push({
          field: 'file',
          message: 'الملف مفقود',
          code: 'FILE_MISSING'
        });
        return { isValid: false, errors, warnings };
      }

      // التحقق من اسم الملف
      if (!fileInfo.original_name || fileInfo.original_name.trim() === '') {
        errors.push({
          field: 'original_name',
          message: 'اسم الملف مطلوب',
          code: 'FILENAME_REQUIRED'
        });
      }

      // التحقق من نوع MIME
      if (!fileInfo.mime_type) {
        errors.push({
          field: 'mime_type',
          message: 'نوع الملف غير محدد',
          code: 'MIME_TYPE_REQUIRED'
        });
      }

      // التحقق من الحجم
      if (fileInfo.file_size <= 0) {
        errors.push({
          field: 'file_size',
          message: 'حجم الملف غير صحيح',
          code: 'INVALID_FILE_SIZE'
        });
      }

      // جلب حدود النظام للتحقق
      const limits = await this.getSystemLimits();
      
      // التحقق من الحد الأقصى للحجم
      if (fileInfo.file_size > limits.max_file_size_mb * 1024 * 1024) {
        errors.push({
          field: 'file_size',
          message: `حجم الملف يتجاوز الحد المسموح (${limits.max_file_size_mb} ميجابايت)`,
          code: 'FILE_TOO_LARGE',
          value: fileInfo.file_size
        });
      }

      // التحقق من نوع MIME المسموح
      if (!limits.allowed_mime_types.includes(fileInfo.mime_type)) {
        errors.push({
          field: 'mime_type',
          message: `نوع الملف ${fileInfo.mime_type} غير مدعوم`,
          code: 'UNSUPPORTED_MIME_TYPE',
          value: fileInfo.mime_type
        });
      }

      // التحقق من الامتداد المحظور
      const extension = this.getFileExtension(fileInfo.original_name);
      if (limits.prohibited_extensions.includes(extension.toLowerCase())) {
        errors.push({
          field: 'original_name',
          message: `امتداد الملف .${extension} محظور`,
          code: 'PROHIBITED_EXTENSION',
          value: extension
        });
      }

      // فحص إضافي للصور
      if (fileInfo.content_type === 'image' && fileInfo.file) {
        const imageValidation = await this.validateImageFile(fileInfo.file);
        errors.push(...imageValidation.errors);
        warnings.push(...imageValidation.warnings);
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings
      };

    } catch (error) {
      errors.push({
        field: 'general',
        message: `خطأ في التحقق من الملف: ${error}`,
        code: 'VALIDATION_ERROR'
      });
      return { isValid: false, errors, warnings };
    }
  }

  /**
   * فحص خاص للصور
   * التحقق من الأبعاد والجودة
   */
  private async validateImageFile(file: File): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    return new Promise((resolve) => {
      const img = new Image();
      
      img.onload = () => {
        // التحقق من الأبعاد الدنيا
        if (img.width < 100 || img.height < 100) {
          warnings.push({
            field: 'image_dimensions',
            message: 'أبعاد الصورة صغيرة جداً (الحد الأدنى 100x100)',
            suggestion: 'استخدم صورة بأبعاد أكبر لجودة أفضل'
          });
        }

        // التحقق من نسبة العرض إلى الارتفاع المعقولة
        const aspectRatio = img.width / img.height;
        if (aspectRatio > 10 || aspectRatio < 0.1) {
          warnings.push({
            field: 'aspect_ratio',
            message: 'نسبة أبعاد الصورة غير طبيعية',
            suggestion: 'تأكد من أن الصورة ليست مقطوعة أو مشوهة'
          });
        }

        // التحقق من الحجم الكبير جداً
        if (img.width > 8000 || img.height > 8000) {
          warnings.push({
            field: 'image_size',
            message: 'أبعاد الصورة كبيرة جداً (قد تؤثر على الأداء)',
            suggestion: 'قم بتصغير الصورة لتحسين الأداء'
          });
        }

        resolve({
          isValid: errors.length === 0,
          errors,
          warnings
        });
      };

      img.onerror = () => {
        errors.push({
          field: 'image_data',
          message: 'فشل في قراءة بيانات الصورة',
          code: 'IMAGE_READ_ERROR'
        });
        resolve({
          isValid: false,
          errors,
          warnings
        });
      };

      img.src = URL.createObjectURL(file);
    });
  }

  // ======================================
  // 🔧 وظائف مساعدة أساسية
  // ======================================

  /**
   * إنشاء FormData للرفع
   * تحضير البيانات بالصيغة المطلوبة للخادم
   */
  private createFormData(fileInfo: FileUploadInfo, options: UploadOptions): FormData {
    const formData = new FormData();
    
    // إضافة الملف
    if (fileInfo.file) {
      formData.append('file', fileInfo.file);
    }
    
    // إضافة معلومات الملف
    formData.append('original_name', fileInfo.original_name);
    formData.append('mime_type', fileInfo.mime_type);
    formData.append('file_size', fileInfo.file_size.toString());
    formData.append('content_type', fileInfo.content_type);
    formData.append('photographer_id', fileInfo.photographer_id);
    formData.append('brand_id', fileInfo.brand_id);
    
    if (fileInfo.campaign_id) {
      formData.append('campaign_id', fileInfo.campaign_id);
    }
    
    // إضافة خيارات المعالجة
    if (options.image_options) {
      formData.append('image_options', JSON.stringify(options.image_options));
    }
    
    if (options.video_options) {
      formData.append('video_options', JSON.stringify(options.video_options));
    }
    
    return formData;
  }

  /**
   * تنفيذ الرفع الفعلي
   * إرسال الطلب إلى الخادم مع تتبع التقدم
   */
  private async performUpload(
    formData: FormData, 
    fileId: string, 
    options: UploadOptions
  ): Promise<FileUploadResult> {
    try {
      // إعداد الطلب مع تتبع التقدم
      const config = {
        onUploadProgress: (progressEvent: { loaded: number; total?: number }) => {
          if (progressEvent.total && progressEvent.total > 0) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            this.updateProgress(fileId, progress, 'uploading');
            
            if (options.onProgress) {
              const progressInfo = this.uploadQueue.get(fileId);
              if (progressInfo) {
                options.onProgress(progressInfo);
              }
            }
          }
        },
        timeout: 5 * 60 * 1000, // 5 دقائق
      };

      // إرسال الطلب
      const response = await apiClient.post<FileUploadResult>(
        '/api/content/upload',
        formData,
        config
      );

      this.updateProgress(fileId, 95, 'processing');
      
      return response.data!;

    } catch (error) {
      throw new Error(`فشل في رفع الملف: ${error}`);
    }
  }

  /**
   * تحديث حالة التقدم
   * تحديث سجل التقدم وحساب الإحصائيات
   */
  private updateProgress(
    fileId: string, 
    progress: number, 
    status: FileUploadProgress['status']
  ): void {
    const progressInfo = this.uploadQueue.get(fileId);
    if (!progressInfo) return;

    progressInfo.progress = progress;
    progressInfo.status = status;

    // حساب سرعة الرفع
    if (status === 'uploading' && progress > 0) {
      const elapsed = (Date.now() - progressInfo.upload_start_time) / 1000;
      if (elapsed > 0) {
        progressInfo.upload_speed = (progress / 100) / elapsed;
        
        // تقدير الوقت المتبقي
        if (progress < 100) {
          const remaining = 100 - progress;
          progressInfo.estimated_time_remaining = remaining / (progress / elapsed);
        }
      }
    }

    this.uploadQueue.set(fileId, progressInfo);
  }

  /**
   * تنظيف سجلات الرفع
   * إزالة الملف من الطابور والرفعات النشطة
   */
  private cleanupUpload(fileId: string): void {
    this.uploadQueue.delete(fileId);
    this.activeUploads.delete(fileId);
  }

  /**
   * توليد معرف فريد للملف
   */
  private generateFileId(): string {
    return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * استخراج امتداد الملف
   */
  private getFileExtension(filename: string): string {
    return filename.split('.').pop() || '';
  }

  // ======================================
  // ⚙️ إدارة الإعدادات والحدود
  // ======================================

  /**
   * جلب إعدادات المستخدم
   * استرجاع التفضيلات المحفوظة
   */
  async getUserPreferences(userId: ID): Promise<UserUploadPreferences> {
    try {
      if (this.userPreferences) {
        return this.userPreferences;
      }

      const response = await apiClient.get<UserUploadPreferences>(
        `/api/users/${userId}/upload-preferences`
      );

      this.userPreferences = response.data!;
      return this.userPreferences;

    } catch {
      // إرجاع إعدادات افتراضية في حالة الخطأ
      const defaultPreferences: UserUploadPreferences = {
        auto_optimize_images: true,
        generate_thumbnails: true,
        preferred_image_quality: 85,
        max_file_size: 50, // 50 MB
        allowed_file_types: ['jpg', 'jpeg', 'png', 'webp', 'mp4', 'mov'],
        enable_watermark: false,
        watermark_text: 'Depth Studio',
        auto_backup: true
      };

      this.userPreferences = defaultPreferences;
      return defaultPreferences;
    }
  }

  /**
   * تحديث إعدادات المستخدم
   * حفظ التفضيلات الجديدة
   */
  async updateUserPreferences(
    userId: ID, 
    preferences: Partial<UserUploadPreferences>
  ): Promise<UserUploadPreferences> {
    try {
      const response = await apiClient.put<UserUploadPreferences>(
        `/api/users/${userId}/upload-preferences`,
        preferences
      );

      this.userPreferences = response.data!;
      return this.userPreferences;

    } catch (error) {
      throw new Error(`فشل في تحديث إعدادات الرفع: ${error}`);
    }
  }

  /**
   * جلب حدود النظام
   * استرجاع القيود والحدود المعمول بها
   */
  async getSystemLimits(): Promise<SystemUploadLimits> {
    try {
      if (this.systemLimits) {
        return this.systemLimits;
      }

      const response = await apiClient.get<SystemUploadLimits>('/api/system/upload-limits');
      this.systemLimits = response.data!;
      return this.systemLimits;

    } catch {
      // إرجاع حدود افتراضية في حالة الخطأ
      const defaultLimits: SystemUploadLimits = {
        max_file_size_mb: 100,
        max_files_per_hour: 50,
        max_total_size_per_day_gb: 5,
        allowed_mime_types: [
          'image/jpeg', 'image/png', 'image/webp', 'image/gif',
          'video/mp4', 'video/mov', 'video/avi', 'video/webm',
          'application/pdf'
        ],
        prohibited_extensions: ['exe', 'bat', 'cmd', 'scr', 'zip', 'rar'],
        scan_timeout_seconds: 30
      };

      this.systemLimits = defaultLimits;
      return defaultLimits;
    }
  }

  // ======================================
  // 📊 إحصائيات وتقارير
  // ======================================

  /**
   * جلب إحصائيات رفع الملفات
   * تقرير شامل عن أداء الرفع
   */
  async getUploadStats(userId: ID, timeRange?: string): Promise<FileUploadStats> {
    try {
      const params = timeRange ? { time_range: timeRange } : {};
      
      const response = await apiClient.get<FileUploadStats>(
        `/api/users/${userId}/upload-stats`,
        { params }
      );

      return response.data!;

    } catch (error) {
      throw new Error(`فشل في جلب إحصائيات الرفع: ${error}`);
    }
  }

  /**
   * جلب الملفات المرفوعة مؤخراً
   * قائمة بآخر الملفات المرفوعة
   */
  async getRecentUploads(userId: ID, limit: number = 10): Promise<FileUploadResult[]> {
    try {
      const response = await apiClient.get<FileUploadResult[]>(
        `/api/users/${userId}/recent-uploads`,
        { params: { limit } }
      );

      return response.data!;

    } catch (error) {
      throw new Error(`فشل في جلب الملفات المرفوعة مؤخراً: ${error}`);
    }
  }

  // ======================================
  // 🗑️ إدارة الملفات
  // ======================================

  /**
   * حذف ملف مرفوع
   * إزالة الملف من النظام نهائياً
   */
  async deleteUploadedFile(fileUrl: string): Promise<void> {
    try {
      await apiClient.delete('/api/files/delete', {
        data: { file_url: fileUrl }
      });

    } catch (error) {
      throw new Error(`فشل في حذف الملف: ${error}`);
    }
  }

  /**
   * إنشاء معاينة محلية للملف
   * توليد URL مؤقت للعرض قبل الرفع
   */
  createLocalPreview(file: File): string {
    return URL.createObjectURL(file);
  }

  /**
   * تنظيف معاينة محلية
   * إلغاء URL المؤقت لتحرير الذاكرة
   */
  revokeLocalPreview(previewUrl: string): void {
    URL.revokeObjectURL(previewUrl);
  }

  /**
   * جلب معلومات تفصيلية عن ملف
   * البحث في قاعدة البيانات باستخدام الرابط
   */
  async getFileMetadata(fileUrl: string): Promise<FileMetadata | null> {
    try {
      const response = await apiClient.get<FileMetadata>(
        '/api/files/metadata',
        { params: { file_url: fileUrl } }
      );

      return response.data!;

    } catch (error) {
      console.error('فشل في جلب معلومات الملف:', error);
      return null;
    }
  }

  // ======================================
  // 🧼 تنظيف الموارد
  // ======================================

  /**
   * إيقاف جميع الرفعات النشطة
   * تنظيف شامل عند إغلاق التطبيق
   */
  stopAllUploads(): void {
    this.activeUploads.clear();
    this.uploadQueue.clear();
    this.userPreferences = null;
    this.systemLimits = null;
  }

  /**
   * جلب حالة الرفعات النشطة
   * قائمة بجميع الملفات قيد الرفع
   */
  getActiveUploads(): FileUploadProgress[] {
    return Array.from(this.uploadQueue.values());
  }

  /**
   * التحقق من وجود رفعات نشطة
   */
  hasActiveUploads(): boolean {
    return this.activeUploads.size > 0;
  }
}

// ======================================
// 📤 تصدير instance مفرد للاستخدام
// ======================================

/**
 * Instance مشترك من خدمة رفع الملفات
 * يُستخدم عبر التطبيق لضمان التناسق
 */
export const fileUploadService = new FileUploadService();

// ======================================
// 🛠️ دوال مساعدة عامة
// ======================================

/**
 * تحويل حجم الملف إلى نص قابل للقراءة
 * مثال: 1024 -> "1 كيلوبايت"
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 بايت';
  
  const k = 1024;
  const sizes = ['بايت', 'كيلوبايت', 'ميجابايت', 'جيجابايت'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * استخراج نوع المحتوى من MIME type
 * تحديد ContentType من نوع الملف
 */
export function getContentTypeFromMime(mimeType: string): ContentType {
  if (mimeType.startsWith('image/')) {
    return 'image';
  } else if (mimeType.startsWith('video/')) {
    return 'video';
  } else {
    return 'graphic_design';
  }
}

/**
 * التحقق من دعم الملف في المتصفح
 * فحص إمكانية معالجة نوع الملف محلياً
 */
export function isSupportedFileType(mimeType: string): boolean {
  const supportedTypes = [
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'video/mp4', 'video/webm', 'video/ogg',
    'application/pdf'
  ];
  
  return supportedTypes.includes(mimeType);
}

/**
 * حساب hash للملف (للتحقق من التكرار)
 * استخدام الـ browser crypto API
 */
export async function calculateFileHash(file: File): Promise<string> {
  try {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  } catch (error) {
    console.error('فشل في حساب hash الملف:', error);
    return `fallback_${Date.now()}_${file.size}`;
  }
} 
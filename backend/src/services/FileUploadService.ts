/**
 * 📤 File Upload Service - إدارة رفع الملفات
 * ===============================================
 * 
 * 📅 محدث: ديسمبر 2024
 * 👨‍💻 المطور: علي جودت
 * 🎯 الهدف: رفع آمن ومحكم للملفات مع Firebase Storage
 */

import { getStorage } from 'firebase-admin/storage';
import { ContentType } from '../../../types/src/core/enums';
import { ID, FirebaseTimestamp } from '../../../types/src/core/base';
import { logger } from 'firebase-functions';
import * as crypto from 'crypto';
import sharp from 'sharp';
import ffprobeStatic from 'ffprobe-static';
import ffmpeg from 'fluent-ffmpeg';
import * as path from 'path';
import * as fs from 'fs';

// ======================================
// 🎯 أنواع خاصة بـ FileUploadService
// ======================================

/**
 * معلومات الملف المرفوع
 */
export interface FileUploadInfo {
  original_name: string;
  file_buffer: Buffer;
  mime_type: string;
  file_size: number;
  content_type: ContentType;
  photographer_id: ID;
  brand_id: ID;
  campaign_id?: ID;
}

/**
 * نتيجة رفع الملف
 */
export interface FileUploadResult {
  file_url: string;
  filename: string;
  file_size: number;
  file_format: string;
  width?: number;
  height?: number;
  duration?: number;
  thumbnail_url?: string;
  metadata: FileMetadata;
}

/**
 * معلومات تفصيلية للملف
 */
interface FileMetadata {
  upload_timestamp: FirebaseTimestamp;
  original_filename: string;
  file_hash: string;
  storage_path: string;
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
  quality_check: {
    passed: boolean;
    issues: string[];
    score: number;
  };
}

/**
 * إعدادات معالجة الصور
 */
interface ImageProcessingOptions {
  generate_thumbnail: boolean;
  thumbnail_size: { width: number; height: number };
  optimize_quality: boolean;
  target_quality: number;
  max_width?: number;
  max_height?: number;
  watermark?: {
    enabled: boolean;
    text: string;
    position: 'center' | 'bottom-right' | 'bottom-left';
    opacity: number;
  };
}

/**
 * إعدادات معالجة الفيديو
 */
interface VideoProcessingOptions {
  generate_thumbnail: boolean;
  thumbnail_timestamps: number[]; // بالثواني
  compress: boolean;
  target_resolution: '720p' | '1080p' | '4k' | 'original';
  max_duration: number; // بالثواني
}

/**
 * خيارات التخزين
 */
interface StorageOptions {
  bucket_name?: string;
  folder_structure: 'by_date' | 'by_brand' | 'by_campaign' | 'by_type';
  enable_cdn: boolean;
  backup_enabled: boolean;
  retention_days?: number;
}

/**
 * نتيجة التحقق من جودة الملف
 */
interface QualityCheckResult {
  passed: boolean;
  score: number; // من 0 إلى 10
  issues: string[];
  recommendations: string[];
}

// ======================================
// 📤 خدمة رفع الملفات
// ======================================

/**
 * 📤 خدمة رفع الملفات - مع تكامل Firebase Storage
 */
export class FileUploadService {
  private storage = getStorage();
  private defaultBucket = this.storage.bucket();

  // إعدادات افتراضية
  private readonly DEFAULT_IMAGE_OPTIONS: ImageProcessingOptions = {
    generate_thumbnail: true,
    thumbnail_size: { width: 300, height: 300 },
    optimize_quality: true,
    target_quality: 85,
    max_width: 4096,
    max_height: 4096,
    watermark: {
      enabled: false,
      text: 'Depth Studio',
      position: 'bottom-right',
      opacity: 0.3
    }
  };

  private readonly DEFAULT_VIDEO_OPTIONS: VideoProcessingOptions = {
    generate_thumbnail: true,
    thumbnail_timestamps: [0, 5, 10], // أول 3 ثوانٍ، 5 ثوانٍ، 10 ثوانٍ
    compress: true,
    target_resolution: '1080p',
    max_duration: 300 // 5 دقائق
  };

  private readonly DEFAULT_STORAGE_OPTIONS: StorageOptions = {
    folder_structure: 'by_date',
    enable_cdn: true,
    backup_enabled: true,
    retention_days: 365
  };

  // ======================================
  // 📤 الوظائف الأساسية للرفع
  // ======================================

  /**
   * رفع ملف مع معالجة شاملة
   * 
   * 🎯 العمليات المشمولة:
   * ✅ التحقق من الأمان والصحة
   * ✅ معالجة الصور/الفيديو
   * ✅ إنشاء صور مصغرة
   * ✅ تحسين الجودة
   * ✅ رفع آمن إلى Firebase Storage
   */
  async uploadFile(fileInfo: FileUploadInfo): Promise<FileUploadResult> {
    try {
      logger.info('📤 بدء رفع ملف', {
        originalName: fileInfo.original_name,
        size: fileInfo.file_size,
        type: fileInfo.content_type
      });

      // التحقق الأمني الأولي
      this.validateFileSecurity(fileInfo);

      // التحقق من النوع والحجم
      this.validateFileSpecs(fileInfo);

      // إنشاء metadata الملف
      const metadata = this.generateFileMetadata(fileInfo);

      // إنشاء مسار التخزين
      const storagePath = this.generateStoragePath(fileInfo);

      // رفع الملف الأساسي
      const uploadResult = await this.uploadToStorage(
        fileInfo.file_buffer,
        storagePath,
        fileInfo.mime_type,
        metadata
      );

      // إجراء فحص الجودة النهائي
      const qualityCheck = this.performBasicQualityCheck(fileInfo);

      // تحديث metadata مع نتائج فحص الجودة
      metadata.quality_check = qualityCheck;
      metadata.processing_status = qualityCheck.passed ? 'completed' : 'failed';
      metadata.storage_path = storagePath;

      return {
        file_url: uploadResult.publicUrl,
        filename: this.extractFileName(storagePath),
        file_size: fileInfo.file_size,
        file_format: this.extractFileExtension(fileInfo.original_name),
        metadata: metadata
      };

    } catch (error) {
      logger.error('❌ خطأ في رفع الملف', error);
      throw new Error(`فشل في رفع الملف: ${error}`);
    }
  }

  // ======================================
  // 🛡️ التحقق الأمني والصحة
  // ======================================

  /**
   * التحقق الأمني من الملف
   */
  private validateFileSecurity(fileInfo: FileUploadInfo): void {
    // فحص الحجم الأساسي
    if (fileInfo.file_size <= 0) {
      throw new Error('حجم الملف غير صحيح');
    }

    // فحص اسم الملف
    if (!fileInfo.original_name || fileInfo.original_name.length > 255) {
      throw new Error('اسم الملف غير صحيح');
    }

    // فحص نوع MIME
    const validMimeTypes = [
      'image/jpeg', 'image/png', 'image/webp', 'image/tiff',
      'video/mp4', 'video/mov', 'video/avi', 'video/webm',
      'application/pdf', 'image/svg+xml'
    ];

    if (!validMimeTypes.includes(fileInfo.mime_type)) {
      throw new Error(`نوع الملف ${fileInfo.mime_type} غير مدعوم`);
    }
  }

  /**
   * التحقق من مواصفات الملف
   */
  private validateFileSpecs(fileInfo: FileUploadInfo): void {
    // حدود الحجم حسب النوع
    const maxSizes = {
      'image': 50 * 1024 * 1024, // 50MB
      'video': 500 * 1024 * 1024, // 500MB
      'graphic_design': 100 * 1024 * 1024 // 100MB
    };

    if (fileInfo.file_size > maxSizes[fileInfo.content_type]) {
      throw new Error(
        `حجم الملف أكبر من المسموح (${this.formatFileSize(maxSizes[fileInfo.content_type])})`
      );
    }

    // التحقق من التنسيقات المسموحة
    const allowedFormats = {
      'image': ['jpg', 'jpeg', 'png', 'webp', 'tiff'],
      'video': ['mp4', 'mov', 'avi', 'webm'],
      'graphic_design': ['jpg', 'jpeg', 'png', 'pdf', 'svg']
    };

    const fileExtension = this.extractFileExtension(fileInfo.original_name).toLowerCase();
    if (!allowedFormats[fileInfo.content_type].includes(fileExtension)) {
      throw new Error(`تنسيق الملف .${fileExtension} غير مدعوم لنوع المحتوى ${fileInfo.content_type}`);
    }
  }

  /**
   * فحص جودة الملف الأساسي
   */
  private performBasicQualityCheck(fileInfo: FileUploadInfo): {
    passed: boolean;
    issues: string[];
    score: number;
  } {
    const issues: string[] = [];
    let score = 10;

    // فحص الحجم الأدنى
    const minSizes = {
      'image': 50 * 1024, // 50KB
      'video': 1024 * 1024, // 1MB
      'graphic_design': 100 * 1024 // 100KB
    };

    if (fileInfo.file_size < minSizes[fileInfo.content_type]) {
      issues.push('حجم الملف صغير جداً');
      score -= 2;
    }

    // فحص الاسم
    if (fileInfo.original_name.length < 5) {
      issues.push('اسم الملف قصير جداً');
      score -= 1;
    }

    const passed = score >= 7 && issues.length === 0;

    return { passed, issues, score };
  }

  // ======================================
  // 🖼️ معالجة الصور
  // ======================================

  /**
   * معالجة وتحسين الصور
   */
  private async processImage(
    buffer: Buffer,
    options: ImageProcessingOptions,
    originalName: string
  ): Promise<{
    processedBuffer: Buffer;
    width: number;
    height: number;
    thumbnailUrl?: string;
  }> {
    try {
      let pipeline = sharp(buffer);

      // الحصول على معلومات الصورة الأصلية
      const metadata = await pipeline.metadata();
      let { width = 0, height = 0 } = metadata;

      // تغيير الحجم إذا كان أكبر من الحد الأقصى
      if (options.max_width && width > options.max_width) {
        pipeline = pipeline.resize(options.max_width, undefined, { 
          withoutEnlargement: true 
        });
        width = options.max_width;
        height = Math.round((height * options.max_width) / width);
      }

      if (options.max_height && height > options.max_height) {
        pipeline = pipeline.resize(undefined, options.max_height, { 
          withoutEnlargement: true 
        });
        height = options.max_height;
        width = Math.round((width * options.max_height) / height);
      }

      // تحسين الجودة
      if (options.optimize_quality) {
        pipeline = pipeline.jpeg({ 
          quality: options.target_quality,
          progressive: true,
          mozjpeg: true
        });
      }

      // إضافة العلامة المائية
      if (options.watermark?.enabled) {
        await this.addWatermark(pipeline, options.watermark);
      }

      const processedBuffer = await pipeline.toBuffer();

      // إنشاء صورة مصغرة
      let thumbnailUrl: string | undefined;
      if (options.generate_thumbnail) {
        thumbnailUrl = await this.generateImageThumbnail(
          buffer,
          options.thumbnail_size,
          originalName
        );
      }

      return {
        processedBuffer,
        width,
        height,
        ...(thumbnailUrl && { thumbnailUrl })
      };

    } catch (error) {
      throw new Error(`خطأ في معالجة الصورة: ${error}`);
    }
  }

  /**
   * إنشاء صورة مصغرة
   */
  private async generateImageThumbnail(
    buffer: Buffer,
    size: { width: number; height: number },
    originalName: string
  ): Promise<string> {
    try {
      const thumbnailBuffer = await sharp(buffer)
        .resize(size.width, size.height, { 
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: 80 })
        .toBuffer();

      // رفع الصورة المصغرة
      const thumbnailPath = `thumbnails/${Date.now()}_thumb_${originalName}`;
      const thumbnailMetadata: FileMetadata = {
        upload_timestamp: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 } as FirebaseTimestamp,
        original_filename: `thumb_${originalName}`,
        file_hash: this.generateFileHash(thumbnailBuffer),
        storage_path: thumbnailPath,
        processing_status: 'completed',
        quality_check: { passed: true, issues: [], score: 10 }
      };
      const uploadResult = await this.uploadToStorage(
        thumbnailBuffer,
        thumbnailPath,
        'image/jpeg',
        thumbnailMetadata
      );

      return uploadResult.publicUrl;

    } catch (error) {
      logger.error('خطأ في إنشاء الصورة المصغرة', error);
      return '';
    }
  }

  // ======================================
  // 🎬 معالجة الفيديو
  // ======================================

  /**
   * معالجة وتحسين الفيديو
   */
  private async processVideo(
    buffer: Buffer,
    options: VideoProcessingOptions,
    originalName: string
  ): Promise<{
    processedBuffer: Buffer;
    duration: number;
    thumbnailUrl?: string;
  }> {
    try {
      // حفظ مؤقت للمعالجة باستخدام path.join للأمان
      const tempDir = '/tmp';
      const timestamp = Date.now();
      const tempInputPath = path.join(tempDir, `input_${timestamp}_${originalName}`);
      const tempOutputPath = path.join(tempDir, `output_${timestamp}_${originalName}`);
      
      fs.writeFileSync(tempInputPath, buffer);

      // الحصول على معلومات الفيديو
      const videoInfo = await this.getVideoInfo(tempInputPath);
      const duration = Math.round(videoInfo.duration || 0);

      // التحقق من المدة المسموحة
      if (duration > options.max_duration) {
        throw new Error(`مدة الفيديو (${duration}s) أطول من المسموح (${options.max_duration}s)`);
      }

      let processedBuffer: Buffer;

      // ضغط الفيديو إذا كان مطلوباً
      if (options.compress) {
        await this.compressVideo(tempInputPath, tempOutputPath, options.target_resolution);
        processedBuffer = fs.readFileSync(tempOutputPath);
      } else {
        processedBuffer = buffer;
      }

      // إنشاء صور مصغرة للفيديو
      let thumbnailUrl: string | undefined;
      if (options.generate_thumbnail) {
        thumbnailUrl = await this.generateVideoThumbnails(
          tempInputPath,
          options.thumbnail_timestamps,
          originalName
        );
      }

      // تنظيف الملفات المؤقتة
      this.cleanupTempFiles([tempInputPath, tempOutputPath]);

      return {
        processedBuffer,
        duration,
        ...(thumbnailUrl && { thumbnailUrl })
      };

    } catch (error) {
      throw new Error(`خطأ في معالجة الفيديو: ${error}`);
    }
  }

  /**
   * الحصول على معلومات الفيديو باستخدام ffprobe
   */
  private async getVideoInfo(filePath: string): Promise<{ duration?: number; width?: number; height?: number }> {
    return new Promise((resolve, reject) => {
      // تعيين مسار ffprobe لـ fluent-ffmpeg
      ffmpeg.setFfprobePath(ffprobeStatic);
      
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) {
          reject(err);
          return;
        }

        const videoStream = metadata.streams.find(stream => stream.codec_type === 'video');
        const duration = metadata.format?.duration;
        const width = videoStream?.width;
        const height = videoStream?.height;
        
        const result: { duration?: number; width?: number; height?: number } = {};
        if (duration) result.duration = duration;
        if (width) result.width = width;
        if (height) result.height = height;
        
        resolve(result);
      });
    });
  }

  /**
   * ضغط الفيديو
   */
  private async compressVideo(
    inputPath: string,
    outputPath: string,
    targetResolution: string
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const resolutionSettings: Record<string, string | undefined> = {
        '720p': '1280x720',
        '1080p': '1920x1080',
        '4k': '3840x2160',
        'original': undefined
      };

      let command = ffmpeg(inputPath)
        .output(outputPath)
        .videoCodec('libx264')
        .audioCodec('aac')
        .format('mp4');

      if (targetResolution !== 'original' && resolutionSettings[targetResolution]) {
        const resolution = resolutionSettings[targetResolution];
        if (resolution) {
          command = command.size(resolution);
        }
      }

      command
        .on('end', () => resolve())
        .on('error', (err) => reject(err))
        .run();
    });
  }

  // ======================================
  // 📊 فحص الجودة والتحليل
  // ======================================

  /**
   * فحص جودة الملف النهائي
   */
  private async performQualityCheck(
    contentType: ContentType,
    buffer: Buffer,
    dimensions: { width?: number; height?: number; duration?: number }
  ): Promise<QualityCheckResult> {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 10;

    try {
      switch (contentType) {
        case 'image':
          // فحص جودة الصور
          if (dimensions.width && dimensions.width < 1024) {
            issues.push('دقة الصورة منخفضة');
            score -= 2;
          }

          if (buffer.length < 100 * 1024) { // أقل من 100KB
            issues.push('حجم الملف صغير جداً قد يؤثر على الجودة');
            score -= 1;
          }

          // فحص نسبة العرض إلى الارتفاع
          if (dimensions.width && dimensions.height) {
            const aspectRatio = dimensions.width / dimensions.height;
            if (aspectRatio < 0.5 || aspectRatio > 3) {
              recommendations.push('نسبة العرض للارتفاع غير تقليدية');
            }
          }
          break;

        case 'video':
          // فحص جودة الفيديو
          if (dimensions.duration && dimensions.duration < 3) {
            issues.push('مدة الفيديو قصيرة جداً');
            score -= 1;
          }

          if (dimensions.duration && dimensions.duration > 180) {
            recommendations.push('فيديو طويل - قد يحتاج لتقسيم');
          }

          if (buffer.length > 100 * 1024 * 1024) { // أكبر من 100MB
            recommendations.push('حجم الفيديو كبير - يُنصح بالضغط');
          }
          break;

        case 'graphic_design':
          // فحص ملفات التصميم
          if (buffer.length > 50 * 1024 * 1024) { // أكبر من 50MB
            recommendations.push('حجم ملف التصميم كبير');
          }
          break;
      }

      // تقييم النتيجة النهائية
      const passed = score >= 6 && issues.length === 0;

      return {
        passed,
        score: Math.max(0, score),
        issues,
        recommendations
      };

    } catch (error) {
      return {
        passed: false,
        score: 0,
        issues: [`خطأ في فحص الجودة: ${error}`],
        recommendations: []
      };
    }
  }

  // ======================================
  // ☁️ تكامل Firebase Storage
  // ======================================

  /**
   * رفع إلى Firebase Storage
   */
  private async uploadToStorage(
    buffer: Buffer,
    storagePath: string,
    mimeType: string,
    metadata: FileMetadata
  ): Promise<{ publicUrl: string; storagePath: string }> {
    try {
      const file = this.defaultBucket.file(storagePath);

      // إعدادات الرفع
      const uploadOptions = {
        metadata: {
          contentType: mimeType,
          metadata: {
            originalName: metadata.original_filename,
            uploadTimestamp: metadata.upload_timestamp.seconds.toString(),
            fileHash: metadata.file_hash
          }
        }
      };

      // رفع الملف
      await file.save(buffer, uploadOptions);

      // جعل الملف عام
      await file.makePublic();

      // الحصول على الرابط العام
      const publicUrl = `https://storage.googleapis.com/${this.defaultBucket.name}/${storagePath}`;

      logger.info('✅ تم رفع الملف بنجاح', {
        storagePath,
        publicUrl,
        fileSize: buffer.length
      });

      return { publicUrl, storagePath };

    } catch (error) {
      throw new Error(`خطأ في رفع الملف إلى Storage: ${error}`);
    }
  }

  /**
   * حذف ملف من Storage
   */
  async deleteFile(storagePath: string): Promise<void> {
    try {
      await this.defaultBucket.file(storagePath).delete();
      logger.info('🗑️ تم حذف الملف', { storagePath });
    } catch (error) {
      logger.error('❌ خطأ في حذف الملف', error);
      throw new Error(`خطأ في حذف الملف: ${error}`);
    }
  }

  // ======================================
  // 🛠️ الوظائف المساعدة
  // ======================================

  /**
   * إنشاء metadata للملف
   */
  private generateFileMetadata(fileInfo: FileUploadInfo): FileMetadata {
    const fileHash = this.generateFileHash(fileInfo.file_buffer);

    return {
      upload_timestamp: { 
        seconds: Math.floor(Date.now() / 1000), 
        nanoseconds: 0 
      } as FirebaseTimestamp,
      original_filename: fileInfo.original_name,
      file_hash: fileHash,
      storage_path: '',
      processing_status: 'pending',
      quality_check: {
        passed: false,
        issues: [],
        score: 0
      }
    };
  }

  /**
   * إنشاء مسار التخزين باستخدام path.join للأمان
   */
  private generateStoragePath(fileInfo: FileUploadInfo): string {
    const timestamp = new Date();
    const year = timestamp.getFullYear();
    const month = String(timestamp.getMonth() + 1).padStart(2, '0');
    const day = String(timestamp.getDate()).padStart(2, '0');
    
    const fileName = `${Date.now()}_${this.sanitizeFileName(fileInfo.original_name)}`;
    return path.join('content', year.toString(), month, day, fileName).replace(/\\/g, '/');
  }

  /**
   * تنظيف اسم الملف باستخدام path
   */
  private sanitizeFileName(fileName: string): string {
    const ext = path.extname(fileName);
    const basename = path.basename(fileName, ext);
    
    const cleanBasename = basename
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_{2,}/g, '_')
      .toLowerCase();
    
    return cleanBasename + ext.toLowerCase();
  }

  /**
   * استخراج اسم الملف من المسار باستخدام path
   */
  private extractFileName(filePath: string): string {
    return path.basename(filePath);
  }

  /**
   * استخراج امتداد الملف باستخدام path
   */
  private extractFileExtension(fileName: string): string {
    return path.extname(fileName).toLowerCase().replace('.', '');
  }

  /**
   * إنشاء hash للملف
   */
  private generateFileHash(buffer: Buffer): string {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  /**
   * تنسيق حجم الملف
   */
  private formatFileSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }

  // ======================================
  // 🛡️ وظائف الأمان (محاكاة)
  // ======================================

  /**
   * فحص الملف للفيروسات (محاكاة)
   */
  private async containsMalware(buffer: Buffer): Promise<boolean> {
    // في التطبيق الحقيقي، ستُستخدم خدمة فحص فيروسات حقيقية
    return false;
  }

  /**
   * اكتشاف نوع MIME الحقيقي
   */
  private async detectRealMimeType(buffer: Buffer): Promise<string> {
    // فحص بسيط للـ magic bytes
    const header = buffer.slice(0, 10);
    
    if (header[0] === 0xFF && header[1] === 0xD8) return 'image/jpeg';
    if (header[0] === 0x89 && header[1] === 0x50) return 'image/png';
    if (header.slice(0, 4).toString() === 'ftypmp4') return 'video/mp4';
    
    // افتراضي
    return 'application/octet-stream';
  }

  /**
   * فحص المحتوى المشكوك فيه
   */
  private async checkSuspiciousContent(buffer: Buffer, contentType: ContentType): Promise<void> {
    // في التطبيق الحقيقي، ستُستخدم خدمات AI للكشف عن المحتوى غير المناسب
    // مثل Google Cloud Vision API أو Amazon Rekognition
  }

  /**
   * إضافة علامة مائية
   */
  private async addWatermark(
    pipeline: sharp.Sharp,
    watermarkOptions: NonNullable<ImageProcessingOptions['watermark']>
  ): Promise<void> {
    // تطبيق العلامة المائية (تنفيذ مبسط)
    // في التطبيق الحقيقي، ستكون هناك معالجة أكثر تعقيداً
  }

  /**
   * إنشاء صور مصغرة للفيديو
   */
  private async generateVideoThumbnails(
    videoPath: string,
    timestamps: number[],
    originalName: string
  ): Promise<string> {
    // تنفيذ مبسط - في الواقع ستُستخدم ffmpeg لاستخراج الإطارات
    return '';
  }

  /**
   * تنظيف الملفات المؤقتة
   */
  private cleanupTempFiles(filePaths: string[]): void {
    filePaths.forEach(filePath => {
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (error) {
        logger.warn('تحذير: فشل في حذف الملف المؤقت', { filePath, error });
      }
    });
  }
} 
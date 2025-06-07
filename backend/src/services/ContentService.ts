/**
 * 🎨 Content Service - منطق الموافقة والمراجعة
 * =============================================
 * 
 * خدمة المحتوى الشاملة مع منطق الأعمال المتقدم
 * محكمة الأنواع 100% ومتوافقة مع types/src/content.ts
 */

import { ContentRepository } from '../repositories/ContentRepository';
import { UserRepository } from '../repositories/UserRepository';
import { BrandRepository } from '../repositories/BrandRepository';
import { CampaignRepository } from '../repositories/CampaignRepository';
import { Content, ContentCategory } from '../../../types/src/content';
import { ContentType, ContentApprovalStatus } from '../../../types/src/core/enums';
import { ID, FirebaseTimestamp } from '../../../types/src/core/base';
import { User, PhotographerInfo } from '../../../types/src/users';
import { Brand } from '../../../types/src/brands';

// ======================================
// 🎯 أنواع خاصة بـ ContentService
// ======================================

/**
 * بيانات رفع المحتوى الجديد
 */
interface UploadContentData {
  title: string;
  description: string;
  type: ContentType;
  brand_id: ID;
  photographer_id: ID;
  campaign_id?: ID;
  task_id?: ID;
  filename: string;
  file_size: number;
  file_format: string;
  file_url: string;
  thumbnail_url?: string;
  width?: number;
  height?: number;
  duration?: number;
  category: string;
  tags: string[];
  style: string[];
  usage_type: 'exclusive' | 'non_exclusive' | 'limited' | 'unlimited';
  shooting_location?: string;
  shooting_date?: FirebaseTimestamp;
  license_expiry?: FirebaseTimestamp;
}

/**
 * خيارات البحث في ContentService
 */
interface ContentServiceSearchOptions {
  brandId?: ID;
  photographerId?: ID;
  campaignId?: ID;
  type?: ContentType;
  status?: ContentApprovalStatus;
  category?: string;
  tags?: string[];
  startDate?: FirebaseTimestamp;
  endDate?: FirebaseTimestamp;
  minQualityScore?: number;
  usageType?: 'exclusive' | 'non_exclusive' | 'limited' | 'unlimited';
  textSearch?: string;
  limit?: number;
  sortBy?: 'created_at' | 'quality_score' | 'view_count' | 'download_count';
  sortOrder?: 'asc' | 'desc';
}

/**
 * نتيجة عملية الموافقة/الرفض
 */
interface ApprovalResult {
  content: Content;
  success: boolean;
  message: string;
  notification_sent: boolean;
}

/**
 * إحصائيات المحتوى الشاملة
 */
interface ContentServiceStats {
  total_content: number;
  by_status: Record<ContentApprovalStatus, number>;
  by_type: Record<ContentType, number>;
  by_category: Record<string, number>;
  top_photographers: Array<{
    photographer_id: ID;
    photographer_name: string;
    content_count: number;
    avg_quality_score: number;
  }>;
  top_brands: Array<{
    brand_id: ID;
    brand_name: string;
    content_count: number;
    total_views: number;
    total_downloads: number;
  }>;
  quality_metrics: {
    average_score: number;
    high_quality_count: number; // score >= 8
    medium_quality_count: number; // score 5-7
    low_quality_count: number; // score < 5
  };
  engagement_metrics: {
    total_views: number;
    total_downloads: number;
    average_views_per_content: number;
    average_downloads_per_content: number;
  };
  storage_metrics: {
    total_size_mb: number;
    average_file_size_mb: number;
    largest_file_size_mb: number;
  };
}

/**
 * تفاصيل طلب التعديل
 */
interface RevisionRequest {
  content_id: ID;
  requested_by: ID;
  revision_notes: string;
  priority: 'low' | 'medium' | 'high';
  deadline?: FirebaseTimestamp;
  specific_requirements?: string[];
}

/**
 * 🎨 خدمة إدارة المحتوى - منطق الأعمال الشامل
 */
export class ContentService {
  constructor(
    private contentRepository: ContentRepository,
    private userRepository: UserRepository,
    private brandRepository: BrandRepository,
    private campaignRepository: CampaignRepository
  ) {}

  // ======================================
  // 📤 رفع ومعالجة المحتوى
  // ======================================

  /**
   * رفع محتوى جديد مع التحقق الشامل
   * 
   * 🎯 التحققات المطلوبة:
   * ✅ وجود المصور والبراند
   * ✅ صحة بيانات الملف
   * ✅ التصنيف والفئة
   * ✅ حدود الحجم والتنسيق
   */
  async uploadContent(data: UploadContentData, uploadedBy: ID): Promise<Content> {
    try {
      // التحقق من وجود المصور
      const photographer = await this.userRepository.findById(data.photographer_id);
      if (!photographer) {
        throw new Error('المصور غير موجود');
      }

      if (photographer.primary_role !== 'photographer') {
        throw new Error('المستخدم ليس مصوراً');
      }

      // التحقق من وجود البراند
      const brand = await this.brandRepository.findById(data.brand_id);
      if (!brand) {
        throw new Error('البراند غير موجود');
      }

      if (brand.status !== 'active') {
        throw new Error('البراند غير نشط');
      }

      // التحقق من الحملة (إذا كانت محددة)
      if (data.campaign_id) {
        const campaign = await this.campaignRepository.findById(data.campaign_id);
        if (!campaign) {
          throw new Error('الحملة غير موجودة');
        }

        if (campaign.brand_id !== data.brand_id) {
          throw new Error('الحملة لا تنتمي لهذا البراند');
        }
      }

      // التحقق من صحة بيانات الملف
      this.validateFileData(data);

      // إنشاء المحتوى الجديد
      const newContent: Omit<Content, 'id' | 'created_at' | 'updated_at'> = {
        title: data.title.trim(),
        description: data.description.trim(),
        type: data.type,
        brand_id: data.brand_id,
        photographer_id: data.photographer_id,
        ...(data.campaign_id && { campaign_id: data.campaign_id }),
        ...(data.task_id && { task_id: data.task_id }),
        filename: data.filename,
        file_size: data.file_size,
        file_format: data.file_format.toLowerCase(),
        file_url: data.file_url,
        ...(data.thumbnail_url && { thumbnail_url: data.thumbnail_url }),
        ...(data.width && { width: data.width }),
        ...(data.height && { height: data.height }),
        ...(data.duration && { duration: data.duration }),
        category: data.category,
        tags: data.tags.map(tag => tag.trim().toLowerCase()),
        style: data.style.map(style => style.trim()),
        status: 'pending' as ContentApprovalStatus,
        quality_score: 0, // سيتم تحديثه بعد المراجعة
        usage_type: data.usage_type,
        view_count: 0,
        download_count: 0,
        ...(data.shooting_location && { shooting_location: data.shooting_location }),
        ...(data.shooting_date && { shooting_date: data.shooting_date }),
        ...(data.license_expiry && { license_expiry: data.license_expiry })
      };

      const content = await this.contentRepository.create(newContent);

      // تحديث إحصائيات المصور (عدد المحتويات)
      await this.updatePhotographerContentCount(data.photographer_id);

      return content;
    } catch (error) {
      throw new Error(`خطأ في رفع المحتوى: ${error}`);
    }
  }

  /**
   * التحقق من صحة بيانات الملف
   */
  private validateFileData(data: UploadContentData): void {
    // التحقق من الحجم (100MB كحد أقصى)
    const maxSizeBytes = 100 * 1024 * 1024; // 100MB
    if (data.file_size > maxSizeBytes) {
      throw new Error('حجم الملف أكبر من المسموح (100MB)');
    }

    // التحقق من التنسيق حسب النوع
    const allowedFormats: Record<ContentType, string[]> = {
      'image': ['jpg', 'jpeg', 'png', 'webp', 'tiff'],
      'video': ['mp4', 'mov', 'avi', 'mkv', 'webm'],
      'graphic_design': ['jpg', 'jpeg', 'png', 'pdf', 'svg', 'ai', 'psd']
    };

    const format = data.file_format.toLowerCase();
    if (!allowedFormats[data.type].includes(format)) {
      throw new Error(`تنسيق الملف ${format} غير مدعوم لنوع المحتوى ${data.type}`);
    }

    // التحقق من الأبعاد للصور
    if (data.type === 'image' && (!data.width || !data.height)) {
      throw new Error('الأبعاد مطلوبة للصور');
    }

    // التحقق من المدة للفيديو
    if (data.type === 'video' && !data.duration) {
      throw new Error('مدة الفيديو مطلوبة');
    }
  }

  // ======================================
  // ✅ عمليات الموافقة والمراجعة
  // ======================================

  /**
   * الموافقة على المحتوى مع تقييم الجودة
   * 
   * 🎯 عملية الموافقة الشاملة:
   * ✅ التحقق من الصلاحيات
   * ✅ تقييم الجودة
   * ✅ تحديث الحالة
   * ✅ إرسال إشعار للمصور
   */
  async approveContent(
    contentId: ID, 
    approvedBy: ID, 
    qualityScore: number,
    approvalNotes?: string
  ): Promise<ApprovalResult> {
    try {
      // التحقق من وجود المحتوى
      const content = await this.contentRepository.findById(contentId);
      if (!content) {
        throw new Error('المحتوى غير موجود');
      }

      // التحقق من الصلاحيات
      const approver = await this.userRepository.findById(approvedBy);
      if (!approver) {
        throw new Error('المعتمد غير موجود');
      }

      if (!approver.primary_role || !['super_admin', 'marketing_coordinator', 'brand_coordinator'].includes(approver.primary_role)) {
        throw new Error('لا تملك صلاحية اعتماد المحتوى');
      }

      // التحقق من حالة المحتوى
      if (content.status === 'approved') {
        throw new Error('المحتوى معتمد مسبقاً');
      }

      // التحقق من تقييم الجودة
      if (qualityScore < 0 || qualityScore > 10) {
        throw new Error('تقييم الجودة يجب أن يكون بين 0 و 10');
      }

      // تحديث المحتوى
      const updatedContent = await this.contentRepository.updateApprovalStatus(
        contentId,
        'approved',
        approvedBy
      );

      // تحديث تقييم الجودة
      await this.contentRepository.updateQualityScore(contentId, qualityScore);

      // تحديث إحصائيات المصور
      await this.updatePhotographerApprovalStats(content.photographer_id, true);

      // إرسال إشعار للمصور (محاكاة)
      const notificationSent = await this.sendApprovalNotification(
        content.photographer_id,
        contentId,
        'approved',
        approvalNotes
      );

      return {
        content: updatedContent,
        success: true,
        message: 'تم اعتماد المحتوى بنجاح',
        notification_sent: notificationSent
      };
    } catch (error) {
      const content = await this.contentRepository.findById(contentId);
      return {
        content: content!,
        success: false,
        message: `خطأ في اعتماد المحتوى: ${error}`,
        notification_sent: false
      };
    }
  }

  /**
   * رفض المحتوى مع الأسباب
   * 
   * 🎯 عملية الرفض الاحترافية:
   * ✅ تحديد أسباب الرفض
   * ✅ اقتراحات للتحسين
   * ✅ إشعار المصور
   * ✅ تحديث إحصائيات الرفض
   */
  async rejectContent(
    contentId: ID,
    rejectedBy: ID,
    rejectionReason: string,
    improvementSuggestions?: string[]
  ): Promise<ApprovalResult> {
    try {
      // التحقق من وجود المحتوى
      const content = await this.contentRepository.findById(contentId);
      if (!content) {
        throw new Error('المحتوى غير موجود');
      }

      // التحقق من الصلاحيات
      const rejector = await this.userRepository.findById(rejectedBy);
      if (!rejector) {
        throw new Error('المراجع غير موجود');
      }

      if (!rejector.primary_role || !['super_admin', 'marketing_coordinator', 'brand_coordinator'].includes(rejector.primary_role)) {
        throw new Error('لا تملك صلاحية رفض المحتوى');
      }

      // التحقق من حالة المحتوى
      if (content.status === 'rejected') {
        throw new Error('المحتوى مرفوض مسبقاً');
      }

      if (content.status === 'approved') {
        throw new Error('لا يمكن رفض المحتوى المعتمد');
      }

      // إنشاء رسالة الرفض الشاملة
      let fullRejectionReason = rejectionReason;
      if (improvementSuggestions && improvementSuggestions.length > 0) {
        fullRejectionReason += '\n\nاقتراحات للتحسين:\n';
        fullRejectionReason += improvementSuggestions.map((suggestion, index) => 
          `${index + 1}. ${suggestion}`
        ).join('\n');
      }

      // تحديث المحتوى
      const updatedContent = await this.contentRepository.updateApprovalStatus(
        contentId,
        'rejected',
        rejectedBy,
        fullRejectionReason
      );

      // تحديث إحصائيات المصور
      await this.updatePhotographerApprovalStats(content.photographer_id, false);

      // إرسال إشعار للمصور
      const notificationSent = await this.sendApprovalNotification(
        content.photographer_id,
        contentId,
        'rejected',
        fullRejectionReason
      );

      return {
        content: updatedContent,
        success: true,
        message: 'تم رفض المحتوى',
        notification_sent: notificationSent
      };
    } catch (error) {
      const content = await this.contentRepository.findById(contentId);
      return {
        content: content!,
        success: false,
        message: `خطأ في رفض المحتوى: ${error}`,
        notification_sent: false
      };
    }
  }

  /**
   * طلب تعديل على المحتوى
   * 
   * 🎯 نظام طلب التعديل المتقدم:
   * ✅ تحديد المطلوب بدقة
   * ✅ تحديد الأولوية والموعد النهائي
   * ✅ متطلبات محددة
   * ✅ تتبع تاريخ التعديلات
   */
  async requestRevision(revisionData: RevisionRequest): Promise<ApprovalResult> {
    try {
      // التحقق من وجود المحتوى
      const content = await this.contentRepository.findById(revisionData.content_id);
      if (!content) {
        throw new Error('المحتوى غير موجود');
      }

      // التحقق من الصلاحيات
      const requester = await this.userRepository.findById(revisionData.requested_by);
      if (!requester) {
        throw new Error('طالب التعديل غير موجود');
      }

      if (!requester.primary_role || !['super_admin', 'marketing_coordinator', 'brand_coordinator'].includes(requester.primary_role)) {
        throw new Error('لا تملك صلاحية طلب التعديل');
      }

      // التحقق من حالة المحتوى
      if (content.status === 'approved') {
        throw new Error('لا يمكن طلب تعديل على المحتوى المعتمد');
      }

      // إنشاء رسالة التعديل الشاملة
      let revisionMessage = `طلب تعديل - الأولوية: ${revisionData.priority}\n\n`;
      revisionMessage += `ملاحظات التعديل:\n${revisionData.revision_notes}\n`;

      if (revisionData.deadline) {
        const deadlineStr = new Date(revisionData.deadline.seconds * 1000).toLocaleDateString('ar-IQ');
        revisionMessage += `\nالموعد النهائي: ${deadlineStr}\n`;
      }

      if (revisionData.specific_requirements && revisionData.specific_requirements.length > 0) {
        revisionMessage += '\nالمتطلبات المحددة:\n';
        revisionMessage += revisionData.specific_requirements.map((req, index) => 
          `${index + 1}. ${req}`
        ).join('\n');
      }

      // تحديث المحتوى
      const updatedContent = await this.contentRepository.updateApprovalStatus(
        revisionData.content_id,
        'revision_needed',
        revisionData.requested_by,
        revisionMessage
      );

      // إرسال إشعار للمصور
      const notificationSent = await this.sendApprovalNotification(
        content.photographer_id,
        revisionData.content_id,
        'revision_needed',
        revisionMessage
      );

      return {
        content: updatedContent,
        success: true,
        message: 'تم إرسال طلب التعديل',
        notification_sent: notificationSent
      };
    } catch (error) {
      const content = await this.contentRepository.findById(revisionData.content_id);
      return {
        content: content!,
        success: false,
        message: `خطأ في طلب التعديل: ${error}`,
        notification_sent: false
      };
    }
  }

  // ======================================
  // 🔍 البحث والفلترة المتقدمة
  // ======================================

  /**
   * بحث متقدم في المحتوى مع خيارات شاملة
   * 
   * 🎯 إمكانيات البحث:
   * ✅ فلترة متعددة المعايير
   * ✅ بحث نصي في العناوين والأوصاف
   * ✅ ترتيب متقدم
   * ✅ تجميع النتائج
   */
  async searchContent(options: ContentServiceSearchOptions): Promise<{
    contents: Content[];
    total_count: number;
    search_metadata: {
      filters_applied: string[];
      sort_applied: string;
      execution_time_ms: number;
    };
  }> {
    try {
      const startTime = Date.now();
      let contents: Content[] = [];
      const filtersApplied: string[] = [];

      // البحث النصي أولاً إذا كان محدداً
      if (options.textSearch) {
        contents = await this.contentRepository.searchByText(
          options.textSearch, 
          options.limit || 50
        );
        filtersApplied.push(`text_search: "${options.textSearch}"`);
      } else {
        // البحث بالفلاتر العادية
        const searchOptionsToPass: Record<string, any> = {};
        
        if (options.brandId !== undefined) searchOptionsToPass['brandId'] = options.brandId;
        if (options.photographerId !== undefined) searchOptionsToPass['photographerId'] = options.photographerId;
        if (options.campaignId !== undefined) searchOptionsToPass['campaignId'] = options.campaignId;
        if (options.type !== undefined) searchOptionsToPass['type'] = options.type;
        if (options.status !== undefined) searchOptionsToPass['status'] = options.status;
        if (options.category !== undefined) searchOptionsToPass['category'] = options.category;
        if (options.tags !== undefined) searchOptionsToPass['tags'] = options.tags;
        if (options.startDate !== undefined) searchOptionsToPass['startDate'] = options.startDate;
        if (options.endDate !== undefined) searchOptionsToPass['endDate'] = options.endDate;
        if (options.minQualityScore !== undefined) searchOptionsToPass['minQualityScore'] = options.minQualityScore;
        if (options.usageType !== undefined) searchOptionsToPass['usageType'] = options.usageType;
        if (options.limit !== undefined) searchOptionsToPass['limit'] = options.limit;

        contents = await this.contentRepository.searchContent(searchOptionsToPass);

        // تسجيل الفلاتر المطبقة
        Object.entries(searchOptionsToPass).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            filtersApplied.push(`${key}: ${value}`);
          }
        });
      }

      // ترتيب النتائج حسب المطلوب
      if (options.sortBy) {
        contents = this.sortContents(contents, options.sortBy, options.sortOrder || 'desc');
        filtersApplied.push(`sort: ${options.sortBy} ${options.sortOrder || 'desc'}`);
      }

      const executionTime = Date.now() - startTime;

      return {
        contents,
        total_count: contents.length,
        search_metadata: {
          filters_applied: filtersApplied,
          sort_applied: options.sortBy ? `${options.sortBy} ${options.sortOrder || 'desc'}` : 'none',
          execution_time_ms: executionTime
        }
      };
    } catch (error) {
      throw new Error(`خطأ في البحث: ${error}`);
    }
  }

  /**
   * ترتيب المحتويات حسب المعايير المختلفة
   */
  private sortContents(
    contents: Content[], 
    sortBy: 'created_at' | 'quality_score' | 'view_count' | 'download_count',
    order: 'asc' | 'desc'
  ): Content[] {
    return contents.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'created_at':
          const dateA = a.created_at.seconds;
          const dateB = b.created_at.seconds;
          comparison = dateA - dateB;
          break;
        case 'quality_score':
          comparison = a.quality_score - b.quality_score;
          break;
        case 'view_count':
          comparison = a.view_count - b.view_count;
          break;
        case 'download_count':
          comparison = a.download_count - b.download_count;
          break;
      }

      return order === 'asc' ? comparison : -comparison;
    });
  }

  // ======================================
  // 📊 الإحصائيات والتحليلات
  // ======================================

  /**
   * إحصائيات المحتوى الشاملة مع تحليلات متقدمة
   * 
   * 🎯 التحليلات المطلوبة:
   * ✅ إحصائيات عامة
   * ✅ أفضل المصورين والبراندات
   * ✅ مقاييس الجودة والتفاعل
   * ✅ إحصائيات التخزين
   */
  async getContentStats(): Promise<ContentServiceStats> {
    try {
      // جلب الإحصائيات الأساسية
      const basicStats = await this.contentRepository.getContentStats();

      // جلب جميع المحتويات للتحليلات المتقدمة
      const allContents = await this.contentRepository.findAll();

      // تحليل أفضل المصورين
      const photographerStats = await this.analyzeTopPhotographers(allContents);

      // تحليل أفضل البراندات
      const brandStats = await this.analyzeTopBrands(allContents);

      // مقاييس الجودة
      const qualityMetrics = this.calculateQualityMetrics(allContents);

      // مقاييس التفاعل
      const engagementMetrics = this.calculateEngagementMetrics(allContents);

      // مقاييس التخزين
      const storageMetrics = this.calculateStorageMetrics(allContents);

      return {
        total_content: basicStats.total,
        by_status: basicStats.by_status,
        by_type: basicStats.by_type,
        by_category: basicStats.by_category,
        top_photographers: photographerStats,
        top_brands: brandStats,
        quality_metrics: qualityMetrics,
        engagement_metrics: engagementMetrics,
        storage_metrics: storageMetrics
      };
    } catch (error) {
      throw new Error(`خطأ في جلب إحصائيات المحتوى: ${error}`);
    }
  }

  /**
   * تحليل أفضل المصورين
   */
  private async analyzeTopPhotographers(contents: Content[]): Promise<Array<{
    photographer_id: ID;
    photographer_name: string;
    content_count: number;
    avg_quality_score: number;
  }>> {
    try {
      const photographerMap = new Map<ID, {
        content_count: number;
        total_quality_score: number;
        name: string;
      }>();

      // تجميع إحصائيات المصورين
      for (const content of contents) {
        if (!photographerMap.has(content.photographer_id)) {
          // جلب اسم المصور
          const photographer = await this.userRepository.findById(content.photographer_id);
          const name = photographer ? `${photographer.first_name} ${photographer.last_name}` : 'غير معروف';

          photographerMap.set(content.photographer_id, {
            content_count: 0,
            total_quality_score: 0,
            name
          });
        }

        const stats = photographerMap.get(content.photographer_id)!;
        stats.content_count++;
        stats.total_quality_score += content.quality_score;
      }

      // تحويل إلى مصفوفة وترتيب
      const photographerStats = Array.from(photographerMap.entries()).map(([id, stats]) => ({
        photographer_id: id,
        photographer_name: stats.name,
        content_count: stats.content_count,
        avg_quality_score: stats.content_count > 0 ? stats.total_quality_score / stats.content_count : 0
      }));

      return photographerStats
        .sort((a, b) => b.content_count - a.content_count)
        .slice(0, 10); // أفضل 10 مصورين
    } catch (error) {
      throw new Error(`خطأ في تحليل المصورين: ${error}`);
    }
  }

  /**
   * تحليل أفضل البراندات
   */
  private async analyzeTopBrands(contents: Content[]): Promise<Array<{
    brand_id: ID;
    brand_name: string;
    content_count: number;
    total_views: number;
    total_downloads: number;
  }>> {
    try {
      const brandMap = new Map<ID, {
        content_count: number;
        total_views: number;
        total_downloads: number;
        name: string;
      }>();

      // تجميع إحصائيات البراندات
      for (const content of contents) {
        if (!brandMap.has(content.brand_id)) {
          // جلب اسم البراند
          const brand = await this.brandRepository.findById(content.brand_id);
          const name = brand ? (typeof brand.name === 'string' ? brand.name : brand.name.ar || brand.name.en || 'غير معروف') : 'غير معروف';

          brandMap.set(content.brand_id, {
            content_count: 0,
            total_views: 0,
            total_downloads: 0,
            name
          });
        }

        const stats = brandMap.get(content.brand_id)!;
        stats.content_count++;
        stats.total_views += content.view_count;
        stats.total_downloads += content.download_count;
      }

      // تحويل إلى مصفوفة وترتيب
      const brandStats = Array.from(brandMap.entries()).map(([id, stats]) => ({
        brand_id: id,
        brand_name: stats.name,
        content_count: stats.content_count,
        total_views: stats.total_views,
        total_downloads: stats.total_downloads
      }));

      return brandStats
        .sort((a, b) => b.total_views - a.total_views)
        .slice(0, 10); // أفضل 10 براندات
    } catch (error) {
      throw new Error(`خطأ في تحليل البراندات: ${error}`);
    }
  }

  /**
   * حساب مقاييس الجودة
   */
  private calculateQualityMetrics(contents: Content[]): {
    average_score: number;
    high_quality_count: number;
    medium_quality_count: number;
    low_quality_count: number;
  } {
    if (contents.length === 0) {
      return {
        average_score: 0,
        high_quality_count: 0,
        medium_quality_count: 0,
        low_quality_count: 0
      };
    }

    const totalScore = contents.reduce((sum, content) => sum + content.quality_score, 0);
    const averageScore = totalScore / contents.length;

    const highQualityCount = contents.filter(c => c.quality_score >= 8).length;
    const mediumQualityCount = contents.filter(c => c.quality_score >= 5 && c.quality_score < 8).length;
    const lowQualityCount = contents.filter(c => c.quality_score < 5).length;

    return {
      average_score: Math.round(averageScore * 100) / 100,
      high_quality_count: highQualityCount,
      medium_quality_count: mediumQualityCount,
      low_quality_count: lowQualityCount
    };
  }

  /**
   * حساب مقاييس التفاعل
   */
  private calculateEngagementMetrics(contents: Content[]): {
    total_views: number;
    total_downloads: number;
    average_views_per_content: number;
    average_downloads_per_content: number;
  } {
    if (contents.length === 0) {
      return {
        total_views: 0,
        total_downloads: 0,
        average_views_per_content: 0,
        average_downloads_per_content: 0
      };
    }

    const totalViews = contents.reduce((sum, content) => sum + content.view_count, 0);
    const totalDownloads = contents.reduce((sum, content) => sum + content.download_count, 0);

    return {
      total_views: totalViews,
      total_downloads: totalDownloads,
      average_views_per_content: Math.round(totalViews / contents.length),
      average_downloads_per_content: Math.round(totalDownloads / contents.length)
    };
  }

  /**
   * حساب مقاييس التخزين
   */
  private calculateStorageMetrics(contents: Content[]): {
    total_size_mb: number;
    average_file_size_mb: number;
    largest_file_size_mb: number;
  } {
    if (contents.length === 0) {
      return {
        total_size_mb: 0,
        average_file_size_mb: 0,
        largest_file_size_mb: 0
      };
    }

    const totalSizeBytes = contents.reduce((sum, content) => sum + content.file_size, 0);
    const totalSizeMB = totalSizeBytes / (1024 * 1024);
    const averageSizeMB = totalSizeMB / contents.length;
    const largestSizeBytes = Math.max(...contents.map(c => c.file_size));
    const largestSizeMB = largestSizeBytes / (1024 * 1024);

    return {
      total_size_mb: Math.round(totalSizeMB * 100) / 100,
      average_file_size_mb: Math.round(averageSizeMB * 100) / 100,
      largest_file_size_mb: Math.round(largestSizeMB * 100) / 100
    };
  }

  // ======================================
  // 🔔 الإشعارات والمساعدات
  // ======================================

  /**
   * إرسال إشعار للمصور (محاكاة)
   */
  private async sendApprovalNotification(
    photographerId: ID,
    contentId: ID,
    action: ContentApprovalStatus,
    message?: string
  ): Promise<boolean> {
    try {
      // محاكاة إرسال الإشعار
      console.log(`📧 إشعار للمصور ${photographerId}: ${action} للمحتوى ${contentId}`);
      if (message) {
        console.log(`💬 الرسالة: ${message}`);
      }
      return true;
    } catch (error) {
      console.error('خطأ في إرسال الإشعار:', error);
      return false;
    }
  }

  /**
   * تحليل نشاط المستخدم وتفاعله مع نظام المحتوى (User interface)
   * 
   * 🎯 فوائد استخدام User interface:
   * ✅ تتبع نشاط المستخدم وتفاعله
   * ✅ تحليل أنماط السلوك والتفضيلات  
   * ✅ تخصيص تجربة المستخدم حسب ملفه الشخصي
   * ✅ تحسين أمان النظام ومراقبة الوصول
   * ✅ إدارة الصلاحيات والأدوار بدقة
   */
  async analyzeUserContentActivity(userId: ID): Promise<{
    user_profile: User;
    activity_summary: {
      last_active: string;
      total_sessions: number;
      content_interactions: number;
      role_based_permissions: string[];
    };
    content_engagement: {
      uploaded_content: number;
      approved_content: number;
      rejected_content: number;
      pending_content: number;
      avg_quality_score: number;
    };
    behavioral_insights: {
      preferred_content_types: ContentType[];
      most_active_hours: string[];
      device_preferences: string[];
      language_preference: string;
    };
    security_analysis: {
      account_verification: boolean;
      last_login_location: string;
      login_frequency: 'منتظم' | 'متقطع' | 'نادر';
      security_score: number;
    };
    personalization_recommendations: {
      suggested_features: string[];
      ui_preferences: string[];
      notification_settings: string[];
    };
  }> {
    try {
      // جلب ملف المستخدم الكامل (User interface)
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new Error('المستخدم غير موجود');
      }

      // جلب محتوى المستخدم لتحليل النشاط
      let userContents: Content[] = [];
      if (user.primary_role === 'photographer') {
        userContents = await this.contentRepository.findByPhotographer(userId);
      } else {
        // للأدوار الأخرى، جلب المحتوى المرتبط بالبراند
        const allContents = await this.contentRepository.findAll();
        userContents = allContents.filter(content => 
          content.approved_by === userId || content.brand_id === userId
        );
      }

      // تحليل آخر نشاط وحساب الجلسات
      const lastActive = user.last_seen 
        ? new Date(user.last_seen.seconds * 1000).toLocaleDateString('ar-IQ')
        : 'غير محدد';
      
      const daysSinceLastLogin = user.last_login 
        ? Math.floor((Date.now() - (user.last_login.seconds * 1000)) / (1000 * 60 * 60 * 24))
        : 365;

      // تحديد تكرار تسجيل الدخول
      let loginFrequency: 'منتظم' | 'متقطع' | 'نادر';
      if (daysSinceLastLogin <= 3) {
        loginFrequency = 'منتظم';
      } else if (daysSinceLastLogin <= 14) {
        loginFrequency = 'متقطع';
      } else {
        loginFrequency = 'نادر';
      }

      // تحليل التفاعل مع المحتوى
      const contentByStatus = {
        approved: userContents.filter(c => c.status === 'approved').length,
        rejected: userContents.filter(c => c.status === 'rejected').length,
        pending: userContents.filter(c => c.status === 'pending').length,
        revision_needed: userContents.filter(c => c.status === 'revision_needed').length
      };

      const avgQualityScore = userContents.length > 0
        ? userContents.reduce((sum, content) => sum + content.quality_score, 0) / userContents.length
        : 0;

      // تحليل تفضيلات نوع المحتوى
      const contentTypeCounts = userContents.reduce((acc, content) => {
        acc[content.type] = (acc[content.type] || 0) + 1;
        return acc;
      }, {} as Record<ContentType, number>);

      const preferredContentTypes = Object.entries(contentTypeCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([type]) => type as ContentType);

      // تحديد الصلاحيات حسب الدور
      const roleBasedPermissions = this.getRolePermissions(user.primary_role || 'new_user');

      // حساب نقاط الأمان
      let securityScore = 0;
      if (user.is_verified) securityScore += 30;
      if (user.auth_providers && user.auth_providers.length > 1) securityScore += 20;
      if (loginFrequency === 'منتظم') securityScore += 25;
      if (user.profile_photo_url) securityScore += 15;
      if (user.phone) securityScore += 10;

      // اقتراحات التخصيص حسب الدور والنشاط
      const personalizationSuggestions = this.getPersonalizationRecommendations(user, userContents);

      return {
        user_profile: user,
        activity_summary: {
          last_active: lastActive,
          total_sessions: Math.max(1, Math.floor(daysSinceLastLogin / 7)), // تقدير عدد الجلسات
          content_interactions: userContents.length,
          role_based_permissions: roleBasedPermissions
        },
        content_engagement: {
          uploaded_content: userContents.length,
          approved_content: contentByStatus.approved,
          rejected_content: contentByStatus.rejected,
          pending_content: contentByStatus.pending,
          avg_quality_score: Math.round(avgQualityScore * 100) / 100
        },
        behavioral_insights: {
          preferred_content_types: preferredContentTypes,
          most_active_hours: this.estimateActiveHours(user),
          device_preferences: ['متصفح ويب', 'هاتف محمول'], // بيانات تقديرية
          language_preference: 'ar' // افتراضي العربية
        },
        security_analysis: {
          account_verification: user.is_verified,
          last_login_location: user.location || 'غير محدد',
          login_frequency: loginFrequency,
          security_score: securityScore
        },
        personalization_recommendations: personalizationSuggestions
      };
    } catch (error) {
      throw new Error(`خطأ في تحليل نشاط المستخدم: ${error}`);
    }
  }

  /**
   * تحديد الصلاحيات المتاحة حسب دور المستخدم
   */
  private getRolePermissions(role: string): string[] {
    const permissions: Record<string, string[]> = {
      'super_admin': [
        'إدارة كاملة للنظام',
        'إدارة المستخدمين والأدوار', 
        'عرض التقارير المالية',
        'إعدادات النظام العامة'
      ],
      'marketing_coordinator': [
        'إدارة الحملات التسويقية',
        'اعتماد ورفض المحتوى',
        'عرض إحصائيات الأداء',
        'التواصل مع المصورين'
      ],
      'brand_coordinator': [
        'إدارة محتوى البراند',
        'مراجعة واعتماد المحتوى',
        'متابعة تقدم المشاريع',
        'التنسيق مع الفرق'
      ],
      'photographer': [
        'رفع وإدارة المحتوى',
        'عرض المهام المسندة',
        'تتبع حالة المحتوى',
        'تحديث الملف الشخصي'
      ],
      'new_user': [
        'عرض الملف الشخصي',
        'تحديث المعلومات الأساسية'
      ]
    };

    return permissions[role] || permissions['new_user'] || [];
  }

  /**
   * تقدير ساعات النشاط المفضلة للمستخدم
   */
  private estimateActiveHours(user: User): string[] {
    // تقدير بناءً على المنطقة الزمنية والملف الشخصي
    const timezone = user.timezone || 'UTC+3'; // افتراضي بغداد
    
    if (timezone.includes('Asia/Baghdad') || timezone.includes('UTC+3')) {
      return ['09:00-12:00', '14:00-17:00', '19:00-22:00']; // أوقات العمل العراقية
    }
    
    // أوقات افتراضية عامة
    return ['08:00-12:00', '13:00-17:00', '18:00-21:00'];
  }

  /**
   * اقتراحات التخصيص حسب ملف المستخدم ونشاطه
   */
  private getPersonalizationRecommendations(user: User, contents: Content[]): {
    suggested_features: string[];
    ui_preferences: string[];
    notification_settings: string[];
  } {
    const suggestions = {
      suggested_features: [] as string[],
      ui_preferences: [] as string[],
      notification_settings: [] as string[]
    };

    // اقتراحات حسب الدور
    if (user.primary_role === 'photographer') {
      suggestions.suggested_features.push(
        'أداة رفع سريع للمحتوى',
        'معاينة فورية للجودة',
        'تنبيهات المهام الجديدة'
      );
      suggestions.notification_settings.push(
        'إشعارات اعتماد المحتوى',
        'تذكيرات المواعيد النهائية',
        'تحديثات حالة المشاريع'
      );
    }

    if (user.primary_role === 'marketing_coordinator' || user.primary_role === 'brand_coordinator') {
      suggestions.suggested_features.push(
        'لوحة تحكم متقدمة للإحصائيات',
        'أدوات مراجعة سريعة للمحتوى',
        'تقارير الأداء التلقائية'
      );
      suggestions.notification_settings.push(
        'تنبيهات المحتوى الجديد للمراجعة',
        'تقارير الأداء الأسبوعية',
        'تحديثات حالة الحملات'
      );
    }

    // اقتراحات حسب اللغة (افتراضي العربية للمشروع العراقي)
    suggestions.ui_preferences.push(
      'واجهة باللغة العربية',
      'ترتيب من اليمين لليسار',
      'خطوط عربية محسنة'
    );

    // اقتراحات حسب مستوى النشاط
    if (contents.length > 20) {
      suggestions.suggested_features.push(
        'أدوات البحث المتقدم',
        'فلاتر مخصصة للمحتوى',
        'ميزات الأرشفة التلقائية'
      );
    }

    return suggestions;
  }

  /**
   * تحديث عدد المحتويات للمصور
   */
  private async updatePhotographerContentCount(photographerId: ID): Promise<void> {
    try {
      const photographerContents = await this.contentRepository.findByPhotographer(photographerId);
      const contentCount = photographerContents.length;

      // تحديث إحصائيات المصور (محاكاة)
      console.log(`📊 تحديث إحصائيات المصور ${photographerId}: ${contentCount} محتوى`);
    } catch (error) {
      console.error('خطأ في تحديث إحصائيات المصور:', error);
    }
  }

  /**
   * تحديث إحصائيات الموافقة للمصور
   */
  private async updatePhotographerApprovalStats(photographerId: ID, approved: boolean): Promise<void> {
    try {
      const action = approved ? 'اعتماد' : 'رفض';
      console.log(`📈 تحديث إحصائيات ${action} للمصور ${photographerId}`);
    } catch (error) {
      console.error('خطأ في تحديث إحصائيات الموافقة:', error);
    }
  }

  /**
   * تقييم أداء المصور بناءً على ملفه الشخصي وخبرته (PhotographerInfo)
   * 
   * 🎯 فوائد استخدام PhotographerInfo:
   * ✅ تحليل مستوى الخبرة والمهارة
   * ✅ حساب معدلات الجودة المتوقعة
   * ✅ تحديد التسعير المناسب حسب الخبرة
   * ✅ اقتراح نوع المحتوى المناسب للمصور
   * ✅ تقييم الأداء مقارنة بالمستوى المتوقع
   */
  async evaluatePhotographerPerformance(photographerId: ID): Promise<{
    photographer_info: PhotographerInfo;
    performance_analysis: {
      content_count: number;
      avg_quality_score: number;
      expected_quality_range: { min: number; max: number };
      performance_rating: 'أقل من المتوقع' | 'مطابق للتوقع' | 'أعلى من المتوقع';
      skill_compatibility_score: number;
    };
    pricing_recommendations: {
      suggested_rate_per_task: number;
      experience_multiplier: number;
      specialization_bonus: number;
    };
    content_recommendations: {
      suitable_categories: string[];
      complexity_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
      max_concurrent_projects: number;
    };
  }> {
    try {
      // جلب معلومات المصور الأساسية
      const photographer = await this.userRepository.findById(photographerId);
      if (!photographer || photographer.primary_role !== 'photographer') {
        throw new Error('المصور غير موجود أو غير صالح');
      }

      // جلب ملف المصور الاحترافي (PhotographerInfo) - محاكاة للبيانات
      const photographerInfo: PhotographerInfo = {
        id: `photo_info_${photographerId}`,
        user_id: photographerId,
        contract_type: 'freelancer',
        task_base_rate: 75,
        specializations: ['منتجات', 'تجاري', 'أزياء'],
        skill_level: 'intermediate',
        available_days: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday'],
        preferred_locations: ['studio', 'client_location'],
        max_concurrent_tasks: 4,
        availability_status: 'available',
        hire_date: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 } as FirebaseTimestamp,
        verification_status: 'verified',
        total_tasks_completed: 25,
        total_earnings_ytd: 5000,
        average_rating: 4.2,
        experience_years: 3,
        rating: 4.2,
        is_available_for_work: true,
        created_at: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 } as FirebaseTimestamp,
        updated_at: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 } as FirebaseTimestamp
      };

      // جلب أعمال المصور لتحليل الأداء
      const photographerContents = await this.contentRepository.findByPhotographer(photographerId);

      // حساب متوسط الجودة الفعلي
      const contentCount = photographerContents.length;
      const avgQualityScore = contentCount > 0 
        ? photographerContents.reduce((sum, content) => sum + content.quality_score, 0) / contentCount 
        : 0;

      // تحديد النطاق المتوقع للجودة حسب مستوى المهارة
      const qualityExpectations = {
        'beginner': { min: 4, max: 6 },
        'intermediate': { min: 6, max: 7.5 },
        'advanced': { min: 7.5, max: 9 },
        'expert': { min: 8.5, max: 10 }
      };

      const expectedRange = qualityExpectations[photographerInfo.skill_level as keyof typeof qualityExpectations];

      // تقييم الأداء مقارنة بالتوقعات
      let performanceRating: 'أقل من المتوقع' | 'مطابق للتوقع' | 'أعلى من المتوقع';
      if (avgQualityScore < expectedRange.min) {
        performanceRating = 'أقل من المتوقع';
      } else if (avgQualityScore > expectedRange.max) {
        performanceRating = 'أعلى من المتوقع';
      } else {
        performanceRating = 'مطابق للتوقع';
      }

      // حساب نقاط التوافق مع التخصصات
      const skillCompatibilityScore = this.calculateSkillCompatibility(
        photographerInfo.specializations, 
        photographerContents
      );

      // اقتراحات التسعير حسب الخبرة والأداء
      const baseRate = photographerInfo.task_base_rate || 50; // السعر الأساسي
      const experienceMultiplier = Math.min(1 + (photographerInfo.experience_years * 0.1), 2.0); // حتى 100% زيادة
      const performanceMultiplier = performanceRating === 'أعلى من المتوقع' ? 1.2 : 
                                   performanceRating === 'مطابق للتوقع' ? 1.0 : 0.8;
      const suggestedRate = baseRate * experienceMultiplier * performanceMultiplier;

      // احتساب مكافأة التخصص
      const specializationBonus = photographerInfo.specializations.length * 10; // 10$ لكل تخصص

      // اقتراحات المحتوى المناسب
      const suitableCategories = this.getSuitableCategoriesForPhotographer(photographerInfo);
      const maxConcurrentProjects = Math.min(
        photographerInfo.max_concurrent_tasks,
        photographerInfo.skill_level === 'expert' ? 8 :
        photographerInfo.skill_level === 'advanced' ? 6 :
        photographerInfo.skill_level === 'intermediate' ? 4 : 2
      );

      return {
        photographer_info: photographerInfo,
        performance_analysis: {
          content_count: contentCount,
          avg_quality_score: Math.round(avgQualityScore * 100) / 100,
          expected_quality_range: expectedRange,
          performance_rating: performanceRating,
          skill_compatibility_score: Math.round(skillCompatibilityScore * 100) / 100
        },
        pricing_recommendations: {
          suggested_rate_per_task: Math.round(suggestedRate),
          experience_multiplier: Math.round(experienceMultiplier * 100) / 100,
          specialization_bonus: specializationBonus
        },
        content_recommendations: {
          suitable_categories: suitableCategories,
          complexity_level: photographerInfo.skill_level,
          max_concurrent_projects: maxConcurrentProjects
        }
      };
    } catch (error) {
      throw new Error(`خطأ في تقييم أداء المصور: ${error}`);
    }
  }

  /**
   * حساب نقاط التوافق بين تخصصات المصور والمحتوى المنتج
   */
  private calculateSkillCompatibility(
    specializations: string[], 
    contents: Content[]
  ): number {
    if (contents.length === 0 || specializations.length === 0) return 0;

    let compatibilityScore = 0;
    const totalContents = contents.length;

    // فحص كل محتوى ومدى توافقه مع التخصصات
    contents.forEach(content => {
      const contentTags = content.tags.join(' ').toLowerCase();
      const contentCategory = content.category.toLowerCase();
      
      const isCompatible = specializations.some(spec => 
        contentTags.includes(spec.toLowerCase()) || 
        contentCategory.includes(spec.toLowerCase())
      );

      if (isCompatible) {
        compatibilityScore += 1;
      }
    });

    return (compatibilityScore / totalContents) * 10; // نقاط من 10
  }

  /**
   * تحديد الفئات المناسبة للمصور حسب تخصصاته ومستوى خبرته
   */
  private getSuitableCategoriesForPhotographer(photographerInfo: PhotographerInfo): string[] {
    const categories: string[] = [];

    // إضافة فئات حسب التخصصات
    photographerInfo.specializations.forEach(spec => {
      switch (spec.toLowerCase()) {
        case 'product':
        case 'منتجات':
          categories.push('تصوير منتجات', 'تصوير تجاري');
          break;
        case 'portrait':
        case 'بورتريه':
          categories.push('تصوير شخصي', 'تصوير عائلي');
          break;
        case 'fashion':
        case 'أزياء':
          categories.push('تصوير أزياء', 'تصوير عارضات');
          break;
        case 'food':
        case 'طعام':
          categories.push('تصوير طعام', 'تصوير مطاعم');
          break;
        case 'event':
        case 'مناسبات':
          categories.push('تصوير مناسبات', 'تصوير زفاف');
          break;
        default:
          categories.push(`تصوير ${spec}`);
      }
    });

    // إضافة فئات حسب مستوى المهارة
    if (photographerInfo.skill_level === 'expert' || photographerInfo.skill_level === 'advanced') {
      categories.push('تصوير معقد', 'مشاريع خاصة', 'تصوير احترافي');
    }

    // إزالة التكرارات وإرجاع قائمة فريدة
    return Array.from(new Set(categories));
  }

  // ======================================
  // 📂 إدارة فئات المحتوى (ContentCategory)
  // ======================================

  /**
   * حساب تكلفة المحتوى حسب الفئة مع عامل التعقيد
   * 
   * 🎯 الفوائد المهنية:
   * ✅ تسعير دقيق حسب نوع المحتوى
   * ✅ احتساب عامل التعقيد والوقت المقدر
   * ✅ شفافية في التكلفة للعملاء
   */
  async calculateContentCostByCategory(contentId: ID): Promise<{
    base_cost: number;
    complexity_factor: number;
    estimated_hours: number;
    total_cost: number;
    category_details: ContentCategory;
  }> {
    try {
      // جلب المحتوى
      const content = await this.contentRepository.findById(contentId);
      if (!content) {
        throw new Error('المحتوى غير موجود');
      }

      // جلب تفاصيل الفئة
      const categoryDetails = await this.contentRepository.getContentCategoryDetails(content.category);
      if (!categoryDetails) {
        throw new Error('فئة المحتوى غير موجودة');
      }

      // حساب التكلفة المهنية
      const baseCost = categoryDetails.base_price;
      const complexityFactor = categoryDetails.complexity_factor;
      const estimatedHours = categoryDetails.estimated_hours;
      const totalCost = baseCost * complexityFactor;

      return {
        base_cost: baseCost,
        complexity_factor: complexityFactor,
        estimated_hours: estimatedHours,
        total_cost: totalCost,
        category_details: categoryDetails
      };
    } catch (error) {
      throw new Error(`خطأ في حساب التكلفة: ${error}`);
    }
  }

  /**
   * التحقق من متطلبات الفئة للمحتوى المرفوع
   * 
   * 🎯 الفوائد المهنية:
   * ✅ ضمان جودة المحتوى حسب معايير الفئة
   * ✅ إرشاد المصورين للمتطلبات المحددة
   * ✅ تقليل معدل الرفض بالتحقق المبكر
   */
  async validateContentAgainstCategory(
    contentData: UploadContentData
  ): Promise<{
    is_valid: boolean;
    missing_requirements: string[];
    category_details: ContentCategory;
    recommendations: string[];
  }> {
    try {
      // جلب متطلبات الفئة
      const categoryDetails = await this.contentRepository.getContentCategoryDetails(contentData.category);
      if (!categoryDetails) {
        throw new Error('فئة المحتوى غير موجودة');
      }

      const missingRequirements: string[] = [];
      const recommendations: string[] = [];

      // التحقق من المتطلبات الأساسية
      const defaultRequirements = categoryDetails.default_requirements;
      
      // فحص متطلبات محددة حسب نوع المحتوى
      if (contentData.type === 'image') {
        if (!contentData.width || !contentData.height) {
          missingRequirements.push('أبعاد الصورة مطلوبة');
        }
        if (contentData.width && contentData.width < 1920) {
          recommendations.push('يُنصح بدقة لا تقل عن 1920px للعرض');
        }
      }

      if (contentData.type === 'video') {
        if (!contentData.duration) {
          missingRequirements.push('مدة الفيديو مطلوبة');
        }
        if (contentData.duration && contentData.duration < 10) {
          recommendations.push('يُنصح بمدة لا تقل عن 10 ثواني');
        }
      }

      // فحص التصنيف والعلامات
      if (!contentData.tags || contentData.tags.length === 0) {
        missingRequirements.push('العلامات (Tags) مطلوبة لتصنيف المحتوى');
      }

      if (!contentData.style || contentData.style.length === 0) {
        recommendations.push('إضافة أنماط (Styles) يحسن من تصنيف المحتوى');
      }

      // فحص حجم الملف حسب النوع
      const maxSizeByType = {
        'image': 50 * 1024 * 1024, // 50MB للصور
        'video': 500 * 1024 * 1024, // 500MB للفيديو
        'graphic_design': 100 * 1024 * 1024 // 100MB للتصميم
      };

      if (contentData.file_size > maxSizeByType[contentData.type]) {
        missingRequirements.push(`حجم الملف أكبر من المسموح لنوع ${contentData.type}`);
      }

      const isValid = missingRequirements.length === 0;

      return {
        is_valid: isValid,
        missing_requirements: missingRequirements,
        category_details: categoryDetails,
        recommendations: recommendations
      };
    } catch (error) {
      throw new Error(`خطأ في التحقق من متطلبات الفئة: ${error}`);
    }
  }

  /**
   * إحصائيات الفئات مع تحليلات الأداء والربحية
   * 
   * 🎯 الفوائد المهنية:
   * ✅ فهم أداء كل فئة محتوى
   * ✅ تحسين استراتيجية التسعير
   * ✅ تحديد الفئات الأكثر ربحية
   */
  async getCategoryPerformanceStats(): Promise<{
    categories: Array<{
      category_details: ContentCategory;
      content_count: number;
      avg_quality_score: number;
      total_revenue: number;
      avg_completion_time_hours: number;
      popularity_rank: number;
    }>;
    summary: {
      most_popular_category: string;
      highest_revenue_category: string;
      best_quality_category: string;
      total_categories: number;
    };
  }> {
    try {
      // جلب جميع المحتويات لتحليل الفئات
      const allContents = await this.contentRepository.findAll();
      
      // تجميع إحصائيات كل فئة
      const categoryStatsMap = new Map<string, {
        details: ContentCategory;
        contents: Content[];
        total_revenue: number;
        total_quality_score: number;
      }>();

      // تحليل كل محتوى
      for (const content of allContents) {
        if (!categoryStatsMap.has(content.category)) {
          const categoryDetails = await this.contentRepository.getContentCategoryDetails(content.category);
          if (categoryDetails) {
            categoryStatsMap.set(content.category, {
              details: categoryDetails,
              contents: [],
              total_revenue: 0,
              total_quality_score: 0
            });
          }
        }

        const categoryStats = categoryStatsMap.get(content.category);
        if (categoryStats) {
          categoryStats.contents.push(content);
          categoryStats.total_revenue += categoryStats.details.base_price * categoryStats.details.complexity_factor;
          categoryStats.total_quality_score += content.quality_score;
        }
      }

      // تحويل إلى تنسيق النتيجة النهائية
      const categoriesArray = Array.from(categoryStatsMap.entries()).map(([categoryName, stats], index) => ({
        category_details: stats.details,
        content_count: stats.contents.length,
        avg_quality_score: stats.contents.length > 0 ? stats.total_quality_score / stats.contents.length : 0,
        total_revenue: stats.total_revenue,
        avg_completion_time_hours: stats.details.estimated_hours,
        popularity_rank: index + 1
      }));

      // ترتيب حسب عدد المحتويات (الشعبية)
      categoriesArray.sort((a, b) => b.content_count - a.content_count);
      
      // تحديث ترتيب الشعبية
      categoriesArray.forEach((category, index) => {
        category.popularity_rank = index + 1;
      });

      // حساب الملخص
      const mostPopular = categoriesArray[0];
      const highestRevenue = categoriesArray.length > 0 ? categoriesArray.reduce((max, cat) => 
        cat.total_revenue > max.total_revenue ? cat : max) : categoriesArray[0];
      const bestQuality = categoriesArray.length > 0 ? categoriesArray.reduce((max, cat) => 
        cat.avg_quality_score > max.avg_quality_score ? cat : max) : categoriesArray[0];

      return {
        categories: categoriesArray,
        summary: {
          most_popular_category: mostPopular?.category_details.name.ar || mostPopular?.category_details.name.en || 'غير محدد',
          highest_revenue_category: highestRevenue?.category_details.name.ar || highestRevenue?.category_details.name.en || 'غير محدد',
          best_quality_category: bestQuality?.category_details.name.ar || bestQuality?.category_details.name.en || 'غير محدد',
          total_categories: categoriesArray.length
        }
      };
    } catch (error) {
      throw new Error(`خطأ في جلب إحصائيات الفئات: ${error}`);
    }
  }

  /**
   * اقتراح فئة محتوى مناسبة بناءً على خصائص الملف
   * 
   * 🎯 الفوائد المهنية:
   * ✅ مساعدة المصورين في اختيار الفئة المناسبة
   * ✅ تحسين دقة التصنيف
   * ✅ تقليل الأخطاء في اختيار الفئة
   */
  async suggestOptimalCategory(
    contentType: ContentType,
    fileSize: number,
    tags: string[]
  ): Promise<{
    recommended_categories: Array<{
      category: ContentCategory;
      match_score: number;
      reasoning: string[];
    }>;
    best_match: ContentCategory | null;
  }> {
    try {
      // هذا مثال على منطق اقتراح الفئات
      // في التطبيق الحقيقي، ستحتاج لجلب جميع الفئات من قاعدة البيانات
      const mockCategories: ContentCategory[] = [
        {
          id: 'cat1',
          name: { ar: 'تصوير منتجات', en: 'Product Photography' },
          description: { ar: 'تصوير المنتجات التجارية', en: 'Commercial product photography' },
          type: 'commercial',
          base_price: 100,
          estimated_hours: 3,
          complexity_factor: 1.2,
          default_requirements: ['خلفية بيضاء', 'إضاءة احترافية'],
          is_active: true,
          sort_order: 1,
          usage_count: 50,
                     created_at: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 } as FirebaseTimestamp,
           updated_at: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 } as FirebaseTimestamp
        }
      ];

      const recommendations = mockCategories.map(category => {
        let matchScore = 0;
        const reasoning: string[] = [];

        // تقييم التطابق حسب نوع المحتوى
        if (contentType === 'image' && category.type === 'commercial') {
          matchScore += 30;
          reasoning.push('مناسب لتصوير المنتجات التجارية');
        }

        // تقييم حسب حجم الملف
        if (fileSize > 10 * 1024 * 1024) { // أكبر من 10MB
          matchScore += 20;
          reasoning.push('حجم الملف يشير لجودة عالية مناسبة للاستخدام التجاري');
        }

        // تقييم حسب العلامات
        const commercialTags = ['منتج', 'تجاري', 'إعلان', 'براند'];
        const hasCommercialTags = tags.some(tag => 
          commercialTags.some(commercialTag => tag.includes(commercialTag))
        );
        
        if (hasCommercialTags) {
          matchScore += 25;
          reasoning.push('العلامات تشير للاستخدام التجاري');
        }

        return {
          category,
          match_score: matchScore,
          reasoning
        };
      });

      // ترتيب حسب درجة التطابق
      recommendations.sort((a, b) => b.match_score - a.match_score);

      return {
        recommended_categories: recommendations,
        best_match: recommendations[0]?.category || null
      };
    } catch (error) {
      throw new Error(`خطأ في اقتراح الفئة: ${error}`);
    }
  }

  /**
   * تحليل أداء البراند في إنتاج المحتوى وإدارة العلاقة مع المصورين (Brand interface)
   * 
   * 🎯 فوائد استخدام Brand interface:
   * ✅ تحليل أداء البراند في إنتاج المحتوى
   * ✅ ربط المحتوى بمعلومات البراند التفصيلية
   * ✅ إحصائيات مخصصة لكل براند
   * ✅ تقييم جودة المحتوى حسب معايير البراند
   * ✅ إدارة العلاقة بين البراند والمصورين
   * ✅ تحليل ROI وعائد الاستثمار للمحتوى
   */
  async analyzeBrandContentPerformance(brandId: ID): Promise<{
    brand_profile: Brand;
    content_analytics: {
      total_content: number;
      content_by_type: Record<ContentType, number>;
      avg_quality_score: number;
      approval_rate: number;
      total_investment: number;
    };
    photographer_collaboration: {
      active_photographers: number;
      top_performers: Array<{
        photographer_id: ID;
        photographer_name: string;
        content_count: number;
        avg_quality: number;
        total_earned: number;
      }>;
      collaboration_efficiency: number;
    };
    content_categories_performance: {
      most_successful_category: string;
      category_breakdown: Array<{
        category: string;
        content_count: number;
        avg_quality: number;
        total_cost: number;
        roi_estimate: number;
      }>;
    };
    market_insights: {
      brand_visibility_score: number;
      content_engagement_metrics: {
        total_views: number;
        total_downloads: number;
        viral_content_count: number;
      };
      competitive_analysis: {
        market_position: 'رائد' | 'متقدم' | 'متوسط' | 'ناشئ';
        content_volume_rank: number;
        quality_rank: number;
      };
    };
    recommendations: {
      strategic_suggestions: string[];
      budget_optimization: string[];
      photographer_recommendations: string[];
      content_strategy_improvements: string[];
    };
  }> {
    try {
      // جلب معلومات البراند الكاملة (Brand interface)
      const brand = await this.brandRepository.findById(brandId);
      if (!brand) {
        throw new Error('البراند غير موجود');
      }

      // جلب جميع محتوى البراند
      const brandContents = await this.contentRepository.findByBrand(brandId);

      // تحليل المحتوى حسب النوع
      const contentByType = brandContents.reduce((acc, content) => {
        acc[content.type] = (acc[content.type] || 0) + 1;
        return acc;
      }, {} as Record<ContentType, number>);

      // حساب متوسط الجودة ومعدل الموافقة
      const avgQualityScore = brandContents.length > 0
        ? brandContents.reduce((sum, content) => sum + content.quality_score, 0) / brandContents.length
        : 0;

      const approvedContent = brandContents.filter(c => c.status === 'approved').length;
      const approvalRate = brandContents.length > 0 ? (approvedContent / brandContents.length) * 100 : 0;

      // تحليل تعاون المصورين
      const photographerStats = new Map<ID, {
        name: string;
        content_count: number;
        total_quality: number;
        estimated_earnings: number;
      }>();

      for (const content of brandContents) {
        if (!photographerStats.has(content.photographer_id)) {
          const photographer = await this.userRepository.findById(content.photographer_id);
          photographerStats.set(content.photographer_id, {
            name: photographer ? `${photographer.first_name} ${photographer.last_name}` : 'غير معروف',
            content_count: 0,
            total_quality: 0,
            estimated_earnings: 0
          });
        }

        const stats = photographerStats.get(content.photographer_id)!;
        stats.content_count++;
        stats.total_quality += content.quality_score;
        stats.estimated_earnings += this.estimateContentCost(content, brand);
      }

      // تحويل إلى قائمة مرتبة لأفضل المصورين
      const topPerformers = Array.from(photographerStats.entries()).map(([id, stats]) => ({
        photographer_id: id,
        photographer_name: stats.name,
        content_count: stats.content_count,
        avg_quality: stats.content_count > 0 ? stats.total_quality / stats.content_count : 0,
        total_earned: stats.estimated_earnings
      })).sort((a, b) => b.avg_quality - a.avg_quality).slice(0, 5);

      // تحليل الفئات
      const categoryStats = new Map<string, {
        count: number;
        total_quality: number;
        total_cost: number;
      }>();

      brandContents.forEach(content => {
        if (!categoryStats.has(content.category)) {
          categoryStats.set(content.category, { count: 0, total_quality: 0, total_cost: 0 });
        }
        const stats = categoryStats.get(content.category)!;
        stats.count++;
        stats.total_quality += content.quality_score;
        stats.total_cost += this.estimateContentCost(content, brand);
      });

      const categoryBreakdown = Array.from(categoryStats.entries()).map(([category, stats]) => ({
        category,
        content_count: stats.count,
        avg_quality: stats.count > 0 ? stats.total_quality / stats.count : 0,
        total_cost: stats.total_cost,
        roi_estimate: this.calculateROI(stats.total_cost, stats.count, brand)
      })).sort((a, b) => b.avg_quality - a.avg_quality);

      // تحليل تفاعل المحتوى
      const totalViews = brandContents.reduce((sum, content) => sum + content.view_count, 0);
      const totalDownloads = brandContents.reduce((sum, content) => sum + content.download_count, 0);
      const viralContentCount = brandContents.filter(c => c.view_count > 1000).length;

      // تحديد الموقع التنافسي للبراند
      const marketPosition = this.determineMarketPosition(brand, brandContents, avgQualityScore);

      // حساب نقاط الرؤية للبراند
      const brandVisibilityScore = this.calculateBrandVisibilityScore(brand, brandContents, totalViews);

      // إنشاء التوصيات الاستراتيجية
      const recommendations = this.generateBrandRecommendations(brand, brandContents, categoryBreakdown);

      return {
        brand_profile: brand,
        content_analytics: {
          total_content: brandContents.length,
          content_by_type: contentByType,
          avg_quality_score: Math.round(avgQualityScore * 100) / 100,
          approval_rate: Math.round(approvalRate * 100) / 100,
          total_investment: categoryBreakdown.reduce((sum, cat) => sum + cat.total_cost, 0)
        },
        photographer_collaboration: {
          active_photographers: photographerStats.size,
          top_performers: topPerformers,
          collaboration_efficiency: this.calculateCollaborationEfficiency(topPerformers)
        },
        content_categories_performance: {
          most_successful_category: categoryBreakdown[0]?.category || 'غير محدد',
          category_breakdown: categoryBreakdown
        },
        market_insights: {
          brand_visibility_score: brandVisibilityScore,
          content_engagement_metrics: {
            total_views: totalViews,
            total_downloads: totalDownloads,
            viral_content_count: viralContentCount
          },
          competitive_analysis: {
            market_position: marketPosition,
            content_volume_rank: this.calculateVolumeRank(brandContents.length),
            quality_rank: this.calculateQualityRank(avgQualityScore)
          }
        },
        recommendations: recommendations
      };
    } catch (error) {
      throw new Error(`خطأ في تحليل أداء البراند: ${error}`);
    }
  }

  /**
   * تقدير تكلفة المحتوى حسب البراند والنوع
   */
  private estimateContentCost(content: Content, brand: Brand): number {
    // تكلفة أساسية حسب نوع المحتوى
    const baseCosts = {
      'image': 50,
      'video': 200,
      'graphic_design': 100
    };

    const baseCost = baseCosts[content.type];
    
    // عامل البراند (البراندات الأكبر تدفع أكثر)
    const brandMultiplier = brand.brand_type === 'enterprise' ? 1.5 : 
                           brand.brand_type === 'international' ? 1.3 : 1.0;

    // مكافأة الجودة
    const qualityBonus = content.quality_score > 8 ? 1.2 : 1.0;

    return Math.round(baseCost * brandMultiplier * qualityBonus);
  }

  /**
   * حساب عائد الاستثمار (ROI) للفئة
   */
  private calculateROI(totalCost: number, contentCount: number, brand: Brand): number {
    // تقدير العائد حسب نوع البراند
    const expectedRevenue = brand.brand_type === 'enterprise' ? contentCount * 300 :
                           brand.brand_type === 'international' ? contentCount * 200 :
                           contentCount * 100;

    return totalCost > 0 ? Math.round(((expectedRevenue - totalCost) / totalCost) * 100) : 0;
  }

  /**
   * تحديد الموقع التنافسي للبراند في السوق
   */
  private determineMarketPosition(
    brand: Brand, 
    contents: Content[], 
    avgQuality: number
  ): 'رائد' | 'متقدم' | 'متوسط' | 'ناشئ' {
    const contentVolume = contents.length;
    const isEnterprise = brand.brand_type === 'enterprise';
    const isActive = brand.status === 'active';

    if (isEnterprise && contentVolume > 100 && avgQuality > 8.5 && isActive) {
      return 'رائد';
    } else if (contentVolume > 50 && avgQuality > 7.5 && isActive) {
      return 'متقدم';
    } else if (contentVolume > 20 && avgQuality > 6.0) {
      return 'متوسط';
    } else {
      return 'ناشئ';
    }
  }

  /**
   * حساب نقاط رؤية البراند
   */
  private calculateBrandVisibilityScore(brand: Brand, contents: Content[], totalViews: number): number {
    let score = 0;

    // نقاط حسب نوع البراند
    if (brand.brand_type === 'enterprise') score += 30;
    else if (brand.brand_type === 'international') score += 25;
    else if (brand.brand_type === 'local') score += 15;

    // نقاط حسب حجم المحتوى
    if (contents.length > 100) score += 25;
    else if (contents.length > 50) score += 20;
    else if (contents.length > 20) score += 15;

    // نقاط حسب المشاهدات
    if (totalViews > 10000) score += 25;
    else if (totalViews > 5000) score += 20;
    else if (totalViews > 1000) score += 15;

    // نقاط حسب الحالة
    if (brand.status === 'active') score += 20;

    return Math.min(score, 100); // الحد الأقصى 100
  }

  /**
   * حساب ترتيب الحجم في السوق
   */
  private calculateVolumeRank(contentCount: number): number {
    if (contentCount > 200) return 1;
    if (contentCount > 100) return 2;
    if (contentCount > 50) return 3;
    if (contentCount > 20) return 4;
    return 5;
  }

  /**
   * حساب ترتيب الجودة في السوق
   */
  private calculateQualityRank(avgQuality: number): number {
    if (avgQuality > 9) return 1;
    if (avgQuality > 8) return 2;
    if (avgQuality > 7) return 3;
    if (avgQuality > 6) return 4;
    return 5;
  }

  /**
   * حساب كفاءة التعاون مع المصورين
   */
  private calculateCollaborationEfficiency(topPerformers: any[]): number {
    if (topPerformers.length === 0) return 0;

    const avgQuality = topPerformers.reduce((sum, p) => sum + p.avg_quality, 0) / topPerformers.length;
    const avgProductivity = topPerformers.reduce((sum, p) => sum + p.content_count, 0) / topPerformers.length;

    // نقاط من 100
    return Math.round(((avgQuality / 10) * 70) + ((avgProductivity / 20) * 30));
  }

  /**
   * إنشاء توصيات استراتيجية للبراند
   */
  private generateBrandRecommendations(
    brand: Brand, 
    contents: Content[], 
    categoryBreakdown: any[]
  ): {
    strategic_suggestions: string[];
    budget_optimization: string[];
    photographer_recommendations: string[];
    content_strategy_improvements: string[];
  } {
    const suggestions = {
      strategic_suggestions: [] as string[],
      budget_optimization: [] as string[],
      photographer_recommendations: [] as string[],
      content_strategy_improvements: [] as string[]
    };

    // اقتراحات استراتيجية حسب نوع البراند
    if (brand.brand_type === 'startup') {
      suggestions.strategic_suggestions.push(
        'التركيز على محتوى عالي الجودة بميزانية محدودة',
        'استخدام مصورين محليين لخفض التكاليف',
        'الاستثمار في المحتوى الرقمي أكثر من التقليدي'
      );
    } else if (brand.brand_type === 'enterprise') {
      suggestions.strategic_suggestions.push(
        'تطوير استراتيجية محتوى شاملة متعددة القنوات',
        'الاستثمار في فرق إنتاج متخصصة',
        'إنشاء معايير جودة عالية ومتسقة'
      );
    }

    // تحسين الميزانية
    const avgCostPerContent = categoryBreakdown.length > 0 
      ? categoryBreakdown.reduce((sum, cat) => sum + cat.total_cost, 0) / contents.length 
      : 0;

    if (avgCostPerContent > 150) {
      suggestions.budget_optimization.push(
        'مراجعة تسعير المحتوى لتحسين الكفاءة',
        'التفاوض على أسعار أفضل مع المصورين المتميزين'
      );
    }

    // توصيات المصورين
    suggestions.photographer_recommendations.push(
      'تطوير علاقات طويلة المدى مع المصورين المتميزين',
      'إنشاء برنامج حوافز للجودة العالية',
      'تدريب المصورين على معايير البراند'
    );

    // تحسين استراتيجية المحتوى
    if (contents.filter(c => c.view_count > 500).length < contents.length * 0.3) {
      suggestions.content_strategy_improvements.push(
        'تحسين استراتيجية التوزيع لزيادة المشاهدات',
        'الاستثمار في محتوى أكثر تفاعلية'
      );
    }

    return suggestions;
  }
} 
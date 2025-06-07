/**
 * 🎨 Content Controller - API للمحتوى
 * ======================================
 * 
 * 📅 محدث: ديسمبر 2024
 * 👨‍💻 المطور: علي جودت
 * 🎯 الهدف: HTTP endpoints للمحتوى بأنواع محكمة 100% مع استخدام احترافي للـ ContentValidators
 */

import { Request, Response } from "express";
import { ContentService } from "../services/ContentService";
import { ContentType, ContentApprovalStatus } from "../../../types/src/core/enums";
import { ID, FirebaseTimestamp } from "../../../types/src/core/base";
import { logger } from "firebase-functions";

// استيراد جميع validators والـ types من ContentValidators
import {
  validateUploadContent,
  validateGetContent,
  validateSearchContent,
  validateContentParams,
  validateApproveContent,
  validateRejectContent,
  validateRequestRevision,
  validateClientRating,
  validateCreateContentCategory,
  validateSuggestCategory,
  validateUserParams,
  validatePhotographerParams,
  validateBrandParams,
  UploadContentInput,
  GetContentInput,
  SearchContentInput,
  ApproveContentInput,
  RejectContentInput,
  RequestRevisionInput,
  ClientRatingInput,
  CreateContentCategoryInput,
  SuggestCategoryInput
} from '../validators/ContentValidators';

// ======================================
// 🎯 أنواع متوافقة مع ContentService
// ======================================

/**
 * بيانات رفع المحتوى متوافقة مع ContentService
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
 * خيارات البحث متوافقة مع ContentService
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
 * 🎨 تحكم المحتوى مع استخدام احترافي للـ validators
 */
export class ContentController {
  private contentService: ContentService;

  constructor(contentService: ContentService) {
    this.contentService = contentService;
  }

  /**
   * 📋 إرجاع جميع المتحققات للاستخدام في الـ router
   */
  static getValidators() {
    return {
      validateUploadContent,
      validateGetContent,
      validateSearchContent,
      validateContentParams,
      validateApproveContent,
      validateRejectContent,
      validateRequestRevision,
      validateClientRating,
      validateCreateContentCategory,
      validateSuggestCategory,
      validateUserParams,
      validatePhotographerParams,
      validateBrandParams
    };
  }

  /**
   * 📤 رفع محتوى جديد
   * POST /api/content
   * يستخدم validateUploadContent middleware
   */
  async uploadContent(req: Request, res: Response): Promise<void> {
    try {
      // البيانات متحققة مسبقاً من validateUploadContent middleware
      const body = req.body as UploadContentInput;

      // تحضير بيانات الرفع متوافقة مع ContentService
      const uploadData: UploadContentData = {
        title: body.title,
        description: body.description,
        type: body.type,
        brand_id: body.brand_id,
        photographer_id: body.photographer_id,
        ...(body.campaign_id && { campaign_id: body.campaign_id }),
        ...(body.task_id && { task_id: body.task_id }),
        filename: body.file_info.filename,
        file_size: body.file_info.file_size,
        file_format: body.file_info.file_format,
        file_url: body.file_info.file_url,
        ...(body.file_info.thumbnail_url && { thumbnail_url: body.file_info.thumbnail_url }),
        ...(body.file_info.width && { width: body.file_info.width }),
        ...(body.file_info.height && { height: body.file_info.height }),
        ...(body.file_info.duration && { duration: body.file_info.duration }),
        category: body.classification.category,
        tags: body.classification.tags,
        style: body.classification.style,
        usage_type: body.usage_type,
        ...(body.shooting_location && { shooting_location: body.shooting_location }),
        ...(body.shooting_date && { shooting_date: new Date(body.shooting_date) as any }),
        ...(body.license_expiry && { license_expiry: new Date(body.license_expiry) as any })
      };

      const content = await this.contentService.uploadContent(uploadData, body.photographer_id);

      res.status(201).json({
        success: true,
        message: "تم رفع المحتوى بنجاح",
        data: content
      });

      logger.info("🎨 Content uploaded via API", { 
        contentId: content.id, 
        title: content.title,
        type: content.type,
        photographer_id: content.photographer_id
      });
    } catch (error) {
      logger.error("❌ Error in uploadContent controller", error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Internal server error"
      });
    }
  }

  /**
   * 📄 جلب محتوى محدد
   * GET /api/content/:contentId
   * يستخدم validateContentParams middleware
   */
  async getContentById(req: Request, res: Response): Promise<void> {
    try {
      // معرف المحتوى متحقق مسبقاً من validateContentParams middleware
      const { contentId } = req.params as { contentId: ID };

      // البحث في الـ ContentService Repository
      const content = await this.contentService['contentRepository'].findById(contentId);

      if (!content) {
        res.status(404).json({
          success: false,
          message: "المحتوى غير موجود"
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: content
      });

      logger.info("📄 Content retrieved via API", { contentId });
    } catch (error) {
      logger.error("❌ Error in getContentById controller", error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Internal server error"
      });
    }
  }

  /**
   * GET /api/content - البحث عن محتوى
   * يستخدم validateGetContent middleware
   */
  async getContent(req: Request, res: Response): Promise<void> {
    try {
      // معايير البحث متحققة مسبقاً من validateGetContent middleware
      const query = req.query as GetContentInput;

      let content = null;

      if (query.id) {
        content = await this.contentService['contentRepository'].findById(query.id);
      } else if (query.brand_id) {
        const contents = await this.contentService['contentRepository'].findByBrand(query.brand_id);
        content = contents[0] || null;
      } else if (query.photographer_id) {
        const contents = await this.contentService['contentRepository'].findByPhotographer(query.photographer_id);
        content = contents[0] || null;
      } else if (query.campaign_id) {
        const contents = await this.contentService['contentRepository'].findByCampaign(query.campaign_id);
        content = contents[0] || null;
      } else if (query.title) {
        const contents = await this.contentService['contentRepository'].searchByText(query.title, 1);
        content = contents[0] || null;
      }

      if (!content) {
        res.status(404).json({
          success: false,
          message: "لم يتم العثور على محتوى يطابق المعايير المحددة"
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: content
      });

    } catch (error) {
      logger.error("❌ Error in getContent controller", error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Internal server error"
      });
    }
  }

  /**
   * ✅ الموافقة على محتوى
   * PATCH /api/content/:contentId/approve
   * يستخدم validateContentParams و validateApproveContent middleware
   */
  async approveContent(req: Request, res: Response): Promise<void> {
    try {
      // البيانات متحققة مسبقاً من middleware
      const { contentId } = req.params as { contentId: ID };
      const body = req.body as ApproveContentInput;

      const result = await this.contentService.approveContent(
        contentId,
        body.approved_by,
        body.quality_score,
        body.notes
      );

      res.status(200).json({
        success: true,
        message: "تم الموافقة على المحتوى بنجاح",
        data: result.content
      });

      logger.info("✅ Content approved via API", { 
        contentId, 
        approvedBy: body.approved_by,
        qualityScore: body.quality_score
      });
    } catch (error) {
      logger.error("❌ Error in approveContent controller", error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Internal server error"
      });
    }
  }

  /**
   * ❌ رفض المحتوى
   * PATCH /api/content/:contentId/reject
   * يستخدم validateContentParams و validateRejectContent middleware
   */
  async rejectContent(req: Request, res: Response): Promise<void> {
    try {
      // البيانات متحققة مسبقاً من middleware
      const { contentId } = req.params as { contentId: ID };
      const body = req.body as RejectContentInput;

      // تحويل suggestions من string إلى string[] إذا لزم الأمر
      const suggestions = Array.isArray(body.suggestions) 
        ? body.suggestions 
        : body.suggestions ? [body.suggestions] : undefined;

      const result = await this.contentService.rejectContent(
        contentId,
        body.rejected_by,
        body.rejection_reason,
        suggestions
      );

      res.status(200).json({
        success: true,
        message: "تم رفض المحتوى",
        data: result.content
      });

      logger.info("❌ Content rejected via API", { 
        contentId, 
        rejectedBy: body.rejected_by,
        reason: body.rejection_reason
      });
    } catch (error) {
      logger.error("❌ Error in rejectContent controller", error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Internal server error"
      });
    }
  }

  /**
   * 🔄 طلب تعديل على المحتوى
   * PATCH /api/content/:contentId/request-revision
   * يستخدم validateContentParams و validateRequestRevision middleware
   */
  async requestRevision(req: Request, res: Response): Promise<void> {
    try {
      // البيانات متحققة مسبقاً من middleware
      const { contentId } = req.params as { contentId: ID };
      const body = req.body as RequestRevisionInput;

      // تحضير RevisionRequest متوافق مع ContentService  
      const revisionData = {
        content_id: contentId,
        requested_by: body.requested_by,
        revision_notes: body.revision_notes,
        priority: body.priority === 'urgent' ? 'high' : body.priority,
        deadline: body.due_date ? new Date(body.due_date) as any : undefined
      };

      const result = await this.contentService.requestRevision(revisionData);

      res.status(200).json({
        success: true,
        message: "تم طلب التعديل بنجاح",
        data: result.content
      });

      logger.info("🔄 Content revision requested via API", { 
        contentId, 
        requestedBy: body.requested_by,
        priority: body.priority
      });
    } catch (error) {
      logger.error("❌ Error in requestRevision controller", error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Internal server error"
      });
    }
  }

  /**
   * ⭐ تقييم العميل للمحتوى (تم تعطيله مؤقتاً)
   * POST /api/content/:contentId/rate
   * يستخدم validateContentParams و validateClientRating middleware
   */
  async rateContent(req: Request, res: Response): Promise<void> {
    try {
      // البيانات متحققة مسبقاً من middleware
      const { contentId } = req.params as { contentId: ID };
      const body = req.body as ClientRatingInput;

      // نظراً لعدم وجود rateContent في ContentService، نستخدم updateClientRating من Repository
      const content = await this.contentService['contentRepository'].updateClientRating(
        contentId,
        body.rating
      );

      res.status(200).json({
        success: true,
        message: "تم تقييم المحتوى بنجاح",
        data: content
      });

      logger.info("⭐ Content rated via API", { 
        contentId, 
        ratedBy: body.rated_by,
        rating: body.rating
      });
    } catch (error) {
      logger.error("❌ Error in rateContent controller", error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Internal server error"
      });
    }
  }

  /**
   * 🔍 البحث المتقدم في المحتوى
   * GET /api/content/search
   * يستخدم validateSearchContent middleware
   */
  async searchContent(req: Request, res: Response): Promise<void> {
    try {
      // معايير البحث متحققة ومحولة مسبقاً من validateSearchContent middleware
      const query: SearchContentInput = req.query as any;

      // تحويل معايير البحث للنوع المطلوب من ContentService
      const searchOptions: ContentServiceSearchOptions = {};
      
      if (query.brand_id) searchOptions.brandId = query.brand_id;
      if (query.photographer_id) searchOptions.photographerId = query.photographer_id;
      if (query.campaign_id) searchOptions.campaignId = query.campaign_id;
      if (query.type) searchOptions.type = query.type;
      if (query.status) searchOptions.status = query.status;
      if (query.category) searchOptions.category = query.category;
      if (query.tags) searchOptions.tags = query.tags;
      if (query.usage_type) searchOptions.usageType = query.usage_type;
      if (query.search || query.searchTerm) searchOptions.textSearch = query.search || query.searchTerm || '';
      if (query.limit) searchOptions.limit = query.limit;
      if (query.shooting_date_from) searchOptions.startDate = new Date(query.shooting_date_from) as any;
      if (query.shooting_date_to) searchOptions.endDate = new Date(query.shooting_date_to) as any;

      const result = await this.contentService.searchContent(searchOptions);

      res.status(200).json({
        success: true,
        data: result.contents,
        meta: {
          total: result.total_count,
          page: query.page || 1,
          limit: query.limit || 10,
          search_metadata: result.search_metadata
        }
      });

    } catch (error) {
      logger.error("❌ Error in searchContent controller", error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Internal server error"
      });
    }
  }

  /**
   * 📊 إحصائيات المحتوى
   * GET /api/content/stats
   */
  async getContentStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await this.contentService.getContentStats();

      res.status(200).json({
        success: true,
        data: stats
      });

    } catch (error) {
      logger.error("❌ Error in getContentStats controller", error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Internal server error"
      });
    }
  }

  /**
   * 👤 نشاط محتوى المستخدم
   * GET /api/users/:userId/content-activity
   * يستخدم validateUserParams middleware
   */
  async getUserContentActivity(req: Request, res: Response): Promise<void> {
    try {
      // معرف المستخدم متحقق مسبقاً من validateUserParams middleware
      const { userId } = req.params as { userId: ID };

      const activity = await this.contentService.analyzeUserContentActivity(userId);

      res.status(200).json({
        success: true,
        data: activity
      });

    } catch (error) {
      logger.error("❌ Error in getUserContentActivity controller", error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Internal server error"
      });
    }
  }

  /**
   * 📸 أداء المصور
   * GET /api/photographers/:photographerId/performance
   * يستخدم validatePhotographerParams middleware
   */
  async getPhotographerPerformance(req: Request, res: Response): Promise<void> {
    try {
      // معرف المصور متحقق مسبقاً من validatePhotographerParams middleware
      const { photographerId } = req.params as { photographerId: ID };

      const performance = await this.contentService.evaluatePhotographerPerformance(photographerId);

      res.status(200).json({
        success: true,
        data: performance
      });

    } catch (error) {
      logger.error("❌ Error in getPhotographerPerformance controller", error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Internal server error"
      });
    }
  }

  /**
   * 🏢 أداء محتوى البراند
   * GET /api/brands/:brandId/content-performance
   * يستخدم validateBrandParams middleware
   */
  async getBrandContentPerformance(req: Request, res: Response): Promise<void> {
    try {
      // معرف البراند متحقق مسبقاً من validateBrandParams middleware
      const { brandId } = req.params as { brandId: ID };

      const performance = await this.contentService.analyzeBrandContentPerformance(brandId);

      res.status(200).json({
        success: true,
        data: performance
      });

    } catch (error) {
      logger.error("❌ Error in getBrandContentPerformance controller", error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Internal server error"
      });
    }
  }

  /**
   * 📊 إحصائيات الفئات
   * GET /api/content/category-stats
   */
  async getCategoryStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await this.contentService.getCategoryPerformanceStats();

      res.status(200).json({
        success: true,
        data: stats
      });

    } catch (error) {
      logger.error("❌ Error in getCategoryStats controller", error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Internal server error"
      });
    }
  }

  /**
   * 🎯 اقتراح فئة للمحتوى
   * POST /api/content/suggest-category
   * يستخدم validateSuggestCategory middleware
   */
  async suggestCategory(req: Request, res: Response): Promise<void> {
    try {
      // البيانات متحققة مسبقاً من validateSuggestCategory middleware
      const body = req.body as SuggestCategoryInput;

      const suggestion = await this.contentService.suggestOptimalCategory(
        body.content_type,
        body.file_properties?.file_size || 0,
        body.photographer_specializations || []
      );

      res.status(200).json({
        success: true,
        message: "تم اقتراح الفئة بنجاح",
        data: suggestion
      });

    } catch (error) {
      logger.error("❌ Error in suggestCategory controller", error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Internal server error"
      });
    }
  }

  /**
   * 💰 حساب تكلفة المحتوى
   * POST /api/content/calculate-cost
   * يستخدم validateCreateContentCategory middleware
   */
  async getContentCost(req: Request, res: Response): Promise<void> {
    try {
      // البيانات متحققة مسبقاً من validateCreateContentCategory middleware
      const body = req.body as CreateContentCategoryInput;

      const cost = await this.contentService['contentRepository'].calculateContentCostByCategory(
        typeof body.name === 'string' ? body.name : body.name.ar,
        body.complexity_factor
      );

      res.status(200).json({
        success: true,
        message: "تم حساب التكلفة بنجاح",
        data: cost
      });

    } catch (error) {
      logger.error("❌ Error in getContentCost controller", error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Internal server error"
      });
    }
  }
} 
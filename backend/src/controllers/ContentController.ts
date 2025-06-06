/**
 * 🎨 Content Controller - API للمحتوى
 * ======================================
 * 
 * 📅 محدث: ديسمبر 2024
 * 👨‍💻 المطور: علي جودت
 * 🎯 الهدف: HTTP endpoints للمحتوى بأنواع محكمة 100%
 */

import { Request, Response } from "express";
import { ContentService } from "../services/ContentService";
import { ContentType, ContentApprovalStatus } from "../../../types/src/core/enums";
import { ID, FirebaseTimestamp } from "../../../types/src/core/base";
import { logger } from "firebase-functions";

/**
 * 🎨 تحكم المحتوى
 */
export class ContentController {
  private contentService: ContentService;

  constructor(contentService: ContentService) {
    this.contentService = contentService;
  }

  /**
   * 📤 رفع محتوى جديد
   * POST /api/content
   */
  async uploadContent(req: Request, res: Response): Promise<void> {
    try {
      const {
        title,
        description,
        type,
        brand_id,
        photographer_id,
        campaign_id,
        task_id,
        filename,
        file_size,
        file_format,
        file_url,
        thumbnail_url,
        width,
        height,
        duration,
        category,
        tags,
        style,
        usage_type,
        shooting_location,
        shooting_date,
        license_expiry,
        uploaded_by
      } = req.body;

      // التحقق من البيانات المطلوبة
      if (!title || !description || !type || !brand_id || !photographer_id || 
          !filename || !file_size || !file_format || !file_url || !category || 
          !tags || !style || !usage_type || !uploaded_by) {
        res.status(400).json({
          success: false,
          message: "Missing required fields",
          required: [
            "title", "description", "type", "brand_id", "photographer_id",
            "filename", "file_size", "file_format", "file_url", "category",
            "tags", "style", "usage_type", "uploaded_by"
          ]
        });
        return;
      }

      // التحقق من صحة النوع
      if (!['image', 'video', 'graphic_design'].includes(type)) {
        res.status(400).json({
          success: false,
          message: "Invalid content type",
          valid_types: ['image', 'video', 'graphic_design']
        });
        return;
      }

      // التحقق من نوع الاستخدام
      if (!['exclusive', 'non_exclusive', 'limited', 'unlimited'].includes(usage_type)) {
        res.status(400).json({
          success: false,
          message: "Invalid usage type",
          valid_types: ['exclusive', 'non_exclusive', 'limited', 'unlimited']
        });
        return;
      }

      // تحضير بيانات الرفع
      const uploadData = {
        title: title.trim(),
        description: description.trim(),
        type: type as ContentType,
        brand_id: brand_id as ID,
        photographer_id: photographer_id as ID,
        ...(campaign_id && { campaign_id: campaign_id as ID }),
        ...(task_id && { task_id: task_id as ID }),
        filename: filename.trim(),
        file_size: Number(file_size),
        file_format: file_format.trim(),
        file_url: file_url.trim(),
        ...(thumbnail_url && { thumbnail_url: thumbnail_url.trim() }),
        ...(width && { width: Number(width) }),
        ...(height && { height: Number(height) }),
        ...(duration && { duration: Number(duration) }),
        category: category.trim(),
        tags: Array.isArray(tags) ? tags.map((tag: string) => tag.trim()) : [],
        style: Array.isArray(style) ? style.map((s: string) => s.trim()) : [],
        usage_type: usage_type as 'exclusive' | 'non_exclusive' | 'limited' | 'unlimited',
        ...(shooting_location && { shooting_location: shooting_location.trim() }),
        ...(shooting_date && { shooting_date: shooting_date as FirebaseTimestamp }),
        ...(license_expiry && { license_expiry: license_expiry as FirebaseTimestamp })
      };

      const content = await this.contentService.uploadContent(uploadData, uploaded_by as ID);

      res.status(201).json({
        success: true,
        message: "Content uploaded successfully",
        data: { content }
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
   * GET /api/content/:id
   */
  async getContentById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // البحث في الـ ContentService (سنحتاج لإضافة method جديد)
      // للحين سنستخدم repository مباشرة
      const content = await this.contentService['contentRepository'].findById(id as ID);

      if (!content) {
        res.status(404).json({
          success: false,
          message: "Content not found"
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: { content }
      });

      logger.info("📄 Content retrieved via API", { contentId: id });
    } catch (error) {
      logger.error("❌ Error in getContentById controller", error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Internal server error"
      });
    }
  }

  /**
   * ✅ الموافقة على محتوى
   * PATCH /api/content/:id/approve
   */
  async approveContent(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { approved_by, quality_score, approval_notes } = req.body;

      if (!approved_by || quality_score === undefined) {
        res.status(400).json({
          success: false,
          message: "Missing required fields",
          required: ["approved_by", "quality_score"]
        });
        return;
      }

      // التحقق من صحة تقييم الجودة
      const score = Number(quality_score);
      if (isNaN(score) || score < 0 || score > 10) {
        res.status(400).json({
          success: false,
          message: "Quality score must be a number between 0 and 10"
        });
        return;
      }

      const result = await this.contentService.approveContent(
        id as ID,
        approved_by as ID,
        score,
        approval_notes
      );

      if (result.success) {
        res.status(200).json({
          success: true,
          message: result.message,
          data: { 
            content: result.content,
            notification_sent: result.notification_sent
          }
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message
        });
      }

      logger.info("✅ Content approval attempted via API", { 
        contentId: id, 
        approved_by, 
        success: result.success 
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
   * ❌ رفض محتوى
   * PATCH /api/content/:id/reject
   */
  async rejectContent(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { rejected_by, rejection_reason, improvement_suggestions } = req.body;

      if (!rejected_by || !rejection_reason) {
        res.status(400).json({
          success: false,
          message: "Missing required fields",
          required: ["rejected_by", "rejection_reason"]
        });
        return;
      }

      const suggestions = improvement_suggestions && Array.isArray(improvement_suggestions) 
        ? improvement_suggestions.map((s: string) => s.trim()).filter(Boolean)
        : undefined;

      const result = await this.contentService.rejectContent(
        id as ID,
        rejected_by as ID,
        rejection_reason.trim(),
        suggestions
      );

      if (result.success) {
        res.status(200).json({
          success: true,
          message: result.message,
          data: { 
            content: result.content,
            notification_sent: result.notification_sent
          }
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message
        });
      }

      logger.info("❌ Content rejection attempted via API", { 
        contentId: id, 
        rejected_by, 
        success: result.success 
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
   * 🔄 طلب تعديل على محتوى
   * PATCH /api/content/:id/revision
   */
  async requestRevision(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { 
        requested_by, 
        revision_notes, 
        priority = 'medium',
        deadline,
        specific_requirements 
      } = req.body;

      if (!requested_by || !revision_notes) {
        res.status(400).json({
          success: false,
          message: "Missing required fields",
          required: ["requested_by", "revision_notes"]
        });
        return;
      }

      // التحقق من صحة الأولوية
      if (!['low', 'medium', 'high'].includes(priority)) {
        res.status(400).json({
          success: false,
          message: "Invalid priority level",
          valid_priorities: ['low', 'medium', 'high']
        });
        return;
      }

      const revisionData = {
        content_id: id as ID,
        requested_by: requested_by as ID,
        revision_notes: revision_notes.trim(),
        priority: priority as 'low' | 'medium' | 'high',
        ...(deadline && { deadline: deadline as FirebaseTimestamp }),
        ...(specific_requirements && Array.isArray(specific_requirements) && {
          specific_requirements: specific_requirements.map((req: string) => req.trim()).filter(Boolean)
        })
      };

      const result = await this.contentService.requestRevision(revisionData);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: result.message,
          data: { 
            content: result.content,
            notification_sent: result.notification_sent
          }
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message
        });
      }

      logger.info("🔄 Content revision requested via API", { 
        contentId: id, 
        requested_by, 
        priority,
        success: result.success 
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
   * 🔍 البحث في المحتوى
   * GET /api/content/search
   */
  async searchContent(req: Request, res: Response): Promise<void> {
    try {
      const {
        brandId,
        photographerId,
        campaignId,
        type,
        status,
        category,
        tags,
        startDate,
        endDate,
        minQualityScore,
        usageType,
        textSearch,
        limit = "20",
        sortBy = "created_at",
        sortOrder = "desc"
      } = req.query;

      // تحضير خيارات البحث
      const searchOptions: any = {
        ...(brandId && { brandId: brandId as ID }),
        ...(photographerId && { photographerId: photographerId as ID }),
        ...(campaignId && { campaignId: campaignId as ID }),
        ...(type && { type: type as ContentType }),
        ...(status && { status: status as ContentApprovalStatus }),
        ...(category && { category: category as string }),
        ...(tags && { 
          tags: Array.isArray(tags) ? tags as string[] : [tags as string]
        }),
        ...(startDate && { startDate: startDate as any }),
        ...(endDate && { endDate: endDate as any }),
        ...(minQualityScore && { minQualityScore: Number(minQualityScore) }),
        ...(usageType && { usageType: usageType as 'exclusive' | 'non_exclusive' | 'limited' | 'unlimited' }),
        ...(textSearch && { textSearch: textSearch as string }),
        limit: Math.min(Number(limit), 100), // حد أقصى 100
        sortBy: sortBy as 'created_at' | 'quality_score' | 'view_count' | 'download_count',
        sortOrder: sortOrder as 'asc' | 'desc'
      };

      const searchResults = await this.contentService.searchContent(searchOptions);

      res.status(200).json({
        success: true,
        data: searchResults
      });

      logger.info("🔍 Content search completed via API", { 
        searchOptions, 
        resultsCount: searchResults.total_count,
        executionTime: searchResults.search_metadata.execution_time_ms
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
        data: { stats }
      });

      logger.info("📊 Content stats retrieved via API", { 
        total_content: stats.total_content,
        total_photographers: stats.top_photographers.length,
        total_brands: stats.top_brands.length
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
   * 👤 تحليل نشاط المستخدم في المحتوى
   * GET /api/content/user/:userId/activity
   */
  async getUserContentActivity(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      const analysis = await this.contentService.analyzeUserContentActivity(userId as ID);

      res.status(200).json({
        success: true,
        data: { analysis }
      });

      logger.info("👤 User content activity analyzed via API", { 
        userId,
        total_interactions: analysis.activity_summary.content_interactions
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
   * 📸 تقييم أداء المصور
   * GET /api/content/photographer/:photographerId/performance
   */
  async getPhotographerPerformance(req: Request, res: Response): Promise<void> {
    try {
      const { photographerId } = req.params;

      const evaluation = await this.contentService.evaluatePhotographerPerformance(photographerId as ID);

      res.status(200).json({
        success: true,
        data: { evaluation }
      });

      logger.info("📸 Photographer performance evaluated via API", { 
        photographerId,
        performance_rating: evaluation.performance_analysis.performance_rating,
        suggested_rate: evaluation.pricing_recommendations.suggested_rate_per_task
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
   * 🏢 تحليل أداء البراند في المحتوى
   * GET /api/content/brand/:brandId/performance
   */
  async getBrandContentPerformance(req: Request, res: Response): Promise<void> {
    try {
      const { brandId } = req.params;

      const analysis = await this.contentService.analyzeBrandContentPerformance(brandId as ID);

      res.status(200).json({
        success: true,
        data: { analysis }
      });

      logger.info("🏢 Brand content performance analyzed via API", { 
        brandId,
        market_position: analysis.market_insights.competitive_analysis.market_position,
        total_investment: analysis.content_analytics.total_investment
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
   * 📂 إحصائيات فئات المحتوى
   * GET /api/content/categories/stats
   */
  async getCategoryStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await this.contentService.getCategoryPerformanceStats();

      res.status(200).json({
        success: true,
        data: { stats }
      });

      logger.info("📂 Category stats retrieved via API", { 
        total_categories: stats.summary.total_categories,
        most_popular: stats.summary.most_popular_category
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
   * 🎯 اقتراح فئة محتوى مناسبة
   * POST /api/content/suggest-category
   */
  async suggestCategory(req: Request, res: Response): Promise<void> {
    try {
      const { content_type, file_size, tags } = req.body;

      if (!content_type || !file_size || !tags) {
        res.status(400).json({
          success: false,
          message: "Missing required fields",
          required: ["content_type", "file_size", "tags"]
        });
        return;
      }

      // التحقق من صحة نوع المحتوى
      if (!['image', 'video', 'graphic_design'].includes(content_type)) {
        res.status(400).json({
          success: false,
          message: "Invalid content type",
          valid_types: ['image', 'video', 'graphic_design']
        });
        return;
      }

      const suggestions = await this.contentService.suggestOptimalCategory(
        content_type as ContentType,
        Number(file_size),
        Array.isArray(tags) ? tags : [tags]
      );

      res.status(200).json({
        success: true,
        data: { suggestions }
      });

      logger.info("🎯 Category suggestion requested via API", { 
        content_type,
        file_size,
        tags_count: Array.isArray(tags) ? tags.length : 1,
        best_match: suggestions.best_match?.name
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
   * 💰 حساب تكلفة المحتوى حسب الفئة
   * GET /api/content/:id/cost
   */
  async getContentCost(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const costAnalysis = await this.contentService.calculateContentCostByCategory(id as ID);

      res.status(200).json({
        success: true,
        data: { cost_analysis: costAnalysis }
      });

      logger.info("💰 Content cost calculated via API", { 
        contentId: id,
        total_cost: costAnalysis.total_cost,
        category: costAnalysis.category_details.name
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
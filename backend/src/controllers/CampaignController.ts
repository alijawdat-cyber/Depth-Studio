/**
 * 🎮 Campaign Controller - API endpoints للحملات
 * ===============================================
 * 
 * تحكم شامل بـ API الحملات مع أمان كامل ومحكم الأنواع 100%
 * متوافق بالكامل مع types/src/campaigns.ts والـ CampaignValidators الجديدة
 */

import { Request, Response } from 'express';
import { CampaignService } from '../services/CampaignService';
import { Campaign, TaskInfo } from '../../../types/src/campaigns';
import { 
  CampaignStatus, 
  CampaignType, 
  PriorityLevel, 
  TaskStatus 
} from '../../../types/src/core/enums';
import { ID, FirebaseTimestamp } from '../../../types/src/core/base';
import { Timestamp } from 'firebase-admin/firestore';

// استيراد جميع validators والـ types من CampaignValidators
import {
  validateCreateCampaign,
  validateGetCampaign,
  validateSearchCampaigns,
  validateCampaignParams,
  validateUpdateCampaignStatus,
  validateAssignPhotographer,
  validateCreateCampaignTasks,
  validateAssignTaskToPhotographer,
  validateUpdateTaskStatus,
  validatePhotographerParams,
  validateTaskParams,
  CreateCampaignInput,
  GetCampaignInput,
  SearchCampaignsInput,
  UpdateCampaignStatusInput,
  AssignPhotographerInput,
  CreateCampaignTasksInput,
  AssignTaskToPhotographerInput,
  UpdateTaskStatusInput,
  CampaignParamsInput,
  PhotographerParamsInput
} from '../validators/CampaignValidators';

// تمديد Request type لدعم user property والـ validated data
declare global {
  namespace Express {
    interface Request {
      user?: {
        uid: string;
        email?: string;
        role?: string;
      };
      // إضافة البيانات المتحققة من الـ validators
      validatedBody?: any;
      validatedQuery?: any;
      validatedParams?: any;
    }
  }
}

// ======================================
// 🎯 أنواع الطلبات والاستجابات
// ======================================

/**
 * 📝 طلب إنشاء حملة جديدة (متوافق مع CampaignService)
 */
interface CreateCampaignData {
  name: string;
  description: string;
  brand_id: ID;
  type: CampaignType;
  priority: PriorityLevel;
  start_date: FirebaseTimestamp;
  end_date: FirebaseTimestamp;
  target_completion_date: FirebaseTimestamp;
  total_content_pieces: number;
  content_requirements: string[];
  budget: number;
  currency: string;
  enable_smart_assignment?: boolean;
  auto_scheduling?: boolean;
  key_milestones: string[];
}

/**
 * 🔄 طلب تحديث حالة الحملة
 */
interface UpdateCampaignStatusRequest {
  status: CampaignStatus;
  reason?: string;
}

/**
 * 👨‍💻 طلب تعيين مصور
 */
interface AssignPhotographerRequest {
  photographer_id: ID;
  skip_availability_check?: boolean;
}

/**
 * 📋 طلب إنشاء مهمة جديدة (استخدام احترافي لـ TaskInfo)
 */
interface CreateTaskRequest {
  title: string;
  description: string;
  priority: PriorityLevel;
  due_date: string; // ISO string سيتم تحويله لـ Timestamp
}

/**
 * 📊 طلب تحديث حالة المهمة (استخدام احترافي لـ TaskInfo)
 */
interface UpdateTaskStatusRequest {
  status: TaskStatus;
  progress_percentage: number;
}

/**
 * 🔍 معايير البحث المتقدم (متوافق مع CampaignService)
 */
interface CampaignSearchFilters {
  name?: string;
  brand_id?: string;
  status?: CampaignStatus;
  type?: CampaignType;
  priority?: PriorityLevel;
  assigned_photographer?: string;
  created_by?: string;
  start_date_from?: FirebaseTimestamp;
  start_date_to?: FirebaseTimestamp;
  budget_min?: number;
  budget_max?: number;
  progress_min?: number;
  progress_max?: number;
  is_on_schedule?: boolean;
  enable_smart_assignment?: boolean;
}

/**
 * 📊 استجابة API موحدة
 */
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    has_next?: boolean;
  };
}

/**
 * 🎮 تحكم شامل بـ API الحملات مع استخدام احترافي للـ validators
 */
export class CampaignController {
  private campaignService: CampaignService;

  constructor(campaignService: CampaignService) {
    this.campaignService = campaignService;
  }

  /**
   * 📋 إرجاع جميع المتحققات للاستخدام في الـ router
   */
  static getValidators() {
    return {
      validateCreateCampaign,
      validateGetCampaign,
      validateSearchCampaigns,
      validateCampaignParams,
      validateUpdateCampaignStatus,
      validateAssignPhotographer,
      validateCreateCampaignTasks,
      validateAssignTaskToPhotographer,
      validateUpdateTaskStatus,
      validatePhotographerParams,
      validateTaskParams
    };
  }

  // ======================================
  // 🚀 API Endpoints الأساسية
  // ======================================

  /**
   * POST /api/campaigns - إنشاء حملة جديدة
   * يستخدم validateCreateCampaign middleware
   */
  async createCampaign(req: Request, res: Response): Promise<void> {
    try {
      // البيانات متحققة مسبقاً من validateCreateCampaign middleware
      const body = req.body as CreateCampaignInput;
      const userId = req.user?.uid as ID;

      // تحويل البيانات للنوع المطلوب من CampaignService
      const campaignData: CreateCampaignData = {
        name: body.name,
        description: body.description,
        brand_id: body.brand_id,
        type: body.type,
        priority: body.priority,
        start_date: Timestamp.fromDate(new Date(body.timeline.start_date)) as FirebaseTimestamp,
        end_date: Timestamp.fromDate(new Date(body.timeline.end_date)) as FirebaseTimestamp,
        target_completion_date: Timestamp.fromDate(new Date(body.target_completion_date)) as FirebaseTimestamp,
        total_content_pieces: body.total_content_pieces,
        content_requirements: body.content_requirements,
        budget: body.budget,
        currency: body.currency,
        enable_smart_assignment: body.enable_smart_assignment,
        auto_scheduling: body.auto_scheduling,
        key_milestones: body.key_milestones || []
      };

      // إنشاء الحملة
      const campaign: Campaign = await this.campaignService.createCampaign(campaignData, userId);

      res.status(201).json({
        success: true,
        data: campaign,
        message: 'تم إنشاء الحملة بنجاح'
      } as ApiResponse<Campaign>);

    } catch (error) {
      console.error('خطأ في إنشاء الحملة:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'خطأ في الخادم'
      } as ApiResponse<never>);
    }
  }

  /**
   * GET /api/campaigns/:campaignId - جلب حملة محددة
   * يستخدم validateCampaignParams middleware
   */
  async getCampaignById(req: Request, res: Response): Promise<void> {
    try {
      // معرف الحملة متحقق مسبقاً من validateCampaignParams middleware
      const { campaignId }: CampaignParamsInput = req.params as any;

      // استخدام Repository مباشرة للقراءة البسيطة
      const campaign = await this.campaignService['campaignRepo'].findById(campaignId);

      if (!campaign) {
        res.status(404).json({
          success: false,
          error: 'الحملة غير موجودة'
        } as ApiResponse<never>);
        return;
      }

      res.status(200).json({
        success: true,
        data: campaign
      } as ApiResponse<Campaign>);

    } catch (error) {
      console.error('خطأ في جلب الحملة:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'خطأ في الخادم'
      } as ApiResponse<never>);
    }
  }

  /**
   * GET /api/campaigns - البحث عن حملة
   * يستخدم validateGetCampaign middleware
   */
  async getCampaign(req: Request, res: Response): Promise<void> {
    try {
      // معايير البحث متحققة مسبقاً من validateGetCampaign middleware
      const query = req.query as GetCampaignInput;

      let campaign: Campaign | null = null;

      if (query.id) {
        campaign = await this.campaignService['campaignRepo'].findById(query.id);
      } else if (query.brand_id) {
        const campaigns = await this.campaignService['campaignRepo'].findByBrand(query.brand_id, { limit: 1 });
        campaign = campaigns[0] || null;
      } else if (query.assigned_photographer) {
        const campaigns = await this.campaignService['campaignRepo'].findByPhotographer(query.assigned_photographer, { limit: 1 });
        campaign = campaigns[0] || null;
      } else if (query.name) {
        const campaigns = await this.campaignService['campaignRepo'].searchCampaigns({ name: query.name, limit: 1 });
        campaign = campaigns[0] || null;
      }

      if (!campaign) {
        res.status(404).json({
          success: false,
          error: 'لم يتم العثور على حملة تطابق المعايير المحددة'
        } as ApiResponse<never>);
        return;
      }

      res.status(200).json({
        success: true,
        data: campaign
      } as ApiResponse<Campaign>);

    } catch (error) {
      console.error('خطأ في البحث عن الحملة:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'خطأ في الخادم'
      } as ApiResponse<never>);
    }
  }

  /**
   * PATCH /api/campaigns/:campaignId/status - تحديث حالة الحملة
   * يستخدم validateCampaignParams و validateUpdateCampaignStatus middleware
   */
  async updateCampaignStatus(req: Request, res: Response): Promise<void> {
    try {
      // البيانات متحققة مسبقاً من middleware
      const { campaignId }: CampaignParamsInput = req.params as any;
      const body = req.body as UpdateCampaignStatusInput;

      const campaign = await this.campaignService.updateCampaignStatus(
        campaignId,
        body.status,
        body.updated_by,
        body.reason
      );

      res.status(200).json({
        success: true,
        data: campaign,
        message: 'تم تحديث حالة الحملة بنجاح'
      } as ApiResponse<Campaign>);

    } catch (error) {
      console.error('خطأ في تحديث حالة الحملة:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'خطأ في الخادم'
      } as ApiResponse<never>);
    }
  }

  /**
   * POST /api/campaigns/:campaignId/assign - تعيين مصور للحملة
   * يستخدم validateCampaignParams و validateAssignPhotographer middleware
   */
  async assignPhotographer(req: Request, res: Response): Promise<void> {
    try {
      // البيانات متحققة مسبقاً من middleware
      const { campaignId }: CampaignParamsInput = req.params as any;
      const body = req.body as AssignPhotographerInput;

      const campaign = await this.campaignService.assignPhotographer(
        campaignId,
        body.photographer_id,
        body.assigned_by,
        false // skipAvailabilityCheck
      );

      res.status(200).json({
        success: true,
        data: campaign,
        message: 'تم تعيين المصور للحملة بنجاح'
      } as ApiResponse<Campaign>);

    } catch (error) {
      console.error('خطأ في تعيين المصور:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'خطأ في الخادم'
      } as ApiResponse<never>);
    }
  }

  /**
   * GET /api/campaigns/search - البحث المتقدم في الحملات
   * يستخدم validateSearchCampaigns middleware
   */
  async searchCampaigns(req: Request, res: Response): Promise<void> {
    try {
      // معايير البحث متحققة ومحولة مسبقاً من validateSearchCampaigns middleware
      const query: SearchCampaignsInput = req.query as any;

      // تحويل معايير البحث للنوع المطلوب من CampaignService
      const searchFilters: Partial<CampaignSearchFilters> = {};
      
      if (query.search || query.searchTerm) searchFilters.name = (query.search || query.searchTerm)!;
      if (query.brand_id) searchFilters.brand_id = query.brand_id;
      if (query.status) searchFilters.status = query.status;
      if (query.type) searchFilters.type = query.type;
      if (query.priority) searchFilters.priority = query.priority;
      if (query.assigned_photographer) searchFilters.assigned_photographer = query.assigned_photographer;
      if (query.created_by) searchFilters.created_by = query.created_by;
      if (query.min_budget) searchFilters.budget_min = query.min_budget;
      if (query.max_budget) searchFilters.budget_max = query.max_budget;
      
      // تحويل التواريخ إذا كانت موجودة
      if (query.start_date_from) {
        searchFilters.start_date_from = Timestamp.fromDate(new Date(query.start_date_from)) as FirebaseTimestamp;
      }
      if (query.start_date_to) {
        searchFilters.start_date_to = Timestamp.fromDate(new Date(query.start_date_to)) as FirebaseTimestamp;
      }

      const campaigns = await this.campaignService.searchCampaigns(searchFilters, query.limit);

      // حساب pagination metadata
      const total = campaigns.length;
      const hasNext = query.limit ? campaigns.length === query.limit : false;

      res.status(200).json({
        success: true,
        data: campaigns,
        meta: {
          total,
          page: query.page || 1,
          limit: query.limit || 10,
          has_next: hasNext
        }
      } as ApiResponse<Campaign[]>);

    } catch (error) {
      console.error('خطأ في البحث في الحملات:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'خطأ في الخادم'
      } as ApiResponse<never>);
    }
  }

  /**
   * GET /api/campaigns/stats - إحصائيات الحملات
   */
  async getCampaignStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await this.campaignService.getCampaignStats();

      res.status(200).json({
        success: true,
        data: stats
      } as ApiResponse<any>);

    } catch (error) {
      console.error('خطأ في جلب إحصائيات الحملات:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'خطأ في الخادم'
      } as ApiResponse<never>);
    }
  }

  /**
   * GET /api/campaigns/:campaignId/analytics - تحليلات الحملات
   * يستخدم validateCampaignParams middleware
   */
  async getCampaignAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { campaignId }: CampaignParamsInput = req.params as any;
      
      const analytics = await this.campaignService.getCampaignAnalytics(campaignId);

      res.status(200).json({
        success: true,
        data: analytics
      } as ApiResponse<any>);

    } catch (error) {
      console.error('خطأ في جلب تحليلات الحملات:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'خطأ في الخادم'
      } as ApiResponse<never>);
    }
  }

  /**
   * DELETE /api/campaigns/:campaignId - حذف حملة (إيقاف فقط)
   * يستخدم validateCampaignParams middleware
   */
  async deleteCampaign(req: Request, res: Response): Promise<void> {
    try {
      // معرف الحملة متحقق مسبقاً من validateCampaignParams middleware
      const { campaignId }: CampaignParamsInput = req.params as any;
      const userId = req.user?.uid as ID;

      // نظراً لعدم وجود deleteCampaign في Service، نستخدم updateStatus لإلغاء الحملة
      await this.campaignService.updateCampaignStatus(
        campaignId,
        'cancelled' as CampaignStatus,
        userId,
        'تم حذف الحملة بواسطة المستخدم'
      );

      res.status(200).json({
        success: true,
        message: 'تم إلغاء الحملة بنجاح'
      } as ApiResponse<never>);

    } catch (error) {
      console.error('خطأ في حذف الحملة:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'خطأ في الخادم'
      } as ApiResponse<never>);
    }
  }

  // ======================================
  // 📋 Task Management Endpoints
  // ======================================

  /**
   * POST /api/campaigns/:campaignId/tasks - إنشاء مهام للحملة
   * يستخدم validateCampaignParams و validateCreateCampaignTasks middleware
   */
  async createCampaignTasks(req: Request, res: Response): Promise<void> {
    try {
      // البيانات متحققة مسبقاً من middleware
      const { campaignId }: CampaignParamsInput = req.params as any;
      const body = req.body as CreateCampaignTasksInput;

      // تحويل التواريخ في المهام
      const tasksWithTimestamps = body.tasks.map(task => ({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        due_date: Timestamp.fromDate(new Date(task.due_date)) as FirebaseTimestamp,
        progress_percentage: task.progress_percentage
      }));

      const tasks = await this.campaignService.createCampaignTasks(
        campaignId,
        tasksWithTimestamps
      );

      res.status(201).json({
        success: true,
        data: tasks,
        message: 'تم إنشاء مهام الحملة بنجاح'
      } as ApiResponse<TaskInfo[]>);

    } catch (error) {
      console.error('خطأ في إنشاء مهام الحملة:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'خطأ في الخادم'
      } as ApiResponse<never>);
    }
  }

  /**
   * POST /api/campaigns/:campaignId/tasks/:taskTitle/assign - تخصيص مهمة لمصور
   * يستخدم validateCampaignParams و validateTaskParams و validateAssignTaskToPhotographer middleware
   */
  async assignTaskToPhotographer(req: Request, res: Response): Promise<void> {
    try {
      // البيانات متحققة مسبقاً من middleware
      const { campaignId }: CampaignParamsInput = req.params as any;
      const { taskTitle } = req.params;
      const body = req.body as AssignTaskToPhotographerInput;

      const task = await this.campaignService.assignTaskToPhotographer(
        campaignId,
        taskTitle!,
        body.photographer_id,
        body.assigned_by
      );

      res.status(200).json({
        success: true,
        data: task,
        message: 'تم تخصيص المهمة للمصور بنجاح'
      } as ApiResponse<TaskInfo>);

    } catch (error) {
      console.error('خطأ في تخصيص المهمة:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'خطأ في الخادم'
      } as ApiResponse<never>);
    }
  }

  /**
   * PATCH /api/campaigns/:campaignId/tasks/:taskTitle/status - تحديث حالة المهمة
   * يستخدم validateCampaignParams و validateTaskParams و validateUpdateTaskStatus middleware
   */
  async updateTaskStatus(req: Request, res: Response): Promise<void> {
    try {
      // البيانات متحققة مسبقاً من middleware
      const { campaignId }: CampaignParamsInput = req.params as any;
      const { taskTitle } = req.params;
      const body = req.body as UpdateTaskStatusInput;

      const task = await this.campaignService.updateTaskStatus(
        campaignId,
        taskTitle!,
        body.status,
        body.progress_percentage || 0,
        body.updated_by
      );

      res.status(200).json({
        success: true,
        data: task,
        message: 'تم تحديث حالة المهمة بنجاح'
      } as ApiResponse<TaskInfo>);

    } catch (error) {
      console.error('خطأ في تحديث حالة المهمة:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'خطأ في الخادم'
      } as ApiResponse<never>);
    }
  }

  /**
   * GET /api/photographers/:photographerId/tasks - جلب مهام المصور
   * يستخدم validatePhotographerParams middleware
   */
  async getPhotographerTasks(req: Request, res: Response): Promise<void> {
    try {
      // معرف المصور متحقق مسبقاً من validatePhotographerParams middleware
      const { photographerId }: PhotographerParamsInput = req.params as any;
      const { campaignId } = req.query;

      // getPhotographerTasks يتطلب campaignId أيضاً
      const tasks = await this.campaignService.getPhotographerTasks(
        campaignId as string || '',
        photographerId
      );

      res.status(200).json({
        success: true,
        data: tasks,
        meta: {
          total: tasks.length
        }
      } as ApiResponse<TaskInfo[]>);

    } catch (error) {
      console.error('خطأ في جلب مهام المصور:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'خطأ في الخادم'
      } as ApiResponse<never>);
    }
  }
}
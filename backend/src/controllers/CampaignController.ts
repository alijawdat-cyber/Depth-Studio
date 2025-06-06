/**
 * 🎮 Campaign Controller - API endpoints للحملات
 * ===============================================
 * 
 * تحكم شامل بـ API الحملات مع أمان كامل ومحكم الأنواع 100%
 * متوافق بالكامل مع types/src/campaigns.ts
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

// تمديد Request type لدعم user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        uid: string;
        email?: string;
        role?: string;
      };
    }
  }
}

// ======================================
// 🎯 أنواع الطلبات والاستجابات
// ======================================

/**
 * 📝 طلب إنشاء حملة جديدة
 */
interface CreateCampaignRequest {
  name: string;
  description: string;
  brand_id: ID;
  type: CampaignType;
  priority: PriorityLevel;
  start_date: string; // ISO string سيتم تحويله لـ Timestamp
  end_date: string;
  target_completion_date: string;
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
 * 🔍 معايير البحث المتقدم
 */
interface CampaignSearchQuery {
  name?: string;
  brand_id?: ID;
  status?: CampaignStatus;
  type?: CampaignType;
  priority?: PriorityLevel;
  assigned_photographer?: ID;
  created_by?: ID;
  start_date_from?: string;
  start_date_to?: string;
  budget_min?: string;
  budget_max?: string;
  progress_min?: string;
  progress_max?: string;
  is_on_schedule?: string;
  enable_smart_assignment?: string;
  limit?: string;
  page?: string;
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
 * 🎮 تحكم شامل بـ API الحملات
 */
export class CampaignController {
  private campaignService: CampaignService;

  constructor(campaignService: CampaignService) {
    this.campaignService = campaignService;
  }

  // ======================================
  // 🚀 API Endpoints الأساسية
  // ======================================

  /**
   * POST /api/campaigns - إنشاء حملة جديدة
   */
  async createCampaign(req: Request, res: Response): Promise<void> {
    try {
      const body = req.body as CreateCampaignRequest;
      const userId = req.user?.uid as ID;

      // التحقق من صحة البيانات المطلوبة
      const validationErrors = this.validateCreateCampaignRequest(body);
      if (validationErrors.length > 0) {
        res.status(400).json({
          success: false,
          error: 'بيانات غير صالحة',
          message: validationErrors.join(', ')
        } as ApiResponse<never>);
        return;
      }

      // تحويل التواريخ من strings إلى Timestamps مع cast صحيح
      const campaignData = {
        ...body,
        start_date: Timestamp.fromDate(new Date(body.start_date)) as FirebaseTimestamp,
        end_date: Timestamp.fromDate(new Date(body.end_date)) as FirebaseTimestamp,
        target_completion_date: Timestamp.fromDate(new Date(body.target_completion_date)) as FirebaseTimestamp
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
   * GET /api/campaigns/:id - جلب حملة محددة
   */
  async getCampaignById(req: Request, res: Response): Promise<void> {
    try {
      const campaignId = req.params['id'] as ID;

      if (!campaignId) {
        res.status(400).json({
          success: false,
          error: 'معرف الحملة مطلوب'
        } as ApiResponse<never>);
        return;
      }

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
        error: 'خطأ في الخادم'
      } as ApiResponse<never>);
    }
  }

  /**
   * PATCH /api/campaigns/:id/status - تحديث حالة الحملة
   */
  async updateCampaignStatus(req: Request, res: Response): Promise<void> {
    try {
      const campaignId = req.params['id'] as ID;
      const body = req.body as UpdateCampaignStatusRequest;
      const userId = req.user?.uid as ID;

      // التحقق من البيانات
      if (!campaignId || !body.status) {
        res.status(400).json({
          success: false,
          error: 'معرف الحملة والحالة الجديدة مطلوبان'
        } as ApiResponse<never>);
        return;
      }

      // التحقق من صحة الحالة
      const validStatuses: CampaignStatus[] = ['draft', 'scheduled', 'active', 'paused', 'completed', 'cancelled'];
      if (!validStatuses.includes(body.status)) {
        res.status(400).json({
          success: false,
          error: `حالة غير صالحة: ${body.status}`
        } as ApiResponse<never>);
        return;
      }

      // تحديث الحالة
      const updatedCampaign: Campaign = await this.campaignService.updateCampaignStatus(
        campaignId, 
        body.status, 
        userId, 
        body.reason
      );

      res.status(200).json({
        success: true,
        data: updatedCampaign,
        message: `تم تحديث حالة الحملة إلى ${body.status}`
      } as ApiResponse<Campaign>);

    } catch (error) {
      console.error('خطأ في تحديث حالة الحملة:', error);
      const statusCode = error instanceof Error && error.message.includes('غير مصرح') ? 403 : 500;
      res.status(statusCode).json({
        success: false,
        error: error instanceof Error ? error.message : 'خطأ في الخادم'
      } as ApiResponse<never>);
    }
  }

  /**
   * PATCH /api/campaigns/:id/photographer - تعيين مصور للحملة
   */
  async assignPhotographer(req: Request, res: Response): Promise<void> {
    try {
      const campaignId = req.params['id'] as ID;
      const body = req.body as AssignPhotographerRequest;
      const userId = req.user?.uid as ID;

      // التحقق من البيانات
      if (!campaignId || !body.photographer_id) {
        res.status(400).json({
          success: false,
          error: 'معرف الحملة ومعرف المصور مطلوبان'
        } as ApiResponse<never>);
        return;
      }

      // تعيين المصور
      const updatedCampaign: Campaign = await this.campaignService.assignPhotographer(
        campaignId,
        body.photographer_id,
        userId,
        body.skip_availability_check || false
      );

      res.status(200).json({
        success: true,
        data: updatedCampaign,
        message: 'تم تعيين المصور بنجاح'
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
   */
  async searchCampaigns(req: Request, res: Response): Promise<void> {
    try {
      const query = req.query as CampaignSearchQuery;

      // تحويل query parameters إلى فلاتر
      const filters = this.buildSearchFilters(query);
      const limit = query.limit ? parseInt(query.limit, 10) : 20;
      const page = query.page ? parseInt(query.page, 10) : 1;

      // تنفيذ البحث
      const campaigns: Campaign[] = await this.campaignService.searchCampaigns(filters, limit);

      // معلومات pagination بسيطة
      const meta = {
        total: campaigns.length,
        page,
        limit,
        has_next: campaigns.length === limit
      };

      res.status(200).json({
        success: true,
        data: campaigns,
        meta
      } as ApiResponse<Campaign[]>);

    } catch (error) {
      console.error('خطأ في البحث في الحملات:', error);
      res.status(500).json({
        success: false,
        error: 'خطأ في الخادم'
      } as ApiResponse<never>);
    }
  }

  /**
   * GET /api/campaigns/stats - إحصائيات عامة للحملات
   */
  async getCampaignStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await this.campaignService.getCampaignStats();

      res.status(200).json({
        success: true,
        data: stats
      } as ApiResponse<typeof stats>);

    } catch (error) {
      console.error('خطأ في جلب إحصائيات الحملات:', error);
      res.status(500).json({
        success: false,
        error: 'خطأ في الخادم'
      } as ApiResponse<never>);
    }
  }

  /**
   * GET /api/campaigns/:id/analytics - تحليلات حملة محددة
   */
  async getCampaignAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const campaignId = req.params['id'] as ID;

      if (!campaignId) {
        res.status(400).json({
          success: false,
          error: 'معرف الحملة مطلوب'
        } as ApiResponse<never>);
        return;
      }

      const analytics = await this.campaignService.getCampaignAnalytics(campaignId);

      res.status(200).json({
        success: true,
        data: analytics
      } as ApiResponse<typeof analytics>);

    } catch (error) {
      console.error('خطأ في جلب تحليلات الحملة:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'خطأ في الخادم'
      } as ApiResponse<never>);
    }
  }

  /**
   * DELETE /api/campaigns/:id - حذف/أرشفة حملة
   */
  async deleteCampaign(req: Request, res: Response): Promise<void> {
    try {
      const campaignId = req.params['id'] as ID;
      const userId = req.user?.uid as ID;

      if (!campaignId) {
        res.status(400).json({
          success: false,
          error: 'معرف الحملة مطلوب'
        } as ApiResponse<never>);
        return;
      }

      // التحقق من وجود الحملة أولاً
      const campaign = await this.campaignService['campaignRepo'].findById(campaignId);
      if (!campaign) {
        res.status(404).json({
          success: false,
          error: 'الحملة غير موجودة'
        } as ApiResponse<never>);
        return;
      }

      // أرشفة الحملة بدلاً من الحذف الفعلي
      const archivedCampaign = await this.campaignService.updateCampaignStatus(
        campaignId,
        'cancelled',
        userId,
        'تم حذف الحملة من قبل المستخدم'
      );

      res.status(200).json({
        success: true,
        data: archivedCampaign,
        message: 'تم أرشفة الحملة بنجاح'
      } as ApiResponse<Campaign>);

    } catch (error) {
      console.error('خطأ في حذف الحملة:', error);
      const statusCode = error instanceof Error && error.message.includes('غير مصرح') ? 403 : 500;
      res.status(statusCode).json({
        success: false,
        error: error instanceof Error ? error.message : 'خطأ في الخادم'
      } as ApiResponse<never>);
    }
  }

  // ======================================
  // 📋 Task Management Endpoints - استخدام احترافي لـ TaskInfo
  // ======================================

  /**
   * POST /api/campaigns/:id/tasks - إنشاء مهام للحملة
   * ==============================================
   * 
   * 🎯 فوائد TaskInfo المستخدمة:
   * ✅ تمثيل دقيق للمهام الفردية في الحملة
   * ✅ إدارة حالة المهام (pending, assigned, completed, etc.)
   * ✅ ربط المهام بالمصورين والأولويات
   * ✅ تتبع التقدم لكل مهمة على حدة
   */
  async createCampaignTasks(req: Request, res: Response): Promise<void> {
    try {
      const campaignId = req.params['id'] as ID;
      const tasksData = req.body as CreateTaskRequest[];
      const userId = req.user?.uid as ID;

      if (!campaignId) {
        res.status(400).json({
          success: false,
          error: 'معرف الحملة مطلوب'
        } as ApiResponse<never>);
        return;
      }

      if (!tasksData || tasksData.length === 0) {
        res.status(400).json({
          success: false,
          error: 'بيانات المهام مطلوبة'
        } as ApiResponse<never>);
        return;
      }

      // تحويل البيانات إلى TaskInfo format
      const taskInfoData = tasksData.map(task => ({
        title: task.title,
        description: task.description,
        status: 'pending' as TaskStatus,
        priority: task.priority,
        due_date: Timestamp.fromDate(new Date(task.due_date)) as FirebaseTimestamp,
        progress_percentage: 0
      }));

      // إنشاء المهام باستخدام Service
      const createdTasks: TaskInfo[] = await this.campaignService.createCampaignTasks(
        campaignId,
        taskInfoData
      );

      res.status(201).json({
        success: true,
        data: createdTasks,
        message: `تم إنشاء ${createdTasks.length} مهمة بنجاح`
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
   * PATCH /api/campaigns/:id/tasks/:taskTitle/assign - تخصيص مهمة لمصور
   * ===============================================================
   * 
   * 🎯 فوائد TaskInfo المستخدمة:
   * ✅ ربط المهمة بمصور محدد (assigned_photographer)
   * ✅ تحديث حالة المهمة إلى 'assigned'
   * ✅ إدارة دقيقة للتخصيصات
   */
  async assignTaskToPhotographer(req: Request, res: Response): Promise<void> {
    try {
      const campaignId = req.params['id'] as ID;
      const taskTitle = req.params['taskTitle'];
      const photographerId = req.body.photographer_id as ID;
      
      if (!taskTitle) {
        res.status(400).json({
          success: false,
          error: 'عنوان المهمة مطلوب'
        } as ApiResponse<never>);
        return;
      }
      
      const decodedTaskTitle = decodeURIComponent(taskTitle);
      const userId = req.user?.uid as ID;

      if (!campaignId || !photographerId) {
        res.status(400).json({
          success: false,
          error: 'معرف الحملة ومعرف المصور مطلوبان'
        } as ApiResponse<never>);
        return;
      }

      // تخصيص المهمة باستخدام Service
      const assignedTask: TaskInfo = await this.campaignService.assignTaskToPhotographer(
        campaignId,
        decodedTaskTitle,
        photographerId,
        userId
      );

      res.status(200).json({
        success: true,
        data: assignedTask,
        message: 'تم تخصيص المهمة بنجاح'
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
   * PATCH /api/campaigns/:id/tasks/:taskTitle/status - تحديث حالة المهمة
   * ==============================================================
   * 
   * 🎯 فوائد TaskInfo المستخدمة:
   * ✅ تحديث حالة المهمة (pending, active, completed, cancelled)
   * ✅ تتبع نسبة التقدم للمهمة
   * ✅ ربط التحديث بالمستخدم المحدِث
   */
  async updateTaskStatus(req: Request, res: Response): Promise<void> {
    try {
      const campaignId = req.params['id'] as ID;
      const taskTitle = req.params['taskTitle'];
      const body = req.body as UpdateTaskStatusRequest;
      
      if (!taskTitle) {
        res.status(400).json({
          success: false,
          error: 'عنوان المهمة مطلوب'
        } as ApiResponse<never>);
        return;
      }
      
      const decodedTaskTitle = decodeURIComponent(taskTitle);
      const userId = req.user?.uid as ID;

      if (!campaignId || !taskTitle) {
        res.status(400).json({
          success: false,
          error: 'معرف الحملة وعنوان المهمة مطلوبان'
        } as ApiResponse<never>);
        return;
      }

      // التحقق من صحة البيانات
      if (!body.status || body.progress_percentage < 0 || body.progress_percentage > 100) {
        res.status(400).json({
          success: false,
          error: 'حالة المهمة ونسبة التقدم مطلوبان (0-100)'
        } as ApiResponse<never>);
        return;
      }

      // تحديث حالة المهمة باستخدام Service
      const updatedTask: TaskInfo = await this.campaignService.updateTaskStatus(
        campaignId,
        taskTitle,
        body.status,
        body.progress_percentage,
        userId
      );

      res.status(200).json({
        success: true,
        data: updatedTask,
        message: `تم تحديث حالة المهمة إلى ${body.status}`
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
   * GET /api/campaigns/:id/photographer/:photographerId/tasks - مهام المصور
   * ==================================================================
   * 
   * 🎯 فوائد TaskInfo المستخدمة:
   * ✅ عرض جميع مهام مصور محدد في حملة
   * ✅ فلترة المهام حسب المصور المخصص
   * ✅ معلومات تفصيلية عن كل مهمة (الحالة، التقدم، الموعد النهائي)
   */
  async getPhotographerTasks(req: Request, res: Response): Promise<void> {
    try {
      const campaignId = req.params['id'] as ID;
      const photographerId = req.params['photographerId'] as ID;

      if (!campaignId || !photographerId) {
        res.status(400).json({
          success: false,
          error: 'معرف الحملة ومعرف المصور مطلوبان'
        } as ApiResponse<never>);
        return;
      }

      // جلب مهام المصور باستخدام Service
      const photographerTasks: TaskInfo[] = await this.campaignService.getPhotographerTasks(
        campaignId,
        photographerId
      );

      res.status(200).json({
        success: true,
        data: photographerTasks,
        meta: {
          total: photographerTasks.length,
          photographer_id: photographerId,
          campaign_id: campaignId
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

  // ======================================
  // 🛠️ دوال مساعدة ومن validation
  // ======================================

  /**
   * 🔍 التحقق من صحة طلب إنشاء الحملة
   */
  private validateCreateCampaignRequest(body: CreateCampaignRequest): string[] {
    const errors: string[] = [];

    if (!body.name?.trim()) {
      errors.push('اسم الحملة مطلوب');
    }

    if (!body.description?.trim()) {
      errors.push('وصف الحملة مطلوب');
    }

    if (!body.brand_id) {
      errors.push('معرف البراند مطلوب');
    }

    if (!body.type) {
      errors.push('نوع الحملة مطلوب');
    }

    if (!body.priority) {
      errors.push('أولوية الحملة مطلوبة');
    }

    if (!body.start_date || !this.isValidDate(body.start_date)) {
      errors.push('تاريخ البداية غير صالح');
    }

    if (!body.end_date || !this.isValidDate(body.end_date)) {
      errors.push('تاريخ النهاية غير صالح');
    }

    if (!body.target_completion_date || !this.isValidDate(body.target_completion_date)) {
      errors.push('تاريخ الإكمال المستهدف غير صالح');
    }

    if (body.start_date && body.end_date && new Date(body.start_date) >= new Date(body.end_date)) {
      errors.push('تاريخ البداية يجب أن يكون قبل تاريخ النهاية');
    }

    if (!body.total_content_pieces || body.total_content_pieces <= 0) {
      errors.push('عدد قطع المحتوى يجب أن يكون أكبر من صفر');
    }

    if (!body.budget || body.budget <= 0) {
      errors.push('الميزانية يجب أن تكون أكبر من صفر');
    }

    if (!body.currency?.trim()) {
      errors.push('العملة مطلوبة');
    }

    if (!body.content_requirements || body.content_requirements.length === 0) {
      errors.push('متطلبات المحتوى مطلوبة');
    }

    if (!body.key_milestones || body.key_milestones.length === 0) {
      errors.push('المراحل المهمة مطلوبة');
    }

    return errors;
  }

  /**
   * 📅 التحقق من صحة التاريخ
   */
  private isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  }

  /**
   * 🔍 بناء فلاتر البحث من query parameters
   */
  private buildSearchFilters(query: CampaignSearchQuery) {
    const filters: Record<string, any> = {};

    if (query.name) filters['name'] = query.name;
    if (query.brand_id) filters['brand_id'] = query.brand_id;
    if (query.status) filters['status'] = query.status as CampaignStatus;
    if (query.type) filters['type'] = query.type as CampaignType;
    if (query.priority) filters['priority'] = query.priority as PriorityLevel;
    if (query.assigned_photographer) filters['assigned_photographer'] = query.assigned_photographer;
    if (query.created_by) filters['created_by'] = query.created_by;

    // تحويل التواريخ
    if (query.start_date_from && this.isValidDate(query.start_date_from)) {
      filters['start_date_from'] = Timestamp.fromDate(new Date(query.start_date_from));
    }
    if (query.start_date_to && this.isValidDate(query.start_date_to)) {
      filters['start_date_to'] = Timestamp.fromDate(new Date(query.start_date_to));
    }

    // تحويل الأرقام
    if (query.budget_min) filters['budget_min'] = parseFloat(query.budget_min);
    if (query.budget_max) filters['budget_max'] = parseFloat(query.budget_max);
    if (query.progress_min) filters['progress_min'] = parseFloat(query.progress_min);
    if (query.progress_max) filters['progress_max'] = parseFloat(query.progress_max);

    // تحويل boolean values
    if (query.is_on_schedule) filters['is_on_schedule'] = query.is_on_schedule === 'true';
    if (query.enable_smart_assignment) filters['enable_smart_assignment'] = query.enable_smart_assignment === 'true';

    return filters;
  }
}
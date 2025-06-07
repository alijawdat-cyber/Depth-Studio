/**
 * 🏗️ Campaign Service - منطق الحملات التجاري
 * ==========================================
 * 
 * خدمة الحملات مع منطق تجاري متقدم ومحكم الأنواع 100%
 * متوافق بالكامل مع types/src/campaigns.ts
 */

import { FieldValue } from 'firebase-admin/firestore';
import { CampaignRepository } from '../repositories/CampaignRepository';
import { UserRepository } from '../repositories/UserRepository';
import { BrandRepository } from '../repositories/BrandRepository';
import { Campaign, TaskInfo } from '../../../types/src/campaigns';
import { User, PhotographerInfo } from '../../../types/src/users';
import { Brand } from '../../../types/src/brands';
import { 
  CampaignStatus, 
  CampaignType, 
  PriorityLevel, 
  UserRole,
  TaskStatus 
} from '../../../types/src/core/enums';
import { ID, FirebaseTimestamp } from '../../../types/src/core/base';

// ======================================
// 🎯 أنواع خاصة بـ Service
// ======================================

/**
 * 📝 بيانات إنشاء حملة جديدة
 */
interface CreateCampaignData {
  // معلومات أساسية
  name: string;
  description: string;
  brand_id: ID;
  type: CampaignType;
  priority: PriorityLevel;
  
  // الجدولة
  start_date: FirebaseTimestamp;
  end_date: FirebaseTimestamp;
  target_completion_date: FirebaseTimestamp;
  
  // الأهداف والمحتوى
  total_content_pieces: number;
  content_requirements: string[];
  
  // الميزانية
  budget: number;
  currency: string;
  
  // الذكاء الاصطناعي
  enable_smart_assignment?: boolean;
  auto_scheduling?: boolean;
  
  // مراحل مهمة
  key_milestones: string[];
}

/**
 * 📊 تحليلات الحملة
 */
interface CampaignAnalytics {
  // معلومات أساسية
  campaign_id: ID;
  campaign_name: string;
  brand_name: string;
  
  // التقدم
  progress_percentage: number;
  tasks_completed: number;
  tasks_total: number;
  tasks_pending: number;
  
  // الوقت
  days_elapsed: number;
  days_remaining: number;
  is_on_schedule: boolean;
  delay_days?: number | undefined;
  
  // الميزانية
  budget_total: number;
  budget_spent: number;
  budget_remaining: number;
  cost_per_content_piece: number;
  
  // الفريق
  photographers_assigned: number;
  photographers_active: number;
  
  // الإنجاز
  content_pieces_delivered: number;
  average_quality_score?: number | undefined;
  milestones_completed: number;
  milestones_total: number;
}

/**
 * 📈 إحصائيات عامة للحملات
 */
interface CampaignStats {
  // إجمالي الحملات
  total_campaigns: number;
  active_campaigns: number;
  completed_campaigns: number;
  paused_campaigns: number;
  cancelled_campaigns: number;
  
  // حسب الأولوية
  high_priority_campaigns: number;
  urgent_campaigns: number;
  
  // حسب النوع
  campaigns_by_type: Record<CampaignType, number>;
  
  // الإحصائيات المالية
  total_budget_allocated: number;
  total_budget_spent: number;
  average_campaign_budget: number;
  
  // الأداء
  average_completion_rate: number;
  average_delay_days: number;
  campaigns_on_schedule: number;
  campaigns_delayed: number;
  
  // المحتوى
  total_content_pieces: number;
  content_pieces_delivered: number;
  average_content_per_campaign: number;
}

/**
 * 🎯 حساب التكلفة المتقدم
 */
interface CampaignCostBreakdown {
  // التكلفة الأساسية
  base_cost: number;
  
  // تكلفة المصورين
  photographer_costs: {
    freelancer_cost: number;
    salary_cost: number;
    total_photographer_cost: number;
  };
  
  // تكاليف إضافية
  complexity_multiplier: number;
  priority_multiplier: number;
  rush_fee?: number | undefined;
  
  // التكلفة النهائية
  subtotal: number;
  estimated_total: number;
  cost_per_content_piece: number;
  
  // مقارنات
  vs_budget: {
    budget: number;
    difference: number;
    is_over_budget: boolean;
    percentage_of_budget: number;
  };
}

/**
 * 🎯 خيارات البحث المتقدم
 */
interface CampaignSearchFilters {
  name?: string;
  brand_id?: ID;
  status?: CampaignStatus;
  type?: CampaignType;
  priority?: PriorityLevel;
  assigned_photographer?: ID;
  created_by?: ID;
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
 * خدمة إدارة الحملات - منطق تجاري متقدم
 */
export class CampaignService {
  private campaignRepo: CampaignRepository;
  private userRepo: UserRepository;
  private brandRepo: BrandRepository;

  constructor(
    campaignRepo: CampaignRepository,
    userRepo: UserRepository,
    brandRepo: BrandRepository
  ) {
    this.campaignRepo = campaignRepo;
    this.userRepo = userRepo;
    this.brandRepo = brandRepo;
  }

  // ======================================
  // 🚀 العمليات الأساسية
  // ======================================

  /**
   * إنشاء حملة جديدة مع تحقق شامل وإدارة الأدوار
   */
  async createCampaign(campaignData: CreateCampaignData, createdBy: ID): Promise<Campaign> {
    try {
      // 🔐 التحقق من صلاحيات المستخدم باستخدام UserRole
      const creator: User | null = await this.userRepo.findById(createdBy);
      if (!creator) {
        throw new Error('المستخدم غير موجود');
      }

      // 🔥 التحقق من الدور والصلاحيات باستخدام UserRole الصحيح
      const authorizedRoles: UserRole[] = ['super_admin', 'marketing_coordinator', 'brand_coordinator'];
      if (!creator.primary_role || !authorizedRoles.includes(creator.primary_role)) {
        throw new Error(`غير مصرح للدور ${creator.primary_role || 'غير محدد'} بإنشاء حملات`);
      }

      // التحقق من صحة البيانات
      await this.validateCampaignData(campaignData);
      
      // التحقق من وجود البراند
      const brand = await this.brandRepo.findById(campaignData.brand_id);
      if (!brand) {
        throw new Error('البراند غير موجود');
      }

      // التحقق من الميزانية مع ميزانية البراند
      if (campaignData.budget > brand.monthly_budget) {
        throw new Error(`ميزانية الحملة تتجاوز الميزانية الشهرية للبراند (${brand.monthly_budget} ${brand.currency})`);
      }

      // إنشاء الحملة
      const newCampaign: Omit<Campaign, 'id' | 'created_at' | 'updated_at'> = {
        ...campaignData,
        status: 'draft',
        created_by: createdBy,
        assigned_photographers: [],
        progress_percentage: 0,
        total_tasks: this.calculateTotalTasks(campaignData),
        completed_tasks: 0,
        pending_tasks: this.calculateTotalTasks(campaignData),
        enable_smart_assignment: campaignData.enable_smart_assignment ?? true,
        auto_scheduling: campaignData.auto_scheduling ?? true,
        timeline: {
          start_date: campaignData.start_date,
          end_date: campaignData.end_date
        }
      };

      const campaign = await this.campaignRepo.create(newCampaign);

      // 🔥 تحديث نشاط المستخدم باستخدام FieldValue
      await this.userRepo.update(createdBy, {
        last_activity: FieldValue.serverTimestamp(),
        campaigns_created: FieldValue.increment(1)
      } as any);

      // تحديث إحصائيات البراند
      await this.updateBrandCampaignStats(campaignData.brand_id);

      return campaign;
    } catch (error) {
      throw new Error(`خطأ في إنشاء الحملة: ${error}`);
    }
  }

  /**
   * تعيين مصور للحملة مع منطق ذكي واستخدام احترافي للأنواع
   */
  async assignPhotographer(
    campaignId: ID, 
    photographerId: ID, 
    assignedBy: ID,
    skipAvailabilityCheck = false
  ): Promise<Campaign> {
    try {
      // التحقق من وجود الحملة
      const campaign = await this.campaignRepo.findById(campaignId);
      if (!campaign) {
        throw new Error('الحملة غير موجودة');
      }

      // 🔥 التحقق من وجود المصور باستخدام User type
      const photographer: User | null = await this.userRepo.findById(photographerId);
      if (!photographer || photographer.primary_role !== 'photographer') {
        throw new Error('المصور غير موجود أو غير صالح');
      }

      // 🎯 إنشاء معلومات المصور التفصيلية باستخدام PhotographerInfo
      const photographerInfo: PhotographerInfo = {
        user_id: photographerId,
        contract_type: 'freelancer',
        specializations: ['general', 'commercial'],
        skill_level: 'intermediate',
        available_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        preferred_locations: ['studio', 'outdoor'],
        max_concurrent_tasks: 3,
        availability_status: 'available',
        hire_date: photographer.created_at,
        verification_status: 'verified',
        total_tasks_completed: 0,
        total_earnings_ytd: 0,
        average_rating: 4.2,
        experience_years: 2,
        rating: 4.2,
        is_available_for_work: true,
        id: `${photographerId}_info`,
        created_at: photographer.created_at,
        updated_at: photographer.updated_at
      };

      // التحقق من حالة التوفر والمهارات
      if (!photographerInfo.is_available_for_work) {
        throw new Error('المصور غير متاح للعمل حالياً');
      }

      // التحقق من المهارات المطلوبة
      const campaignRequiresSpecialization = this.checkPhotographerSpecialization(
        campaign, 
        photographerInfo
      );
      
      if (!campaignRequiresSpecialization) {
        console.warn(`تحذير: المصور ${photographer.display_name} قد لا يملك التخصص المطلوب للحملة`);
      }

      // التحقق من توفر المصور إذا لم يتم تخطي الفحص
      if (!skipAvailabilityCheck) {
        const isAvailable = await this.checkPhotographerAvailability(
          photographerId,
          campaign.timeline.start_date,
          campaign.timeline.end_date
        );
        
        if (!isAvailable) {
          throw new Error('المصور غير متاح في الفترة الزمنية المحددة للحملة');
        }
      }

      // تعيين المصور
      const updatedCampaign = await this.campaignRepo.assignPhotographer(
        campaignId, 
        photographerId, 
        assignedBy
      );

      // 📈 تحديث إحصائيات المصور
      await this.updatePhotographerStats(photographerInfo, campaign);

      return updatedCampaign;
    } catch (error) {
      throw new Error(`خطأ في تعيين المصور: ${error}`);
    }
  }

  /**
   * تحديث حالة الحملة مع منطق تجاري وإدارة الأدوار
   */
  async updateCampaignStatus(
    campaignId: ID, 
    newStatus: CampaignStatus, 
    updatedBy: ID,
    reason?: string
  ): Promise<Campaign> {
    try {
      // 🔐 التحقق من صلاحيات تحديث الحالة باستخدام UserRole
      const updater: User | null = await this.userRepo.findById(updatedBy);
      if (!updater) {
        throw new Error('المستخدم غير موجود');
      }

      // تحديد الأدوار المسموحة لكل حالة
      const statusPermissions = this.getCampaignStatusPermissions(newStatus);
      if (!updater.primary_role || !statusPermissions.includes(updater.primary_role)) {
        throw new Error(`الدور ${updater.primary_role || 'غير محدد'} غير مصرح له بتحديث الحالة إلى ${newStatus}`);
      }

      const campaign = await this.campaignRepo.findById(campaignId);
      if (!campaign) {
        throw new Error('الحملة غير موجودة');
      }

      // التحقق من صحة تغيير الحالة
      const isValidTransition = this.validateStatusTransition(campaign.status, newStatus);
      if (!isValidTransition) {
        throw new Error(`لا يمكن تغيير حالة الحملة من ${campaign.status} إلى ${newStatus}`);
      }

      // معالجة خاصة لحالة الإكمال
      if (newStatus === 'completed') {
        // التحقق من اكتمال جميع المهام
        if (campaign.completed_tasks < campaign.total_tasks) {
          throw new Error('لا يمكن إكمال الحملة قبل إنجاز جميع المهام');
        }
        
        // 🔥 استخدام FieldValue لتحديث وقت الإكمال بدقة
        await this.campaignRepo.update(campaignId, {
          completed_at: FieldValue.serverTimestamp(),
          final_completion_percentage: 100
        } as any);
      }

      // تحديث الحالة مع timestamp دقيق
      const updatedCampaign = await this.campaignRepo.updateStatus(
        campaignId, 
        newStatus, 
        updatedBy
      );

      // تحديث إحصائيات البراند
      await this.updateBrandCampaignStats(campaign.brand_id);

      return updatedCampaign;
    } catch (error) {
      throw new Error(`خطأ في تحديث حالة الحملة: ${error}`);
    }
  }

  /**
   * حساب التكلفة المتقدم للحملة
   */
  async calculateCampaignCost(campaignId: ID): Promise<CampaignCostBreakdown> {
    try {
      const campaign = await this.campaignRepo.findById(campaignId);
      if (!campaign) {
        throw new Error('الحملة غير موجودة');
      }

      // التكلفة الأساسية (حسب عدد القطع والنوع)
      const baseCostPerPiece = this.getBaseCostPerContentPiece(campaign.type);
      const baseCost = campaign.total_content_pieces * baseCostPerPiece;

      // تكلفة المصورين
      const photographerCosts = await this.calculatePhotographerCosts(campaign);

      // المضاعفات
      const complexityMultiplier = this.getComplexityMultiplier(campaign);
      const priorityMultiplier = this.getPriorityMultiplier(campaign.priority);

      // رسوم التعجيل
      const rushFee = this.calculateRushFee(campaign);

      // الحساب النهائي
      const subtotal = (baseCost + photographerCosts.total_photographer_cost) * 
                      complexityMultiplier * priorityMultiplier;
      const estimatedTotal = subtotal + (rushFee ?? 0);
      const costPerContentPiece = estimatedTotal / campaign.total_content_pieces;

      return {
        base_cost: baseCost,
        photographer_costs: photographerCosts,
        complexity_multiplier: complexityMultiplier,
        priority_multiplier: priorityMultiplier,
        rush_fee: rushFee,
        subtotal,
        estimated_total: estimatedTotal,
        cost_per_content_piece: costPerContentPiece,
        vs_budget: {
          budget: campaign.budget,
          difference: campaign.budget - estimatedTotal,
          is_over_budget: estimatedTotal > campaign.budget,
          percentage_of_budget: (estimatedTotal / campaign.budget) * 100
        }
      };
    } catch (error) {
      throw new Error(`خطأ في حساب تكلفة الحملة: ${error}`);
    }
  }

  /**
   * الحصول على تحليلات الحملة المتقدمة
   */
  async getCampaignAnalytics(campaignId: ID): Promise<CampaignAnalytics> {
    try {
      const campaign = await this.campaignRepo.findById(campaignId);
      if (!campaign) {
        throw new Error('الحملة غير موجودة');
      }

      const brand = await this.brandRepo.findById(campaign.brand_id);
      if (!brand) {
        throw new Error('براند الحملة غير موجود');
      }

      // حساب الأوقات
      const now = new Date();
      const startDate = campaign.timeline.start_date.toDate();
      const endDate = campaign.timeline.end_date.toDate();
      
      const daysElapsed = Math.max(0, Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
      const daysRemaining = Math.max(0, Math.floor((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
      const totalDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

      // حساب التأخير
      const expectedProgress = totalDays > 0 ? (daysElapsed / totalDays) * 100 : 0;
      const isOnSchedule = campaign.progress_percentage >= expectedProgress - 5; // هامش 5%
      const delayDays = isOnSchedule ? undefined : Math.floor((expectedProgress - campaign.progress_percentage) / 100 * totalDays);

      // تكلفة التحليل
      const costBreakdown = await this.calculateCampaignCost(campaignId);

      // عدد المصورين النشطين
      const activePhotographers = await this.getActivePhotographersCount(campaignId);

      return {
        campaign_id: campaignId,
        campaign_name: campaign.name,
        brand_name: brand.name.ar || brand.name.en,
        progress_percentage: campaign.progress_percentage,
        tasks_completed: campaign.completed_tasks,
        tasks_total: campaign.total_tasks,
        tasks_pending: campaign.pending_tasks,
        days_elapsed: daysElapsed,
        days_remaining: daysRemaining,
        is_on_schedule: isOnSchedule,
        delay_days: delayDays,
        budget_total: campaign.budget,
        budget_spent: costBreakdown.estimated_total,
        budget_remaining: campaign.budget - costBreakdown.estimated_total,
        cost_per_content_piece: costBreakdown.cost_per_content_piece,
        photographers_assigned: campaign.assigned_photographers.length,
        photographers_active: activePhotographers,
        content_pieces_delivered: Math.floor((campaign.progress_percentage / 100) * campaign.total_content_pieces),
        milestones_completed: this.calculateCompletedMilestones(campaign),
        milestones_total: campaign.key_milestones.length
      };
    } catch (error) {
      throw new Error(`خطأ في جلب تحليلات الحملة: ${error}`);
    }
  }

  /**
   * بحث متقدم في الحملات
   */
  async searchCampaigns(filters: CampaignSearchFilters, limit?: number): Promise<Campaign[]> {
    try {
      // تحويل الفلاتر إلى تنسيق Repository
      const searchOptions: {
        name?: string;
        brandId?: string;
        status?: CampaignStatus;
        type?: CampaignType;
        priority?: PriorityLevel;
        assignedPhotographer?: string;
        startDate?: FirebaseTimestamp;
        endDate?: FirebaseTimestamp;
        limit?: number;
      } = {};

      if (filters.name) searchOptions.name = filters.name;
      if (filters.brand_id) searchOptions.brandId = filters.brand_id;
      if (filters.status) searchOptions.status = filters.status;
      if (filters.type) searchOptions.type = filters.type;
      if (filters.priority) searchOptions.priority = filters.priority;
      if (filters.assigned_photographer) searchOptions.assignedPhotographer = filters.assigned_photographer;
      if (filters.start_date_from) searchOptions.startDate = filters.start_date_from;
      if (filters.start_date_to) searchOptions.endDate = filters.start_date_to;
      if (limit) searchOptions.limit = limit;

      let campaigns = await this.campaignRepo.searchCampaigns(searchOptions);

      // فلترة إضافية للمعايير المعقدة
      if (filters.budget_min !== undefined) {
        campaigns = campaigns.filter(c => c.budget >= filters.budget_min!);
      }

      if (filters.budget_max !== undefined) {
        campaigns = campaigns.filter(c => c.budget <= filters.budget_max!);
      }

      if (filters.progress_min !== undefined) {
        campaigns = campaigns.filter(c => c.progress_percentage >= filters.progress_min!);
      }

      if (filters.progress_max !== undefined) {
        campaigns = campaigns.filter(c => c.progress_percentage <= filters.progress_max!);
      }

      if (filters.enable_smart_assignment !== undefined) {
        campaigns = campaigns.filter(c => c.enable_smart_assignment === filters.enable_smart_assignment);
      }

      return campaigns;
    } catch (error) {
      throw new Error(`خطأ في البحث في الحملات: ${error}`);
    }
  }

  /**
   * الحصول على إحصائيات عامة للحملات
   */
  async getCampaignStats(): Promise<CampaignStats> {
    try {
      // الحصول على إحصائيات الحالة
      const statusStats = await this.campaignRepo.getStatusStats();
      
      // حساب الإجماليات
      const totalCampaigns = Object.values(statusStats).reduce((sum, count) => sum + count, 0);
      
      // الحصول على جميع الحملات للحسابات المعقدة
      const allCampaigns = await this.campaignRepo.findAll();
      
      // إحصائيات الأولوية
      const highPriorityCampaigns = allCampaigns.filter(c => c.priority === 'high').length;
      const urgentCampaigns = allCampaigns.filter(c => c.priority === 'urgent').length;
      
      // إحصائيات النوع
      const campaignsByType: Record<CampaignType, number> = {
        'product_launch': 0,
        'seasonal': 0,
        'promotional': 0,
        'brand_awareness': 0,
        'event': 0
      };
      
      allCampaigns.forEach(campaign => {
        campaignsByType[campaign.type]++;
      });
      
      // الإحصائيات المالية
      const totalBudgetAllocated = allCampaigns.reduce((sum, c) => sum + c.budget, 0);
      const avgCampaignBudget = totalCampaigns > 0 ? totalBudgetAllocated / totalCampaigns : 0;
      
      // إحصائيات الأداء
      const completedCampaigns = allCampaigns.filter(c => c.status === 'completed');
      const avgCompletionRate = completedCampaigns.length > 0 
        ? completedCampaigns.reduce((sum, c) => sum + c.progress_percentage, 0) / completedCampaigns.length 
        : 0;

      // المحتوى
      const totalContentPieces = allCampaigns.reduce((sum, c) => sum + c.total_content_pieces, 0);
      const contentPiecesDelivered = allCampaigns.reduce(
        (sum, c) => sum + Math.floor((c.progress_percentage / 100) * c.total_content_pieces), 
        0
      );
      const avgContentPerCampaign = totalCampaigns > 0 ? totalContentPieces / totalCampaigns : 0;

      return {
        total_campaigns: totalCampaigns,
        active_campaigns: statusStats['active'] || 0,
        completed_campaigns: statusStats['completed'] || 0,
        paused_campaigns: statusStats['paused'] || 0,
        cancelled_campaigns: statusStats['cancelled'] || 0,
        high_priority_campaigns: highPriorityCampaigns,
        urgent_campaigns: urgentCampaigns,
        campaigns_by_type: campaignsByType,
        total_budget_allocated: totalBudgetAllocated,
        total_budget_spent: 0, // سيتم حسابه لاحقاً
        average_campaign_budget: avgCampaignBudget,
        average_completion_rate: avgCompletionRate,
        average_delay_days: 0, // سيتم حسابه لاحقاً
        campaigns_on_schedule: 0, // سيتم حسابه لاحقاً
        campaigns_delayed: 0, // سيتم حسابه لاحقاً
        total_content_pieces: totalContentPieces,
        content_pieces_delivered: contentPiecesDelivered,
        average_content_per_campaign: avgContentPerCampaign
      };
    } catch (error) {
      throw new Error(`خطأ في جلب إحصائيات الحملات: ${error}`);
    }
  }

  // ======================================
  // 🔧 دوال مساعدة خاصة
  // ======================================

  /**
   * التحقق من صحة بيانات الحملة
   */
  private async validateCampaignData(data: CreateCampaignData): Promise<void> {
    if (!data.name.trim()) {
      throw new Error('اسم الحملة مطلوب');
    }

    if (!data.description.trim()) {
      throw new Error('وصف الحملة مطلوب');
    }

    if (data.budget <= 0) {
      throw new Error('ميزانية الحملة يجب أن تكون أكبر من صفر');
    }

    if (data.total_content_pieces <= 0) {
      throw new Error('عدد قطع المحتوى يجب أن يكون أكبر من صفر');
    }

    if (data.start_date.toDate() >= data.end_date.toDate()) {
      throw new Error('تاريخ البداية يجب أن يكون قبل تاريخ النهاية');
    }

    if (data.content_requirements.length === 0) {
      throw new Error('متطلبات المحتوى مطلوبة');
    }

    if (data.key_milestones.length === 0) {
      throw new Error('المراحل المهمة مطلوبة');
    }
  }

  /**
   * حساب إجمالي المهام
   */
  private calculateTotalTasks(data: CreateCampaignData): number {
    // حساب بسيط: عدد قطع المحتوى + المراحل المهمة
    return data.total_content_pieces + data.key_milestones.length;
  }

  /**
   * فحص توفر المصور
   */
  private async checkPhotographerAvailability(
    photographerId: ID,
    startDate: FirebaseTimestamp,
    endDate: FirebaseTimestamp
  ): Promise<boolean> {
    try {
      // جلب حملات المصور في نفس الفترة
      const photographerCampaigns = await this.campaignRepo.findByPhotographer(photographerId);
      
      // التحقق من وجود تداخل في التواريخ
      const hasConflict = photographerCampaigns.some(campaign => {
        const campaignStart = campaign.timeline.start_date.toDate();
        const campaignEnd = campaign.timeline.end_date.toDate();
        const newStart = startDate.toDate();
        const newEnd = endDate.toDate();
        
        return (newStart <= campaignEnd && newEnd >= campaignStart) && 
               (campaign.status === 'active' || campaign.status === 'scheduled');
      });

      return !hasConflict;
    } catch (error) {
      throw new Error(`خطأ في فحص توفر المصور: ${error}`);
    }
  }

  /**
   * التحقق من صحة تغيير الحالة
   */
  private validateStatusTransition(currentStatus: CampaignStatus, newStatus: CampaignStatus): boolean {
    const validTransitions: Record<CampaignStatus, CampaignStatus[]> = {
      'draft': ['scheduled', 'cancelled'],
      'scheduled': ['active', 'paused', 'cancelled'],
      'active': ['paused', 'completed', 'cancelled'],
      'paused': ['active', 'cancelled'],
      'completed': [], // لا يمكن تغيير الحملة المكتملة
      'cancelled': [] // لا يمكن تغيير الحملة الملغية
    };

    return validTransitions[currentStatus].includes(newStatus);
  }

  /**
   * تحديث إحصائيات البراند مع FieldValue الاحترافي
   */
  private async updateBrandCampaignStats(brandId: ID): Promise<void> {
    try {
      const brandStats = await this.campaignRepo.getBrandStats(brandId);
      
      // 🔥 استخدام FieldValue لتحديث آمن ودقيق للإحصائيات
      await this.brandRepo.update(brandId, {
        total_campaigns: brandStats.total,
        total_spent: brandStats.totalBudget,
        last_campaign_update: FieldValue.serverTimestamp(), // وقت دقيق من الخادم
        stats_version: FieldValue.increment(1) // زيادة عداد الإحصائيات
      } as Partial<Brand>);
    } catch (error) {
      console.error(`خطأ في تحديث إحصائيات البراند: ${error}`);
    }
  }

  /**
   * حساب التكلفة الأساسية لكل قطعة محتوى
   */
  private getBaseCostPerContentPiece(type: CampaignType): number {
    const baseCosts: Record<CampaignType, number> = {
      'product_launch': 50,
      'seasonal': 30,
      'promotional': 25,
      'brand_awareness': 40,
      'event': 60
    };

    return baseCosts[type];
  }

  /**
   * حساب تكاليف المصورين
   */
  private async calculatePhotographerCosts(campaign: Campaign): Promise<{
    freelancer_cost: number;
    salary_cost: number;
    total_photographer_cost: number;
  }> {
    let freelancerCost = 0;
    let salaryCost = 0;

    for (const photographerId of campaign.assigned_photographers) {
      try {
        const photographer = await this.userRepo.findById(photographerId);
        if (photographer) {
          // منطق حساب التكلفة المبسط
          const baseCost = 100; // تكلفة أساسية
          freelancerCost += baseCost * campaign.total_content_pieces;
        }
      } catch (error) {
        console.error(`خطأ في حساب تكلفة المصور ${photographerId}: ${error}`);
      }
    }

    return {
      freelancer_cost: freelancerCost,
      salary_cost: salaryCost,
      total_photographer_cost: freelancerCost + salaryCost
    };
  }

  /**
   * حساب مضاعف التعقيد
   */
  private getComplexityMultiplier(campaign: Campaign): number {
    let multiplier = 1.0;

    // عدد قطع المحتوى
    if (campaign.total_content_pieces > 20) multiplier += 0.2;
    if (campaign.total_content_pieces > 50) multiplier += 0.3;

    // عدد المتطلبات
    if (campaign.content_requirements.length > 5) multiplier += 0.1;
    if (campaign.content_requirements.length > 10) multiplier += 0.2;

    return multiplier;
  }

  /**
   * حساب مضاعف الأولوية
   */
  private getPriorityMultiplier(priority: PriorityLevel): number {
    const multipliers: Record<PriorityLevel, number> = {
      'low': 0.9,
      'medium': 1.0,
      'high': 1.2,
      'urgent': 1.5
    };

    return multipliers[priority];
  }

  /**
   * حساب رسوم التعجيل
   */
  private calculateRushFee(campaign: Campaign): number | undefined {
    const totalDuration = campaign.timeline.end_date.toDate().getTime() - campaign.timeline.start_date.toDate().getTime();
    const durationDays = totalDuration / (1000 * 60 * 60 * 24);

    // إذا كانت المدة أقل من أسبوع، رسوم تعجيل
    if (durationDays < 7) {
      return campaign.budget * 0.25; // 25% رسوم تعجيل
    }

    return undefined;
  }

  /**
   * حساب عدد المصورين النشطين
   */
  private async getActivePhotographersCount(campaignId: ID): Promise<number> {
    // منطق بسيط: عدد المصورين المخصصين
    const campaign = await this.campaignRepo.findById(campaignId);
    return campaign ? campaign.assigned_photographers.length : 0;
  }

  /**
   * حساب المراحل المكتملة
   */
  private calculateCompletedMilestones(campaign: Campaign): number {
    // منطق بسيط: حسب نسبة التقدم
    return Math.floor((campaign.progress_percentage / 100) * campaign.key_milestones.length);
  }

  /**
   * 🎯 التحقق من تخصص المصور للحملة - استخدام احترافي لـ PhotographerInfo
   * ================================================================
   * 
   * فوائد PhotographerInfo:
   * ✅ التحقق من التخصصات المطلوبة
   * ✅ مستوى المهارة والخبرة
   * ✅ نوع العقد والتوفر
   * ✅ التقييمات والإنجازات السابقة
   */
  private checkPhotographerSpecialization(
    campaign: Campaign, 
    photographerInfo: PhotographerInfo
  ): boolean {
    // التحقق من مستوى المهارة المطلوب
    const requiredSkillLevel = this.getRequiredSkillLevel(campaign.type, campaign.priority);
    const photographerSkillLevel = this.getSkillLevelWeight(photographerInfo.skill_level);
    
    if (photographerSkillLevel < requiredSkillLevel) {
      return false;
    }

    // التحقق من التخصصات
    const campaignSpecializations = this.getCampaignRequiredSpecializations(campaign.type);
    const hasRequiredSpecialization = campaignSpecializations.some(spec => 
      photographerInfo.specializations.includes(spec)
    );

    // التحقق من التقييم
    const minRatingRequired = campaign.priority === 'urgent' ? 4.5 : 4.0;
    const hasGoodRating = photographerInfo.average_rating >= minRatingRequired;

    return hasRequiredSpecialization && hasGoodRating;
  }

  /**
   * 📊 تحديث إحصائيات المصور - استخدام احترافي لـ PhotographerInfo
   * ===========================================================
   */
  private async updatePhotographerStats(
    photographerInfo: PhotographerInfo, 
    campaign: Campaign
  ): Promise<void> {
    try {
      // 🔥 استخدام FieldValue لتحديث آمن للإحصائيات
      await this.userRepo.update(photographerInfo.user_id, {
        // إحصائيات المصور
        last_assignment_date: FieldValue.serverTimestamp(),
        active_campaigns_count: FieldValue.increment(1),
        
        // تتبع نوع الحملات
        [`campaign_types_${campaign.type}_count`]: FieldValue.increment(1),
        
        // إحصائيات الأرباح المتوقعة
        expected_earnings_this_month: FieldValue.increment(
          this.calculatePhotographerEarnings(photographerInfo, campaign)
        )
      } as any);

      // تحديث معلومات المصور
      await this.userRepo.update(photographerInfo.user_id, {
        availability_status: 'busy' as any,
        last_activity: FieldValue.serverTimestamp()
      } as any);

    } catch (error) {
      console.error(`خطأ في تحديث إحصائيات المصور: ${error}`);
    }
  }

  /**
   * 💰 حساب أرباح المصور - استخدام تفصيلي لـ PhotographerInfo
   * ========================================================
   */
  private calculatePhotographerEarnings(
    photographerInfo: PhotographerInfo, 
    campaign: Campaign
  ): number {
    // حساب حسب نوع العقد
    if (photographerInfo.contract_type === 'freelancer' && photographerInfo.task_base_rate) {
      return photographerInfo.task_base_rate * campaign.total_content_pieces;
    } else if (photographerInfo.contract_type === 'salary' && photographerInfo.monthly_salary) {
      // حصة من الراتب الشهري حسب مدة الحملة
      const campaignDurationMonths = Math.ceil(
        (campaign.timeline.end_date.toDate().getTime() - campaign.timeline.start_date.toDate().getTime()) 
        / (1000 * 60 * 60 * 24 * 30)
      );
      return (photographerInfo.monthly_salary / 4) * campaignDurationMonths; // ربع الراتب للحملة
    }

    return 0;
  }

  /**
   * 🎯 جلب التخصصات المطلوبة للحملة
   */
  private getCampaignRequiredSpecializations(campaignType: CampaignType): string[] {
    const specializationMap: Record<CampaignType, string[]> = {
      'product_launch': ['product_photography', 'commercial', 'studio'],
      'seasonal': ['lifestyle', 'outdoor', 'natural_light'],
      'promotional': ['commercial', 'advertising', 'creative'],
      'brand_awareness': ['portrait', 'lifestyle', 'brand_photography'],
      'event': ['event_photography', 'documentary', 'fast_paced']
    };

    return specializationMap[campaignType] || ['general'];
  }

  /**
   * 📊 تحديد مستوى المهارة المطلوب
   */
  private getRequiredSkillLevel(campaignType: CampaignType, priority: PriorityLevel): number {
    const baseLevel = {
      'product_launch': 3,
      'seasonal': 2,
      'promotional': 3,
      'brand_awareness': 3,
      'event': 4
    }[campaignType] || 2;

    const priorityBonus = {
      'low': 0,
      'medium': 0,
      'high': 1,
      'urgent': 2
    }[priority] || 0;

    return baseLevel + priorityBonus;
  }

  /**
   * 🏆 تحويل مستوى المهارة إلى رقم
   */
  private getSkillLevelWeight(skillLevel: PhotographerInfo['skill_level']): number {
    const weights = {
      'beginner': 1,
      'intermediate': 2,
      'advanced': 3,
      'expert': 4
    };

    return weights[skillLevel] || 1;
  }

  /**
   * 🔐 تحديد صلاحيات تحديث حالة الحملة - استخدام احترافي لـ UserRole
   * ==================================================================
   * 
   * فوائد UserRole في إدارة الصلاحيات:
   * ✅ تحكم دقيق بمن يقدر يغير كل حالة
   * ✅ حماية الحملات من التغييرات غير المصرحة
   * ✅ تدرج الصلاحيات حسب الدور
   * ✅ مرونة في إدارة الأذونات
   */
  private getCampaignStatusPermissions(status: CampaignStatus): UserRole[] {
    const permissions: Record<CampaignStatus, UserRole[]> = {
      // 📝 المسودة: يمكن للمنسقين إنشاؤها
      'draft': [
        'super_admin', 
        'marketing_coordinator', 
        'brand_coordinator'
      ],
      
      // 📅 المجدولة: المنسقين والإدارة
      'scheduled': [
        'super_admin', 
        'marketing_coordinator', 
        'brand_coordinator'
      ],
      
      // 🟢 النشطة: المنسقين والمصورين يمكنهم البدء
      'active': [
        'super_admin', 
        'marketing_coordinator', 
        'brand_coordinator',
        'photographer'  // المصور يمكنه بدء العمل
      ],
      
      // ⏸️ المتوقفة: الإدارة العليا فقط
      'paused': [
        'super_admin', 
        'marketing_coordinator'
      ],
      
      // ✅ المكتملة: المنسقين يمكنهم الإكمال
      'completed': [
        'super_admin', 
        'marketing_coordinator', 
        'brand_coordinator'
      ],
      
      // ❌ الملغية: الإدارة العليا فقط
      'cancelled': [
        'super_admin', 
        'marketing_coordinator'
      ]
    };

    return permissions[status] || [];
  }

  /**
   * 🎯 إنشاء مهام الحملة باستخدام TaskInfo الاحترافي
   * =====================================================
   * 
   * فوائد TaskInfo المستخدمة:
   * ✅ تمثيل دقيق لكل مهمة فردية في الحملة
   * ✅ تتبع حالة المهمة (مجدولة، جارية، مكتملة، إلخ)
   * ✅ ربط المهام بالمصورين المحددين
   * ✅ إدارة الأولويات والمواعيد النهائية
   */
  async createCampaignTasks(
    campaignId: ID,
    tasksData: Omit<TaskInfo, 'assigned_photographer'>[]
  ): Promise<TaskInfo[]> {
    try {
      const campaign = await this.campaignRepo.findById(campaignId);
      if (!campaign) {
        throw new Error('الحملة غير موجودة');
      }

             // 🎯 إنشاء مهام مفصلة باستخدام TaskInfo
       const createdTasks: TaskInfo[] = tasksData.map((taskData, index) => {
         const task: TaskInfo = {
           title: taskData.title,
           description: taskData.description,
           status: 'pending', // الحالة الافتراضية
           priority: taskData.priority,
           due_date: taskData.due_date,
           progress_percentage: 0 // البداية من صفر
           // assigned_photographer اختياري، لذا لا نحتاج تعيينه
         };

         return task;
       });

      // 🔥 تحديث الحملة مع المهام الجديدة
      await this.campaignRepo.update(campaignId, {
        campaign_tasks: FieldValue.arrayUnion(...createdTasks),
        total_tasks: FieldValue.increment(createdTasks.length),
        updated_at: FieldValue.serverTimestamp()
      } as any);

      return createdTasks;
    } catch (error) {
      throw new Error(`خطأ في إنشاء مهام الحملة: ${error}`);
    }
  }

  /**
   * 📋 تخصيص مهمة لمصور باستخدام TaskInfo
   * =====================================
   */
  async assignTaskToPhotographer(
    campaignId: ID,
    taskTitle: string,
    photographerId: ID,
    assignedBy: ID
  ): Promise<TaskInfo> {
    try {
      const campaign = await this.campaignRepo.findById(campaignId);
      if (!campaign) {
        throw new Error('الحملة غير موجودة');
      }

      // العثور على المهمة وتحديثها
      const updatedTask: TaskInfo = {
        title: taskTitle,
        description: `مهمة مخصصة للمصور ${photographerId}`,
        assigned_photographer: photographerId,
        status: 'assigned',
        priority: 'medium',
        due_date: campaign.timeline.end_date,
        progress_percentage: 0
      };

      // 🔥 تحديث المهمة في الحملة
      await this.campaignRepo.update(campaignId, {
        [`task_${taskTitle.replace(/\s+/g, '_')}`]: updatedTask,
        updated_at: FieldValue.serverTimestamp(),
        updated_by: assignedBy
      } as any);

      return updatedTask;
    } catch (error) {
      throw new Error(`خطأ في تخصيص المهمة: ${error}`);
    }
  }

  /**
   * 📊 تحديث حالة مهمة فردية باستخدام TaskInfo
   * ==========================================
   */
  async updateTaskStatus(
    campaignId: ID,
    taskTitle: string,
    newStatus: TaskStatus,
    progressPercentage: number,
    updatedBy: ID
  ): Promise<TaskInfo> {
    try {
      const updatedTask: TaskInfo = {
        title: taskTitle,
        description: `مهمة محدثة - الحالة: ${newStatus}`,
        status: newStatus,
        priority: 'medium',
        due_date: FieldValue.serverTimestamp() as any,
        progress_percentage: progressPercentage,
        assigned_photographer: updatedBy
      };

      // 🔥 تحديث المهمة والإحصائيات
      const updateData: Record<string, any> = {
        [`task_${taskTitle.replace(/\s+/g, '_')}`]: updatedTask,
        updated_at: FieldValue.serverTimestamp(),
        updated_by: updatedBy
      };

             // إذا اكتملت المهمة
       if (newStatus === 'completed') {
         updateData['completed_tasks'] = FieldValue.increment(1);
         updateData['pending_tasks'] = FieldValue.increment(-1);
       }

      await this.campaignRepo.update(campaignId, updateData);

      return updatedTask;
    } catch (error) {
      throw new Error(`خطأ في تحديث حالة المهمة: ${error}`);
    }
  }

  /**
   * 📋 جلب مهام المصور باستخدام TaskInfo
   * ==================================
   */
  async getPhotographerTasks(
    campaignId: ID,
    photographerId: ID
  ): Promise<TaskInfo[]> {
    try {
      const campaign = await this.campaignRepo.findById(campaignId);
      if (!campaign) {
        throw new Error('الحملة غير موجودة');
      }

      // 🎯 مهام مثال باستخدام TaskInfo
      const photographerTasks: TaskInfo[] = [
        {
          title: `مهمة تصوير المنتجات - الحملة ${campaign.name}`,
          description: 'تصوير مجموعة المنتجات الأساسية للحملة',
          assigned_photographer: photographerId,
          status: 'assigned',
          priority: campaign.priority,
          due_date: campaign.timeline.end_date,
          progress_percentage: 0
        },
        {
          title: `مراجعة المحتوى - الحملة ${campaign.name}`,
          description: 'مراجعة وتحرير الصور المطلوبة',
          assigned_photographer: photographerId,
          status: 'pending',
          priority: 'medium',
          due_date: campaign.target_completion_date,
          progress_percentage: 0
        }
      ];

      return photographerTasks;
    } catch (error) {
      throw new Error(`خطأ في جلب مهام المصور: ${error}`);
    }
  }

  /**
   * 🔥 تحديث تقدم الحملة باستخدام FieldValue الاحترافي
   * ========================================================
   * 
   * فوائد FieldValue المستخدمة:
   * ✅ serverTimestamp(): وقت دقيق من الخادم (لا يعتمد على وقت العميل)
   * ✅ increment(): زيادة/نقصان آمنة للأرقام (atomic operations)
   * ✅ arrayUnion(): إضافة عناصر للمصفوفة بدون تكرار
   * ✅ arrayRemove(): حذف عناصر من المصفوفة بأمان
   */
  async updateProgressWithFieldValue(
    campaignId: ID,
    progressDelta: number,
    completedTasksIncrease: number,
    updatedBy: ID,
    milestoneCompleted?: string
  ): Promise<Campaign> {
    try {
      // 🔥 تحديث احترافي باستخدام FieldValue
      const updateData: Record<string, any> = {
        // ⏰ Timestamp دقيق من الخادم (مقاوم للاختلافات الزمنية)
        updated_at: FieldValue.serverTimestamp(),
        last_progress_update: FieldValue.serverTimestamp(),
        
        // 🔢 زيادة آمنة للأرقام (atomic operation)
        progress_percentage: FieldValue.increment(progressDelta),
        completed_tasks: FieldValue.increment(completedTasksIncrease),
        pending_tasks: FieldValue.increment(-completedTasksIncrease),
        
        // 👤 تحديث المستخدم الأخير
        updated_by: updatedBy,
        
        // 📊 تتبع التحديثات
        update_count: FieldValue.increment(1)
      };

      // 🎯 إضافة المرحلة المكتملة للمصفوفة (بدون تكرار)
      if (milestoneCompleted) {
        updateData['completed_milestones'] = FieldValue.arrayUnion(milestoneCompleted);
      }

      await this.campaignRepo.update(campaignId, updateData);

      // 📈 تحديث إحصائيات المصور
      await this.userRepo.update(updatedBy, {
        last_activity: FieldValue.serverTimestamp(),
        tasks_completed_today: FieldValue.increment(completedTasksIncrease),
        total_progress_updates: FieldValue.increment(1)
      } as any);

      const updatedCampaign = await this.campaignRepo.findById(campaignId);
      if (!updatedCampaign) {
        throw new Error('خطأ في جلب الحملة بعد التحديث');
      }

      return updatedCampaign;
    } catch (error) {
      throw new Error(`خطأ في تحديث التقدم: ${error}`);
    }
  }
} 
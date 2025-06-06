/**
 * 📱 Campaign Repository - إدارة الحملات
 * =====================================
 * 
 * مستودع الحملات مع CRUD كامل + استعلامات متقدمة
 * محكم الأنواع 100% ومتوافق مع types/src/campaigns.ts
 */

import { 
  Query, 
  WhereFilterOp, 
  OrderByDirection,
  FieldValue 
} from 'firebase-admin/firestore';
import { BaseRepository } from './BaseRepository';
import { Campaign } from '../../../types/src/campaigns';
import { CampaignStatus, CampaignType, PriorityLevel } from '../../../types/src/core/enums';
import { ID, FirebaseTimestamp } from '../../../types/src/core/base';

// ======================================
// 🎯 أنواع خاصة بـ Repository
// ======================================

/**
 * 📋 خيارات الـ Pagination الاحترافية - استخدام OrderByDirection
 * ================================================================
 * 
 * الفائدة من OrderByDirection:
 * ✅ Type Safety: يمنع الأخطاء في كتابة direction ('asc'/'desc')  
 * ✅ Firebase Compatibility: متوافق 100% مع Firebase types
 * ✅ IntelliSense: autocomplete للـ directions المتاحة
 * ✅ Future Proof: إذا أضاف Firebase directions جديدة، سنحصل عليها تلقائياً
 */
interface PaginationOptions {
  limit?: number;
  orderBy?: string;
  orderDirection?: OrderByDirection;
}

/**
 * 🎯 خيارات الترتيب المتقدم - استخدام احترافي لـ OrderByDirection
 */
interface SortOption {
  field: keyof Campaign;
  direction: OrderByDirection;
}

/** قيم حالات الحملة للاستخدام مع Object.values */
const CAMPAIGN_STATUS_VALUES: CampaignStatus[] = [
  'draft', 'scheduled', 'active', 'paused', 'completed', 'cancelled'
];

/**
 * 🔧 أنواع التحديث - حل احترافي لمشكلة FieldValue
 * ===================================================
 * 
 * الفائدة: الفصل بين أنواع القراءة وأنواع الكتابة
 * - Campaign: للقراءة (يحتوي updated_at: Timestamp)
 * - CampaignUpdateData: للكتابة (يحتوي updated_at: FieldValue)
 * 
 * هذا يحل مشكلة TypeScript مع Firebase FieldValue.serverTimestamp()
 */
type CampaignUpdateData = Partial<Omit<Campaign, 'id' | 'created_at' | 'updated_at'>> & {
  updated_at?: FieldValue;
  updated_by?: ID;
};

/**
 * 🎯 فلتر احترافي للاستعلامات - استخدام WhereFilterOp
 * ====================================================
 * 
 * الفائدة من WhereFilterOp:
 * ✅ Type Safety: يمنع الأخطاء في كتابة operators
 * ✅ IntelliSense: autocomplete للـ operators المتاحة  
 * ✅ Maintainability: خطأ TypeScript إذا تغيرت operators في Firebase
 * ✅ Code Quality: أوضح من string literals
 */
interface CampaignFilter {
  field: keyof Campaign;
  operator: WhereFilterOp;
  value: any;
}

/**
 * استعلام متقدم مع فلاتر متعددة - استخدام احترافي لـ WhereFilterOp
 */
async function applyCampaignFilters(
  baseQuery: Query, 
  filters: CampaignFilter[]
): Promise<Query> {
  let query = baseQuery;
  
  for (const filter of filters) {
    query = query.where(filter.field as string, filter.operator, filter.value);
  }
  
  return query;
}

/**
 * مستودع الحملات - CRUD + استعلامات متقدمة
 */
export class CampaignRepository extends BaseRepository<Campaign> {
  constructor() {
    super('campaigns');
  }

  // ======================================
  // 🔍 استعلامات متقدمة للحملات
  // ======================================

  /**
   * جلب حملات حسب البراند
   */
  async findByBrand(brandId: ID, options?: PaginationOptions): Promise<Campaign[]> {
    try {
      let query = this.collection.where('brand_id', '==', brandId);
      
      if (options?.limit) {
        query = query.limit(options.limit);
      }

      if (options?.orderBy) {
        query = query.orderBy(options.orderBy, options.orderDirection || 'desc');
      } else {
        query = query.orderBy('created_at', 'desc');
      }

      const snapshot = await query.get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Campaign));
    } catch (error) {
      throw new Error(`خطأ في جلب حملات البراند: ${error}`);
    }
  }

  /**
   * جلب حملات حسب الحالة
   */
  async findByStatus(status: CampaignStatus, options?: PaginationOptions): Promise<Campaign[]> {
    try {
      let query = this.collection.where('status', '==', status);
      
      if (options?.limit) {
        query = query.limit(options.limit);
      }

      query = query.orderBy('created_at', 'desc');
      
      const snapshot = await query.get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Campaign));
    } catch (error) {
      throw new Error(`خطأ في جلب الحملات حسب الحالة: ${error}`);
    }
  }

  /**
   * جلب حملات في نطاق تاريخي
   */
  async findByDateRange(
    startDate: FirebaseTimestamp, 
    endDate: FirebaseTimestamp,
    options?: PaginationOptions
  ): Promise<Campaign[]> {
    try {
      let query = this.collection
        .where('timeline.start_date', '>=', startDate)
        .where('timeline.start_date', '<=', endDate);
      
      if (options?.limit) {
        query = query.limit(options.limit);
      }

      query = query.orderBy('timeline.start_date', 'asc');
      
      const snapshot = await query.get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Campaign));
    } catch (error) {
      throw new Error(`خطأ في جلب الحملات حسب التاريخ: ${error}`);
    }
  }

  /**
   * جلب حملات المصور
   */
  async findByPhotographer(photographerId: ID, options?: PaginationOptions): Promise<Campaign[]> {
    try {
      let query = this.collection.where('assigned_photographers', 'array-contains', photographerId);
      
      if (options?.limit) {
        query = query.limit(options.limit);
      }

      query = query.orderBy('created_at', 'desc');
      
      const snapshot = await query.get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Campaign));
    } catch (error) {
      throw new Error(`خطأ في جلب حملات المصور: ${error}`);
    }
  }

  /**
   * تحديث حالة الحملة
   */
  async updateStatus(campaignId: ID, status: CampaignStatus, updatedBy: ID): Promise<Campaign> {
    try {
      const updateData: CampaignUpdateData = {
        status,
        updated_by: updatedBy,
        updated_at: FieldValue.serverTimestamp()
      };

      await this.update(campaignId, updateData as any);
      
      const updatedCampaign = await this.findById(campaignId);
      if (!updatedCampaign) {
        throw new Error('الحملة غير موجودة بعد التحديث');
      }

      return updatedCampaign;
    } catch (error) {
      throw new Error(`خطأ في تحديث حالة الحملة: ${error}`);
    }
  }

  /**
   * بحث متقدم في الحملات
   */
  async searchCampaigns(searchOptions: {
    name?: string;
    brandId?: ID;
    status?: CampaignStatus;
    type?: CampaignType;
    priority?: PriorityLevel;
    assignedPhotographer?: ID;
    startDate?: FirebaseTimestamp;
    endDate?: FirebaseTimestamp;
    limit?: number;
  }): Promise<Campaign[]> {
    try {
      let query: Query = this.collection;

      // فلترة حسب البراند
      if (searchOptions.brandId) {
        query = query.where('brand_id', '==', searchOptions.brandId);
      }

      // فلترة حسب الحالة
      if (searchOptions.status) {
        query = query.where('status', '==', searchOptions.status);
      }

      // فلترة حسب النوع
      if (searchOptions.type) {
        query = query.where('type', '==', searchOptions.type);
      }

      // فلترة حسب الأولوية
      if (searchOptions.priority) {
        query = query.where('priority', '==', searchOptions.priority);
      }

      // فلترة حسب المصور المخصص
      if (searchOptions.assignedPhotographer) {
        query = query.where('assigned_photographers', 'array-contains', searchOptions.assignedPhotographer);
      }

      // فلترة حسب تاريخ البدء
      if (searchOptions.startDate) {
        query = query.where('timeline.start_date', '>=', searchOptions.startDate);
      }

      // فلترة حسب تاريخ الانتهاء
      if (searchOptions.endDate) {
        query = query.where('timeline.end_date', '<=', searchOptions.endDate);
      }

      // ترتيب وحد النتائج
      query = query.orderBy('created_at', 'desc');
      
      if (searchOptions.limit) {
        query = query.limit(searchOptions.limit);
      }

      const snapshot = await query.get();
      let campaigns = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Campaign));

      // فلترة الاسم (بعد الجلب لأن Firestore لا يدعم البحث النصي المتقدم)
      if (searchOptions.name) {
        const searchTerm = searchOptions.name.toLowerCase();
        campaigns = campaigns.filter(campaign => 
          campaign.name.toLowerCase().includes(searchTerm) ||
          campaign.description.toLowerCase().includes(searchTerm)
        );
      }

      return campaigns;
    } catch (error) {
      throw new Error(`خطأ في البحث في الحملات: ${error}`);
    }
  }

  /**
   * 🎯 بحث متقدم مع فلاتر احترافية - استخدام WhereFilterOp
   * ========================================================
   * 
   * مثال الاستخدام:
   * const filters: CampaignFilter[] = [
   *   { field: 'budget', operator: '>=', value: 1000 },
   *   { field: 'status', operator: '==', value: 'active' },
   *   { field: 'priority', operator: 'in', value: ['high', 'urgent'] }
   * ];
   */
  async advancedSearch(filters: CampaignFilter[], limit?: number): Promise<Campaign[]> {
    try {
      let query = await applyCampaignFilters(this.collection, filters);
      
      if (limit) {
        query = query.limit(limit);
      }
      
      query = query.orderBy('created_at', 'desc');
      
      const snapshot = await query.get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Campaign));
    } catch (error) {
      throw new Error(`خطأ في البحث المتقدم: ${error}`);
    }
  }

  /**
   * 📊 بحث مع ترتيب متقدم - استخدام OrderByDirection  
   * =================================================
   * 
   * مثال الاستخدام:
   * const sortOptions: SortOption[] = [
   *   { field: 'priority', direction: 'desc' },
   *   { field: 'created_at', direction: 'asc' }
   * ];
   */
  async searchWithAdvancedSorting(
    filters: CampaignFilter[],
    sortOptions: SortOption[],
    limit?: number
  ): Promise<Campaign[]> {
    try {
      let query = await applyCampaignFilters(this.collection, filters);
      
      // تطبيق ترتيب متعدد باستخدام OrderByDirection
      for (const sort of sortOptions) {
        query = query.orderBy(sort.field as string, sort.direction);
      }
      
      if (limit) {
        query = query.limit(limit);
      }
      
      const snapshot = await query.get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Campaign));
    } catch (error) {
      throw new Error(`خطأ في البحث مع الترتيب المتقدم: ${error}`);
    }
  }

  // ======================================
  // 📊 استعلامات إحصائية
  // ======================================

  /**
   * إحصائيات الحملات حسب الحالة
   */
  async getStatusStats(): Promise<Record<CampaignStatus, number>> {
    try {
      const stats: Record<CampaignStatus, number> = {} as Record<CampaignStatus, number>;

      for (const status of CAMPAIGN_STATUS_VALUES) {
        const snapshot = await this.collection
          .where('status', '==', status)
          .get();
        stats[status] = snapshot.size;
      }

      return stats;
    } catch (error) {
      throw new Error(`خطأ في جلب إحصائيات الحالة: ${error}`);
    }
  }

  /**
   * إحصائيات الحملات حسب البراند
   */
  async getBrandStats(brandId: ID): Promise<{
    total: number;
    byStatus: Record<CampaignStatus, number>;
    totalBudget: number;
    avgProgress: number;
  }> {
    try {
      const campaigns = await this.findByBrand(brandId);
      
      const stats = {
        total: campaigns.length,
        byStatus: {} as Record<CampaignStatus, number>,
        totalBudget: 0,
        avgProgress: 0
      };

      // إحصائيات الحالة
      for (const status of CAMPAIGN_STATUS_VALUES) {
        stats.byStatus[status] = campaigns.filter(c => c.status === status).length;
      }

      // الميزانية الإجمالية ومتوسط التقدم
      if (campaigns.length > 0) {
        stats.totalBudget = campaigns.reduce((sum, campaign) => sum + campaign.budget, 0);
        stats.avgProgress = campaigns.reduce((sum, campaign) => sum + campaign.progress_percentage, 0) / campaigns.length;
      }

      return stats;
    } catch (error) {
      throw new Error(`خطأ في جلب إحصائيات البراند: ${error}`);
    }
  }

  /**
   * إحصائيات المصور
   */
  async getPhotographerStats(photographerId: ID): Promise<{
    activeCampaigns: number;
    completedCampaigns: number;
    totalTasks: number;
    completedTasks: number;
    averageProgress: number;
  }> {
    try {
      const allCampaigns = await this.findByPhotographer(photographerId);
      
      const activeCampaigns = allCampaigns.filter(c => 
        c.status !== 'completed' && c.status !== 'cancelled'
      );
      
      const completedCampaigns = allCampaigns.filter(c => 
        c.status === 'completed'
      );

      const totalTasks = allCampaigns.reduce((sum, campaign) => sum + campaign.total_tasks, 0);
      const completedTasks = allCampaigns.reduce((sum, campaign) => sum + campaign.completed_tasks, 0);
      const averageProgress = allCampaigns.length > 0 
        ? allCampaigns.reduce((sum, campaign) => sum + campaign.progress_percentage, 0) / allCampaigns.length 
        : 0;

      return {
        activeCampaigns: activeCampaigns.length,
        completedCampaigns: completedCampaigns.length,
        totalTasks,
        completedTasks,
        averageProgress
      };
    } catch (error) {
      throw new Error(`خطأ في جلب إحصائيات المصور: ${error}`);
    }
  }

  // ======================================
  // 🎯 عمليات متقدمة
  // ======================================

  /**
   * تعيين مصور للحملة
   */
  async assignPhotographer(campaignId: ID, photographerId: ID, assignedBy: ID): Promise<Campaign> {
    try {
      const campaign = await this.findById(campaignId);
      if (!campaign) {
        throw new Error('الحملة غير موجودة');
      }

      // التحقق من عدم وجود المصور مسبقاً
      if (campaign.assigned_photographers.includes(photographerId)) {
        throw new Error('المصور مخصص للحملة مسبقاً');
      }

      const updateData: CampaignUpdateData = {
        assigned_photographers: [...campaign.assigned_photographers, photographerId],
        updated_by: assignedBy,
        updated_at: FieldValue.serverTimestamp()
      };

      await this.update(campaignId, updateData as any);
      
      const updatedCampaign = await this.findById(campaignId);
      if (!updatedCampaign) {
        throw new Error('خطأ في جلب الحملة بعد التحديث');
      }

      return updatedCampaign;
    } catch (error) {
      throw new Error(`خطأ في تعيين المصور: ${error}`);
    }
  }

  /**
   * إزالة مصور من الحملة
   */
  async removePhotographer(campaignId: ID, photographerId: ID, removedBy: ID): Promise<Campaign> {
    try {
      const campaign = await this.findById(campaignId);
      if (!campaign) {
        throw new Error('الحملة غير موجودة');
      }

      const updatedPhotographers = campaign.assigned_photographers.filter(id => id !== photographerId);

            const updateData: CampaignUpdateData = {
        assigned_photographers: updatedPhotographers,
        updated_by: removedBy,
        updated_at: FieldValue.serverTimestamp()
      };

      await this.update(campaignId, updateData as any);

      const updatedCampaign = await this.findById(campaignId);
      if (!updatedCampaign) {
        throw new Error('خطأ في جلب الحملة بعد التحديث');
      }

      return updatedCampaign;
    } catch (error) {
      throw new Error(`خطأ في إزالة المصور: ${error}`);
    }
  }

  /**
   * تحديث تقدم الحملة
   */
  async updateProgress(
    campaignId: ID, 
    completedTasks: number, 
    totalTasks: number,
    updatedBy: ID
  ): Promise<Campaign> {
    try {
      const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      const pendingTasks = totalTasks - completedTasks;

      const updateData: CampaignUpdateData = {
        completed_tasks: completedTasks,
        total_tasks: totalTasks,
        pending_tasks: pendingTasks,
        progress_percentage: progressPercentage,
        updated_by: updatedBy,
        updated_at: FieldValue.serverTimestamp()
      };

      await this.update(campaignId, updateData as any);
      
      const updatedCampaign = await this.findById(campaignId);
      if (!updatedCampaign) {
        throw new Error('خطأ في جلب الحملة بعد تحديث التقدم');
      }

      return updatedCampaign;
    } catch (error) {
      throw new Error(`خطأ في تحديث تقدم الحملة: ${error}`);
    }
  }
} 
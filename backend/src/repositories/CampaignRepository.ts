/**
 * 📱 Campaign Repository
 * 
 * تطوير علي جودت - Depth Studio
 * آخر تحديث: يونيو 2025
 * 
 * @description Repository pattern for campaign operations
 * @version 1.0.0
 */

import { BaseRepository, QueryFilter, BaseEntity } from './BaseRepository';
import { SmartCampaign, CampaignStatus } from '../../types/types';
import { Timestamp } from 'firebase-admin/firestore';

/**
 * Campaign entity interface extending BaseEntity
 */
export interface CampaignEntity extends BaseEntity {
  campaign_info: {
    name: string;
    description: string;
    brand_id: string;
    campaign_type: string;
    priority_level: string;
  };
  campaign_goals: {
    total_content_pieces: number;
    target_completion_date: Timestamp;
    expected_roi: number;
    success_metrics: string[];
  };
  timeline: {
    campaign_start_date: Timestamp;
    campaign_end_date: Timestamp;
    key_milestones: any[];
    buffer_days: number;
  };
  content_requirements: any[];
  ai_configuration: any;
  budget_management: {
    total_budget: number;
    currency: string;
    budget_allocation: any[];
    spending_alerts: any[];
  };
  quality_settings: {
    quality_checkpoints: any[];
    approval_requirements: any[];
    revision_limits: number;
  };
  approval_workflow: {
    workflow_steps: any[];
    escalation_rules: any[];
  };
  progress_tracking: {
    overall_progress_percentage: number;
    tasks_completed: number;
    tasks_in_progress: number;
    tasks_pending: number;
    quality_score: number;
    timeline_adherence: number;
    budget_utilization: number;
  };
  campaign_status: CampaignStatus;
}

/**
 * Campaign search filters interface
 */
export interface CampaignSearchFilters {
  status?: CampaignStatus;
  brand_id?: string;
  campaign_type?: string;
  priority_level?: string;
  created_by?: string;
  created_after?: string;
  created_before?: string;
  start_date_after?: string;
  start_date_before?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

/**
 * Campaign Repository Class
 */
export class CampaignRepository extends BaseRepository<CampaignEntity> {
  
  constructor() {
    super('campaigns');
  }

  /**
   * Find campaigns by brand
   */
  async findByBrand(brandId: string): Promise<CampaignEntity[]> {
    const filters: QueryFilter[] = [
      { field: 'campaign_info.brand_id', operator: '==', value: brandId }
    ];

    return await this.findAll({ 
      filters,
      orderBy: [{ field: 'created_at', direction: 'desc' }]
    });
  }

  /**
   * Find campaigns by status
   */
  async findByStatus(status: CampaignStatus): Promise<CampaignEntity[]> {
    const filters: QueryFilter[] = [
      { field: 'campaign_status', operator: '==', value: status }
    ];

    return await this.findAll({ 
      filters,
      orderBy: [{ field: 'created_at', direction: 'desc' }]
    });
  }

  /**
   * Find active campaigns
   */
  async findActiveCampaigns(): Promise<CampaignEntity[]> {
    const filters: QueryFilter[] = [
      { field: 'campaign_status', operator: '==', value: 'active' }
    ];

    return await this.findAll({ 
      filters,
      orderBy: [{ field: 'timeline.campaign_start_date', direction: 'asc' }]
    });
  }

  /**
   * Find campaigns by creator
   */
  async findByCreator(creatorId: string): Promise<CampaignEntity[]> {
    const filters: QueryFilter[] = [
      { field: 'created_by', operator: '==', value: creatorId }
    ];

    return await this.findAll({ 
      filters,
      orderBy: [{ field: 'created_at', direction: 'desc' }]
    });
  }

  /**
   * Find campaigns by type
   */
  async findByType(campaignType: string): Promise<CampaignEntity[]> {
    const filters: QueryFilter[] = [
      { field: 'campaign_info.campaign_type', operator: '==', value: campaignType }
    ];

    return await this.findAll({ 
      filters,
      orderBy: [{ field: 'created_at', direction: 'desc' }]
    });
  }

  /**
   * Find campaigns by priority
   */
  async findByPriority(priorityLevel: string): Promise<CampaignEntity[]> {
    const filters: QueryFilter[] = [
      { field: 'campaign_info.priority_level', operator: '==', value: priorityLevel }
    ];

    return await this.findAll({ 
      filters,
      orderBy: [{ field: 'timeline.campaign_start_date', direction: 'asc' }]
    });
  }

  /**
   * Search campaigns with filters and pagination
   */
  async searchCampaigns(searchFilters: CampaignSearchFilters, page: number = 1, limit: number = 20): Promise<any> {
    const filters: QueryFilter[] = [];

    // Apply filters
    if (searchFilters.status) {
      filters.push({ field: 'campaign_status', operator: '==', value: searchFilters.status });
    }

    if (searchFilters.brand_id) {
      filters.push({ field: 'campaign_info.brand_id', operator: '==', value: searchFilters.brand_id });
    }

    if (searchFilters.campaign_type) {
      filters.push({ field: 'campaign_info.campaign_type', operator: '==', value: searchFilters.campaign_type });
    }

    if (searchFilters.priority_level) {
      filters.push({ field: 'campaign_info.priority_level', operator: '==', value: searchFilters.priority_level });
    }

    if (searchFilters.created_by) {
      filters.push({ field: 'created_by', operator: '==', value: searchFilters.created_by });
    }

    if (searchFilters.created_after) {
      filters.push({ field: 'created_at', operator: '>=', value: new Date(searchFilters.created_after) });
    }

    if (searchFilters.created_before) {
      filters.push({ field: 'created_at', operator: '<=', value: new Date(searchFilters.created_before) });
    }

    if (searchFilters.start_date_after) {
      filters.push({ field: 'timeline.campaign_start_date', operator: '>=', value: new Date(searchFilters.start_date_after) });
    }

    if (searchFilters.start_date_before) {
      filters.push({ field: 'timeline.campaign_start_date', operator: '<=', value: new Date(searchFilters.start_date_before) });
    }

    // Apply ordering
    const orderBy = [{
      field: searchFilters.sort_by || 'created_at',
      direction: (searchFilters.sort_order === 'asc' ? 'asc' : 'desc') as 'asc' | 'desc'
    }];

    return await this.findWithPagination(page, limit, { filters, orderBy });
  }

  /**
   * Search campaigns by text (name, description)
   */
  async searchByText(searchTerm: string, searchFilters?: CampaignSearchFilters): Promise<CampaignEntity[]> {
    // للبحث النصي، نحتاج جلب جميع الحملات وفلترتهم محلياً
    // في الإنتاج، استخدم Elasticsearch أو Algolia
    
    const filters: QueryFilter[] = [];
    
    // Apply additional filters if provided
    if (searchFilters?.status) {
      filters.push({ field: 'campaign_status', operator: '==', value: searchFilters.status });
    }

    if (searchFilters?.brand_id) {
      filters.push({ field: 'campaign_info.brand_id', operator: '==', value: searchFilters.brand_id });
    }

    const allCampaigns = await this.findAll({ filters });
    const searchTermLower = searchTerm.toLowerCase();

    return allCampaigns.filter(campaign => 
      campaign.campaign_info.name.toLowerCase().includes(searchTermLower) ||
      campaign.campaign_info.description.toLowerCase().includes(searchTermLower)
    );
  }

  /**
   * Update campaign status
   */
  async updateStatus(campaignId: string, status: CampaignStatus, updatedBy?: string): Promise<CampaignEntity | null> {
    return await this.update(campaignId, { 
      campaign_status: status 
    }, updatedBy);
  }

  /**
   * Update campaign progress
   */
  async updateProgress(campaignId: string, progress: Partial<CampaignEntity['progress_tracking']>): Promise<CampaignEntity | null> {
    const campaign = await this.findById(campaignId);
    if (!campaign) return null;

    const updatedProgress = {
      ...campaign.progress_tracking,
      ...progress
    };

    return await this.update(campaignId, {
      progress_tracking: updatedProgress
    });
  }

  /**
   * Start campaign
   */
  async startCampaign(campaignId: string, updatedBy?: string): Promise<CampaignEntity | null> {
    return await this.update(campaignId, {
      campaign_status: 'active',
      timeline: {
        ...((await this.findById(campaignId))?.timeline || {}),
        actual_start_date: Timestamp.now()
      }
    }, updatedBy);
  }

  /**
   * Pause campaign
   */
  async pauseCampaign(campaignId: string, updatedBy?: string): Promise<CampaignEntity | null> {
    return await this.updateStatus(campaignId, 'paused', updatedBy);
  }

  /**
   * Complete campaign
   */
  async completeCampaign(campaignId: string, updatedBy?: string): Promise<CampaignEntity | null> {
    const now = Timestamp.now();
    
    return await this.update(campaignId, {
      campaign_status: 'completed',
      progress_tracking: {
        ...((await this.findById(campaignId))?.progress_tracking || {}),
        overall_progress_percentage: 100
      },
      timeline: {
        ...((await this.findById(campaignId))?.timeline || {}),
        actual_completion_date: now
      }
    }, updatedBy);
  }

  /**
   * Cancel campaign
   */
  async cancelCampaign(campaignId: string, updatedBy?: string): Promise<CampaignEntity | null> {
    return await this.updateStatus(campaignId, 'cancelled', updatedBy);
  }

  /**
   * Increment completed tasks
   */
  async incrementCompletedTasks(campaignId: string): Promise<CampaignEntity | null> {
    const campaign = await this.findById(campaignId);
    if (!campaign) return null;

    const newCompleted = campaign.progress_tracking.tasks_completed + 1;
    const newInProgress = Math.max(0, campaign.progress_tracking.tasks_in_progress - 1);
    const totalTasks = newCompleted + newInProgress + campaign.progress_tracking.tasks_pending;
    const newPercentage = totalTasks > 0 ? Math.round((newCompleted / totalTasks) * 100) : 0;

    return await this.updateProgress(campaignId, {
      tasks_completed: newCompleted,
      tasks_in_progress: newInProgress,
      overall_progress_percentage: newPercentage
    });
  }

  /**
   * Add task to campaign
   */
  async addTask(campaignId: string): Promise<CampaignEntity | null> {
    const campaign = await this.findById(campaignId);
    if (!campaign) return null;

    return await this.updateProgress(campaignId, {
      tasks_pending: campaign.progress_tracking.tasks_pending + 1
    });
  }

  /**
   * Start task (move from pending to in_progress)
   */
  async startTask(campaignId: string): Promise<CampaignEntity | null> {
    const campaign = await this.findById(campaignId);
    if (!campaign) return null;

    return await this.updateProgress(campaignId, {
      tasks_pending: Math.max(0, campaign.progress_tracking.tasks_pending - 1),
      tasks_in_progress: campaign.progress_tracking.tasks_in_progress + 1
    });
  }

  /**
   * Update budget utilization
   */
  async updateBudgetUtilization(campaignId: string, spentAmount: number): Promise<CampaignEntity | null> {
    const campaign = await this.findById(campaignId);
    if (!campaign) return null;

    const totalBudget = campaign.budget_management.total_budget;
    const utilization = totalBudget > 0 ? Math.round((spentAmount / totalBudget) * 100) : 0;

    return await this.updateProgress(campaignId, {
      budget_utilization: utilization
    });
  }

  /**
   * Update quality score
   */
  async updateQualityScore(campaignId: string, qualityScore: number): Promise<CampaignEntity | null> {
    return await this.updateProgress(campaignId, {
      quality_score: Math.max(0, Math.min(100, qualityScore))
    });
  }

  /**
   * Get campaigns ending soon
   */
  async getCampaignsEndingSoon(daysAhead: number = 7): Promise<CampaignEntity[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    const filters: QueryFilter[] = [
      { field: 'campaign_status', operator: 'in', value: ['active', 'scheduled'] },
      { field: 'timeline.campaign_end_date', operator: '<=', value: futureDate }
    ];

    return await this.findAll({ 
      filters,
      orderBy: [{ field: 'timeline.campaign_end_date', direction: 'asc' }]
    });
  }

  /**
   * Get overdue campaigns
   */
  async getOverdueCampaigns(): Promise<CampaignEntity[]> {
    const now = new Date();

    const filters: QueryFilter[] = [
      { field: 'campaign_status', operator: 'in', value: ['active', 'scheduled'] },
      { field: 'timeline.campaign_end_date', operator: '<', value: now }
    ];

    return await this.findAll({ 
      filters,
      orderBy: [{ field: 'timeline.campaign_end_date', direction: 'asc' }]
    });
  }

  /**
   * Get campaigns by brand with status filter
   */
  async getCampaignsByBrandAndStatus(brandId: string, status: CampaignStatus): Promise<CampaignEntity[]> {
    const filters: QueryFilter[] = [
      { field: 'campaign_info.brand_id', operator: '==', value: brandId },
      { field: 'campaign_status', operator: '==', value: status }
    ];

    return await this.findAll({ 
      filters,
      orderBy: [{ field: 'created_at', direction: 'desc' }]
    });
  }

  /**
   * Get campaign statistics
   */
  async getCampaignStats(campaignId: string): Promise<any> {
    const campaign = await this.findById(campaignId);
    if (!campaign) return null;

    const now = Date.now();
    const startTime = campaign.timeline.campaign_start_date?.toMillis() || now;
    const endTime = campaign.timeline.campaign_end_date?.toMillis() || now;
    const duration = endTime - startTime;
    const elapsed = now - startTime;
    const timeProgress = duration > 0 ? Math.min(100, Math.max(0, (elapsed / duration) * 100)) : 0;

    return {
      ...campaign.progress_tracking,
      time_progress_percentage: Math.round(timeProgress),
      days_remaining: endTime > now ? Math.ceil((endTime - now) / (1000 * 60 * 60 * 24)) : 0,
      is_overdue: now > endTime && campaign.campaign_status === 'active',
      total_tasks: campaign.progress_tracking.tasks_completed + 
                  campaign.progress_tracking.tasks_in_progress + 
                  campaign.progress_tracking.tasks_pending
    };
  }
} 
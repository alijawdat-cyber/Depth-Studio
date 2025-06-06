/**
 * 📱 Campaign Request Handlers
 * 
 * تطوير علي جودت - Depth Studio
 * آخر تحديث: يناير 2025
 * 
 * @description Request handlers for campaign operations
 * @version 1.0.0
 */

import { Request, Response, NextFunction } from 'express';
import { ApiResponse, SmartCampaign, PaginatedResponse, CampaignTask } from '../../types/types';
import { db } from '../../config/firebase';
import { Timestamp } from 'firebase-admin/firestore';
import { Query, OrderByDirection } from 'firebase-admin/firestore';
import { checkCampaignPermissions, buildCampaignFilters, getRecentCampaignActivity, getUpcomingDeadlines } from './middleware';
import { checkBrandPermission } from '../../middleware/authorization';

/**
 * Create new campaign
 */
export const createCampaign = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user?.uid;
    const permissions = await checkCampaignPermissions(userId);
    
    if (!permissions.canCreate) {
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions to create campaigns',
        message: 'ما عندك صلاحية لإنشاء حملات جديدة',
        timestamp: new Date().toISOString()
      } as ApiResponse<null>);
      return;
    }
    
    // التحقق من صلاحيات البراند
    const user = (req as any).user;
    
    if (user.primary_role === 'brand_coordinator') {
      const hasAccess = await checkBrandPermission(userId);
      if (!hasAccess) {
        res.status(403).json({
        success: false,
        error: 'No permission for this brand',
        message: 'ما عندك صلاحية لهذا البراند',
        timestamp: new Date().toISOString()
      } as ApiResponse<null>);
        return;
      }
    }
    
    const campaignData: Partial<SmartCampaign> = {
      campaign_info: req.body.campaign_info,
      campaign_goals: req.body.campaign_goals,
      timeline: {
        campaign_start_date: Timestamp.fromDate(new Date(req.body.timeline.campaign_start_date)),
        campaign_end_date: Timestamp.fromDate(new Date(req.body.timeline.campaign_end_date)),
        key_milestones: req.body.timeline.key_milestones || [],
        buffer_days: req.body.timeline.buffer_days || 2
      },
      content_requirements: req.body.content_requirements || [],
      ai_configuration: req.body.ai_configuration || {
        enable_smart_assignment: true,
        photographer_selection_criteria: {
          prioritize_specialization: true,
          consider_workload: true,
          prefer_brand_familiarity: true,
          location_preference_weight: 0.3,
          availability_weight: 0.4,
          performance_weight: 0.3
        },
        auto_scheduling: false,
        conflict_resolution: {
          auto_resolve_minor_conflicts: true,
          escalation_threshold: 24,
          notification_preferences: []
        }
      },
      budget_management: req.body.budget_management,
      quality_settings: req.body.quality_settings || {
        quality_checkpoints: [],
        approval_requirements: [],
        revision_limits: 3
      },
      approval_workflow: req.body.approval_workflow || {
        workflow_steps: [],
        escalation_rules: []
      },
      progress_tracking: {
        overall_progress_percentage: 0,
        tasks_completed: 0,
        tasks_in_progress: 0,
        tasks_pending: 0,
        quality_score: 0,
        timeline_adherence: 100,
        budget_utilization: 0
      },
      campaign_status: 'draft',
      created_at: Timestamp.now(),
      updated_at: Timestamp.now(),
      created_by: userId
    };
    
    const docRef = await db.collection('campaigns').add(campaignData);
    const createdCampaign = await docRef.get();
    
    res.status(201).json({
      success: true,
      data: { id: docRef.id, ...createdCampaign.data() },
      message: 'تم إنشاء الحملة بنجاح',
      timestamp: new Date().toISOString()
    } as ApiResponse<SmartCampaign>);
    
  } catch (error: any) {
    next(error);
  }
};

/**
 * Get campaigns list with pagination and filters
 */
export const getCampaigns = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user?.uid;
    const userRole = (req as any).user?.primary_role;
    
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sortBy = req.query.sort_by as string || 'created_at';
    const sortOrder = req.query.sort_order as string || 'desc';
    const filters = req.query;
    
    let query: Query = db.collection('campaigns');
    
    // Apply user-specific filters
    if (userRole === 'brand_coordinator') {
      const userPermissions = await db.collection('user_permissions').doc(userId).get();
      const permissions = userPermissions.data();
      const brandPermissions = permissions?.brand_permissions || [];
      const allowedBrands = brandPermissions.map((bp: any) => bp.brand_id);
      
      if (allowedBrands.length === 0) {
        res.status(200).json({
          success: true,
          data: [],
          pagination: {
            current_page: page,
            total_pages: 0,
            total_items: 0,
            items_per_page: limit,
            has_next: false,
            has_prev: false
          },
          message: 'ما في حملات متاحة',
          timestamp: new Date().toISOString()
        } as PaginatedResponse<SmartCampaign>);
        return;
      }
      
      query = query.where('campaign_info.brand_id', 'in', allowedBrands);
    }
    
    // Apply filters
    const conditions = buildCampaignFilters(filters);
    conditions.forEach(condition => {
      query = query.where(condition[0], condition[1], condition[2]);
    });
    
    // Apply sorting
    const validSortOrder: OrderByDirection = (sortOrder === 'asc' ? 'asc' : 'desc');
    query = query.orderBy(sortBy === 'name' ? 'campaign_info.name' : sortBy, validSortOrder);
    
    // Get total count
    const totalSnapshot = await query.get();
    const totalItems = totalSnapshot.size;
    const totalPages = Math.ceil(totalItems / limit);
    
    // Apply pagination
    const offset = (page - 1) * limit;
    const paginatedQuery = query.offset(offset).limit(limit);
    
    const snapshot = await paginatedQuery.get();
    const campaigns = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.status(200).json({
      success: true,
      data: campaigns,
      pagination: {
        current_page: page,
        total_pages: totalPages,
        total_items: totalItems,
        items_per_page: limit,
        has_next: page < totalPages,
        has_prev: page > 1
      },
      message: `تم جلب ${campaigns.length} حملة`,
      timestamp: new Date().toISOString()
    } as PaginatedResponse<SmartCampaign>);
    
  } catch (error: any) {
    next(error);
  }
};

/**
 * Get single campaign by ID
 */
export const getCampaignById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user?.uid;
    const campaignId = req.params.id;
    const permissions = await checkCampaignPermissions(userId, campaignId);
    
    if (!permissions.canView) {
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions to view this campaign',
        message: 'ما عندك صلاحية لعرض هذه الحملة',
        timestamp: new Date().toISOString()
      } as ApiResponse<null>);
      return;
    }
    
    const campaignDoc = await db.collection('campaigns').doc(campaignId).get();
    
    if (!campaignDoc.exists) {
      res.status(404).json({
        success: false,
        error: 'Campaign not found',
        message: 'الحملة غير موجودة',
        timestamp: new Date().toISOString()
      } as ApiResponse<null>);
      return;
    }
    
    const campaignData = {
      id: campaignDoc.id,
      ...campaignDoc.data()
    };
    
    res.status(200).json({
      success: true,
      data: campaignData,
      message: 'تم جلب بيانات الحملة بنجاح',
      timestamp: new Date().toISOString()
    } as ApiResponse<SmartCampaign>);
    
  } catch (error: any) {
    next(error);
  }
};

/**
 * Update campaign
 */
export const updateCampaign = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user?.uid;
    const campaignId = req.params.id;
    const permissions = await checkCampaignPermissions(userId, campaignId);
    
    if (!permissions.canUpdate) {
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions to update this campaign',
        message: 'ما عندك صلاحية لتحديث هذه الحملة',
        timestamp: new Date().toISOString()
      } as ApiResponse<null>);
      return;
    }
    
    const campaignDoc = await db.collection('campaigns').doc(campaignId).get();
    
    if (!campaignDoc.exists) {
      res.status(404).json({
        success: false,
        error: 'Campaign not found',
        message: 'الحملة غير موجودة',
        timestamp: new Date().toISOString()
      } as ApiResponse<null>);
      return;
    }
    
    const updateData: any = {
      ...req.body,
      updated_at: Timestamp.now()
    };
    
    // Convert dates if provided
    if (req.body.timeline?.campaign_start_date) {
      updateData.timeline.campaign_start_date = Timestamp.fromDate(new Date(req.body.timeline.campaign_start_date));
    }
    if (req.body.timeline?.campaign_end_date) {
      updateData.timeline.campaign_end_date = Timestamp.fromDate(new Date(req.body.timeline.campaign_end_date));
    }
    
    await db.collection('campaigns').doc(campaignId).update(updateData);
    
    const updatedCampaign = await db.collection('campaigns').doc(campaignId).get();
    
    res.status(200).json({
      success: true,
      data: { id: campaignId, ...updatedCampaign.data() },
      message: 'تم تحديث الحملة بنجاح',
      timestamp: new Date().toISOString()
    } as ApiResponse<SmartCampaign>);
    
  } catch (error: any) {
    next(error);
  }
};

/**
 * Delete campaign (soft delete)
 */
export const deleteCampaign = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user?.uid;
    const campaignId = req.params.id;
    const permissions = await checkCampaignPermissions(userId, campaignId);
    
    if (!permissions.canDelete) {
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions to delete this campaign',
        message: 'ما عندك صلاحية لحذف هذه الحملة',
        timestamp: new Date().toISOString()
      } as ApiResponse<null>);
      return;
    }
    
    const campaignDoc = await db.collection('campaigns').doc(campaignId).get();
    
    if (!campaignDoc.exists) {
      res.status(404).json({
        success: false,
        error: 'Campaign not found',
        message: 'الحملة غير موجودة',
        timestamp: new Date().toISOString()
      } as ApiResponse<null>);
      return;
    }
    
    // Check if campaign has active tasks
    const tasksSnapshot = await db.collection('campaign_tasks')
      .where('campaign_id', '==', campaignId)
      .where('status_tracking.current_status', 'in', ['assigned', 'in_progress'])
      .get();
    
    if (!tasksSnapshot.empty) {
      res.status(400).json({
        success: false,
        error: 'Cannot delete campaign with active tasks',
        message: 'ما يمكن حذف الحملة لأن فيها مهام نشطة',
        timestamp: new Date().toISOString()
      } as ApiResponse<null>);
      return;
    }
    
    // Soft delete
    await db.collection('campaigns').doc(campaignId).update({
      campaign_status: 'cancelled',
      updated_at: Timestamp.now(),
      deleted_at: Timestamp.now(),
      deleted_by: userId
    });
    
    res.status(200).json({
      success: true,
      data: null,
      message: 'تم حذف الحملة بنجاح',
      timestamp: new Date().toISOString()
    } as ApiResponse<null>);
    
  } catch (error: any) {
    next(error);
  }
};

/**
 * Start campaign
 */
export const startCampaign = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user?.uid;
    const campaignId = req.params.id;
    const permissions = await checkCampaignPermissions(userId, campaignId);
    
    if (!permissions.canUpdate) {
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions to start this campaign',
        message: 'ما عندك صلاحية لبدء هذه الحملة',
        timestamp: new Date().toISOString()
      } as ApiResponse<null>);
      return;
    }
    
    const campaignDoc = await db.collection('campaigns').doc(campaignId).get();
    
    if (!campaignDoc.exists) {
      res.status(404).json({
        success: false,
        error: 'Campaign not found',
        message: 'الحملة غير موجودة',
        timestamp: new Date().toISOString()
      } as ApiResponse<null>);
      return;
    }
    
    const campaign = campaignDoc.data();
    
    if (campaign?.campaign_status === 'active') {
      res.status(400).json({
        success: false,
        error: 'Campaign is already active',
        message: 'الحملة نشطة أصلاً',
        timestamp: new Date().toISOString()
      } as ApiResponse<null>);
      return;
    }
    
    await db.collection('campaigns').doc(campaignId).update({
      campaign_status: 'active',
      updated_at: Timestamp.now(),
      started_at: Timestamp.now(),
      started_by: userId
    });
    
    res.status(200).json({
      success: true,
      data: null,
      message: 'تم بدء الحملة بنجاح',
      timestamp: new Date().toISOString()
    } as ApiResponse<null>);
    
  } catch (error: any) {
    next(error);
  }
};

/**
 * Pause campaign
 */
export const pauseCampaign = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user?.uid;
    const campaignId = req.params.id;
    const permissions = await checkCampaignPermissions(userId, campaignId);
    
    if (!permissions.canUpdate) {
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions to pause this campaign',
        message: 'ما عندك صلاحية لإيقاف هذه الحملة',
        timestamp: new Date().toISOString()
      } as ApiResponse<null>);
      return;
    }
    
    const campaignDoc = await db.collection('campaigns').doc(campaignId).get();
    
    if (!campaignDoc.exists) {
      res.status(404).json({
        success: false,
        error: 'Campaign not found',
        message: 'الحملة غير موجودة',
        timestamp: new Date().toISOString()
      } as ApiResponse<null>);
      return;
    }
    
    const campaign = campaignDoc.data();
    
    if (campaign?.campaign_status !== 'active') {
      res.status(400).json({
        success: false,
        error: 'Campaign is not active',
        message: 'الحملة مو نشطة',
        timestamp: new Date().toISOString()
      } as ApiResponse<null>);
      return;
    }
    
    await db.collection('campaigns').doc(campaignId).update({
      campaign_status: 'paused',
      updated_at: Timestamp.now(),
      paused_at: Timestamp.now(),
      paused_by: userId,
      pause_reason: req.body.reason || 'No reason provided'
    });
    
    res.status(200).json({
      success: true,
      data: null,
      message: 'تم إيقاف الحملة مؤقتاً',
      timestamp: new Date().toISOString()
    } as ApiResponse<null>);
    
  } catch (error: any) {
    next(error);
  }
};

/**
 * Complete campaign
 */
export const completeCampaign = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user?.uid;
    const campaignId = req.params.id;
    const permissions = await checkCampaignPermissions(userId, campaignId);
    
    if (!permissions.canUpdate) {
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions to complete this campaign',
        message: 'ما عندك صلاحية لإنهاء هذه الحملة',
        timestamp: new Date().toISOString()
      } as ApiResponse<null>);
      return;
    }
    
    const campaignDoc = await db.collection('campaigns').doc(campaignId).get();
    
    if (!campaignDoc.exists) {
      res.status(404).json({
        success: false,
        error: 'Campaign not found',
        message: 'الحملة غير موجودة',
        timestamp: new Date().toISOString()
      } as ApiResponse<null>);
      return;
    }
    
    const campaign = campaignDoc.data();
    
    if (campaign?.campaign_status === 'completed') {
      res.status(400).json({
        success: false,
        error: 'Campaign is already completed',
        message: 'الحملة مكتملة أصلاً',
        timestamp: new Date().toISOString()
      } as ApiResponse<null>);
      return;
    }
    
    // Calculate final analytics
    const { calculateCampaignAnalytics } = await import('./middleware');
    const analytics = await calculateCampaignAnalytics(campaignId);
    
    await db.collection('campaigns').doc(campaignId).update({
      campaign_status: 'completed',
      updated_at: Timestamp.now(),
      completed_at: Timestamp.now(),
      completed_by: userId,
      completion_notes: req.body.completion_notes || '',
      final_analytics: analytics
    });
    
    res.status(200).json({
      success: true,
      data: analytics,
      message: 'تم إنهاء الحملة بنجاح',
      timestamp: new Date().toISOString()
    } as ApiResponse<any>);
    
  } catch (error: any) {
    next(error);
  }
};

/**
 * Get campaign tasks
 */
export const getCampaignTasks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user?.uid;
    const campaignId = req.params.id;
    const permissions = await checkCampaignPermissions(userId, campaignId);
    
    if (!permissions.canView) {
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions to view campaign tasks',
        message: 'ما عندك صلاحية لعرض مهام هذه الحملة',
        timestamp: new Date().toISOString()
      } as ApiResponse<null>);
      return;
    }
    
    const campaignDoc = await db.collection('campaigns').doc(campaignId).get();
    
    if (!campaignDoc.exists) {
      res.status(404).json({
        success: false,
        error: 'Campaign not found',
        message: 'الحملة غير موجودة',
        timestamp: new Date().toISOString()
      } as ApiResponse<null>);
      return;
    }
    
    let query = db.collection('campaign_tasks').where('campaign_id', '==', campaignId);
    
    // Apply filters
    if (req.query.status) {
      query = query.where('status_tracking.current_status', '==', req.query.status);
    }
    
    if (req.query.photographer_id) {
      query = query.where('assignment.assigned_photographer', '==', req.query.photographer_id);
    }
    
    const tasksSnapshot = await query.get();
    const tasks = tasksSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.status(200).json({
      success: true,
      data: tasks,
      message: `تم جلب ${tasks.length} مهمة للحملة`,
      timestamp: new Date().toISOString()
    } as ApiResponse<CampaignTask[]>);
    
  } catch (error: any) {
    next(error);
  }
};

/**
 * Get campaign analytics
 */
export const getCampaignAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user?.uid;
    const campaignId = req.params.id;
    const permissions = await checkCampaignPermissions(userId, campaignId);
    
    if (!permissions.canView) {
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions to view campaign analytics',
        message: 'ما عندك صلاحية لعرض تحليلات هذه الحملة',
        timestamp: new Date().toISOString()
      } as ApiResponse<null>);
      return;
    }
    
    const campaignDoc = await db.collection('campaigns').doc(campaignId).get();
    
    if (!campaignDoc.exists) {
      res.status(404).json({
        success: false,
        error: 'Campaign not found',
        message: 'الحملة غير موجودة',
        timestamp: new Date().toISOString()
      } as ApiResponse<null>);
      return;
    }
    
    const { calculateCampaignAnalytics } = await import('./middleware');
    const analytics = await calculateCampaignAnalytics(campaignId);
    const campaign = campaignDoc.data();
    
    // Additional analytics
    const brandId = campaign?.campaign_info?.brand_id;
    const brandDoc = await db.collection('brands').doc(brandId).get();
    const brandData = brandDoc.exists ? brandDoc.data() : null;
    
    const extendedAnalytics = {
      ...analytics,
      campaign_info: {
        name: campaign?.campaign_info?.name,
        status: campaign?.campaign_status,
        brand_name: brandData?.name,
        start_date: campaign?.timeline?.campaign_start_date,
        end_date: campaign?.timeline?.campaign_end_date,
        budget: campaign?.budget_management?.total_budget,
        priority: campaign?.campaign_info?.priority_level
      },
      performance_metrics: {
        timeline_performance: analytics.total_tasks > 0 ? 
          (analytics.completed_tasks / analytics.total_tasks) * 100 : 0,
        budget_efficiency: campaign?.budget_management?.total_budget && campaign.budget_management.total_budget > 0 ? 
          (analytics.total_budget_spent / campaign.budget_management.total_budget) * 100 : 0,
        quality_trend: analytics.quality_score_average,
        photographer_performance: {}
      },
      recent_activity: await getRecentCampaignActivity(campaignId),
      upcoming_deadlines: await getUpcomingDeadlines(campaignId)
    };
    
    res.status(200).json({
      success: true,
      data: extendedAnalytics,
      message: 'تم جلب تحليلات الحملة بنجاح',
      timestamp: new Date().toISOString()
    } as ApiResponse<any>);
    
  } catch (error: any) {
    next(error);
  }
};

export const campaignHandlers = {
  createCampaign,
  getCampaigns,
  getCampaignById,
  updateCampaign,
  deleteCampaign,
  startCampaign,
  pauseCampaign,
  completeCampaign,
  getCampaignTasks,
  getCampaignAnalytics
}; 
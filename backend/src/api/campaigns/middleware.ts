/**
 * 📱 Campaign Middleware
 * 
 * تطوير علي جودت - Depth Studio
 * آخر تحديث: يناير 2025
 * 
 * @description Middleware functions for campaign operations
 * @version 1.0.0
 */

// import { Request, Response, NextFunction } from 'express'; // TODO: Use when needed
import { db } from '../../config/firebase';
import { Timestamp } from 'firebase-admin/firestore';

/**
 * Build campaign filters for queries
 */
export const buildCampaignFilters = (filters: any) => {
  const conditions: any[] = [];
  
  // فلتر حسب البراند
  if (filters.brand_id) {
    conditions.push(['campaign_info.brand_id', '==', filters.brand_id]);
  }
  
  // فلتر حسب الحالة
  if (filters.status) {
    conditions.push(['campaign_status', '==', filters.status]);
  }
  
  // فلتر حسب النوع
  if (filters.campaign_type) {
    conditions.push(['campaign_info.campaign_type', '==', filters.campaign_type]);
  }
  
  // فلتر حسب الأولوية
  if (filters.priority_level) {
    conditions.push(['campaign_info.priority_level', '==', filters.priority_level]);
  }
  
  // فلتر حسب تاريخ الإنشاء
  if (filters.created_after) {
    conditions.push(['created_at', '>=', Timestamp.fromDate(new Date(filters.created_after))]);
  }
  
  if (filters.created_before) {
    conditions.push(['created_at', '<=', Timestamp.fromDate(new Date(filters.created_before))]);
  }
  
  // فلتر حسب الحالة النشطة
  if (filters.is_active !== undefined) {
    conditions.push(['campaign_status', 'in', filters.is_active ? ['active', 'scheduled'] : ['paused', 'completed', 'cancelled']]);
  }
  
  return conditions;
};

/**
 * Check campaign permissions
 */
export const checkCampaignPermissions = async (userId: string, campaignId: string | null = null) => {
  const userDoc = await db.collection('users').doc(userId).get();
  const userPermissions = await db.collection('user_permissions').doc(userId).get();
  
  if (!userDoc.exists || !userPermissions.exists) {
    throw new Error('User not found or permissions not set');
  }
  
  const user = userDoc.data();
  const permissions = userPermissions.data();
  
  // Super admin has all permissions
  if (user?.primary_role === 'super_admin') {
    return { canCreate: true, canUpdate: true, canDelete: true, canView: true };
  }
  
  // Marketing coordinator permissions
  if (user?.primary_role === 'marketing_coordinator') {
    return { 
      canCreate: permissions?.crud_permissions?.campaigns?.create || false,
      canUpdate: permissions?.crud_permissions?.campaigns?.update || false,
      canDelete: permissions?.crud_permissions?.campaigns?.delete || false,
      canView: permissions?.crud_permissions?.campaigns?.read || false
    };
  }
  
  // Brand coordinator - restricted to assigned brands
  if (user?.primary_role === 'brand_coordinator' && campaignId) {
    const campaignDoc = await db.collection('campaigns').doc(campaignId).get();
    if (!campaignDoc.exists) {
      throw new Error('Campaign not found');
    }
    
    const campaign = campaignDoc.data();
    const brandPermissions = permissions?.brand_permissions || [];
    
    const hasBrandAccess = campaign?.campaign_info?.brand_id && brandPermissions.some((bp: any) => 
      bp.brand_id === campaign.campaign_info.brand_id
    );
    
    if (!hasBrandAccess) {
      throw new Error('No permission for this brand');
    }
    
    return { 
      canCreate: true, 
      canUpdate: true, 
      canDelete: false, 
      canView: true 
    };
  }
  
  return { canCreate: false, canUpdate: false, canDelete: false, canView: false };
};

/**
 * Calculate campaign analytics
 */
export const calculateCampaignAnalytics = async (campaignId: string) => {
  const tasksSnapshot = await db.collection('campaign_tasks')
    .where('campaign_id', '==', campaignId)
    .get();
  
  const tasks = tasksSnapshot.docs.map(doc => doc.data());
  
  return {
    total_tasks: tasks.length,
    completed_tasks: tasks.filter(t => t.status_tracking.current_status === 'completed').length,
    in_progress_tasks: tasks.filter(t => t.status_tracking.current_status === 'in_progress').length,
    pending_tasks: tasks.filter(t => t.status_tracking.current_status === 'pending').length,
    average_completion_rate: tasks.length > 0 ? 
      (tasks.filter(t => t.status_tracking.current_status === 'completed').length / tasks.length) * 100 : 0,
    total_budget_spent: tasks.reduce((sum, t) => sum + (t.financial_info?.actual_cost || 0), 0),
    quality_score_average: tasks.length > 0 ? 
      tasks.reduce((sum, t) => sum + (t.quality_control?.quality_score || 0), 0) / tasks.length : 0
  };
};

/**
 * Get recent campaign activity
 */
export const getRecentCampaignActivity = async (campaignId: string) => {
  const activitiesSnapshot = await db.collection('campaign_activities')
    .where('campaign_id', '==', campaignId)
    .orderBy('created_at', 'desc')
    .limit(10)
    .get();
  
  return activitiesSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

/**
 * Get upcoming deadlines
 */
export const getUpcomingDeadlines = async (campaignId: string) => {
  const now = Timestamp.now();
  const oneWeekFromNow = Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
  
  const tasksSnapshot = await db.collection('campaign_tasks')
    .where('campaign_id', '==', campaignId)
    .where('timeline.deadline', '>=', now)
    .where('timeline.deadline', '<=', oneWeekFromNow)
    .orderBy('timeline.deadline', 'asc')
    .get();
  
  return tasksSnapshot.docs.map(doc => ({
    task_id: doc.id,
    task_title: doc.data().content_details?.title || 'مهمة بدون عنوان',
    deadline: doc.data().timeline?.deadline,
    status: doc.data().status_tracking?.current_status,
    assigned_photographer: doc.data().assignment?.assigned_photographer
  }));
};

export const campaignMiddleware = {
  checkCampaignPermissions,
  buildCampaignFilters,
  calculateCampaignAnalytics,
  getRecentCampaignActivity,
  getUpcomingDeadlines
}; 
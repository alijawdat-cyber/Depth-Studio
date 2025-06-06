/**
 * 📋 Task Request Handlers
 * 
 * تطوير علي جودت - Depth Studio
 * آخر تحديث: يناير 2025
 * 
 * @description Request handlers for task operations
 * @version 1.0.0
 */

import { Request, Response, NextFunction } from 'express';
import { db } from '../../config/firebase';
import { 
  CampaignTask, 
  TaskStatus, 
  ApiResponse, 
  PaginatedResponse
} from '../../types/types';

import { checkBrandPermission, checkTaskPermissions } from './assignment';
import { updateCampaignProgress } from './tracking';

/**
 * إنشاء مهمة جديدة
 */
export const createTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user?.uid;
    const permissions = await checkTaskPermissions(userId);
    
    if (!permissions.canCreate) {
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions to create tasks',
        message: 'ما عندك صلاحية لإنشاء مهام جديدة',
        timestamp: new Date().toISOString()
      } as ApiResponse<null>);
      return;
    }
    
    // التحقق من وجود الحملة
    const campaignDoc = await db.collection('campaigns').doc(req.body.campaign_id).get();
    if (!campaignDoc.exists) {
      res.status(404).json({
        success: false,
        error: 'Campaign not found',
        message: 'الحملة غير موجودة',
        timestamp: new Date().toISOString()
      } as ApiResponse<null>);
      return;
    }
    
    const campaign = campaignDoc.data()!;
    
    // التحقق من صلاحيات البراند للـ brand coordinator
    const userRole = (req as any).user?.primary_role;
    if (userRole === 'brand_coordinator') {
      const hasAccess = await checkBrandPermission(userId, campaign.campaign_info.brand_id);
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
    
    // التحقق من التواريخ
    const startDate = new Date(req.body.timeline.start_date);
    const dueDate = new Date(req.body.timeline.due_date);
    
    if (dueDate <= startDate) {
      res.status(400).json({
        success: false,
        error: 'Due date must be after start date',
        message: 'تاريخ الاستحقاق يجب أن يكون بعد تاريخ البدء',
        timestamp: new Date().toISOString()
      } as ApiResponse<null>);
      return;
    }
    
    const taskData: any = {
      campaign_id: req.body.campaign_id,
      task_info: req.body.task_info,
      assignment: {
        assigned_photographer: null,
        assigned_by: userId,
        assigned_at: null,
        assignment_method: 'manual',
        backup_photographers: req.body.assignment?.backup_photographers || []
      },
      requirements: req.body.requirements || {
        content_requirements: [],
        technical_specifications: {},
        location_requirements: {
          location_type: 'studio',
          specific_location: null,
          travel_required: false,
          setup_time_needed: 30
        },
        equipment_requirements: [],
        style_guidelines: []
      },
      timeline: {
        start_date: startDate,
        due_date: dueDate,
        estimated_duration: req.body.timeline.estimated_duration,
        actual_start_time: null,
        actual_completion_time: null,
        buffer_time: req.body.timeline.buffer_time || 2
      },
      deliverables: req.body.deliverables || {
        expected_outputs: [],
        delivery_format: ['jpg', 'png'],
        quality_requirements: [],
        approval_required: true
      },
      quality_control: req.body.quality_control || {
        quality_checkpoints: [],
        reviewer_assignments: [],
        approval_workflow: [],
        revision_limit: 3
      },
      status_tracking: {
        current_status: 'pending' as TaskStatus,
        status_history: [{
          status: 'pending' as TaskStatus,
          updated_by: userId,
          updated_at: new Date(),
          notes: 'Task created'
        }],
        progress_percentage: 0,
        milestones_completed: [],
        issues_encountered: []
      },
      financial_info: {
        estimated_cost: req.body.financial_info?.estimated_cost || 0,
        actual_cost: 0,
        photographer_payment: 0,
        additional_costs: [],
        payment_status: 'pending'
      },
      created_at: new Date(),
      updated_at: new Date()
    };
    
    const docRef = await db.collection('campaign_tasks').add(taskData);
    const createdTask = await docRef.get();
    
    // تحديث progress الحملة
    await updateCampaignProgress(req.body.campaign_id);
    
    res.status(201).json({
      success: true,
      data: { id: docRef.id, ...createdTask.data() },
      message: 'تم إنشاء المهمة بنجاح',
      timestamp: new Date().toISOString()
    } as ApiResponse<CampaignTask>);
    
  } catch (error: any) {
    next(error);
  }
};

/**
 * قائمة المهام مع فلتر وpagination
 */
export const getTasks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user?.uid;
    const userRole = (req as any).user?.primary_role;
    
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sortBy = req.query.sort_by as string || 'created_at';
    const sortOrder = req.query.sort_order as string || 'desc';
    
    let baseQuery = db.collection('campaign_tasks');
    let query: any = baseQuery;
    
    // Apply user-specific filters
    if (userRole === 'photographer') {
      // Photographers can only see their assigned tasks
      query = query.where('assignment.assigned_photographer', '==', userId);
    } else if (userRole === 'brand_coordinator') {
      // Brand coordinators restricted to their brands
      const userPermissions = await db.collection('user_permissions').doc(userId).get();
      if (userPermissions.exists) {
        const permissions = userPermissions.data()!;
        const brandPermissions = permissions.brand_permissions || [];
        const allowedBrands = brandPermissions.map((bp: any) => bp.brand_id);
        
        if (allowedBrands.length > 0) {
          // Get campaigns for allowed brands
          const campaignsSnapshot = await db.collection('campaigns')
            .where('campaign_info.brand_id', 'in', allowedBrands)
            .get();
          
          const allowedCampaigns = campaignsSnapshot.docs.map(doc => doc.id);
          
          if (allowedCampaigns.length === 0) {
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
              message: 'ما في مهام متاحة',
              timestamp: new Date().toISOString()
            } as PaginatedResponse<CampaignTask>);
            return;
          }
          
          query = query.where('campaign_id', 'in', allowedCampaigns);
        }
      }
    }
    
    // Apply sorting
    const sortField = sortBy === 'due_date' ? 'timeline.due_date' : 
                     sortBy === 'priority' ? 'task_info.priority_level' :
                     sortBy === 'status' ? 'status_tracking.current_status' : sortBy;
    
    query = query.orderBy(sortField, sortOrder as any);
    
    // Get total count
    const totalSnapshot = await query.get();
    const totalItems = totalSnapshot.size;
    const totalPages = Math.ceil(totalItems / limit);
    
    // Apply pagination
    const offset = (page - 1) * limit;
    const paginatedQuery = query.offset(offset).limit(limit);
    
    const snapshot = await paginatedQuery.get();
    const tasks = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.status(200).json({
      success: true,
      data: tasks,
      pagination: {
        current_page: page,
        total_pages: totalPages,
        total_items: totalItems,
        items_per_page: limit,
        has_next: page < totalPages,
        has_prev: page > 1
      },
      message: `تم جلب ${tasks.length} مهمة`,
      timestamp: new Date().toISOString()
    } as PaginatedResponse<CampaignTask>);
    
  } catch (error: any) {
    next(error);
  }
};

/**
 * جلب بيانات مهمة محددة
 */
export const getTaskById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user?.uid;
    const userRole = (req as any).user?.primary_role;
    const taskId = req.params.id;
    
    const taskDoc = await db.collection('campaign_tasks').doc(taskId).get();
    
    if (!taskDoc.exists) {
      res.status(404).json({
        success: false,
        error: 'Task not found',
        message: 'المهمة غير موجودة',
        timestamp: new Date().toISOString()
      } as ApiResponse<null>);
      return;
    }
    
    const task = taskDoc.data()!;
    
    // Check permissions based on user role
    if (userRole === 'photographer') {
      if (task.assignment?.assigned_photographer !== userId) {
        res.status(403).json({
          success: false,
          error: 'Not assigned to this task',
          message: 'هذه المهمة غير مُعينة لك',
          timestamp: new Date().toISOString()
        } as ApiResponse<null>);
        return;
      }
    } else if (userRole === 'brand_coordinator') {
      const permissions = await checkTaskPermissions(userId, taskId);
      if (!permissions.canView) {
        res.status(403).json({
          success: false,
          error: 'Insufficient permissions to view this task',
          message: 'ما عندك صلاحية لعرض هذه المهمة',
          timestamp: new Date().toISOString()
        } as ApiResponse<null>);
        return;
      }
    }
    
    const taskData = {
      id: taskDoc.id,
      ...task
    };
    
    res.status(200).json({
      success: true,
      data: taskData,
      message: 'تم جلب بيانات المهمة بنجاح',
      timestamp: new Date().toISOString()
    } as ApiResponse<CampaignTask>);
    
  } catch (error: any) {
    next(error);
  }
};

/**
 * تحديث بيانات المهمة
 */
export const updateTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user?.uid;
    const userRole = (req as any).user?.primary_role;
    const taskId = req.params.id;
    
    const taskDoc = await db.collection('campaign_tasks').doc(taskId).get();
    
    if (!taskDoc.exists) {
      res.status(404).json({
        success: false,
        error: 'Task not found',
        message: 'المهمة غير موجودة',
        timestamp: new Date().toISOString()
      } as ApiResponse<null>);
      return;
    }
    
    const task = taskDoc.data()!;
    
    // Check permissions
    if (userRole === 'photographer') {
      if (task.assignment?.assigned_photographer !== userId) {
        res.status(403).json({
          success: false,
          error: 'Not assigned to this task',
          message: 'هذه المهمة غير مُعينة لك',
          timestamp: new Date().toISOString()
        } as ApiResponse<null>);
        return;
      }
    } else {
      const permissions = await checkTaskPermissions(userId, taskId);
      if (!permissions.canUpdate) {
        res.status(403).json({
          success: false,
          error: 'Insufficient permissions to update this task',
          message: 'ما عندك صلاحية لتحديث هذه المهمة',
          timestamp: new Date().toISOString()
        } as ApiResponse<null>);
        return;
      }
    }
    
    // Prepare update data
    const updateData: any = {
      updated_at: new Date()
    };
    
    // Update allowed fields
    if (req.body.task_info) {
      updateData.task_info = { ...task.task_info, ...req.body.task_info };
    }
    
    if (req.body.requirements) {
      updateData.requirements = { ...task.requirements, ...req.body.requirements };
    }
    
    if (req.body.timeline) {
      const newTimeline = { ...task.timeline, ...req.body.timeline };
      
      // Validate dates if provided
      if (req.body.timeline.start_date || req.body.timeline.due_date) {
        const startDate = new Date(req.body.timeline.start_date || task.timeline.start_date);
        const dueDate = new Date(req.body.timeline.due_date || task.timeline.due_date);
        
        if (dueDate <= startDate) {
          res.status(400).json({
            success: false,
            error: 'Due date must be after start date',
            message: 'تاريخ الاستحقاق يجب أن يكون بعد تاريخ البدء',
            timestamp: new Date().toISOString()
          } as ApiResponse<null>);
          return;
        }
        
        newTimeline.start_date = startDate;
        newTimeline.due_date = dueDate;
      }
      
      updateData.timeline = newTimeline;
    }
    
    if (req.body.deliverables) {
      updateData.deliverables = { ...task.deliverables, ...req.body.deliverables };
    }
    
    if (req.body.quality_control) {
      updateData.quality_control = { ...task.quality_control, ...req.body.quality_control };
    }
    
    if (req.body.financial_info && (userRole === 'super_admin' || userRole === 'marketing_coordinator')) {
      updateData.financial_info = { ...task.financial_info, ...req.body.financial_info };
    }
    
    await db.collection('campaign_tasks').doc(taskId).update(updateData);
    
    // Get updated task
    const updatedTaskDoc = await db.collection('campaign_tasks').doc(taskId).get();
    const updatedTask = { id: taskId, ...updatedTaskDoc.data() };
    
    res.status(200).json({
      success: true,
      data: updatedTask,
      message: 'تم تحديث المهمة بنجاح',
      timestamp: new Date().toISOString()
    } as ApiResponse<CampaignTask>);
    
  } catch (error: any) {
    next(error);
  }
};

/**
 * حذف مهمة
 */
export const deleteTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user?.uid;
    const taskId = req.params.id;
    
    const taskDoc = await db.collection('campaign_tasks').doc(taskId).get();
    
    if (!taskDoc.exists) {
      res.status(404).json({
        success: false,
        error: 'Task not found',
        message: 'المهمة غير موجودة',
        timestamp: new Date().toISOString()
      } as ApiResponse<null>);
      return;
    }
    
    const task = taskDoc.data()!;
    const permissions = await checkTaskPermissions(userId, taskId);
    
    if (!permissions.canDelete) {
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions to delete this task',
        message: 'ما عندك صلاحية لحذف هذه المهمة',
        timestamp: new Date().toISOString()
      } as ApiResponse<null>);
      return;
    }
    
    // Don't allow deletion of tasks that are in progress or completed
    if (['in_progress', 'completed'].includes(task.status_tracking.current_status)) {
      res.status(400).json({
        success: false,
        error: 'Cannot delete task in current status',
        message: 'لا يمكن حذف المهمة في الحالة الحالية',
        timestamp: new Date().toISOString()
      } as ApiResponse<null>);
      return;
    }
    
    await db.collection('campaign_tasks').doc(taskId).delete();
    
    // تحديث progress الحملة
    await updateCampaignProgress(task.campaign_id);
    
    res.status(200).json({
      success: true,
      data: null,
      message: 'تم حذف المهمة بنجاح',
      timestamp: new Date().toISOString()
    } as ApiResponse<null>);
    
  } catch (error: any) {
    next(error);
  }
};

export const taskHandlers = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
}; 
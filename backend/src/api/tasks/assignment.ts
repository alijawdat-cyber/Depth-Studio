/**
 * 📋 Task Assignment Logic
 * 
 * تطوير علي جودت - Depth Studio
 * آخر تحديث: يناير 2025
 * 
 * @description Smart assignment logic for tasks
 * @version 1.0.0
 */

import { db } from '../../config/firebase';


/**
 * Helper للتحقق من صلاحيات البراند
 */
export const checkBrandPermission = async (userId: string, brandId: string): Promise<boolean> => {
  const userPermissions = await db.collection('user_permissions').doc(userId).get();
  if (!userPermissions.exists) return false;
  
  const permissions = userPermissions.data();
  const brandPermissions = permissions?.brand_permissions || [];
  
  return brandPermissions.some((bp: any) => bp.brand_id === brandId);
};

/**
 * تحليل permissions للمهام
 */
export const checkTaskPermissions = async (userId: string, taskId: string | null = null) => {
  const userDoc = await db.collection('users').doc(userId).get();
  const userPermissions = await db.collection('user_permissions').doc(userId).get();
  
  if (!userDoc.exists || !userPermissions.exists) {
    throw new Error('User not found or permissions not set');
  }
  
  const user = userDoc.data()!;
  const permissions = userPermissions.data()!;
  
  // Super admin has all permissions
  if (user.primary_role === 'super_admin') {
    return { canCreate: true, canUpdate: true, canDelete: true, canView: true, canAssign: true };
  }
  
  // Marketing coordinator permissions
  if (user.primary_role === 'marketing_coordinator') {
    return { 
      canCreate: permissions.crud_permissions?.tasks?.create || false,
      canUpdate: permissions.crud_permissions?.tasks?.update || false,
      canDelete: permissions.crud_permissions?.tasks?.delete || false,
      canView: permissions.crud_permissions?.tasks?.read || false,
      canAssign: true
    };
  }
  
  // Brand coordinator - restricted to assigned brands
  if (user.primary_role === 'brand_coordinator') {
    if (taskId) {
      const taskDoc = await db.collection('campaign_tasks').doc(taskId).get();
      if (taskDoc.exists) {
        const task = taskDoc.data()!;
        const campaignDoc = await db.collection('campaigns').doc(task.campaign_id).get();
        if (campaignDoc.exists) {
          const campaign = campaignDoc.data()!;
          const brandPermissions = permissions.brand_permissions || [];
          
          const hasBrandAccess = brandPermissions.some((bp: any) => 
            bp.brand_id === campaign.campaign_info.brand_id && bp.can_edit_tasks
          );
          
          if (hasBrandAccess) {
            return { canCreate: true, canUpdate: true, canDelete: false, canView: true, canAssign: true };
          }
        }
      }
    }
    
    return { canCreate: true, canUpdate: true, canDelete: false, canView: true, canAssign: true };
  }
  
  // Photographer - can only view and update their own tasks
  if (user.primary_role === 'photographer') {
    return { canCreate: false, canUpdate: true, canDelete: false, canView: true, canAssign: false };
  }
  
  return { canCreate: false, canUpdate: false, canDelete: false, canView: false, canAssign: false };
};

export const assignTaskToPhotographer = async (taskId: string, photographerId: string, assignedBy: string) => {
  try {
    // التحقق من وجود المهمة
    const taskDoc = await db.collection('campaign_tasks').doc(taskId).get();
    if (!taskDoc.exists) {
      throw new Error('Task not found');
    }
    
    // التحقق من وجود المصور
    const photographerDoc = await db.collection('users').doc(photographerId).get();
    if (!photographerDoc.exists) {
      throw new Error('Photographer not found');
    }
    
    const photographer = photographerDoc.data()!;
    if (photographer.primary_role !== 'photographer') {
      throw new Error('User is not a photographer');
    }
    
    // التحقق من حالة المصور (متاح، مشغول، إلخ)
    const photographerStatus = photographer.status || 'active';
    if (photographerStatus !== 'active') {
      throw new Error('Photographer is not available');
    }
    
    // تحديث المهمة
    const task = taskDoc.data()!;
    const statusHistory = [...(task.status_tracking?.status_history || [])];
    statusHistory.push({
      status: 'assigned',
      updated_by: assignedBy,
      updated_at: new Date(),
      notes: `Assigned to photographer: ${photographer.full_name || photographerId}`
    });
    
    const updateData: any = {
      'assignment.assigned_photographer': photographerId,
      'assignment.assigned_by': assignedBy,
      'assignment.assigned_at': new Date(),
      'assignment.assignment_method': 'manual',
      'status_tracking.current_status': 'assigned',
      'status_tracking.status_history': statusHistory,
      updated_at: new Date()
    };
    
    await db.collection('campaign_tasks').doc(taskId).update(updateData);
    
    return {
      success: true,
      message: 'Task assigned successfully',
      assigned_to: photographer.full_name || photographerId
    };
    
  } catch (error: any) {
    throw new Error(`Assignment failed: ${error.message}`);
  }
};

export const autoAssignTask = async (taskId: string, assignedBy: string) => {
  try {
    // التحقق من وجود المهمة
    const taskDoc = await db.collection('campaign_tasks').doc(taskId).get();
    if (!taskDoc.exists) {
      throw new Error('Task not found');
    }
    
    const task = taskDoc.data()!;
    
    // إذا المهمة معينة أصلاً، ما نعينها مرة ثانية
    if (task.assignment?.assigned_photographer) {
      throw new Error('Task is already assigned');
    }
    
    // جلب المصورين المتاحين
    const photographersSnapshot = await db.collection('users')
      .where('primary_role', '==', 'photographer')
      .where('status', '==', 'active')
      .get();
    
    if (photographersSnapshot.empty) {
      throw new Error('No available photographers found');
    }
    
    const photographers = photographersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // حساب عدد المهام المعينة لكل مصور (للتوزيع العادل)
    const photographerWorkload = new Map();
    
    for (const photographer of photographers) {
      const assignedTasksSnapshot = await db.collection('campaign_tasks')
        .where('assignment.assigned_photographer', '==', photographer.id)
        .where('status_tracking.current_status', 'in', ['assigned', 'in_progress'])
        .get();
      
      photographerWorkload.set(photographer.id, assignedTasksSnapshot.size);
    }
    
    // اختيار المصور الأقل حملاً
    let selectedPhotographer = photographers[0];
    let minWorkload = photographerWorkload.get(selectedPhotographer.id) || 0;
    
    for (const photographer of photographers) {
      const workload = photographerWorkload.get(photographer.id) || 0;
      if (workload < minWorkload) {
        selectedPhotographer = photographer;
        minWorkload = workload;
      }
    }
    
    // تعيين المهمة للمصور المختار
    return await assignTaskToPhotographer(taskId, selectedPhotographer.id, assignedBy);
    
  } catch (error: any) {
    throw new Error(`Auto assignment failed: ${error.message}`);
  }
};

export const unassignTask = async (taskId: string, unassignedBy: string, reason?: string) => {
  try {
    // التحقق من وجود المهمة
    const taskDoc = await db.collection('campaign_tasks').doc(taskId).get();
    if (!taskDoc.exists) {
      throw new Error('Task not found');
    }
    
    const task = taskDoc.data()!;
    
    // التحقق من أن المهمة معينة أصلاً
    if (!task.assignment?.assigned_photographer) {
      throw new Error('Task is not assigned to any photographer');
    }
    
    // لا نسمح بإلغاء التعيين إذا المهمة قيد التنفيذ أو مكتملة
    const currentStatus = task.status_tracking?.current_status;
    if (['in_progress', 'completed'].includes(currentStatus)) {
      throw new Error('Cannot unassign task that is in progress or completed');
    }
    
    // تحديث الـ status history
    const statusHistory = [...(task.status_tracking?.status_history || [])];
    statusHistory.push({
      status: 'pending',
      updated_by: unassignedBy,
      updated_at: new Date(),
      notes: reason ? `Task unassigned: ${reason}` : 'Task unassigned'
    });
    
    // تحديث المهمة
    const updateData: any = {
      'assignment.assigned_photographer': null,
      'assignment.assigned_by': null,
      'assignment.assigned_at': null,
      'assignment.assignment_method': 'manual',
      'status_tracking.current_status': 'pending',
      'status_tracking.status_history': statusHistory,
      updated_at: new Date()
    };
    
    await db.collection('campaign_tasks').doc(taskId).update(updateData);
    
    return {
      success: true,
      message: 'Task unassigned successfully',
      reason: reason || 'No reason provided'
    };
    
  } catch (error: any) {
    throw new Error(`Unassignment failed: ${error.message}`);
  }
};

export const taskAssignment = {
  assignTaskToPhotographer,
  autoAssignTask,
  unassignTask
}; 
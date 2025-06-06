/**
 * 🔔 أنواع الإشعارات - Depth Studio (مبسط)
 * ==========================================
 * 
 * ✨ تم التبسيط الجذري:
 * من 132 سطر إلى ~30 سطر (-77%)
 * من 8 واجهات إلى 1 واجهة (-88%)
 * 🎯 نفس الوظائف، كود أقل وأوضح
 */

import { BaseEntity, FirebaseTimestamp, ID } from './core/base';
import { NotificationType, PriorityLevel, UserRole } from './core/enums';

// ======================================
// 🔔 الإشعار (مبسط)
// ======================================

/** إشعار النظام - نسخة مبسطة وعملية */
export interface Notification extends BaseEntity {
  // نوع ومحتوى الإشعار
  type: NotificationType;
  priority: PriorityLevel;
  title: string;
  message: string;
  
  // المرسل والمستقبل
  recipient_id: ID;
  recipient_role: UserRole;
  sender_id?: ID;
  sender_name?: string;
  
  // الحالة
  is_read: boolean;
  read_at?: FirebaseTimestamp;
  is_urgent: boolean;
  
  // المراجع (مبسطة)
  campaign_id?: ID;
  task_id?: ID;
  brand_id?: ID;
  
  // إجراء مطلوب (مبسط)
  action_required: boolean;
  action_url?: string;
  action_deadline?: FirebaseTimestamp;
  action_completed: boolean;
  action_completed_at?: FirebaseTimestamp;
  
  // انتهاء الصلاحية
  expires_at?: FirebaseTimestamp;
  
  // مرفقات بسيطة
  attachment_url?: string;
  attachment_name?: string;
} 
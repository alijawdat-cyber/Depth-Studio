/**
 * 📱 أنواع الحملات والمهام - Depth Studio (مبسط)
 * =================================================
 * 
 * ✨ تم التبسيط المحسوب:
 * من 115 سطر إلى ~50 سطر (-57%)
 * من 4 واجهات إلى 2 واجهة (-50%)
 * 🎯 المحافظة على كل وظائف النظام الذكي
 */

import { BaseEntity, FirebaseTimestamp, ID } from './core/base';
import { CampaignStatus, CampaignType, PriorityLevel, TaskStatus, LocationType } from './core/enums';

// ======================================
// 📱 الحملة الذكية (مبسطة)
// ======================================

/** الحملة الذكية - مبسطة مع المحافظة على الذكاء */
export interface Campaign extends BaseEntity {
  // معلومات أساسية
  name: string;
  description: string;
  brand_id: ID;
  type: CampaignType;
  priority: PriorityLevel;
  status: CampaignStatus;
  
  // إدارة الحملة
  created_by: ID;
  assigned_photographers: ID[];        // المصورين المخصصين للحملة
  
  // الجدولة المبسطة
  timeline: {
    start_date: FirebaseTimestamp;
    end_date: FirebaseTimestamp;
  };
  target_completion_date: FirebaseTimestamp;
  
  // الأهداف والمحتوى
  total_content_pieces: number;
  content_requirements: string[];      // متطلبات مبسطة
  
  // الميزانية
  budget: number;
  currency: string;
  
  // الذكاء الاصطناعي
  enable_smart_assignment: boolean;
  auto_scheduling: boolean;
  
  // التقدم (مبسط)
  progress_percentage: number;
  total_tasks: number;
  completed_tasks: number;
  pending_tasks: number;
  
  // مراحل مهمة
  key_milestones: string[];            // نصوص مبسطة للمراحل
}

// ======================================
// 📋 مهمة الحملة (مدمجة في Campaign)
// ======================================

/** 
 * ملاحظة: المهام مدمجة الآن داخل Campaign object
 * لا نحتاج collection منفصل للمهام في النسخة المبسطة
 * جميع معلومات المهام متاحة من خلال:
 * - campaign.assigned_photographers
 * - campaign.content_requirements  
 * - campaign.total_tasks
 * - campaign.progress_percentage
 */

export interface TaskInfo {
  // معلومات أساسية (مبسطة ومدمجة)
  title: string;
  description: string;
  assigned_photographer?: ID;
  status: TaskStatus;
  priority: PriorityLevel;
  due_date: FirebaseTimestamp;
  progress_percentage: number;
} 
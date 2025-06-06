/**
 * 📁 أنواع المحتوى - Depth Studio (مبسط)
 * =========================================
 * 
 * ✨ تم التبسيط المدروس:
 * من 90 سطر إلى ~40 سطر (-55%)
 * من 2 واجهات معقدة إلى 2 واجهات مبسطة
 * 🎯 المحافظة على كل وظائف مكتبة المحتوى
 */

import { BaseEntity, MultiLanguageText, FirebaseTimestamp, ID } from './core/base';
import { ContentType, ContentApprovalStatus } from './core/enums';

// ======================================
// 📁 مكتبة المحتوى (مبسطة)
// ======================================

/** مكتبة المحتوى - مبسطة وعملية */
export interface Content extends BaseEntity {
  // معلومات أساسية
  title: string;
  description: string;
  type: ContentType;
  
  // المراجع
  brand_id: ID;
  photographer_id: ID;
  campaign_id?: ID;
  task_id?: ID;
  
  // معلومات الملف (مبسطة)
  filename: string;
  file_size: number;
  file_format: string;
  file_url: string;
  thumbnail_url?: string;
  
  // أبعاد (مبسطة)
  width?: number;
  height?: number;
  duration?: number;  // للفيديو
  
  // التصنيف (مبسط)
  category: string;
  tags: string[];
  style: string[];
  
  // الموافقة والجودة
  status: ContentApprovalStatus;
  quality_score: number;
  approved_by?: ID;
  approved_at?: FirebaseTimestamp;
  rejection_reason?: string;
  
  // الاستخدام والإحصائيات
  usage_type: 'exclusive' | 'non_exclusive' | 'limited' | 'unlimited';
  view_count: number;
  download_count: number;
  client_rating?: number;
  
  // معلومات إضافية
  shooting_location?: string;
  shooting_date?: FirebaseTimestamp;
  license_expiry?: FirebaseTimestamp;
}

// ======================================
// 📂 فئات المحتوى (مبسطة)
// ======================================

/** فئة المحتوى - نسخة مبسطة */
export interface ContentCategory extends BaseEntity {
  name: MultiLanguageText;
  description: MultiLanguageText;
  type: string;
  
  // التسعير والوقت
  base_price: number;
  estimated_hours: number;
  complexity_factor: number;
  
  // المتطلبات الأساسية
  default_requirements: string[];
  
  // الحالة والترتيب
  is_active: boolean;
  sort_order: number;
  
  // إحصائيات الاستخدام
  usage_count: number;
} 
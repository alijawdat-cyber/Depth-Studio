/**
 * 🏢 أنواع البراندات - Depth Studio
 * =================================
 */

import { BaseEntity, ActivatableEntity, ContactInfo, MultiLanguageText, ID } from './core/base';  // استيراد الأنواع الأساسية
import { BrandStatus, BrandType, Industry } from './core/enums';  // استيراد تعدادات البراندات

// ======================================
// 🏢 البراند الأساسي
// ======================================

/** البراند */
export interface Brand extends ActivatableEntity {
  // معلومات أساسية
  name: MultiLanguageText;              // اسم البراند بالعربي والإنجليزي
  description: MultiLanguageText;       // وصف البراند بالعربي والإنجليزي
  brand_type: BrandType;                // نوع البراند (محلي، دولي، ناشئ، مؤسسي)
  industry: Industry;                   // الصناعة التي ينتمي لها البراند
  status: BrandStatus;                  // حالة البراند (نشط، متوقف، مؤرشف)
  
  // هوية البراند
  logo_url?: string;                    // رابط شعار البراند (اختياري)
  primary_color: string;                // اللون الأساسي للبراند
  secondary_color: string;              // اللون الثانوي للبراند
  
  // معلومات الاتصال البسيطة
  contact_name: string;                 // اسم الشخص المسؤول للتواصل
  contact_email: string;                // البريد الإلكتروني للتواصل
  contact_phone: string;                // رقم الهاتف للتواصل
  
  // المنسق المخصص
  assigned_coordinator?: ID;            // معرف المنسق المخصص للبراند (اختياري)
  
  // إعدادات الميزانية والمحتوى
  monthly_budget: number;               // الميزانية الشهرية للبراند
  currency: string;                     // العملة المستخدمة (USD, IQD, الخ)
  pricing_tier: string;                 // مستوى التسعير (basic, premium, enterprise)
  preferred_styles: string[];           // الأساليب المفضلة للمحتوى
  content_categories: string[];         // فئات المحتوى المطلوبة
  
  // إدارة البراند
  created_by: ID;                       // من أنشأ البراند
  last_updated_by: ID;                  // آخر من حدث البراند
  
  // الإحصائيات
  total_campaigns: number;              // إجمالي عدد الحملات
  total_content_pieces: number;         // إجمالي عدد قطع المحتوى المنتجة
  average_project_rating: number;       // متوسط تقييم المشاريع
  total_spent: number;                  // إجمالي المبلغ المنفق
} 
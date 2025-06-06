/**
 * 💰 أنواع المدفوعات - Depth Studio (مبسط)
 * ===========================================
 * 
 * ✨ تم التبسيط المدروس:
 * من 102 سطر إلى ~35 سطر (-66%)
 * من 5 واجهات إلى 1 واجهة (-80%)
 * 🎯 المحافظة على كل الوظائف المالية الأساسية
 */

import { BaseEntity, FirebaseTimestamp, ID } from './core/base';
import { PaymentStatus, PaymentMethod, ContractType } from './core/enums';

// ======================================
// 💰 الدفعة (مبسطة)
// ======================================

/** الدفعة - مبسطة مع المحافظة على الوظائف المالية */
export interface Payment extends BaseEntity {
  // معلومات الدفعة الأساسية
  type: 'task_payment' | 'monthly_salary' | 'bonus' | 'reimbursement';
  description: string;
  reference_id: string;
  
  // معلومات المستلم
  recipient_id: ID;
  recipient_name: string;
  recipient_type: 'photographer' | 'coordinator' | 'vendor';
  contract_type: ContractType;
  
  // المبالغ (مبسطة)
  gross_amount: number;           // المبلغ الإجمالي
  deductions: number;             // إجمالي الخصومات
  net_amount: number;             // المبلغ الصافي
  currency: string;
  
  // المراجع
  campaign_id?: ID;
  task_ids: ID[];                 // المهام المرتبطة
  
  // الحالة والموافقة
  status: PaymentStatus;
  payment_method: PaymentMethod;
  
  // تواريخ مهمة
  due_date?: FirebaseTimestamp;
  payment_date?: FirebaseTimestamp;
  
  // الموافقة (مبسطة)
  approved_by?: ID;
  approved_at?: FirebaseTimestamp;
  approval_notes?: string;
  
  // تفاصيل الدفع (مرنة)
  payment_details?: Record<string, string>;  // تفاصيل مرنة حسب طريقة الدفع
  
  // الضرائب والرسوم
  tax_amount: number;
  processing_fees: number;
  
  // تأكيد الدفع
  confirmation_number?: string;
  receipt_url?: string;
} 
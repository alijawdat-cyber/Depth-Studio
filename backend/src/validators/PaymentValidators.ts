/**
 * 💰 Payment Validators - التحقق من بيانات المدفوعات
 * ===================================================
 * 
 * جميع schemas التحقق المطلوبة لـ PaymentController
 * مع رسائل خطأ باللغة العربية وتحقق متقدم
 * 
 * 📅 تاريخ الإنشاء: ديسمبر 2024
 * 👨‍💻 المطور: علي جودت
 */

import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { 
  BaseValidator, 
  IDSchema, 
  PositiveNumberSchema,
  CurrencySchema,
  PaginationSchema,
  DateStringSchema
} from './BaseValidator';

// تعريف قيم الأنواع والحالات كـ const arrays لاستخدامها في validation
const PAYMENT_STATUSES = [
  'draft',
  'pending_approval',
  'approved',
  'processing',
  'paid',
  'failed',
  'cancelled'
] as const;

const PAYMENT_METHODS = [
  'cash',
  'zain_cash',
  'rafidain_bank'
] as const;

const CONTRACT_TYPES = [
  'freelancer',
  'salary'
] as const;

const PAYMENT_TYPES = [
  'task_payment',
  'monthly_salary',
  'bonus',
  'reimbursement'
] as const;

const RECIPIENT_TYPES = [
  'photographer',
  'coordinator',
  'vendor'
] as const;

// ======================================
// 🎯 Validation Schemas للمدفوعات
// ======================================

/**
 * تفاصيل الدفع المرنة
 */
export const PaymentDetailsSchema = z.record(
  z.string(),
  z.string()
).optional();

/**
 * إنشاء دفعة جديدة
 */
export const CreatePaymentSchema = z.object({
  type: z.enum(PAYMENT_TYPES, {
    errorMap: () => ({ message: "نوع الدفعة غير صحيح" })
  }),
  
  description: z.string({
    required_error: "وصف الدفعة مطلوب"
  }).min(10, "وصف الدفعة يجب أن يكون على الأقل 10 أحرف")
    .max(500, "وصف الدفعة لا يمكن أن يكون أكثر من 500 حرف"),
  
  reference_id: z.string({
    required_error: "معرف المرجع مطلوب"
  }).min(3, "معرف المرجع يجب أن يكون على الأقل 3 أحرف"),
  
  recipient_id: IDSchema,
  recipient_name: z.string({
    required_error: "اسم المستلم مطلوب"
  }).min(2, "اسم المستلم يجب أن يكون على الأقل حرفين"),
  
  recipient_type: z.enum(RECIPIENT_TYPES, {
    errorMap: () => ({ message: "نوع المستلم غير صحيح" })
  }),
  
  contract_type: z.enum(CONTRACT_TYPES, {
    errorMap: () => ({ message: "نوع العقد غير صحيح" })
  }),
  
  gross_amount: PositiveNumberSchema,
  deductions: z.number({
    required_error: "مبلغ الخصومات مطلوب"
  }).min(0, "مبلغ الخصومات لا يمكن أن يكون سالباً"),
  
  currency: CurrencySchema,
  
  campaign_id: IDSchema.optional(),
  task_ids: z.array(IDSchema).min(1, "يجب ربط الدفعة بمهمة واحدة على الأقل"),
  
  payment_method: z.enum(PAYMENT_METHODS, {
    errorMap: () => ({ message: "طريقة الدفع غير صحيحة" })
  }),
  
  due_date: DateStringSchema.optional(),
  
  tax_amount: z.number({
    required_error: "مبلغ الضريبة مطلوب"
  }).min(0, "مبلغ الضريبة لا يمكن أن يكون سالباً"),
  
  processing_fees: z.number({
    required_error: "رسوم المعالجة مطلوبة"
  }).min(0, "رسوم المعالجة لا يمكن أن تكون سالبة"),
  
  payment_details: PaymentDetailsSchema,
  
  created_by: IDSchema
}).refine(
  (data) => {
    const netAmount = data.gross_amount - data.deductions - data.tax_amount - data.processing_fees;
    return netAmount > 0;
  },
  {
    message: "المبلغ الصافي يجب أن يكون موجباً بعد خصم الضرائب والرسوم",
    path: ["net_amount"]
  }
);

/**
 * البحث عن دفعة
 */
export const GetPaymentSchema = z.object({
  id: IDSchema.optional(),
  recipient_id: IDSchema.optional(),
  campaign_id: IDSchema.optional(),
  reference_id: z.string().optional()
}).refine(
  (data) => data.id || data.recipient_id || data.campaign_id || data.reference_id,
  {
    message: "يجب تقديم معرف الدفعة أو معرف المستلم أو معرف الحملة أو معرف المرجع",
    path: ["search_criteria"]
  }
);

/**
 * البحث المتقدم في المدفوعات
 */
export const SearchPaymentsSchema = PaginationSchema.extend({
  search: z.string().optional(),
  searchTerm: z.string().optional(),
  type: z.enum(PAYMENT_TYPES).optional(),
  status: z.enum(PAYMENT_STATUSES).optional(),
  payment_method: z.enum(PAYMENT_METHODS).optional(),
  recipient_type: z.enum(RECIPIENT_TYPES).optional(),
  contract_type: z.enum(CONTRACT_TYPES).optional(),
  recipient_id: IDSchema.optional(),
  campaign_id: IDSchema.optional(),
  approved_by: IDSchema.optional(),
  min_amount: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
  max_amount: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
  currency: CurrencySchema.optional(),
  due_date_from: DateStringSchema.optional(),
  due_date_to: DateStringSchema.optional(),
  payment_date_from: DateStringSchema.optional(),
  payment_date_to: DateStringSchema.optional(),
  approved_from: DateStringSchema.optional(),
  approved_to: DateStringSchema.optional()
});

/**
 * معرف الدفعة في params
 */
export const PaymentParamsSchema = z.object({
  paymentId: IDSchema
});

/**
 * تحديث حالة الدفعة
 */
export const UpdatePaymentStatusSchema = z.object({
  status: z.enum(PAYMENT_STATUSES, {
    errorMap: () => ({ message: "حالة الدفعة غير صحيحة" })
  }),
  updated_by: IDSchema,
  notes: z.string().optional(),
  confirmation_number: z.string().optional(),
  receipt_url: z.string().url("رابط الإيصال غير صحيح").optional()
});

/**
 * الموافقة على الدفعة
 */
export const ApprovePaymentSchema = z.object({
  approved_by: IDSchema,
  approval_notes: z.string().optional(),
  approved_amount: PositiveNumberSchema.optional()
});

/**
 * رفض الدفعة
 */
export const RejectPaymentSchema = z.object({
  rejected_by: IDSchema,
  rejection_reason: z.string({
    required_error: "سبب الرفض مطلوب"
  }).min(10, "سبب الرفض يجب أن يكون على الأقل 10 أحرف"),
  suggested_changes: z.string().optional()
});

/**
 * معالجة الدفع
 */
export const ProcessPaymentSchema = z.object({
  processed_by: IDSchema,
  payment_method: z.enum(PAYMENT_METHODS, {
    errorMap: () => ({ message: "طريقة الدفع غير صحيحة" })
  }),
  confirmation_number: z.string({
    required_error: "رقم التأكيد مطلوب"
  }).min(5, "رقم التأكيد يجب أن يكون على الأقل 5 أحرف"),
  processing_notes: z.string().optional(),
  receipt_url: z.string().url("رابط الإيصال غير صحيح").optional()
});

/**
 * تأكيد اكتمال الدفع
 */
export const ConfirmPaymentCompletedSchema = z.object({
  confirmed_by: IDSchema,
  payment_date: DateStringSchema,
  actual_amount: PositiveNumberSchema,
  confirmation_number: z.string({
    required_error: "رقم التأكيد مطلوب"
  }),
  receipt_url: z.string().url("رابط الإيصال مطلوب"),
  completion_notes: z.string().optional()
});

/**
 * حساب أرباح المصور
 */
export const CalculatePhotographerEarningsSchema = z.object({
  photographer_id: IDSchema,
  period_start: DateStringSchema,
  period_end: DateStringSchema,
  include_bonuses: z.boolean().default(true),
  include_pending: z.boolean().default(false)
}).refine(
  (data) => new Date(data.period_end) > new Date(data.period_start),
  {
    message: "تاريخ نهاية الفترة يجب أن يكون بعد تاريخ البداية",
    path: ["period_end"]
  }
);

/**
 * إنشاء فاتورة
 */
export const GenerateInvoiceSchema = z.object({
  payment_ids: z.array(IDSchema).min(1, "يجب تحديد دفعة واحدة على الأقل"),
  invoice_type: z.enum(['individual', 'summary'], {
    errorMap: () => ({ message: "نوع الفاتورة غير صحيح" })
  }),
  include_tax_breakdown: z.boolean().default(true),
  generated_by: IDSchema,
  notes: z.string().optional()
});

/**
 * معايير التقارير المالية
 */
export const FinancialReportsSchema = z.object({
  report_type: z.enum(['summary', 'detailed', 'tax', 'earnings'], {
    errorMap: () => ({ message: "نوع التقرير غير صحيح" })
  }),
  period_start: DateStringSchema,
  period_end: DateStringSchema,
  filter_by_recipient_type: z.enum(RECIPIENT_TYPES).optional(),
  filter_by_payment_method: z.enum(PAYMENT_METHODS).optional(),
  filter_by_currency: CurrencySchema.optional(),
  include_pending: z.boolean().default(false),
  group_by: z.enum(['month', 'quarter', 'recipient', 'campaign', 'payment_method']).optional(),
  requested_by: IDSchema
}).refine(
  (data) => new Date(data.period_end) > new Date(data.period_start),
  {
    message: "تاريخ نهاية الفترة يجب أن يكون بعد تاريخ البداية",
    path: ["period_end"]
  }
);

// ======================================
// 🛠️ Middleware Functions
// ======================================

/**
 * Middleware للتحقق من بيانات إنشاء الدفعة
 */
export const validateCreatePayment = BaseValidator.createValidationMiddleware(
  CreatePaymentSchema,
  'body'
);

/**
 * Middleware للتحقق من معايير البحث عن الدفعة
 */
export const validateGetPayment = BaseValidator.createValidationMiddleware(
  GetPaymentSchema,
  'query'
);

/**
 * Middleware للتحقق من معايير البحث المتقدم
 */
export const validateSearchPayments = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const validated = SearchPaymentsSchema.parse(req.query);
    req.query = validated as any;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'معايير البحث غير صحيحة',
        errors: BaseValidator.formatZodErrors(error)
      });
      return;
    }
    next(error);
  }
};

/**
 * Middleware للتحقق من معرف الدفعة في params
 */
export const validatePaymentParams = BaseValidator.createValidationMiddleware(
  PaymentParamsSchema,
  'params'
);

/**
 * Middleware للتحقق من بيانات تحديث الحالة
 */
export const validateUpdatePaymentStatus = BaseValidator.createValidationMiddleware(
  UpdatePaymentStatusSchema,
  'body'
);

/**
 * Middleware للتحقق من بيانات الموافقة
 */
export const validateApprovePayment = BaseValidator.createValidationMiddleware(
  ApprovePaymentSchema,
  'body'
);

/**
 * Middleware للتحقق من بيانات الرفض
 */
export const validateRejectPayment = BaseValidator.createValidationMiddleware(
  RejectPaymentSchema,
  'body'
);

/**
 * Middleware للتحقق من بيانات المعالجة
 */
export const validateProcessPayment = BaseValidator.createValidationMiddleware(
  ProcessPaymentSchema,
  'body'
);

/**
 * Middleware للتحقق من بيانات تأكيد الاكتمال
 */
export const validateConfirmPaymentCompleted = BaseValidator.createValidationMiddleware(
  ConfirmPaymentCompletedSchema,
  'body'
);

/**
 * Middleware للتحقق من بيانات حساب الأرباح
 */
export const validateCalculatePhotographerEarnings = BaseValidator.createValidationMiddleware(
  CalculatePhotographerEarningsSchema,
  'query'
);

/**
 * Middleware للتحقق من بيانات إنشاء الفاتورة
 */
export const validateGenerateInvoice = BaseValidator.createValidationMiddleware(
  GenerateInvoiceSchema,
  'body'
);

/**
 * Middleware للتحقق من معايير التقارير المالية
 */
export const validateFinancialReports = BaseValidator.createValidationMiddleware(
  FinancialReportsSchema,
  'query'
);

/**
 * Middleware للتحقق من معرف المصور في params
 */
export const validatePhotographerParams = BaseValidator.createValidationMiddleware(
  z.object({
    photographerId: IDSchema
  }),
  'params'
);

// ======================================
// 🎯 Type Definitions
// ======================================

export type CreatePaymentInput = z.infer<typeof CreatePaymentSchema>;
export type GetPaymentInput = z.infer<typeof GetPaymentSchema>;
export type SearchPaymentsInput = z.infer<typeof SearchPaymentsSchema>;
export type PaymentParamsInput = z.infer<typeof PaymentParamsSchema>;
export type UpdatePaymentStatusInput = z.infer<typeof UpdatePaymentStatusSchema>;
export type ApprovePaymentInput = z.infer<typeof ApprovePaymentSchema>;
export type RejectPaymentInput = z.infer<typeof RejectPaymentSchema>;
export type ProcessPaymentInput = z.infer<typeof ProcessPaymentSchema>;
export type ConfirmPaymentCompletedInput = z.infer<typeof ConfirmPaymentCompletedSchema>;
export type CalculatePhotographerEarningsInput = z.infer<typeof CalculatePhotographerEarningsSchema>;
export type GenerateInvoiceInput = z.infer<typeof GenerateInvoiceSchema>;
export type FinancialReportsInput = z.infer<typeof FinancialReportsSchema>;

export default BaseValidator; 
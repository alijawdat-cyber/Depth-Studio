/**
 * 🛠️ Equipment Validators - التحقق من بيانات المعدات
 * ==================================================
 * 
 * جميع schemas التحقق المطلوبة لـ EquipmentController
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
  PaginationSchema,
  DateStringSchema
} from './BaseValidator';

// تعريف قيم الأنواع والحالات كـ const arrays لاستخدامها في validation
const EQUIPMENT_TYPES = [
  'camera',
  'lens',
  'lighting',
  'tripod',
  'backdrop',
  'audio',
  'accessories'
] as const;

const EQUIPMENT_CONDITIONS = [
  'excellent',
  'good',
  'fair',
  'needs_repair'
] as const;

const EQUIPMENT_STATUSES = [
  'available',
  'in_use',
  'maintenance',
  'retired'
] as const;

const MAINTENANCE_PRIORITIES = [
  'low',
  'medium',
  'high',
  'urgent'
] as const;

const MAINTENANCE_STATUSES = [
  'scheduled',
  'in_progress',
  'completed',
  'cancelled'
] as const;

// ======================================
// 🎯 Validation Schemas للمعدات
// ======================================

/**
 * إضافة معدة جديدة
 */
export const AddEquipmentSchema = z.object({
  name: z.string({
    required_error: "اسم المعدة مطلوب"
  }).min(2, "اسم المعدة يجب أن يكون على الأقل حرفين")
    .max(100, "اسم المعدة لا يمكن أن يكون أكثر من 100 حرف"),
  
  type: z.enum(EQUIPMENT_TYPES, {
    errorMap: () => ({ message: "نوع المعدة غير صحيح" })
  }),
  
  brand: z.string({
    required_error: "علامة المعدة مطلوبة"
  }).min(2, "علامة المعدة يجب أن تكون على الأقل حرفين"),
  
  model: z.string({
    required_error: "موديل المعدة مطلوب"
  }).min(1, "موديل المعدة لا يمكن أن يكون فارغاً"),
  
  description: z.string().optional(),
  
  condition: z.enum(EQUIPMENT_CONDITIONS, {
    errorMap: () => ({ message: "حالة المعدة غير صحيحة" })
  }),
  
  owner_id: IDSchema,
  
  purchase_price: PositiveNumberSchema,
  purchase_date: DateStringSchema,
  
  location: z.string({
    required_error: "موقع المعدة مطلوب"
  }).min(2, "موقع المعدة يجب أن يكون على الأقل حرفين"),
  
  is_portable: z.boolean().default(true),
  
  warranty_expiry: DateStringSchema.optional(),
  
  added_by: IDSchema
});

/**
 * البحث عن معدة
 */
export const GetEquipmentSchema = z.object({
  id: IDSchema.optional(),
  name: z.string().optional(),
  type: z.enum(EQUIPMENT_TYPES).optional(),
  owner_id: IDSchema.optional(),
  current_user: IDSchema.optional()
}).refine(
  (data) => data.id || data.name || data.type || data.owner_id || data.current_user,
  {
    message: "يجب تقديم معرف المعدة أو الاسم أو النوع أو معرف المالك أو المستخدم الحالي",
    path: ["search_criteria"]
  }
);

/**
 * البحث المتقدم في المعدات
 */
export const SearchEquipmentSchema = PaginationSchema.extend({
  search: z.string().optional(),
  searchTerm: z.string().optional(),
  type: z.enum(EQUIPMENT_TYPES).optional(),
  condition: z.enum(EQUIPMENT_CONDITIONS).optional(),
  status: z.enum(EQUIPMENT_STATUSES).optional(),
  owner_id: IDSchema.optional(),
  current_user: IDSchema.optional(),
  is_available: z.string().optional().transform(val => val === 'true' ? true : val === 'false' ? false : undefined),
  is_portable: z.string().optional().transform(val => val === 'true' ? true : val === 'false' ? false : undefined),
  location: z.string().optional(),
  brand: z.string().optional(),
  min_price: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
  max_price: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
  purchase_date_from: DateStringSchema.optional(),
  purchase_date_to: DateStringSchema.optional(),
  warranty_expiring_within_days: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  maintenance_due: z.string().optional().transform(val => val === 'true' ? true : val === 'false' ? false : undefined)
});

/**
 * معرف المعدة في params
 */
export const EquipmentParamsSchema = z.object({
  equipmentId: IDSchema
});

/**
 * معرف المعدة في params (id فقط)
 */
export const EquipmentIdParamsSchema = z.object({
  id: IDSchema
});

/**
 * تخصيص معدة لمستخدم
 */
export const AssignEquipmentSchema = z.object({
  user_id: IDSchema,
  reserved_until: DateStringSchema.optional(),
  notes: z.string().optional(),
  assigned_by: IDSchema
});

/**
 * إرجاع معدة
 */
export const ReturnEquipmentSchema = z.object({
  returned_by: IDSchema,
  return_condition: z.enum(EQUIPMENT_CONDITIONS, {
    errorMap: () => ({ message: "حالة الإرجاع غير صحيحة" })
  }),
  usage_hours: z.number().min(0, "ساعات الاستخدام لا يمكن أن تكون سالبة").optional(),
  return_notes: z.string().optional(),
  requires_maintenance: z.boolean().default(false)
});

/**
 * جدولة صيانة
 */
export const ScheduleMaintenanceSchema = z.object({
  maintenance_type: z.enum(['routine', 'repair', 'upgrade', 'calibration'], {
    errorMap: () => ({ message: "نوع الصيانة غير صحيح" })
  }),
  priority: z.enum(MAINTENANCE_PRIORITIES, {
    errorMap: () => ({ message: "أولوية الصيانة غير صحيحة" })
  }),
  scheduled_date: DateStringSchema,
  estimated_duration_hours: z.number().min(0.5, "مدة الصيانة يجب أن تكون على الأقل 0.5 ساعة"),
  technician_id: IDSchema.optional(),
  maintenance_notes: z.string().optional(),
  estimated_cost: PositiveNumberSchema.optional(),
  scheduled_by: IDSchema
});

/**
 * تحديث حالة المعدة
 */
export const UpdateEquipmentConditionSchema = z.object({
  condition: z.enum(EQUIPMENT_CONDITIONS, {
    errorMap: () => ({ message: "حالة المعدة غير صحيحة" })
  }),
  status: z.enum(EQUIPMENT_STATUSES, {
    errorMap: () => ({ message: "حالة توفر المعدة غير صحيحة" })
  }).optional(),
  condition_notes: z.string().optional(),
  updated_by: IDSchema
});

/**
 * تحديث معلومات المعدة
 */
export const UpdateEquipmentSchema = z.object({
  name: z.string().min(2, "اسم المعدة يجب أن يكون على الأقل حرفين").optional(),
  description: z.string().optional(),
  location: z.string().min(2, "موقع المعدة يجب أن يكون على الأقل حرفين").optional(),
  is_portable: z.boolean().optional(),
  warranty_expiry: DateStringSchema.optional(),
  updated_by: IDSchema
});

/**
 * معايير تقرير الاستخدام
 */
export const UsageReportSchema = z.object({
  period_start: DateStringSchema,
  period_end: DateStringSchema,
  include_maintenance: z.boolean().default(true),
  include_statistics: z.boolean().default(true)
}).refine(
  (data) => new Date(data.period_end) > new Date(data.period_start),
  {
    message: "تاريخ نهاية الفترة يجب أن يكون بعد تاريخ البداية",
    path: ["period_end"]
  }
);

/**
 * معايير المعدات التي تحتاج صيانة
 */
export const MaintenanceNeededSchema = z.object({
  priority_filter: z.enum(MAINTENANCE_PRIORITIES).optional(),
  overdue_only: z.boolean().default(false),
  condition_filter: z.enum(EQUIPMENT_CONDITIONS).optional(),
  days_ahead: z.number().min(1, "عدد الأيام يجب أن يكون على الأقل 1").default(30)
});

/**
 * معايير المعدات منتهية الضمان
 */
export const ExpiringWarrantySchema = z.object({
  days_ahead: z.number().min(1, "عدد الأيام يجب أن يكون على الأقل 1").default(90),
  expired_only: z.boolean().default(false)
});

/**
 * إنشاء سجل تخصيص
 */
export const CreateAssignmentRecordSchema = z.object({
  equipment_id: IDSchema,
  user_id: IDSchema,
  assignment_type: z.enum(['rental', 'project', 'permanent', 'maintenance'], {
    errorMap: () => ({ message: "نوع التخصيص غير صحيح" })
  }),
  expected_return_date: DateStringSchema.optional(),
  assignment_notes: z.string().optional(),
  created_by: IDSchema
});

/**
 * إنشاء سجل صيانة
 */
export const CreateMaintenanceRecordSchema = z.object({
  equipment_id: IDSchema,
  maintenance_type: z.enum(['routine', 'repair', 'upgrade', 'calibration'], {
    errorMap: () => ({ message: "نوع الصيانة غير صحيح" })
  }),
  technician_id: IDSchema.optional(),
  start_date: DateStringSchema,
  estimated_end_date: DateStringSchema,
  priority: z.enum(MAINTENANCE_PRIORITIES, {
    errorMap: () => ({ message: "أولوية الصيانة غير صحيحة" })
  }),
  description: z.string({
    required_error: "وصف الصيانة مطلوب"
  }).min(10, "وصف الصيانة يجب أن يكون على الأقل 10 أحرف"),
  estimated_cost: PositiveNumberSchema.optional(),
  parts_needed: z.array(z.string()).optional(),
  created_by: IDSchema
}).refine(
  (data) => new Date(data.estimated_end_date) > new Date(data.start_date),
  {
    message: "تاريخ الانتهاء المقدر يجب أن يكون بعد تاريخ البداية",
    path: ["estimated_end_date"]
  }
);

// ======================================
// 🛠️ Middleware Functions
// ======================================

/**
 * Middleware للتحقق من بيانات إضافة المعدة
 */
export const validateAddEquipment = BaseValidator.createValidationMiddleware(
  AddEquipmentSchema,
  'body'
);

/**
 * Middleware للتحقق من معايير البحث عن المعدة
 */
export const validateGetEquipment = BaseValidator.createValidationMiddleware(
  GetEquipmentSchema,
  'query'
);

/**
 * Middleware للتحقق من معايير البحث المتقدم
 */
export const validateSearchEquipment = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const validated = SearchEquipmentSchema.parse(req.query);
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
 * Middleware للتحقق من معرف المعدة في params
 */
export const validateEquipmentParams = BaseValidator.createValidationMiddleware(
  EquipmentParamsSchema,
  'params'
);

/**
 * Middleware للتحقق من معرف المعدة (id) في params
 */
export const validateEquipmentIdParams = BaseValidator.createValidationMiddleware(
  EquipmentIdParamsSchema,
  'params'
);

/**
 * Middleware للتحقق من بيانات تخصيص المعدة
 */
export const validateAssignEquipment = BaseValidator.createValidationMiddleware(
  AssignEquipmentSchema,
  'body'
);

/**
 * Middleware للتحقق من بيانات إرجاع المعدة
 */
export const validateReturnEquipment = BaseValidator.createValidationMiddleware(
  ReturnEquipmentSchema,
  'body'
);

/**
 * Middleware للتحقق من بيانات جدولة الصيانة
 */
export const validateScheduleMaintenance = BaseValidator.createValidationMiddleware(
  ScheduleMaintenanceSchema,
  'body'
);

/**
 * Middleware للتحقق من بيانات تحديث حالة المعدة
 */
export const validateUpdateEquipmentCondition = BaseValidator.createValidationMiddleware(
  UpdateEquipmentConditionSchema,
  'body'
);

/**
 * Middleware للتحقق من بيانات تحديث المعدة
 */
export const validateUpdateEquipment = BaseValidator.createValidationMiddleware(
  UpdateEquipmentSchema,
  'body'
);

/**
 * Middleware للتحقق من معايير تقرير الاستخدام
 */
export const validateUsageReport = BaseValidator.createValidationMiddleware(
  UsageReportSchema,
  'query'
);

/**
 * Middleware للتحقق من معايير المعدات التي تحتاج صيانة
 */
export const validateMaintenanceNeeded = BaseValidator.createValidationMiddleware(
  MaintenanceNeededSchema,
  'query'
);

/**
 * Middleware للتحقق من معايير المعدات منتهية الضمان
 */
export const validateExpiringWarranty = BaseValidator.createValidationMiddleware(
  ExpiringWarrantySchema,
  'query'
);

/**
 * Middleware للتحقق من بيانات إنشاء سجل التخصيص
 */
export const validateCreateAssignmentRecord = BaseValidator.createValidationMiddleware(
  CreateAssignmentRecordSchema,
  'body'
);

/**
 * Middleware للتحقق من بيانات إنشاء سجل الصيانة
 */
export const validateCreateMaintenanceRecord = BaseValidator.createValidationMiddleware(
  CreateMaintenanceRecordSchema,
  'body'
);

// ======================================
// 🎯 Type Definitions
// ======================================

export type AddEquipmentInput = z.infer<typeof AddEquipmentSchema>;
export type GetEquipmentInput = z.infer<typeof GetEquipmentSchema>;
export type SearchEquipmentInput = z.infer<typeof SearchEquipmentSchema>;
export type EquipmentParamsInput = z.infer<typeof EquipmentParamsSchema>;
export type EquipmentIdParamsInput = z.infer<typeof EquipmentIdParamsSchema>;
export type AssignEquipmentInput = z.infer<typeof AssignEquipmentSchema>;
export type ReturnEquipmentInput = z.infer<typeof ReturnEquipmentSchema>;
export type ScheduleMaintenanceInput = z.infer<typeof ScheduleMaintenanceSchema>;
export type UpdateEquipmentConditionInput = z.infer<typeof UpdateEquipmentConditionSchema>;
export type UpdateEquipmentInput = z.infer<typeof UpdateEquipmentSchema>;
export type UsageReportInput = z.infer<typeof UsageReportSchema>;
export type MaintenanceNeededInput = z.infer<typeof MaintenanceNeededSchema>;
export type ExpiringWarrantyInput = z.infer<typeof ExpiringWarrantySchema>;
export type CreateAssignmentRecordInput = z.infer<typeof CreateAssignmentRecordSchema>;
export type CreateMaintenanceRecordInput = z.infer<typeof CreateMaintenanceRecordSchema>;

export default BaseValidator; 
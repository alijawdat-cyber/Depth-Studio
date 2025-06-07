/**
 * 👥 User Validators - التحقق من بيانات المستخدمين
 * ===============================================
 * 
 * جميع schemas التحقق المطلوبة لـ UserController
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
  EmailSchema, 
  IraqiPhoneSchema, 
  PasswordSchema,
  PaginationSchema
} from './BaseValidator';

// تعريف قيم الأدوار والحالات كـ const arrays لاستخدامها في validation
const USER_ROLES = [
  'super_admin',
  'marketing_coordinator', 
  'brand_coordinator',
  'photographer',
  'new_user'
] as const;

const USER_STATUSES = [
  'pending_role_setup',
  'pending_approval',
  'active', 
  'suspended',
  'archived'
] as const;

// ======================================
// 🎯 Validation Schemas للمستخدمين
// ======================================

/**
 * إنشاء مستخدم جديد
 */
export const CreateUserSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
  firstName: z.string({
    required_error: "الاسم الأول مطلوب"
  }).min(2, "الاسم الأول يجب أن يكون على الأقل حرفان"),
  
  lastName: z.string({
    required_error: "الاسم الأخير مطلوب"
  }).min(2, "الاسم الأخير يجب أن يكون على الأقل حرفان"),
  
  phone: IraqiPhoneSchema.optional(),
  
  primaryRole: z.enum(USER_ROLES, {
    errorMap: () => ({ message: "دور المستخدم غير صحيح" })
  })
});

/**
 * البحث عن مستخدم
 */
export const GetUserSchema = z.object({
  id: IDSchema.optional(),
  email: EmailSchema.optional(),
  firebaseUid: z.string().optional()
}).refine(
  (data) => data.id || data.email || data.firebaseUid,
  {
    message: "يجب تقديم معرف المستخدم أو البريد الإلكتروني أو معرف Firebase",
    path: ["search_criteria"]
  }
);

/**
 * الموافقة على مستخدم
 */
export const ApproveUserSchema = z.object({
  userId: IDSchema,
  approvedBy: IDSchema
});

/**
 * تحديث دور المستخدم
 */
export const UpdateUserRoleSchema = z.object({
  userId: IDSchema,
  newRole: z.enum(USER_ROLES, {
    errorMap: () => ({ message: "الدور الجديد غير صحيح" })
  }),
  updatedBy: IDSchema
});

/**
 * البحث المتقدم في المستخدمين
 */
export const SearchUsersSchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
  search: z.string().optional(),
  searchTerm: z.string().optional(),
  role: z.enum(USER_ROLES).optional(),
  status: z.enum(USER_STATUSES).optional(),
  isActive: z.string()
    .optional()
    .transform(val => val === 'true' ? true : val === 'false' ? false : undefined)
});

/**
 * معرف المستخدم في params
 */
export const UserParamsSchema = z.object({
  userId: IDSchema
});

/**
 * فحص الصلاحيات
 */
export const CheckPermissionSchema = z.object({
  userId: IDSchema,
  permission: z.string({
    required_error: "نوع الصلاحية مطلوب"
  }).min(1, "نوع الصلاحية لا يمكن أن يكون فارغاً"),
  
  resourceId: IDSchema.optional() // معرف المورد (اختياري)
});

// ======================================
// 🛠️ Middleware Functions
// ======================================

/**
 * Middleware للتحقق من بيانات إنشاء المستخدم
 */
export const validateCreateUser = BaseValidator.createValidationMiddleware(
  CreateUserSchema,
  'body'
);

/**
 * Middleware للتحقق من معايير البحث عن المستخدم
 */
export const validateGetUser = BaseValidator.createValidationMiddleware(
  GetUserSchema,
  'query'
);

/**
 * Middleware للتحقق من بيانات الموافقة - params
 */
export const validateApproveUserParams = BaseValidator.createValidationMiddleware(
  z.object({
    userId: IDSchema
  }),
  'params'
);

/**
 * Middleware للتحقق من بيانات الموافقة - body
 */
export const validateApproveUserBody = BaseValidator.createValidationMiddleware(
  z.object({
    approvedBy: IDSchema
  }),
  'body'
);

/**
 * Middleware للتحقق من بيانات تحديث الدور - params
 */
export const validateUpdateUserRoleParams = BaseValidator.createValidationMiddleware(
  z.object({
    userId: IDSchema
  }),
  'params'
);

/**
 * Middleware للتحقق من بيانات تحديث الدور - body
 */
export const validateUpdateUserRoleBody = BaseValidator.createValidationMiddleware(
  z.object({
    newRole: z.enum(USER_ROLES, {
      errorMap: () => ({ message: "الدور الجديد غير صحيح" })
    }),
    updatedBy: IDSchema
  }),
  'body'
);

/**
 * Middleware للتحقق من معايير البحث المتقدم
 */
export const validateSearchUsers = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const validated = SearchUsersSchema.parse(req.query);
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
 * Middleware للتحقق من معرف المستخدم في params
 */
export const validateUserParams = BaseValidator.createValidationMiddleware(
  UserParamsSchema,
  'params'
);

/**
 * Middleware للتحقق من طلب فحص الصلاحيات
 */
export const validateCheckPermission = BaseValidator.createValidationMiddleware(
  CheckPermissionSchema,
  'body'
);

// ======================================
// 🎯 Type Definitions
// ======================================

export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type GetUserInput = z.infer<typeof GetUserSchema>;
export type ApproveUserInput = z.infer<typeof ApproveUserSchema>;
export type UpdateUserRoleInput = z.infer<typeof UpdateUserRoleSchema>;
export type UpdateUserRoleBodyInput = Pick<UpdateUserRoleInput, 'newRole' | 'updatedBy'>;
export type SearchUsersInput = z.infer<typeof SearchUsersSchema>;
export type UserParamsInput = z.infer<typeof UserParamsSchema>;
export type CheckPermissionInput = z.infer<typeof CheckPermissionSchema>;

// ======================================
// 🔧 دوال مساعدة
// ======================================

/**
 * التحقق من صحة البريد الإلكتروني المخصص
 */
export function validateEmailDomain(email: string): boolean {
  const allowedDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'];
  const domain = email.split('@')[1];
  return domain ? allowedDomains.includes(domain) : false;
}

/**
 * التحقق من قوة كلمة المرور
 */
export function validatePasswordStrength(password: string): {
  isStrong: boolean;
  score: number;
  recommendations: string[];
} {
  const recommendations: string[] = [];
  let score = 0;

  // الطول
  if (password.length >= 8) score += 2;
  else recommendations.push("استخدم على الأقل 8 أحرف");

  // الأحرف الكبيرة
  if (/[A-Z]/.test(password)) score += 1;
  else recommendations.push("أضف حرف كبير واحد على الأقل");

  // الأحرف الصغيرة
  if (/[a-z]/.test(password)) score += 1;
  else recommendations.push("أضف حرف صغير واحد على الأقل");

  // الأرقام
  if (/[0-9]/.test(password)) score += 1;
  else recommendations.push("أضف رقم واحد على الأقل");

  // الرموز الخاصة
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
  else recommendations.push("أضف رمز خاص واحد على الأقل (!@#$%^&*)");

  return {
    isStrong: score >= 4,
    score,
    recommendations
  };
}

/**
 * class مساعد للـ validation المخصص
 */
export class UserValidator extends BaseValidator {
  /**
   * التحقق الشامل من بيانات إنشاء المستخدم
   */
  static validateUserCreation(data: any) {
    const result = this.validate(CreateUserSchema, data);
    
    if (result.success && result.data) {
      // تحقق إضافي من قوة كلمة المرور
      const passwordCheck = validatePasswordStrength(result.data.password);
      if (!passwordCheck.isStrong) {
        return {
          success: false,
          errors: [{
            field: 'password',
            message: `كلمة المرور ضعيفة. ${passwordCheck.recommendations.join(', ')}`,
            code: 'weak_password'
          }]
        };
      }

      // تحقق من domain البريد الإلكتروني
      if (!validateEmailDomain(result.data.email)) {
        return {
          success: false,
          errors: [{
            field: 'email',
            message: 'نطاق البريد الإلكتروني غير مسموح',
            code: 'invalid_email_domain'
          }]
        };
      }
    }

    return result;
  }
}

export default UserValidator; 
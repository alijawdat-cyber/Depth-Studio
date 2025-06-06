/**
 * 🔍 Zod Validation Schemas
 * 
 * تطوير علي جودت - Depth Studio
 * آخر تحديث: يونيو 2025
 * 
 * @description Comprehensive Zod schemas for runtime validation
 * @version 1.0.0
 */

import { z } from 'zod';

// ======================================
// Base Schemas
// ======================================

/**
 * MongoDB ObjectId Schema
 */
export const ObjectIdSchema = z.string()
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId format');

/**
 * Email Schema
 */
export const EmailSchema = z.string()
  .email('صيغة البريد الإلكتروني غير صحيحة')
  .min(5, 'البريد الإلكتروني قصير جداً')
  .max(254, 'البريد الإلكتروني طويل جداً');

/**
 * Phone Schema (Iraqi format)
 */
export const PhoneSchema = z.string()
  .regex(/^(\+964|964|0)?7[0-9]{9}$/, 'رقم الهاتف يجب أن يكون عراقي صحيح')
  .optional();

/**
 * Password Schema
 */
export const PasswordSchema = z.string()
  .min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل')
  .max(128, 'كلمة المرور طويلة جداً')
  .regex(/[A-Za-z]/, 'كلمة المرور يجب أن تحتوي على أحرف')
  .regex(/[0-9]/, 'كلمة المرور يجب أن تحتوي على أرقام');

/**
 * URL Schema
 */
export const UrlSchema = z.string()
  .url('صيغة الرابط غير صحيحة')
  .optional();

/**
 * Color Schema (hex)
 */
export const ColorSchema = z.string()
  .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'صيغة اللون يجب أن تكون hex')
  .default('#000000');

// ======================================
// User Schemas
// ======================================

/**
 * User Role Schema
 */
export const UserRoleSchema = z.enum([
  'super_admin',
  'marketing_coordinator',
  'brand_coordinator',
  'photographer',
  'new_user'
], {
  errorMap: () => ({ message: 'دور المستخدم غير صحيح' })
});

/**
 * User Status Schema
 */
export const UserStatusSchema = z.enum([
  'pending_role_setup',
  'pending_approval',
  'active',
  'suspended',
  'archived'
], {
  errorMap: () => ({ message: 'حالة المستخدم غير صحيحة' })
});

/**
 * Auth Provider Schema
 */
export const AuthProviderSchema = z.enum(['email', 'phone', 'google']);

/**
 * User Preferences Schema
 */
export const UserPreferencesSchema = z.object({
  language: z.enum(['ar', 'en']).default('ar'),
  theme: z.enum(['light', 'dark']).default('light'),
  notifications: z.object({
    email: z.boolean().default(true),
    push: z.boolean().default(true),
    sms: z.boolean().default(false)
  }).default({}),
  timezone: z.string().default('Asia/Baghdad')
}).default({});

/**
 * Create User Schema
 */
export const CreateUserSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
  first_name: z.string()
    .min(2, 'الاسم الأول قصير جداً')
    .max(50, 'الاسم الأول طويل جداً')
    .regex(/^[a-zA-Zأ-ي\s]+$/, 'الاسم الأول يجب أن يحتوي على أحرف فقط'),
  last_name: z.string()
    .min(2, 'الاسم الأخير قصير جداً')
    .max(50, 'الاسم الأخير طويل جداً')
    .regex(/^[a-zA-Zأ-ي\s]+$/, 'الاسم الأخير يجب أن يحتوي على أحرف فقط'),
  phone: PhoneSchema,
  primary_role: UserRoleSchema,
  bio: z.string().max(500, 'النبذة طويلة جداً').optional(),
  location: z.string().max(100, 'الموقع طويل جداً').optional(),
  timezone: z.string().default('Asia/Baghdad'),
  language: z.enum(['ar', 'en']).default('ar'),
  preferences: UserPreferencesSchema
});

/**
 * Update User Schema
 */
export const UpdateUserSchema = CreateUserSchema.partial().omit({
  password: true,
  email: true,
  primary_role: true
});

/**
 * Login Schema
 */
export const LoginSchema = z.object({
  email: EmailSchema,
  password: z.string().min(1, 'كلمة المرور مطلوبة'),
  remember_me: z.boolean().optional()
});

// ======================================
// Brand Schemas
// ======================================

/**
 * Brand Status Schema
 */
export const BrandStatusSchema = z.enum([
  'active',
  'paused',
  'archived',
  'development'
], {
  errorMap: () => ({ message: 'حالة البراند غير صحيحة' })
});

/**
 * Brand Identity Schema
 */
export const BrandIdentitySchema = z.object({
  logo_url: UrlSchema,
  primary_color: ColorSchema,
  secondary_color: ColorSchema,
  font_family: z.string().min(1, 'خط البراند مطلوب').default('Arial'),
  brand_guidelines_url: UrlSchema
});

/**
 * Brand Contact Info Schema
 */
export const BrandContactInfoSchema = z.object({
  primary_contact_name: z.string()
    .min(2, 'اسم جهة الاتصال قصير جداً')
    .max(100, 'اسم جهة الاتصال طويل جداً'),
  primary_contact_email: EmailSchema,
  primary_contact_phone: PhoneSchema,
  company_address: z.string()
    .min(10, 'عنوان الشركة قصير جداً')
    .max(500, 'عنوان الشركة طويل جداً'),
  website_url: UrlSchema,
  social_media: z.record(z.string().url('رابط وسائل التواصل غير صحيح')).default({})
});

/**
 * Brand Budget Settings Schema
 */
export const BrandBudgetSettingsSchema = z.object({
  monthly_budget: z.number()
    .min(0, 'الميزانية لا يمكن أن تكون سالبة')
    .max(1000000, 'الميزانية كبيرة جداً'),
  currency: z.enum(['IQD', 'USD', 'EUR']).default('IQD'),
  pricing_tier: z.enum(['basic', 'standard', 'premium', 'enterprise']).default('standard'),
  payment_terms: z.enum(['net_15', 'net_30', 'net_60', 'immediate']).default('net_30'),
  budget_alerts_enabled: z.boolean().default(true)
});

/**
 * Brand Content Preferences Schema
 */
export const BrandContentPreferencesSchema = z.object({
  preferred_styles: z.array(z.string()).default([]),
  content_categories: z.array(z.string()).default([]),
  quality_requirements: z.enum(['basic', 'standard', 'high', 'premium']).default('high'),
  delivery_format: z.array(z.enum(['jpg', 'png', 'raw', 'psd', 'ai'])).default(['jpg', 'png']),
  usage_rights: z.enum(['exclusive', 'non_exclusive', 'limited']).default('exclusive')
});

/**
 * Create Brand Schema
 */
export const CreateBrandSchema = z.object({
  name: z.object({
    ar: z.string()
      .min(2, 'اسم البراند بالعربية قصير جداً')
      .max(100, 'اسم البراند بالعربية طويل جداً'),
    en: z.string()
      .min(2, 'اسم البراند بالإنجليزية قصير جداً')
      .max(100, 'اسم البراند بالإنجليزية طويل جداً')
  }),
  description: z.object({
    ar: z.string().max(1000, 'وصف البراند بالعربية طويل جداً').default(''),
    en: z.string().max(1000, 'وصف البراند بالإنجليزية طويل جداً').default('')
  }),
  brand_type: z.string().min(1, 'نوع البراند مطلوب'),
  industry: z.string().min(1, 'الصناعة مطلوبة'),
  status: BrandStatusSchema.default('development'),
  brand_identity: BrandIdentitySchema,
  contact_info: BrandContactInfoSchema,
  assigned_coordinator: ObjectIdSchema.optional(),
  budget_settings: BrandBudgetSettingsSchema,
  content_preferences: BrandContentPreferencesSchema
});

/**
 * Update Brand Schema
 */
export const UpdateBrandSchema = CreateBrandSchema.partial();

// ======================================
// Campaign Schemas
// ======================================

/**
 * Campaign Status Schema
 */
export const CampaignStatusSchema = z.enum([
  'draft',
  'scheduled',
  'active',
  'paused',
  'completed',
  'cancelled'
], {
  errorMap: () => ({ message: 'حالة الحملة غير صحيحة' })
});

/**
 * Campaign Type Schema
 */
export const CampaignTypeSchema = z.enum([
  'product_launch',
  'seasonal',
  'promotional',
  'brand_awareness',
  'event',
  'ongoing'
]);

/**
 * Priority Level Schema
 */
export const PriorityLevelSchema = z.enum(['low', 'medium', 'high', 'urgent']);

/**
 * Campaign Info Schema
 */
export const CampaignInfoSchema = z.object({
  name: z.string()
    .min(3, 'اسم الحملة قصير جداً')
    .max(200, 'اسم الحملة طويل جداً'),
  description: z.string()
    .min(10, 'وصف الحملة قصير جداً')
    .max(2000, 'وصف الحملة طويل جداً'),
  brand_id: ObjectIdSchema,
  campaign_type: CampaignTypeSchema,
  priority_level: PriorityLevelSchema.default('medium')
});

/**
 * Campaign Goals Schema
 */
export const CampaignGoalsSchema = z.object({
  total_content_pieces: z.number()
    .int('عدد القطع يجب أن يكون عدد صحيح')
    .min(1, 'يجب أن يكون هناك قطعة واحدة على الأقل')
    .max(1000, 'عدد القطع كبير جداً'),
  target_completion_date: z.date({
    required_error: 'تاريخ الإنجاز المتوقع مطلوب',
    invalid_type_error: 'تاريخ الإنجاز المتوقع غير صحيح'
  }),
  expected_roi: z.number()
    .min(0, 'العائد المتوقع لا يمكن أن يكون سالب')
    .max(1000, 'العائد المتوقع كبير جداً'),
  success_metrics: z.array(z.string()).default([])
});

/**
 * Milestone Schema
 */
export const MilestoneSchema = z.object({
  milestone_name: z.string().min(1, 'اسم المعلم مطلوب'),
  target_date: z.date(),
  description: z.string().max(500, 'وصف المعلم طويل جداً'),
  dependencies: z.array(z.string()).default([])
});

/**
 * Campaign Timeline Schema
 */
export const CampaignTimelineSchema = z.object({
  campaign_start_date: z.date({
    required_error: 'تاريخ بداية الحملة مطلوب'
  }),
  campaign_end_date: z.date({
    required_error: 'تاريخ نهاية الحملة مطلوب'
  }),
  key_milestones: z.array(MilestoneSchema).default([]),
  buffer_days: z.number()
    .int('أيام الاحتياط يجب أن تكون عدد صحيح')
    .min(0, 'أيام الاحتياط لا يمكن أن تكون سالبة')
    .max(30, 'أيام الاحتياط كثيرة جداً')
    .default(2)
}).refine(
  (data) => data.campaign_end_date > data.campaign_start_date,
  {
    message: 'تاريخ النهاية يجب أن يكون بعد تاريخ البداية',
    path: ['campaign_end_date']
  }
);

/**
 * Content Requirement Schema
 */
export const ContentRequirementSchema = z.object({
  category_id: ObjectIdSchema,
  quantity: z.number()
    .int('الكمية يجب أن تكون عدد صحيح')
    .min(1, 'الكمية يجب أن تكون 1 على الأقل'),
  priority: PriorityLevelSchema,
  specific_requirements: z.string().max(1000, 'المتطلبات المحددة طويلة جداً'),
  deadlines: z.array(z.date()).default([])
});

/**
 * Budget Management Schema
 */
export const BudgetManagementSchema = z.object({
  total_budget: z.number()
    .min(0, 'الميزانية الإجمالية لا يمكن أن تكون سالبة'),
  currency: z.enum(['IQD', 'USD', 'EUR']).default('IQD'),
  budget_allocation: z.array(z.object({
    category_id: ObjectIdSchema,
    allocated_amount: z.number().min(0),
    spent_amount: z.number().min(0).default(0),
    remaining_amount: z.number().min(0).optional()
  })).default([]),
  spending_alerts: z.array(z.object({
    threshold_percentage: z.number().min(0).max(100),
    alert_recipients: z.array(ObjectIdSchema),
    alert_methods: z.array(z.enum(['email', 'sms', 'push_notification', 'in_app']))
  })).default([])
});

/**
 * Create Campaign Schema
 */
export const CreateCampaignSchema = z.object({
  campaign_info: CampaignInfoSchema,
  campaign_goals: CampaignGoalsSchema,
  timeline: CampaignTimelineSchema,
  content_requirements: z.array(ContentRequirementSchema).default([]),
  budget_management: BudgetManagementSchema
});

/**
 * Update Campaign Schema
 */
export const UpdateCampaignSchema = CreateCampaignSchema.partial();

// ======================================
// Task Schemas
// ======================================

/**
 * Task Status Schema
 */
export const TaskStatusSchema = z.enum([
  'pending',
  'assigned',
  'in_progress',
  'review',
  'revision_needed',
  'completed',
  'cancelled'
]);

/**
 * Location Type Schema
 */
export const LocationTypeSchema = z.enum([
  'studio',
  'client_location',
  'outdoor',
  'home',
  'travel'
]);

/**
 * Task Info Schema
 */
export const TaskInfoSchema = z.object({
  title: z.string().min(3, 'عنوان المهمة قصير جداً').max(200, 'عنوان المهمة طويل جداً'),
  description: z.string().min(10, 'وصف المهمة قصير جداً').max(2000, 'وصف المهمة طويل جداً'),
  task_type: z.string().min(1, 'نوع المهمة مطلوب'),
  priority_level: PriorityLevelSchema.default('medium'),
  category_id: ObjectIdSchema
});

/**
 * Create Task Schema
 */
export const CreateTaskSchema = z.object({
  campaign_id: ObjectIdSchema,
  task_info: TaskInfoSchema,
  location_requirements: z.object({
    location_type: LocationTypeSchema,
    specific_location: z.string().optional(),
    travel_required: z.boolean().default(false),
    setup_time_needed: z.number().min(0).default(0)
  }),
  timeline: z.object({
    start_date: z.date(),
    due_date: z.date(),
    estimated_duration: z.number().min(0),
    buffer_time: z.number().min(0).default(0)
  }).refine(
    (data) => data.due_date > data.start_date,
    {
      message: 'تاريخ الانتهاء يجب أن يكون بعد تاريخ البداية',
      path: ['due_date']
    }
  ),
  equipment_requirements: z.array(ObjectIdSchema).default([]),
  style_guidelines: z.array(z.string()).default([])
});

// ======================================
// Query Schemas
// ======================================

/**
 * Pagination Schema
 */
export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20)
});

/**
 * Sort Schema
 */
export const SortSchema = z.object({
  sort_by: z.string().optional(),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

/**
 * Date Range Schema
 */
export const DateRangeSchema = z.object({
  created_after: z.coerce.date().optional(),
  created_before: z.coerce.date().optional()
}).refine(
  (data) => !data.created_after || !data.created_before || data.created_before > data.created_after,
  {
    message: 'تاريخ النهاية يجب أن يكون بعد تاريخ البداية',
    path: ['created_before']
  }
);

/**
 * Base Filter Schema (without date range)
 */
export const BaseFilterSchema = PaginationSchema.merge(SortSchema);

/**
 * Search Users Schema
 */
export const SearchUsersSchema = BaseFilterSchema.extend({
  search: z.string().min(2, 'كلمة البحث قصيرة جداً').optional(),
  role: UserRoleSchema.optional(),
  status: UserStatusSchema.optional(),
  is_active: z.coerce.boolean().optional(),
  brand_id: ObjectIdSchema.optional(),
  created_after: z.coerce.date().optional(),
  created_before: z.coerce.date().optional()
}).refine(
  (data) => !data.created_after || !data.created_before || data.created_before > data.created_after,
  {
    message: 'تاريخ النهاية يجب أن يكون بعد تاريخ البداية',
    path: ['created_before']
  }
);

/**
 * Search Brands Schema
 */
export const SearchBrandsSchema = BaseFilterSchema.extend({
  search: z.string().min(2, 'كلمة البحث قصيرة جداً').optional(),
  status: BrandStatusSchema.optional(),
  brand_type: z.string().optional(),
  industry: z.string().optional(),
  assigned_coordinator: ObjectIdSchema.optional(),
  created_after: z.coerce.date().optional(),
  created_before: z.coerce.date().optional()
}).refine(
  (data) => !data.created_after || !data.created_before || data.created_before > data.created_after,
  {
    message: 'تاريخ النهاية يجب أن يكون بعد تاريخ البداية',
    path: ['created_before']
  }
);

/**
 * Search Campaigns Schema
 */
export const SearchCampaignsSchema = BaseFilterSchema.extend({
  search: z.string().min(2, 'كلمة البحث قصيرة جداً').optional(),
  status: CampaignStatusSchema.optional(),
  brand_id: ObjectIdSchema.optional(),
  campaign_type: CampaignTypeSchema.optional(),
  priority_level: PriorityLevelSchema.optional(),
  created_by: ObjectIdSchema.optional(),
  created_after: z.coerce.date().optional(),
  created_before: z.coerce.date().optional(),
  start_date_after: z.coerce.date().optional(),
  start_date_before: z.coerce.date().optional()
}).refine(
  (data) => !data.created_after || !data.created_before || data.created_before > data.created_after,
  {
    message: 'تاريخ النهاية يجب أن يكون بعد تاريخ البداية',
    path: ['created_before']
  }
).refine(
  (data) => !data.start_date_after || !data.start_date_before || data.start_date_before > data.start_date_after,
  {
    message: 'تاريخ نهاية البداية يجب أن يكون بعد تاريخ بداية البداية',
    path: ['start_date_before']
  }
);

// ======================================
// Export Types from Schemas
// ======================================

export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type CreateBrandInput = z.infer<typeof CreateBrandSchema>;
export type UpdateBrandInput = z.infer<typeof UpdateBrandSchema>;
export type CreateCampaignInput = z.infer<typeof CreateCampaignSchema>;
export type UpdateCampaignInput = z.infer<typeof UpdateCampaignSchema>;
export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;
export type SearchUsersInput = z.infer<typeof SearchUsersSchema>;
export type SearchBrandsInput = z.infer<typeof SearchBrandsSchema>;
export type SearchCampaignsInput = z.infer<typeof SearchCampaignsSchema>; 
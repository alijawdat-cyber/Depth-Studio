/**
 * User Management Helper Functions
 * @description دوال مساعدة لإدارة المستخدمين
 */

// === Role Helpers ===

/**
 * الحصول على لون الدور
 */
export const getRoleColor = (role: string): string => {
  switch (role) {
    case 'photographer': return 'primary'
    case 'brand_coordinator': return 'warning'
    case 'marketing_coordinator': return 'error'
    case 'super_admin': return 'purple'
    default: return 'grey'
  }
}

/**
 * الحصول على أيقونة الدور
 */
export const getRoleIcon = (role: string): string => {
  switch (role) {
    case 'photographer': return 'mdi-camera'
    case 'brand_coordinator': return 'mdi-domain'
    case 'marketing_coordinator': return 'mdi-bullhorn'
    case 'super_admin': return 'mdi-crown'
    default: return 'mdi-account'
  }
}

/**
 * الحصول على اسم الدور
 */
export const getRoleName = (role: string): string => {
  switch (role) {
    case 'photographer': return 'مصور'
    case 'brand_coordinator': return 'منسق براند'
    case 'marketing_coordinator': return 'منسق تسويق'
    case 'super_admin': return 'مدير عام'
    default: return 'غير محدد'
  }
}

// === Status Helpers ===

/**
 * الحصول على لون الحالة
 */
export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'active': return 'success'
    case 'pending_approval': return 'warning'
    case 'suspended': return 'error'
    case 'deleted': return 'grey'
    default: return 'grey'
  }
}

/**
 * الحصول على أيقونة الحالة
 */
export const getStatusIcon = (status: string): string => {
  switch (status) {
    case 'active': return 'mdi-check-circle'
    case 'pending_approval': return 'mdi-clock-alert'
    case 'suspended': return 'mdi-pause-circle'
    case 'deleted': return 'mdi-delete'
    default: return 'mdi-help-circle'
  }
}

/**
 * الحصول على اسم الحالة
 */
export const getStatusName = (status: string): string => {
  switch (status) {
    case 'active': return 'نشط'
    case 'pending_approval': return 'في انتظار الموافقة'
    case 'suspended': return 'معلق'
    case 'deleted': return 'محذوف'
    default: return 'غير محدد'
  }
}

// === Date Helpers ===

/**
 * تنسيق التاريخ
 */
export const formatDate = (date: any): string => {
  if (!date) return 'غير محدد'
  
  let dateObj
  if (date.toDate) {
    dateObj = date.toDate()
  } else if (date instanceof Date) {
    dateObj = date
  } else {
    dateObj = new Date(date)
  }
  
  return dateObj.toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

/**
 * حساب الفرق الزمني
 */
export const getTimeDifference = (date: any): string => {
  if (!date) return ''
  
  const now = new Date()
  const targetDate = date.toDate ? date.toDate() : new Date(date)
  const diffTime = Math.abs(now.getTime() - targetDate.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 1) return 'أمس'
  if (diffDays < 7) return `منذ ${diffDays} أيام`
  if (diffDays < 30) return `منذ ${Math.ceil(diffDays / 7)} أسابيع`
  if (diffDays < 365) return `منذ ${Math.ceil(diffDays / 30)} أشهر`
  return `منذ ${Math.ceil(diffDays / 365)} سنوات`
}

// === Specialization Helpers ===

/**
 * الحصول على اسم التخصص
 */
export const getSpecializationName = (spec: string): string => {
  const specializations: { [key: string]: string } = {
    'social_media': 'السوشال ميديا',
    'content_creation': 'إنشاء المحتوى',
    'campaign_management': 'إدارة الحملات',
    'analytics': 'التحليلات',
    'brand_management': 'إدارة البراندات'
  }
  return specializations[spec] || spec
}

/**
 * الحصول على اسم تخصص المصور
 */
export const getPhotographerSpecialization = (spec: string): string => {
  const specializations: { [key: string]: string } = {
    'product_photography': 'تصوير المنتجات',
    'portrait_photography': 'تصوير الأشخاص',
    'video_production': 'إنتاج الفيديو',
    'graphic_design': 'التصميم الجرافيكي',
    'social_media_content': 'محتوى السوشال ميديا',
    'commercial_photography': 'التصوير التجاري'
  }
  return specializations[spec] || spec
}

/**
 * الحصول على وقت التوفر
 */
export const getAvailabilityTime = (time: string): string => {
  const times: { [key: string]: string } = {
    'morning': 'الفترة الصباحية (8ص - 12ظ)',
    'afternoon': 'فترة بعد الظهر (12ظ - 6م)',
    'evening': 'الفترة المسائية (6م - 10م)',
    'weekend': 'عطلة نهاية الأسبوع'
  }
  return times[time] || time
}

// === Brand Helpers ===

/**
 * الحصول على اسم البراند
 * @todo جلب اسم البراند من قاعدة البيانات
 */
export const getBrandName = (brandId: string): string => {
  // TODO: جلب اسم البراند من قاعدة البيانات
  return brandId || 'غير محدد'
}

// === Validation Helpers ===

/**
 * التحقق من صحة بيانات المستخدم
 */
export const validateUserData = (user: any): boolean => {
  return !!(user && user.email && user.primary_role)
}

/**
 * التحقق من صحة الدور
 */
export const isValidRole = (role: string): boolean => {
  const validRoles = ['photographer', 'brand_coordinator', 'marketing_coordinator', 'super_admin']
  return validRoles.includes(role)
}

/**
 * التحقق من صحة الحالة
 */
export const isValidStatus = (status: string): boolean => {
  const validStatuses = ['active', 'pending_approval', 'suspended', 'deleted']
  return validStatuses.includes(status)
}

// === Filter Options ===

/**
 * خيارات فلترة الحالة
 */
export const statusFilterOptions = [
  { title: 'الكل', value: '' },
  { title: 'نشط', value: 'active' },
  { title: 'معلق', value: 'pending_approval' },
  { title: 'معطل', value: 'suspended' },
  { title: 'محذوف', value: 'deleted' }
]

/**
 * خيارات فلترة الدور
 */
export const roleFilterOptions = [
  { title: 'الكل', value: '' },
  { title: 'مصور', value: 'photographer' },
  { title: 'منسق براند', value: 'brand_coordinator' },
  { title: 'منسق تسويق', value: 'marketing_coordinator' },
  { title: 'مدير عام', value: 'super_admin' }
]

// === Table Headers ===

/**
 * أعمدة جدول المستخدمين النشطين
 */
export const activeUsersHeaders = [
  {
    title: 'المستخدم',
    key: 'user_info',
    sortable: false,
    width: '250px'
  },
  {
    title: 'الدور',
    key: 'primary_role',
    sortable: true,
    width: '150px'
  },
  {
    title: 'الهاتف',
    key: 'phone',
    sortable: false,
    width: '130px'
  },
  {
    title: 'تاريخ التفعيل',
    key: 'approved_at',
    sortable: true,
    width: '150px'
  },
  {
    title: 'الحالة',
    key: 'status',
    sortable: false,
    width: '100px'
  },
  {
    title: 'الإجراءات',
    key: 'actions',
    sortable: false,
    width: '150px',
    align: 'center' as const
  }
] as const

/**
 * أعمدة جدول جميع المستخدمين
 */
export const allUsersHeaders = [
  {
    title: 'المستخدم',
    key: 'user_info',
    sortable: false,
    width: '220px'
  },
  {
    title: 'الدور',
    key: 'primary_role',
    sortable: true,
    width: '130px'
  },
  {
    title: 'الحالة',
    key: 'status',
    sortable: true,
    width: '120px'
  },
  {
    title: 'الهاتف',
    key: 'phone',
    sortable: false,
    width: '120px'
  },
  {
    title: 'تاريخ التسجيل',
    key: 'created_at',
    sortable: true,
    width: '140px'
  },
  {
    title: 'الإجراءات',
    key: 'actions',
    sortable: false,
    width: '120px',
    align: 'center' as const
  }
] as const

// === Types (للـ TypeScript) ===

export interface User {
  id: string
  email: string
  display_name?: string
  full_name?: string
  phone?: string
  primary_role: string
  status: string
  created_at: any
  updated_at?: any
  approved_at?: any
  suspended_at?: any
  reactivated_at?: any
  approved_by?: string
  suspended_by?: string
  reactivated_by?: string
  profile_photo_url?: string
  firebase_uid?: string
  auth_provider?: string
}

export interface UserStats {
  total: number
  active: number
  pending: number
}

export interface FilterOptions {
  status: string
  role: string
  search: string
} 
/**
 * ==============================================
 * DEPTH STUDIO - مساعدات إدارة المستخدمين
 * User Management Utilities
 * ==============================================
 */

export interface User {
  id: string
  email: string
  displayName: string
  display_name?: string
  full_name?: string
  photoURL?: string
  profile_photo_url?: string
  phone?: string
  firebase_uid?: string
  auth_provider?: string
  status: 'pending_approval' | 'active' | 'suspended' | 'rejected'
  primary_role: 'super_admin' | 'marketing_coordinator' | 'brand_coordinator' | 'photographer'
  secondary_roles?: string[]
  permissions?: string[]
  brand_access?: string[]
  created_at: string
  updated_at: string
  last_login?: string
  approved_at?: string
  suspended_at?: string
  profile?: UserProfile
}

export interface UserProfile {
  firstName?: string
  lastName?: string
  phone?: string
  address?: string
  bio?: string
  skills?: string[]
  experience?: string
  portfolio_links?: string[]
  contract_type?: 'freelancer' | 'salary'
  hourly_rate?: number
  monthly_salary?: number
  emergency_contact?: {
    name: string
    phone: string
    relationship: string
  }
}

export interface UserStats {
  total: number
  active: number
  pending: number
  suspended: number
  by_role: Record<string, number>
}

/**
 * الحصول على اسم الدور بالعربية
 */
export function getRoleName(role: string): string {
  const roleNames: Record<string, string> = {
    'super_admin': 'المدير العام',
    'marketing_coordinator': 'منسق التسويق',
    'brand_coordinator': 'منسق البراند',
    'photographer': 'مصور'
  }
  
  return roleNames[role] || role
}

/**
 * الحصول على لون الدور
 */
export function getRoleColor(role: string): string {
  const roleColors: Record<string, string> = {
    'super_admin': 'error',
    'marketing_coordinator': 'primary',
    'brand_coordinator': 'warning',
    'photographer': 'success'
  }
  
  return roleColors[role] || 'default'
}

/**
 * الحصول على حالة المستخدم بالعربية
 */
export function getStatusName(status: string): string {
  const statusNames: Record<string, string> = {
    'pending_approval': 'في انتظار الموافقة',
    'active': 'نشط',
    'suspended': 'موقوف',
    'rejected': 'مرفوض'
  }
  
  return statusNames[status] || status
}

/**
 * الحصول على لون الحالة
 */
export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    'pending_approval': 'warning',
    'active': 'success',
    'suspended': 'error',
    'rejected': 'error'
  }
  
  return statusColors[status] || 'default'
}

/**
 * فحص صلاحية المستخدم
 */
export function hasPermission(user: User, permission: string): boolean {
  if (!user.permissions) return false
  return user.permissions.includes(permission)
}

/**
 * فحص الوصول للبراند
 */
export function hasBrandAccess(user: User, brandId: string): boolean {
  if (user.primary_role === 'super_admin') return true
  if (!user.brand_access) return false
  return user.brand_access.includes(brandId)
}

/**
 * فرمتة آخر تسجيل دخول
 */
export function formatLastLogin(lastLogin?: string): string {
  if (!lastLogin) return 'لم يسجل دخول بعد'
  
  const date = new Date(lastLogin)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'اليوم'
  if (diffDays === 1) return 'أمس'
  if (diffDays < 7) return `منذ ${diffDays} أيام`
  if (diffDays < 30) return `منذ ${Math.floor(diffDays / 7)} أسابيع`
  if (diffDays < 365) return `منذ ${Math.floor(diffDays / 30)} شهور`
  
  return `منذ ${Math.floor(diffDays / 365)} سنة`
}

/**
 * تنسيق اسم المستخدم الكامل
 */
export function getFullName(user: User): string {
  if (user.profile?.firstName && user.profile?.lastName) {
    return `${user.profile.firstName} ${user.profile.lastName}`
  }
  return user.displayName || user.email
}

/**
 * التحقق من صحة البريد الإلكتروني
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * التحقق من قوة كلمة المرور
 */
export function validatePassword(password: string): {
  isValid: boolean
  strength: 'weak' | 'medium' | 'strong'
  errors: string[]
} {
  const errors: string[] = []
  let score = 0
  
  if (password.length < 8) {
    errors.push('كلمة المرور يجب أن تكون 8 أحرف على الأقل')
  } else {
    score += 1
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('يجب أن تحتوي على حرف صغير')
  } else {
    score += 1
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('يجب أن تحتوي على حرف كبير')
  } else {
    score += 1
  }
  
  if (!/\d/.test(password)) {
    errors.push('يجب أن تحتوي على رقم')
  } else {
    score += 1
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('يجب أن تحتوي على رمز خاص')
  } else {
    score += 1
  }
  
  let strength: 'weak' | 'medium' | 'strong' = 'weak'
  if (score >= 4) strength = 'strong'
  else if (score >= 2) strength = 'medium'
  
  return {
    isValid: errors.length === 0,
    strength,
    errors
  }
}

/**
 * فرمتة رقم الهاتف
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  
  if (cleaned.startsWith('964')) {
    // العراق
    return `+964 ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`
  }
  
  return phone
}

/**
 * إنشاء الأحرف الأولى من الاسم
 */
export function getInitials(user: User): string {
  const name = getFullName(user)
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// أيقونات الأدوار
export function getRoleIcon(role: string): string {
  const roleIcons: Record<string, string> = {
    'super_admin': 'admin-panel-settings',
    'marketing_coordinator': 'campaign',
    'brand_coordinator': 'business',
    'photographer': 'camera'
  }
  
  return roleIcons[role] || 'person'
}

// أيقونات الحالات
export function getStatusIcon(status: string): string {
  const statusIcons: Record<string, string> = {
    'pending_approval': 'hourglass-empty',
    'active': 'check-circle',
    'suspended': 'pause-circle',
    'rejected': 'cancel'
  }
  
  return statusIcons[status] || 'help'
}

// فرمتة التاريخ
export function formatDate(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString
  
  if (isNaN(date.getTime())) return 'تاريخ غير صحيح'
  
  return new Intl.DateTimeFormat('ar-IQ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

// حساب الفرق الزمني
export function getTimeDifference(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'اليوم'
  if (diffDays === 1) return 'أمس'
  if (diffDays < 7) return `منذ ${diffDays} أيام`
  if (diffDays < 30) return `منذ ${Math.floor(diffDays / 7)} أسابيع`
  if (diffDays < 365) return `منذ ${Math.floor(diffDays / 30)} شهور`
  
  return `منذ ${Math.floor(diffDays / 365)} سنة`
}

// تخصص المصور
export function getPhotographerSpecialization(user: User): string {
  if (user.profile?.skills && user.profile.skills.length > 0) {
    return user.profile.skills.join(', ')
  }
  return 'غير محدد'
}

// وقت التوفر
export function getAvailabilityTime(user: User): string {
  // منطق مخصص لحساب وقت التوفر
  return 'متاح الآن'
}

// اسم التخصص
export function getSpecializationName(specialization: string): string {
  const specializations: Record<string, string> = {
    'portrait': 'تصوير شخصي',
    'wedding': 'تصوير زفاف',
    'product': 'تصوير منتجات',
    'fashion': 'تصوير أزياء',
    'event': 'تصوير مناسبات'
  }
  
  return specializations[specialization] || specialization
}

// اسم البراند
export function getBrandName(brandId: string): string {
  const brands: Record<string, string> = {
    'nava': 'NAVA',
    'sportmore': 'Sport&More',
    'inoff': 'INOFF',
    'blo': 'BLO',
    'clinica': 'Clinica A'
  }
  
  return brands[brandId] || brandId
}

// خيارات فلترة الحالة
export const statusFilterOptions = [
  { text: 'جميع الحالات', value: '' },
  { text: 'في انتظار الموافقة', value: 'pending_approval' },
  { text: 'نشط', value: 'active' },
  { text: 'موقوف', value: 'suspended' },
  { text: 'مرفوض', value: 'rejected' }
]

// خيارات فلترة الأدوار
export const roleFilterOptions = [
  { text: 'جميع الأدوار', value: '' },
  { text: 'المدير العام', value: 'super_admin' },
  { text: 'منسق التسويق', value: 'marketing_coordinator' },
  { text: 'منسق البراند', value: 'brand_coordinator' },
  { text: 'مصور', value: 'photographer' }
]

// عناوين جدول المستخدمين النشطين
export const activeUsersHeaders = [
  { text: 'المستخدم', value: 'user', sortable: true },
  { text: 'الدور', value: 'primary_role', sortable: true },
  { text: 'آخر نشاط', value: 'last_login', sortable: true },
  { text: 'الإجراءات', value: 'actions', sortable: false }
]

// عناوين جدول جميع المستخدمين
export const allUsersHeaders = [
  { text: 'المستخدم', value: 'user', sortable: true },
  { text: 'الحالة', value: 'status', sortable: true },
  { text: 'الدور', value: 'primary_role', sortable: true },
  { text: 'تاريخ التسجيل', value: 'created_at', sortable: true },
  { text: 'الإجراءات', value: 'actions', sortable: false }
] 
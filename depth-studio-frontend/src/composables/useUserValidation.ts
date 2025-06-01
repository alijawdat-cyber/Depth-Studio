import { computed } from 'vue'
import type { User } from '@/utils/userHelpers'

/**
 * Composable for user data validation
 * المسؤول عن جميع قواعد التحقق من صحة بيانات المستخدمين
 */
export const useUserValidation = () => {
  
  // === Email Validation ===
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    return emailRegex.test(email)
  }

  // === Phone Validation ===
  const isValidPhone = (phone: string): boolean => {
    // Iraq phone formats: +964xxxxxxxxx, 07xxxxxxxx, 077xxxxxxx
    const iraqPhoneRegex = /^(\+964|0)?7[0-9]{8}$/
    return iraqPhoneRegex.test(phone.replace(/\s+/g, ''))
  }

  // === Name Validation ===
  const isValidName = (name: string): boolean => {
    // Arabic and English names, minimum 2 characters
    const nameRegex = /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFFa-zA-Z\s]{2,50}$/
    return nameRegex.test(name.trim())
  }

  // === Role Validation ===
  const isValidRole = (role: string): boolean => {
    const validRoles = ['photographer', 'brand_coordinator', 'marketing_coordinator', 'super_admin']
    return validRoles.includes(role)
  }

  // === Password Strength Validation ===
  const getPasswordStrength = (password: string): {
    score: number
    feedback: string[]
    isValid: boolean
  } => {
    const feedback: string[] = []
    let score = 0

    if (password.length >= 8) {
      score += 1
    } else {
      feedback.push('كلمة المرور يجب أن تكون 8 أحرف على الأقل')
    }

    if (/[a-z]/.test(password)) {
      score += 1
    } else {
      feedback.push('يجب أن تحتوي على حروف صغيرة')
    }

    if (/[A-Z]/.test(password)) {
      score += 1
    } else {
      feedback.push('يجب أن تحتوي على حروف كبيرة')
    }

    if (/[0-9]/.test(password)) {
      score += 1
    } else {
      feedback.push('يجب أن تحتوي على أرقام')
    }

    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score += 1
    } else {
      feedback.push('يجب أن تحتوي على رموز خاصة')
    }

    return {
      score,
      feedback,
      isValid: score >= 4
    }
  }

  // === User Registration Validation ===
  const validateUserRegistration = (user: Partial<User>): {
    isValid: boolean
    errors: Record<string, string>
  } => {
    const errors: Record<string, string> = {}

    // Email validation
    if (!user.email) {
      errors.email = 'البريد الإلكتروني مطلوب'
    } else if (!isValidEmail(user.email)) {
      errors.email = 'البريد الإلكتروني غير صحيح'
    }

    // التحقق من الاسم الكامل
    if (!user.displayName && !user.display_name && !user.full_name) {
      errors.full_name = 'الاسم الكامل مطلوب'
    } else {
      const nameToCheck = user.displayName || user.display_name || user.full_name
      if (nameToCheck && !isValidName(nameToCheck)) {
        errors.full_name = 'الاسم يجب أن يحتوي على حروف صحيحة فقط'
      }
    }

    // التحقق من رقم الهاتف
    if (user.profile?.phone || user.phone) {
      const phoneToCheck = user.profile?.phone || user.phone
      if (phoneToCheck && !isValidPhone(phoneToCheck)) {
        errors.phone = 'رقم الهاتف غير صحيح'
      }
    }

    // Role validation
    if (!user.primary_role) {
      errors.primary_role = 'الدور مطلوب'
    } else if (!isValidRole(user.primary_role)) {
      errors.primary_role = 'الدور المحدد غير صحيح'
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  }

  // === Role-Specific Validation ===
  const validatePhotographerProfile = (profile: any): {
    isValid: boolean
    errors: Record<string, string>
  } => {
    const errors: Record<string, string> = {}

    // Specializations validation
    if (!profile.specializations || profile.specializations.length === 0) {
      errors.specializations = 'يجب اختيار تخصص واحد على الأقل'
    }

    // Equipment validation
    if (!profile.equipment || profile.equipment.length === 0) {
      errors.equipment = 'يجب إدخال معدات التصوير'
    }

    // Portfolio validation
    if (!profile.portfolio_links || profile.portfolio_links.length === 0) {
      errors.portfolio_links = 'يجب إضافة رابط واحد للأعمال على الأقل'
    }

    // Experience validation
    if (profile.years_of_experience === undefined || profile.years_of_experience < 0) {
      errors.years_of_experience = 'سنوات الخبرة مطلوبة'
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  }

  const validateBrandCoordinatorProfile = (profile: any): {
    isValid: boolean
    errors: Record<string, string>
  } => {
    const errors: Record<string, string> = {}

    // Brand IDs validation
    if (!profile.managed_brand_ids || profile.managed_brand_ids.length === 0) {
      errors.managed_brand_ids = 'يجب اختيار براند واحد على الأقل للإدارة'
    }

    // Marketing experience validation
    if (!profile.marketing_experience_years || profile.marketing_experience_years < 0) {
      errors.marketing_experience_years = 'سنوات خبرة التسويق مطلوبة'
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  }

  // === Business Logic Validation ===
  const canUserBeApproved = (user: User): {
    canApprove: boolean
    reason?: string
  } => {
    // Check if user profile is complete
    if (user.status !== 'pending_approval') {
      return {
        canApprove: false,
        reason: 'المستخدم ليس في حالة انتظار الموافقة'
      }
    }

    // Check if required profile data exists
    if (user.primary_role === 'photographer' && !(user as any).photographer_profile) {
      return {
        canApprove: false,
        reason: 'بيانات المصور غير مكتملة'
      }
    }

    if (user.primary_role === 'brand_coordinator' && !(user as any).brand_coordinator_profile) {
      return {
        canApprove: false,
        reason: 'بيانات منسق البراند غير مكتملة'
      }
    }

    return { canApprove: true }
  }

  const canUserBeSuspended = (user: User): {
    canSuspend: boolean
    reason?: string
  } => {
    if (user.status !== 'active') {
      return {
        canSuspend: false,
        reason: 'المستخدم ليس نشطاً'
      }
    }

    if (user.primary_role === 'super_admin') {
      return {
        canSuspend: false,
        reason: 'لا يمكن تعليق حساب المدير العام'
      }
    }

    return { canSuspend: true }
  }

  // === Validation Rules ===
  const getValidationRules = () => ({
    email: [
      (v: string) => !!v || 'البريد الإلكتروني مطلوب',
      (v: string) => isValidEmail(v) || 'البريد الإلكتروني غير صحيح'
    ],
    
    name: [
      (v: string) => !!v || 'الاسم مطلوب',
      (v: string) => v.length >= 2 || 'الاسم يجب أن يكون حرفين على الأقل',
      (v: string) => isValidName(v) || 'الاسم يحتوي على أحرف غير صحيحة'
    ],
    
    phone: [
      (v: string) => !!v || 'رقم الهاتف مطلوب',
      (v: string) => isValidPhone(v) || 'رقم الهاتف غير صحيح (مثال: 07901234567)'
    ],
    
    role: [
      (v: string) => !!v || 'الدور مطلوب',
      (v: string) => isValidRole(v) || 'الدور المحدد غير صحيح'
    ],
    
    password: [
      (v: string) => !!v || 'كلمة المرور مطلوبة',
      (v: string) => v.length >= 8 || 'كلمة المرور يجب أن تكون 8 أحرف على الأقل',
      (v: string) => getPasswordStrength(v).isValid || 'كلمة المرور ضعيفة'
    ]
  })

  // === File Validation ===
  const validateImageFile = (file: File): {
    isValid: boolean
    error?: string
  } => {
    const maxSize = 5 * 1024 * 1024 // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'حجم الصورة يجب أن يكون أقل من 5 ميجابايت'
      }
    }

    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'نوع الملف غير مدعوم. الأنواع المسموحة: JPEG, PNG, WebP'
      }
    }

    return { isValid: true }
  }

  const validateDocumentFile = (file: File): {
    isValid: boolean
    error?: string
  } => {
    const maxSize = 10 * 1024 * 1024 // 10MB
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']

    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'حجم الملف يجب أن يكون أقل من 10 ميجابايت'
      }
    }

    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'نوع الملف غير مدعوم. الأنواع المسموحة: PDF, JPEG, PNG'
      }
    }

    return { isValid: true }
  }

  // === Computed Properties ===
  const validationRules = computed(() => getValidationRules())

  return {
    // Basic validation functions
    isValidEmail,
    isValidPhone,
    isValidName,
    isValidRole,
    
    // Password validation
    getPasswordStrength,
    
    // Complete validation
    validateUserRegistration,
    validatePhotographerProfile,
    validateBrandCoordinatorProfile,
    
    // Business logic validation
    canUserBeApproved,
    canUserBeSuspended,
    
    // File validation
    validateImageFile,
    validateDocumentFile,
    
    // Validation rules for forms
    validationRules
  }
} 
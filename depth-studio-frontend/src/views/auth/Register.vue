<template>
  <v-container fluid class="fill-height">
    <v-row justify="center" align="center" class="fill-height">
      <v-col cols="12" sm="8" md="6" lg="4" xl="3">
        <v-card 
          class="register-card elevation-12 rounded-xl"
          :loading="isLoading"
        >
          <!-- Header -->
          <v-card-title class="text-center pa-6 pb-4">
            <div class="d-flex flex-column align-center">
              <div class="logo-container mb-4">
                <h1 class="logo-text">DEPTH STUDIO</h1>
              </div>
              <h2 class="text-h4 font-weight-bold primary--text mb-2">
                إنشاء حساب جديد
              </h2>
              <p class="text-body-1 text-medium-emphasis text-center">
                انضم إلى Depth Studio وابدأ رحلتك الإبداعية
              </p>
            </div>
          </v-card-title>

          <v-card-text class="pa-6">
            <!-- Success Dialog -->
            <v-dialog v-model="showSuccessDialog" max-width="400" persistent>
              <v-card class="text-center pa-4 rounded-xl">
                <v-icon size="64" color="success" class="mb-4">
                  mdi-check-circle
                </v-icon>
                <v-card-title class="text-h6 mb-2">تم إنشاء الحساب بنجاح!</v-card-title>
                <v-card-text class="text-body-2 mb-4">
                  مرحباً بك في Depth Studio. سيتم توجيهك لإعداد دورك الآن.
                </v-card-text>
                <v-btn 
                  color="primary" 
                  @click="proceedToRoleSetup"
                  rounded="lg"
                  size="large"
                >
                  المتابعة
                  <v-icon end>mdi-arrow-left</v-icon>
                </v-btn>
              </v-card>
            </v-dialog>

            <v-form 
              ref="registerForm" 
              @submit.prevent="handleRegister"
              fast-fail
            >
              <!-- Full Name Field -->
              <v-text-field
                v-model="formData.fullName"
                label="الاسم الكامل"
                type="text"
                variant="outlined"
                :rules="fullNameRules"
                :error-messages="getFieldError('fullName')"
                prepend-inner-icon="mdi-account"
                class="mb-3"
                rounded="lg"
                color="primary"
              />

              <!-- Email Field -->
              <v-text-field
                v-model="formData.email"
                label="البريد الإلكتروني"
                type="email"
                variant="outlined"
                :rules="emailRules"
                :error-messages="getFieldError('email')"
                prepend-inner-icon="mdi-email"
                class="mb-3"
                rounded="lg"
                color="primary"
              />

              <!-- Password Field -->
              <v-text-field
                v-model="formData.password"
                :label="showPassword ? 'كلمة المرور' : 'كلمة المرور'"
                :type="showPassword ? 'text' : 'password'"
                variant="outlined"
                :rules="passwordRules"
                :error-messages="getFieldError('password')"
                prepend-inner-icon="mdi-lock"
                :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append-inner="showPassword = !showPassword"
                class="mb-3"
                rounded="lg"
                color="primary"
              />

              <!-- Confirm Password Field -->
              <v-text-field
                v-model="formData.confirmPassword"
                label="تأكيد كلمة المرور"
                :type="showConfirmPassword ? 'text' : 'password'"
                variant="outlined"
                :rules="confirmPasswordRules"
                :error-messages="getFieldError('confirmPassword')"
                prepend-inner-icon="mdi-lock-check"
                :append-inner-icon="showConfirmPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append-inner="showConfirmPassword = !showConfirmPassword"
                class="mb-4"
                rounded="lg"
                color="primary"
              />

              <!-- Terms and Conditions -->
              <v-checkbox
                v-model="formData.agreeToTerms"
                :rules="termsRules"
                class="mb-4"
                color="primary"
              >
                <template v-slot:label>
                  <span class="text-body-2">
                    أوافق على 
                    <a href="#" class="text-primary text-decoration-none">شروط الاستخدام</a>
                    و
                    <a href="#" class="text-primary text-decoration-none">سياسة الخصوصية</a>
                  </span>
                </template>
              </v-checkbox>

              <!-- Error Alert -->
              <v-alert
                v-if="error"
                type="error"
                variant="tonal"
                class="mb-4 rounded-lg"
                @click:close="clearError"
                closable
              >
                {{ error }}
              </v-alert>

              <!-- Register Button -->
              <v-btn
                type="submit"
                color="primary"
                size="x-large"
                :loading="isLoading"
                :disabled="!isFormValid || isLoading"
                block
                rounded="lg"
                class="mb-4 text-h6 py-3"
                elevation="2"
              >
                <v-icon start size="20">mdi-account-plus</v-icon>
                إنشاء الحساب
              </v-btn>

              <!-- Divider -->
              <v-divider class="my-6">
                <span class="text-body-2 text-medium-emphasis px-4 bg-surface">أو</span>
              </v-divider>

              <!-- Google Register Button -->
              <v-btn
                color="white"
                variant="outlined"
                size="x-large"
                block
                rounded="lg"
                class="mb-6 text-h6 py-3 google-btn"
                @click="handleGoogleRegister"
                :loading="isGoogleLoading"
                :disabled="isLoading"
                elevation="1"
              >
                <template #prepend>
                  <img 
                    src="https://developers.google.com/identity/images/g-logo.png" 
                    alt="Google" 
                    class="google-icon"
                  >
                </template>
                <span class="google-text">التسجيل بحساب Google</span>
              </v-btn>

              <!-- Login Link -->
              <v-card-text class="text-center pa-0">
                <p class="text-body-2 text-medium-emphasis mb-2">
                  هل لديك حساب بالفعل؟
                </p>
                <router-link 
                  to="/auth/login" 
                  class="text-primary text-decoration-none font-weight-medium"
                >
                  تسجيل الدخول
                  <v-icon size="small" class="ms-1">mdi-arrow-left</v-icon>
                </router-link>
              </v-card-text>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

// Composables
const router = useRouter()
const { 
  registerWithEmail, 
  registerWithGoogle,
  error, 
  isSigningIn,
  clearError 
} = useAuth()

// Form state
const registerForm = ref()
const showSuccessDialog = ref(false)
const isLoading = ref(false)
const isGoogleLoading = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)

// Form data
const formData = ref({
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  agreeToTerms: false
})

// Validation rules
const fullNameRules = [
  (v: string) => !!v || 'الاسم الكامل مطلوب',
  (v: string) => (v && v.length >= 2) || 'الاسم يجب أن يكون أكثر من حرفين',
  (v: string) => (v && v.length <= 50) || 'الاسم يجب أن يكون أقل من 50 حرف'
]

const emailRules = [
  (v: string) => !!v || 'البريد الإلكتروني مطلوب',
  (v: string) => /.+@.+\..+/.test(v) || 'البريد الإلكتروني غير صحيح'
]

const passwordRules = [
  (v: string) => !!v || 'كلمة المرور مطلوبة',
  (v: string) => (v && v.length >= 8) || 'كلمة المرور يجب أن تكون 8 أحرف على الأقل',
  (v: string) => /(?=.*[a-z])/.test(v) || 'كلمة المرور يجب أن تحتوي على حرف صغير',
  (v: string) => /(?=.*[A-Z])/.test(v) || 'كلمة المرور يجب أن تحتوي على حرف كبير',
  (v: string) => /(?=.*\d)/.test(v) || 'كلمة المرور يجب أن تحتوي على رقم'
]

const confirmPasswordRules = [
  (v: string) => !!v || 'تأكيد كلمة المرور مطلوب',
  (v: string) => v === formData.value.password || 'كلمة المرور غير متطابقة'
]

const termsRules = [
  (v: boolean) => !!v || 'يجب الموافقة على الشروط والأحكام'
]

// Computed
const isFormValid = computed(() => {
  return formData.value.fullName.length >= 2 &&
         formData.value.email.includes('@') &&
         formData.value.password.length >= 8 &&
         formData.value.password === formData.value.confirmPassword &&
         formData.value.agreeToTerms
})

// Methods
const getFieldError = (field: string) => {
  // Return field-specific errors if needed
  return []
}

const handleRegister = async () => {
  if (!registerForm.value?.validate()) return
  
  try {
    isLoading.value = true
    clearError()
    
    await registerWithEmail(
      formData.value.email,
      formData.value.password,
      formData.value.fullName
    )
    
    // Show success dialog
    showSuccessDialog.value = true
    setTimeout(() => {
      showSuccessDialog.value = false
    }, 2000)
    
  } catch (err: any) {
    console.error('خطأ في التسجيل بالإيميل:', err)
  } finally {
    isLoading.value = false
  }
}

const handleGoogleRegister = async () => {
  try {
    isGoogleLoading.value = true
    clearError()
    
    console.log('🔄 بدء التسجيل بـ Google...')
    await registerWithGoogle()
    console.log('✅ تم التسجيل بـ Google بنجاح')
    
  } catch (err: any) {
    console.error('خطأ في التسجيل بـ Google:', err)
    
    if (err.message === 'redirect_in_progress') {
      console.log('ℹ️ إعادة توجيه جارية، سيتم إكمال التسجيل عند تحميل الصفحة')
      return
    }
    
  } finally {
    setTimeout(() => {
      isGoogleLoading.value = false
    }, 500)
  }
}

const proceedToRoleSetup = () => {
  showSuccessDialog.value = false
  router.push('/auth/role-setup')
}
</script>

<style scoped lang="scss">
@import '@/styles/design-system/index';

.register-page {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--color-primary-600) 0%, var(--color-primary-800) 100%);
  
  .register-container {
    padding: var(--spacing-6);
  }
  
  .register-card {
    max-width: 500px;
    width: 100%;
    margin: 0 auto;
    border-radius: var(--border-radius-lg);
    box-shadow: var(--elevation-high);
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    
    .v-card__text {
      padding: var(--spacing-8);
    }
  }
  
  .register-title {
    margin-bottom: var(--spacing-6);
    text-align: center;
    color: var(--color-text-primary);
  }
  
  // Form field customizations
  .v-field--variant-outlined {
    border: 2px solid var(--color-border-light) !important;
    color: var(--color-text-primary) !important;
    background-color: var(--color-surface-primary);
    
    &.v-field--focused {
      border-color: var(--color-primary-500) !important;
      background-color: var(--color-background-secondary) !important;
    }
  }
  
  .register-button {
    margin-top: var(--spacing-6);
    height: 48px;
    font-weight: 600;
    text-transform: none;
  }
  
  .login-link {
    margin-top: var(--spacing-4);
    text-align: center;
    color: var(--color-text-secondary);
  }
  
  // Loading animation
  .loading-dots {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    
    .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--color-background-secondary);
      animation: loadingDots 1.4s infinite both;
      
      &:nth-child(1) { animation-delay: 0s; }
      &:nth-child(2) { animation-delay: 0.16s; }
      &:nth-child(3) { animation-delay: 0.32s; }
    }
  }
}

@keyframes loadingDots {
  0%, 80%, 100% { 
    transform: scale(0.8);
    background: var(--color-background-secondary);
  }
  40% { 
    transform: scale(1.2);
    background: var(--color-background-tertiary);
  }
}

// Responsive design
@media (max-width: 600px) {
  .register-page {
    .register-container {
      padding: var(--spacing-4);
    }
    
    .register-card {
      .v-card__text {
        padding: var(--spacing-6);
      }
    }
  }
}
</style> 
<template>
  <v-container fluid class="fill-height">
    <v-row justify="center" align="center" class="fill-height">
      <v-col cols="12" sm="8" md="6" lg="4" xl="3">
        <v-card 
          class="login-card elevation-12 rounded-xl"
          :loading="isLoading"
        >
          <!-- Header -->
          <v-card-title class="text-center pa-6 pb-4">
            <div class="d-flex flex-column align-center">
              <div class="logo-container mb-4">
                <h1 class="logo-text">DEPTH STUDIO</h1>
              </div>
              <h2 class="text-h4 font-weight-bold primary--text mb-2">
                تسجيل الدخول
              </h2>
              <p class="text-body-1 text-medium-emphasis text-center">
                مرحباً بعودتك إلى Depth Studio
              </p>
            </div>
          </v-card-title>

          <v-card-text class="pa-6">
            <v-form 
              ref="loginForm" 
              @submit.prevent="handleLogin"
              fast-fail
            >
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
                class="mb-4"
                rounded="lg"
                color="primary"
              />

              <!-- Remember Me & Forgot Password -->
              <div class="d-flex justify-space-between align-center mb-4">
                <v-checkbox
                  v-model="formData.rememberMe"
                  label="تذكرني"
                  color="primary"
                  hide-details
                />
                <router-link 
                  to="/auth/forgot-password" 
                  class="text-primary text-decoration-none text-body-2"
                >
                  نسيت كلمة المرور؟
                </router-link>
              </div>

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

              <!-- Login Button -->
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
                <v-icon start size="20">mdi-login</v-icon>
                تسجيل الدخول
              </v-btn>

              <!-- Divider -->
              <v-divider class="my-6">
                <span class="text-body-2 text-medium-emphasis px-4 bg-surface">أو</span>
              </v-divider>

              <!-- Google Login Button -->
              <v-btn
                color="white"
                variant="outlined"
                size="x-large"
                block
                rounded="lg"
                class="mb-6 text-h6 py-3 google-btn"
                @click="handleGoogleLogin"
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
                <span class="google-text">الدخول بحساب Google</span>
              </v-btn>

              <!-- Register Link -->
              <v-card-text class="text-center pa-0">
                <p class="text-body-2 text-medium-emphasis mb-2">
                  ليس لديك حساب؟
                </p>
                <router-link 
                  to="/auth/register" 
                  class="text-primary text-decoration-none font-weight-medium"
                >
                  إنشاء حساب جديد
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
  signInWithEmail, 
  registerWithGoogle,
  error, 
  isSigningIn,
  clearError 
} = useAuth()

// Form state
const loginForm = ref()
const isLoading = ref(false)
const isGoogleLoading = ref(false)
const showPassword = ref(false)

// Form data
const formData = ref({
  email: '',
  password: '',
  rememberMe: false
})

// Validation rules
const emailRules = [
  (v: string) => !!v || 'البريد الإلكتروني مطلوب',
  (v: string) => /.+@.+\..+/.test(v) || 'البريد الإلكتروني غير صحيح'
]

const passwordRules = [
  (v: string) => !!v || 'كلمة المرور مطلوبة'
]

// Computed
const isFormValid = computed(() => {
  return formData.value.email.includes('@') &&
         formData.value.password.length > 0
})

// Methods
const getFieldError = (field: string) => {
  // Return field-specific errors if needed
  return []
}

const handleLogin = async () => {
  if (!loginForm.value?.validate()) return
  
  try {
    isLoading.value = true
    clearError()
    
    await signInWithEmail(
      formData.value.email,
      formData.value.password
    )
    
    console.log('✅ تم تسجيل الدخول بنجاح')
    
  } catch (err: any) {
    console.error('خطأ في تسجيل الدخول بالإيميل:', err)
  } finally {
    isLoading.value = false
  }
}

const handleGoogleLogin = async () => {
  try {
    isGoogleLoading.value = true
    clearError()
    
    console.log('🔄 بدء تسجيل الدخول بـ Google...')
    await registerWithGoogle() // This handles both sign-in and sign-up
    console.log('✅ تم تسجيل الدخول بـ Google بنجاح')
    
  } catch (err: any) {
    console.error('خطأ في تسجيل الدخول بـ Google:', err)
    
    if (err.message === 'redirect_in_progress') {
      console.log('ℹ️ إعادة توجيه جارية، سيتم إكمال تسجيل الدخول عند تحميل الصفحة')
      return
    }
    
  } finally {
    setTimeout(() => {
      isGoogleLoading.value = false
    }, 500)
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/design-system/index';

.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--color-primary-600) 0%, var(--color-primary-800) 100%);
  
  .login-container {
    padding: var(--spacing-6);
  }
  
  .login-card {
    max-width: 400px;
    width: 100%;
    margin: 0 auto;
    border-radius: var(--border-radius-lg);
    box-shadow: var(--elevation-high);
    
    .v-card__text {
      padding: var(--spacing-8);
    }
  }
  
  .login-title {
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
  
  .login-button {
    margin-top: var(--spacing-6);
    height: 48px;
    font-weight: 600;
    text-transform: none;
  }
  
  .forgot-password {
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
  .login-page {
    .login-container {
      padding: var(--spacing-4);
    }
    
    .login-card {
      .v-card__text {
        padding: var(--spacing-6);
      }
    }
  }
}
</style> 
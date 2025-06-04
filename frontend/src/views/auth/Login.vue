<template>
  <div class="login-container">
    <!-- Header مع Animation -->
    <div class="text-center mb-8">
      <div class="logo-container">
        <div class="logo-gradient">📸</div>
      </div>
      <h2 class="welcome-title">أهلاً بك مرة أخرى</h2>
      <p class="welcome-subtitle">سجل دخولك للمتابعة</p>
    </div>
    
    <!-- Form Container -->
    <div class="form-card">
      <form @submit.prevent="handleSubmit" class="space-y-5">
        <BaseInput
          v-model="email"
          type="email"
          label="البريد الإلكتروني"
          placeholder="example@domain.com"
          required
          :error="emailError"
          class="input-enhanced"
        />
        
        <BaseInput
          v-model="password"
          type="password"
          label="كلمة المرور"
          placeholder="••••••••"
          required
          :error="passwordError"
          class="input-enhanced"
        />
        
        <!-- Remember & Forgot -->
        <div class="flex justify-between items-center text-sm">
          <label class="flex items-center gap-2 cursor-pointer">
            <input v-model="rememberMe" type="checkbox" class="checkbox-custom">
            <span class="text-gray-600">تذكرني</span>
          </label>
          <a href="#" class="text-blue-600 hover:text-blue-700 transition-colors">
            نسيت كلمة المرور؟
          </a>
        </div>
        
        <BaseButton 
          type="submit" 
          :loading="loading" 
          loadingText="جاري تسجيل الدخول..."
          block
          class="btn-primary-enhanced"
        >
          <span v-if="!loading" class="flex items-center justify-center gap-2">
            <span>تسجيل الدخول</span>
            <span class="text-lg">→</span>
          </span>
        </BaseButton>
      </form>
      
      <!-- Divider -->
      <div class="divider-container">
        <div class="divider-line"></div>
        <span class="divider-text">أو متابعة بـ</span>
        <div class="divider-line"></div>
      </div>
      
      <!-- Social Buttons -->
      <div class="social-buttons">
        <BaseButton 
          variant="outline" 
          block
          @click="handleGoogleLogin"
          :loading="googleLoading"
          class="social-btn google-btn"
        >
          <span class="flex items-center justify-center gap-3">
            <span class="text-xl">🔴</span>
            <span>Google</span>
          </span>
        </BaseButton>
        
        <BaseButton 
          variant="outline" 
          block
          @click="$router.push('/auth/phone-login')"
          class="social-btn phone-btn"
        >
          <span class="flex items-center justify-center gap-3">
            <span class="text-xl">📱</span>
            <span>رقم الهاتف</span>
          </span>
        </BaseButton>
      </div>
      
      <!-- Footer -->
      <div class="form-footer">
        <span class="text-gray-600">ليس لديك حساب؟ </span>
        <button 
          @click="$router.push('/auth/register')"
          class="link-button"
        >
          إنشاء حساب جديد
        </button>
      </div>
    </div>
    
    <!-- Error Message -->
    <div v-if="error" class="error-card">
      <div class="flex items-center gap-2">
        <span class="text-xl">⚠️</span>
        <span>{{ error }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { BaseInput, BaseButton } from '@/components/common'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const loading = ref(false)
const googleLoading = ref(false)
const error = ref('')
const rememberMe = ref(false)
const emailError = ref('')
const passwordError = ref('')

// معالجة redirect result عند تحميل الصفحة
onMounted(async () => {
  try {
    const result = await authStore.handleRedirectResult()
    if (result.success) {
      handleSuccessfulAuth()
    }
  } catch (err) {
    console.error('Redirect result error:', err)
  }
})

function handleSuccessfulAuth() {
  const user = authStore.userProfile
  const userRole = user?.primary_role
  
  if (!user?.is_verified) {
    router.push('/auth/pending-approval')
  } else if (!userRole) {
    router.push('/auth/role-setup')
  } else {
    // توجيه حسب الدور
    switch (userRole) {
      case 'super_admin':
        router.push('/app/admin')
        break
      case 'marketing_coordinator':
        router.push('/app/tasks')
        break
      case 'brand_coordinator':
        router.push('/app/brand/dashboard')
        break
      case 'photographer':
        router.push('/app/photographer/tasks/current')
        break
      default:
        router.push('/app/dashboard')
    }
  }
}

async function handleSubmit() {
  // مسح الأخطاء السابقة
  emailError.value = ''
  passwordError.value = ''
  error.value = ''
  
  // التحقق من البيانات
  if (!email.value) {
    emailError.value = 'البريد الإلكتروني مطلوب'
    return
  }
  
  if (!email.value.includes('@')) {
    emailError.value = 'البريد الإلكتروني غير صحيح'
    return
  }
  
  if (!password.value) {
    passwordError.value = 'كلمة المرور مطلوبة'
    return
  }
  
  if (password.value.length < 6) {
    passwordError.value = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'
    return
  }
  
  loading.value = true
  
  try {
    const result = await authStore.login({
      email: email.value,
      password: password.value,
      remember_me: rememberMe.value
    })
    
    if (result.success) {
      handleSuccessfulAuth()
    } else {
      error.value = result.error || 'خطأ في تسجيل الدخول'
    }
  } catch (err: any) {
    console.error('Login error:', err)
    error.value = 'حدث خطأ غير متوقع، حاول مرة أخرى'
  } finally {
    loading.value = false
  }
}

async function handleGoogleLogin() {
  googleLoading.value = true
  error.value = ''
  
  try {
    const result = await authStore.loginWithGoogle()
    
    if (result.success) {
      if (result.message) {
        // إذا كان redirect، أعطي رسالة للمستخدم
        error.value = result.message
        // سيتم معالجة النتيجة في onMounted
      } else {
        // تم تسجيل الدخول مباشرة
        handleSuccessfulAuth()
      }
    } else {
      error.value = result.error || 'فشل تسجيل الدخول بـ Google'
    }
  } catch (err: any) {
    console.error('Google login error:', err)
    
    // تحسين رسائل الخطأ
    if (err.code === 'auth/popup-blocked') {
      error.value = 'تم حظر النافذة المنبثقة. يرجى السماح للنوافذ المنبثقة وإعادة المحاولة'
    } else if (err.code === 'auth/popup-closed-by-user') {
      error.value = 'تم إلغاء تسجيل الدخول'
    } else {
      error.value = 'فشل تسجيل الدخول بـ Google'
    }
  } finally {
    googleLoading.value = false
  }
}
</script>

<style scoped>
.login-container {
  max-width: 420px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Logo & Header */
.logo-container {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}

.logo-gradient {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
  animation: logoFloat 3s ease-in-out infinite;
}

@keyframes logoFloat {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.welcome-title {
  font-size: 28px;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.welcome-subtitle {
  color: #718096;
  font-size: 16px;
  font-weight: 500;
}

/* Form Card */
.form-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 32px;
  box-shadow: 
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.space-y-5 > * + * {
  margin-top: 20px;
}

/* Enhanced Button */
.btn-primary-enhanced {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  padding: 16px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 16px;
  color: white;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.btn-primary-enhanced:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.6);
}

/* Custom Checkbox */
.checkbox-custom {
  width: 18px;
  height: 18px;
  border-radius: 4px;
  border: 2px solid #e2e8f0;
  transition: all 0.2s;
}

.checkbox-custom:checked {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: #667eea;
}

/* Divider */
.divider-container {
  display: flex;
  align-items: center;
  margin: 32px 0;
}

.divider-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
}

.divider-text {
  padding: 0 16px;
  color: #a0aec0;
  font-size: 14px;
  font-weight: 500;
}

/* Social Buttons */
.social-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.social-btn {
  padding: 14px;
  border-radius: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
  border: 1.5px solid #e2e8f0;
}

.google-btn:hover {
  border-color: #db4437;
  background: rgba(219, 68, 55, 0.05);
  transform: translateY(-1px);
}

.phone-btn:hover {
  border-color: #25d366;
  background: rgba(37, 211, 102, 0.05);
  transform: translateY(-1px);
}

/* Footer */
.form-footer {
  text-align: center;
  font-size: 15px;
}

.link-button {
  color: #667eea;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s;
  border: none;
  background: none;
  cursor: pointer;
}

.link-button:hover {
  color: #764ba2;
  text-decoration: underline;
}

/* Error Card */
.error-card {
  margin-top: 20px;
  background: rgba(254, 226, 226, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid #fca5a5;
  color: #dc2626;
  padding: 16px;
  border-radius: 12px;
  font-weight: 500;
}

/* Responsive */
@media (max-width: 480px) {
  .login-container {
    padding: 0 16px;
  }
  
  .form-card {
    padding: 24px 20px;
    border-radius: 16px;
  }
  
  .welcome-title {
    font-size: 24px;
  }
  
  .logo-gradient {
    width: 60px;
    height: 60px;
    font-size: 24px;
  }
}

/* Flex utilities */
.flex {
  display: flex;
}

.items-center {
  align-items: center;
}

.justify-center {
  justify-content: center;
}

.justify-between {
  justify-content: space-between;
}

.gap-2 {
  gap: 8px;
}

.gap-3 {
  gap: 12px;
}
</style> 
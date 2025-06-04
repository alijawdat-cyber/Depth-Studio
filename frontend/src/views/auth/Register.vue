<template>
  <div class="register-container">
    <!-- Header -->
    <div class="text-center mb-8">
      <div class="icon-container">
        <div class="register-icon">✨</div>
      </div>
      <h2 class="page-title">انضم إلينا اليوم</h2>
      <p class="page-subtitle">أنشئ حسابك وابدأ رحلتك الإبداعية</p>
    </div>
    
    <!-- Form Card -->
    <div class="form-card">
      <form @submit.prevent="handleSubmit" class="space-y-5">
        <!-- Name Fields -->
        <div class="name-grid">
          <BaseInput
            v-model="firstName"
            type="text"
            label="الاسم الأول"
            placeholder="أحمد"
            required
            class="input-enhanced"
          />
          
          <BaseInput
            v-model="lastName"
            type="text"
            label="الاسم الأخير"
            placeholder="علي"
            required
            class="input-enhanced"
          />
        </div>
        
        <!-- Contact Fields -->
        <BaseInput
          v-model="email"
          type="email"
          label="البريد الإلكتروني"
          placeholder="example@domain.com"
          required
          class="input-enhanced"
        />
        
        <BaseInput
          v-model="phone"
          type="tel"
          label="رقم الهاتف (اختياري)"
          placeholder="+964 750 123 4567"
          class="input-enhanced"
        />
        
        <!-- Password Fields -->
        <BaseInput
          v-model="password"
          type="password"
          label="كلمة المرور"
          placeholder="••••••••"
          required
          class="input-enhanced"
        />
        
        <BaseInput
          v-model="confirmPassword"
          type="password"
          label="تأكيد كلمة المرور"
          placeholder="••••••••"
          required
          class="input-enhanced"
        />
        
        <!-- Terms Agreement -->
        <div class="terms-section">
          <label class="terms-checkbox">
            <input v-model="agreeToTerms" type="checkbox" required class="checkbox-custom">
            <span class="checkmark"></span>
            <span class="terms-text">
              أوافق على 
              <a href="#" class="link-styled">الشروط والأحكام</a>
              و
              <a href="#" class="link-styled">سياسة الخصوصية</a>
            </span>
          </label>
        </div>
        
        <!-- Submit Button -->
        <BaseButton 
          type="submit" 
          :loading="loading" 
          block
          class="submit-btn"
        >
          <span v-if="!loading" class="flex items-center justify-center gap-2">
            <span>إنشاء الحساب</span>
            <span class="text-lg">🚀</span>
          </span>
        </BaseButton>
      </form>
      
      <!-- Divider -->
      <div class="divider-container">
        <div class="divider-line"></div>
        <span class="divider-text">أو انضم بـ</span>
        <div class="divider-line"></div>
      </div>
      
      <!-- Google Registration -->
      <BaseButton 
        variant="outline" 
        block
        @click="handleGoogleRegister"
        :loading="googleLoading"
        class="google-btn"
      >
        <span class="flex items-center justify-center gap-3">
          <span class="text-xl">🔴</span>
          <span>التسجيل بـ Google</span>
        </span>
      </BaseButton>
      
      <!-- Footer -->
      <div class="form-footer">
        <span class="text-gray-600">لديك حساب بالفعل؟ </span>
        <button 
          @click="$router.push('/auth/login')"
          class="link-button"
        >
          تسجيل الدخول
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { BaseInput, BaseButton } from '@/components/common'

const router = useRouter()
const authStore = useAuthStore()

const firstName = ref('')
const lastName = ref('')
const email = ref('')
const phone = ref('')
const password = ref('')
const confirmPassword = ref('')
const agreeToTerms = ref(false)
const loading = ref(false)
const googleLoading = ref(false)
const error = ref('')

async function handleSubmit() {
  // تحقق من البيانات
  if (!firstName.value || !lastName.value || !email.value || !password.value) {
    error.value = 'يرجى ملء جميع الحقول المطلوبة'
    return
  }
  
  if (password.value !== confirmPassword.value) {
    error.value = 'كلمات المرور غير متطابقة'
    return
  }
  
  if (!agreeToTerms.value) {
    error.value = 'يجب الموافقة على الشروط والأحكام'
    return
  }
  
  loading.value = true
  error.value = ''
  
  try {
    const result = await authStore.register({
      email: email.value,
      password: password.value,
      first_name: firstName.value,
      last_name: lastName.value,
      phone: phone.value,
      primary_role: 'photographer'  // افتراضي، سيتم تغييره في RoleSetup
    })
    
    if (result.success) {
      router.push('/auth/role-setup')
    } else {
      error.value = result.error || 'خطأ في إنشاء الحساب'
    }
  } catch (err: any) {
    error.value = 'خطأ في إنشاء الحساب'
    console.error('Register error:', err)
  } finally {
    loading.value = false
  }
}

async function handleGoogleRegister() {
  if (!agreeToTerms.value) {
    error.value = 'يجب الموافقة على الشروط والأحكام'
    return
  }
  
  googleLoading.value = true
  error.value = ''
  
  try {
    const result = await authStore.loginWithGoogle()
    
    if (result.success) {
      router.push('/auth/role-setup')
    } else {
      error.value = 'فشل التسجيل بـ Google'
    }
  } catch (err: any) {
    error.value = 'فشل التسجيل بـ Google'
    console.error('Google register error:', err)
  } finally {
    googleLoading.value = false
  }
}
</script>

<style scoped>
.register-container {
  max-width: 480px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Header */
.icon-container {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.register-icon {
  width: 75px;
  height: 75px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
  animation: sparkle 2s ease-in-out infinite;
}

@keyframes sparkle {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.page-title {
  font-size: 26px;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-subtitle {
  color: #718096;
  font-size: 16px;
  font-weight: 500;
}

/* Form Card */
.form-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 28px;
  box-shadow: 
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.space-y-5 > * + * {
  margin-top: 20px;
}

/* Name Grid */
.name-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

@media (max-width: 640px) {
  .name-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}

/* Terms Section */
.terms-section {
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.terms-checkbox {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
  line-height: 1.5;
}

.checkbox-custom {
  position: absolute;
  opacity: 0;
  cursor: pointer;
}

.checkmark {
  position: relative;
  top: 2px;
  height: 20px;
  width: 20px;
  background-color: white;
  border: 2px solid #d1d5db;
  border-radius: 4px;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.terms-checkbox:hover .checkmark {
  border-color: #667eea;
}

.checkbox-custom:checked ~ .checkmark {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: #667eea;
}

.checkmark:after {
  content: "";
  position: absolute;
  display: none;
  left: 6px;
  top: 2px;
  width: 6px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.checkbox-custom:checked ~ .checkmark:after {
  display: block;
}

.terms-text {
  font-size: 14px;
  color: #4b5563;
}

.link-styled {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s;
}

.link-styled:hover {
  color: #764ba2;
  text-decoration: underline;
}

/* Submit Button */
.submit-btn {
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

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.6);
}

/* Divider */
.divider-container {
  display: flex;
  align-items: center;
  margin: 28px 0;
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

/* Google Button */
.google-btn {
  padding: 14px;
  border-radius: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
  border: 1.5px solid #e2e8f0;
  margin-bottom: 20px;
}

.google-btn:hover {
  border-color: #db4437;
  background: rgba(219, 68, 55, 0.05);
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

/* Utilities */
.flex {
  display: flex;
}

.items-center {
  align-items: center;
}

.justify-center {
  justify-content: center;
}

.gap-2 {
  gap: 8px;
}

.gap-3 {
  gap: 12px;
}

/* Responsive */
@media (max-width: 640px) {
  .register-container {
    padding: 0 16px;
  }
  
  .form-card {
    padding: 20px 16px;
    border-radius: 16px;
  }
  
  .page-title {
    font-size: 22px;
  }
  
  .register-icon {
    width: 60px;
    height: 60px;
    font-size: 24px;
  }
}
</style> 
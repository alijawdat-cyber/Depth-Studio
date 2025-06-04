<template>
  <div class="phone-login-container">
    <!-- Header -->
    <div class="text-center mb-8">
      <div class="icon-container">
        <div class="phone-icon">📱</div>
      </div>
      <h2 class="page-title">تسجيل دخول سريع</h2>
      <p class="page-subtitle">استخدم رقم هاتفك للدخول بسهولة</p>
    </div>
    
    <!-- Form Card -->
    <div class="form-card">
      <!-- Phone Number Step -->
      <div v-if="step === 'phone'" class="step-container">
        <div class="step-header">
          <div class="step-indicator">
            <span class="step-number active">1</span>
            <div class="step-line"></div>
            <span class="step-number">2</span>
          </div>
          <p class="step-title">أدخل رقم هاتفك</p>
        </div>
        
        <form @submit.prevent="sendCode" class="space-y-5">
          <div class="phone-input-section">
            <label class="input-label">رقم الهاتف العراقي</label>
            <div class="phone-input-container">
              <div class="country-code">
                <span class="flag">🇮🇶</span>
                <span class="code">+964</span>
              </div>
              <input
                v-model="phoneNumber"
                type="tel"
                placeholder="7XX XXX XXXX"
                class="phone-input"
                maxlength="10"
                required
              />
            </div>
            <p class="input-hint">
              أدخل رقمك بدون الصفر الأول (مثال: 7501234567)
            </p>
          </div>
          
          <BaseButton 
            type="submit" 
            :loading="loading" 
            block
            :disabled="!isValidPhone"
            class="submit-btn"
          >
            <span v-if="!loading" class="flex items-center justify-center gap-2">
              <span>إرسال رمز التحقق</span>
              <span class="text-lg">📨</span>
            </span>
          </BaseButton>
        </form>
        
        <div class="step-footer">
          <button 
            @click="$router.push('/auth/login')"
            class="back-link"
          >
            ← العودة للتسجيل بالبريد
          </button>
        </div>
      </div>
      
      <!-- Verification Step -->
      <div v-else-if="step === 'verification'" class="step-container">
        <div class="step-header">
          <div class="step-indicator">
            <span class="step-number completed">✓</span>
            <div class="step-line completed"></div>
            <span class="step-number active">2</span>
          </div>
          <p class="step-title">تأكيد رمز التحقق</p>
          <p class="verification-info">
            تم إرسال رمز لـ <span class="phone-display">+964 {{ phoneNumber }}</span>
          </p>
        </div>
        
        <form @submit.prevent="verifyCode" class="space-y-5">
          <BaseInput
            v-model="verificationCode"
            type="text"
            label="رمز التحقق (6 أرقام)"
            placeholder="123456"
            maxlength="6"
            required
            class="verification-input"
          />
          
          <BaseButton 
            type="submit" 
            :loading="loading" 
            block
            class="submit-btn"
            :disabled="verificationCode.length !== 6"
          >
            <span v-if="!loading" class="flex items-center justify-center gap-2">
              <span>تأكيد وتسجيل الدخول</span>
              <span class="text-lg">🔓</span>
            </span>
          </BaseButton>
        </form>
        
        <div class="verification-actions">
          <button 
            @click="step = 'phone'"
            class="action-link"
          >
            🔄 تغيير رقم الهاتف
          </button>
          
          <button 
            v-if="canResend"
            @click="sendCode"
            class="action-link resend"
          >
            📤 إعادة إرسال الرمز
          </button>
          <span v-else class="resend-timer">
            إعادة الإرسال خلال {{ resendTimer }}s
          </span>
        </div>
      </div>
    </div>
    
    <!-- reCAPTCHA Container (مخفي) -->
    <div id="recaptcha-container" style="display: none;"></div>
    
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { BaseInput, BaseButton } from '@/components/common'

const router = useRouter()
const authStore = useAuthStore()

const step = ref<'phone' | 'verification'>('phone')
const phoneNumber = ref('')
const verificationCode = ref('')
const loading = ref(false)
const error = ref('')
const resendTimer = ref(0)
const canResend = ref(true)

let resendInterval: any = null

const isValidPhone = computed(() => {
  // التحقق من رقم الهاتف العراقي
  return /^7[0-9]{9}$/.test(phoneNumber.value)
})

async function sendCode() {
  if (!isValidPhone.value) {
    error.value = 'رقم الهاتف غير صحيح'
    return
  }
  
  loading.value = true
  error.value = ''
  
  try {
    // استخدام Firebase Phone Auth الحقيقي
    const result = await authStore.sendPhoneVerification(`+964${phoneNumber.value}`)
    
    if (result.success) {
      step.value = 'verification'
      startResendTimer()
      console.log('تم إرسال رمز التحقق بنجاح')
    } else {
      error.value = result.error || 'فشل في إرسال رمز التحقق'
    }
    
  } catch (err: any) {
    error.value = 'فشل في إرسال رمز التحقق'
    console.error('Send code error:', err)
  } finally {
    loading.value = false
  }
}

async function verifyCode() {
  if (verificationCode.value.length !== 6) {
    error.value = 'رمز التحقق يجب أن يكون 6 أرقام'
    return
  }
  
  loading.value = true
  error.value = ''
  
  try {
    // استخدام Firebase Phone Auth الحقيقي
    const result = await authStore.verifyPhoneCode(verificationCode.value)
    
    if (result.success) {
      const user = authStore.userProfile
      if (!user?.primary_role) {
        router.push('/auth/role-setup')
      } else {
        // توجيه حسب الدور
        switch (user.primary_role) {
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
    } else {
      error.value = result.error || 'رمز التحقق غير صحيح'
    }
    
  } catch (err: any) {
    error.value = 'رمز التحقق غير صحيح'
    console.error('Verify code error:', err)
  } finally {
    loading.value = false
  }
}

function startResendTimer() {
  canResend.value = false
  resendTimer.value = 60
  
  resendInterval = setInterval(() => {
    resendTimer.value--
    if (resendTimer.value <= 0) {
      canResend.value = true
      clearInterval(resendInterval)
    }
  }, 1000)
}

onMounted(() => {
  // إعداد reCAPTCHA عند تحميل الصفحة
  authStore.setupRecaptcha('recaptcha-container')
})

onUnmounted(() => {
  // تنظيف المؤقت عند مغادرة الصفحة
  if (resendInterval) {
    clearInterval(resendInterval)
  }
})
</script>

<style scoped>
.phone-login-container {
  max-width: 450px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Header */
.icon-container {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.phone-icon {
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, #25d366 0%, #128c7e 100%);
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  box-shadow: 0 8px 25px rgba(37, 211, 102, 0.3);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.page-title {
  font-size: 26px;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 8px;
  background: linear-gradient(135deg, #25d366 0%, #128c7e 100%);
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

/* Step System */
.step-container {
  width: 100%;
}

.step-header {
  text-align: center;
  margin-bottom: 28px;
}

.step-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.step-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  background: #e5e7eb;
  color: #9ca3af;
  transition: all 0.3s ease;
}

.step-number.active {
  background: linear-gradient(135deg, #25d366 0%, #128c7e 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(37, 211, 102, 0.3);
}

.step-number.completed {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.step-line {
  width: 60px;
  height: 2px;
  background: #e5e7eb;
  margin: 0 12px;
  transition: all 0.3s ease;
}

.step-line.completed {
  background: linear-gradient(90deg, #10b981, #25d366);
}

.step-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 8px;
}

.verification-info {
  color: #6b7280;
  font-size: 14px;
}

.phone-display {
  font-weight: 600;
  color: #25d366;
}

.space-y-5 > * + * {
  margin-top: 20px;
}

/* Phone Input */
.phone-input-section {
  margin-bottom: 20px;
}

.input-label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.phone-input-container {
  display: flex;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  transition: border-color 0.3s ease;
}

.phone-input-container:focus-within {
  border-color: #25d366;
  box-shadow: 0 0 0 3px rgba(37, 211, 102, 0.1);
}

.country-code {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #f8fafc;
  border-right: 1px solid #e5e7eb;
  font-weight: 500;
  color: #374151;
}

.flag {
  font-size: 18px;
}

.phone-input {
  flex: 1;
  padding: 12px 16px;
  border: none;
  outline: none;
  font-size: 16px;
  background: white;
}

.input-hint {
  margin-top: 8px;
  font-size: 12px;
  color: #6b7280;
}

/* Submit Button */
.submit-btn {
  background: linear-gradient(135deg, #25d366 0%, #128c7e 100%);
  border: none;
  padding: 16px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 16px;
  color: white;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(37, 211, 102, 0.4);
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(37, 211, 102, 0.6);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

/* Step Footer */
.step-footer {
  text-align: center;
  margin-top: 24px;
}

.back-link {
  color: #6b7280;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s;
  border: none;
  background: none;
  cursor: pointer;
}

.back-link:hover {
  color: #25d366;
}

/* Verification Actions */
.verification-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.action-link {
  color: #25d366;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  border: none;
  background: none;
  cursor: pointer;
}

.action-link:hover {
  color: #128c7e;
  text-decoration: underline;
}

.resend-timer {
  color: #9ca3af;
  font-size: 14px;
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

/* Responsive */
@media (max-width: 640px) {
  .phone-login-container {
    padding: 0 16px;
  }
  
  .form-card {
    padding: 20px 16px;
    border-radius: 16px;
  }
  
  .page-title {
    font-size: 22px;
  }
  
  .phone-icon {
    width: 60px;
    height: 60px;
    font-size: 24px;
  }
  
  .verification-actions {
    flex-direction: column;
    gap: 12px;
  }
}
</style> 
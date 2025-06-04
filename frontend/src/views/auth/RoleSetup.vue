<template>
  <div class="role-setup-container">
    <!-- Header -->
    <div class="text-center mb-8">
      <div class="icon-container">
        <div class="setup-icon">🎯</div>
      </div>
      <h2 class="page-title">اختر دورك المناسب</h2>
      <p class="page-subtitle">حدد دورك في Depth Studio لبدء رحلتك معنا</p>
    </div>
    
    <!-- Form Card -->
    <div class="form-card">
      <!-- Role Options -->
      <div class="roles-grid mb-6">
        <!-- مصور -->
        <label class="role-card" :class="{ 'selected': selectedRole === 'photographer' }">
          <input v-model="selectedRole" type="radio" value="photographer" class="sr-only">
          <div class="role-header">
            <div class="role-icon">📸</div>
            <div class="role-badge" v-if="selectedRole === 'photographer'">✓</div>
          </div>
          <div class="role-body">
            <h3 class="role-title">مصور</h3>
            <p class="role-desc">التقط صور عالية الجودة للبراندات والعملاء</p>
            <div class="role-features">
              <span class="feature">إدارة المشاريع</span>
              <span class="feature">تحرير الصور</span>
            </div>
          </div>
        </label>
        
        <!-- منسق براند -->
        <label class="role-card" :class="{ 'selected': selectedRole === 'brand_coordinator' }">
          <input v-model="selectedRole" type="radio" value="brand_coordinator" class="sr-only">
          <div class="role-header">
            <div class="role-icon">🏢</div>
            <div class="role-badge" v-if="selectedRole === 'brand_coordinator'">✓</div>
          </div>
          <div class="role-body">
            <h3 class="role-title">منسق براند</h3>
            <p class="role-desc">أدِر حملات ومحتوى براند محدد</p>
            <div class="role-features">
              <span class="feature">إدارة المحتوى</span>
              <span class="feature">تنسيق الحملات</span>
            </div>
          </div>
        </label>
        
        <!-- منسق تسويق -->
        <label class="role-card" :class="{ 'selected': selectedRole === 'marketing_coordinator' }">
          <input v-model="selectedRole" type="radio" value="marketing_coordinator" class="sr-only">
          <div class="role-header">
            <div class="role-icon">📊</div>
            <div class="role-badge" v-if="selectedRole === 'marketing_coordinator'">✓</div>
          </div>
          <div class="role-body">
            <h3 class="role-title">منسق تسويق</h3>
            <p class="role-desc">أدِر العمليات التسويقية والفرق</p>
            <div class="role-features">
              <span class="feature">تحليل البيانات</span>
              <span class="feature">إدارة الفرق</span>
            </div>
          </div>
        </label>
      </div>

      <!-- Experience Input -->
      <div v-if="selectedRole" class="experience-section">
        <BaseInput
          v-model="experience"
          type="text"
          label="خبرتك في هذا المجال (اختياري)"
          placeholder="مثال: 3 سنوات خبرة في التصوير التجاري"
          class="experience-input"
        />
      </div>
      
      <!-- Submit Button -->
      <BaseButton 
        :loading="loading" 
        block
        class="submit-btn"
        :disabled="!selectedRole"
        @click="handleSubmit"
      >
        <span v-if="!loading" class="flex items-center justify-center gap-2">
          <span>المتابعة</span>
          <span class="text-lg">→</span>
        </span>
      </BaseButton>
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

const selectedRole = ref<'photographer' | 'brand_coordinator' | 'marketing_coordinator' | ''>('')
const experience = ref('')
const loading = ref(false)
const error = ref('')

async function handleSubmit() {
  if (!selectedRole.value) {
    error.value = 'يرجى اختيار دور'
    return
  }
  
  loading.value = true
  error.value = ''
  
  try {
    // تحديث دور المستخدم
    const result = await authStore.updateUserRole(selectedRole.value, {
      experience: experience.value
    })
    
    if (result.success) {
      // توجيه لصفحة انتظار الموافقة
      router.push('/auth/pending-approval')
    } else {
      error.value = result.error || 'فشل في حفظ الدور'
    }
  } catch (err: any) {
    error.value = 'فشل في حفظ الدور'
    console.error('Role setup error:', err)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.role-setup-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Header */
.icon-container {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.setup-icon {
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
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

/* Roles Grid */
.roles-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 640px) {
  .roles-grid {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  }
}

/* Role Cards */
.role-card {
  position: relative;
  display: block;
  padding: 20px;
  border: 2px solid #e5e7eb;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
  overflow: hidden;
}

.role-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea, #764ba2);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.role-card:hover {
  border-color: #c7d2fe;
  background: #fafbff;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.15);
}

.role-card:hover::before {
  transform: scaleX(1);
}

.role-card.selected {
  border-color: #667eea;
  background: linear-gradient(135deg, #f0f4ff 0%, #e0e7ff 100%);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.2);
}

.role-card.selected::before {
  transform: scaleX(1);
}

/* Role Header */
.role-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.role-icon {
  width: 50px;
  height: 50px;
  background: #f8fafc;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  transition: all 0.3s ease;
}

.role-card.selected .role-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  transform: scale(1.1);
}

.role-badge {
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  font-weight: bold;
}

/* Role Body */
.role-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 6px;
}

.role-desc {
  color: #6b7280;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 12px;
}

.role-features {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.feature {
  background: #e0e7ff;
  color: #4338ca;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

.role-card.selected .feature {
  background: rgba(255, 255, 255, 0.8);
  color: #667eea;
}

/* Experience Section */
.experience-section {
  margin: 24px 0;
  padding: 20px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
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

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.6);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
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
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

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
  .role-setup-container {
    padding: 0 16px;
  }
  
  .form-card {
    padding: 20px 16px;
    border-radius: 16px;
  }
  
  .page-title {
    font-size: 22px;
  }
  
  .setup-icon {
    width: 60px;
    height: 60px;
    font-size: 24px;
  }
  
  .role-card {
    padding: 16px;
  }
}
</style> 
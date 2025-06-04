<template>
  <div class="text-center">
    <div class="mb-6">
      <div class="approval-icon">⏰</div>
      <h2 class="text-xl font-semibold mb-2">طلبك قيد المراجعة</h2>
      <p class="text-gray-600">يرجى انتظار موافقة الإدارة على دورك المطلوب</p>
    </div>
    
    <!-- تفاصيل الطلب -->
    <div class="approval-info mb-6">
      <div class="info-item">
        <span class="label">الدور المطلوب:</span>
        <span class="value">{{ roleDisplayName }}</span>
      </div>
      <div class="info-item">
        <span class="label">تاريخ التقديم:</span>
        <span class="value">{{ submissionDate }}</span>
      </div>
      <div class="info-item">
        <span class="label">البريد الإلكتروني:</span>
        <span class="value">{{ userEmail }}</span>
      </div>
    </div>
    
    <!-- معلومات الوقت -->
    <div class="timeline-card mb-6">
      <h3 class="card-title">الوقت المتوقع للمراجعة</h3>
      <div class="time-estimate">24-48 ساعة</div>
      <p class="time-details">تتم مراجعة الطلبات خلال أيام العمل (الأحد - الخميس)</p>
    </div>
    
    <!-- أزرار العمل -->
    <div class="action-buttons">
      <BaseButton 
        variant="outline"
        @click="refreshStatus"
        :loading="isRefreshing"
        class="mb-3"
      >
        🔄 تحديث الحالة
      </BaseButton>
      
      <BaseButton 
        variant="outline"
        @click="contactSupport"
        class="mb-3"
      >
        📞 تواصل مع الدعم
      </BaseButton>
      
      <BaseButton 
        variant="outline"
        @click="logout"
      >
        🚪 تسجيل خروج
      </BaseButton>
    </div>
    
    <!-- رسالة حالة -->
    <div v-if="statusMessage" class="mt-4 p-3 rounded" :class="statusClass">
      {{ statusMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { BaseButton } from '@/components/common'

const router = useRouter()
const authStore = useAuthStore()

const isRefreshing = ref(false)
const statusMessage = ref('')
const statusType = ref<'success' | 'error' | 'info'>('info')

const userProfile = computed(() => authStore.userProfile)
const userEmail = computed(() => authStore.user?.email || '')

const roleDisplayName = computed(() => {
  const role = userProfile.value?.primary_role
  const roleNames = {
    photographer: 'مصور',
    brand_coordinator: 'منسق براند',
    marketing_coordinator: 'منسق تسويق'
  }
  return roleNames[role as keyof typeof roleNames] || 'غير محدد'
})

const submissionDate = computed(() => {
  const createdAt = userProfile.value?.created_at
  if (!createdAt) return 'غير متوفر'
  
  try {
    // التعامل مع Firebase Timestamp
    const date = createdAt.toDate ? createdAt.toDate() : new Date()
    return date.toLocaleDateString('ar-IQ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch {
    return 'غير متوفر'
  }
})

const statusClass = computed(() => {
  return {
    'bg-green-100 border border-green-400 text-green-700': statusType.value === 'success',
    'bg-red-100 border border-red-400 text-red-700': statusType.value === 'error',
    'bg-blue-100 border border-blue-400 text-blue-700': statusType.value === 'info'
  }
})

async function refreshStatus() {
  isRefreshing.value = true
  statusMessage.value = ''
  
  try {
    // محاكاة تحديث الحالة
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // في التطبيق الحقيقي سيتم تحميل ملف المستخدم من قاعدة البيانات
    if (authStore.user?.uid) {
      await authStore.loadUserProfile(authStore.user.uid)
    }
    
    // فحص حالة الموافقة من is_verified بدلاً من status
    const user = authStore.userProfile
    if (user?.is_verified) {
      statusMessage.value = 'تم الموافقة على طلبك! سيتم توجيهك للوحة التحكم'
      statusType.value = 'success'
      
      setTimeout(() => {
        router.push('/app/dashboard')
      }, 2000)
    } else {
      statusMessage.value = 'لا يزال طلبك قيد المراجعة'
      statusType.value = 'info'
    }
    
  } catch (error) {
    statusMessage.value = 'حدث خطأ في تحديث الحالة'
    statusType.value = 'error'
    console.error('Refresh status error:', error)
  } finally {
    isRefreshing.value = false
  }
}

function contactSupport() {
  window.location.href = 'mailto:support@depthstudio.com'
}

async function logout() {
  await authStore.logout()
  router.push('/auth/login')
}

onMounted(() => {
  // التحقق من وجود المستخدم
  if (!authStore.user) {
    router.push('/auth/login')
    return
  }
  
  // إذا كان معتمد بالفعل، توجيه للوحة التحكم
  if (userProfile.value?.is_verified) {
    router.push('/app/dashboard')
  }
})
</script>

<style scoped>
.approval-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.approval-info {
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #e5e7eb;
}

.info-item:last-child {
  border-bottom: none;
}

.label {
  font-weight: 600;
  color: #374151;
}

.value {
  color: #6b7280;
}

.timeline-card {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 12px;
  padding: 20px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e40af;
  margin-bottom: 8px;
}

.time-estimate {
  font-size: 24px;
  font-weight: 700;
  color: #2563eb;
  margin-bottom: 8px;
}

.time-details {
  color: #3730a3;
  font-size: 14px;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style> 
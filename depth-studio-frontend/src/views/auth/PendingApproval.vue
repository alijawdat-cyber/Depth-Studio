<template>
  <v-container class="fill-height">
    <v-row justify="center" align="center">
      <v-col cols="12" sm="8" md="6">
        <v-card class="pa-6 text-center">
          <!-- Logo -->
          <v-img
            src="/logo-depth-studio.png"
            alt="Depth Studio"
            height="40"
            width="150"
            contain
            class="mx-auto mb-4"
          />
          
          <!-- Main Icon -->
          <v-icon size="80" color="warning" class="mb-4">
            mdi-clock-outline
          </v-icon>

          <!-- Title -->
          <h2 class="mb-4">طلبك قيد المراجعة</h2>
          <p class="text-body-1 mb-6 text-medium-emphasis">
            تم إرسال طلب تسجيلك بنجاح وهو الآن قيد المراجعة من قبل فريق الإدارة
          </p>

          <!-- Info Alert -->
          <v-alert type="info" variant="outlined" class="text-start mb-6">
            <strong>معلومات مهمة:</strong>
            <ul class="mt-2">
              <li>⏱️ وقت المراجعة: عادة من 24-48 ساعة</li>
              <li>📧 ستتلقى بريد إلكتروني فور الموافقة</li>
              <li>🔒 حالة الحساب: محفوظ وآمن في النظام</li>
            </ul>
          </v-alert>

          <!-- Progress Steps -->
          <v-card variant="outlined" class="mb-6">
            <v-card-title class="text-center">مراحل العملية</v-card-title>
            <v-card-text>
              <v-stepper v-model="currentStep" alt-labels non-linear class="elevation-0">
                <v-stepper-header>
                  <v-stepper-item :complete="true" step="1" title="التسجيل" />
                  <v-divider />
                  <v-stepper-item :complete="true" step="2" title="إعداد الدور" />
                  <v-divider />
                  <v-stepper-item :complete="false" step="3" title="مراجعة الإدارة" color="warning" />
                  <v-divider />
                  <v-stepper-item :complete="false" step="4" title="تفعيل الحساب" />
                </v-stepper-header>
              </v-stepper>
            </v-card-text>
          </v-card>

          <!-- Actions -->
          <div class="d-flex flex-column gap-3">
            <v-btn
              color="primary"
              variant="outlined"
              size="large"
              @click="goToLogin"
              block
            >
              <v-icon start>mdi-login</v-icon>
              العودة لتسجيل الدخول
            </v-btn>
            
            <v-btn
              color="grey"
              variant="outlined"
              size="large"
              @click="refreshStatus"
              :loading="isRefreshing"
              block
            >
              <v-icon start>mdi-refresh</v-icon>
              تحديث الحالة
            </v-btn>

            <v-btn
              color="error"
              variant="outlined"
              @click="handleSignOut"
              block
            >
              <v-icon start>mdi-logout</v-icon>
              تسجيل خروج كامل
            </v-btn>
          </div>

          <!-- Contact Support -->
          <v-divider class="my-4" />
          <p class="text-caption text-medium-emphasis mb-2">
            تحتاج مساعدة؟
          </p>
          <v-btn
            color="info"
            variant="text"
            @click="contactSupport"
            size="small"
          >
            <v-icon start>mdi-email</v-icon>
            تواصل مع فريق الدعم
          </v-btn>
        </v-card>
      </v-col>
    </v-row>

    <!-- Snackbar -->
    <v-snackbar
      v-model="showSnackbar"
      :color="snackbarColor"
      timeout="3000"
    >
      {{ snackbarMessage }}
      <template v-slot:actions>
        <v-btn variant="text" @click="showSnackbar = false">
          إغلاق
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { db } from '@/firebase/config'
import { doc, getDoc } from 'firebase/firestore'

// === Router وComposables ===
const router = useRouter()
const { userProfile, trackUserAction, signOut } = useAuth()

// === Reactive Data ===
const currentStep = ref(3)
const isRefreshing = ref(false)
const showSnackbar = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref('info')
const currentStatus = ref('pending_approval')
const userRole = ref('pending')

// === Methods ===
const goToLogin = () => {
  // 🎯 Track user intent for enterprise navigation
  trackUserAction('navigate_to_login', '/auth/login')
  console.log('👤 User explicitly requested navigation to login')
  
  // Small delay to ensure intent is tracked
  setTimeout(() => {
    router.push('/auth/login')
  }, 50)
}

const handleSignOut = async () => {
  try {
    // 🎯 Track sign out intent
    trackUserAction('sign_out', '/')
    console.log('👤 User explicitly requested sign out')
    
    await signOut()
    console.log('✅ User successfully signed out')
  } catch (error) {
    console.error('❌ Error during sign out:', error)
    snackbarMessage.value = 'حدث خطأ أثناء تسجيل الخروج'
    snackbarColor.value = 'error'
    showSnackbar.value = true
  }
}

const refreshStatus = async () => {
  if (!userProfile.value?.uid) return
  
  try {
    isRefreshing.value = true
    
    // جلب حالة المستخدم الحالية من Firestore
    const userDoc = await getDoc(doc(db, 'users', userProfile.value.uid))
    
    if (userDoc.exists()) {
      const userData = userDoc.data()
      
      if (userData.status === 'active') {
        snackbarMessage.value = 'تم تفعيل حسابك! جاري التوجيه...'
        snackbarColor.value = 'success'
        showSnackbar.value = true
        
        // توجيه للداشبورد المناسب حسب الدور
        setTimeout(() => {
          switch (userData.primary_role) {
            case 'photographer':
              router.push('/photographer/dashboard')
              break
            case 'brand_coordinator':
              router.push('/brand-coordinator/dashboard')
              break
            case 'marketing_coordinator':
              router.push('/marketing-coordinator/dashboard')
              break
            default:
              router.push('/dashboard')
          }
        }, 2000)
        
      } else if (userData.status === 'rejected') {
        snackbarMessage.value = 'تم رفض طلبك. تواصل مع الدعم للمزيد من المعلومات.'
        snackbarColor.value = 'error'
        showSnackbar.value = true
        
      } else {
        snackbarMessage.value = 'طلبك ما زال قيد المراجعة.'
        snackbarColor.value = 'info'
        showSnackbar.value = true
      }
    } else {
      snackbarMessage.value = 'حدث خطأ في جلب بيانات الحساب.'
      snackbarColor.value = 'error'
      showSnackbar.value = true
    }
    
  } catch (error) {
    console.error('خطأ في تحديث الحالة:', error)
    snackbarMessage.value = 'حدث خطأ في التحديث. حاول مرة أخرى.'
    snackbarColor.value = 'error'
    showSnackbar.value = true
  } finally {
    isRefreshing.value = false
  }
}

const contactSupport = () => {
  // فتح البريد الإلكتروني أو نافذة تواصل
  window.open('mailto:support@depthstudio.com?subject=استفسار حول طلب التسجيل', '_blank')
}

// تحديث البيانات دورياً
const refreshUserData = async () => {
  if (!userProfile.value?.uid) return
  
  try {
    console.log('🔄 تحديث بيانات المستخدم...')
    const userDoc = await getDoc(doc(db, 'users', userProfile.value.uid))
    
    if (userDoc.exists()) {
      const userData = userDoc.data()
      currentStatus.value = userData.status || 'pending_approval'
      userRole.value = userData.primary_role || 'pending'
      
      console.log('✅ تم تحديث البيانات:', {
        status: currentStatus.value,
        role: userRole.value
      })
      
      // التحقق من تغيير الحالة للانتقال للصفحة المناسبة
      if (currentStatus.value === 'active') {
        console.log('🎉 تم قبول الطلب! التوجيه للوحة التحكم...')
        setTimeout(() => {
          // التوجيه حسب الدور
          if (userRole.value === 'photographer') {
            router.push('/photographer/dashboard')
          } else if (userRole.value === 'brand_coordinator') {
            router.push('/brand-coordinator/dashboard')
          } else if (userRole.value === 'marketing_coordinator') {
            router.push('/marketing-coordinator/dashboard')
          } else {
            router.push('/dashboard')
          }
        }, 2000)
      }
    }
  } catch (error) {
    console.error('❌ خطأ في تحديث البيانات:', error)
  }
}

// === Lifecycle ===
onMounted(() => {
  console.log('📋 صفحة انتظار الموافقة تم تحميلها للمستخدم:', userProfile.value?.email)
  
  // تحديث البيانات عند التحميل
  refreshUserData()
  
  // تحديث دوري كل 30 ثانية
  const interval = setInterval(refreshUserData, 30000)
  
  // تنظيف التحديث الدوري عند مغادرة الصفحة
  onUnmounted(() => {
    clearInterval(interval)
  })
})
</script> 
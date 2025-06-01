<template>
  <v-container fluid class="pa-0">
    <v-row no-gutters justify="center" align="center" style="min-height: 100vh;">
      <v-col cols="12" sm="10" md="8" lg="6" xl="5">
        <v-card 
          class="mx-auto pending-card" 
          :max-width="600"
          elevation="24"
          rounded="xl"
        >
          <div class="card-header">
            <v-img
              src="/logo-depth-studio.png"
              alt="Depth Studio"
              height="50"
              width="180"
              contain
              class="mx-auto mb-4"
            />
            <h1 class="text-h4 font-weight-bold text-center mb-2">
              طلبك قيد المراجعة
            </h1>
            <p class="text-center text-medium-emphasis mb-6">
              شكراً لانضمامك لفريق Depth Studio
            </p>
          </div>

          <v-card-text class="pa-8 text-center">
            <!-- الأيقونة الرئيسية -->
            <div class="icon-container mb-6">
              <v-icon size="120" color="warning" class="pending-icon">
                mdi-clock-outline
              </v-icon>
            </div>

            <!-- الرسالة الرئيسية -->
            <h2 class="text-h5 font-weight-bold mb-4">
              في انتظار موافقة الإدارة
            </h2>
            
            <p class="text-h6 mb-6 text-medium-emphasis">
              تم إرسال طلب تسجيلك بنجاح وهو الآن قيد المراجعة من قبل فريق الإدارة.
            </p>

            <!-- معلومات إضافية -->
            <v-alert type="info" variant="outlined" class="text-start mb-6">
              <div class="d-flex align-center mb-3">
                <v-icon start>mdi-information</v-icon>
                <strong>معلومات مهمة:</strong>
              </div>
              <ul class="pa-0 ma-0">
                <li class="mb-2">⏱️ <strong>وقت المراجعة:</strong> عادة من 24-48 ساعة</li>
                <li class="mb-2">📧 <strong>الإشعارات:</strong> ستتلقى بريد إلكتروني فور الموافقة</li>
                <li class="mb-2">🔒 <strong>حالة الحساب:</strong> محفوظ وآمن في النظام</li>
                <li>✅ <strong>الخطوة التالية:</strong> انتظار إشعار الموافقة</li>
              </ul>
            </v-alert>

            <!-- مراحل العملية -->
            <v-card variant="outlined" class="mb-6">
              <v-card-title class="text-h6 text-center">
                <v-icon start>mdi-timeline</v-icon>
                مراحل العملية
              </v-card-title>
              <v-card-text>
                <v-stepper 
                  v-model="currentStep" 
                  alt-labels 
                  non-linear
                  class="elevation-0"
                >
                  <v-stepper-header>
                    <v-stepper-item
                      :complete="true"
                      step="1"
                      title="التسجيل"
                    />
                    <v-divider />
                    <v-stepper-item
                      :complete="true"
                      step="2"
                      title="إعداد الدور"
                    />
                    <v-divider />
                    <v-stepper-item
                      :complete="false"
                      step="3"
                      title="مراجعة الإدارة"
                      color="warning"
                    />
                    <v-divider />
                    <v-stepper-item
                      :complete="false"
                      step="4"
                      title="تفعيل الحساب"
                    />
                  </v-stepper-header>
                </v-stepper>
              </v-card-text>
            </v-card>

            <!-- الخيارات المتاحة -->
            <div class="actions-section">
              <h3 class="text-h6 mb-4">ماذا يمكنك فعله الآن؟</h3>
              
              <v-row class="mb-4">
                <v-col cols="12" md="6">
                  <v-btn
                    color="primary"
                    variant="outlined"
                    size="large"
                    block
                    @click="goToLogin"
                    rounded="lg"
                  >
                    <v-icon start>mdi-login</v-icon>
                    العودة لتسجيل الدخول
                  </v-btn>
                </v-col>
                
                <v-col cols="12" md="6">
                  <v-btn
                    color="grey"
                    variant="outlined"
                    size="large"
                    block
                    @click="refreshStatus"
                    :loading="isRefreshing"
                    rounded="lg"
                  >
                    <v-icon start>mdi-refresh</v-icon>
                    تحديث الحالة
                  </v-btn>
                </v-col>
              </v-row>

              <!-- 🚀 Enterprise-Level Sign Out Option -->
              <v-row class="mb-4">
                <v-col cols="12">
                  <v-btn
                    color="error"
                    variant="outlined"
                    size="large"
                    block
                    @click="handleSignOut"
                    rounded="lg"
                    prepend-icon="mdi-logout"
                  >
                    تسجيل خروج كامل
                  </v-btn>
                  <p class="text-caption text-center mt-2 text-medium-emphasis">
                    سيتم تسجيل خروجك من النظام بالكامل
                  </p>
                </v-col>
              </v-row>

              <!-- تواصل مع الدعم -->
              <v-divider class="my-6" />
              
              <div class="contact-section">
                <p class="text-body-2 text-medium-emphasis mb-3">
                  <v-icon start size="16">mdi-help-circle</v-icon>
                  تحتاج مساعدة أو لديك استفسار؟
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
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Snackbar للتحديثات -->
    <v-snackbar
      v-model="showSnackbar"
      :color="snackbarColor"
      timeout="3000"
      top
    >
      {{ snackbarMessage }}
      <template v-slot:actions>
        <v-btn
          variant="text"
          @click="showSnackbar = false"
        >
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

<style scoped lang="scss">
@import '@/styles/design-system/index';

.pending-approval-page {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--color-warning-500) 0%, var(--color-warning-700) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-6);
  
  .pending-card {
    max-width: 500px;
    width: 100%;
    text-align: center;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    border-radius: var(--border-radius-xl);
    box-shadow: var(--elevation-high);
    padding: var(--spacing-8);
    
    .pending-icon {
      width: 100px;
      height: 100px;
      background: var(--color-warning-100);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto var(--spacing-6);
      
      .v-icon {
        color: var(--color-warning-600);
        font-size: 3rem;
      }
    }
    
    .pending-title {
      color: var(--color-text-primary);
      font-weight: 700;
      margin-bottom: var(--spacing-4);
    }
    
    .pending-message {
      color: var(--color-text-secondary);
      line-height: 1.6;
      margin-bottom: var(--spacing-6);
    }
    
    .pending-actions {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-3);
      
      .logout-button {
        background-color: var(--color-text-secondary) !important;
        color: white !important;
        
        &:hover {
          background-color: var(--color-text-primary) !important;
        }
      }
      
      .refresh-button {
        color: var(--color-primary-500) !important;
        border-color: var(--color-primary-500) !important;
        
        &:hover {
          background-color: var(--color-primary-50) !important;
        }
      }
    }
  }
}

// Responsive design
@media (max-width: 600px) {
  .pending-approval-page {
    padding: var(--spacing-4);
    
    .pending-card {
      padding: var(--spacing-6);
      
      .pending-icon {
        width: 80px;
        height: 80px;
        
        .v-icon {
          font-size: 2.5rem;
        }
      }
      
      .pending-title {
        font-size: 1.5rem;
      }
    }
  }
}
</style> 
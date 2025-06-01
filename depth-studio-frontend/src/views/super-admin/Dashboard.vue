<template>
  <div class="dashboard-container">
    <v-container fluid class="pa-0">
      <!-- Welcome Section -->
      <v-row class="mb-6">
        <v-col cols="12">
          <BaseCard
            title="مرحباً بك يا علي جودت"
            subtitle="المدير العام - Depth Studio"
            elevation="4"
            class="welcome-card text-center"
            animate
            hover-effect
          >
            <div class="d-flex flex-column align-center pa-4">
              <v-avatar size="80" class="mb-4 hover-scale animate-bounce-subtle">
                <v-img src="/logo-depth-studio.png" alt="Depth Studio" />
              </v-avatar>
              
              <v-chip color="success" size="small" class="mt-2 pulse-subtle">
                <v-icon start size="small">mdi-check-circle</v-icon>
                متصل الآن
              </v-chip>
            </div>
          </BaseCard>
        </v-col>
      </v-row>

      <!-- Notifications Section للطلبات الجديدة -->
      <v-row v-if="pendingApprovals.length > 0" class="mb-6">
        <v-col cols="12">
          <BaseCard
            title="طلبات تسجيل جديدة تحتاج موافقتك"
            elevation="6"
            color="warning"
            :class="{ 'urgent-notification animate-pulse': pendingApprovals.length >= 5 }"
            class="notification-card"
            animate
            hover-effect
            glow-effect
          >
            <!-- Header Actions -->
            <template #actions>
              <v-chip 
                :color="pendingApprovals.length >= 5 ? 'error' : 'warning'"
                size="small"
                class="font-weight-bold animate-pulse"
              >
                {{ pendingApprovals.length }}
              </v-chip>
            </template>

            <!-- Content -->
            <v-row class="pa-2">
              <!-- معاينة سريعة للطلبات -->
              <v-col cols="12" md="8">
                <div class="d-flex flex-wrap gap-2 mb-3">
                  <v-chip
                    v-for="approval in pendingApprovals.slice(0, 4)"
                    :key="approval.id"
                    size="small"
                    variant="outlined"
                    :color="getRoleColor(approval.primary_role)"
                    class="hover-lift"
                  >
                    <v-icon start size="16">{{ getRoleIcon(approval.primary_role) }}</v-icon>
                    {{ approval.display_name }}
                  </v-chip>
                  <v-chip
                    v-if="pendingApprovals.length > 4"
                    size="small"
                    variant="outlined"
                    color="grey"
                  >
                    + {{ pendingApprovals.length - 4 }} أخرى
                  </v-chip>
                </div>
                
                <p class="text-body-2 text-muted mb-2">
                  <v-icon size="16" class="ms-1">mdi-information</v-icon>
                  هناك {{ pendingApprovals.length }} طلب{{ pendingApprovals.length > 1 ? 'ات' : '' }} 
                  تسجيل جديد{{ pendingApprovals.length > 1 ? 'ة' : '' }} في انتظار موافقتك لتفعيل الحسابات.
                </p>
                
                <!-- إحصائيات سريعة للطلبات -->
                <div class="d-flex flex-wrap gap-3">
                  <div v-if="approvalStats.photographers > 0" class="d-flex align-center">
                    <v-icon size="16" color="primary" class="ms-1">mdi-camera</v-icon>
                    <span class="text-caption">{{ approvalStats.photographers }} مصور</span>
                  </div>
                  <div v-if="approvalStats.brandCoordinators > 0" class="d-flex align-center">
                    <v-icon size="16" color="warning" class="ms-1">mdi-domain</v-icon>
                    <span class="text-caption">{{ approvalStats.brandCoordinators }} منسق براند</span>
                  </div>
                  <div v-if="approvalStats.marketingCoordinators > 0" class="d-flex align-center">
                    <v-icon size="16" color="error" class="ms-1">mdi-bullhorn</v-icon>
                    <span class="text-caption">{{ approvalStats.marketingCoordinators }} منسق تسويق</span>
                  </div>
                </div>
              </v-col>

              <!-- أزرار الإجراءات -->
              <v-col cols="12" md="4" class="d-flex flex-column justify-center">
                <BaseButton
                  label="مراجعة الطلبات"
                  leading-icon="mdi-check-circle"
                  color="primary"
                  size="large"
                  block
                  animate
                  pulse
                  class="mb-3"
                  @click="goToApprovals"
                />
                
                <div class="d-flex gap-2">
                  <BaseButton
                    label="موافقة جميع المصورين"
                    leading-icon="mdi-check-all"
                    color="success"
                    variant="outlined"
                    size="small"
                    :disabled="isProcessingBulk"
                    :loading="isProcessingBulk"
                    v-if="approvalStats.photographers > 0"
                    @click="approveAllPhotographers"
                  />
                  
                  <BaseButton
                    label="إخفاء"
                    leading-icon="mdi-bell-off"
                    color="grey"
                    variant="outlined"
                    size="small"
                    @click="dismissNotification"
                  />
                </div>
              </v-col>
            </v-row>
          </BaseCard>
        </v-col>
      </v-row>

      <!-- KPI Cards Section -->
      <v-row class="mb-6">
        <v-col cols="12">
          <h2 class="text-h5 font-weight-bold mb-4 d-flex align-center">
            <v-icon size="28" color="primary" class="me-2">mdi-chart-bar</v-icon>
            الإحصائيات الرئيسية
          </h2>
        </v-col>
        
        <!-- Users Count -->
        <v-col cols="12" sm="6" md="4" lg="2">
          <BaseCard
            elevation="3"
            class="kpi-card user-card text-center"
            height="140"
            animate
            hover-effect
            clickable
            @click="goToUsers"
          >
            <div class="pa-4">
              <v-icon size="32" color="primary" class="mb-2 hover-bounce">mdi-account-group</v-icon>
              <div class="text-h4 font-weight-bold text-primary">5</div>
              <div class="text-body-2 text-muted">المستخدمون</div>
            </div>
          </BaseCard>
        </v-col>

        <!-- Brands Count -->
        <v-col cols="12" sm="6" md="4" lg="2">
          <BaseCard
            elevation="3"
            class="kpi-card brand-card text-center"
            height="140"
            animate
            hover-effect
            clickable
            @click="goToBrands"
          >
            <div class="pa-4">
              <v-icon size="32" color="success" class="mb-2 hover-bounce">mdi-store</v-icon>
              <div class="text-h4 font-weight-bold text-success">2</div>
              <div class="text-body-2 text-muted">البراندات</div>
            </div>
          </BaseCard>
        </v-col>

        <!-- Campaigns Count -->
        <v-col cols="12" sm="6" md="4" lg="2">
          <BaseCard
            elevation="3"
            class="kpi-card campaign-card text-center"
            height="140"
            animate
            hover-effect
            clickable
            @click="goToCampaigns"
          >
            <div class="pa-4">
              <v-icon size="32" color="info" class="mb-2 hover-bounce">mdi-rocket</v-icon>
              <div class="text-h4 font-weight-bold text-info">0</div>
              <div class="text-body-2 text-muted">الحملات النشطة</div>
            </div>
          </BaseCard>
        </v-col>

        <!-- Pending Tasks -->
        <v-col cols="12" sm="6" md="4" lg="2">
          <BaseCard
            elevation="3"
            class="kpi-card task-card text-center"
            height="140"
            animate
            hover-effect
            pulse-effect
          >
            <div class="pa-4">
              <v-icon size="32" color="warning" class="mb-2 hover-bounce">mdi-clock-alert</v-icon>
              <div class="text-h4 font-weight-bold text-warning">12</div>
              <div class="text-body-2 text-muted">المهام المعلقة</div>
            </div>
          </BaseCard>
        </v-col>

        <!-- Monthly Revenue -->
        <v-col cols="12" sm="6" md="4" lg="2">
          <BaseCard
            elevation="3"
            class="kpi-card revenue-card text-center"
            height="140"
            animate
            hover-effect
            glow-effect
          >
            <div class="pa-4">
              <v-icon size="32" color="purple" class="mb-2 hover-bounce">mdi-currency-usd</v-icon>
              <div class="text-h4 font-weight-bold text-purple">$12.5K</div>
              <div class="text-body-2 text-muted">الإيرادات الشهرية</div>
            </div>
          </BaseCard>
        </v-col>

        <!-- Growth Rate -->
        <v-col cols="12" sm="6" md="4" lg="2">
          <BaseCard
            elevation="3"
            class="kpi-card growth-card text-center"
            height="140"
            animate
            hover-effect
          >
            <div class="pa-4">
              <v-icon size="32" color="teal" class="mb-2 hover-bounce">mdi-trending-up</v-icon>
              <div class="text-h4 font-weight-bold text-teal">+24%</div>
              <div class="text-body-2 text-muted">معدل النمو</div>
            </div>
          </BaseCard>
        </v-col>
      </v-row>

      <!-- Quick Actions Section -->
      <v-row class="mb-6">
        <v-col cols="12">
          <h2 class="text-h5 font-weight-bold mb-4 d-flex align-center">
            <v-icon size="28" color="secondary" class="me-2">mdi-lightning-bolt</v-icon>
            إجراءات سريعة
          </h2>
        </v-col>
        
        <v-col cols="12" sm="6" md="4">
          <BaseCard
            title="إضافة مستخدم جديد"
            subtitle="إنشاء حساب جديد للنظام"
            clickable
            animate
            hover-effect
            class="action-card"
            @click="addNewUser"
          >
            <div class="text-center pa-2">
              <v-icon size="48" color="primary" class="hover-scale">mdi-account-plus</v-icon>
            </div>
          </BaseCard>
        </v-col>
        
        <v-col cols="12" sm="6" md="4">
          <BaseCard
            title="إنشاء حملة جديدة"
            subtitle="تخطيط وإطلاق حملة تصوير"
            clickable
            animate
            hover-effect
            class="action-card"
            @click="createCampaign"
          >
            <div class="text-center pa-2">
              <v-icon size="48" color="info" class="hover-scale">mdi-rocket-launch</v-icon>
            </div>
          </BaseCard>
        </v-col>
        
        <v-col cols="12" sm="6" md="4">
          <BaseCard
            title="إعدادات النظام"
            subtitle="تخصيص إعدادات التطبيق"
            clickable
            animate
            hover-effect
            class="action-card"
            @click="goToSettings"
          >
            <div class="text-center pa-2">
              <v-icon size="48" color="warning" class="hover-scale">mdi-cog</v-icon>
            </div>
          </BaseCard>
        </v-col>
      </v-row>

      <!-- Loading Overlay -->
      <LoadingSpinner
        v-if="isLoading"
        overlay
        text="جاري تحميل البيانات..."
        type="circular"
        size="large"
      />
      
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useRouter } from 'vue-router'
import { db } from '@/firebase/config'
import { collection, query, where, getDocs, updateDoc, doc, writeBatch } from 'firebase/firestore'
import BaseCard from '@/components/common/BaseCard.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const { userProfile } = useAuth()
const router = useRouter()

// === Reactive Data ===
const pendingApprovals = ref<any[]>([])
const isProcessingBulk = ref(false)
const notificationDismissed = ref(false)
const isLoading = ref(false)

// === Computed Properties ===
const approvalStats = computed(() => {
  return {
    photographers: pendingApprovals.value.filter(approval => approval.primary_role === 'photographer').length,
    brandCoordinators: pendingApprovals.value.filter(approval => approval.primary_role === 'brand_coordinator').length,
    marketingCoordinators: pendingApprovals.value.filter(approval => approval.primary_role === 'marketing_coordinator').length
  }
})

// === Navigation Methods ===
const goToUsers = () => {
  router.push('/super-admin/users')
}

const goToBrands = () => {
  router.push('/super-admin/brands')
}

const goToCampaigns = () => {
  router.push('/super-admin/campaigns')
}

const goToSettings = () => {
  router.push('/super-admin/settings')
}

const addNewUser = () => {
  router.push('/super-admin/users?action=add')
}

const createCampaign = () => {
  router.push('/super-admin/campaigns?action=create')
}

// === Approval Methods ===
const loadPendingApprovals = async () => {
  try {
    isLoading.value = true
    const usersQuery = query(
      collection(db, 'users'),
      where('status', '==', 'pending_approval')
    )
    
    const querySnapshot = await getDocs(usersQuery)
    pendingApprovals.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    console.log(`📋 تم جلب ${pendingApprovals.value.length} طلب معلق للموافقة`)
  } catch (error) {
    console.error('خطأ في جلب الطلبات المعلقة:', error)
  } finally {
    isLoading.value = false
  }
}

const getRoleColor = (role: string) => {
  switch (role) {
    case 'photographer': return 'primary'
    case 'brand_coordinator': return 'warning'
    case 'marketing_coordinator': return 'error'
    default: return 'grey'
  }
}

const getRoleIcon = (role: string) => {
  switch (role) {
    case 'photographer': return 'mdi-camera'
    case 'brand_coordinator': return 'mdi-domain'
    case 'marketing_coordinator': return 'mdi-bullhorn'
    default: return 'mdi-account'
  }
}

const goToApprovals = () => {
  router.push('/super-admin/users?tab=pending')
}

const dismissNotification = () => {
  notificationDismissed.value = true
}

const approveAllPhotographers = async () => {
  if (isProcessingBulk.value) return
  
  try {
    isProcessingBulk.value = true
    
    const photographersToApprove = pendingApprovals.value.filter(
      approval => approval.primary_role === 'photographer'
    )
    
    if (photographersToApprove.length === 0) return
    
    const batch = writeBatch(db)
    
    photographersToApprove.forEach(photographer => {
      const userRef = doc(db, 'users', photographer.id)
      batch.update(userRef, {
        status: 'active',
        approved_at: new Date(),
        approved_by: userProfile.value?.uid || 'system',
        updated_at: new Date()
      })
    })
    
    await batch.commit()
    
    // تحديث القائمة المحلية
    pendingApprovals.value = pendingApprovals.value.filter(
      approval => approval.primary_role !== 'photographer'
    )
    
    console.log(`✅ تم تفعيل ${photographersToApprove.length} مصور بنجاح`)
    
  } catch (error) {
    console.error('خطأ في الموافقة الجماعية:', error)
  } finally {
    isProcessingBulk.value = false
  }
}

const updateUsersKPI = async () => {
  try {
    const usersSnapshot = await getDocs(collection(db, 'users'))
    const activeUsers = usersSnapshot.docs.filter(doc => doc.data().status === 'active')
    
    console.log(`👥 عدد المستخدمين النشطين: ${activeUsers.length}`)
  } catch (error) {
    console.error('خطأ في تحديث إحصائيات المستخدمين:', error)
  }
}

onMounted(async () => {
  console.log('✅ Super Admin Dashboard تم تحميله بنجاح!')
  console.log('👤 المستخدم المسجل:', userProfile.value)
  
  // جلب الطلبات المعلقة
  await loadPendingApprovals()
  
  // تحديث الإحصائيات
  await updateUsersKPI()
})
</script>

<style lang="scss" scoped>
@import '@/styles/design-system/index';

// === DASHBOARD LAYOUT ===
.dashboard-container {
  padding: var(--spacing-6);
  animation: fadeIn var(--transition-normal) var(--easing-ease-out);
  
  // Page transitions
  .v-container {
    animation: slideIn var(--transition-normal) var(--easing-ease-out);
  }
}

// === WELCOME CARD STYLES ===
.welcome-card {
  .v-card {
    background: linear-gradient(135deg, 
      rgba(var(--v-theme-primary), 0.05) 0%, 
      rgba(var(--v-theme-surface), 1) 100%);
    
    position: relative;
    overflow: hidden;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      width: 100%;
      height: 100%;
      background: radial-gradient(circle at top right, 
        rgba(var(--v-theme-primary), 0.08) 0%, 
        transparent 60%);
      pointer-events: none;
    }
  }
}

// === STATS CARDS ===
.stats-card {
  transition: all var(--transition-normal) var(--easing-ease-out);
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  }
  
  .stat-icon {
    transition: transform var(--transition-normal) var(--easing-bounce);
    
    &:hover {
      transform: scale(1.1) rotate(5deg);
    }
  }
  
  // Color variants
  &.primary-stats {
    border-top: 4px solid var(--color-primary);
  }
  
  &.success-stats {
    border-top: 4px solid var(--color-success);
  }
  
  &.warning-stats {
    border-top: 4px solid var(--color-warning);
  }
  
  &.info-stats {
    border-top: 4px solid var(--color-info);
  }
}

// === PENDING APPROVALS SECTION ===
.pending-approvals-section {
  .section-header {
    background: linear-gradient(135deg, 
      rgba(var(--v-theme-warning), 0.1) 0%, 
      rgba(var(--v-theme-surface), 1) 100%);
    
    .pulsing-indicator {
      animation: pulse 2s infinite;
    }
  }
  
  .approval-card {
    transition: all var(--transition-normal) var(--easing-ease-out);
    border-radius: var(--border-radius-lg);
    
    &:hover {
      transform: translateX(-4px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      
      [dir="rtl"] & {
        transform: translateX(4px);
      }
    }
    
    .user-avatar {
      transition: transform var(--transition-normal) var(--easing-ease-out);
      
      &:hover {
        transform: scale(1.1);
      }
    }
  }
  
  .bulk-actions {
    backdrop-filter: blur(8px);
    background: rgba(var(--v-theme-surface), 0.95);
    border-radius: var(--border-radius-lg);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }
}

// === RECENT ACTIVITY ===
.recent-activity-section {
  .activity-item {
    transition: all var(--transition-fast) var(--easing-ease-out);
    border-radius: var(--border-radius-md);
    
    &:hover {
      background: rgba(var(--v-theme-primary), 0.02);
      transform: translateX(-2px);
      
      [dir="rtl"] & {
        transform: translateX(2px);
      }
    }
    
    .activity-icon {
      transition: transform var(--transition-normal) var(--easing-bounce);
      
      &:hover {
        transform: scale(1.15);
      }
    }
  }
}

// === LOADING STATES ===
.loading-overlay {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
  border-radius: var(--border-radius-lg);
  
  .loading-content {
    animation: fadeIn var(--transition-normal) var(--easing-ease-out);
  }
}

// === ANIMATIONS ===
@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.05);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

// === RESPONSIVE DESIGN ===
@media (max-width: 768px) {
  .dashboard-container {
    padding: var(--spacing-4);
  }
  
  .stats-card {
    margin-bottom: var(--spacing-4);
  }
  
  .approval-card {
    margin-bottom: var(--spacing-3);
  }
}

@media (max-width: 600px) {
  .dashboard-container {
    padding: var(--spacing-3);
  }
  
  .welcome-card .v-card {
    padding: var(--spacing-4);
  }
  
  .bulk-actions {
    flex-direction: column;
    gap: var(--spacing-2);
  }
}

// === PRINT STYLES ===
@media print {
  .dashboard-container {
    padding: 0;
  }
  
  .stats-card,
  .approval-card {
    break-inside: avoid;
    box-shadow: none !important;
    border: 1px solid #ddd;
  }
  
  .bulk-actions {
    display: none !important;
  }
}
</style> 
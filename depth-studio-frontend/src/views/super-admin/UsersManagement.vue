<template>
  <v-container fluid class="users-management">
    <!-- Page Header -->
    <div class="page-header mb-6">
      <div class="d-flex align-center justify-space-between flex-wrap gap-3">
        <div class="flex-grow-1 min-w-0">
          <h1 class="text-h4 font-weight-bold text-primary mb-2 d-flex align-center flex-wrap">
            <v-icon start size="36" class="me-2">mdi-account-group</v-icon>
            إدارة المستخدمين
          </h1>
          <p class="text-subtitle-1 text-muted mb-0">
            مراجعة الطلبات الجديدة وإدارة جميع مستخدمي النظام
          </p>
        </div>
        
        <!-- Quick Actions -->
        <div class="d-flex gap-2 flex-wrap">
          <BaseButton
            label="تحديث البيانات"
            leading-icon="mdi-refresh"
            color="primary"
            variant="outlined"
            :loading="isProcessing"
            animate
            @click="refreshAllData"
          />
          
          <BaseButton
            v-if="pendingUsers.length > 0"
            :label="`${pendingUsers.length} طلب معلق`"
            leading-icon="mdi-clock-alert"
            color="success"
            variant="elevated"
            pulse
            @click="goToPendingTab"
          />
        </div>
      </div>
    </div>

    <!-- Quick Stats Cards -->
    <div class="stats-overview mb-6">
      <v-row>
        <v-col cols="12" sm="6" md="3">
          <BaseCard
            class="stats-card total-stats text-center"
            clickable
            animate
            hover-effect
            @click="currentTab = 'all'"
          >
            <div class="pa-4">
              <v-icon size="40" color="primary" class="mb-3 hover-bounce">mdi-account-multiple</v-icon>
              <div class="text-h4 font-weight-bold text-primary">{{ stats.total }}</div>
              <div class="text-subtitle-2 text-muted">إجمالي المستخدمين</div>
            </div>
          </BaseCard>
        </v-col>
        
        <v-col cols="12" sm="6" md="3">
          <BaseCard
            class="stats-card active-stats text-center"
            clickable
            animate
            hover-effect
            @click="currentTab = 'active'"
          >
            <div class="pa-4">
              <v-icon size="40" color="success" class="mb-3 hover-bounce">mdi-check-circle</v-icon>
              <div class="text-h4 font-weight-bold text-success">{{ stats.active }}</div>
              <div class="text-subtitle-2 text-muted">مستخدم نشط</div>
            </div>
          </BaseCard>
        </v-col>
        
        <v-col cols="12" sm="6" md="3">
          <BaseCard
            class="stats-card pending-stats text-center"
            :class="{ 'pulse-effect': pendingUsers.length > 0 }"
            clickable
            animate
            hover-effect
            pulse-effect
            @click="currentTab = 'pending'"
          >
            <div class="pa-4">
              <v-icon size="40" color="warning" class="mb-3 hover-bounce">mdi-clock-alert</v-icon>
              <div class="text-h4 font-weight-bold text-warning">{{ stats.pending }}</div>
              <div class="text-subtitle-2 text-muted">
                {{ stats.pending === 0 ? 'لا توجد طلبات' : 'طلب معلق' }}
              </div>
            </div>
          </BaseCard>
        </v-col>
        
        <v-col cols="12" sm="6" md="3">
          <BaseCard
            class="stats-card roles-stats text-center"
            animate
            hover-effect
          >
            <div class="pa-4">
              <v-icon size="40" color="info" class="mb-3 hover-bounce">mdi-account-tie</v-icon>
              <div class="text-h4 font-weight-bold text-info">{{ coordinatorsCount }}</div>
              <div class="text-subtitle-2 text-muted">منسق</div>
              <div class="text-caption mt-1">
                <v-chip size="x-small" color="primary" class="me-1">{{ photographersCount }}</v-chip>
                مصور
              </div>
            </div>
          </BaseCard>
        </v-col>
      </v-row>
    </div>

    <!-- Navigation Tabs -->
    <div class="tabs-container mb-6">
      <BaseCard elevation="2" rounded="lg" class="pa-0">
        <v-tabs
          v-model="currentTab"
          bg-color="primary"
          color="white"
          show-arrows
          density="comfortable"
          class="rounded-lg"
        >
          <v-tab 
            value="pending" 
            class="font-weight-bold tab-item"
            :class="{ 'tab-urgent animate-pulse': pendingUsers.length > 0 }"
          >
            <v-icon start>mdi-clock-alert</v-icon>
            طلبات معلقة
            <v-chip 
              v-if="pendingUsers.length > 0"
              color="error"
              size="small"
              class="ms-2 animate-pulse"
            >
              {{ pendingUsers.length }}
            </v-chip>
          </v-tab>
          
          <v-tab value="active" class="font-weight-bold tab-item">
            <v-icon start>mdi-check-circle</v-icon>
            المستخدمون النشطون
            <v-chip 
              v-if="activeUsers.length > 0"
              color="success"
              size="small"
              variant="outlined"
              class="ms-2"
            >
              {{ activeUsers.length }}
            </v-chip>
          </v-tab>
          
          <v-tab value="all" class="font-weight-bold tab-item">
            <v-icon start>mdi-account-multiple</v-icon>
            جميع المستخدمين
            <v-chip 
              color="primary"
              size="small"
              variant="outlined"
              class="ms-2"
            >
              {{ allUsers.length }}
            </v-chip>
          </v-tab>
          
          <v-tab value="reports" class="font-weight-bold tab-item">
            <v-icon start>mdi-chart-line</v-icon>
            التقارير
          </v-tab>
        </v-tabs>
      </BaseCard>
    </div>

    <!-- Tab Content -->
    <div class="tab-content">
      <v-window v-model="currentTab" class="animate-fade-in">
        <!-- Pending Users Tab -->
        <v-window-item value="pending">
          <div class="animate-slide-in">
            <PendingUsersTab />
          </div>
        </v-window-item>
        
        <!-- Active Users Tab -->
        <v-window-item value="active">
          <div class="animate-slide-in">
            <ActiveUsersTab />
          </div>
        </v-window-item>
        
        <!-- All Users Tab -->
        <v-window-item value="all">
          <div class="animate-slide-in">
            <AllUsersTab />
          </div>
        </v-window-item>
        
        <!-- Reports Tab -->
        <v-window-item value="reports">
          <div class="animate-slide-in">
            <BaseCard
              variant="outlined"
              class="pa-8 text-center reports-placeholder"
              animate
              hover-effect
            >
              <div>
                <v-icon size="80" color="info" class="mb-4 hover-bounce">mdi-chart-line</v-icon>
                <h3 class="text-h5 mb-3 font-weight-bold">تقارير المستخدمين</h3>
                <p class="text-body-1 text-muted mb-4">
                  هذا القسم قيد التطوير وسيحتوي على تقارير تفصيلية حول نشاط المستخدمين وإحصائيات شاملة.
                </p>
                <BaseButton
                  label="قريباً"
                  leading-icon="mdi-wrench"
                  color="info"
                  variant="outlined"
                  animate
                />
              </div>
            </BaseCard>
          </div>
        </v-window-item>
      </v-window>
    </div>

    <!-- Loading Overlay -->
    <LoadingSpinner
      v-if="isLoading"
      overlay
      text="جاري تحميل بيانات المستخدمين..."
      type="circular"
      size="large"
    />
    
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserManagement } from '@/composables/useUserManagement'
import BaseCard from '@/components/common/BaseCard.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import PendingUsersTab from '@/components/users/tabs/PendingUsersTab.vue'
import ActiveUsersTab from '@/components/users/tabs/ActiveUsersTab.vue'
import AllUsersTab from '@/components/users/tabs/AllUsersTab.vue'

// === Composables ===
const {
  allUsers,
  pendingUsers,
  activeUsers,
  stats,
  photographersCount,
  coordinatorsCount,
  isProcessing,
  loadAllUsers
} = useUserManagement()

// === Reactive Data ===
const currentTab = ref('pending') // Start with pending tab to highlight urgent tasks
const isLoading = ref(false)

// === Methods ===
const refreshAllData = async (): Promise<void> => {
  try {
    isLoading.value = true
    await loadAllUsers()
    console.log('🔄 تم تحديث جميع البيانات بنجاح')
  } catch (error: any) {
    console.error('❌ خطأ في تحديث البيانات:', error.message)
  } finally {
    isLoading.value = false
  }
}

const goToPendingTab = (): void => {
  currentTab.value = 'pending'
}

// === Lifecycle ===
onMounted(async () => {
  console.log('🚀 بدء تحميل صفحة إدارة المستخدمين...')
  await refreshAllData()
})
</script>

<style lang="scss" scoped>
@import '@/styles/design-system/index';

// === USERS MANAGEMENT CONTAINER ===
.users-management {
  padding: var(--spacing-6);
  animation: fadeIn var(--transition-normal) var(--easing-ease-out);
  min-height: calc(100vh - 120px);
  
  // Page transitions
  .v-container {
    animation: slideIn var(--transition-normal) var(--easing-ease-out);
  }
}

// === PAGE HEADER ===
.page-header {
  margin-bottom: var(--spacing-6);
  
  h1 {
    background: linear-gradient(45deg, var(--color-primary), var(--color-secondary));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .v-icon {
    transition: transform var(--transition-normal) var(--easing-bounce);
    
    &:hover {
      transform: scale(1.1) rotate(5deg);
    }
  }
}

// === QUICK ACTIONS BUTTONS ===
.quick-actions {
  .v-btn {
    transition: all var(--transition-normal) var(--easing-ease-out);
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    }
  }
}

// === STATS OVERVIEW ===
.stats-overview {
  margin-bottom: var(--spacing-6);
  
  .stat-card {
    transition: all var(--transition-normal) var(--easing-ease-out);
    border-radius: var(--border-radius-lg);
    
    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    }
    
    .stat-icon {
      transition: transform var(--transition-normal) var(--easing-bounce);
      
      &:hover {
        transform: scale(1.15) rotate(10deg);
      }
    }
  }
}

// === FILTERS BAR ===
.filters-bar {
  background: rgba(var(--v-theme-surface), 0.95);
  backdrop-filter: blur(8px);
  border-radius: var(--border-radius-lg);
  margin-bottom: var(--spacing-6);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  
  .filter-chip {
    transition: all var(--transition-fast) var(--easing-ease-out);
    
    &:hover {
      transform: scale(1.05);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }
  }
}

// === TABS SECTION ===
.users-tabs {
  .v-tab {
    transition: all var(--transition-fast) var(--easing-ease-out);
    
    &:hover {
      background: rgba(var(--v-theme-primary), 0.05);
      transform: translateY(-1px);
    }
    
    &.v-tab--selected {
      background: rgba(var(--v-theme-primary), 0.1);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
  }
  
  .v-badge .v-badge__badge {
    animation: pulse 2s infinite;
  }
}

// === BULK ACTIONS BAR ===
.bulk-actions-bar {
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
  backdrop-filter: blur(8px);
  margin-bottom: var(--spacing-4);
  
  .v-card {
    background: rgba(var(--v-theme-surface), 0.95);
    border-radius: var(--border-radius-lg);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    border: 1px solid rgba(var(--v-theme-primary), 0.1);
  }
  
  .selected-count {
    color: var(--color-primary);
    font-weight: 600;
  }
  
  .action-btn {
    transition: all var(--transition-normal) var(--easing-ease-out);
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }
  }
}

// === USER CARDS ===
.user-card {
  transition: all var(--transition-normal) var(--easing-ease-out);
  border-radius: var(--border-radius-lg);
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  }
  
  &.selected {
    border-inline-start: 4px solid var(--color-primary);
    box-shadow: 0 0 0 3px rgba(var(--v-theme-primary), 0.1);
  }
  
  .user-avatar {
    transition: transform var(--transition-normal) var(--easing-ease-out);
    
    &:hover {
      transform: scale(1.1);
    }
  }
  
  .user-role-chip {
    transition: transform var(--transition-fast) var(--easing-ease-out);
    
    &:hover {
      transform: scale(1.05);
    }
  }
  
  .action-buttons {
    .v-btn {
      transition: transform var(--transition-normal) var(--easing-ease-out);
      
      &:hover {
        transform: scale(1.1);
      }
    }
  }
}

// === DATA TABLE ENHANCEMENTS ===
.enhanced-data-table {
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  
  .v-data-table__th {
    background: linear-gradient(135deg, 
      rgba(var(--v-theme-primary), 0.05) 0%, 
      rgba(var(--v-theme-surface), 1) 100%);
    color: var(--color-primary);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .v-data-table__tr {
    transition: all var(--transition-fast) var(--easing-ease-out);
    
    &:hover {
      background: rgba(var(--v-theme-primary), 0.02);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    
    &.selected {
      background: rgba(var(--v-theme-primary), 0.05);
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
    }
  }
  
  .user-info-cell {
    display: flex;
    align-items: center;
    gap: var(--spacing-3);
    
    .user-avatar-mini {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 2px solid var(--color-surface);
      transition: transform var(--transition-normal) var(--easing-ease-out);
      
      &:hover {
        transform: scale(1.1);
      }
    }
    
    .user-details {
      .user-name {
        font-weight: 600;
        color: var(--color-primary);
      }
      
      .user-email {
        font-size: 0.875rem;
        color: var(--color-text-secondary);
      }
    }
  }
  
  .status-cell {
    .status-chip {
      transition: transform var(--transition-fast) var(--easing-ease-out);
      
      &:hover {
        transform: scale(1.05);
      }
      
      &.pending {
        animation: statusPulse 2s infinite;
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

// === DIALOGS ===
.user-dialog {
  .v-card {
    border-radius: var(--border-radius-xl);
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  }
  
  .dialog-header {
    background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
    color: white;
    position: relative;
    
    &::before {
      content: '';
      position: absolute;
      inset: 0;
      background: radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1), transparent);
      pointer-events: none;
    }
  }
  
  .dialog-content {
    animation: fadeIn var(--transition-normal) var(--easing-ease-out);
  }
  
  .dialog-actions {
    background: var(--color-surface-alt);
    border-top: 1px solid var(--color-border);
    
    .v-btn {
      transition: transform var(--transition-normal) var(--easing-ease-out);
      
      &:hover {
        transform: translateY(-2px);
      }
    }
  }
}

// === EMPTY STATES ===
.empty-state {
  text-align: center;
  padding: var(--spacing-12) var(--spacing-6);
  
  .empty-card {
    border-radius: var(--border-radius-xl);
    border: 2px dashed rgba(var(--v-theme-primary), 0.2);
    background: linear-gradient(135deg, 
      rgba(var(--v-theme-primary), 0.02) 0%, 
      rgba(var(--v-theme-surface), 1) 100%);
    
    .empty-icon {
      transition: transform var(--transition-normal) var(--easing-bounce);
      
      &:hover {
        transform: scale(1.1);
      }
    }
  }
}

// === ANIMATIONS ===
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

@keyframes statusPulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(var(--v-theme-warning), 0.4);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(var(--v-theme-warning), 0);
  }
}

// === RESPONSIVE DESIGN ===
@media (max-width: 768px) {
  .users-management {
    padding: var(--spacing-4);
  }
  
  .page-header {
    .d-flex {
      flex-direction: column;
      gap: var(--spacing-3);
    }
  }
  
  .stats-overview {
    .v-row {
      margin: 0;
    }
  }
  
  .bulk-actions-bar {
    .v-card {
      padding: var(--spacing-3);
    }
    
    .d-flex {
      flex-direction: column;
      gap: var(--spacing-2);
    }
  }
}

@media (max-width: 600px) {
  .users-management {
    padding: var(--spacing-3);
  }
  
  .user-card {
    margin-bottom: var(--spacing-3);
  }
  
  .enhanced-data-table {
    .user-info-cell {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--spacing-2);
    }
  }
  
  .user-dialog {
    .dialog-header,
    .dialog-content,
    .dialog-actions {
      padding: var(--spacing-4);
    }
  }
}

// === PRINT STYLES ===
@media print {
  .users-management {
    padding: 0;
  }
  
  .quick-actions,
  .filters-bar,
  .bulk-actions-bar {
    display: none !important;
  }
  
  .user-card,
  .enhanced-data-table {
    break-inside: avoid;
    box-shadow: none !important;
    border: 1px solid #ddd;
  }
  
  .user-dialog {
    display: none !important;
  }
}
</style> 
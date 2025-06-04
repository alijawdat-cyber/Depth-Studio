<template>
  <div class="super-admin-dashboard">
    <!-- Page Header -->
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold text-primary mb-2">
          مرحباً، {{ user?.display_name }}
        </h1>
        <p class="text-subtitle-1 text-medium-emphasis">
          لوحة تحكم المدير العام - نظرة شاملة على النظام
        </p>
      </div>
      
      <v-btn
        color="primary"
        variant="elevated"
        prepend-icon="mdi-plus"
        @click="quickAction"
      >
        إضافة سريعة
      </v-btn>
    </div>

    <!-- Stats Cards -->
    <v-row class="mb-6">
      <v-col
        v-for="stat in statsCards"
        :key="stat.title"
        cols="12"
        sm="6"
        md="3"
      >
        <v-card class="stat-card" elevation="2">
          <v-card-text>
            <div class="d-flex align-center">
              <v-avatar
                :color="stat.color"
                size="48"
                class="me-3"
              >
                <v-icon :icon="stat.icon" color="white"></v-icon>
              </v-avatar>
              
              <div class="flex-grow-1">
                <div class="text-h5 font-weight-bold">
                  {{ stat.value }}
                </div>
                <div class="text-body-2 text-medium-emphasis">
                  {{ stat.title }}
                </div>
              </div>
            </div>
            
            <v-progress-linear
              :model-value="stat.progress"
              :color="stat.color"
              height="4"
              class="mt-3"
              rounded
            ></v-progress-linear>
            
            <div class="d-flex justify-space-between align-center mt-2">
              <span class="text-caption text-medium-emphasis">
                {{ stat.subtitle }}
              </span>
              <v-chip
                :color="stat.trend === 'up' ? 'success' : 'error'"
                variant="text"
                size="small"
              >
                <v-icon
                  start
                  :icon="stat.trend === 'up' ? 'mdi-trending-up' : 'mdi-trending-down'"
                ></v-icon>
                {{ stat.change }}
              </v-chip>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Main Content Row -->
    <v-row>
      <!-- Recent Activity -->
      <v-col cols="12" md="8">
        <v-card elevation="2">
          <v-card-title class="d-flex align-center">
            <v-icon class="me-2">mdi-clock-outline</v-icon>
            النشاطات الحديثة
            <v-spacer></v-spacer>
            <v-btn variant="text" size="small">عرض الكل</v-btn>
          </v-card-title>
          
          <v-divider></v-divider>
          
          <v-list lines="two">
            <v-list-item
              v-for="activity in recentActivities"
              :key="activity.id"
              :prepend-avatar="activity.avatar"
              :title="activity.title"
              :subtitle="activity.subtitle"
            >
              <template v-slot:append>
                <v-chip
                  :color="activity.status_color"
                  variant="text"
                  size="small"
                >
                  {{ activity.status }}
                </v-chip>
              </template>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <!-- Quick Actions -->
      <v-col cols="12" md="4">
        <v-card elevation="2" class="mb-4">
          <v-card-title>
            <v-icon class="me-2">mdi-lightning-bolt</v-icon>
            الإجراءات السريعة
          </v-card-title>
          
          <v-divider></v-divider>
          
          <v-card-text>
            <v-list density="compact">
              <v-list-item
                v-for="action in quickActions"
                :key="action.title"
                :prepend-icon="action.icon"
                :title="action.title"
                @click="action.action"
                class="quick-action-item"
              >
                <template v-slot:append>
                  <v-badge
                    v-if="action.badge"
                    :content="action.badge"
                    color="error"
                  >
                    <v-icon>mdi-chevron-left</v-icon>
                  </v-badge>
                  <v-icon v-else>mdi-chevron-left</v-icon>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>

        <!-- Pending Approvals -->
        <v-card elevation="2">
          <v-card-title class="d-flex align-center">
            <v-icon class="me-2">mdi-account-clock</v-icon>
            طلبات الموافقة
            <v-spacer></v-spacer>
            <v-badge
              :content="pendingApprovals.length"
              color="error"
            >
              <v-icon>mdi-bell</v-icon>
            </v-badge>
          </v-card-title>
          
          <v-divider></v-divider>
          
          <v-card-text v-if="pendingApprovals.length === 0" class="text-center">
            <v-icon size="48" color="success" class="mb-2">
              mdi-check-circle
            </v-icon>
            <div class="text-body-2">لا توجد طلبات موافقة</div>
          </v-card-text>
          
          <v-list v-else density="compact">
            <v-list-item
              v-for="approval in pendingApprovals"
              :key="approval.id"
              :title="approval.name"
              :subtitle="approval.role"
              @click="handleApproval(approval.id)"
            >
              <template v-slot:prepend>
                <v-avatar size="32">
                  <v-img :src="approval.avatar"></v-img>
                </v-avatar>
              </template>
              
              <template v-slot:append>
                <div class="d-flex">
                  <v-btn
                    icon="mdi-check"
                    size="small"
                    color="success"
                    variant="text"
                    @click.stop="approveUser(approval.id)"
                  ></v-btn>
                  <v-btn
                    icon="mdi-close"
                    size="small"
                    color="error"
                    variant="text"
                    @click.stop="rejectUser(approval.id)"
                  ></v-btn>
                </div>
              </template>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>

    <!-- Charts Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- Photographer Performance Chart -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">أداء المصورين</h3>
          <v-chip color="indigo" variant="tonal" size="small">
            آخر 6 أشهر
          </v-chip>
        </div>
        <div class="h-80">
          <LineChart 
            :data="photographerPerformanceData"
            :options="lineChartOptions"
            title=""
          />
        </div>
      </div>

      <!-- Brand Distribution Chart -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">توزيع المهام حسب البراندات</h3>
          <v-chip color="green" variant="tonal" size="small">
            هذا الشهر
          </v-chip>
        </div>
        <div class="h-80">
          <PieChart 
            :data="brandDistributionData"
            title=""
          />
        </div>
      </div>

      <!-- Monthly Revenue Chart -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">الإيرادات الشهرية</h3>
          <v-chip color="orange" variant="tonal" size="small">
            2024
          </v-chip>
        </div>
        <div class="h-80">
          <BarChart 
            :data="monthlyRevenueData"
            :options="barChartOptions"
            title=""
          />
        </div>
      </div>

      <!-- Task Status Distribution -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">حالة المهام</h3>
          <v-chip color="blue" variant="tonal" size="small">
            المجموع: {{ taskStatusData.datasets[0].data.reduce((a, b) => a + b, 0) }}
          </v-chip>
        </div>
        <div class="h-80">
          <DoughnutChart 
            :data="taskStatusData"
            :cutout="'60%'"
            :center-content="{
              title: 'إجمالي المهام',
              value: taskStatusData.datasets[0].data.reduce((a, b) => a + b, 0),
              subtitle: 'مهمة'
            }"
            title=""
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useDashboardStore } from '@/stores/dashboard'
import { useRouter } from 'vue-router'

// ======================================
// Stores & Router
// ======================================
const authStore = useAuthStore()
const dashboardStore = useDashboardStore()
const router = useRouter()

// ======================================
// State
// ======================================
const isLoading = ref(false)

// ======================================
// Computed
// ======================================
const user = computed(() => authStore.userProfile)

// 🆕 بيانات الإحصائيات الحقيقية من Store
const statsCards = computed(() => {
  const stats = dashboardStore.currentUserStats
  return [
  {
    title: 'إجمالي المستخدمين',
      value: (stats as any).totalUsers?.toString() || '0',
    subtitle: 'مستخدم نشط',
    icon: 'mdi-account-group',
    color: 'primary',
      progress: Math.min(((stats as any).activeUsers / (stats as any).totalUsers) * 100 || 0, 100),
    change: '+12%',
      trend: 'up' as const
  },
  {
      title: 'البراندات النشطة',
      value: (stats as any).totalBrands?.toString() || '0',
      subtitle: 'براند مسجل',
    icon: 'mdi-store',
    color: 'success',
    progress: 90,
    change: '+2%',
      trend: 'up' as const
  },
  {
      title: 'الحملات الجارية',
      value: (stats as any).totalCampaigns?.toString() || '0',
      subtitle: 'حملة نشطة',
      icon: 'mdi-bullhorn-outline',
      color: 'info',
      progress: 75,
      change: '+8%',
      trend: 'up' as const
    },
    {
      title: 'إجمالي الإيرادات',
      value: `${((stats as any).totalRevenue || 0).toLocaleString()} د.ع`,
    subtitle: 'هذا الشهر',
    icon: 'mdi-cash',
    color: 'warning',
    progress: 85,
    change: '-3%',
      trend: 'down' as const
  }
  ]
})

// 🆕 طلبات الموافقة الحقيقية
const pendingApprovals = computed(() => {
  return dashboardStore.realtimeData.users
    .filter(user => user.status === 'pending_approval')
    .slice(0, 5) // أول 5 طلبات
    .map(user => ({
      id: user.id,
      name: user.display_name || `${user.first_name} ${user.last_name}`,
      role: getRoleDisplayName(user.primary_role),
      avatar: user.profile_photo_url || '/default-avatar.png'
    }))
})

// 🆕 النشاطات الحديثة من البيانات الحقيقية
const recentActivities = computed(() => {
  const activities: any[] = []
  
  // إضافة أنشطة من المستخدمين الجدد
  dashboardStore.realtimeData.users
    .filter(user => user.created_at)
    .slice(0, 3)
    .forEach(user => {
      activities.push({
        id: `user-${user.id}`,
        title: `${user.display_name || user.first_name} انضم للنظام`,
        subtitle: `دور: ${getRoleDisplayName(user.primary_role)} - ${getTimeAgo(user.created_at)}`,
        avatar: user.profile_photo_url || '/default-avatar.png',
        status: user.status === 'active' ? 'نشط' : 'في الانتظار',
        status_color: user.status === 'active' ? 'success' : 'warning'
      })
    })

  // إضافة أنشطة من الحملات الجديدة
  dashboardStore.realtimeData.campaigns
    .slice(0, 2)
    .forEach(campaign => {
      activities.push({
        id: `campaign-${campaign.id}`,
        title: `حملة جديدة: ${campaign.campaign_info?.name || 'حملة غير مسماة'}`,
        subtitle: `إجمالي الميزانية: ${(campaign.budget_management?.total_budget || 0).toLocaleString()} د.ع - ${getTimeAgo(campaign.created_at)}`,
        avatar: '/campaign-icon.png',
        status: getStatusDisplayName(campaign.campaign_status),
        status_color: getStatusColor(campaign.campaign_status)
      })
    })

  return activities.slice(0, 5) // أحدث 5 أنشطة
})

// Quick Actions - تم التحديث ليعكس العدد الحقيقي
const quickActions = computed(() => [
  {
    title: 'إضافة مستخدم جديد',
    icon: 'mdi-account-plus',
    action: () => router.push('/admin/users/create'),
    badge: null
  },
  {
    title: 'إنشاء حملة جديدة',
    icon: 'mdi-bullhorn-outline',
    action: () => router.push('/campaigns/create'),
    badge: null
  },
  {
    title: 'مراجعة طلبات الموافقة',
    icon: 'mdi-account-clock',
    action: () => router.push('/admin/approvals'),
    badge: pendingApprovals.value.length || null
  },
  {
    title: 'تقارير الأداء',
    icon: 'mdi-chart-bar',
    action: () => router.push('/admin/reports'),
    badge: null
  }
])

// Add Chart imports
import LineChart from '@/components/charts/LineChart.vue'
import BarChart from '@/components/charts/BarChart.vue'
import PieChart from '@/components/charts/PieChart.vue'
import DoughnutChart from '@/components/charts/DoughnutChart.vue'

// 🆕 بيانات الرسوم البيانية الحقيقية من Store
const photographerPerformanceData = computed(() => dashboardStore.chartData.lineChart)

const brandDistributionData = computed(() => {
  const brands = dashboardStore.realtimeData.brands
  const labels = brands.slice(0, 5).map(brand => brand.name?.ar || brand.name?.en || 'براند غير مسمى')
  const data = brands.slice(0, 5).map(brand => brand.statistics?.total_campaigns || 0)
  
  return {
    labels: labels.length > 0 ? labels : ['لا توجد بيانات'],
  datasets: [{
      data: data.length > 0 ? data : [1],
    backgroundColor: [
      '#4F46E5', // indigo
      '#EF4444', // red
      '#10B981', // emerald
      '#F59E0B', // amber
      '#8B5CF6'  // violet
    ],
    borderWidth: 2,
    borderColor: '#ffffff'
  }]
  }
})

const monthlyRevenueData = computed(() => dashboardStore.chartData.barChart)

const taskStatusData = computed(() => {
  const tasks = dashboardStore.realtimeData.tasks
  const statusCounts = {
    completed: tasks.filter(t => t.status_tracking?.current_status === 'completed').length,
    in_progress: tasks.filter(t => t.status_tracking?.current_status === 'in_progress').length,
    pending: tasks.filter(t => t.status_tracking?.current_status === 'pending').length,
    overdue: tasks.filter(t => t.status_tracking?.current_status === 'revision_needed').length
  }

  return {
  labels: ['مكتملة', 'قيد التنفيذ', 'معلقة', 'متأخرة'],
  datasets: [{
      data: [statusCounts.completed, statusCounts.in_progress, statusCounts.pending, statusCounts.overdue],
    backgroundColor: [
      '#10B981', // emerald-500 - completed
      '#3B82F6', // blue-500 - in progress
      '#F59E0B', // amber-500 - pending
      '#EF4444'  // red-500 - overdue
    ],
    borderWidth: 3,
    borderColor: '#ffffff'
  }]
  }
})

// Chart options
const lineChartOptions = {
  responsive: true,
  interaction: {
    mode: 'index' as const,
    intersect: false,
  },
  scales: {
    y: {
      type: 'linear' as const,
      display: true,
      position: 'left' as const,
      beginAtZero: true,
      title: {
        display: true,
        text: 'عدد المهام'
      }
    },
    y1: {
      type: 'linear' as const,
      display: true,
      position: 'right' as const,
      grid: {
        drawOnChartArea: false,
      },
      min: 0,
      max: 5,
      title: {
        display: true,
        text: 'التقييم (5/5)'
      }
    },
  },
}

const barChartOptions = {
  responsive: true,
  plugins: {
    legend: {
      display: false
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: function(value: any) {
          return value.toLocaleString() + ' د.ع'
        }
      }
    }
  }
}

// ======================================
// Helper Functions
// ======================================

function getRoleDisplayName(role: string): string {
  const roleNames: Record<string, string> = {
    'super_admin': 'مدير عام',
    'marketing_coordinator': 'منسق تسويق', 
    'brand_coordinator': 'منسق براند',
    'photographer': 'مصور',
    'new_user': 'مستخدم جديد'
  }
  return roleNames[role] || role
}

function getTimeAgo(timestamp: any): string {
  if (!timestamp) return 'غير محدد'
  
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  
  if (diffMins < 60) return `قبل ${diffMins} دقيقة`
  if (diffHours < 24) return `قبل ${diffHours} ساعة`
  return `قبل ${diffDays} يوم`
}

function getStatusDisplayName(status: string): string {
  const statusNames: Record<string, string> = {
    'draft': 'مسودة',
    'scheduled': 'مجدولة',
    'active': 'نشطة',
    'paused': 'متوقفة',
    'completed': 'مكتملة',
    'cancelled': 'ملغية'
  }
  return statusNames[status] || status
}

function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    'draft': 'grey',
    'scheduled': 'blue',
    'active': 'success',
    'paused': 'warning',
    'completed': 'success',
    'cancelled': 'error'
  }
  return statusColors[status] || 'grey'
}

// ======================================
// Methods
// ======================================

/**
 * Quick action button
 */
function quickAction() {
  // Open quick action dialog or navigate
  router.push('/admin/quick-create')
}

/**
 * Handle approval click
 */
function handleApproval(userId: string) {
  router.push(`/admin/users/${userId}/approval`)
}

/**
 * Approve user
 */
async function approveUser(userId: string) {
  try {
    // TODO: Call API to approve user
    console.log('Approving user:', userId)
    
    // Show success message
    // You can add a toast notification here
    
  } catch (error) {
    console.error('Error approving user:', error)
  }
}

/**
 * Reject user
 */
async function rejectUser(userId: string) {
  try {
    // TODO: Call API to reject user
    console.log('Rejecting user:', userId)
    
    // Show success message
    // You can add a toast notification here
    
  } catch (error) {
    console.error('Error rejecting user:', error)
  }
}

/**
 * Load dashboard data
 */
async function loadDashboardData() {
  try {
    isLoading.value = true
    
    // 🆕 تهيئة المستمعين الفوريين
    await dashboardStore.initializeRealtimeListeners()
    
  } catch (error) {
    console.error('Error loading dashboard data:', error)
  } finally {
    isLoading.value = false
  }
}

// ======================================
// Lifecycle
// ======================================
onMounted(() => {
  loadDashboardData()
})

onUnmounted(() => {
  // 🆕 تنظيف المستمعين عند الخروج
  dashboardStore.cleanup()
})
</script>

<style scoped>
.super-admin-dashboard {
  max-width: 1200px;
  margin: 0 auto;
}

.stat-card {
  height: 100%;
  transition: all 0.2s ease-in-out;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.quick-action-item {
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
}

.quick-action-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.04);
}

.chart-placeholder {
  height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

/* RTL support */
[dir="rtl"] .me-2 {
  margin-right: 0;
  margin-left: 8px;
}

[dir="rtl"] .me-3 {
  margin-right: 0;
  margin-left: 12px;
}
</style> 
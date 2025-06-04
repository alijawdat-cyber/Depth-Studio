<template>
  <div class="brand-coordinator-dashboard p-6">
    <!-- Header with NAVA Branding -->
    <div class="flex items-center justify-between mb-8">
      <div class="flex items-center gap-4">
        <div class="bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-xl">
          <img 
            src="/brands/nava-logo.png" 
            alt="NAVA" 
            class="w-12 h-12 object-contain"
            @error="handleImageError"
          />
          <div v-if="!navaBrandLogo" class="w-12 h-12 flex items-center justify-center text-white font-bold text-xl">
            NAVA
          </div>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">لوحة تحكم براند NAVA</h1>
          <p class="text-gray-600 mt-1">مرحباً علي حازم، منسق براند NAVA - إدارة شاملة للعلامة التجارية</p>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <v-chip color="purple" variant="tonal" size="small">
          <v-icon start>mdi-store</v-icon>
          براند NAVA
        </v-chip>
        <v-btn color="primary" prepend-icon="mdi-plus">
          مشروع جديد
        </v-btn>
      </div>
    </div>

    <!-- NAVA Brand Overview -->
    <div class="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 p-6 mb-8">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <!-- Brand Status -->
        <div class="text-center">
          <div class="bg-white rounded-lg p-4 shadow-sm">
            <v-icon size="32" color="purple" class="mb-2">mdi-shield-check</v-icon>
            <h3 class="font-semibold text-gray-900">حالة البراند</h3>
            <p class="text-green-600 font-medium">نشط</p>
          </div>
        </div>
        
        <!-- Budget Remaining -->
        <div class="text-center">
          <div class="bg-white rounded-lg p-4 shadow-sm">
            <v-icon size="32" color="green" class="mb-2">mdi-wallet</v-icon>
            <h3 class="font-semibold text-gray-900">الميزانية المتبقية</h3>
            <p class="text-xl font-bold text-gray-900">{{ brandBudget.remaining.toLocaleString() }} د.ع</p>
          </div>
        </div>
        
        <!-- Projects This Month -->
        <div class="text-center">
          <div class="bg-white rounded-lg p-4 shadow-sm">
            <v-icon size="32" color="blue" class="mb-2">mdi-briefcase</v-icon>
            <h3 class="font-semibold text-gray-900">مشاريع الشهر</h3>
            <p class="text-xl font-bold text-gray-900">{{ monthlyProjects.count }}</p>
          </div>
        </div>
        
        <!-- Client Satisfaction -->
        <div class="text-center">
          <div class="bg-white rounded-lg p-4 shadow-sm">
            <v-icon size="32" color="orange" class="mb-2">mdi-star</v-icon>
            <h3 class="font-semibold text-gray-900">رضا العميل</h3>
            <div class="flex items-center justify-center gap-2 mt-2">
              <v-rating
                :model-value="clientSatisfaction.rating"
                color="amber"
                size="small"
                readonly
                density="compact"
              />
              <span class="text-sm font-medium">{{ clientSatisfaction.rating }}/5</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <!-- Active Projects -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">مشاريع نشطة</p>
            <p class="text-2xl font-bold text-gray-900 mt-1">{{ activeProjects.count }}</p>
          </div>
          <div class="bg-blue-50 p-3 rounded-lg">
            <v-icon size="24" color="blue">mdi-briefcase-outline</v-icon>
          </div>
        </div>
        <div class="flex items-center mt-4">
          <span class="text-sm text-blue-600 font-medium">
            {{ activeProjects.inProgress }} قيد التنفيذ
          </span>
          <span class="text-sm text-gray-500 ml-2">
            {{ activeProjects.pending }} في الانتظار
          </span>
        </div>
      </div>

      <!-- Content Approval -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">محتوى للموافقة</p>
            <p class="text-2xl font-bold text-gray-900 mt-1">{{ contentApproval.count }}</p>
          </div>
          <div class="bg-orange-50 p-3 rounded-lg">
            <v-icon size="24" color="orange">mdi-check-circle</v-icon>
          </div>
        </div>
        <div class="flex items-center mt-4">
          <span class="text-sm text-red-600 font-medium">
            {{ contentApproval.urgent }} عاجل
          </span>
          <span class="text-sm text-gray-500 ml-2">
            يحتاج مراجعة فورية
          </span>
        </div>
      </div>

      <!-- Budget Usage -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">استخدام الميزانية</p>
            <p class="text-2xl font-bold text-gray-900 mt-1">{{ budgetUsage.percentage }}%</p>
          </div>
          <div class="bg-green-50 p-3 rounded-lg">
            <v-icon size="24" color="green">mdi-chart-pie</v-icon>
          </div>
        </div>
        <div class="mt-4">
          <v-progress-linear
            :model-value="budgetUsage.percentage"
            :color="getBudgetColor(budgetUsage.percentage)"
            height="6"
            rounded
          />
          <span class="text-sm text-gray-500 mt-1">
            {{ budgetUsage.used.toLocaleString() }}/{{ budgetUsage.total.toLocaleString() }} د.ع
          </span>
        </div>
      </div>

      <!-- Team Performance -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">أداء الفريق</p>
            <p class="text-2xl font-bold text-gray-900 mt-1">{{ teamPerformance.score }}%</p>
          </div>
          <div class="bg-purple-50 p-3 rounded-lg">
            <v-icon size="24" color="purple">mdi-account-group</v-icon>
          </div>
        </div>
        <div class="flex items-center mt-4">
          <span class="text-sm text-green-600 font-medium">
            {{ teamPerformance.onTime }} في الوقت
          </span>
          <span class="text-sm text-gray-500 ml-2">
            من {{ teamPerformance.total }} مهمة
          </span>
        </div>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Current NAVA Projects -->
      <div class="lg:col-span-2">
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-semibold text-gray-900">مشاريع NAVA الحالية</h3>
            <div class="flex items-center gap-2">
              <v-chip color="purple" variant="outlined" size="small">
                {{ currentProjects.length }} مشروع
              </v-chip>
              <v-btn 
                icon="mdi-refresh" 
                size="small" 
                variant="text"
                @click="refreshProjects"
              />
            </div>
          </div>

          <div class="space-y-4">
            <div 
              v-for="project in currentProjects" 
              :key="project.id"
              class="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <v-icon color="purple">{{ project.icon }}</v-icon>
                </div>
                <div>
                  <h4 class="font-medium text-gray-900">{{ project.title }}</h4>
                  <p class="text-sm text-gray-600">{{ project.description }}</p>
                  <div class="flex items-center gap-2 mt-1">
                    <v-chip 
                      :color="getProjectStatusColor(project.status)" 
                      size="x-small" 
                      variant="tonal"
                    >
                      {{ project.status }}
                    </v-chip>
                    <span class="text-xs text-gray-500">{{ project.deadline }}</span>
                  </div>
                </div>
              </div>
              
              <div class="flex items-center gap-2">
                <v-progress-circular
                  :model-value="project.progress"
                  size="32"
                  width="3"
                  :color="getProjectStatusColor(project.status)"
                >
                  <span class="text-xs">{{ project.progress }}%</span>
                </v-progress-circular>
                <v-btn 
                  icon="mdi-eye" 
                  size="small" 
                  variant="text"
                  @click="viewProject(project.id)"
                />
              </div>
            </div>
          </div>

          <div v-if="currentProjects.length === 0" class="text-center py-8">
            <v-icon size="64" color="gray-300">mdi-briefcase-outline</v-icon>
            <p class="text-gray-500 mt-2">لا توجد مشاريع نشطة</p>
          </div>
        </div>
      </div>

      <!-- Right Sidebar -->
      <div class="space-y-6">
        <!-- Content Approval Queue -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">موافقة المحتوى</h3>
            <v-chip color="orange" variant="tonal" size="small">
              {{ pendingContent.length }} معلق
            </v-chip>
          </div>

          <div class="space-y-3">
            <div 
              v-for="content in pendingContent.slice(0, 3)" 
              :key="content.id"
              class="flex items-center gap-3 p-3 border border-gray-200 rounded-lg"
            >
              <img 
                :src="content.thumbnail" 
                :alt="content.title"
                class="w-12 h-12 rounded-lg object-cover"
              />
              <div class="flex-1">
                <h4 class="font-medium text-gray-900 text-sm">{{ content.title }}</h4>
                <p class="text-xs text-gray-600">{{ content.photographer }}</p>
                <div class="flex items-center gap-2 mt-1">
                  <v-chip 
                    :color="content.priority === 'عاجل' ? 'red' : 'orange'" 
                    size="x-small" 
                    variant="tonal"
                  >
                    {{ content.priority }}
                  </v-chip>
                </div>
              </div>
              <div class="flex flex-col gap-1">
                <v-btn 
                  color="green" 
                  size="x-small" 
                  variant="tonal"
                  @click="approveContent(content.id)"
                >
                  موافقة
                </v-btn>
                <v-btn 
                  color="red" 
                  size="x-small" 
                  variant="tonal"
                  @click="requestRevision(content.id)"
                >
                  تعديل
                </v-btn>
              </div>
            </div>
          </div>

          <v-btn 
            v-if="pendingContent.length > 3"
            text="عرض الكل"
            variant="text" 
            size="small"
            class="w-full mt-3"
            @click="viewAllContent"
          />
        </div>

        <!-- NAVA Client Communication -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">التواصل مع NAVA</h3>
          
          <div class="space-y-3">
            <v-btn 
              block 
              color="purple" 
              variant="tonal"
              prepend-icon="mdi-phone"
              @click="callClient"
            >
              اتصال مع العميل
            </v-btn>
            
            <v-btn 
              block 
              color="blue" 
              variant="tonal"
              prepend-icon="mdi-email"
              @click="emailClient"
            >
              إرسال بريد إلكتروني
            </v-btn>
            
            <v-btn 
              block 
              color="green" 
              variant="tonal"
              prepend-icon="mdi-whatsapp"
              @click="whatsappClient"
            >
              رسالة واتساب
            </v-btn>
            
            <v-btn 
              block 
              color="orange" 
              variant="tonal"
              prepend-icon="mdi-calendar"
              @click="scheduleeMeeting"
            >
              جدولة اجتماع
            </v-btn>
          </div>
        </div>

        <!-- Quick Reports -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">تقارير NAVA</h3>
          
          <div class="space-y-3">
            <div class="p-3 border border-gray-200 rounded-lg">
              <h4 class="font-medium text-gray-900 text-sm">تقرير الأداء الشهري</h4>
              <p class="text-xs text-gray-600 mt-1">آخر تحديث: اليوم</p>
              <v-btn 
                size="x-small" 
                color="blue" 
                variant="text"
                class="mt-2"
                @click="downloadReport('monthly')"
              >
                تحميل PDF
              </v-btn>
            </div>
            
            <div class="p-3 border border-gray-200 rounded-lg">
              <h4 class="font-medium text-gray-900 text-sm">تقرير المحتوى</h4>
              <p class="text-xs text-gray-600 mt-1">آخر تحديث: أمس</p>
              <v-btn 
                size="x-small" 
                color="blue" 
                variant="text"
                class="mt-2"
                @click="downloadReport('content')"
              >
                تحميل PDF
              </v-btn>
            </div>
            
            <div class="p-3 border border-gray-200 rounded-lg">
              <h4 class="font-medium text-gray-900 text-sm">تقرير الميزانية</h4>
              <p class="text-xs text-gray-600 mt-1">آخر تحديث: منذ 3 أيام</p>
              <v-btn 
                size="x-small" 
                color="blue" 
                variant="text"
                class="mt-2"
                @click="downloadReport('budget')"
              >
                تحميل PDF
              </v-btn>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- NAVA Analytics Charts -->
    <div class="mt-8">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- NAVA Project Timeline -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">جدولة مشاريع NAVA</h3>
            <v-chip color="purple" variant="tonal" size="small">
              هذا الربع
            </v-chip>
          </div>
          <div class="h-64">
            <!-- Timeline chart will go here -->
            <div class="flex items-center justify-center h-full border-2 border-dashed border-gray-300 rounded-lg">
              <div class="text-center">
                <v-icon size="48" color="gray-300">mdi-chart-timeline</v-icon>
                <p class="text-gray-500 mt-2">مخطط زمني للمشاريع</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Budget Breakdown -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">توزيع الميزانية</h3>
            <v-chip color="green" variant="tonal" size="small">
              2024
            </v-chip>
          </div>
          <div class="h-64">
            <!-- Budget breakdown chart will go here -->
            <div class="flex items-center justify-center h-full border-2 border-dashed border-gray-300 rounded-lg">
              <div class="text-center">
                <v-icon size="48" color="gray-300">mdi-chart-donut</v-icon>
                <p class="text-gray-500 mt-2">تفصيل الميزانية</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

// ======================================
// Router
// ======================================
const router = useRouter()

// ======================================
// Data
// ======================================
const navaBrandLogo = ref(false)

// NAVA Brand Overview
const brandBudget = ref({
  remaining: 75000,
  total: 120000
})

const monthlyProjects = ref({
  count: 8
})

const clientSatisfaction = ref({
  rating: 4.7
})

// Stats
const activeProjects = ref({
  count: 5,
  inProgress: 3,
  pending: 2
})

const contentApproval = ref({
  count: 7,
  urgent: 2
})

const budgetUsage = ref({
  percentage: 63,
  used: 75000,
  total: 120000
})

const teamPerformance = ref({
  score: 92,
  onTime: 18,
  total: 20
})

// Current Projects
const currentProjects = ref([
  {
    id: 1,
    title: 'حملة NAVA الشتوية 2024',
    description: 'مجموعة صور منتجات الشتاء الجديدة',
    status: 'قيد التنفيذ',
    progress: 75,
    deadline: 'خلال 5 أيام',
    icon: 'mdi-snowflake'
  },
  {
    id: 2,
    title: 'فيديو ترويجي للمجموعة الجديدة',
    description: 'إنتاج فيديو ترويجي لمجموعة الربيع',
    status: 'مراجعة',
    progress: 90,
    deadline: 'خلال 3 أيام',
    icon: 'mdi-video'
  },
  {
    id: 3,
    title: 'جلسة تصوير كتالوج',
    description: 'تصوير منتجات الكتالوج الجديد',
    status: 'جديد',
    progress: 25,
    deadline: 'خلال أسبوع',
    icon: 'mdi-camera'
  },
  {
    id: 4,
    title: 'تحديث الهوية البصرية',
    description: 'تطوير عناصر الهوية البصرية',
    status: 'في التخطيط',
    progress: 10,
    deadline: 'خلال أسبوعين',
    icon: 'mdi-palette'
  }
])

// Pending Content
const pendingContent = ref([
  {
    id: 1,
    title: 'صور منتجات الشتاء - المجموعة الأولى',
    photographer: 'أحمد محمد',
    thumbnail: 'https://picsum.photos/100/100?random=11',
    priority: 'عاجل'
  },
  {
    id: 2,
    title: 'فيديو ترويجي - النسخة الأولى',
    photographer: 'فاطمة علي',
    thumbnail: 'https://picsum.photos/100/100?random=12',
    priority: 'عادي'
  },
  {
    id: 3,
    title: 'صور الكتالوج - قسم الإكسسوارات',
    photographer: 'محمد حسن',
    thumbnail: 'https://picsum.photos/100/100?random=13',
    priority: 'عاجل'
  },
  {
    id: 4,
    title: 'تصميم البوستر الترويجي',
    photographer: 'سارة أحمد',
    thumbnail: 'https://picsum.photos/100/100?random=14',
    priority: 'عادي'
  }
])

// ======================================
// Methods
// ======================================
function handleImageError(event: Event) {
  const target = event.target as HTMLImageElement
  if (target) {
    target.style.display = 'none'
  }
}

function refreshProjects() {
  console.log('Refreshing NAVA projects...')
}

function viewProject(projectId: number) {
  router.push(`/projects/${projectId}`)
}

function getProjectStatusColor(status: string) {
  switch (status) {
    case 'قيد التنفيذ': return 'blue'
    case 'مراجعة': return 'orange'
    case 'مكتمل': return 'green'
    case 'جديد': return 'purple'
    case 'في التخطيط': return 'gray'
    default: return 'gray'
  }
}

function getBudgetColor(percentage: number) {
  if (percentage <= 50) return 'green'
  if (percentage <= 80) return 'orange'
  return 'red'
}

function approveContent(contentId: number) {
  console.log('Approving NAVA content:', contentId)
  const index = pendingContent.value.findIndex(c => c.id === contentId)
  if (index > -1) {
    pendingContent.value.splice(index, 1)
    contentApproval.value.count--
  }
}

function requestRevision(contentId: number) {
  console.log('Requesting revision for content:', contentId)
  router.push(`/content/${contentId}/revision`)
}

function viewAllContent() {
  router.push('/nava/content')
}

// Client Communication
function callClient() {
  console.log('Calling NAVA client...')
}

function emailClient() {
  router.push('/communication/email/nava')
}

function whatsappClient() {
  console.log('Opening WhatsApp for NAVA...')
}

function scheduleeMeeting() {
  router.push('/meetings/schedule/nava')
}

// Reports
function downloadReport(type: string) {
  console.log(`Downloading ${type} report for NAVA...`)
}

// ======================================
// Lifecycle
// ======================================
onMounted(() => {
  // Load NAVA specific data
})
</script>

<style scoped>
.brand-coordinator-dashboard {
  min-height: 100vh;
  background-color: #f8fafc;
}

/* NAVA Brand Colors */
.nava-primary {
  background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%);
}

.nava-card {
  border-left: 4px solid #8B5CF6;
}

/* Project card hover effects */
.project-card {
  transition: all 0.2s ease;
  cursor: pointer;
}

.project-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.1);
}

/* Progress indicators */
.progress-ring {
  transition: all 0.3s ease;
}

/* Brand specific styling */
.brand-header {
  background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%);
  color: white;
}
</style> 
<template>
  <div class="photographer-dashboard p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div class="flex items-center gap-4">
        <div class="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl">
          <v-icon size="32" color="white">mdi-camera</v-icon>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">لوحة تحكم المصور</h1>
          <p class="text-gray-600 mt-1">
            مرحباً {{ photographerName }}، 
            {{ contractType === 'freelancer' ? 'مصور مستقل' : 'مصور موظف' }} - 
            تخصص {{ specialization }}
          </p>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <v-chip :color="getStatusColor(photographerStatus)" variant="tonal" size="small">
          <v-icon start>mdi-circle</v-icon>
          {{ photographerStatus }}
        </v-chip>
        <v-btn color="primary" prepend-icon="mdi-plus">
          رفع محتوى
        </v-btn>
      </div>
    </div>

    <!-- Earnings Overview (Contract Type Specific) -->
    <div v-if="contractType === 'freelancer'" class="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200 p-6 mb-8">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <!-- Monthly Earnings -->
        <div class="text-center">
          <div class="bg-white rounded-lg p-4 shadow-sm">
            <v-icon size="32" color="green" class="mb-2">mdi-cash</v-icon>
            <h3 class="font-semibold text-gray-900">أرباح الشهر</h3>
            <p class="text-xl font-bold text-gray-900">{{ monthlyEarnings.current.toLocaleString() }} د.ع</p>
          </div>
        </div>
        
        <!-- Pending Payments -->
        <div class="text-center">
          <div class="bg-white rounded-lg p-4 shadow-sm">
            <v-icon size="32" color="orange" class="mb-2">mdi-clock-outline</v-icon>
            <h3 class="font-semibold text-gray-900">مدفوعات معلقة</h3>
            <p class="text-xl font-bold text-gray-900">{{ pendingPayments.amount.toLocaleString() }} د.ع</p>
          </div>
        </div>
        
        <!-- Monthly Target -->
        <div class="text-center">
          <div class="bg-white rounded-lg p-4 shadow-sm">
            <v-icon size="32" color="blue" class="mb-2">mdi-target</v-icon>
            <h3 class="font-semibold text-gray-900">الهدف الشهري</h3>
            <p class="text-xl font-bold text-gray-900">{{ monthlyTarget.amount.toLocaleString() }} د.ع</p>
          </div>
        </div>
        
        <!-- Target Progress -->
        <div class="text-center">
          <div class="bg-white rounded-lg p-4 shadow-sm">
            <v-icon size="32" color="purple" class="mb-2">mdi-progress-check</v-icon>
            <h3 class="font-semibold text-gray-900">تقدم الهدف</h3>
            <div class="flex items-center justify-center gap-2 mt-2">
              <v-progress-circular
                :model-value="targetProgress.percentage"
                size="32"
                width="3"
                color="purple"
              >
                <span class="text-xs">{{ targetProgress.percentage }}%</span>
              </v-progress-circular>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Employee Salary Overview -->
    <div v-else class="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200 p-6 mb-8">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <!-- Monthly Salary -->
        <div class="text-center">
          <div class="bg-white rounded-lg p-4 shadow-sm">
            <v-icon size="32" color="indigo" class="mb-2">mdi-wallet</v-icon>
            <h3 class="font-semibold text-gray-900">الراتب الشهري</h3>
            <p class="text-xl font-bold text-gray-900">{{ monthlySalary.amount.toLocaleString() }} د.ع</p>
          </div>
        </div>
        
        <!-- Overtime Bonus -->
        <div class="text-center">
          <div class="bg-white rounded-lg p-4 shadow-sm">
            <v-icon size="32" color="green" class="mb-2">mdi-plus-circle</v-icon>
            <h3 class="font-semibold text-gray-900">مكافآت إضافية</h3>
            <p class="text-xl font-bold text-gray-900">{{ overtimeBonus.amount.toLocaleString() }} د.ع</p>
          </div>
        </div>
        
        <!-- Performance Rating -->
        <div class="text-center">
          <div class="bg-white rounded-lg p-4 shadow-sm">
            <v-icon size="32" color="amber" class="mb-2">mdi-star</v-icon>
            <h3 class="font-semibold text-gray-900">تقييم الأداء</h3>
            <div class="flex items-center justify-center gap-2 mt-2">
              <v-rating
                :model-value="performanceRating.score"
                color="amber"
                size="small"
                readonly
                density="compact"
              />
              <span class="text-sm font-medium">{{ performanceRating.score }}/5</span>
            </div>
          </div>
        </div>
        
        <!-- Next Payment -->
        <div class="text-center">
          <div class="bg-white rounded-lg p-4 shadow-sm">
            <v-icon size="32" color="blue" class="mb-2">mdi-calendar-clock</v-icon>
            <h3 class="font-semibold text-gray-900">الدفعة القادمة</h3>
            <p class="text-sm font-medium text-gray-900">{{ nextPaymentDate }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <!-- Active Tasks -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">مهامي النشطة</p>
            <p class="text-2xl font-bold text-gray-900 mt-1">{{ activeTasks.count }}</p>
          </div>
          <div class="bg-blue-50 p-3 rounded-lg">
            <v-icon size="24" color="blue">mdi-clipboard-list</v-icon>
          </div>
        </div>
        <div class="flex items-center mt-4">
          <span class="text-sm text-blue-600 font-medium">
            {{ activeTasks.today }} لليوم
          </span>
          <span class="text-sm text-gray-500 ml-2">
            {{ activeTasks.thisWeek }} للأسبوع
          </span>
        </div>
      </div>

      <!-- Completed Tasks -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">مهام مكتملة</p>
            <p class="text-2xl font-bold text-gray-900 mt-1">{{ completedTasks.count }}</p>
          </div>
          <div class="bg-green-50 p-3 rounded-lg">
            <v-icon size="24" color="green">mdi-check-circle</v-icon>
          </div>
        </div>
        <div class="flex items-center mt-4">
          <span class="text-sm text-green-600 font-medium">
            {{ completedTasks.thisMonth }} هذا الشهر
          </span>
          <span class="text-sm text-gray-500 ml-2">
            +{{ completedTasks.improvement }}% تحسن
          </span>
        </div>
      </div>

      <!-- Upload Queue -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">محتوى للرفع</p>
            <p class="text-2xl font-bold text-gray-900 mt-1">{{ uploadQueue.count }}</p>
          </div>
          <div class="bg-orange-50 p-3 rounded-lg">
            <v-icon size="24" color="orange">mdi-cloud-upload</v-icon>
          </div>
        </div>
        <div class="flex items-center mt-4">
          <span class="text-sm text-orange-600 font-medium">
            {{ uploadQueue.pending }} في الانتظار
          </span>
          <span class="text-sm text-gray-500 ml-2">
            {{ uploadQueue.processing }} قيد المعالجة
          </span>
        </div>
      </div>

      <!-- Rating -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">متوسط التقييم</p>
            <p class="text-2xl font-bold text-gray-900 mt-1">{{ overallRating.score }}/5</p>
          </div>
          <div class="bg-purple-50 p-3 rounded-lg">
            <v-icon size="24" color="purple">mdi-star-outline</v-icon>
          </div>
        </div>
        <div class="flex items-center mt-4">
          <v-rating
            :model-value="overallRating.score"
            color="amber"
            size="small"
            readonly
            density="compact"
          />
          <span class="text-sm text-gray-500 ml-2">
            {{ overallRating.reviews }} تقييم
          </span>
        </div>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Today's Tasks -->
      <div class="lg:col-span-2">
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-semibold text-gray-900">مهام اليوم</h3>
            <div class="flex items-center gap-2">
              <v-chip color="blue" variant="outlined" size="small">
                {{ todayTasks.length }} مهمة
              </v-chip>
              <v-btn 
                icon="mdi-map" 
                size="small" 
                variant="text"
                @click="openMapView"
              />
            </div>
          </div>

          <div class="space-y-4">
            <div 
              v-for="task in todayTasks" 
              :key="task.id"
              class="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <v-icon color="blue">{{ getTaskIcon(task.type) }}</v-icon>
                </div>
                <div>
                  <h4 class="font-medium text-gray-900">{{ task.title }}</h4>
                  <p class="text-sm text-gray-600">{{ task.brand }} - {{ task.location }}</p>
                  <div class="flex items-center gap-2 mt-1">
                    <v-chip 
                      :color="getTaskStatusColor(task.status)" 
                      size="x-small" 
                      variant="tonal"
                    >
                      {{ task.status }}
                    </v-chip>
                    <span class="text-xs text-gray-500">{{ task.time }}</span>
                    <span class="text-xs text-gray-500">• {{ task.duration }}</span>
                  </div>
                </div>
              </div>
              
              <div class="flex items-center gap-2">
                <v-btn 
                  v-if="task.status === 'جديد'"
                  color="green" 
                  size="small" 
                  variant="tonal"
                  @click="startTask(task.id)"
                >
                  بدء
                </v-btn>
                <v-btn 
                  v-else-if="task.status === 'قيد التنفيذ'"
                  color="orange" 
                  size="small" 
                  variant="tonal"
                  @click="uploadContent(task.id)"
                >
                  رفع محتوى
                </v-btn>
                <v-btn 
                  icon="mdi-eye" 
                  size="small" 
                  variant="text"
                  @click="viewTask(task.id)"
                />
                <v-btn 
                  icon="mdi-map-marker" 
                  size="small" 
                  variant="text"
                  @click="openLocation(task.location)"
                />
              </div>
            </div>
          </div>

          <div v-if="todayTasks.length === 0" class="text-center py-8">
            <v-icon size="64" color="gray-300">mdi-calendar-check</v-icon>
            <p class="text-gray-500 mt-2">لا توجد مهام لليوم</p>
            <v-btn 
              color="primary" 
              variant="tonal" 
              class="mt-4"
              @click="viewAvailableTasks"
            >
              عرض المهام المتاحة
            </v-btn>
          </div>
        </div>
      </div>

      <!-- Right Sidebar -->
      <div class="space-y-6">
        <!-- Quick Upload -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">رفع سريع</h3>
            <v-icon color="blue">mdi-upload</v-icon>
          </div>

          <div class="space-y-3">
            <v-btn 
              block 
              color="blue" 
              variant="tonal"
              prepend-icon="mdi-camera"
              @click="uploadPhotos"
            >
              رفع صور
            </v-btn>
            
            <v-btn 
              block 
              color="purple" 
              variant="tonal"
              prepend-icon="mdi-video"
              @click="uploadVideos"
            >
              رفع فيديوهات
            </v-btn>
            
            <v-btn 
              block 
              color="green" 
              variant="tonal"
              prepend-icon="mdi-file-multiple"
              @click="bulkUpload"
            >
              رفع متعدد
            </v-btn>
          </div>

          <!-- Upload Progress -->
          <div v-if="uploadProgress.active" class="mt-4 p-3 bg-blue-50 rounded-lg">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-blue-900">جاري الرفع...</span>
              <span class="text-sm text-blue-700">{{ uploadProgress.percentage }}%</span>
            </div>
            <v-progress-linear
              :model-value="uploadProgress.percentage"
              color="blue"
              height="6"
              rounded
            />
            <span class="text-xs text-blue-600 mt-1">
              {{ uploadProgress.current }}/{{ uploadProgress.total }} ملف
            </span>
          </div>
        </div>

        <!-- Available Tasks -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">مهام متاحة</h3>
            <v-chip color="green" variant="tonal" size="small">
              {{ availableTasks.length }} متاح
            </v-chip>
          </div>

          <div class="space-y-3">
            <div 
              v-for="task in availableTasks.slice(0, 3)" 
              :key="task.id"
              class="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              @click="viewAvailableTask(task.id)"
            >
              <h4 class="font-medium text-gray-900 text-sm">{{ task.title }}</h4>
              <p class="text-xs text-gray-600">{{ task.brand }} - {{ task.location }}</p>
              <div class="flex items-center justify-between mt-2">
                <v-chip 
                  :color="task.priority === 'عالي' ? 'red' : 'orange'" 
                  size="x-small" 
                  variant="tonal"
                >
                  {{ task.priority }}
                </v-chip>
                <span class="text-xs text-green-600 font-medium">
                  {{ task.payment.toLocaleString() }} د.ع
                </span>
              </div>
            </div>
          </div>

          <v-btn 
            v-if="availableTasks.length > 3"
            text="عرض الكل"
            variant="text" 
            size="small"
            class="w-full mt-3"
            @click="viewAllAvailableTasks"
          />
        </div>

        <!-- My Statistics -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">إحصائياتي</h3>
          
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">مهام مكتملة</span>
              <span class="font-medium">{{ myStats.tasksCompleted }}</span>
            </div>
            
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">ساعات العمل</span>
              <span class="font-medium">{{ myStats.workHours }}h</span>
            </div>
            
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">مشاريع نشطة</span>
              <span class="font-medium">{{ myStats.activeProjects }}</span>
            </div>
            
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">تقييم العملاء</span>
              <span class="font-medium">{{ myStats.clientRating }}/5</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Weekly Schedule -->
    <div class="mt-8">
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-gray-900">جدولي الأسبوعي</h3>
          <div class="flex items-center gap-2">
            <v-btn icon="mdi-chevron-left" size="small" variant="text" @click="previousWeek" />
            <span class="text-sm font-medium text-gray-700 px-4">
              {{ currentWeekRange }}
            </span>
            <v-btn icon="mdi-chevron-right" size="small" variant="text" @click="nextWeek" />
          </div>
        </div>

        <div class="grid grid-cols-7 gap-4">
          <div 
            v-for="day in weekDays" 
            :key="day.date"
            class="text-center"
          >
            <h4 class="font-medium text-gray-900 mb-2">{{ day.name }}</h4>
            <div class="text-sm text-gray-600 mb-3">{{ day.date }}</div>
            <div class="space-y-2">
              <div 
                v-for="task in day.tasks" 
                :key="task.id"
                class="p-2 rounded text-xs cursor-pointer"
                :class="getTaskCalendarColor(task.status)"
                @click="viewTask(task.id)"
              >
                <div class="font-medium">{{ task.title }}</div>
                <div class="opacity-75">{{ task.time }}</div>
              </div>
            </div>
            <div v-if="day.tasks.length === 0" class="text-xs text-gray-400 p-2">
              يوم حر
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
const photographerName = ref('أحمد محمد') // This will come from auth store
const contractType = ref<'freelancer' | 'employee'>('freelancer') // Dynamic based on user profile
const specialization = ref('تصوير منتجات') // From user profile
const photographerStatus = ref('متاح') // متاح، مشغول، في إجازة

// Freelancer specific data
const monthlyEarnings = ref({
  current: 850000,
  target: 1200000
})

const pendingPayments = ref({
  amount: 320000,
  tasks: 8
})

const monthlyTarget = ref({
  amount: 1200000
})

const targetProgress = ref({
  percentage: 71
})

// Employee specific data
const monthlySalary = ref({
  amount: 800000
})

const overtimeBonus = ref({
  amount: 150000
})

const performanceRating = ref({
  score: 4.5
})

const nextPaymentDate = ref('25 ديسمبر')

// General stats
const activeTasks = ref({
  count: 6,
  today: 2,
  thisWeek: 6
})

const completedTasks = ref({
  count: 45,
  thisMonth: 12,
  improvement: 15
})

const uploadQueue = ref({
  count: 8,
  pending: 5,
  processing: 3
})

const overallRating = ref({
  score: 4.3,
  reviews: 28
})

// Today's tasks
const todayTasks = ref([
  {
    id: 1,
    title: 'تصوير منتجات NAVA الشتوية',
    brand: 'NAVA',
    location: 'الكرادة، بغداد',
    status: 'جديد',
    time: '10:00 ص',
    duration: '3 ساعات',
    type: 'products'
  },
  {
    id: 2,
    title: 'جلسة تصوير ماكسيم',
    brand: 'ماكسيم',
    location: 'الجادرية، بغداد',
    status: 'قيد التنفيذ',
    time: '2:00 م',
    duration: '2 ساعة',
    type: 'portrait'
  }
])

// Available tasks
const availableTasks = ref([
  {
    id: 3,
    title: 'تصوير حدث سكاي تريد',
    brand: 'سكاي تريد',
    location: 'المنصور، بغداد',
    priority: 'عالي',
    payment: 450000,
    type: 'event'
  },
  {
    id: 4,
    title: 'فيديو ترويجي لهيل كومباني',
    brand: 'هيل كومباني',
    location: 'الزيونة، بغداد',
    priority: 'متوسط',
    payment: 680000,
    type: 'video'
  },
  {
    id: 5,
    title: 'جلسة تصوير أستوديو',
    brand: 'عام',
    location: 'الكاظمية، بغداد',
    priority: 'منخفض',
    payment: 250000,
    type: 'studio'
  }
])

// Upload progress
const uploadProgress = ref({
  active: false,
  percentage: 0,
  current: 0,
  total: 0
})

// My statistics
const myStats = ref({
  tasksCompleted: 145,
  workHours: 240,
  activeProjects: 8,
  clientRating: 4.3
})

// Weekly schedule
const currentWeek = ref(new Date())
const weekDays = ref([
  {
    name: 'الأحد',
    date: '15 ديسمبر',
    tasks: [
      { id: 1, title: 'تصوير NAVA', time: '10:00', status: 'جديد' },
      { id: 2, title: 'مراجعة محتوى', time: '14:00', status: 'مكتمل' }
    ]
  },
  {
    name: 'الاثنين',
    date: '16 ديسمبر',
    tasks: [
      { id: 3, title: 'جلسة ماكسيم', time: '14:00', status: 'قيد التنفيذ' }
    ]
  },
  {
    name: 'الثلاثاء',
    date: '17 ديسمبر',
    tasks: []
  },
  {
    name: 'الأربعاء',
    date: '18 ديسمبر',
    tasks: [
      { id: 4, title: 'حدث سكاي تريد', time: '11:00', status: 'جديد' }
    ]
  },
  {
    name: 'الخميس',
    date: '19 ديسمبر',
    tasks: [
      { id: 5, title: 'فيديو هيل', time: '09:00', status: 'جديد' }
    ]
  },
  {
    name: 'الجمعة',
    date: '20 ديسمبر',
    tasks: []
  },
  {
    name: 'السبت',
    date: '21 ديسمبر',
    tasks: []
  }
])

// ======================================
// Computed
// ======================================
const currentWeekRange = computed(() => {
  const startDate = new Date(currentWeek.value)
  const endDate = new Date(startDate)
  endDate.setDate(startDate.getDate() + 6)
  
  return `${startDate.getDate()} - ${endDate.getDate()} ديسمبر 2024`
})

// ======================================
// Methods
// ======================================
function getStatusColor(status: string) {
  switch (status) {
    case 'متاح': return 'green'
    case 'مشغول': return 'orange'
    case 'في إجازة': return 'red'
    default: return 'gray'
  }
}

function getTaskIcon(type: string) {
  switch (type) {
    case 'products': return 'mdi-package-variant'
    case 'portrait': return 'mdi-account'
    case 'event': return 'mdi-calendar-star'
    case 'video': return 'mdi-video'
    case 'studio': return 'mdi-camera-burst'
    default: return 'mdi-camera'
  }
}

function getTaskStatusColor(status: string) {
  switch (status) {
    case 'جديد': return 'blue'
    case 'قيد التنفيذ': return 'orange'
    case 'مكتمل': return 'green'
    case 'متأخر': return 'red'
    default: return 'gray'
  }
}

function getTaskCalendarColor(status: string) {
  switch (status) {
    case 'جديد': return 'bg-blue-100 text-blue-800'
    case 'قيد التنفيذ': return 'bg-orange-100 text-orange-800'
    case 'مكتمل': return 'bg-green-100 text-green-800'
    case 'متأخر': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

// Task actions
function startTask(taskId: number) {
  console.log('Starting task:', taskId)
  const task = todayTasks.value.find(t => t.id === taskId)
  if (task) {
    task.status = 'قيد التنفيذ'
  }
}

function uploadContent(taskId: number) {
  console.log('Uploading content for task:', taskId)
  router.push(`/tasks/${taskId}/upload`)
}

function viewTask(taskId: number) {
  router.push(`/tasks/${taskId}`)
}

function openLocation(location: string) {
  console.log('Opening location:', location)
  // Open Google Maps or navigation app
}

function openMapView() {
  router.push('/tasks/map')
}

// Upload actions
function uploadPhotos() {
  router.push('/upload/photos')
}

function uploadVideos() {
  router.push('/upload/videos')
}

function bulkUpload() {
  router.push('/upload/bulk')
}

// Available tasks
function viewAvailableTask(taskId: number) {
  router.push(`/tasks/available/${taskId}`)
}

function viewAvailableTasks() {
  router.push('/tasks/available')
}

function viewAllAvailableTasks() {
  router.push('/tasks/available')
}

// Calendar navigation
function previousWeek() {
  const newDate = new Date(currentWeek.value)
  newDate.setDate(newDate.getDate() - 7)
  currentWeek.value = newDate
}

function nextWeek() {
  const newDate = new Date(currentWeek.value)
  newDate.setDate(newDate.getDate() + 7)
  currentWeek.value = newDate
}

// ======================================
// Lifecycle
// ======================================
onMounted(() => {
  // Load photographer specific data
  // This will be based on the authenticated user's profile
})
</script>

<style scoped>
.photographer-dashboard {
  min-height: 100vh;
  background-color: #f8fafc;
}

/* Task card hover effects */
.task-card {
  transition: all 0.2s ease;
  cursor: pointer;
}

.task-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Progress indicators */
.upload-progress {
  transition: all 0.3s ease;
}

/* Calendar styling */
.calendar-day {
  min-height: 120px;
}

.task-slot {
  transition: all 0.2s ease;
  cursor: pointer;
}

.task-slot:hover {
  transform: scale(1.02);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .photographer-dashboard {
    padding: 1rem;
  }
  
  .grid-cols-7 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
    gap: 1rem;
  }
}
</style> 
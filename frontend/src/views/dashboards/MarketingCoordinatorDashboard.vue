<template>
  <div class="marketing-dashboard p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">لوحة تحكم منسق التسويق</h1>
        <p class="text-gray-600 mt-1">مرحباً حسن هاشم، إليك نظرة شاملة على أنشطة التسويق</p>
      </div>
      <div class="flex items-center gap-3">
        <v-chip color="green" variant="tonal">
          <v-icon start>mdi-calendar-today</v-icon>
          {{ currentDate }}
        </v-chip>
        <v-btn color="primary" prepend-icon="mdi-plus">
          مهمة جديدة
        </v-btn>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <!-- Today's Tasks -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">مهام اليوم</p>
            <p class="text-2xl font-bold text-gray-900 mt-1">{{ todayStats.tasks }}</p>
          </div>
          <div class="bg-blue-50 p-3 rounded-lg">
            <v-icon size="24" color="blue">mdi-calendar-check</v-icon>
          </div>
        </div>
        <div class="flex items-center mt-4">
          <span class="text-sm text-green-600 font-medium">
            {{ todayStats.completed }} مكتملة
          </span>
          <span class="text-sm text-gray-500 ml-2">
            من أصل {{ todayStats.total }}
          </span>
        </div>
      </div>

      <!-- Pending Reviews -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">مراجعات معلقة</p>
            <p class="text-2xl font-bold text-gray-900 mt-1">{{ pendingReviews.count }}</p>
          </div>
          <div class="bg-orange-50 p-3 rounded-lg">
            <v-icon size="24" color="orange">mdi-file-clock</v-icon>
          </div>
        </div>
        <div class="flex items-center mt-4">
          <span class="text-sm text-orange-600 font-medium">
            {{ pendingReviews.urgent }} عاجل
          </span>
          <span class="text-sm text-gray-500 ml-2">
            يحتاج مراجعة فورية
          </span>
        </div>
      </div>

      <!-- This Week Progress -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">إنجاز الأسبوع</p>
            <p class="text-2xl font-bold text-gray-900 mt-1">{{ weekProgress.percentage }}%</p>
          </div>
          <div class="bg-green-50 p-3 rounded-lg">
            <v-icon size="24" color="green">mdi-chart-line</v-icon>
          </div>
        </div>
        <div class="mt-4">
          <v-progress-linear
            :model-value="weekProgress.percentage"
            color="green"
            height="6"
            rounded
          />
          <span class="text-sm text-gray-500 mt-1">
            {{ weekProgress.completed }}/{{ weekProgress.total }} مهمة
          </span>
        </div>
      </div>

      <!-- Team Performance -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">أداء الفريق</p>
            <p class="text-2xl font-bold text-gray-900 mt-1">{{ teamPerformance.rating }}/5</p>
          </div>
          <div class="bg-purple-50 p-3 rounded-lg">
            <v-icon size="24" color="purple">mdi-account-group</v-icon>
          </div>
        </div>
        <div class="flex items-center mt-4">
          <v-rating
            :model-value="teamPerformance.rating"
            color="amber"
            size="small"
            readonly
            density="compact"
          />
          <span class="text-sm text-gray-500 ml-2">
            متوسط الشهر
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
                icon="mdi-refresh" 
                size="small" 
                variant="text"
                @click="refreshTasks"
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
                <v-checkbox
                  :model-value="task.completed"
                  color="primary"
                  @update:model-value="toggleTask(task.id)"
                />
                <div>
                  <h4 class="font-medium text-gray-900">{{ task.title }}</h4>
                  <p class="text-sm text-gray-600">{{ task.description }}</p>
                  <div class="flex items-center gap-2 mt-1">
                    <v-chip 
                      :color="getTaskPriorityColor(task.priority)" 
                      size="x-small" 
                      variant="tonal"
                    >
                      {{ task.priority }}
                    </v-chip>
                    <span class="text-xs text-gray-500">{{ task.time }}</span>
                  </div>
                </div>
              </div>
              
              <div class="flex items-center gap-2">
                <v-btn 
                  icon="mdi-eye" 
                  size="small" 
                  variant="text"
                  @click="viewTask(task.id)"
                />
                <v-btn 
                  icon="mdi-pencil" 
                  size="small" 
                  variant="text"
                  @click="editTask(task.id)"
                />
              </div>
            </div>
          </div>

          <div v-if="todayTasks.length === 0" class="text-center py-8">
            <v-icon size="64" color="gray-300">mdi-clipboard-check</v-icon>
            <p class="text-gray-500 mt-2">لا توجد مهام لليوم</p>
          </div>
        </div>
      </div>

      <!-- Quick Actions & Reviews -->
      <div class="space-y-6">
        <!-- Content Review Queue -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">مراجعة المحتوى</h3>
            <v-chip color="orange" variant="tonal" size="small">
              {{ contentReviews.length }} معلق
            </v-chip>
          </div>

          <div class="space-y-3">
            <div 
              v-for="content in contentReviews.slice(0, 3)" 
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
                  @click="rejectContent(content.id)"
                >
                  رفض
                </v-btn>
              </div>
            </div>
          </div>

          <v-btn 
            v-if="contentReviews.length > 3"
            text="عرض الكل"
            variant="text" 
            size="small"
            class="w-full mt-3"
            @click="viewAllReviews"
          />
        </div>

        <!-- Quick Actions -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">إجراءات سريعة</h3>
          
          <div class="space-y-3">
            <v-btn 
              block 
              color="primary" 
              variant="tonal"
              prepend-icon="mdi-plus-circle"
              @click="createNewTask"
            >
              إنشاء مهمة جديدة
            </v-btn>
            
            <v-btn 
              block 
              color="orange" 
              variant="tonal"
              prepend-icon="mdi-calendar-month"
              @click="viewWeeklySchedule"
            >
              جدولة أسبوعية
            </v-btn>
            
            <v-btn 
              block 
              color="green" 
              variant="tonal"
              prepend-icon="mdi-chart-bar"
              @click="viewReports"
            >
              التقارير والإحصائيات
            </v-btn>
            
            <v-btn 
              block 
              color="blue" 
              variant="tonal"
              prepend-icon="mdi-message-text"
              @click="teamCommunication"
            >
              التواصل مع الفريق
            </v-btn>
          </div>
        </div>

        <!-- Notifications -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">إشعارات مهمة</h3>
          
          <div class="space-y-3">
            <div 
              v-for="notification in importantNotifications" 
              :key="notification.id"
              class="flex items-start gap-3 p-3 border border-gray-200 rounded-lg"
              :class="notification.urgent ? 'border-red-300 bg-red-50' : ''"
            >
              <v-icon 
                :color="notification.urgent ? 'red' : 'blue'"
                size="20"
              >
                {{ notification.icon }}
              </v-icon>
              <div class="flex-1">
                <h4 class="font-medium text-gray-900 text-sm">{{ notification.title }}</h4>
                <p class="text-xs text-gray-600">{{ notification.message }}</p>
                <span class="text-xs text-gray-500">{{ notification.time }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Weekly Calendar -->
    <div class="mt-8">
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-gray-900">التقويم الأسبوعي</h3>
          <div class="flex items-center gap-2">
            <v-btn icon="mdi-chevron-left" size="small" variant="text" @click="previousWeek" />
            <span class="text-sm font-medium text-gray-700 px-4">
              {{ currentWeekRange }}
            </span>
            <v-btn icon="mdi-chevron-right" size="small" variant="text" @click="nextWeek" />
          </div>
        </div>

        <div class="grid grid-cols-7 gap-4 mb-4">
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
                class="p-2 rounded text-xs"
                :class="getTaskCalendarColor(task.type)"
                @click="viewTask(task.id)"
              >
                {{ task.title }}
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
const currentDate = ref(new Date().toLocaleDateString('ar-EG', { 
  weekday: 'long', 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
}))

const todayStats = ref({
  tasks: 8,
  completed: 5,
  total: 8
})

const pendingReviews = ref({
  count: 12,
  urgent: 3
})

const weekProgress = ref({
  percentage: 68,
  completed: 17,
  total: 25
})

const teamPerformance = ref({
  rating: 4.3
})

const todayTasks = ref([
  {
    id: 1,
    title: 'مراجعة محتوى حملة NAVA الشتوية',
    description: 'مراجعة 15 صورة للموافقة النهائية',
    priority: 'عالي',
    time: '9:00 ص',
    completed: false
  },
  {
    id: 2,
    title: 'جدولة مهام المصورين لهذا الأسبوع',
    description: 'توزيع المهام على الفريق حسب التخصص',
    priority: 'متوسط',
    time: '11:00 ص',
    completed: true
  },
  {
    id: 3,
    title: 'اجتماع فريق التسويق الأسبوعي',
    description: 'مناقشة التقدم والخطط القادمة',
    priority: 'عالي',
    time: '2:00 م',
    completed: false
  },
  {
    id: 4,
    title: 'تحديث تقرير الأداء الشهري',
    description: 'إعداد تقرير شامل للإدارة',
    priority: 'متوسط',
    time: '4:00 م',
    completed: false
  }
])

const contentReviews = ref([
  {
    id: 1,
    title: 'صور منتجات NAVA - مجموعة الشتاء',
    photographer: 'أحمد محمد',
    thumbnail: 'https://picsum.photos/100/100?random=1',
    priority: 'عاجل'
  },
  {
    id: 2,
    title: 'فيديو ترويجي لماكسيم',
    photographer: 'فاطمة علي',
    thumbnail: 'https://picsum.photos/100/100?random=2',
    priority: 'عادي'
  },
  {
    id: 3,
    title: 'جلسة تصوير سكاي تريد',
    photographer: 'محمد حسن',
    thumbnail: 'https://picsum.photos/100/100?random=3',
    priority: 'عاجل'
  },
  {
    id: 4,
    title: 'صور الكتالوج الجديد',
    photographer: 'سارة أحمد',
    thumbnail: 'https://picsum.photos/100/100?random=4',
    priority: 'عادي'
  }
])

const importantNotifications = ref([
  {
    id: 1,
    title: 'مهمة عاجلة جديدة',
    message: 'تم تعيين مهمة عاجلة لتصوير منتجات NAVA',
    time: 'منذ 10 دقائق',
    icon: 'mdi-alert-circle',
    urgent: true
  },
  {
    id: 2,
    title: 'اكتمال مراجعة المحتوى',
    message: 'تم الموافقة على محتوى حملة سكاي تريد',
    time: 'منذ 30 دقيقة',
    icon: 'mdi-check-circle',
    urgent: false
  },
  {
    id: 3,
    title: 'تحديث من المصور',
    message: 'أحمد محمد رفع صور جديدة للمراجعة',
    time: 'منذ ساعة',
    icon: 'mdi-camera',
    urgent: false
  }
])

const currentWeek = ref(new Date())
const weekDays = ref([
  {
    name: 'الأحد',
    date: '15 ديسمبر',
    tasks: [
      { id: 1, title: 'تصوير NAVA', type: 'shoot' },
      { id: 2, title: 'مراجعة محتوى', type: 'review' }
    ]
  },
  {
    name: 'الاثنين',
    date: '16 ديسمبر',
    tasks: [
      { id: 3, title: 'اجتماع فريق', type: 'meeting' }
    ]
  },
  {
    name: 'الثلاثاء',
    date: '17 ديسمبر',
    tasks: [
      { id: 4, title: 'تصوير ماكسيم', type: 'shoot' },
      { id: 5, title: 'تحرير محتوى', type: 'edit' }
    ]
  },
  {
    name: 'الأربعاء',
    date: '18 ديسمبر',
    tasks: []
  },
  {
    name: 'الخميس',
    date: '19 ديسمبر',
    tasks: [
      { id: 6, title: 'مراجعة نهائية', type: 'review' }
    ]
  },
  {
    name: 'الجمعة',
    date: '20 ديسمبر',
    tasks: [
      { id: 7, title: 'تسليم المشاريع', type: 'delivery' }
    ]
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
function refreshTasks() {
  // Refresh tasks logic
  console.log('Refreshing tasks...')
}

function toggleTask(taskId: number) {
  const task = todayTasks.value.find(t => t.id === taskId)
  if (task) {
    task.completed = !task.completed
  }
}

function viewTask(taskId: number) {
  router.push(`/tasks/${taskId}`)
}

function editTask(taskId: number) {
  router.push(`/tasks/${taskId}/edit`)
}

function getTaskPriorityColor(priority: string) {
  switch (priority) {
    case 'عالي': return 'red'
    case 'متوسط': return 'orange'
    case 'منخفض': return 'green'
    default: return 'gray'
  }
}

function approveContent(contentId: number) {
  console.log('Approving content:', contentId)
  // Remove from pending reviews
  const index = contentReviews.value.findIndex(c => c.id === contentId)
  if (index > -1) {
    contentReviews.value.splice(index, 1)
    pendingReviews.value.count--
  }
}

function rejectContent(contentId: number) {
  console.log('Rejecting content:', contentId)
  // Handle rejection logic
}

function viewAllReviews() {
  router.push('/content/reviews')
}

function createNewTask() {
  router.push('/tasks/create')
}

function viewWeeklySchedule() {
  router.push('/schedule/weekly')
}

function viewReports() {
  router.push('/reports')
}

function teamCommunication() {
  router.push('/communication')
}

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

function getTaskCalendarColor(type: string) {
  switch (type) {
    case 'shoot': return 'bg-blue-100 text-blue-800'
    case 'review': return 'bg-orange-100 text-orange-800'
    case 'meeting': return 'bg-purple-100 text-purple-800'
    case 'edit': return 'bg-green-100 text-green-800'
    case 'delivery': return 'bg-indigo-100 text-indigo-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

// ======================================
// Lifecycle
// ======================================
onMounted(() => {
  // Load initial data
})
</script>

<style scoped>
.marketing-dashboard {
  min-height: 100vh;
  background-color: #f8fafc;
}

/* Animation for task completion */
.task-completed {
  opacity: 0.6;
  text-decoration: line-through;
}

/* Calendar hover effects */
.calendar-task {
  transition: all 0.2s ease;
  cursor: pointer;
}

.calendar-task:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style> 
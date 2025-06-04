import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { 
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  doc,
  getDoc,
  getDocs,
  Timestamp,
  type Unsubscribe
} from 'firebase/firestore'
import { db } from '@/services/firebase'
import { useAuthStore } from './auth'
import type {
  User,
  Brand,
  SmartCampaign,
  CampaignTask,
  ContentLibrary,
  Payment,
  PhotographerProfile,
  BrandCoordinator
} from '../../../shared/types'

// Dashboard Stats Types
interface DashboardStats {
  // Super Admin Stats
  totalUsers: number
  totalBrands: number
  totalCampaigns: number
  totalRevenue: number
  activeUsers: number
  pendingApprovals: number
  
  // Marketing Coordinator Stats
  todayTasks: number
  weekTasks: number
  pendingContent: number
  overdueTasks: number
  
  // Brand Coordinator Stats
  brandTasks: number
  brandContent: number
  brandBudget: number
  brandRevenue: number
  
  // Photographer Stats
  todayEarnings: number
  weekEarnings: number
  monthEarnings: number
  pendingPayments: number
  completedTasks: number
  availableTasks: number
}

interface RealtimeData {
  users: User[]
  brands: Brand[]
  campaigns: SmartCampaign[]
  tasks: CampaignTask[]
  content: ContentLibrary[]
  payments: Payment[]
  photographerProfile: PhotographerProfile | null
  brandCoordinator: BrandCoordinator | null
}

export const useDashboardStore = defineStore('dashboard', () => {
  // ======================================
  // State
  // ======================================
  const stats = ref<DashboardStats>({
    totalUsers: 0,
    totalBrands: 0,
    totalCampaigns: 0,
    totalRevenue: 0,
    activeUsers: 0,
    pendingApprovals: 0,
    todayTasks: 0,
    weekTasks: 0,
    pendingContent: 0,
    overdueTasks: 0,
    brandTasks: 0,
    brandContent: 0,
    brandBudget: 0,
    brandRevenue: 0,
    todayEarnings: 0,
    weekEarnings: 0,
    monthEarnings: 0,
    pendingPayments: 0,
    completedTasks: 0,
    availableTasks: 0
  })

  const realtimeData = ref<RealtimeData>({
    users: [],
    brands: [],
    campaigns: [],
    tasks: [],
    content: [],
    payments: [],
    photographerProfile: null,
    brandCoordinator: null
  })

  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const lastUpdated = ref<Date | null>(null)

  // Real-time listeners
  const listeners = ref<Map<string, Unsubscribe>>(new Map())

  // ======================================
  // Getters
  // ======================================
  const authStore = useAuthStore()
  
  const currentUserStats = computed(() => {
    const role = authStore.currentUserRole
    switch (role) {
      case 'super_admin':
        return {
          totalUsers: stats.value.totalUsers,
          totalBrands: stats.value.totalBrands,
          totalCampaigns: stats.value.totalCampaigns,
          totalRevenue: stats.value.totalRevenue,
          activeUsers: stats.value.activeUsers,
          pendingApprovals: stats.value.pendingApprovals
        }
      case 'marketing_coordinator':
        return {
          todayTasks: stats.value.todayTasks,
          weekTasks: stats.value.weekTasks,
          pendingContent: stats.value.pendingContent,
          overdueTasks: stats.value.overdueTasks
        }
      case 'brand_coordinator':
        return {
          brandTasks: stats.value.brandTasks,
          brandContent: stats.value.brandContent,
          brandBudget: stats.value.brandBudget,
          brandRevenue: stats.value.brandRevenue
        }
      case 'photographer':
        return {
          todayEarnings: stats.value.todayEarnings,
          weekEarnings: stats.value.weekEarnings,
          monthEarnings: stats.value.monthEarnings,
          pendingPayments: stats.value.pendingPayments,
          completedTasks: stats.value.completedTasks,
          availableTasks: stats.value.availableTasks
        }
      default:
        return {}
    }
  })

  const chartData = computed(() => {
    const role = authStore.currentUserRole
    
    // Sample chart data - سيتم استبدالها بالبيانات الحقيقية
    return {
      // Data for different chart types based on role
      lineChart: {
        labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'],
        datasets: [{
          label: role === 'photographer' ? 'الأرباح الشهرية' : 'الإيرادات الشهرية',
          data: [12000, 19000, 15000, 25000, 22000, 30000],
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37, 99, 235, 0.1)',
          tension: 0.4
        }]
      },
      barChart: {
        labels: role === 'super_admin' 
          ? ['المستخدمين', 'البراندات', 'الحملات', 'المهام'] 
          : ['مكتملة', 'قيد التنفيذ', 'متأخرة', 'جديدة'],
        datasets: [{
          label: 'العدد',
          data: role === 'super_admin' 
            ? [stats.value.totalUsers, stats.value.totalBrands, stats.value.totalCampaigns, 50]
            : [stats.value.completedTasks, 15, stats.value.overdueTasks, stats.value.availableTasks],
          backgroundColor: [
            '#10b981',
            '#3b82f6', 
            '#f59e0b',
            '#ef4444'
          ]
        }]
      },
      pieChart: {
        labels: ['مكتملة', 'قيد التنفيذ', 'متأخرة'],
        datasets: [{
          data: [65, 25, 10],
          backgroundColor: [
            '#10b981',
            '#3b82f6',
            '#ef4444'
          ]
        }]
      }
    }
  })

  // ======================================
  // Actions
  // ======================================

  /**
   * تهيئة المستمعين الفوريين حسب الدور
   */
  async function initializeRealtimeListeners() {
    const role = authStore.currentUserRole
    const userId = authStore.user?.uid
    
    if (!role || !userId) {
      console.warn('⚠️ لا يمكن تهيئة المستمعين - المستخدم غير مصادق عليه')
      return
    }

    console.log(`🔄 تهيئة المستمعين الفوريين للدور: ${role}`)

    try {
      // تنظيف المستمعين السابقين
      clearListeners()

      switch (role) {
        case 'super_admin':
          await initSuperAdminListeners()
          break
        case 'marketing_coordinator':
          await initMarketingCoordinatorListeners()
          break
        case 'brand_coordinator':
          await initBrandCoordinatorListeners(userId)
          break
        case 'photographer':
          await initPhotographerListeners(userId)
          break
      }

      lastUpdated.value = new Date()
      console.log('✅ تم تهيئة المستمعين الفوريين بنجاح')
      
    } catch (err: any) {
      console.error('❌ خطأ في تهيئة المستمعين:', err)
      error.value = `خطأ في تحميل البيانات: ${err.message}`
    }
  }

  /**
   * مستمعين المدير العام
   */
  async function initSuperAdminListeners() {
    // مستمع المستخدمين
    const usersQuery = query(collection(db, 'users'))
    const usersUnsubscribe = onSnapshot(usersQuery, (snapshot) => {
      realtimeData.value.users = []
      let activeCount = 0
      let pendingCount = 0

      snapshot.forEach((doc) => {
        const userData = { id: doc.id, ...doc.data() } as User
        realtimeData.value.users.push(userData)
        
        if (userData.is_active) activeCount++
        if (userData.status === 'pending_approval') pendingCount++
      })

      stats.value.totalUsers = realtimeData.value.users.length
      stats.value.activeUsers = activeCount
      stats.value.pendingApprovals = pendingCount
    })
    listeners.value.set('users', usersUnsubscribe)

    // مستمع البراندات
    const brandsQuery = query(collection(db, 'brands'))
    const brandsUnsubscribe = onSnapshot(brandsQuery, (snapshot) => {
      realtimeData.value.brands = []
      snapshot.forEach((doc) => {
        realtimeData.value.brands.push({ id: doc.id, ...doc.data() } as Brand)
      })
      stats.value.totalBrands = realtimeData.value.brands.length
    })
    listeners.value.set('brands', brandsUnsubscribe)

    // مستمع الحملات
    const campaignsQuery = query(collection(db, 'smart_campaigns'))
    const campaignsUnsubscribe = onSnapshot(campaignsQuery, (snapshot) => {
      realtimeData.value.campaigns = []
      let totalRevenue = 0

      snapshot.forEach((doc) => {
        const campaign = { id: doc.id, ...doc.data() } as SmartCampaign
        realtimeData.value.campaigns.push(campaign)
        totalRevenue += campaign.budget_management?.total_budget || 0
      })

      stats.value.totalCampaigns = realtimeData.value.campaigns.length
      stats.value.totalRevenue = totalRevenue
    })
    listeners.value.set('campaigns', campaignsUnsubscribe)
  }

  /**
   * مستمعين منسق التسويق
   */
  async function initMarketingCoordinatorListeners() {
    // مستمع المهام
    const tasksQuery = query(
      collection(db, 'campaign_tasks'),
      orderBy('created_at', 'desc')
    )
    const tasksUnsubscribe = onSnapshot(tasksQuery, (snapshot) => {
      realtimeData.value.tasks = []
      let todayCount = 0
      let weekCount = 0
      let overdueCount = 0

      const today = new Date()
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

      snapshot.forEach((doc) => {
        const task = { id: doc.id, ...doc.data() } as CampaignTask
        realtimeData.value.tasks.push(task)

        const taskDate = task.created_at?.toDate?.() || new Date(task.created_at as any)
        
        if (isSameDay(taskDate, today)) todayCount++
        if (taskDate >= weekAgo) weekCount++
        if (task.status_tracking?.current_status === 'revision_needed') overdueCount++
      })

      stats.value.todayTasks = todayCount
      stats.value.weekTasks = weekCount
      stats.value.overdueTasks = overdueCount
    })
    listeners.value.set('tasks', tasksUnsubscribe)

    // مستمع المحتوى المنتظر للمراجعة
    const contentQuery = query(
      collection(db, 'content_library'),
      where('approval_info.approval_status', '==', 'pending')
    )
    const contentUnsubscribe = onSnapshot(contentQuery, (snapshot) => {
      stats.value.pendingContent = snapshot.size
    })
    listeners.value.set('content', contentUnsubscribe)
  }

  /**
   * مستمعين منسق البراند
   */
  async function initBrandCoordinatorListeners(userId: string) {
    // الحصول على معلومات منسق البراند
    const coordinatorDoc = await getDoc(doc(db, 'brand_coordinators', userId))
    if (coordinatorDoc.exists()) {
      realtimeData.value.brandCoordinator = { 
        id: coordinatorDoc.id, 
        ...coordinatorDoc.data() 
      } as BrandCoordinator
    }

    const brandId = realtimeData.value.brandCoordinator?.brand_id
    if (!brandId) return

    // مستمع مهام البراند
    const brandTasksQuery = query(
      collection(db, 'campaign_tasks'),
      where('content_info.brand_id', '==', brandId)
    )
    const tasksUnsubscribe = onSnapshot(brandTasksQuery, (snapshot) => {
      let taskCount = 0
      let brandRevenue = 0

      snapshot.forEach((doc) => {
        taskCount++
        const task = doc.data() as CampaignTask
        brandRevenue += task.financial_info?.estimated_cost || 0
      })

      stats.value.brandTasks = taskCount
      stats.value.brandRevenue = brandRevenue
    })
    listeners.value.set('brandTasks', tasksUnsubscribe)

    // مستمع محتوى البراند
    const brandContentQuery = query(
      collection(db, 'content_library'),
      where('content_info.brand_id', '==', brandId)
    )
    const contentUnsubscribe = onSnapshot(brandContentQuery, (snapshot) => {
      stats.value.brandContent = snapshot.size
    })
    listeners.value.set('brandContent', contentUnsubscribe)
  }

  /**
   * مستمعين المصور
   */
  async function initPhotographerListeners(userId: string) {
    // الحصول على ملف المصور
    const photographerDoc = await getDoc(doc(db, 'photographer_profiles', userId))
    if (photographerDoc.exists()) {
      realtimeData.value.photographerProfile = { 
        id: photographerDoc.id, 
        ...photographerDoc.data() 
      } as PhotographerProfile
    }

    // مستمع مهام المصور
    const photographerTasksQuery = query(
      collection(db, 'campaign_tasks'),
      where('assignment.assigned_photographer', '==', userId)
    )
    const tasksUnsubscribe = onSnapshot(photographerTasksQuery, (snapshot) => {
      let completedCount = 0
      let todayEarnings = 0
      let weekEarnings = 0
      let monthEarnings = 0

      const today = new Date()
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

      snapshot.forEach((doc) => {
        const task = doc.data() as CampaignTask
        
        if (task.status_tracking?.current_status === 'completed') {
          completedCount++
          const taskDate = task.updated_at?.toDate?.() || new Date(task.updated_at as any)
          const earnings = task.financial_info?.photographer_payment || 0

          if (isSameDay(taskDate, today)) todayEarnings += earnings
          if (taskDate >= weekAgo) weekEarnings += earnings
          if (taskDate >= monthAgo) monthEarnings += earnings
        }
      })

      stats.value.completedTasks = completedCount
      stats.value.todayEarnings = todayEarnings
      stats.value.weekEarnings = weekEarnings
      stats.value.monthEarnings = monthEarnings
    })
    listeners.value.set('photographerTasks', tasksUnsubscribe)

    // مستمع المهام المتاحة
    const availableTasksQuery = query(
      collection(db, 'campaign_tasks'),
      where('status_tracking.current_status', '==', 'pending'),
      limit(10)
    )
    const availableUnsubscribe = onSnapshot(availableTasksQuery, (snapshot) => {
      stats.value.availableTasks = snapshot.size
    })
    listeners.value.set('availableTasks', availableUnsubscribe)

    // مستمع المدفوعات المعلقة
    const paymentsQuery = query(
      collection(db, 'payments'),
      where('recipient_info.recipient_id', '==', userId),
      where('status_tracking.current_status', '==', 'pending_approval')
    )
    const paymentsUnsubscribe = onSnapshot(paymentsQuery, (snapshot) => {
      let pendingAmount = 0
      snapshot.forEach((doc) => {
        const payment = doc.data() as Payment
        pendingAmount += payment.amount_details?.net_amount || 0
      })
      stats.value.pendingPayments = pendingAmount
    })
    listeners.value.set('payments', paymentsUnsubscribe)
  }

  /**
   * تنظيف جميع المستمعين
   */
  function clearListeners() {
    listeners.value.forEach((unsubscribe) => {
      unsubscribe()
    })
    listeners.value.clear()
  }

  /**
   * إعادة تحميل البيانات يدوياً
   */
  async function refreshData() {
    isLoading.value = true
    try {
      await initializeRealtimeListeners()
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Helper Functions
   */
  function isSameDay(date1: Date, date2: Date): boolean {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear()
  }

  // ======================================
  // Cleanup on unmount
  // ======================================
  function cleanup() {
    clearListeners()
  }

  return {
    // State
    stats,
    realtimeData,
    isLoading,
    error,
    lastUpdated,
    
    // Getters
    currentUserStats,
    chartData,
    
    // Actions
    initializeRealtimeListeners,
    refreshData,
    clearListeners,
    cleanup
  }
}) 
import { db } from '../../config/firebase'

// ======================================
// Dashboard Utilities
// ======================================

// Type definitions
interface BasicStats {
  totalUsers: number
  activeUsers: number
  totalTasks: number
  activeTasks: number
  totalCampaigns: number
  activeCampaigns: number
  totalBrands: number
  monthlyRevenue: number
  userGrowth: number
  taskProgress: number
  campaignProgress: number
}

interface ChartData {
  photographerPerformance: any
  brandDistribution: any
  monthlyRevenue: any
  taskStatus: any
}

interface Activity {
  id: string
  title: string
  subtitle: string
  avatar: string
  status: string
  status_color: string
  timestamp: any
}

interface Approval {
  id: string
  name: string
  role: string
  avatar: string
  created_at: any
}

interface PhotographerInfo {
  id: string
  name: string
  contractType: string
  specialization: string
  status: string
  avatar?: string
  phone?: string
  email?: string
  joinDate?: any
  location?: string
}

interface FinancialInfo {
  type: string
  monthlyEarnings?: {
    current: number
    target: number
  }
  pendingPayments?: {
    amount: number
    tasks: number
  }
  targetProgress?: {
    percentage: number
  }
  monthlySalary?: number
  overtimeBonus?: number
}

// ======================================
// Super Admin Stats
// ======================================

export const getSuperAdminStats = async () => {
  try {
    const basicStats = await getBasicStats()
    const chartData = await getChartData()
    const recentActivities = await getRecentActivities()
    const pendingApprovals = await getPendingApprovals()
    
    return {
      stats: basicStats,
      chartData,
      recentActivities,
      pendingApprovals
    }
  } catch (error) {
    console.error('Error fetching super admin stats:', error)
    throw error
  }
}

// ======================================
// Marketing Coordinator Stats
// ======================================

export const getMarketingCoordinatorStats = async () => {
  try {
    // Get campaigns overview
    const campaignsOverview = await getCampaignsOverview()
    
    // Get task distribution
    const taskDistribution = await getTaskDistribution()
    
    // Get photographer performance
    const photographerPerformance = await getPhotographerPerformanceData()
    
    // Get brand metrics
    const brandMetrics = await getBrandMetrics()
    
    return {
      campaignsOverview,
      taskDistribution,
      photographerPerformance,
      brandMetrics
    }
  } catch (error) {
    console.error('Error fetching marketing coordinator stats:', error)
    throw error
  }
}

// ======================================
// Brand Coordinator Stats
// ======================================

export const getBrandCoordinatorStats = async (brandId: string) => {
  try {
    // Get brand info
    const brandInfo = await getBrandInfo(brandId)
    
    // Get brand tasks
    const brandTasks = await getBrandTasks(brandId)
    
    // Get brand campaigns
    const brandCampaigns = await getBrandCampaigns(brandId)
    
    // Get brand performance
    const brandPerformance = await getBrandPerformance(brandId)
    
    return {
      brandInfo,
      brandTasks,
      brandCampaigns,
      brandPerformance
    }
  } catch (error) {
    console.error('Error fetching brand coordinator stats:', error)
    throw error
  }
}

// ======================================
// Photographer Stats
// ======================================

export const getPhotographerStats = async (photographerId: string) => {
  try {
    // Get photographer information
    const photographerInfo = await getPhotographerInfo(photographerId)
    
    // Get earnings/salary info based on contract type
    const financialInfo = await getFinancialInfo(photographerId, photographerInfo.contractType)
    
    // Get task statistics
    const taskStats = await getTaskStats(photographerId)
    
    // Get today's tasks
    const todayTasks = await getTodayTasks(photographerId)
    
    // Get available tasks
    const availableTasks = await getAvailableTasks(photographerId)
    
    // Get personal statistics
    const personalStats = await getPersonalStats(photographerId)
    
    // Get upload queue
    const uploadQueue = await getUploadQueue(photographerId)
    
    return {
      photographerInfo,
      financialInfo,
      taskStats,
      todayTasks,
      availableTasks,
      personalStats,
      uploadQueue
    }
  } catch (error) {
    console.error('Error fetching photographer stats:', error)
    throw error
  }
}

// ======================================
// Helper Functions
// ======================================

async function getBasicStats(): Promise<BasicStats> {
  try {
    // Get total users count
    const usersSnapshot = await db.collection('users').get()
    const totalUsers = usersSnapshot.size
    
    // Get active users (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const activeUsersSnapshot = await db.collection('users')
      .where('last_login', '>=', thirtyDaysAgo)
      .get()
    const activeUsers = activeUsersSnapshot.size
    
    // Get total tasks
    const tasksSnapshot = await db.collection('tasks').get()
    const totalTasks = tasksSnapshot.size
    
    // Get active tasks
    const activeTasksSnapshot = await db.collection('tasks')
      .where('status', 'in', ['قيد التنفيذ', 'جديد'])
      .get()
    const activeTasks = activeTasksSnapshot.size
    
    // Get total campaigns
    const campaignsSnapshot = await db.collection('campaigns').get()
    const totalCampaigns = campaignsSnapshot.size
    
    // Get active campaigns
    const activeCampaignsSnapshot = await db.collection('campaigns')
      .where('status', '==', 'نشط')
      .get()
    const activeCampaigns = activeCampaignsSnapshot.size
    
    // Get brands count
    const brandsSnapshot = await db.collection('brands').get()
    const totalBrands = brandsSnapshot.size
    
    // Calculate revenue (mock data for now)
    const monthlyRevenue = calculateMonthlyRevenue()
    
    return {
      totalUsers,
      activeUsers,
      totalTasks,
      activeTasks,
      totalCampaigns,
      activeCampaigns,
      totalBrands,
      monthlyRevenue,
      userGrowth: calculateUserGrowth(activeUsers, totalUsers),
      taskProgress: Math.round((activeTasks / totalTasks) * 100) || 0,
      campaignProgress: Math.round((activeCampaigns / totalCampaigns) * 100) || 0
    }
    
  } catch (error) {
    console.error('Error fetching basic stats:', error)
    throw error
  }
}

async function getChartData(): Promise<ChartData> {
  try {
    // Photographer performance data
    const photographerPerformance = await getPhotographerPerformanceData()
    
    // Brand distribution data
    const brandDistribution = await getBrandDistributionData()
    
    // Monthly revenue data
    const monthlyRevenue = await getMonthlyRevenueData()
    
    // Task status distribution
    const taskStatus = await getTaskStatusData()
    
    return {
      photographerPerformance,
      brandDistribution,
      monthlyRevenue,
      taskStatus
    }
    
  } catch (error) {
    console.error('Error fetching chart data:', error)
    throw error
  }
}

async function getPhotographerPerformanceData() {
  try {
    // Get last 6 months data
    const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو']
    
    // Mock data - replace with real database queries
    const tasksCompleted = [65, 78, 85, 95, 112, 128]
    const averageRating = [4.2, 4.5, 4.3, 4.7, 4.6, 4.8]
    
    return {
      labels: months,
      datasets: [
        {
          label: 'عدد المهام المكتملة',
          data: tasksCompleted,
          borderColor: 'rgb(79, 70, 229)',
          backgroundColor: 'rgba(79, 70, 229, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'متوسط التقييم',
          data: averageRating,
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          tension: 0.4,
          fill: true,
          yAxisID: 'y1'
        }
      ]
    }
  } catch (error) {
    console.error('Error fetching photographer performance:', error)
    throw error
  }
}

// TODO: Implement remaining helper functions
async function getBrandDistributionData() {
  // Implementation from original files
  return {}
}

async function getMonthlyRevenueData() {
  // Implementation from original files
  return {}
}

async function getTaskStatusData() {
  // Implementation from original files
  return {}
}

async function getRecentActivities(): Promise<Activity[]> {
  // Implementation from original files
  return []
}

async function getPendingApprovals(): Promise<Approval[]> {
  // Implementation from original files
  return []
}

async function getCampaignsOverview() {
  // Implementation for marketing coordinator
  return {}
}

async function getTaskDistribution() {
  // Implementation for marketing coordinator
  return {}
}

async function getBrandMetrics() {
  // Implementation for marketing coordinator
  return {}
}

async function getBrandInfo(brandId: string) {
  // Implementation for brand coordinator
  return {}
}

async function getBrandTasks(brandId: string) {
  // Implementation for brand coordinator
  return {}
}

async function getBrandCampaigns(brandId: string) {
  // Implementation for brand coordinator
  return {}
}

async function getBrandPerformance(brandId: string) {
  // Implementation for brand coordinator
  return {}
}

async function getPhotographerInfo(photographerId: string): Promise<PhotographerInfo> {
  try {
    const photographerDoc = await db.collection('users').doc(photographerId).get()
    
    if (!photographerDoc.exists) {
      throw new Error('المصور غير موجود')
    }
    
    const photographer = photographerDoc.data()
    
    return {
      id: photographerDoc.id,
      name: photographer?.display_name || 'غير محدد',
      contractType: photographer?.contract_type || 'freelancer',
      specialization: photographer?.specialization || 'تصوير عام',
      status: photographer?.status || 'متاح',
      avatar: photographer?.avatar_url,
      phone: photographer?.phone_number,
      email: photographer?.email,
      joinDate: photographer?.created_at,
      location: photographer?.location
    }
  } catch (error) {
    console.error('Error fetching photographer info:', error)
    throw error
  }
}

async function getFinancialInfo(photographerId: string, contractType: string): Promise<FinancialInfo> {
  try {
    if (contractType === 'freelancer') {
      return await getFreelancerFinancialInfo(photographerId)
    } else {
      return await getEmployeeFinancialInfo(photographerId)
    }
  } catch (error) {
    console.error('Error fetching financial info:', error)
    return getDefaultFinancialInfo(contractType)
  }
}

async function getFreelancerFinancialInfo(photographerId: string): Promise<FinancialInfo> {
  // Implementation from original photographerStats.ts
  return {
    type: 'freelancer',
    monthlyEarnings: { current: 0, target: 1200000 },
    pendingPayments: { amount: 0, tasks: 0 },
    targetProgress: { percentage: 0 }
  }
}

async function getEmployeeFinancialInfo(photographerId: string): Promise<FinancialInfo> {
  // Implementation from original photographerStats.ts
  return {
    type: 'employee',
    monthlySalary: 800000,
    overtimeBonus: 0
  }
}

async function getTaskStats(photographerId: string) {
  // Implementation from original photographerStats.ts
  return {}
}

async function getTodayTasks(photographerId: string) {
  // Implementation from original photographerStats.ts
  return []
}

async function getAvailableTasks(photographerId: string) {
  // Implementation from original photographerStats.ts
  return []
}

async function getPersonalStats(photographerId: string) {
  // Implementation from original photographerStats.ts
  return {}
}

async function getUploadQueue(photographerId: string) {
  // Implementation from original photographerStats.ts
  return []
}

function calculateMonthlyRevenue(): number {
  // Mock implementation
  return 15000000
}

function calculateUserGrowth(active: number, total: number): number {
  return Math.round((active / total) * 100)
}

function getDefaultFinancialInfo(contractType: string): FinancialInfo {
  if (contractType === 'freelancer') {
    return {
      type: 'freelancer',
      monthlyEarnings: { current: 0, target: 1200000 },
      pendingPayments: { amount: 0, tasks: 0 },
      targetProgress: { percentage: 0 }
    }
  } else {
    return {
      type: 'employee',
      monthlySalary: 800000,
      overtimeBonus: 0
    }
  }
} 
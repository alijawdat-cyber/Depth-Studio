import { Request, Response } from 'express'
import { db } from '../../config/firebase'

/**
 * Get Super Admin Dashboard Statistics
 */
export const superAdminDashboard = async (req: Request, res: Response) => {
  try {
    // Get basic stats
    const stats = await getBasicStats()
    
    // Get chart data
    const chartData = await getChartData()
    
    // Get recent activities
    const recentActivities = await getRecentActivities()
    
    // Get pending approvals
    const pendingApprovals = await getPendingApprovals()
    
    const dashboardData = {
      stats,
      chartData,
      recentActivities,
      pendingApprovals,
      timestamp: new Date().toISOString()
    }
    
    res.status(200).json({
      success: true,
      data: dashboardData
    })
    
  } catch (error) {
    console.error('Error fetching super admin dashboard:', error)
    res.status(500).json({
      success: false,
      message: 'فشل في جلب بيانات لوحة التحكم',
      error: (error as Error).message
    })
  }
}

/**
 * Get basic dashboard statistics
 */
async function getBasicStats() {
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

/**
 * Get chart data for dashboard
 */
async function getChartData() {
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

/**
 * Get photographer performance chart data
 */
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

/**
 * Get brand distribution data
 */
async function getBrandDistributionData() {
  try {
    // Get tasks by brand
    const brandsSnapshot = await db.collection('brands').get()
    const brandData = []
    
    for (const brandDoc of brandsSnapshot.docs) {
      const brand = brandDoc.data()
      const tasksSnapshot = await db.collection('tasks')
        .where('brand_id', '==', brandDoc.id)
        .get()
      
      brandData.push({
        name: brand.name,
        count: tasksSnapshot.size
      })
    }
    
    // Sort by count and take top 5
    brandData.sort((a, b) => b.count - a.count)
    const topBrands = brandData.slice(0, 4)
    const othersCount = brandData.slice(4).reduce((sum, brand) => sum + brand.count, 0)
    
    if (othersCount > 0) {
      topBrands.push({ name: 'أخرى', count: othersCount })
    }
    
    return {
      labels: topBrands.map(brand => brand.name),
      datasets: [{
        data: topBrands.map(brand => brand.count),
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
  } catch (error) {
    console.error('Error fetching brand distribution:', error)
    throw error
  }
}

/**
 * Get monthly revenue data
 */
async function getMonthlyRevenueData() {
  try {
    const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو']
    
    // Mock data - replace with real financial calculations
    const revenues = [45000, 52000, 48000, 61000, 55000, 67000]
    
    return {
      labels: months,
      datasets: [{
        label: 'الإيرادات (دينار)',
        data: revenues,
        backgroundColor: 'rgba(79, 70, 229, 0.8)',
        borderColor: 'rgb(79, 70, 229)',
        borderWidth: 2,
        borderRadius: 6
      }]
    }
  } catch (error) {
    console.error('Error fetching monthly revenue:', error)
    throw error
  }
}

/**
 * Get task status distribution
 */
async function getTaskStatusData() {
  try {
    const statuses = ['مكتملة', 'قيد التنفيذ', 'معلقة', 'متأخرة']
    const counts = []
    
    for (const status of statuses) {
      const snapshot = await db.collection('tasks')
        .where('status', '==', status)
        .get()
      counts.push(snapshot.size)
    }
    
    return {
      labels: statuses,
      datasets: [{
        data: counts,
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
  } catch (error) {
    console.error('Error fetching task status:', error)
    throw error
  }
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

/**
 * Get recent activities
 */
async function getRecentActivities(): Promise<Activity[]> {
  try {
    // Get recent activities from audit log
    const activitiesSnapshot = await db.collection('activities')
      .orderBy('created_at', 'desc')
      .limit(10)
      .get()
    
    const activities: Activity[] = []
    
    activitiesSnapshot.forEach(doc => {
      const activity = doc.data()
      activities.push({
        id: doc.id,
        title: activity.title,
        subtitle: activity.description,
        avatar: activity.user_avatar || '/default-avatar.png',
        status: activity.status,
        status_color: getStatusColor(activity.status),
        timestamp: activity.created_at
      })
    })
    
    return activities
  } catch (error) {
    console.error('Error fetching recent activities:', error)
    return []
  }
}

/**
 * Get pending approvals
 */
async function getPendingApprovals(): Promise<Approval[]> {
  try {
    const approvalsSnapshot = await db.collection('users')
      .where('status', '==', 'pending_approval')
      .get()
    
    const approvals: Approval[] = []
    
    approvalsSnapshot.forEach(doc => {
      const user = doc.data()
      approvals.push({
        id: doc.id,
        name: user.display_name,
        role: user.role,
        avatar: user.avatar_url || '/default-avatar.png',
        created_at: user.created_at
      })
    })
    
    return approvals
  } catch (error) {
    console.error('Error fetching pending approvals:', error)
    return []
  }
}

/**
 * Helper functions
 */
function calculateMonthlyRevenue() {
  // Mock calculation - replace with real data
  return {
    current: 67000,
    previous: 55000,
    growth: 22
  }
}

function calculateUserGrowth(active: number, total: number) {
  // Mock calculation
  return Math.round((active / total) * 100) || 0
}

function getStatusColor(status: string) {
  switch (status) {
    case 'مكتمل': return 'success'
    case 'جديد': return 'info'
    case 'مراجعة': return 'warning'
    case 'مرفوض': return 'error'
    default: return 'primary'
  }
} 
import { Request, Response } from 'express'
import { db } from '../../config/firebase'

interface TodayTask {
  id: string
  title: string
  description: string
  priority: string
  time: string
  completed: boolean
}

interface ContentReview {
  id: string
  title: string
  photographer: string
  thumbnail: string
  priority: string
}

interface Notification {
  id: string
  title: string
  message: string
  time: string
  icon: string
  urgent: boolean
}

/**
 * Get Marketing Coordinator Dashboard Statistics
 */
export const marketingCoordinatorDashboard = async (req: Request, res: Response) => {
  try {
    // Get today's statistics
    const todayStats = await getTodayStats()
    
    // Get pending reviews
    const pendingReviews = await getPendingReviews()
    
    // Get week progress
    const weekProgress = await getWeekProgress()
    
    // Get team performance
    const teamPerformance = await getTeamPerformance()
    
    // Get today's tasks
    const todayTasks = await getTodayTasks()
    
    // Get content reviews
    const contentReviews = await getContentReviews()
    
    // Get notifications
    const notifications = await getImportantNotifications()
    
    const dashboardData = {
      todayStats,
      pendingReviews,
      weekProgress,
      teamPerformance,
      todayTasks,
      contentReviews,
      notifications,
      timestamp: new Date().toISOString()
    }
    
    res.status(200).json({
      success: true,
      data: dashboardData
    })
    
  } catch (error) {
    console.error('Error fetching marketing coordinator dashboard:', error)
    res.status(500).json({
      success: false,
      message: 'فشل في جلب بيانات لوحة التحكم',
      error: (error as Error).message
    })
  }
}

/**
 * Get today's statistics
 */
async function getTodayStats() {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    // Get today's tasks
    const todayTasksSnapshot = await db.collection('tasks')
      .where('assigned_date', '>=', today)
      .where('assigned_date', '<', tomorrow)
      .get()
    
    const totalTasks = todayTasksSnapshot.size
    
    // Count completed tasks
    let completedTasks = 0
    todayTasksSnapshot.forEach(doc => {
      const task = doc.data()
      if (task.status === 'مكتمل') {
        completedTasks++
      }
    })
    
    return {
      tasks: totalTasks,
      completed: completedTasks,
      total: totalTasks
    }
  } catch (error) {
    console.error('Error fetching today stats:', error)
    return { tasks: 0, completed: 0, total: 0 }
  }
}

/**
 * Get pending reviews count
 */
async function getPendingReviews() {
  try {
    const reviewsSnapshot = await db.collection('content')
      .where('status', '==', 'pending_review')
      .get()
    
    let urgentCount = 0
    reviewsSnapshot.forEach(doc => {
      const content = doc.data()
      if (content.priority === 'عاجل') {
        urgentCount++
      }
    })
    
    return {
      count: reviewsSnapshot.size,
      urgent: urgentCount
    }
  } catch (error) {
    console.error('Error fetching pending reviews:', error)
    return { count: 0, urgent: 0 }
  }
}

/**
 * Get week progress
 */
async function getWeekProgress() {
  try {
    const startOfWeek = new Date()
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
    startOfWeek.setHours(0, 0, 0, 0)
    
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(endOfWeek.getDate() + 7)
    
    // Get week's tasks
    const weekTasksSnapshot = await db.collection('tasks')
      .where('assigned_date', '>=', startOfWeek)
      .where('assigned_date', '<', endOfWeek)
      .get()
    
    const totalTasks = weekTasksSnapshot.size
    let completedTasks = 0
    
    weekTasksSnapshot.forEach(doc => {
      const task = doc.data()
      if (task.status === 'مكتمل') {
        completedTasks++
      }
    })
    
    const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    
    return {
      percentage,
      completed: completedTasks,
      total: totalTasks
    }
  } catch (error) {
    console.error('Error fetching week progress:', error)
    return { percentage: 0, completed: 0, total: 0 }
  }
}

/**
 * Get team performance
 */
async function getTeamPerformance() {
  try {
    // Get average rating from completed tasks this month
    const thisMonth = new Date()
    thisMonth.setDate(1)
    thisMonth.setHours(0, 0, 0, 0)
    
    const nextMonth = new Date(thisMonth)
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    
    const tasksSnapshot = await db.collection('tasks')
      .where('completed_date', '>=', thisMonth)
      .where('completed_date', '<', nextMonth)
      .where('status', '==', 'مكتمل')
      .get()
    
    let totalRating = 0
    let ratedTasks = 0
    
    tasksSnapshot.forEach(doc => {
      const task = doc.data()
      if (task.rating && task.rating > 0) {
        totalRating += task.rating
        ratedTasks++
      }
    })
    
    const averageRating = ratedTasks > 0 ? (totalRating / ratedTasks) : 4.0
    
    return {
      rating: Math.round(averageRating * 10) / 10
    }
  } catch (error) {
    console.error('Error fetching team performance:', error)
    return { rating: 4.0 }
  }
}

/**
 * Get today's tasks
 */
async function getTodayTasks(): Promise<TodayTask[]> {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const tasksSnapshot = await db.collection('tasks')
      .where('assigned_date', '>=', today)
      .where('assigned_date', '<', tomorrow)
      .orderBy('priority', 'desc')
      .limit(10)
      .get()
    
    const tasks: TodayTask[] = []
    
    tasksSnapshot.forEach(doc => {
      const task = doc.data()
      tasks.push({
        id: doc.id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        time: task.scheduled_time || '09:00',
        completed: task.status === 'مكتمل'
      })
    })
    
    return tasks
  } catch (error) {
    console.error('Error fetching today tasks:', error)
    return []
  }
}

/**
 * Get content reviews
 */
async function getContentReviews(): Promise<ContentReview[]> {
  try {
    const reviewsSnapshot = await db.collection('content')
      .where('status', '==', 'pending_review')
      .orderBy('priority', 'desc')
      .orderBy('created_at', 'desc')
      .limit(10)
      .get()
    
    const reviews: ContentReview[] = []
    
    for (const doc of reviewsSnapshot.docs) {
      const content = doc.data()
      
      // Get photographer name
      let photographerName = 'غير محدد'
      if (content.photographer_id) {
        try {
          const photographerDoc = await db.collection('users').doc(content.photographer_id).get()
          if (photographerDoc.exists) {
            photographerName = photographerDoc.data()?.display_name || 'غير محدد'
          }
        } catch (err) {
          console.error('Error fetching photographer:', err)
        }
      }
      
      reviews.push({
        id: doc.id,
        title: content.title,
        photographer: photographerName,
        thumbnail: content.thumbnail_url || `https://picsum.photos/100/100?random=${doc.id}`,
        priority: content.priority || 'عادي'
      })
    }
    
    return reviews
  } catch (error) {
    console.error('Error fetching content reviews:', error)
    return []
  }
}

/**
 * Get important notifications
 */
async function getImportantNotifications(): Promise<Notification[]> {
  try {
    const notificationsSnapshot = await db.collection('notifications')
      .where('user_role', 'in', ['marketing_coordinator', 'all'])
      .where('is_read', '==', false)
      .orderBy('created_at', 'desc')
      .limit(5)
      .get()
    
    const notifications: Notification[] = []
    
    notificationsSnapshot.forEach(doc => {
      const notification = doc.data()
      notifications.push({
        id: doc.id,
        title: notification.title,
        message: notification.message,
        time: getTimeAgo(notification.created_at),
        icon: notification.icon || 'mdi-bell',
        urgent: notification.priority === 'urgent'
      })
    })
    
    return notifications
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return []
  }
}

/**
 * Helper function to format time ago
 */
function getTimeAgo(timestamp: any): string {
  if (!timestamp) return 'الآن'
  
  const now = new Date()
  const then = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  const diffMs = now.getTime() - then.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffMins < 1) return 'الآن'
  if (diffMins < 60) return `منذ ${diffMins} دقيقة`
  if (diffHours < 24) return `منذ ${diffHours} ساعة`
  return `منذ ${diffDays} يوم`
} 
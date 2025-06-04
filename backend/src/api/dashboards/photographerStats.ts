import { Request, Response } from 'express'
import { db } from '../../config/firebase'

/**
 * Get Photographer Dashboard Statistics (Unified for all photographers)
 */
export const photographerDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { photographerId } = req.params
    
    if (!photographerId) {
      res.status(400).json({
        success: false,
        message: 'معرف المصور مطلوب'
      })
      return
    }
    
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
    
    const dashboardData = {
      photographerInfo,
      financialInfo,
      taskStats,
      todayTasks,
      availableTasks,
      personalStats,
      uploadQueue,
      timestamp: new Date().toISOString()
    }
    
    res.status(200).json({
      success: true,
      data: dashboardData
    })
    
  } catch (error) {
    console.error('Error fetching photographer dashboard:', error)
    res.status(500).json({
      success: false,
      message: 'فشل في جلب بيانات لوحة التحكم',
      error: (error as Error).message
    })
  }
}

/**
 * Get photographer information
 */
async function getPhotographerInfo(photographerId: string) {
  try {
    const photographerDoc = await db.collection('users').doc(photographerId).get()
    
    if (!photographerDoc.exists) {
      throw new Error('المصور غير موجود')
    }
    
    const photographer = photographerDoc.data()
    
    return {
      id: photographerDoc.id,
      name: photographer?.display_name || 'غير محدد',
      contractType: photographer?.contract_type || 'freelancer', // freelancer | employee
      specialization: photographer?.specialization || 'تصوير عام',
      status: photographer?.status || 'متاح', // متاح، مشغول، في إجازة
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

/**
 * Get financial information based on contract type
 */
async function getFinancialInfo(photographerId: string, contractType: string) {
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

/**
 * Get freelancer financial information
 */
async function getFreelancerFinancialInfo(photographerId: string) {
  try {
    const thisMonth = new Date()
    thisMonth.setDate(1)
    thisMonth.setHours(0, 0, 0, 0)
    
    const nextMonth = new Date(thisMonth)
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    
    // Monthly earnings
    const earningsSnapshot = await db.collection('payments')
      .where('photographer_id', '==', photographerId)
      .where('payment_date', '>=', thisMonth)
      .where('payment_date', '<', nextMonth)
      .where('status', '==', 'paid')
      .get()
    
    let monthlyEarnings = 0
    earningsSnapshot.forEach(doc => {
      const payment = doc.data()
      monthlyEarnings += payment.amount || 0
    })
    
    // Pending payments
    const pendingSnapshot = await db.collection('payments')
      .where('photographer_id', '==', photographerId)
      .where('status', '==', 'pending')
      .get()
    
    let pendingPayments = 0
    pendingSnapshot.forEach(doc => {
      const payment = doc.data()
      pendingPayments += payment.amount || 0
    })
    
    // Monthly target (from user profile)
    const photographerDoc = await db.collection('users').doc(photographerId).get()
    const photographer = photographerDoc.data()
    const monthlyTarget = photographer?.monthly_target || 1200000
    
    const targetProgress = Math.round((monthlyEarnings / monthlyTarget) * 100)
    
    return {
      type: 'freelancer',
      monthlyEarnings: {
        current: monthlyEarnings,
        target: monthlyTarget
      },
      pendingPayments: {
        amount: pendingPayments,
        tasks: pendingSnapshot.size
      },
      targetProgress: {
        percentage: targetProgress
      }
    }
  } catch (error) {
    console.error('Error fetching freelancer financial info:', error)
    throw error
  }
}

/**
 * Get employee financial information
 */
async function getEmployeeFinancialInfo(photographerId: string) {
  try {
    // Get salary info from user profile
    const photographerDoc = await db.collection('users').doc(photographerId).get()
    const photographer = photographerDoc.data()
    
    const monthlySalary = photographer?.monthly_salary || 800000
    
    // Calculate overtime bonus this month
    const thisMonth = new Date()
    thisMonth.setDate(1)
    thisMonth.setHours(0, 0, 0, 0)
    
    const nextMonth = new Date(thisMonth)
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    
    const overtimeSnapshot = await db.collection('overtime_records')
      .where('photographer_id', '==', photographerId)
      .where('date', '>=', thisMonth)
      .where('date', '<', nextMonth)
      .get()
    
    let overtimeBonus = 0
    overtimeSnapshot.forEach(doc => {
      const overtime = doc.data()
      overtimeBonus += overtime.bonus_amount || 0
    })
    
    // Get performance rating this month
    const ratingSnapshot = await db.collection('performance_ratings')
      .where('photographer_id', '==', photographerId)
      .where('period_start', '>=', thisMonth)
      .where('period_start', '<', nextMonth)
      .get()
    
    let performanceRating = 4.5 // Default
    if (!ratingSnapshot.empty) {
      const rating = ratingSnapshot.docs[0].data()
      performanceRating = rating.average_score || 4.5
    }
    
    // Next payment date (usually 25th of month)
    const nextPaymentDate = new Date()
    nextPaymentDate.setDate(25)
    if (nextPaymentDate < new Date()) {
      nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1)
    }
    
    return {
      type: 'employee',
      monthlySalary: {
        amount: monthlySalary
      },
      overtimeBonus: {
        amount: overtimeBonus
      },
      performanceRating: {
        score: Math.round(performanceRating * 10) / 10
      },
      nextPaymentDate: formatDate(nextPaymentDate)
    }
  } catch (error) {
    console.error('Error fetching employee financial info:', error)
    throw error
  }
}

/**
 * Get task statistics
 */
async function getTaskStats(photographerId: string) {
  try {
    // Active tasks
    const activeTasksSnapshot = await db.collection('tasks')
      .where('photographer_id', '==', photographerId)
      .where('status', 'in', ['جديد', 'قيد التنفيذ'])
      .get()
    
    // Today's tasks
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const todayTasksSnapshot = await db.collection('tasks')
      .where('photographer_id', '==', photographerId)
      .where('scheduled_date', '>=', today)
      .where('scheduled_date', '<', tomorrow)
      .get()
    
    // This week's tasks
    const startOfWeek = new Date()
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
    startOfWeek.setHours(0, 0, 0, 0)
    
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(endOfWeek.getDate() + 7)
    
    const weekTasksSnapshot = await db.collection('tasks')
      .where('photographer_id', '==', photographerId)
      .where('scheduled_date', '>=', startOfWeek)
      .where('scheduled_date', '<', endOfWeek)
      .get()
    
    // Completed tasks this month
    const thisMonth = new Date()
    thisMonth.setDate(1)
    thisMonth.setHours(0, 0, 0, 0)
    
    const nextMonth = new Date(thisMonth)
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    
    const completedTasksSnapshot = await db.collection('tasks')
      .where('photographer_id', '==', photographerId)
      .where('status', '==', 'مكتمل')
      .where('completed_date', '>=', thisMonth)
      .where('completed_date', '<', nextMonth)
      .get()
    
    // Overall rating
    const ratingsSnapshot = await db.collection('task_ratings')
      .where('photographer_id', '==', photographerId)
      .where('created_at', '>=', thisMonth)
      .where('created_at', '<', nextMonth)
      .get()
    
    let totalRating = 0
    let ratingCount = 0
    ratingsSnapshot.forEach(doc => {
      const rating = doc.data()
      totalRating += rating.score || 0
      ratingCount++
    })
    
    const averageRating = ratingCount > 0 ? totalRating / ratingCount : 4.3
    
    return {
      activeTasks: {
        count: activeTasksSnapshot.size,
        today: todayTasksSnapshot.size,
        thisWeek: weekTasksSnapshot.size
      },
      completedTasks: {
        count: completedTasksSnapshot.size,
        thisMonth: completedTasksSnapshot.size,
        improvement: 15 // Mock calculation
      },
      overallRating: {
        score: Math.round(averageRating * 10) / 10,
        reviews: ratingCount
      }
    }
  } catch (error) {
    console.error('Error fetching task stats:', error)
    return getDefaultTaskStats()
  }
}

/**
 * Get today's tasks
 */
async function getTodayTasks(photographerId: string) {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const tasksSnapshot = await db.collection('tasks')
      .where('photographer_id', '==', photographerId)
      .where('scheduled_date', '>=', today)
      .where('scheduled_date', '<', tomorrow)
      .orderBy('scheduled_time', 'asc')
      .get()
    
    const tasks: any[] = []
    
    for (const doc of tasksSnapshot.docs) {
      const task = doc.data()
      
      // Get brand name
      let brandName = 'غير محدد'
      if (task.brand_id) {
        try {
          const brandDoc = await db.collection('brands').doc(task.brand_id).get()
          if (brandDoc.exists) {
            brandName = brandDoc.data()?.name || 'غير محدد'
          }
        } catch (err) {
          console.error('Error fetching brand:', err)
        }
      }
      
      tasks.push({
        id: doc.id,
        title: task.title,
        brand: brandName,
        location: task.location,
        status: task.status,
        time: task.scheduled_time || '09:00',
        duration: task.estimated_duration || '2 ساعة',
        type: task.type || 'photography'
      })
    }
    
    return tasks
  } catch (error) {
    console.error('Error fetching today tasks:', error)
    return []
  }
}

/**
 * Get available tasks
 */
async function getAvailableTasks(photographerId: string) {
  try {
    // Get photographer's specializations
    const photographerDoc = await db.collection('users').doc(photographerId).get()
    const photographer = photographerDoc.data()
    const specializations = photographer?.specializations || ['تصوير عام']
    
    const availableTasksSnapshot = await db.collection('tasks')
      .where('status', '==', 'متاح')
      .where('specialization_required', 'in', specializations)
      .orderBy('priority', 'desc')
      .orderBy('payment_amount', 'desc')
      .limit(10)
      .get()
    
    const tasks: any[] = []
    
    for (const doc of availableTasksSnapshot.docs) {
      const task = doc.data()
      
      // Get brand name
      let brandName = 'غير محدد'
      if (task.brand_id) {
        try {
          const brandDoc = await db.collection('brands').doc(task.brand_id).get()
          if (brandDoc.exists) {
            brandName = brandDoc.data()?.name || 'غير محدد'
          }
        } catch (err) {
          console.error('Error fetching brand:', err)
        }
      }
      
      tasks.push({
        id: doc.id,
        title: task.title,
        brand: brandName,
        location: task.location,
        priority: task.priority || 'متوسط',
        payment: task.payment_amount || 0,
        type: task.type || 'photography'
      })
    }
    
    return tasks
  } catch (error) {
    console.error('Error fetching available tasks:', error)
    return []
  }
}

/**
 * Get personal statistics
 */
async function getPersonalStats(photographerId: string) {
  try {
    // Total completed tasks
    const completedTasksSnapshot = await db.collection('tasks')
      .where('photographer_id', '==', photographerId)
      .where('status', '==', 'مكتمل')
      .get()
    
    // Total work hours (mock calculation)
    const workHours = completedTasksSnapshot.size * 2.5 // Average 2.5 hours per task
    
    // Active projects
    const activeProjectsSnapshot = await db.collection('projects')
      .where('photographer_id', '==', photographerId)
      .where('status', 'in', ['قيد التنفيذ', 'جديد'])
      .get()
    
    // Client rating average
    const ratingsSnapshot = await db.collection('task_ratings')
      .where('photographer_id', '==', photographerId)
      .get()
    
    let totalRating = 0
    let ratingCount = 0
    ratingsSnapshot.forEach(doc => {
      const rating = doc.data()
      totalRating += rating.score || 0
      ratingCount++
    })
    
    const clientRating = ratingCount > 0 ? totalRating / ratingCount : 4.3
    
    return {
      tasksCompleted: completedTasksSnapshot.size,
      workHours: Math.round(workHours),
      activeProjects: activeProjectsSnapshot.size,
      clientRating: Math.round(clientRating * 10) / 10
    }
  } catch (error) {
    console.error('Error fetching personal stats:', error)
    return {
      tasksCompleted: 0,
      workHours: 0,
      activeProjects: 0,
      clientRating: 4.0
    }
  }
}

/**
 * Get upload queue
 */
async function getUploadQueue(photographerId: string) {
  try {
    const uploadSnapshot = await db.collection('uploads')
      .where('photographer_id', '==', photographerId)
      .where('status', 'in', ['pending', 'processing'])
      .get()
    
    let pending = 0
    let processing = 0
    
    uploadSnapshot.forEach(doc => {
      const upload = doc.data()
      if (upload.status === 'pending') pending++
      if (upload.status === 'processing') processing++
    })
    
    return {
      count: uploadSnapshot.size,
      pending,
      processing
    }
  } catch (error) {
    console.error('Error fetching upload queue:', error)
    return {
      count: 0,
      pending: 0,
      processing: 0
    }
  }
}

/**
 * Helper functions
 */
function getDefaultFinancialInfo(contractType: string) {
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
      monthlySalary: { amount: 800000 },
      overtimeBonus: { amount: 0 },
      performanceRating: { score: 4.5 },
      nextPaymentDate: '25 ديسمبر'
    }
  }
}

function getDefaultTaskStats() {
  return {
    activeTasks: { count: 0, today: 0, thisWeek: 0 },
    completedTasks: { count: 0, thisMonth: 0, improvement: 0 },
    overallRating: { score: 4.0, reviews: 0 }
  }
}

function formatDate(date: Date): string {
  const months = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ]
  
  return `${date.getDate()} ${months[date.getMonth()]}`
} 
import { Request, Response } from 'express'
import { db } from '../../config/firebase'

/**
 * Get Brand Coordinator Dashboard Statistics (NAVA specific)
 */
export const brandCoordinatorDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { brandId } = req.params
    
    if (!brandId) {
      res.status(400).json({
        success: false,
        message: 'معرف البراند مطلوب'
      })
      return
    }
    
    // Get brand information
    const brandInfo = await getBrandInfo(brandId)
    
    // Get brand statistics
    const brandStats = await getBrandStats(brandId)
    
    // Get current projects
    const currentProjects = await getCurrentProjects(brandId)
    
    // Get pending content
    const pendingContent = await getPendingContent(brandId)
    
    // Get budget usage
    const budgetUsage = await getBudgetUsage(brandId)
    
    const dashboardData = {
      brandInfo,
      brandStats,
      currentProjects,
      pendingContent,
      budgetUsage,
      timestamp: new Date().toISOString()
    }
    
    res.status(200).json({
      success: true,
      data: dashboardData
    })
    
  } catch (error) {
    console.error('Error fetching brand coordinator dashboard:', error)
    res.status(500).json({
      success: false,
      message: 'فشل في جلب بيانات لوحة التحكم',
      error: (error as Error).message
    })
  }
}

/**
 * Get brand information
 */
async function getBrandInfo(brandId: string) {
  try {
    const brandDoc = await db.collection('brands').doc(brandId).get()
    
    if (!brandDoc.exists) {
      throw new Error('البراند غير موجود')
    }
    
    const brand = brandDoc.data()
    
    return {
      id: brandDoc.id,
      name: brand?.name || 'NAVA',
      logo: brand?.logo_url || '/brands/nava-logo.png',
      status: brand?.status || 'نشط',
      description: brand?.description || 'براند أزياء عراقي رائد',
      establishedDate: brand?.established_date,
      website: brand?.website,
      socialMedia: brand?.social_media || {}
    }
  } catch (error) {
    console.error('Error fetching brand info:', error)
    throw error
  }
}

/**
 * Get brand statistics
 */
async function getBrandStats(brandId: string) {
  try {
    // Get current month projects
    const thisMonth = new Date()
    thisMonth.setDate(1)
    thisMonth.setHours(0, 0, 0, 0)
    
    const nextMonth = new Date(thisMonth)
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    
    // Monthly projects count
    const monthlyProjectsSnapshot = await db.collection('projects')
      .where('brand_id', '==', brandId)
      .where('created_at', '>=', thisMonth)
      .where('created_at', '<', nextMonth)
      .get()
    
    // Active projects
    const activeProjectsSnapshot = await db.collection('projects')
      .where('brand_id', '==', brandId)
      .where('status', 'in', ['قيد التنفيذ', 'جديد'])
      .get()
    
    // Pending projects
    const pendingProjectsSnapshot = await db.collection('projects')
      .where('brand_id', '==', brandId)
      .where('status', '==', 'في الانتظار')
      .get()
    
    // Content for approval
    const contentApprovalSnapshot = await db.collection('content')
      .where('brand_id', '==', brandId)
      .where('status', '==', 'pending_approval')
      .get()
    
    let urgentContent = 0
    contentApprovalSnapshot.forEach(doc => {
      const content = doc.data()
      if (content.priority === 'عاجل') {
        urgentContent++
      }
    })
    
    // Calculate client satisfaction
    const clientSatisfaction = await calculateClientSatisfaction(brandId)
    
    return {
      monthlyProjects: {
        count: monthlyProjectsSnapshot.size
      },
      activeProjects: {
        count: activeProjectsSnapshot.size,
        inProgress: activeProjectsSnapshot.docs.filter(doc => 
          doc.data().status === 'قيد التنفيذ'
        ).length,
        pending: pendingProjectsSnapshot.size
      },
      contentApproval: {
        count: contentApprovalSnapshot.size,
        urgent: urgentContent
      },
      clientSatisfaction
    }
  } catch (error) {
    console.error('Error fetching brand stats:', error)
    throw error
  }
}

/**
 * Calculate client satisfaction rating
 */
async function calculateClientSatisfaction(brandId: string) {
  try {
    const thisMonth = new Date()
    thisMonth.setDate(1)
    thisMonth.setHours(0, 0, 0, 0)
    
    const nextMonth = new Date(thisMonth)
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    
    const ratingsSnapshot = await db.collection('project_ratings')
      .where('brand_id', '==', brandId)
      .where('created_at', '>=', thisMonth)
      .where('created_at', '<', nextMonth)
      .get()
    
    if (ratingsSnapshot.empty) {
      return { rating: 4.5 } // Default rating
    }
    
    let totalRating = 0
    let count = 0
    
    ratingsSnapshot.forEach(doc => {
      const rating = doc.data()
      totalRating += rating.score || 0
      count++
    })
    
    const averageRating = count > 0 ? totalRating / count : 4.5
    
    return {
      rating: Math.round(averageRating * 10) / 10
    }
  } catch (error) {
    console.error('Error calculating client satisfaction:', error)
    return { rating: 4.5 }
  }
}

/**
 * Get current projects for the brand
 */
async function getCurrentProjects(brandId: string) {
  try {
    const projectsSnapshot = await db.collection('projects')
      .where('brand_id', '==', brandId)
      .where('status', 'in', ['قيد التنفيذ', 'جديد', 'مراجعة', 'في التخطيط'])
      .orderBy('created_at', 'desc')
      .limit(10)
      .get()
    
    const projects: any[] = []
    
    projectsSnapshot.forEach(doc => {
      const project = doc.data()
      projects.push({
        id: doc.id,
        title: project.title,
        description: project.description,
        status: project.status,
        progress: project.progress || 0,
        deadline: formatDeadline(project.deadline),
        icon: getProjectIcon(project.type),
        priority: project.priority || 'متوسط'
      })
    })
    
    return projects
  } catch (error) {
    console.error('Error fetching current projects:', error)
    return []
  }
}

/**
 * Get pending content for approval
 */
async function getPendingContent(brandId: string) {
  try {
    const contentSnapshot = await db.collection('content')
      .where('brand_id', '==', brandId)
      .where('status', '==', 'pending_approval')
      .orderBy('priority', 'desc')
      .orderBy('created_at', 'desc')
      .limit(10)
      .get()
    
    const content: any[] = []
    
    for (const doc of contentSnapshot.docs) {
      const contentData = doc.data()
      
      // Get photographer name
      let photographerName = 'غير محدد'
      if (contentData.photographer_id) {
        try {
          const photographerDoc = await db.collection('users').doc(contentData.photographer_id).get()
          if (photographerDoc.exists) {
            photographerName = photographerDoc.data()?.display_name || 'غير محدد'
          }
        } catch (err) {
          console.error('Error fetching photographer:', err)
        }
      }
      
      content.push({
        id: doc.id,
        title: contentData.title,
        photographer: photographerName,
        thumbnail: contentData.thumbnail_url || `https://picsum.photos/100/100?random=${doc.id}`,
        priority: contentData.priority || 'عادي',
        type: contentData.type || 'صورة',
        created_at: contentData.created_at
      })
    }
    
    return content
  } catch (error) {
    console.error('Error fetching pending content:', error)
    return []
  }
}

/**
 * Get budget usage for the brand
 */
async function getBudgetUsage(brandId: string) {
  try {
    // Get brand budget information
    const brandDoc = await db.collection('brands').doc(brandId).get()
    const brand = brandDoc.data()
    
    const totalBudget = brand?.budget?.total || 120000 // Default budget
    
    // Calculate used budget from completed projects this month
    const thisMonth = new Date()
    thisMonth.setDate(1)
    thisMonth.setHours(0, 0, 0, 0)
    
    const nextMonth = new Date(thisMonth)
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    
    const projectsSnapshot = await db.collection('projects')
      .where('brand_id', '==', brandId)
      .where('status', 'in', ['مكتمل', 'قيد التنفيذ'])
      .where('created_at', '>=', thisMonth)
      .where('created_at', '<', nextMonth)
      .get()
    
    let usedBudget = 0
    projectsSnapshot.forEach(doc => {
      const project = doc.data()
      usedBudget += project.cost || 0
    })
    
    const percentage = Math.round((usedBudget / totalBudget) * 100)
    const remaining = totalBudget - usedBudget
    
    return {
      total: totalBudget,
      used: usedBudget,
      remaining: remaining,
      percentage: percentage
    }
  } catch (error) {
    console.error('Error fetching budget usage:', error)
    return {
      total: 120000,
      used: 75000,
      remaining: 45000,
      percentage: 63
    }
  }
}

/**
 * Helper functions
 */
function formatDeadline(deadline: any): string {
  if (!deadline) return 'غير محدد'
  
  const deadlineDate = deadline.toDate ? deadline.toDate() : new Date(deadline)
  const now = new Date()
  const diffMs = deadlineDate.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) return 'متأخر'
  if (diffDays === 0) return 'اليوم'
  if (diffDays === 1) return 'غداً'
  if (diffDays <= 7) return `خلال ${diffDays} أيام`
  if (diffDays <= 30) return `خلال ${Math.ceil(diffDays / 7)} أسبوع`
  return `خلال ${Math.ceil(diffDays / 30)} شهر`
}

function getProjectIcon(type: string): string {
  switch (type) {
    case 'campaign': return 'mdi-bullhorn'
    case 'photoshoot': return 'mdi-camera'
    case 'video': return 'mdi-video'
    case 'design': return 'mdi-palette'
    case 'seasonal': return 'mdi-snowflake'
    case 'catalog': return 'mdi-book-open'
    default: return 'mdi-briefcase'
  }
} 
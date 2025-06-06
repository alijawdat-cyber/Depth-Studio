import { Request, Response } from 'express'
import { 
  getSuperAdminStats,
  getMarketingCoordinatorStats,
  getBrandCoordinatorStats,
  getPhotographerStats
} from './utils'

// ======================================
// Dashboard Handlers
// ======================================

/**
 * Super Admin Dashboard Handler
 * GET /api/dashboards/super-admin
 */
export const getSuperAdminDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const dashboardData = await getSuperAdminStats()
    
    res.status(200).json({
      success: true,
      data: {
        ...dashboardData,
        timestamp: new Date().toISOString()
      }
    })
    
  } catch (error) {
    console.error('Error fetching super admin dashboard:', error)
    res.status(500).json({
      success: false,
      message: 'فشل في جلب بيانات لوحة تحكم المدير العام',
      error: (error as Error).message
    })
  }
}

/**
 * Marketing Coordinator Dashboard Handler
 * GET /api/dashboards/marketing-coordinator
 */
export const getMarketingCoordinatorDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const dashboardData = await getMarketingCoordinatorStats()
    
    res.status(200).json({
      success: true,
      data: {
        ...dashboardData,
        timestamp: new Date().toISOString()
      }
    })
    
  } catch (error) {
    console.error('Error fetching marketing coordinator dashboard:', error)
    res.status(500).json({
      success: false,
      message: 'فشل في جلب بيانات لوحة تحكم منسق التسويق',
      error: (error as Error).message
    })
  }
}

/**
 * Brand Coordinator Dashboard Handler
 * GET /api/dashboards/brand-coordinator/:brandId
 */
export const getBrandCoordinatorDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { brandId } = req.params
    const dashboardData = await getBrandCoordinatorStats(brandId)
    
    res.status(200).json({
      success: true,
      data: {
        ...dashboardData,
        timestamp: new Date().toISOString()
      }
    })
    
  } catch (error) {
    console.error('Error fetching brand coordinator dashboard:', error)
    res.status(500).json({
      success: false,
      message: 'فشل في جلب بيانات لوحة تحكم منسق العلامة التجارية',
      error: (error as Error).message
    })
  }
}

/**
 * Photographer Dashboard Handler
 * GET /api/dashboards/photographer/:photographerId
 */
export const getPhotographerDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { photographerId } = req.params
    const dashboardData = await getPhotographerStats(photographerId)
    
    res.status(200).json({
      success: true,
      data: {
        ...dashboardData,
        timestamp: new Date().toISOString()
      }
    })
    
  } catch (error) {
    console.error('Error fetching photographer dashboard:', error)
    res.status(500).json({
      success: false,
      message: 'فشل في جلب بيانات لوحة تحكم المصور',
      error: (error as Error).message
    })
  }
} 
import { Request, Response } from 'express'
import { 
  updateLoginInfo,
  updateLogoutInfo,
  verifyUserStatus,
  getUserPermissions,
  updateUserPermissions,
  checkPermission
} from './utils'

// ======================================
// Auth Handlers
// ======================================

/**
 * Login Handler
 * POST /api/auth/login
 */
export const loginHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { uid } = req.body
    const result = await updateLoginInfo(uid)
    
    res.status(200).json({
      success: true,
      data: result,
      message: 'تم تسجيل الدخول بنجاح'
    })
    
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      success: false,
      message: 'فشل في تسجيل الدخول',
      error: (error as Error).message
    })
  }
}

/**
 * Logout Handler
 * POST /api/auth/logout
 */
export const logoutHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { uid } = req.body
    const result = await updateLogoutInfo(uid)
    
    res.status(200).json({
      success: true,
      data: result,
      message: 'تم تسجيل الخروج بنجاح'
    })
    
  } catch (error) {
    console.error('Logout error:', error)
    res.status(500).json({
      success: false,
      message: 'فشل في تسجيل الخروج',
      error: (error as Error).message
    })
  }
}

/**
 * Verify User Handler
 * GET /api/auth/verify/:uid
 */
export const verifyUserHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { uid } = req.params
    const result = await verifyUserStatus(uid)
    
    res.status(200).json({
      success: true,
      data: result,
      message: 'تم التحقق من المستخدم بنجاح'
    })
    
  } catch (error) {
    console.error('Verify user error:', error)
    res.status(500).json({
      success: false,
      message: 'فشل في التحقق من المستخدم',
      error: (error as Error).message
    })
  }
}

/**
 * Refresh Token Handler
 * POST /api/auth/refresh
 */
export const refreshTokenHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body
    
    // TODO: Implement token refresh logic
    res.status(200).json({
      success: true,
      data: { accessToken: 'new-token' },
      message: 'تم تحديث الرمز المميز بنجاح'
    })
    
  } catch (error) {
    console.error('Refresh token error:', error)
    res.status(500).json({
      success: false,
      message: 'فشل في تحديث الرمز المميز',
      error: (error as Error).message
    })
  }
}

// ======================================
// Permission Handlers
// ======================================

/**
 * Get User Permissions Handler
 * GET /api/auth/permissions/:uid
 */
export const getUserPermissionsHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { uid } = req.params
    const result = await getUserPermissions(uid)
    
    res.status(200).json({
      success: true,
      data: result,
      message: 'تم جلب الصلاحيات بنجاح'
    })
    
  } catch (error) {
    console.error('Get permissions error:', error)
    res.status(500).json({
      success: false,
      message: 'فشل في جلب الصلاحيات',
      error: (error as Error).message
    })
  }
}

/**
 * Update User Permissions Handler
 * PUT /api/auth/permissions/:uid
 */
export const updateUserPermissionsHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { uid } = req.params
    const { permissions, updatedBy } = req.body
    
    const result = await updateUserPermissions(uid, permissions, updatedBy)
    
    res.status(200).json({
      success: true,
      data: result,
      message: 'تم تحديث الصلاحيات بنجاح'
    })
    
  } catch (error) {
    console.error('Update permissions error:', error)
    res.status(500).json({
      success: false,
      message: 'فشل في تحديث الصلاحيات',
      error: (error as Error).message
    })
  }
}

/**
 * Check Permission Handler
 * POST /api/auth/check-permission
 */
export const checkPermissionHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { uid, permission, context } = req.body
    const result = await checkPermission(uid, permission, context)
    
    res.status(200).json({
      success: true,
      data: result,
      message: 'تم فحص الصلاحية بنجاح'
    })
    
  } catch (error) {
    console.error('Check permission error:', error)
    res.status(500).json({
      success: false,
      message: 'فشل في فحص الصلاحية',
      error: (error as Error).message
    })
  }
} 
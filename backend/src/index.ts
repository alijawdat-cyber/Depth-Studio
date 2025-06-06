/**
 * Firebase Functions Entry Point - Depth Studio Backend
 */

import { onRequest } from 'firebase-functions/v2/https'
import { initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

// Import main app (includes all APIs)
import app from './app'

// Initialize Firebase Admin
const db = getFirestore()

try {
  initializeApp()
  console.log('✅ Firebase Admin تم تهيئته بنجاح')
} catch (error) {
  console.error('❌ خطأ في تهيئة Firebase Admin:', error)
}

// Health Check Function (الدالة الأصلية)
export const health = onRequest({ 
  cors: true,
  region: 'us-central1',
  memory: '256MiB',
  timeoutSeconds: 30
}, (req, res) => {
  console.log('🏥 Health check requested')
  
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Depth Studio Backend',
    version: '1.0.0',
    message: 'مرحبا! السيرفر يعمل بنجاح 🚀',
    nodeVersion: process.version
  })
})

// 🆕 Health Check Function (للتوافق مع الدالة المنشورة)
export const healthCheck = onRequest({
  cors: true,
  region: 'us-central1',
  memory: '256MiB',
  timeoutSeconds: 30
}, (req, res) => {
  console.log('🏥 Health check v2 requested')
  
  res.status(200).json({
    status: 'ok',
    message: 'System is healthy (v2)!',
    timestamp: new Date().toISOString(),
    service: 'Depth Studio Backend',
    version: '1.0.0',
    nodeVersion: process.version,
    arabicMessage: 'النظام يعمل بشكل مثالي! 🎉'
  })
})

// Test function  
export const test = onRequest({ 
  cors: true,
  region: 'us-central1',
  memory: '256MiB'
}, (req, res) => {
  console.log('🧪 Test function called')
  
  res.status(200).json({
    message: 'Firebase Functions تعمل بشكل مثالي! 🎉',
    timestamp: new Date().toISOString(),
    arabicMessage: 'أهلاً وسهلاً! كل شي شغال زين 👍'
  })
})

// 🔴 **NEW: Get Pending Users Function**
export const getPendingUsersFunction = onRequest({
  cors: true,
  region: 'us-central1',
  memory: '512MiB',
  timeoutSeconds: 60
}, async (req, res) => {
  try {
    console.log('📋 Get Pending Users function called')
    
    // جلب المستخدمين في انتظار الموافقة
    const pendingUsersSnapshot = await db.collection('users')
      .where('status', '==', 'pending_approval')
      .orderBy('created_at', 'desc')
      .get()
    
    const pendingUsers: any[] = []
    
    pendingUsersSnapshot.forEach(doc => {
      const userData = doc.data()
      pendingUsers.push({
        id: doc.id,
        name: userData.display_name || `${userData.first_name} ${userData.last_name}`,
        email: userData.email,
        role: userData.primary_role,
        avatar: userData.profile_photo_url || userData.avatar_url || '/default-avatar.png',
        created_at: userData.created_at,
        phone: userData.phone || null,
        bio: userData.bio || null,
        location: userData.location || null
      })
    })
    
    console.log(`✅ Found ${pendingUsers.length} pending users`)
    
    res.status(200).json({
      success: true,
      message: 'تم جلب المستخدمين المعلقين بنجاح',
      data: pendingUsers,
      count: pendingUsers.length,
      timestamp: new Date().toISOString()
    })
    
  } catch (error: any) {
    console.error('❌ Error in getPendingUsersFunction:', error)
    
    res.status(500).json({
      success: false,
      error: 'خطأ في النظام',
      message: 'حدث خطأ أثناء جلب المستخدمين',
      timestamp: new Date().toISOString(),
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// 🔴 **NEW: Get User Stats Function**
export const getUserStatsFunction = onRequest({
  cors: true,
  region: 'us-central1',
  memory: '512MiB',
  timeoutSeconds: 60
}, async (req, res) => {
  try {
    console.log('📊 Get User Stats function called')
    
    // إجمالي المستخدمين
    const totalUsersSnapshot = await db.collection('users').get()
    const totalUsers = totalUsersSnapshot.size
    
    // المستخدمين النشطين
    const activeUsersSnapshot = await db.collection('users')
      .where('is_active', '==', true)
      .get()
    const activeUsers = activeUsersSnapshot.size
    
    // المستخدمين في انتظار الموافقة
    const pendingUsersSnapshot = await db.collection('users')
      .where('status', '==', 'pending_approval')
      .get()
    const pendingApprovals = pendingUsersSnapshot.size
    
    // إحصائيات حسب الدور
    const roleStats: Record<string, number> = {}
    totalUsersSnapshot.docs.forEach(doc => {
      const role = doc.data().primary_role
      roleStats[role] = (roleStats[role] || 0) + 1
    })
    
    const stats = {
      totalUsers,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
      pendingApprovals,
      roleDistribution: roleStats,
      lastUpdated: new Date().toISOString()
    }
    
    console.log('✅ User stats calculated successfully')
    
    res.status(200).json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    })
    
  } catch (error: any) {
    console.error('❌ Error in getUserStatsFunction:', error)
    
    res.status(500).json({
      success: false,
      error: 'خطأ في النظام',
      message: 'حدث خطأ أثناء جلب الإحصائيات',
      timestamp: new Date().toISOString()
    })
  }
})

// 🔴 **NEW: Approve User Function**
export const approveUserFunction = onRequest({
  cors: true,
  region: 'us-central1',
  memory: '512MiB',
  timeoutSeconds: 60
}, async (req, res) => {
  try {
    console.log('✅ Approve User function called')
    
    const { userId } = req.body
    
    if (!userId) {
      res.status(400).json({
        success: false,
        error: 'معرف المستخدم مطلوب',
        timestamp: new Date().toISOString()
      })
      return
    }
    
    // تحديث حالة المستخدم
    await db.collection('users').doc(userId).update({
      status: 'active',
      is_active: true,
      updated_at: new Date()
    })
    
    console.log(`✅ User ${userId} approved successfully`)
    
    res.status(200).json({
      success: true,
      message: 'تم قبول المستخدم بنجاح',
      timestamp: new Date().toISOString()
    })
    
  } catch (error: any) {
    console.error('❌ Error in approveUserFunction:', error)
    
    res.status(500).json({
      success: false,
      error: 'خطأ في النظام',
      message: 'حدث خطأ أثناء قبول المستخدم',
      timestamp: new Date().toISOString()
    })
  }
})

// 🔴 **NEW: Reject User Function**
export const rejectUserFunction = onRequest({
  cors: true,
  region: 'us-central1',
  memory: '512MiB',
  timeoutSeconds: 60
}, async (req, res) => {
  try {
    console.log('❌ Reject User function called')
    
    const { userId, reason } = req.body
    
    if (!userId) {
      res.status(400).json({
        success: false,
        error: 'معرف المستخدم مطلوب',
        timestamp: new Date().toISOString()
      })
      return
    }
    
    // تحديث حالة المستخدم
    await db.collection('users').doc(userId).update({
      status: 'rejected',
      is_active: false,
      rejection_reason: reason || 'لم يتم تحديد السبب',
      updated_at: new Date()
    })
    
    console.log(`❌ User ${userId} rejected successfully`)
    
    res.status(200).json({
      success: true,
      message: 'تم رفض المستخدم بنجاح',
      timestamp: new Date().toISOString()
    })
    
  } catch (error: any) {
    console.error('❌ Error in rejectUserFunction:', error)
    
    res.status(500).json({
      success: false,
      error: 'خطأ في النظام',
      message: 'حدث خطأ أثناء رفض المستخدم',
      timestamp: new Date().toISOString()
    })
  }
})

// 🔴 **NEW: SSR Depth Studio Function (Frontend SSR)**
export const ssrdepthstudio = onRequest({
  cors: true,
  region: 'us-central1',
  memory: '256MiB',
  timeoutSeconds: 30
}, (req, res) => {
  console.log('🌐 SSR Depth Studio function called')
  
  res.status(200).json({
    message: 'Depth Studio SSR Function Active',
    timestamp: new Date().toISOString(),
    service: 'Frontend SSR Support',
    version: '1.0.0'
  })
})

// ===============================
// 🆕 Main API Application
// ===============================

// 🆕 API: التطبيق الرئيسي مع جميع الـ APIs
export const api = onRequest({
  cors: true,
  region: 'us-central1',
  memory: '1GiB',
  timeoutSeconds: 300
}, app)
/**
 * Firebase Functions Entry Point - Depth Studio Backend
 */

import { onRequest } from 'firebase-functions/v2/https'
import { initializeApp } from 'firebase-admin/app'
import express from 'express'
import cors from 'cors'

// Import user management APIs
import { approveUser, rejectUser, getPendingUsers, getUserStats } from './api/userManagement'

// Initialize Firebase Admin
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

// 🆕 Main API Function for User Management
export const api = onRequest({
  cors: true,
  region: 'us-central1',
  memory: '512MiB',
  timeoutSeconds: 60
}, (req, res) => {
  const app = express()
  
  // Middleware
  app.use(cors({ origin: true }))
  app.use(express.json())
  
  // User Management Routes
  app.post('/users/:userId/approve', approveUser)
  app.post('/users/:userId/reject', rejectUser)
  app.get('/users/pending-approval', getPendingUsers)
  app.get('/users/stats', getUserStats)
  
  // Default route
  app.get('/', (req, res) => {
    res.json({
      success: true,
      message: 'Depth Studio API - نظام إدارة المحتوى',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      availableEndpoints: [
        'POST /users/:userId/approve - الموافقة على مستخدم',
        'POST /users/:userId/reject - رفض مستخدم',
        'GET /users/pending-approval - المستخدمين في انتظار الموافقة',
        'GET /users/stats - إحصائيات المستخدمين'
      ]
    })
  })

  // Error handling
  app.use((error: any, req: any, res: any, next: any) => {
    console.error('❌ API Error:', error)
    res.status(500).json({
      success: false,
      error: 'خطأ في النظام',
      message: error.message,
      timestamp: new Date().toISOString()
    })
  })
  
  // Execute the Express app
  return app(req, res)
})
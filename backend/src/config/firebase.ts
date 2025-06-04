import { initializeApp, getApps } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'
import { getStorage } from 'firebase-admin/storage'
import * as admin from 'firebase-admin'
import * as path from 'path'

// Validate required environment variables
const requiredEnvVars = ['FIREBASE_PROJECT_ID']
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.warn(`⚠️ Missing environment variable: ${envVar}`)
  }
}

// Service Account Key Path
const serviceAccountPath = path.join(process.cwd(), '..', 'database', 'service-account-key.json')

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  const projectId = process.env.FIREBASE_PROJECT_ID || 'depth-studio'
  const databaseURL = process.env.FIREBASE_DATABASE_URL || 'https://depth-studio-default-rtdb.firebaseio.com'
  const storageBucket = process.env.FIREBASE_STORAGE_BUCKET || 'depth-studio.firebasestorage.app'

  // Check if running in Firebase Functions environment
  if (process.env.FUNCTIONS_EMULATOR || process.env.FIREBASE_CONFIG) {
    // Running in Firebase Functions - use default credentials
    console.log('🔥 Initializing Firebase Admin for Functions environment')
    initializeApp({
      projectId: projectId
    })
  } else {
    // Running locally - use service account
    try {
      const serviceAccount = require(serviceAccountPath)
      initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: projectId,
        databaseURL: databaseURL,
        storageBucket: storageBucket
      })
      console.log('✅ Firebase Admin initialized with Service Account')
      console.log(`📊 Project: ${projectId}`)
      console.log(`🗄️ Database: ${databaseURL}`)
      console.log(`💾 Storage: ${storageBucket}`)
    } catch (error) {
      console.error('❌ Error loading service account:', error)
      // Fallback to default initialization
      console.log('🔄 Falling back to default Firebase initialization')
      initializeApp({
        projectId: projectId
      })
    }
  }
}

// Export Firestore database instance
export const db = getFirestore()

// Set database name if specified in environment
if (process.env.DATABASE_NAME) {
  console.log(`📋 Using database: ${process.env.DATABASE_NAME}`)
}

// Export Auth instance
export const auth = getAuth()

// Export Storage instance
export const storage = getStorage()

// Helper function to verify Firebase connection
export async function verifyFirebaseConnection(): Promise<boolean> {
  try {
    // Try to access Firestore
    await db.collection('_health').doc('test').get()
    console.log('✅ Firebase Admin connection verified')
    return true
  } catch (error) {
    console.error('❌ Firebase Admin connection failed:', error)
    return false
  }
}

// Export configuration info for debugging
export const firebaseConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID || 'depth-studio',
  databaseURL: process.env.FIREBASE_DATABASE_URL || 'https://depth-studio-default-rtdb.firebaseio.com',
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'depth-studio.firebasestorage.app',
  environment: process.env.NODE_ENV || 'development'
} 
import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { getAuth, Auth } from 'firebase/auth'
import { getFirestore, Firestore } from 'firebase/firestore'
import { getStorage, FirebaseStorage } from 'firebase/storage'
import { getAnalytics, Analytics, isSupported } from 'firebase/analytics'
import { getFunctions, Functions } from 'firebase/functions'
import { firebaseConfig as staticConfig, appConfig } from './firebase-config'

// Firebase configuration - use static config as fallback
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || staticConfig.apiKey,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || staticConfig.authDomain,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || staticConfig.projectId,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || staticConfig.storageBucket,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || staticConfig.messagingSenderId,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || staticConfig.appId,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || staticConfig.measurementId,
}

// التحقق من صحة الإعدادات
function validateFirebaseConfig() {
  const required = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID'
  ]

  const missing = required.filter(key => !process.env[key])
  
  if (missing.length > 0) {
    console.warn(`Missing Firebase environment variables: ${missing.join(', ')}`)
    console.warn('Using fallback configuration...')
    return false
  }
  return true
}

// Initialize Firebase
let app: FirebaseApp
let auth: Auth
let db: Firestore
let storage: FirebaseStorage
let analytics: Analytics | null = null
let functions: Functions

try {
  const isConfigValid = validateFirebaseConfig()
  
  if (!isConfigValid) {
    // Use mock/fallback configuration for development
    console.warn('Firebase: Using development fallback configuration')
  }
  
  // Initialize Firebase App
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
  
  // Initialize Firebase services
  auth = getAuth(app)
  const databaseId = process.env.NEXT_PUBLIC_FIRESTORE_DATABASE_ID || appConfig.databaseId
  db = getFirestore(app, databaseId)  // 🔥 مهم: استخدام database ID من البيئة
  storage = getStorage(app)
  functions = getFunctions(app, appConfig.functionsRegion) // تطابق منطقة backend
  
  // Initialize Analytics (client-side only)
  if (typeof window !== 'undefined') {
    isSupported().then((supported) => {
      if (supported) {
        analytics = getAnalytics(app)
      }
    })
  }

  // Configure emulators for development (DISABLED TO USE PRODUCTION)
  // Using production Firebase instead of emulators
  console.log('🔥 Using production Firebase configuration')
  console.log('🔥 Project ID:', firebaseConfig.projectId)
  console.log('🔥 Auth Domain:', firebaseConfig.authDomain)
  console.log('🔥 Database ID:', databaseId)
  
  // تحقق إضافي من خصائص db
  console.log('🔍 Firestore db object:', {
    databaseId: 'depth-production',
    projectId: firebaseConfig.projectId,
    isInitialized: !!db
  })

} catch (error) {
  console.error('Firebase initialization error:', error)
  throw new Error('Failed to initialize Firebase')
}

// Export Firebase services
export { app, auth, db, storage, analytics, functions }

// Export Firebase configuration for debugging
export const firebaseInfo = {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  isEmulator: process.env.NEXT_PUBLIC_USE_EMULATOR === 'true',
  environment: process.env.NODE_ENV,
}

// Helper functions
export const isFirebaseConfigured = () => {
  return !!(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId
  )
}

export const getFirebaseInfo = () => firebaseInfo 
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getAnalytics } from 'firebase/analytics'

// Validate required environment variables
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN', 
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
]

for (const envVar of requiredEnvVars) {
  if (!import.meta.env[envVar]) {
    throw new Error(`❌ Missing required environment variable: ${envVar}`)
  }
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
}

// Log configuration in development
if (import.meta.env.VITE_DEBUG_MODE === 'true') {
  console.log('🔥 Firebase initialized with config:', {
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain,
    environment: import.meta.env.VITE_NODE_ENV
  })
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app, 'depth-production')

// 🚨 FORCE LOG: للتأكد من تطبيق التعديل في المتصفح
console.log('🚨 FIREBASE CONFIG UPDATED: database ID set to depth-production')
console.log('🔍 DB Debug:', {
  timestamp: new Date().toISOString(),
  databaseIdSet: 'depth-production',
  dbObject: !!db
})

export const storage = getStorage(app)

// Initialize Analytics only if measurement ID is provided and analytics is enabled
export const analytics = (
  import.meta.env.VITE_FIREBASE_MEASUREMENT_ID && 
  import.meta.env.VITE_ENABLE_ANALYTICS === 'true'
) ? getAnalytics(app) : null

// Export app info for debugging
export const appInfo = {
  name: import.meta.env.VITE_APP_NAME || 'Depth Studio',
  version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  environment: import.meta.env.VITE_NODE_ENV || 'development'
}

// 🔍 تشخيص: إضافة logging للتأكد من database configuration
if (import.meta.env.VITE_DEBUG_MODE === 'true') {
  console.log('🔥 Firestore initialized:', {
    databaseId: 'depth-production',
    app: app.name,
    projectId: firebaseConfig.projectId
  })
  
  // تحقق إضافي من خصائص db
  console.log('🔍 Firestore db object:', {
    databaseId: (db as any)._delegate?._databaseId || 'unknown',
    projectId: (db as any)._delegate?._settings?.projectId || firebaseConfig.projectId
  })
}

export default app 
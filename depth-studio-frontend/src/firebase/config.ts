import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getAnalytics } from 'firebase/analytics'

// 🔥 Firebase Configuration - Depth Studio Project
// تحتاج تحديث هذا التكوين بالبيانات الفعلية من Firebase Console
const firebaseConfig = {
  // 🚨 IMPORTANT: Replace with actual values from Firebase Console
  // اذهب إلى: https://console.firebase.google.com -> depth-studio -> Project Settings -> Your apps
  
  apiKey: "AIzaSyDHg1-mxejIMPycZJQeE0sZJmWxsimaMFI",
  authDomain: "depth-studio.firebaseapp.com",
  databaseURL: "https://depth-studio-default-rtdb.firebaseio.com",
  projectId: "depth-studio",
  storageBucket: "depth-studio.firebasestorage.app",
  messagingSenderId: "584154257700",
  appId: "1:584154257700:web:b570a34dc3854662c3fbb1",
  measurementId: "G-RY2WLQCK1T"
}

// تهيئة تطبيق Firebase
const app = initializeApp(firebaseConfig)

// تهيئة الخدمات
const auth = getAuth(app)
const db = getFirestore(app)
const storage = getStorage(app)
const analytics = getAnalytics(app)

// تصدير التطبيق والتكوين
export { app, auth, db, storage, analytics, firebaseConfig }
export default app

// 🔍 Debug Info (يمكن حذفها في الإنتاج)
console.log('🔥 Firebase initialized for project:', firebaseConfig.projectId)
console.log('🔐 Auth domain:', firebaseConfig.authDomain) 
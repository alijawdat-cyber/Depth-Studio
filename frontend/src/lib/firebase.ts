/**
 * 🔥 Firebase Client Configuration - Depth Studio
 * ===============================================
 * 
 * 📅 محدث: يونيو 2025
 * 👨‍💻 المطور: علي جودت
 * 🎯 تفعيل Analytics, Performance, Crashlytics, Remote Config
 */

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, FirebaseStorage, connectStorageEmulator } from 'firebase/storage';
import { getFunctions, Functions, connectFunctionsEmulator } from 'firebase/functions';

// Analytics والخدمات المتقدمة
import { getAnalytics, Analytics, isSupported as analyticsSupported } from 'firebase/analytics';
import { getPerformance, FirebasePerformance } from 'firebase/performance';
import { getRemoteConfig, RemoteConfig } from 'firebase/remote-config';

/**
 * 🔧 Firebase Configuration
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID!
};

/**
 * 🔥 تهيئة Firebase App
 */
let app: FirebaseApp;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  console.log('🔥 Firebase initialized successfully');
} else {
  app = getApps()[0] as FirebaseApp;
  console.log('🔥 Firebase already initialized');
}

/**
 * 🔐 Firebase Auth
 */
export const auth: Auth = getAuth(app);

/**
 * 🗄️ Firestore Database
 */
export const db: Firestore = getFirestore(app);

// تخصيص قاعدة البيانات للإنتاج
if (process.env.NEXT_PUBLIC_FIRESTORE_DATABASE_ID) {
  // Note: Multiple database support might need different initialization
  console.log('🗄️ Using database:', process.env.NEXT_PUBLIC_FIRESTORE_DATABASE_ID);
}

/**
 * 📁 Firebase Storage
 */
export const storage: FirebaseStorage = getStorage(app);

/**
 * ⚡ Firebase Functions
 */
export const functions: Functions = getFunctions(app, 'us-central1');

/**
 * 📊 Firebase Analytics (يتم تفعيله فقط في البرواسر)
 */
let analytics: Analytics | null = null;

if (typeof window !== 'undefined') {
  analyticsSupported().then((isSupported) => {
    if (isSupported) {
      analytics = getAnalytics(app);
      console.log('📊 Firebase Analytics enabled');
    } else {
      console.log('📊 Firebase Analytics not supported in this environment');
    }
  });
}

export { analytics };

/**
 * ⚡ Firebase Performance Monitoring
 */
let firebasePerformance: FirebasePerformance | null = null;

if (typeof window !== 'undefined') {
  try {
    firebasePerformance = getPerformance(app);
    console.log('⚡ Firebase Performance enabled');
  } catch (error) {
    console.log('⚡ Firebase Performance not available:', error);
  }
}

export { firebasePerformance as performance };

/**
 * 🎛️ Firebase Remote Config
 */
let remoteConfig: RemoteConfig | null = null;

if (typeof window !== 'undefined') {
  try {
    remoteConfig = getRemoteConfig(app);
    
    // إعدادات افتراضية
    remoteConfig.settings.minimumFetchIntervalMillis = 3600000; // ساعة واحدة
    remoteConfig.settings.fetchTimeoutMillis = 60000; // دقيقة واحدة
    
    // القيم الافتراضية
    remoteConfig.defaultConfig = {
      maintenance_mode: false,
      max_upload_size_mb: 10,
      featured_photographers_limit: 6,
      enable_new_features: false,
      api_rate_limit: 100
    };
    
    console.log('🎛️ Firebase Remote Config enabled');
  } catch (error) {
    console.log('🎛️ Firebase Remote Config not available:', error);
  }
}

export { remoteConfig };

/**
 * 🛠️ Emulator Connection (للتطوير المحلي فقط)
 */
if (process.env.NEXT_PUBLIC_USE_EMULATOR === 'true' && typeof window !== 'undefined') {
  try {
    // Firestore Emulator
    connectFirestoreEmulator(db, 'localhost', 8080);
    console.log('🔥 Connected to Firestore Emulator');
    
    // Storage Emulator
    connectStorageEmulator(storage, 'localhost', 9199);
    console.log('📁 Connected to Storage Emulator');
    
    // Functions Emulator
    connectFunctionsEmulator(functions, 'localhost', 5002);
    console.log('⚡ Connected to Functions Emulator');
  } catch (error) {
    console.log('🔧 Emulator connection failed:', error);
  }
}

/**
 * 📋 تصدير كل شيء
 */
export default app;
export {
  app,
  firebaseConfig
};

/**
 * 🔧 Utility Functions
 */
export const isEmulatorMode = () => process.env.NEXT_PUBLIC_USE_EMULATOR === 'true';
export const isDevelopment = () => process.env.NEXT_PUBLIC_APP_ENV === 'development';
export const isProduction = () => process.env.NEXT_PUBLIC_APP_ENV === 'production'; 
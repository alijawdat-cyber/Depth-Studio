/**
 * 🔥 Firebase Client Configuration - Depth Studio
 * ===============================================
 * 
 * 📅 محدث: يونيو 2025
 * 👨‍💻 المطور: علي جودت
 * 🎯 تفعيل Analytics, Performance, Crashlytics, Remote Config
 */

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  Auth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect, 
  getRedirectResult,
  UserCredential,
  connectAuthEmulator
} from 'firebase/auth';
import { getFirestore, Firestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, FirebaseStorage, connectStorageEmulator } from 'firebase/storage';
import { getFunctions, Functions, connectFunctionsEmulator } from 'firebase/functions';

// Analytics والخدمات المتقدمة
import { getAnalytics, Analytics, isSupported as analyticsSupported } from 'firebase/analytics';
import { getPerformance, FirebasePerformance } from 'firebase/performance';
import { getRemoteConfig, RemoteConfig } from 'firebase/remote-config';

/**
 * 🔧 Firebase Configuration مع Fallback Values للـ CI/CD
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "development-api-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "depth-studio.firebaseapp.com",
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "https://depth-studio-default-rtdb.firebaseio.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "depth-studio",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "depth-studio.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "584154257700",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:584154257700:web:development",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-DEVELOPMENT"
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

// ======================================
// 🌐 Google Authentication Provider
// ======================================

/**
 * 🔑 Google Auth Provider مع إعدادات محسنة
 */
export const googleProvider = new GoogleAuthProvider();

// إضافة النطاقات المطلوبة لجلب البيانات الأساسية
googleProvider.addScope('email');
googleProvider.addScope('profile');

// إعدادات إضافية للحصول على أفضل تجربة مستخدم
googleProvider.setCustomParameters({
  prompt: 'select_account', // يتيح للمستخدم اختيار الحساب
});

/**
 * 🔗 تسجيل دخول بجوجل باستخدام Popup
 * مناسب للديسكتوب ومعظم المتصفحات الحديثة
 */
export const signInWithGooglePopup = async (): Promise<UserCredential> => {
  try {
    console.log('🌐 بدء تسجيل الدخول بجوجل (Popup)...');
    const result = await signInWithPopup(auth, googleProvider);
    console.log('✅ تسجيل الدخول بجوجل نجح (Popup)');
    return result;
  } catch (error) {
    console.error('❌ خطأ في تسجيل الدخول بجوجل (Popup):', error);
    throw error;
  }
};

/**
 * 🔄 تسجيل دخول بجوجل باستخدام Redirect
 * مناسب للموبايل والمتصفحات التي لا تدعم Popup
 */
export const signInWithGoogleRedirect = async (): Promise<void> => {
  try {
    console.log('🌐 بدء تسجيل الدخول بجوجل (Redirect)...');
    await signInWithRedirect(auth, googleProvider);
    // ملاحظة: هذه الدالة لا ترجع نتيجة مباشرة
    // يجب استخدام getGoogleRedirectResult() بعد العودة للصفحة
  } catch (error) {
    console.error('❌ خطأ في تسجيل الدخول بجوجل (Redirect):', error);
    throw error;
  }
};

/**
 * 📥 جلب نتيجة تسجيل الدخول بعد Redirect
 * يجب استدعاؤها عند تحميل الصفحة للتحقق من نتيجة Google Auth
 */
export const getGoogleRedirectResult = async (): Promise<UserCredential | null> => {
  try {
    console.log('🔍 فحص نتيجة تسجيل الدخول بجوجل (Redirect)...');
    const result = await getRedirectResult(auth);
    
    if (result) {
      console.log('✅ تم استلام نتيجة تسجيل الدخول بجوجل (Redirect)');
      return result;
    } else {
      console.log('ℹ️ لا توجد نتيجة redirect معلقة');
      return null;
    }
  } catch (error) {
    console.error('❌ خطأ في جلب نتيجة Google Redirect:', error);
    throw error;
  }
};

/**
 * 🔐 دالة تسجيل دخول ذكية تختار الطريقة الأنسب
 * تستخدم Popup للديسكتوب و Redirect للموبايل
 */
export const signInWithGoogleSmart = async (): Promise<UserCredential | null> => {
  // تحديد إذا كان الجهاز موبايل أو localhost (للتطوير)
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
  const isLocalhost = window.location.hostname === 'localhost';
  
  try {
    if (isMobile || isLocalhost) {
      // استخدام Redirect للموبايل والتطوير المحلي
      await signInWithGoogleRedirect();
      return null; // النتيجة ستأتي بعد العودة للصفحة
    } else {
      // استخدام Popup للديسكتوب في الإنتاج
      return await signInWithGooglePopup();
    }
  } catch (error) {
    console.error('❌ خطأ في تسجيل الدخول الذكي بجوجل:', error);
    throw error;
  }
};

/**
 * 🛡️ استخراج token من نتيجة Google Auth
 * يحول UserCredential إلى Google ID Token للإرسال للـ Backend
 */
export const extractGoogleToken = async (userCredential: UserCredential): Promise<string> => {
  try {
    const idToken = await userCredential.user.getIdToken();
    console.log('🔑 تم استخراج Google ID Token بنجاح');
    return idToken;
  } catch (error) {
    console.error('❌ خطأ في استخراج Google Token:', error);
    throw error;
  }
};

/**
 * 👤 استخراج بيانات المستخدم من Google Auth Result
 * يحول UserCredential إلى بيانات منظمة للاستخدام في Frontend
 */
export const extractGoogleUserInfo = (userCredential: UserCredential): GoogleUserInfo => {
  const user = userCredential.user;
  
  return {
    uid: user.uid,
    email: user.email || '',
    displayName: user.displayName || '',
    photoURL: user.photoURL || '',
    emailVerified: user.emailVerified,
    phoneNumber: user.phoneNumber || '',
    isNewUser: user.metadata.creationTime === user.metadata.lastSignInTime,
    providerId: 'google.com',
    creationTime: user.metadata.creationTime,
    lastSignInTime: user.metadata.lastSignInTime,
  };
};

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

// ======================================
// 🔧 Google Auth Helper Types
// ======================================

/** نوع للمعلومات المستخرجة من Google Auth */
export interface GoogleUserInfo {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  emailVerified: boolean;
  phoneNumber: string;
  isNewUser: boolean;
  providerId: string;
  creationTime?: string;
  lastSignInTime?: string;
}

/**
 * 🛠️ Emulator Connection (للتطوير المحلي فقط)
 */
if (process.env.NEXT_PUBLIC_USE_EMULATOR === 'true' && typeof window !== 'undefined') {
  try {
    // Auth Emulator
    connectAuthEmulator(auth, 'http://localhost:9099');
    console.log('🔐 Connected to Auth Emulator');
    
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
/**
 * 🔥 إعداد Firebase Admin SDK - Depth Studio
 * ==========================================
 * 
 * 📅 محدث: ديسمبر 2024
 * 👨‍💻 المطور: علي جودت
 * 🎯 الهدف: إعداد Firebase Admin مع Type Safety كامل
 */

import { initializeApp, getApps, App } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { getAuth, Auth } from "firebase-admin/auth";
import { credential } from "firebase-admin";
import { logger } from "firebase-functions";

/**
 * 🔧 إعداد Firebase Admin App
 */
let app: App;

if (getApps().length === 0) {
  // محاولة استخدام Service Account Key إذا كان متوفر
  let firebaseCredential;
  try {
    firebaseCredential = credential.cert("../types/serviceAccountKey.json");
    logger.info("🔑 استخدام Service Account Key");
  } catch (error) {
    firebaseCredential = credential.applicationDefault();
    logger.info("🔐 استخدام Application Default Credentials");
  }

  app = initializeApp({
    credential: firebaseCredential,
    databaseURL: "https://depth-studio-default-rtdb.firebaseio.com/",
    storageBucket: "depth-studio.firebasestorage.app"
  });
  logger.info("🔥 Firebase Admin initialized successfully");
} else {
  app = getApps()[0] as App;
  logger.info("🔥 Firebase Admin already initialized");
}

/**
 * 🗄️ إعداد Firestore Database
 */
const db: Firestore = getFirestore(app);
db.settings({ 
  databaseId: "depth-production",
  ignoreUndefinedProperties: true 
});

/**
 * 🔐 إعداد Firebase Auth
 */
const auth: Auth = getAuth(app);

/**
 * 📊 إعدادات قاعدة البيانات
 */
export const DATABASE_CONFIG = {
  PRODUCTION_DB: "depth-production",
  COLLECTIONS: {
    USERS: "users",
    USER_PERMISSIONS: "user_permissions", 
    PHOTOGRAPHER_INFO: "photographer_info",
    BRANDS: "brands",
    CAMPAIGNS: "campaigns",
    CONTENT: "content",
    CONTENT_CATEGORIES: "content_categories",
    PAYMENTS: "payments",
    EQUIPMENT: "equipment",
    NOTIFICATIONS: "notifications",
    // 🆕 Multi-Auth System Collections
    PHONE_VERIFICATIONS: "phone_verifications",
    AUTH_METHODS: "auth_methods",
    ROLE_APPLICATIONS: "role_applications",
    OTP_LOGS: "otp_logs",
    AUTH_ACTIVITY_LOGS: "auth_activity_logs"
  } as const
} as const;

/**
 * 🎯 تصدير الكائنات الأساسية
 */
export { app, db, auth };
export default db; 
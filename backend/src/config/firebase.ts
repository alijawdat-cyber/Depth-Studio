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
  app = initializeApp({
    credential: credential.applicationDefault(),
    databaseURL: "https://depth-studio-default-rtdb.firebaseio.com/",
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
    NOTIFICATIONS: "notifications"
  } as const
} as const;

/**
 * 🎯 تصدير الكائنات الأساسية
 */
export { app, db, auth };
export default db; 
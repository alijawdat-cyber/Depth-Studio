/**
 * 🔥 إعداد Firebase Admin SDK - Depth Studio
 * ==========================================
 * 
 * 📅 محدث: ديسمبر 2024
 * 👨‍💻 المطور: علي جودت
 * 🎯 الهدف: إعداد Firebase Admin مع Type Safety كامل + Performance + Messaging + Remote Config
 */

import { initializeApp, getApps, App } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { getAuth, Auth } from "firebase-admin/auth";
import { getStorage } from "firebase-admin/storage";
import { getMessaging, Messaging } from "firebase-admin/messaging";
import { credential } from "firebase-admin";
import { logger } from "firebase-functions";

// ⚡ Performance Monitoring للباك إند
interface PerformanceTrace {
  name: string;
  startTime: number;
  attributes: Record<string, string>;
}

/**
 * 🎛️ Remote Config Interface للباك إند
 */
interface RemoteConfigDefaults {
  max_upload_size_mb: number;
  api_rate_limit: number;
  maintenance_mode: boolean;
  enable_new_features: boolean;
  max_login_attempts: number;
  session_timeout_minutes: number;
}

/**
 * 🔧 إعداد Firebase Admin App
 */
let app: App;

if (getApps().length === 0) {
  // محاولة استخدام Service Account Key إذا كان متوفر
  let firebaseCredential;
  try {
    // البحث عن Service Account في المسارات المحتملة
    const possiblePaths = [
      "./keys/serviceAccountKey.json",
      "../keys/serviceAccountKey.json", 
      "../../backend/keys/serviceAccountKey.json",
      process.env['GOOGLE_APPLICATION_CREDENTIALS']
    ];
    
    const serviceAccountPath = possiblePaths.find(path => {
      try {
        return path && require('fs').existsSync(path);
      } catch {
        return false;
      }
    });

    if (serviceAccountPath) {
      firebaseCredential = credential.cert(serviceAccountPath);
      logger.info("🔑 استخدام Service Account Key من:", serviceAccountPath);
    } else {
      throw new Error("Service Account Key not found");
    }
  } catch (error) {
    firebaseCredential = credential.applicationDefault();
    logger.info("🔐 استخدام Application Default Credentials");
  }

  app = initializeApp({
    credential: firebaseCredential,
    databaseURL: process.env['FIREBASE_DATABASE_URL'] || "https://depth-studio-default-rtdb.firebaseio.com/",
    storageBucket: process.env['FIREBASE_STORAGE_BUCKET'] || "depth-studio.firebasestorage.app",
    projectId: process.env['FIREBASE_PROJECT_ID'] || "depth-studio"
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
  databaseId: process.env['FIRESTORE_DATABASE_ID'] || "depth-production",
  ignoreUndefinedProperties: true 
});

/**
 * 🔐 إعداد Firebase Auth
 */
const auth: Auth = getAuth(app);

/**
 * 📁 إعداد Firebase Storage
 */
const storage = getStorage(app);

/**
 * 📱 إعداد Firebase Messaging (FCM)
 */
let messaging: Messaging | null = null;
try {
  if (process.env['ENABLE_FCM'] === 'true') {
    messaging = getMessaging(app);
    logger.info("📱 Firebase Messaging (FCM) enabled");
  } else {
    logger.info("📱 Firebase Messaging (FCM) disabled via environment variable");
  }
} catch (error) {
  logger.error("❌ Failed to initialize Firebase Messaging:", error);
  messaging = null;
}

/**
 * ⚡ Performance Monitoring Service للباك إند
 */
class BackendPerformanceService {
  private traces: Map<string, PerformanceTrace> = new Map();
  private enabled: boolean;

  constructor() {
    this.enabled = process.env['ENABLE_PERFORMANCE_MONITORING'] === 'true';
    if (this.enabled) {
      logger.info("⚡ Backend Performance Monitoring enabled");
    }
  }

  /**
   * بدء تتبع الأداء
   */
  startTrace(name: string, attributes: Record<string, string> = {}): string {
    if (!this.enabled) return name;

    const traceId = `${name}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.traces.set(traceId, {
      name,
      startTime: Date.now(),
      attributes
    });

    return traceId;
  }

  /**
   * إنهاء تتبع الأداء
   */
  stopTrace(traceId: string, additionalAttributes: Record<string, string> = {}): void {
    if (!this.enabled || !this.traces.has(traceId)) return;

    const trace = this.traces.get(traceId)!;
    const duration = Date.now() - trace.startTime;

    // إرسال البيانات للـ logging
    logger.info("⚡ Performance Trace", {
      trace_name: trace.name,
      duration_ms: duration,
      attributes: { ...trace.attributes, ...additionalAttributes },
      timestamp: new Date().toISOString()
    });

    this.traces.delete(traceId);
  }

  /**
   * قياس دالة معينة
   */
  async measureFunction<T>(
    name: string,
    func: () => Promise<T> | T,
    attributes: Record<string, string> = {}
  ): Promise<T> {
    const traceId = this.startTrace(name, attributes);
    
    try {
      const result = await func();
      this.stopTrace(traceId, { status: 'success' });
      return result;
    } catch (error) {
      this.stopTrace(traceId, { 
        status: 'error', 
        error: error instanceof Error ? error.message : 'unknown'
      });
      throw error;
    }
  }

  /**
   * إحصائيات الأداء
   */
  getStats(): { activeTraces: number; enabled: boolean } {
    return {
      activeTraces: this.traces.size,
      enabled: this.enabled
    };
  }
}

/**
 * 🎛️ Remote Config Service للباك إند
 */
class BackendRemoteConfigService {
  private cache: Map<string, any> = new Map();
  private lastFetch: number = 0;
  private cacheExpiry: number;
  private enabled: boolean;

  private defaults: RemoteConfigDefaults = {
    max_upload_size_mb: 10,
    api_rate_limit: 100,
    maintenance_mode: false,
    enable_new_features: false,
    max_login_attempts: 5,
    session_timeout_minutes: 60
  };

  constructor() {
    this.enabled = process.env['ENABLE_REMOTE_CONFIG'] === 'true';
    this.cacheExpiry = parseInt(process.env['REMOTE_CONFIG_CACHE_EXPIRY'] || '3600') * 1000;
    
    if (this.enabled) {
      logger.info("🎛️ Backend Remote Config enabled");
      this.loadDefaults();
    }
  }

  /**
   * تحميل القيم الافتراضية
   */
  private loadDefaults(): void {
    Object.entries(this.defaults).forEach(([key, value]) => {
      this.cache.set(key, value);
    });
  }

  /**
   * الحصول على قيمة
   */
  getValue<T>(key: keyof RemoteConfigDefaults, defaultValue?: T): T {
    if (!this.enabled) {
      return (this.defaults[key] as unknown as T) || defaultValue as T;
    }

    return this.cache.get(key) as T || (this.defaults[key] as unknown as T) || defaultValue as T;
  }

  /**
   * فحص وضع الصيانة
   */
  isMaintenanceMode(): boolean {
    return this.getValue('maintenance_mode', false);
  }

  /**
   * فحص تفعيل الميزات الجديدة
   */
  areNewFeaturesEnabled(): boolean {
    return this.getValue('enable_new_features', false);
  }
}

/**
 * 📱 Messaging Helper Functions
 */
class MessagingService {
  constructor(private messaging: Messaging | null) {}

  /**
   * إرسال إشعار لمستخدم واحد
   */
  async sendToUser(
    token: string, 
    title: string, 
    body: string, 
    data?: Record<string, string>
  ): Promise<string | null> {
    if (!this.messaging) {
      logger.warn("📱 Messaging not available - skipping notification");
      return null;
    }

    try {
      const message = {
        token,
        notification: { title, body },
        data: data || {},
        android: {
          priority: 'high' as const
        },
        apns: {
          headers: {
            'apns-priority': '10'
          }
        }
      };

      const response = await this.messaging.send(message);
      logger.info("📱 Message sent successfully", { messageId: response });
      return response;
    } catch (error) {
      logger.error("📱 Error sending message:", error);
      return null;
    }
  }

  /**
   * إرسال إشعار لعدة مستخدمين
   */
  async sendToMultiple(
    tokens: string[], 
    title: string, 
    body: string, 
    data?: Record<string, string>
  ): Promise<number> {
    if (!this.messaging || tokens.length === 0) {
      return 0;
    }

    try {
      const message = {
        tokens,
        notification: { title, body },
        data: data || {}
      };

      const response = await this.messaging.sendEachForMulticast(message);
      logger.info("📱 Bulk messages sent", { 
        successCount: response.successCount,
        failureCount: response.failureCount 
      });
      return response.successCount;
    } catch (error) {
      logger.error("📱 Error sending bulk messages:", error);
      return 0;
    }
  }
}

/**
 * 📊 إعدادات قاعدة البيانات
 */
export const DATABASE_CONFIG = {
  PRODUCTION_DB: process.env['FIRESTORE_DATABASE_ID'] || "depth-production",
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
    AUTH_ACTIVITY_LOGS: "auth_activity_logs",
    // 📱 FCM Collections
    FCM_TOKENS: "fcm_tokens"
  } as const
} as const;

/**
 * 🎯 إنشاء instances للخدمات
 */
export const performanceService = new BackendPerformanceService();
export const remoteConfigService = new BackendRemoteConfigService();
export const messagingService = new MessagingService(messaging);

/**
 * 🎯 تصدير الكائنات الأساسية
 */
export { app, db, auth, storage, messaging };
export default db; 
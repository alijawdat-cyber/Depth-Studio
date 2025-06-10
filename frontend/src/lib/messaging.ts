/**
 * 📱 Firebase Cloud Messaging (FCM) Service - Depth Studio
 * ========================================================
 * 
 * 📅 محدث: ديسمبر 2024
 * 👨‍💻 المطور: علي جودت
 * 🎯 الهدف: إدارة الإشعارات والرسائل المباشرة
 * 
 * 🌟 المميزات:
 * - تسجيل Device Tokens
 * - استقبال الإشعارات
 * - إدارة permissions
 * - Foreground/Background notifications
 * - Topic subscriptions
 */

import { getMessaging, getToken, onMessage, MessagePayload, Messaging } from 'firebase/messaging';
import { auth, db } from './firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

// 🔑 VAPID Key للبرواسر (يجب الحصول عليه من Firebase Console)
const VAPID_KEY = process.env.NEXT_PUBLIC_FCM_VAPID_KEY;

/**
 * 📱 إعدادات الإشعارات
 */
interface NotificationConfig {
  enableSound: boolean;
  enableVibration: boolean;
  showBadge: boolean;
  autoClose: number; // seconds, 0 = don't auto close
}

/**
 * 📦 FCM Token Info
 */
interface TokenInfo {
  token: string;
  userId?: string;
  userAgent: string;
  createdAt: Date;
  lastUsed: Date;
}

/**
 * 📱 Depth Studio Messaging Service
 */
class DepthStudioMessagingService {
  private messaging: Messaging | null = null;
  private currentToken: string | null = null;
  private isSupported: boolean = false;
  private config: NotificationConfig;

  constructor() {
    this.config = {
      enableSound: true,
      enableVibration: true,
      showBadge: true,
      autoClose: 5 // 5 seconds
    };

    // فحص دعم البرواسر للإشعارات
    this.checkSupport();
  }

  /**
   * فحص دعم البرواسر للإشعارات
   */
  private checkSupport(): void {
    this.isSupported = 
      typeof window !== 'undefined' &&
      'Notification' in window &&
      'serviceWorker' in navigator &&
      'PushManager' in window;

    if (!this.isSupported) {
      console.warn('📱 FCM not supported in this browser');
      return;
    }

    try {
      this.messaging = getMessaging();
      console.log('📱 FCM initialized successfully');
    } catch (error) {
      console.error('📱 FCM initialization failed:', error);
      this.isSupported = false;
    }
  }

  /**
   * طلب إذن الإشعارات من المستخدم
   */
  async requestPermission(): Promise<boolean> {
    if (!this.isSupported) {
      console.warn('📱 FCM not supported - cannot request permission');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        console.log('✅ Notification permission granted');
        return true;
      } else {
        console.warn('❌ Notification permission denied');
        return false;
      }
    } catch (error) {
      console.error('❌ Error requesting notification permission:', error);
      return false;
    }
  }

  /**
   * الحصول على FCM Token
   */
  async getDeviceToken(): Promise<string | null> {
    if (!this.isSupported || !this.messaging) {
      return null;
    }

    try {
      // التأكد من وجود VAPID Key
      if (!VAPID_KEY) {
        console.error('❌ VAPID Key not found in environment variables');
        return null;
      }

      const token = await getToken(this.messaging, {
        vapidKey: VAPID_KEY
      });

      if (token) {
        this.currentToken = token;
        console.log('📱 FCM Token received:', token.substring(0, 20) + '...');
        
        // حفظ التوكن في قاعدة البيانات
        await this.saveTokenToDatabase(token);
        
        return token;
      } else {
        console.warn('❌ No FCM token available');
        return null;
      }
    } catch (error) {
      console.error('❌ Error getting FCM token:', error);
      return null;
    }
  }

  /**
   * حفظ التوكن في قاعدة البيانات
   */
  private async saveTokenToDatabase(token: string): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.warn('📱 No authenticated user - token not saved');
        return;
      }

      const tokenInfo: TokenInfo = {
        token,
        userId: user.uid,
        userAgent: navigator.userAgent,
        createdAt: new Date(),
        lastUsed: new Date()
      };

      await setDoc(doc(db, 'fcm_tokens', token), {
        ...tokenInfo,
        createdAt: serverTimestamp(),
        lastUsed: serverTimestamp()
      });

      console.log('✅ FCM Token saved to database');
    } catch (error) {
      console.error('❌ Error saving FCM token:', error);
    }
  }

  /**
   * الاستماع للرسائل الواردة (Foreground)
   */
  // eslint-disable-next-line no-unused-vars
  onMessageReceived(callback: (messagePayload: MessagePayload) => void): () => void {
    if (!this.isSupported || !this.messaging) {
      return () => {}; // Empty unsubscribe function
    }

    try {
      const unsubscribe = onMessage(this.messaging, (messagePayload) => {
        console.log('📱 Foreground message received:', messagePayload);
        
        // عرض الإشعار
        this.showNotification(messagePayload);
        
        // استدعاء callback المخصص
        callback(messagePayload);
      });

      console.log('👂 FCM message listener set up');
      return unsubscribe;
    } catch (error) {
      console.error('❌ Error setting up message listener:', error);
      return () => {};
    }
  }

  /**
   * عرض الإشعار في البرواسر
   */
  private showNotification(payload: MessagePayload): void {
    if (!payload.notification) {
      return;
    }

    const { title, body, image } = payload.notification;
    
    if (Notification.permission === 'granted') {
      const notification = new Notification(title || 'إشعار جديد', {
        body: body || '',
        icon: image || '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        tag: payload.data?.tag || 'depth-studio',
        requireInteraction: payload.data?.requireInteraction === 'true',
        silent: !this.config.enableSound,
        data: payload.data
      });

      // إغلاق تلقائي للإشعار
      if (this.config.autoClose > 0) {
        setTimeout(() => {
          notification.close();
        }, this.config.autoClose * 1000);
      }

      // معالجة النقر على الإشعار
      notification.onclick = (event) => {
        event.preventDefault();
        notification.close();
        
        // فتح الرابط إذا كان موجود
        if (payload.data?.url) {
          window.open(payload.data.url, '_blank');
        } else {
          window.focus();
        }
      };
    }
  }

  /**
   * تهيئة الخدمة
   */
  async initialize(): Promise<boolean> {
    if (!this.isSupported) {
      console.warn('📱 FCM not supported - skipping initialization');
      return false;
    }

    try {
      // طلب الإذن
      const permissionGranted = await this.requestPermission();
      if (!permissionGranted) {
        return false;
      }

      // الحصول على التوكن
      const token = await this.getDeviceToken();
      if (!token) {
        return false;
      }

      console.log('✅ FCM Service initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ FCM Service initialization failed:', error);
      return false;
    }
  }

  /**
   * إلغاء تسجيل التوكن
   */
  async unregisterToken(): Promise<void> {
    if (this.currentToken) {
      try {
        // حذف التوكن من قاعدة البيانات
        await setDoc(doc(db, 'fcm_tokens', this.currentToken), {
          isActive: false,
          unregisteredAt: serverTimestamp()
        }, { merge: true });

        console.log('✅ FCM Token unregistered');
        this.currentToken = null;
      } catch (error) {
        console.error('❌ Error unregistering FCM token:', error);
      }
    }
  }

  /**
   * تحديث إعدادات الإشعارات
   */
  updateConfig(newConfig: Partial<NotificationConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('⚙️ FCM config updated:', this.config);
  }

  /**
   * فحص حالة الخدمة
   */
  getStatus(): {
    isSupported: boolean;
    hasPermission: boolean;
    hasToken: boolean;
    config: NotificationConfig;
  } {
    return {
      isSupported: this.isSupported,
      hasPermission: Notification.permission === 'granted',
      hasToken: !!this.currentToken,
      config: this.config
    };
  }
}

/**
 * 🎯 تصدير instance واحد للخدمة
 */
export const messagingService = new DepthStudioMessagingService();

/**
 * 🎯 تصدير الأنواع
 */
export type { NotificationConfig, TokenInfo };

/**
 * 🎯 تصدير الثوابت
 */
export { VAPID_KEY };

export default messagingService; 
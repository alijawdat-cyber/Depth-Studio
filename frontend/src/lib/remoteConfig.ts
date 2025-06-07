/**
 * 🎛️ Firebase Remote Config Service - Depth Studio
 * ================================================
 * 
 * 📅 محدث: يونيو 2025
 * 👨‍💻 المطور: علي جودت
 * 🎯 إدارة إعدادات التطبيق عن بُعد بدون تحديث
 */

import { 
  fetchAndActivate, 
  getBoolean, 
  getNumber, 
  getString, 
  getValue,
  getAll
} from 'firebase/remote-config';
import { remoteConfig } from './firebase';

/**
 * 🎯 أنواع الإعدادات المتاحة
 */
export interface RemoteConfigValues {
  // إعدادات عامة للتطبيق
  maintenance_mode: boolean;
  app_version_required: string;
  force_update: boolean;
  
  // إعدادات الرفع والمحتوى
  max_upload_size_mb: number;
  allowed_file_types: string;
  enable_video_upload: boolean;
  max_video_duration_minutes: number;
  
  // إعدادات UI
  featured_photographers_limit: number;
  campaigns_per_page: number;
  enable_dark_mode: boolean;
  show_beta_features: boolean;
  
  // إعدادات الأداء
  api_rate_limit: number;
  enable_offline_mode: boolean;
  cache_duration_hours: number;
  
  // إعدادات الأمان
  max_login_attempts: number;
  session_timeout_minutes: number;
  require_2fa: boolean;
  
  // إعدادات الإشعارات
  enable_push_notifications: boolean;
  notification_types: string;
  quiet_hours_start: string;
  quiet_hours_end: string;
  
  // إعدادات التجريب
  enable_new_dashboard: boolean;
  enable_ai_suggestions: boolean;
  beta_user_percentage: number;
  
  // إعدادات الدفع
  payment_methods: string;
  minimum_payout_amount: number;
  payment_processing_days: number;
}

/**
 * 🎛️ Remote Config Service Class
 */
class RemoteConfigService {
  private isEnabled: boolean = false;
  private isInitialized: boolean = false;
  private configCache: Partial<RemoteConfigValues> = {};
  private lastFetchTime: number = 0;
  private readonly CACHE_DURATION = 60 * 60 * 1000; // ساعة واحدة

  constructor() {
    if (remoteConfig && typeof window !== 'undefined') {
      this.isEnabled = true;
      console.log('🎛️ Remote Config Service initialized');
      this.initializeConfig();
    } else {
      console.log('🎛️ Remote Config Service disabled (not available)');
    }
  }

  /**
   * 🚀 تهيئة الإعدادات
   */
  private async initializeConfig(): Promise<void> {
    if (!this.isEnabled || !remoteConfig) return;

    try {
      // جلب وتفعيل الإعدادات
      await fetchAndActivate(remoteConfig);
      this.isInitialized = true;
      this.lastFetchTime = Date.now();
      
      // تحديث الكاش
      await this.updateCache();
      
      console.log('🎛️ Remote Config initialized and activated');
    } catch (error) {
      console.error('🎛️ Remote Config initialization failed:', error);
      this.loadDefaultValues();
    }
  }

  /**
   * 📥 تحديث الكاش المحلي
   */
  private async updateCache(): Promise<void> {
    if (!this.isEnabled || !remoteConfig) return;

    try {
      const allValues = getAll(remoteConfig);
      
             Object.entries(allValues).forEach(([key, configValue]) => {
         const value = configValue.asString();
         
         try {
           // محاولة parse كـ JSON أولاً
           this.configCache[key as keyof RemoteConfigValues] = JSON.parse(value);
         } catch {
           // إذا فشل، استخدم القيمة كما هي
           this.configCache[key as keyof RemoteConfigValues] = value as any;
         }
       });
      
      console.log('🎛️ Config cache updated:', Object.keys(this.configCache).length, 'values');
    } catch (error) {
      console.error('🎛️ Cache update failed:', error);
    }
  }

  /**
   * 📋 تحميل القيم الافتراضية
   */
  private loadDefaultValues(): void {
    this.configCache = {
      // إعدادات عامة
      maintenance_mode: false,
      app_version_required: '1.0.0',
      force_update: false,
      
      // إعدادات الرفع
      max_upload_size_mb: 10,
      allowed_file_types: 'jpg,jpeg,png,webp,gif,mp4,mov',
      enable_video_upload: true,
      max_video_duration_minutes: 5,
      
      // إعدادات UI
      featured_photographers_limit: 6,
      campaigns_per_page: 12,
      enable_dark_mode: false,
      show_beta_features: false,
      
      // إعدادات الأداء
      api_rate_limit: 100,
      enable_offline_mode: false,
      cache_duration_hours: 24,
      
      // إعدادات الأمان
      max_login_attempts: 5,
      session_timeout_minutes: 60,
      require_2fa: false,
      
      // إعدادات الإشعارات
      enable_push_notifications: true,
      notification_types: 'campaign,payment,message',
      quiet_hours_start: '22:00',
      quiet_hours_end: '08:00',
      
      // إعدادات التجريب
      enable_new_dashboard: false,
      enable_ai_suggestions: false,
      beta_user_percentage: 10,
      
      // إعدادات الدفع
      payment_methods: 'bank_transfer,wallet',
      minimum_payout_amount: 50,
      payment_processing_days: 7
    };
    
    console.log('🎛️ Default values loaded');
  }

  /**
   * 🔄 إعادة جلب الإعدادات
   */
  async refresh(force: boolean = false): Promise<void> {
    if (!this.isEnabled || !remoteConfig) return;

    const now = Date.now();
    const shouldRefresh = force || (now - this.lastFetchTime) > this.CACHE_DURATION;
    
    if (!shouldRefresh) {
      console.log('🎛️ Config still fresh, skipping refresh');
      return;
    }

    try {
      await fetchAndActivate(remoteConfig);
      await this.updateCache();
      this.lastFetchTime = now;
      
      console.log('🎛️ Config refreshed successfully');
    } catch (error) {
      console.error('🎛️ Config refresh failed:', error);
    }
  }

  /**
   * 📖 الحصول على قيمة نصية
   */
  getString(key: keyof RemoteConfigValues): string {
    // من الكاش أولاً
    if (this.configCache[key] !== undefined) {
      return String(this.configCache[key]);
    }
    
    // من Remote Config
    if (this.isEnabled && remoteConfig) {
      try {
        return getString(remoteConfig, key);
      } catch (error) {
        console.error(`🎛️ Error getting string value for ${key}:`, error);
      }
    }
    
    // القيمة الافتراضية
    return this.getDefaultValue(key, 'string');
  }

  /**
   * 🔢 الحصول على قيمة رقمية
   */
  getNumber(key: keyof RemoteConfigValues): number {
    // من الكاش أولاً
    if (this.configCache[key] !== undefined) {
      return Number(this.configCache[key]);
    }
    
    // من Remote Config
    if (this.isEnabled && remoteConfig) {
      try {
        return getNumber(remoteConfig, key);
      } catch (error) {
        console.error(`🎛️ Error getting number value for ${key}:`, error);
      }
    }
    
    // القيمة الافتراضية
    return this.getDefaultValue(key, 'number');
  }

  /**
   * ✅ الحصول على قيمة منطقية
   */
  getBoolean(key: keyof RemoteConfigValues): boolean {
    // من الكاش أولاً
    if (this.configCache[key] !== undefined) {
      return Boolean(this.configCache[key]);
    }
    
    // من Remote Config
    if (this.isEnabled && remoteConfig) {
      try {
        return getBoolean(remoteConfig, key);
      } catch (error) {
        console.error(`🎛️ Error getting boolean value for ${key}:`, error);
      }
    }
    
    // القيمة الافتراضية
    return this.getDefaultValue(key, 'boolean');
  }

  /**
   * 📦 الحصول على جميع الإعدادات
   */
  getAllConfig(): Partial<RemoteConfigValues> {
    return { ...this.configCache };
  }

  /**
   * 🔍 تحقق من وضع الصيانة
   */
  isMaintenanceMode(): boolean {
    return this.getBoolean('maintenance_mode');
  }

  /**
   * 🎯 تحقق من المميزات التجريبية
   */
  isBetaFeatureEnabled(featureKey: keyof RemoteConfigValues): boolean {
    const betaUserPercentage = this.getNumber('beta_user_percentage');
    const userHash = this.getUserHash();
    const isInBetaGroup = (userHash % 100) < betaUserPercentage;
    
    return isInBetaGroup && this.getBoolean(featureKey);
  }

  /**
   * 🎨 تحقق من وضع التصميم الداكن
   */
  isDarkModeEnabled(): boolean {
    return this.getBoolean('enable_dark_mode');
  }

  /**
   * 💸 الحصول على إعدادات الدفع
   */
  getPaymentConfig() {
    return {
      methods: this.getString('payment_methods').split(','),
      minimumAmount: this.getNumber('minimum_payout_amount'),
      processingDays: this.getNumber('payment_processing_days')
    };
  }

  /**
   * 📱 الحصول على إعدادات الرفع
   */
  getUploadConfig() {
    return {
      maxSizeMB: this.getNumber('max_upload_size_mb'),
      allowedTypes: this.getString('allowed_file_types').split(','),
      videoEnabled: this.getBoolean('enable_video_upload'),
      maxVideoDuration: this.getNumber('max_video_duration_minutes')
    };
  }

  /**
   * 🛠️ Helper methods
   */
  private getDefaultValue(key: keyof RemoteConfigValues, type: 'string' | 'number' | 'boolean'): any {
    const defaults = this.configCache;
    const value = defaults[key];
    
    if (value === undefined) {
      switch (type) {
        case 'string': return '';
        case 'number': return 0;
        case 'boolean': return false;
      }
    }
    
    return value;
  }

  private getUserHash(): number {
    // إنشاء hash بسيط للمستخدم للـ A/B testing
    const userAgent = navigator.userAgent;
    const timestamp = Math.floor(Date.now() / (1000 * 60 * 60 * 24)); // يومي
    const combined = userAgent + timestamp;
    
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash);
  }

  /**
   * 🛠️ تحقق من حالة التفعيل
   */
  isRemoteConfigEnabled(): boolean {
    return this.isEnabled && this.isInitialized;
  }

  /**
   * 📊 الحصول على إحصائيات التكوين
   */
  getConfigStats() {
    return {
      enabled: this.isEnabled,
      initialized: this.isInitialized,
      cached_values: Object.keys(this.configCache).length,
      last_fetch: new Date(this.lastFetchTime).toISOString(),
      cache_age_minutes: Math.floor((Date.now() - this.lastFetchTime) / 60000)
    };
  }
}

/**
 * 🎛️ تصدير instance واحد
 */
export const remoteConfigService = new RemoteConfigService();

/**
 * 🎯 Helper functions للاستخدام السريع
 */
export const getConfigString = (key: keyof RemoteConfigValues) => remoteConfigService.getString(key);
export const getConfigNumber = (key: keyof RemoteConfigValues) => remoteConfigService.getNumber(key);
export const getConfigBoolean = (key: keyof RemoteConfigValues) => remoteConfigService.getBoolean(key);

export const isMaintenanceMode = () => remoteConfigService.isMaintenanceMode();
export const refreshConfig = (force?: boolean) => remoteConfigService.refresh(force);

export default remoteConfigService; 
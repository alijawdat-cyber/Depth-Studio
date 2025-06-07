/**
 * 📊 Firebase Analytics Service - Depth Studio
 * ==========================================
 * 
 * 📅 محدث: يونيو 2025
 * 👨‍💻 المطور: علي جودت
 * 🎯 تتبع شامل لسلوك المستخدمين والأحداث
 */

import { logEvent, setUserId, setUserProperties } from 'firebase/analytics';
import { analytics } from './firebase';

/**
 * 🎯 أنواع الأحداث المخصصة
 */
export interface DepthStudioEvent {
  // User Events
  user_login: {
    method: 'email' | 'phone' | 'google';
    user_id: string;
  };
  user_register: {
    method: 'email' | 'phone' | 'google';
    role: string;
  };
  user_logout: {
    session_duration: number;
  };

  // Campaign Events
  campaign_view: {
    campaign_id: string;
    brand_id: string;
    user_role: string;
  };
  campaign_apply: {
    campaign_id: string;
    photographer_id: string;
  };
  campaign_complete: {
    campaign_id: string;
    photographer_id: string;
    completion_time: number;
  };

  // Content Events
  content_upload: {
    content_type: 'image' | 'video';
    file_size: number;
    campaign_id: string;
  };
  content_approve: {
    content_id: string;
    campaign_id: string;
    reviewer_role: string;
  };
  content_download: {
    content_id: string;
    user_role: string;
  };

  // Search Events
  search_campaigns: {
    query: string;
    filters_used: string[];
    results_count: number;
  };
  search_photographers: {
    query: string;
    location_filter?: string;
    results_count: number;
  };

  // Payment Events
  payment_initiated: {
    amount: number;
    payment_type: string;
    photographer_id: string;
  };
  payment_completed: {
    amount: number;
    payment_method: string;
    photographer_id: string;
  };

  // Performance Events
  page_load_time: {
    page_name: string;
    load_time: number;
  };
  api_response_time: {
    endpoint: string;
    response_time: number;
    status: number;
  };
}

/**
 * 📊 Analytics Service Class
 */
class AnalyticsService {
  private isEnabled: boolean = false;

  constructor() {
    // التحقق من توفر Analytics
    if (analytics && typeof window !== 'undefined') {
      this.isEnabled = true;
      console.log('📊 Analytics Service initialized');
    } else {
      console.log('📊 Analytics Service disabled (not available)');
    }
  }

  /**
   * 🎯 تسجيل حدث مخصص
   */
  trackEvent<T extends keyof DepthStudioEvent>(
    eventName: T,
    parameters: DepthStudioEvent[T]
  ): void {
    if (!this.isEnabled || !analytics) return;

    try {
      logEvent(analytics, eventName, parameters);
      console.log(`📊 Event tracked: ${eventName}`, parameters);
    } catch (error) {
      console.error('📊 Analytics tracking error:', error);
    }
  }

  /**
   * 👤 تعيين معرف المستخدم
   */
  setUser(userId: string, properties?: Record<string, any>): void {
    if (!this.isEnabled || !analytics) return;

    try {
      setUserId(analytics, userId);
      
      if (properties) {
        setUserProperties(analytics, properties);
      }
      
      console.log('👤 User set for analytics:', userId);
    } catch (error) {
      console.error('👤 Analytics user setting error:', error);
    }
  }

  /**
   * 📈 تتبع مشاهدة الصفحة
   */
  trackPageView(pageName: string, pageTitle?: string): void {
    this.trackEvent('page_load_time', {
      page_name: pageName,
      load_time: performance.now()
    });

    // تتبع page_view الافتراضي
    if (!this.isEnabled || !analytics) return;

    try {
      logEvent(analytics, 'page_view', {
        page_title: pageTitle || pageName,
        page_location: window.location.href
      });
    } catch (error) {
      console.error('📈 Page view tracking error:', error);
    }
  }

  /**
   * 🔍 تتبع البحث
   */
  trackSearch(searchTerm: string, category: string, resultsCount: number): void {
    if (category === 'campaigns') {
      this.trackEvent('search_campaigns', {
        query: searchTerm,
        filters_used: [],
        results_count: resultsCount
      });
    } else if (category === 'photographers') {
      this.trackEvent('search_photographers', {
        query: searchTerm,
        results_count: resultsCount
      });
    }
  }

  /**
   * 💰 تتبع الدفعات
   */
  trackPayment(stage: 'initiated' | 'completed', data: any): void {
    if (stage === 'initiated') {
      this.trackEvent('payment_initiated', data);
    } else {
      this.trackEvent('payment_completed', data);
    }
  }

  /**
   * 📱 تتبع أداء API
   */
  trackAPIPerformance(endpoint: string, responseTime: number, status: number): void {
    this.trackEvent('api_response_time', {
      endpoint,
      response_time: responseTime,
      status
    });
  }

  /**
   * 🎨 تتبع المحتوى
   */
  trackContentAction(action: 'upload' | 'approve' | 'download', data: any): void {
    if (action === 'upload') {
      this.trackEvent('content_upload', data);
    } else if (action === 'approve') {
      this.trackEvent('content_approve', data);
    } else if (action === 'download') {
      this.trackEvent('content_download', data);
    }
  }

  /**
   * 🏢 تتبع الحملات
   */
  trackCampaignAction(action: 'view' | 'apply' | 'complete', data: any): void {
    if (action === 'view') {
      this.trackEvent('campaign_view', data);
    } else if (action === 'apply') {
      this.trackEvent('campaign_apply', data);
    } else if (action === 'complete') {
      this.trackEvent('campaign_complete', data);
    }
  }

  /**
   * 🔐 تتبع المصادقة
   */
  trackAuth(action: 'login' | 'register' | 'logout', data: any): void {
    if (action === 'login') {
      this.trackEvent('user_login', data);
    } else if (action === 'register') {
      this.trackEvent('user_register', data);
    } else if (action === 'logout') {
      this.trackEvent('user_logout', data);
    }
  }

  /**
   * 🛠️ تحقق من حالة التفعيل
   */
  isAnalyticsEnabled(): boolean {
    return this.isEnabled;
  }
}

/**
 * 📊 تصدير instance واحد
 */
export const analyticsService = new AnalyticsService();

/**
 * 🎯 Helper functions للاستخدام السريع
 */
export const trackPageView = (pageName: string, pageTitle?: string) => 
  analyticsService.trackPageView(pageName, pageTitle);

export const trackUserAction = (action: string, data: any) => 
  analyticsService.trackEvent(action as any, data);

export const setAnalyticsUser = (userId: string, properties?: Record<string, any>) => 
  analyticsService.setUser(userId, properties);

export default analyticsService; 
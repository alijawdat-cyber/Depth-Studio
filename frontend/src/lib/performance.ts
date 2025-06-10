/**
 * ⚡ Firebase Performance Monitoring Service - Depth Studio
 * ========================================================
 * 
 * 📅 محدث: يونيو 2025
 * 👨‍💻 المطور: علي جودت
 * 🎯 مراقبة شاملة لأداء التطبيق والشبكة
 */

import { trace } from 'firebase/performance';
import { performance as firebasePerformance } from './firebase';
import { analyticsService } from './analytics';

/**
 * 🧠 Memory Performance Interface
 */
interface HeapInfo { 
  usedJSHeapSize: number; 
  totalJSHeapSize: number; 
  jsHeapSizeLimit: number; 
}

/**
 * ⚡ Performance Service Class
 */
class PerformanceService {
  private isEnabled: boolean = false;
  private activeTraces: Map<string, ReturnType<typeof trace>> = new Map();

  constructor() {
    if (firebasePerformance && typeof window !== 'undefined') {
      this.isEnabled = true;
      console.log('⚡ Performance Service initialized');
      this.initializeAutoTracking();
    } else {
      console.log('⚡ Performance Service disabled (not available)');
    }
  }

  /**
   * 🚀 تتبع تلقائي للأداء
   */
  private initializeAutoTracking(): void {
    // تتبع تحميل الصفحة
    this.trackPageLoad();
    
    // تتبع Network requests
    this.trackNetworkRequests();
    
    // تتبع React component rendering
    this.trackComponentPerformance();
  }

  /**
   * 📊 تتبع تحميل الصفحة
   */
  private trackPageLoad(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('load', () => {
      const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigationTiming) {
        const loadTime = navigationTiming.loadEventEnd - navigationTiming.fetchStart;
        const domContentLoaded = navigationTiming.domContentLoadedEventEnd - navigationTiming.fetchStart;
        
        analyticsService.trackEvent('page_load_time', {
          page_name: window.location.pathname,
          load_time: loadTime
        });

        console.log('📊 Page load tracked:', {
          total_time: loadTime,
          dom_content_loaded: domContentLoaded,
          page: window.location.pathname
        });
      }
    });
  }

  /**
   * 🌐 تتبع Network requests
   */
  private trackNetworkRequests(): void {
    if (typeof window === 'undefined') return;

    // تتبع Fetch API
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const url = args[0] as string;
      const startTime = performance.now();
      
      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        // تتبع في Analytics
        analyticsService.trackEvent('api_response_time', {
          endpoint: this.extractEndpoint(url),
          response_time: duration,
          status: response.status
        });
        
        return response;
      } catch (error) {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        analyticsService.trackEvent('api_response_time', {
          endpoint: this.extractEndpoint(url),
          response_time: duration,
          status: 0 // خطأ في الشبكة
        });
        
        throw error;
      }
    };
  }

  /**
   * 🧩 تتبع أداء المكونات
   */
  private trackComponentPerformance(): void {
    // React DevTools integration (إذا كان متوفر)
    if (typeof window !== 'undefined' && (window as unknown as { __REACT_DEVTOOLS_GLOBAL_HOOK__?: unknown }).__REACT_DEVTOOLS_GLOBAL_HOOK__) {
      console.log('🧩 React DevTools detected - Component performance tracking enabled');
    }
  }

  /**
   * 🎯 بدء تتبع مخصص
   */
  startTrace(traceName: string): string {
    if (!this.isEnabled || !firebasePerformance) {
      return traceName;
    }

    try {
      const traceInstance = trace(firebasePerformance, traceName);
      traceInstance.start();
      this.activeTraces.set(traceName, traceInstance);
      
      console.log(`⚡ Started trace: ${traceName}`);
      return traceName;
    } catch (error) {
      console.error('⚡ Error starting trace:', error);
      return traceName;
    }
  }

  /**
   * ⏹️ إنهاء تتبع مخصص
   */
  stopTrace(traceName: string, customAttributes?: Record<string, string>): void {
    if (!this.isEnabled || !this.activeTraces.has(traceName)) {
      return;
    }

    try {
      const traceInstance = this.activeTraces.get(traceName)!;
      
      // إضافة خصائص مخصصة
      if (customAttributes) {
        Object.entries(customAttributes).forEach(([key, value]) => {
          traceInstance.putAttribute(key, value);
        });
      }
      
      traceInstance.stop();
      this.activeTraces.delete(traceName);
      
      console.log(`⚡ Stopped trace: ${traceName}`);
    } catch (error) {
      console.error('⚡ Error stopping trace:', error);
    }
  }

  /**
   * 📏 قياس دالة محددة
   */
  measureFunction<T>(
    funcName: string,
    func: () => T | Promise<T>,
    attributes?: Record<string, string>
  ): T | Promise<T> {
    const traceName = `function_${funcName}`;
    this.startTrace(traceName);
    
    try {
      const result = func();
      
      // إذا كانت Promise
      if (result instanceof Promise) {
        return result.finally(() => {
          this.stopTrace(traceName, attributes);
        });
      }
      
      // إذا كانت نتيجة عادية
      this.stopTrace(traceName, attributes);
      return result;
    } catch (error) {
      this.stopTrace(traceName, {
        ...attributes,
        error: 'true',
        error_message: String(error)
      });
      throw error;
    }
  }

  /**
   * 🔄 تتبع تحميل البيانات
   */
  trackDataLoad(operation: string, startTime?: number): () => void {
    const start = startTime || performance.now();
    const traceName = `data_load_${operation}`;
    
    this.startTrace(traceName);
    
    return () => {
      const duration = performance.now() - start;
      this.stopTrace(traceName, {
        operation,
        duration: duration.toString()
      });
    };
  }

  /**
   * 🏗️ تتبع عمليات UI
   */
  trackUIOperation(operationName: string): {
    start: () => void;
    stop: () => void;
  } {
    const traceName = `ui_${operationName}`;
    
    return {
      start: () => this.startTrace(traceName),
      stop: () => this.stopTrace(traceName, {
        operation_type: 'ui',
        operation_name: operationName
      })
    };
  }

  /**
   * 📱 تتبع أداء الصفحات
   */
  trackPagePerformance(pageName: string): {
    markStart: () => void;
    markEnd: () => void;
  } {
    const traceName = `page_${pageName}`;
    
    return {
      markStart: () => {
        this.startTrace(traceName);
        // إضافة معلومات الصفحة
        if (typeof window !== 'undefined') {
          performance.mark(`${pageName}_start`);
        }
      },
      markEnd: () => {
        if (typeof window !== 'undefined') {
          performance.mark(`${pageName}_end`);
          performance.measure(pageName, `${pageName}_start`, `${pageName}_end`);
        }
        
        this.stopTrace(traceName, {
          page_name: pageName,
          url: window?.location?.href || 'unknown'
        });
      }
    };
  }

  /**
   * 🛠️ Helper methods
   */
  private extractEndpoint(url: string): string {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      
      // تبسيط المسار للتجميع
      return pathname
        .replace(/\/[0-9a-f-]{36}/g, '/:id') // UUID
        .replace(/\/\d+/g, '/:id') // أرقام
        .replace(/\/$/, '') || '/';
    } catch {
      return url;
    }
  }

  /**
   * 📊 الحصول على إحصائيات الأداء
   */
  getPerformanceStats(): Record<string, unknown> {
    if (typeof window === 'undefined') return {};

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    return {
      page_load_time: navigation?.loadEventEnd - navigation?.fetchStart || 0,
      dom_content_loaded: navigation?.domContentLoadedEventEnd - navigation?.fetchStart || 0,
      first_paint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
      first_contentful_paint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
      active_traces: this.activeTraces.size,
      memory_usage: (() => {
        const perfMem = (performance as Performance & { memory?: HeapInfo }).memory;
        return perfMem ? {
          used: perfMem.usedJSHeapSize,
          total: perfMem.totalJSHeapSize,
          limit: perfMem.jsHeapSizeLimit
        } : null;
      })()
    };
  }

  /**
   * 🛠️ تحقق من حالة التفعيل
   */
  isPerformanceEnabled(): boolean {
    return this.isEnabled;
  }
}

/**
 * ⚡ تصدير instance واحد
 */
export const performanceService = new PerformanceService();

/**
 * 🎯 Helper functions للاستخدام السريع
 */
export const startTrace = (traceName: string) => performanceService.startTrace(traceName);
export const stopTrace = (traceName: string, attributes?: Record<string, string>) => 
  performanceService.stopTrace(traceName, attributes);

export const measureFunction = <T>(
  funcName: string, 
  func: () => T | Promise<T>, 
  attributes?: Record<string, string>
) => performanceService.measureFunction(funcName, func, attributes);

export const trackDataLoad = (operation: string) => performanceService.trackDataLoad(operation);
export const trackUIOperation = (operationName: string) => performanceService.trackUIOperation(operationName);

export default performanceService; 
/**
 * 🌐 عميل API موحد - Depth Studio
 * ==================================
 * 
 * المميزات:
 * - إضافة JWT token تلقائياً للـ headers
 * - معالجة الأخطاء برسائل عربية موحدة  
 * - آلية retry للأخطاء الشبكة
 * - Interceptors للطلبات والاستجابات
 */

import axios, { 
  AxiosInstance, 
  AxiosRequestConfig, 
  AxiosResponse, 
  AxiosError 
} from 'axios';

// واجهة استجابة API
interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

// ======================================
// 🔧 إعدادات API
// ======================================

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002/depth-studio/us-central1/api';
const TIMEOUT = 30000; // 30 ثانية
const MAX_RETRIES = 1;

// ======================================
// 🏗️ عميل API الموحد
// ======================================

class ApiClient {
  private client: AxiosInstance;
  private retryCount = 0;

  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      timeout: TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  /**
   * إعداد interceptors للطلبات والاستجابات
   */
  private setupInterceptors(): void {
    // Request interceptor - إضافة JWT token
    this.client.interceptors.request.use(
      (config) => {
        // جلب الـ token من localStorage (سيتم ربطه بـ AuthStore لاحقاً)
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // إضافة request_id للتتبع
        config.headers['X-Request-ID'] = this.generateRequestId();
        
        return config;
      },
      (error) => {
        return Promise.reject(this.handleRequestError(error));
      }
    );

    // Response interceptor - معالجة الاستجابات والأخطاء
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      async (error: AxiosError) => {
        return this.handleResponseError(error);
      }
    );
  }

  /**
   * جلب token المصادقة من localStorage
   */
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  }

  /**
   * توليد معرف فريد للطلب
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * معالجة أخطاء الطلبات
   */
  private handleRequestError(error: unknown): Error {
    console.error('🚨 خطأ في إعداد الطلب:', error);
    return new Error('خطأ في إعداد الطلب');
  }

  /**
   * معالجة أخطاء الاستجابات مع retry
   */
  private async handleResponseError(error: AxiosError): Promise<never> {
    const originalRequest = error.config;

    // Retry للأخطاء 5xx فقط
    if (
      error.response?.status && 
      error.response.status >= 500 && 
      this.retryCount < MAX_RETRIES &&
      originalRequest
    ) {
      this.retryCount++;
      console.warn(`🔄 إعادة محاولة ${this.retryCount}/${MAX_RETRIES} للطلب:`, originalRequest.url);
      
      // انتظار قصير قبل المحاولة
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return this.client.request(originalRequest);
    }

    // إعادة تعيين عداد المحاولات
    this.retryCount = 0;

    // معالجة الأخطاء المختلفة
    const errorMessage = this.getErrorMessage(error);
    throw new Error(errorMessage);
  }

  /**
   * استخراج رسالة خطأ عربية موحدة
   */
  private getErrorMessage(error: AxiosError): string {
    if (!error.response) {
      return 'خطأ في الاتصال بالخادم. تحقق من اتصال الإنترنت.';
    }

    const status = error.response.status;
    const data = error.response.data as ApiResponse<unknown>;

    // استخدام رسالة الخادم إذا كانت متوفرة
    if (data?.message) {
      return data.message;
    }

    // رسائل افتراضية حسب كود الحالة
    switch (status) {
      case 400:
        return 'البيانات المدخلة غير صحيحة';
      case 401:
        return 'جلسة المستخدم منتهية. يرجى تسجيل الدخول مرة أخرى';
      case 403:
        return 'ليس لديك صلاحية للوصول لهذا المورد';
      case 404:
        return 'المورد المطلوب غير موجود';
      case 409:
        return 'تعارض في البيانات. المورد موجود مسبقاً';
      case 422:
        return 'البيانات المدخلة لا تطابق المتطلبات';
      case 429:
        return 'تم تجاوز عدد الطلبات المسموح. حاول مرة أخرى لاحقاً';
      case 500:
        return 'خطأ داخلي في الخادم. حاول مرة أخرى لاحقاً';
      case 502:
      case 503:
      case 504:
        return 'الخادم غير متاح حالياً. حاول مرة أخرى لاحقاً';
      default:
        return `خطأ غير متوقع (${status}). حاول مرة أخرى`;
    }
  }

  // ======================================
  // 🚀 الطرق العامة للـ HTTP
  // ======================================

  /**
   * طلب GET
   */
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.get<ApiResponse<T>>(url, config);
    return response.data;
  }

  /**
   * طلب POST
   */
  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.post<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  /**
   * طلب PUT
   */
  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.put<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  /**
   * طلب PATCH
   */
  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.patch<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  /**
   * طلب DELETE
   */
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.delete<ApiResponse<T>>(url, config);
    return response.data;
  }

  /**
   * تحديث token المصادقة
   */
  setAuthToken(token: string | null): void {
    if (typeof window === 'undefined') return;
    
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  /**
   * مسح token المصادقة
   */
  clearAuthToken(): void {
    this.setAuthToken(null);
  }
}

// ======================================
// 📤 تصدير مثيل وحيد
// ======================================

export const apiClient = new ApiClient();
export default apiClient; 
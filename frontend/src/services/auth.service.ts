/**
 * 🔐 خدمة المصادقة - Depth Studio
 * ===================================
 * 
 * الوظائف الأساسية:
 * - تسجيل دخول بالإيميل/كلمة مرور
 * - تسجيل دخول برقم الهاتف العراقي + OTP
 * - تسجيل دخول بحساب جوجل
 * - تسجيل خروج
 * - التحقق من رمز OTP
 * - جلب المستخدم الحالي
 */

import { apiClient } from './api/api-client';

import { 
  EmailLoginData,
  PhoneLoginData, 
  GoogleLoginData,
  AuthResult,
  OTPSendRequest,
  OTPSendResult,
  OTPVerifyRequest,
  OTPVerifyResult,
  User
} from '@depth-studio/types';

// ======================================
// 🔐 خدمة المصادقة الرئيسية
// ======================================

class AuthService {
  /**
   * 📧 تسجيل دخول بالبريد الإلكتروني وكلمة المرور
   */
  async signInWithEmail(credentials: EmailLoginData): Promise<AuthResult> {
    try {
      const response = await apiClient.post<AuthResult>('/auth/login/email', credentials);
      
      if (response.success && response.data?.token) {
        // حفظ token في ApiClient
        apiClient.setAuthToken(response.data.token);
      }
      
      return response.data!;
    } catch (error) {
      console.error('🚨 خطأ في تسجيل الدخول بالبريد:', error);
      throw error;
    }
  }

  /**
   * 📱 تسجيل دخول برقم الهاتف العراقي + OTP (المرحلة الأولى)
   * يرسل OTP ويعود بمعلومات انتظار التحقق
   */
  async signInWithPhone(phoneData: PhoneLoginData): Promise<OTPSendResult> {
    try {
      const otpRequest: OTPSendRequest = {
        phone: phoneData.phone,
        country_code: phoneData.country_code,
        purpose: 'login'
      };

      const response = await apiClient.post<OTPSendResult>('/auth/otp/send', otpRequest);
      return response.data!;
    } catch (error) {
      console.error('🚨 خطأ في إرسال OTP للهاتف:', error);
      throw error;
    }
  }

  /**
   * 🔑 التحقق من رمز OTP وإكمال تسجيل الدخول
   */
  async verifyOTP(verifyData: OTPVerifyRequest): Promise<OTPVerifyResult> {
    try {
      const response = await apiClient.post<OTPVerifyResult>('/auth/otp/verify', verifyData);
      
      if (response.success && response.data?.user && response.data?.token) {
        // حفظ token في ApiClient عند نجاح التحقق
        apiClient.setAuthToken(response.data.token);
      }
      
      return response.data!;
    } catch (error) {
      console.error('🚨 خطأ في التحقق من OTP:', error);
      throw error;
    }
  }

  /**
   * 📤 إرسال رمز OTP لرقم الهاتف
   * يُستخدم لإرسال OTP للتسجيل الجديد أو إعادة إرسال الرمز
   */
  async sendOTP(otpRequest: OTPSendRequest): Promise<OTPSendResult> {
    try {
      const response = await apiClient.post<OTPSendResult>('/auth/otp/send', otpRequest);
      return response.data!;
    } catch (error) {
      console.error('🚨 خطأ في إرسال OTP:', error);
      throw error;
    }
  }

  /**
   * 🌐 تسجيل دخول بحساب جوجل
   */
  async signInWithGoogle(googleData: GoogleLoginData): Promise<AuthResult> {
    try {
      const response = await apiClient.post<AuthResult>('/auth/login/google', googleData);
      
      if (response.success && response.data?.token) {
        // حفظ token في ApiClient
        apiClient.setAuthToken(response.data.token);
      }
      
      return response.data!;
    } catch (error) {
      console.error('🚨 خطأ في تسجيل الدخول بجوجل:', error);
      throw error;
    }
  }

  /**
   * 🚪 تسجيل خروج من النظام
   */
  async signOut(): Promise<void> {
    try {
      // استدعاء endpoint تسجيل الخروج في الخادم
      await apiClient.post('/auth/logout');
      
      // مسح token من ApiClient
      apiClient.clearAuthToken();
      
      // مسح أي بيانات مخزنة محلياً
      this.clearLocalAuthData();
      
    } catch (error) {
      console.error('🚨 خطأ في تسجيل الخروج:', error);
      
      // حتى لو فشل الطلب للخادم، امسح البيانات المحلية
      apiClient.clearAuthToken();
      this.clearLocalAuthData();
      
      throw error;
    }
  }

  /**
   * 👤 جلب بيانات المستخدم الحالي
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      // تحقق من وجود token أولاً
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      if (!token) {
        return null;
      }

      const response = await apiClient.get<User>('/auth/me');
      
      if (response.success && response.data) {
        return response.data;
      }
      
      return null;
    } catch (error) {
      console.error('🚨 خطأ في جلب بيانات المستخدم:', error);
      
      // إذا كان الـ token منتهي الصلاحية، امسحه
      if (error instanceof Error && error.message.includes('منتهية')) {
        apiClient.clearAuthToken();
        this.clearLocalAuthData();
      }
      
      return null;
    }
  }

  /**
   * 📧 تسجيل مستخدم جديد بالبريد الإلكتروني
   * يُستخدم لإنشاء حساب جديد بالبريد الإلكتروني وكلمة المرور
   */
  async registerWithEmail(registrationData: import('@depth-studio/types').EmailRegistrationData): Promise<AuthResult> {
    try {
      const response = await apiClient.post<AuthResult>('/auth/register/email', registrationData);
      
      if (response.success && response.data?.token) {
        // حفظ token في ApiClient
        apiClient.setAuthToken(response.data.token);
      }
      
      return response.data!;
    } catch (error) {
      console.error('🚨 خطأ في التسجيل بالبريد:', error);
      throw error;
    }
  }

  /**
   * 📱 تسجيل مستخدم جديد برقم الهاتف العراقي
   * يُستخدم لإنشاء حساب جديد بالهاتف بعد التحقق من OTP
   */
  async registerWithPhone(registrationData: import('@depth-studio/types').PhoneRegistrationData): Promise<AuthResult> {
    try {
      const response = await apiClient.post<AuthResult>('/auth/register/phone', registrationData);
      
      if (response.success && response.data?.token) {
        // حفظ token في ApiClient
        apiClient.setAuthToken(response.data.token);
      }
      
      return response.data!;
    } catch (error) {
      console.error('🚨 خطأ في التسجيل بالهاتف:', error);
      throw error;
    }
  }

  /**
   * 🌐 تسجيل مستخدم جديد بحساب جوجل
   * يُستخدم لإنشاء حساب جديد بواسطة مصادقة جوجل
   */
  async registerWithGoogle(registrationData: import('@depth-studio/types').GoogleRegistrationData): Promise<AuthResult> {
    try {
      const response = await apiClient.post<AuthResult>('/auth/register/google', registrationData);
      
      if (response.success && response.data?.token) {
        // حفظ token في ApiClient
        apiClient.setAuthToken(response.data.token);
      }
      
      return response.data!;
    } catch (error) {
      console.error('🚨 خطأ في التسجيل بجوجل:', error);
      throw error;
    }
  }

  // ======================================
  // 🧹 الطرق المساعدة
  // ======================================

  /**
   * مسح جميع البيانات المحلية للمصادقة
   */
  private clearLocalAuthData(): void {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('user_role');
    sessionStorage.removeItem('login_method');
  }

  /**
   * تحقق من حالة المصادقة الحالية
   */
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    
    const token = localStorage.getItem('auth_token');
    return !!token;
  }

  /**
   * جلب token المصادقة المحفوظ
   */
  getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  }
}

// ======================================
// 📤 تصدير مثيل وحيد
// ======================================

export const authService = new AuthService();
export default authService; 
/**
 * 🔐 Frontend Auth Repository - إدارة المصادقة محلياً  
 * ========================================================
 * 
 * Repository Pattern متخصص للمصادقة مع تكامل كامل مع Backend
 * يدعم جميع طرق المصادقة: البريد الإلكتروني، الهاتف العراقي، وجوجل
 * 
 * 📅 تاريخ الإنشاء: يونيو 2025
 * 👨‍💻 المطور: علي جودت  
 * 🎯 الهدف: إدارة شاملة للمصادقة في Frontend
 * 🔗 Backend Reference: AuthService.ts (1,430 سطر)
 * 📋 Types Reference: auth.ts (314 سطر)
 */

import { 
  AuthMethod,                    // 🔐 طرق المصادقة المتاحة للمستخدم
  PhoneVerification,             // 📱 بيانات التحقق من الهاتف العراقي - سيُستخدم في cache OTP
  EmailRegistrationData,         // 📧 بيانات التسجيل بالبريد الإلكتروني
  PhoneRegistrationData,         // 📱 بيانات التسجيل بالهاتف العراقي
  GoogleRegistrationData,        // 🌐 بيانات التسجيل بحساب جوجل
  EmailLoginData,                // 📧 بيانات تسجيل الدخول بالبريد
  PhoneLoginData,                // 📱 بيانات تسجيل الدخول بالهاتف
  GoogleLoginData,               // 🌐 بيانات تسجيل الدخول بجوجل
  AuthResult,                    // 🎯 نتيجة عمليات المصادقة
  OTPSendRequest,                // 📤 طلب إرسال OTP
  OTPSendResult,                 // 📥 نتيجة إرسال OTP
  OTPVerifyRequest,              // 🔍 طلب التحقق من OTP
  OTPVerifyResult,               // ✅ نتيجة التحقق من OTP
  AuthSessionState,              // 📊 حالة جلسة المصادقة
  RegistrationStats,             // 📈 إحصائيات التسجيل
  AuthMethodUsageStats,          // 📊 إحصائيات استخدام طرق المصادقة
  AuthActivityLog,               // 📝 سجل أنشطة المصادقة
  AuthSecuritySettings,          // 🔒 إعدادات الأمان - سيُستخدم في إعدادات الحساب
  ID,                           // 🆔 نوع المعرف الفريد
  User,                         // 👤 نوع المستخدم
  FrontendQueryOptions,         // 🔍 خيارات الاستعلام للفرونت إند
  AuthProvider,                 // 🔗 أنواع مقدمي المصادقة
  FirebaseTimestamp            // 📅 نوع التوقيت في Firebase
} from '@depth-studio/types';
import { FrontendBaseRepository } from './frontend-base-repository';
import { apiClient } from '../services/api/api-client';

// ======================================
// 🎯 شرح استخدام كل Import وفائدته
// ======================================

/**
 * 📋 AuthMethod: طرق المصادقة المتاحة للمستخدم
 * - يحتوي على: type (email/phone/google), verified, created_at, metadata
 * - يُستخدم في: getUserAuthMethods() لجلب طرق المصادقة المتاحة
 * - مصدره: types/src/auth.ts
 * 
 * 📱 PhoneVerification: بيانات التحقق من الهاتف العراقي
 * - يحتوي على: phone, country_code, otp_code, expires_at, attempts
 * - يُستخدم في: دوال OTP للهواتف العراقية
 * - مصدره: types/src/auth.ts
 * 
 * 📧 EmailRegistrationData: بيانات التسجيل بالبريد الإلكتروني
 * - يحتوي على: email, password, confirm_password, full_name, phone?, accept_terms
 * - يُستخدم في: registerWithEmail() للتسجيل الجديد
 * - مصدره: types/src/auth.ts
 * 
 * 📱 PhoneRegistrationData: بيانات التسجيل بالهاتف العراقي
 * - يحتوي على: phone, country_code, full_name, accept_terms
 * - يُستخدم في: registerWithPhone() للتسجيل بالهاتف
 * - مصدره: types/src/auth.ts
 * 
 * 🌐 GoogleRegistrationData: بيانات التسجيل بحساب جوجل
 * - يحتوي على: google_token, full_name, email, profile_picture?, accept_terms
 * - يُستخدم في: registerWithGoogle() للتسجيل بجوجل
 * - مصدره: types/src/auth.ts
 * 
 * 🎯 AuthResult: نتيجة عمليات المصادقة
 * - يحتوي على: success, user?, token?, needs_role_selection, message
 * - يُستخدم في: جميع دوال التسجيل والدخول لإرجاع النتائج
 * - مصدره: types/src/auth.ts
 * 
 * 📤 OTPSendRequest: طلب إرسال OTP
 * - يحتوي على: phone, country_code, user_id?, purpose
 * - يُستخدم في: sendOTP() لإرسال رمز التحقق
 * - مصدره: types/src/auth.ts
 * 
 * 📥 OTPSendResult: نتيجة إرسال OTP
 * - يحتوي على: success, message, expires_at, attempts_remaining
 * - يُستخدم في: sendOTP() لإرجاع نتيجة الإرسال
 * - مصدره: types/src/auth.ts
 * 
 * 📊 AuthSessionState: حالة جلسة المصادقة
 * - يحتوي على: user, isAuthenticated, isLoading, token, error
 * - يُستخدم في: getSessionState() لتتبع حالة الجلسة
 * - مصدره: types/src/auth.ts
 * 
 * 📈 RegistrationStats: إحصائيات التسجيل
 * - يحتوي على: email_registrations, phone_registrations, conversion_rates
 * - يُستخدم في: getRegistrationStats() للإحصائيات والتحليلات
 * - مصدره: types/src/auth.ts
 */

/**
 * واجهة خيارات الاستعلام الخاصة بالمصادقة
 * توسع FrontendQueryOptions بخيارات خاصة بالمصادقة
 */
interface AuthQueryOptions extends FrontendQueryOptions {
  authMethod?: 'email' | 'phone' | 'google';     // فلترة حسب طريقة المصادقة
  verified?: boolean;                              // فلترة حسب التحقق
  dateRange?: {                                   // فلترة حسب نطاق تاريخي
    start: Date;
    end: Date;
  };
  activityType?: string;                          // نوع النشاط المطلوب
}

/**
 * واجهة إحصائيات الأمان الشاملة
 * تحتوي على إحصائيات شاملة عن أمان النظام
 */
interface SecurityAnalytics {
  totalLoginAttempts: number;                     // إجمالي محاولات الدخول
  successfulLogins: number;                       // الدخولات الناجحة
  failedLogins: number;                           // الدخولات الفاشلة
  blockedIPs: number;                             // عناوين IP المحجوبة
  otpSuccessRate: number;                         // معدل نجاح OTP
  securityIncidents: number;                      // الحوادث الأمنية
  recentSuspiciousActivity: AuthActivityLog[];    // النشاط المشبوه الأخير
}

/**
 * 🔐 Frontend Auth Repository
 * Repository متخصص لإدارة المصادقة مع جميع العمليات المطلوبة
 * يوفر تكاملاً كاملاً مع Backend AuthService مع إضافات Frontend
 */
export class FrontendAuthRepository extends FrontendBaseRepository<User> {
  
  constructor() {
    super('auth', '/api/auth');
  }

  // ======================================
  // العمليات الأساسية للتسجيل
  // ======================================

  /**
   * 📧 التسجيل بالبريد الإلكتروني
   * متوافق مع: AuthService.registerWithEmail()
   * 
   * @param data بيانات التسجيل بالبريد الإلكتروني
   * @returns نتيجة التسجيل مع المستخدم والتوكن
   */
  async registerWithEmail(data: EmailRegistrationData): Promise<AuthResult> {
    try {
      this.setLoading(true);
      
      // لا نحتاج cache للتسجيل - عملية مباشرة دائماً
      const response = await apiClient.post<{ data: AuthResult }>(`${this.apiEndpoint}/register/email`, data);
      
      if (!response.data?.data) {
        throw new Error('لم يتم الحصول على نتيجة التسجيل من الخادم');
      }

      // حفظ المستخدم في cache إذا نجح التسجيل
      if (response.data.data.success && response.data.data.user) {
        this.cacheItem(response.data.data.user);
      }

      // تسجيل النشاط محلياً
      await this.logLocalAuthActivity({
        activity_type: response.data.data.success ? 'registration_success' : 'registration_attempt',
        auth_method: 'email',
        success: response.data.data.success
      });
      
      this.setSuccess(true);
      return response.data.data;
      
    } catch (error) {
      this.setError(`فشل في التسجيل بالبريد الإلكتروني: ${error}`);
      
      // تسجيل المحاولة الفاشلة
      await this.logLocalAuthActivity({
        activity_type: 'registration_attempt',
        auth_method: 'email',
        success: false,
        failure_reason: String(error)
      });
      
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * 📱 التسجيل بالهاتف العراقي
   * متوافق مع: AuthService.registerWithPhone()
   */
  async registerWithPhone(data: PhoneRegistrationData): Promise<AuthResult> {
    try {
      this.setLoading(true);
      
      const response = await apiClient.post<{ data: AuthResult }>(`${this.apiEndpoint}/register/phone`, data);
      
      if (!response.data?.data) {
        throw new Error('لم يتم الحصول على نتيجة التسجيل من الخادم');
      }

      // حفظ المستخدم في cache إذا نجح التسجيل
      if (response.data.data.success && response.data.data.user) {
        this.cacheItem(response.data.data.user);
      }

      // تسجيل النشاط محلياً
      await this.logLocalAuthActivity({
        activity_type: response.data.data.success ? 'registration_success' : 'registration_attempt',
        auth_method: 'phone',
        success: response.data.data.success
      });
      
      this.setSuccess(true);
      return response.data.data;
      
    } catch (error) {
      this.setError(`فشل في التسجيل بالهاتف: ${error}`);
      
      await this.logLocalAuthActivity({
        activity_type: 'registration_attempt',
        auth_method: 'phone',
        success: false,
        failure_reason: String(error)
      });
      
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * 🌐 التسجيل بحساب جوجل
   * متوافق مع: AuthService.registerWithGoogle()
   */
  async registerWithGoogle(data: GoogleRegistrationData): Promise<AuthResult> {
    try {
      this.setLoading(true);
      
      const response = await apiClient.post<{ data: AuthResult }>(`${this.apiEndpoint}/register/google`, data);
      
      if (!response.data?.data) {
        throw new Error('لم يتم الحصول على نتيجة التسجيل من الخادم');
      }

      // حفظ المستخدم في cache إذا نجح التسجيل
      if (response.data.data.success && response.data.data.user) {
        this.cacheItem(response.data.data.user);
      }

      // تسجيل النشاط محلياً
      await this.logLocalAuthActivity({
        activity_type: response.data.data.success ? 'registration_success' : 'registration_attempt',
        auth_method: 'google',
        success: response.data.data.success
      });
      
      this.setSuccess(true);
      return response.data.data;
      
    } catch (error) {
      this.setError(`فشل في التسجيل بحساب جوجل: ${error}`);
      
      await this.logLocalAuthActivity({
        activity_type: 'registration_attempt',
        auth_method: 'google',
        success: false,
        failure_reason: String(error)
      });
      
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  // ======================================
  // العمليات الأساسية لتسجيل الدخول
  // ======================================

  /**
   * 📧 تسجيل الدخول بالبريد الإلكتروني
   * متوافق مع: AuthService.loginWithEmail()
   */
  async loginWithEmail(data: EmailLoginData): Promise<AuthResult> {
    try {
      this.setLoading(true);
      
      const response = await apiClient.post<{ data: AuthResult }>(`${this.apiEndpoint}/login/email`, data);
      
      if (!response.data?.data) {
        throw new Error('لم يتم الحصول على نتيجة تسجيل الدخول من الخادم');
      }

      // حفظ المستخدم في cache إذا نجح الدخول
      if (response.data.data.success && response.data.data.user) {
        this.cacheItem(response.data.data.user);
        
        // تحديث آخر استخدام لطريقة المصادقة
        await this.updateAuthMethodLastUsed(response.data.data.user.id, 'email');
      }

      // تسجيل النشاط محلياً
      await this.logLocalAuthActivity({
        user_id: response.data.data.user?.id,
        activity_type: response.data.data.success ? 'login_success' : 'login_failed',
        auth_method: 'email',
        success: response.data.data.success
      });
      
      this.setSuccess(true);
      return response.data.data;
      
    } catch (error) {
      this.setError(`فشل في تسجيل الدخول بالبريد الإلكتروني: ${error}`);
      
      await this.logLocalAuthActivity({
        activity_type: 'login_attempt',
        auth_method: 'email',
        success: false,
        failure_reason: String(error)
      });
      
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * 📱 تسجيل الدخول بالهاتف العراقي
   * متوافق مع: AuthService.loginWithPhone()
   */
  async loginWithPhone(data: PhoneLoginData): Promise<AuthResult> {
    try {
      this.setLoading(true);
      
      const response = await apiClient.post<{ data: AuthResult }>(`${this.apiEndpoint}/login/phone`, data);
      
      if (!response.data?.data) {
        throw new Error('لم يتم الحصول على نتيجة تسجيل الدخول من الخادم');
      }

      // حفظ المستخدم في cache إذا نجح الدخول
      if (response.data.data.success && response.data.data.user) {
        this.cacheItem(response.data.data.user);
        
        // تحديث آخر استخدام لطريقة المصادقة
        await this.updateAuthMethodLastUsed(response.data.data.user.id, 'phone');
      }

      // تسجيل النشاط محلياً
      await this.logLocalAuthActivity({
        user_id: response.data.data.user?.id,
        activity_type: response.data.data.success ? 'login_success' : 'login_failed',
        auth_method: 'phone',
        success: response.data.data.success
      });
      
      this.setSuccess(true);
      return response.data.data;
      
    } catch (error) {
      this.setError(`فشل في تسجيل الدخول بالهاتف: ${error}`);
      
      await this.logLocalAuthActivity({
        activity_type: 'login_attempt',
        auth_method: 'phone',
        success: false,
        failure_reason: String(error)
      });
      
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * 🌐 تسجيل الدخول بحساب جوجل
   * متوافق مع: AuthService.loginWithGoogle()
   */
  async loginWithGoogle(data: GoogleLoginData): Promise<AuthResult> {
    try {
      this.setLoading(true);
      
      const response = await apiClient.post<{ data: AuthResult }>(`${this.apiEndpoint}/login/google`, data);
      
      if (!response.data?.data) {
        throw new Error('لم يتم الحصول على نتيجة تسجيل الدخول من الخادم');
      }

      // حفظ المستخدم في cache إذا نجح الدخول
      if (response.data.data.success && response.data.data.user) {
        this.cacheItem(response.data.data.user);
        
        // تحديث آخر استخدام لطريقة المصادقة
        await this.updateAuthMethodLastUsed(response.data.data.user.id, 'google');
      }

      // تسجيل النشاط محلياً
      await this.logLocalAuthActivity({
        user_id: response.data.data.user?.id,
        activity_type: response.data.data.success ? 'login_success' : 'login_failed',
        auth_method: 'google',
        success: response.data.data.success
      });
      
      this.setSuccess(true);
      return response.data.data;
      
    } catch (error) {
      this.setError(`فشل في تسجيل الدخول بحساب جوجل: ${error}`);
      
      await this.logLocalAuthActivity({
        activity_type: 'login_attempt',
        auth_method: 'google',
        success: false,
        failure_reason: String(error)
      });
      
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  // ======================================
  // العمليات المتخصصة لـ OTP والهاتف العراقي
  // ======================================

  /**
   * 📤 إرسال رمز OTP للهاتف العراقي
   * متوافق مع: AuthService.sendOTP()
   * 
   * فائدة OTPSendRequest:
   * - يحتوي على: phone, country_code (+964), user_id?, purpose
   * - يُستخدم لإرسال رمز التحقق للأرقام العراقية
   * - يدعم جميع الأغراض: registration, login, phone_verification, password_reset
   */
  async sendOTP(request: OTPSendRequest): Promise<OTPSendResult> {
    try {
      this.setLoading(true);
      
      // التحقق من كون الرقم عراقي
      if (request.country_code !== '+964') {
        throw new Error('يدعم النظام الأرقام العراقية فقط (+964)');
      }

      const response = await apiClient.post<{ data: OTPSendResult }>(`${this.apiEndpoint}/send-otp`, request);
      
      if (!response.data?.data) {
        throw new Error('لم يتم الحصول على نتيجة إرسال OTP من الخادم');
      }

      // حفظ معلومات OTP في cache محلياً لمتابعة الحالة
      const otpCacheKey = `otp_${request.phone}_${request.purpose}`;
      this.cache.set(otpCacheKey, {
        data: [response.data.data as unknown as User],
        timestamp: new Date(),
        expiry: 300, // 5 دقائق
        key: otpCacheKey
      });

      // تسجيل النشاط محلياً
      await this.logLocalAuthActivity({
        user_id: request.user_id,
        activity_type: 'otp_sent',
        auth_method: 'phone',
        success: response.data.data.success,
        additional_data: {
          purpose: request.purpose,
          phone: request.phone
        }
      });
      
      this.setSuccess(true);
      return response.data.data;
      
    } catch (error) {
      this.setError(`فشل في إرسال رمز التحقق: ${error}`);
      
      await this.logLocalAuthActivity({
        user_id: request.user_id,
        activity_type: 'otp_sent',
        auth_method: 'phone',
        success: false,
        failure_reason: String(error)
      });
      
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * 🔍 التحقق من رمز OTP
   * متوافق مع: AuthService.verifyOTP()
   * 
   * فائدة OTPVerifyResult:
   * - يحتوي على: success, message, user?, token?, needs_role_selection
   * - يُستخدم للتحقق من رمز OTP وإكمال عملية المصادقة
   * - يمكن أن يرجع المستخدم والتوكن إذا نجح التحقق
   */
  async verifyOTP(request: OTPVerifyRequest): Promise<OTPVerifyResult> {
    try {
      this.setLoading(true);
      
      const response = await apiClient.post<{ data: OTPVerifyResult }>(`${this.apiEndpoint}/verify-otp`, request);
      
      if (!response.data?.data) {
        throw new Error('لم يتم الحصول على نتيجة التحقق من الخادم');
      }

      // حفظ المستخدم في cache إذا نجح التحقق
      if (response.data.data.success && response.data.data.user) {
        this.cacheItem(response.data.data.user);
      }

      // حذف cache OTP بعد النجاح أو الفشل النهائي
      const otpCacheKey = `otp_${request.phone}`;
      Array.from(this.cache.keys()).forEach(key => {
        if (key.startsWith(otpCacheKey)) {
          this.cache.delete(key);
        }
      });

      // تسجيل النشاط محلياً
      await this.logLocalAuthActivity({
        user_id: request.user_id,
        activity_type: response.data.data.success ? 'otp_verified' : 'otp_failed',
        auth_method: 'phone',
        success: response.data.data.success,
        additional_data: {
          phone: request.phone
        }
      });
      
      this.setSuccess(true);
      return response.data.data;
      
    } catch (error) {
      this.setError(`فشل في التحقق من رمز OTP: ${error}`);
      
      await this.logLocalAuthActivity({
        user_id: request.user_id,
        activity_type: 'otp_failed',
        auth_method: 'phone',
        success: false,
        failure_reason: String(error)
      });
      
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * 🔄 إعادة إرسال رمز OTP
   * متوافق مع: AuthService.resendOTP()
   */
  async resendOTP(request: OTPSendRequest): Promise<OTPSendResult> {
    try {
      this.setLoading(true);
      
      const response = await apiClient.post<{ data: OTPSendResult }>(`${this.apiEndpoint}/resend-otp`, request);
      
      if (!response.data?.data) {
        throw new Error('لم يتم الحصول على نتيجة إعادة الإرسال من الخادم');
      }

      // تحديث cache OTP
      const otpCacheKey = `otp_${request.phone}_${request.purpose}`;
      this.cache.set(otpCacheKey, {
        data: [response.data.data as unknown as User],
        timestamp: new Date(),
        expiry: 300, // 5 دقائق
        key: otpCacheKey
      });

      // تسجيل النشاط محلياً
      await this.logLocalAuthActivity({
        user_id: request.user_id,
        activity_type: 'otp_sent',
        auth_method: 'phone',
        success: response.data.data.success,
        additional_data: {
          purpose: request.purpose,
          phone: request.phone,
          is_resend: true
        }
      });
      
      this.setSuccess(true);
      return response.data.data;
      
    } catch (error) {
      this.setError(`فشل في إعادة إرسال رمز التحقق: ${error}`);
      
      await this.logLocalAuthActivity({
        user_id: request.user_id,
        activity_type: 'otp_sent',
        auth_method: 'phone',
        success: false,
        failure_reason: String(error),
        additional_data: { is_resend: true }
      });
      
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  // ======================================
  // العمليات المتقدمة والإدارية
  // ======================================

  /**
   * 🔐 الحصول على طرق المصادقة للمستخدم
   * متوافق مع: AuthService.getUserAuthMethods()
   * 
   * فائدة AuthMethod[]:
   * - يحتوي على قائمة بجميع طرق المصادقة المتاحة للمستخدم
   * - كل AuthMethod يحتوي على: type, verified, created_at, metadata
   * - يُستخدم لعرض إعدادات الأمان وإدارة طرق المصادقة
   */
  async getUserAuthMethods(userId: ID): Promise<AuthMethod[]> {
    try {
      this.setLoading(true);
      
      // فحص cache طرق المصادقة
      const authMethodsCache = this.cache.get(`auth_methods_${userId}`);
      if (authMethodsCache && !this.isCacheExpired(authMethodsCache)) {
        this.setSuccess(true);
        return authMethodsCache.data as unknown as AuthMethod[];
      }

      const response = await apiClient.get<{ data: AuthMethod[] }>(`${this.apiEndpoint}/methods/${userId}`);
      
      if (!response.data?.data) {
        return [];
      }

      // حفظ طرق المصادقة في cache منفصل
      this.cache.set(`auth_methods_${userId}`, {
        data: response.data.data as unknown as User[],
        timestamp: new Date(),
        expiry: 300, // 5 دقائق
        key: `auth_methods_${userId}`
      });
      
      this.setSuccess(true);
      return response.data.data;
      
    } catch (error) {
      this.setError(`فشل في الحصول على طرق المصادقة: ${error}`);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * ✅ التحقق من صحة رقم الهاتف العراقي
   * متوافق مع: AuthService.validateIraqiPhone()
   */
  async validateIraqiPhone(phone: string, countryCode: string = '+964'): Promise<{ isValid: boolean; message: string }> {
    try {
      this.setLoading(true);
      
      const response = await apiClient.post<{ data: { isValid: boolean; message: string } }>(`${this.apiEndpoint}/validate-phone`, {
        phone,
        country_code: countryCode
      });
      
      if (!response.data?.data) {
        throw new Error('لم يتم الحصول على نتيجة التحقق من الخادم');
      }

      this.setSuccess(true);
      return response.data.data;
      
    } catch (error) {
      this.setError(`فشل في التحقق من رقم الهاتف: ${error}`);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * 📊 تسجيل الخروج
   * متوافق مع: AuthService.logout()
   */
  async logout(userId?: ID): Promise<{ success: boolean; message: string }> {
    try {
      this.setLoading(true);
      
      const response = await apiClient.post<{ data: { success: boolean; message: string } }>(`${this.apiEndpoint}/logout`, {
        user_id: userId
      });
      
      if (!response.data?.data) {
        throw new Error('لم يتم الحصول على نتيجة تسجيل الخروج من الخادم');
      }

      // مسح cache المحلي عند الخروج
      if (userId) {
        this.removeCachedItem(userId);
        this.cache.delete(`auth_methods_${userId}`);
      }
      
      // مسح جميع cache المرتبط بالمصادقة
      await this.clearAuthCache();

      // تسجيل النشاط محلياً
      await this.logLocalAuthActivity({
        user_id: userId,
        activity_type: 'logout',
        auth_method: 'email', // استخدام نوع صحيح من AuthProvider
        success: response.data.data.success
      });
      
      this.setSuccess(true);
      return response.data.data;
      
    } catch (error) {
      this.setError(`فشل في تسجيل الخروج: ${error}`);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  // ======================================
  // العمليات الإحصائية والتحليلية
  // ======================================

  /**
   * 📈 الحصول على إحصائيات التسجيل
   * متوافق مع: AuthService.getRegistrationStats()
   * 
   * فائدة RegistrationStats:
   * - يحتوي على: email_registrations, phone_registrations, conversion_rates
   * - يُستخدم في لوحة تحكم الأدمن لمتابعة نمو المستخدمين
   * - يقدم insights عن فعالية طرق التسجيل المختلفة
   */
  async getRegistrationStats(): Promise<RegistrationStats> {
    try {
      this.setLoading(true);
      
      // فحص cache الإحصائيات
      const statsCache = this.cache.get('registration_stats');
      if (statsCache && !this.isCacheExpired(statsCache)) {
        this.setSuccess(true);
        return statsCache.data as unknown as RegistrationStats;
      }

      const response = await apiClient.get<{ data: RegistrationStats }>(`${this.apiEndpoint}/stats/registration`);
      
      if (!response.data?.data) {
        throw new Error('لم يتم الحصول على الإحصائيات من الخادم');
      }

      // حفظ الإحصائيات في cache (مدة أطول)
      this.cache.set('registration_stats', {
        data: response.data.data as unknown as User[],
        timestamp: new Date(),
        expiry: 1800, // 30 دقيقة
        key: 'registration_stats'
      });
      
      this.setSuccess(true);
      return response.data.data;
      
    } catch (error) {
      this.setError(`فشل في الحصول على إحصائيات التسجيل: ${error}`);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * 📊 الحصول على إحصائيات استخدام طرق المصادقة
   * متوافق مع: AuthService.getAuthMethodUsageStats()
   */
  async getAuthMethodUsageStats(): Promise<AuthMethodUsageStats> {
    try {
      this.setLoading(true);
      
      // فحص cache الإحصائيات
      const statsCache = this.cache.get('auth_method_stats');
      if (statsCache && !this.isCacheExpired(statsCache)) {
        this.setSuccess(true);
        return statsCache.data as unknown as AuthMethodUsageStats;
      }

      const response = await apiClient.get<{ data: AuthMethodUsageStats }>(`${this.apiEndpoint}/stats/methods`);
      
      if (!response.data?.data) {
        throw new Error('لم يتم الحصول على الإحصائيات من الخادم');
      }

      // حفظ الإحصائيات في cache
      this.cache.set('auth_method_stats', {
        data: response.data.data as unknown as User[],
        timestamp: new Date(),
        expiry: 1800, // 30 دقيقة
        key: 'auth_method_stats'
      });
      
      this.setSuccess(true);
      return response.data.data;
      
    } catch (error) {
      this.setError(`فشل في الحصول على إحصائيات طرق المصادقة: ${error}`);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * 📝 الحصول على سجل أنشطة المصادقة
   * متوافق مع: AuthService auth activity logs
   */
  async getAuthActivityLog(userId?: ID, options: AuthQueryOptions = {}): Promise<AuthActivityLog[]> {
    try {
      this.setLoading(true);
      
      const cacheKey = this.generateCacheKey('authActivityLog', { userId, ...options });
      
      // فحص cache السجل
      if (options.useCache !== false) {
        const logCache = this.cache.get(cacheKey);
        if (logCache && !this.isCacheExpired(logCache)) {
          this.setSuccess(true);
          return logCache.data as unknown as AuthActivityLog[];
        }
      }

      const queryParams = new URLSearchParams();
      if (userId) queryParams.append('user_id', userId);
      if (options.authMethod) queryParams.append('auth_method', options.authMethod);
      if (options.activityType) queryParams.append('activity_type', options.activityType);

      const response = await apiClient.get<{ data: AuthActivityLog[] }>(`${this.apiEndpoint}/activity-log?${queryParams}`);
      
      if (!response.data?.data) {
        return [];
      }

      // حفظ السجل في cache (مدة قصيرة للبيانات الحية)
      this.cache.set(cacheKey, {
        data: response.data.data as unknown as User[],
        timestamp: new Date(),
        expiry: 180, // 3 دقائق
        key: cacheKey
      });
      
      this.setSuccess(true);
      return response.data.data;
      
    } catch (error) {
      this.setError(`فشل في الحصول على سجل الأنشطة: ${error}`);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * 🔒 الحصول على تحليلات الأمان
   */
  async getSecurityAnalytics(): Promise<SecurityAnalytics> {
    try {
      this.setLoading(true);
      
      const response = await apiClient.get<{ data: SecurityAnalytics }>(`${this.apiEndpoint}/security/analytics`);
      
      if (!response.data?.data) {
        throw new Error('لم يتم الحصول على تحليلات الأمان من الخادم');
      }

      this.setSuccess(true);
      return response.data.data;
      
    } catch (error) {
      this.setError(`فشل في الحصول على تحليلات الأمان: ${error}`);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  // ======================================
  // العمليات المتخصصة لإعدادات الأمان
  // ======================================

  /**
   * 🔒 الحصول على إعدادات الأمان الحالية
   * يستخدم AuthSecuritySettings لإدارة إعدادات الأمان في التطبيق
   */
  async getSecuritySettings(): Promise<AuthSecuritySettings> {
    try {
      this.setLoading(true);
      
      const response = await apiClient.get<{ data: AuthSecuritySettings }>(`${this.apiEndpoint}/security/settings`);
      
      if (!response.data?.data) {
        throw new Error('لم يتم الحصول على إعدادات الأمان من الخادم');
      }

      this.setSuccess(true);
      return response.data.data;
      
    } catch (error) {
      this.setError(`فشل في الحصول على إعدادات الأمان: ${error}`);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * 📱 تتبع حالة التحقق من الهاتف
   * يستخدم PhoneVerification لإدارة عملية OTP بالتفصيل
   */
  async getPhoneVerificationStatus(phone: string): Promise<PhoneVerification | null> {
    try {
      this.setLoading(true);
      
      const response = await apiClient.get<{ data: PhoneVerification }>(`${this.apiEndpoint}/phone-verification/${phone}`);
      
      if (!response.data?.data) {
        return null;
      }

      this.setSuccess(true);
      return response.data.data;
      
    } catch (error) {
      this.setError(`فشل في الحصول على حالة التحقق من الهاتف: ${error}`);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * 🔍 تحديد نوع مقدم المصادقة المستخدم
   * يستخدم AuthProvider للفلترة والإحصائيات
   */
  getAuthProviderFromMethod(authMethod: AuthMethod): AuthProvider {
    return authMethod.type as AuthProvider;
  }

  // ======================================
  // الأدوات المساعدة الخاصة بالمصادقة
  // ======================================

  /**
   * تحديث آخر استخدام لطريقة المصادقة
   */
  private async updateAuthMethodLastUsed(userId: ID, authType: 'email' | 'phone' | 'google'): Promise<void> {
    try {
      await apiClient.patch(`${this.apiEndpoint}/methods/${userId}/last-used`, {
        auth_type: authType
      });
      
      // إلغاء cache طرق المصادقة لإعادة تحميلها
      this.cache.delete(`auth_methods_${userId}`);
      
    } catch (error) {
      // خطأ غير حرج - لا نرمي exception
      console.warn('فشل في تحديث آخر استخدام لطريقة المصادقة:', error);
    }
  }

  /**
   * تسجيل نشاط المصادقة محلياً
   */
  private async logLocalAuthActivity(activity: Partial<AuthActivityLog>): Promise<void> {
    try {
      // حفظ النشاط في localStorage مؤقتاً
      const localActivities = localStorage.getItem('auth_activities');
      const activities: Partial<AuthActivityLog>[] = localActivities ? JSON.parse(localActivities) : [];
      
      activities.push({
        ...activity,
        id: Date.now().toString(), // ID مؤقت
        created_at: new Date() as unknown as FirebaseTimestamp,
        ip_address: 'unknown', // سيتم تحديثه من الخادم
        user_agent: navigator.userAgent
      });
      
      // حفظ آخر 100 نشاط فقط
      if (activities.length > 100) {
        activities.splice(0, activities.length - 100);
      }
      
      localStorage.setItem('auth_activities', JSON.stringify(activities));
      
    } catch (error) {
      // خطأ غير حرج - لا نرمي exception
      console.warn('فشل في تسجيل النشاط محلياً:', error);
    }
  }

  /**
   * إلغاء cache خاص بالمصادقة
   */
  async clearAuthCache(): Promise<void> {
    // إلغاء cache الأساسي
    await this.clearCache();
    
    // إلغاء cache المتخصص بالمصادقة
    Array.from(this.cache.keys()).forEach(key => {
      if (key.includes('auth_methods_') || 
          key.includes('otp_') || 
          key.includes('registration_stats') ||
          key.includes('auth_method_stats') ||
          key.includes('authActivityLog')) {
        this.cache.delete(key);
      }
    });
    
    // مسح localStorage المؤقت
    localStorage.removeItem('auth_activities');
  }

  /**
   * تحديث cache المصادقة
   */
  async refreshAuthCache(): Promise<void> {
    await this.clearAuthCache();
    await this.refreshCache();
  }

  /**
   * الحصول على حالة جلسة المصادقة المحلية
   */
  getLocalSessionState(): Partial<AuthSessionState> {
    const token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('auth_user');
    const user = userStr ? JSON.parse(userStr) : null;
    const operationState = this.getOperationState();
    
    return {
      user,
      isAuthenticated: !!token && !!user,
      isLoading: operationState.loading,
      token,
      error: operationState.error,
      needs_role_selection: user?.role === 'new_user' || user?.role_selected === false
    };
  }
}

// ======================================
// تصدير Instance افتراضي للاستخدام المباشر
// ======================================

/**
 * مثيل افتراضي من FrontendAuthRepository للاستخدام في التطبيق
 */
export const authRepository = new FrontendAuthRepository();

/**
 * تصدير الأنواع للاستخدام في أماكن أخرى
 */
export type { AuthQueryOptions, SecurityAnalytics }; 
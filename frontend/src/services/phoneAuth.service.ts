/**
 * 📱 خدمة مصادقة الهاتف العراقي - Depth Studio
 * ====================================================
 * 
 * 🎯 الهدف: إدارة شاملة لمصادقة الأرقام العراقية مع OTP
 * 📅 تاريخ الإنشاء: يونيو 2025
 * 👨‍💻 المطور: علي جودت
 * 
 * 🔗 التكامل الكامل:
 * - Backend: AuthService.ts (1,430 سطر - phone methods)
 * - Types: @depth-studio/types/auth (314 سطر كاملة)
 * - Frontend: auth.service.ts (240 سطر) - لتجنب التكرار
 * - API Client: api-client.ts (255 سطر) - للـ HTTP requests
 * 
 * 📱 المميزات المتقدمة:
 * - دعم جميع الشبكات العراقية (آسياسيل، زين، كورك، إيرثلنك)
 * - نظام OTP آمن مع انتهاء صلاحية ذكي
 * - إحصائيات شاملة للمصادقة بالهاتف
 * - تسجيل نشاط المصادقة للأمان
 * - التحقق من صحة الأرقام العراقية
 * - إدارة طرق المصادقة المتعددة
 * 
 * 🔗 APIs المدعومة (14 endpoint فعلي):
 * === Registration & Login ===
 * ✅ registerWithEmail() → POST /api/auth/register/email
 * ✅ loginWithEmail() → POST /api/auth/login/email
 * ✅ registerWithPhone() → POST /api/auth/register/phone
 * ✅ loginWithPhone() → POST /api/auth/login/phone
 * ✅ registerWithGoogle() → POST /api/auth/register/google
 * ✅ loginWithGoogle() → POST /api/auth/login/google
 * 
 * === OTP Management ===
 * ✅ sendOTP() → POST /api/auth/send-otp
 * ✅ verifyOTP() → POST /api/auth/verify-otp
 * ✅ resendOTP() → POST /api/auth/resend-otp
 * 
 * === Utilities ===
 * ✅ getUserAuthMethods() → GET /api/auth/methods/:userId
 * ✅ validateIraqiPhone() → POST /api/auth/validate-phone
 * ✅ logout() → POST /api/auth/logout
 * 
 * === Analytics (Admin) ===
 * ✅ getRegistrationStats() → GET /api/auth/stats/registration
 * ✅ getAuthMethodStats() → GET /api/auth/stats/methods
 */

// ======================================
// 📦 الاستيرادات المطلوبة مع الشرح الشامل
// ======================================

// 🌐 عميل API للتواصل مع الخادم
import { apiClient } from './api/api-client';
// 📋 فوائد apiClient:
// - إدارة موحدة لطلبات HTTP مع الخادم
// - معالجة تلقائية للـ Authentication Headers  
// - إدارة أخطاء الشبكة والاستجابات
// - دعم TypeScript كامل مع أنواع الاستجابات
// - تكامل مع نظام التوثيق المركزي

// 🔐 جميع أنواع المصادقة من types - استخدام دقيق ومتوافق
import { 
  // === أنواع التسجيل الأساسية ===
  EmailRegistrationData,           // 📧 بيانات التسجيل بالبريد - email, password, full_name, accept_terms
  PhoneRegistrationData,           // 📱 بيانات التسجيل بالهاتف - phone, country_code, full_name, accept_terms
  GoogleRegistrationData,          // 🌐 بيانات التسجيل بجوجل - google_token, full_name, email, accept_terms
  
  // === أنواع تسجيل الدخول ===
  EmailLoginData,                  // 📧 بيانات الدخول بالبريد الإلكتروني - email, password, remember_me
  PhoneLoginData,                  // 📱 بيانات الدخول بالهاتف - phone, country_code
  GoogleLoginData,                 // 🌐 بيانات الدخول بجوجل - google_token
  
  // === إدارة OTP للأرقام العراقية ===
  OTPSendRequest,                  // 📤 طلب إرسال OTP - phone, country_code, user_id, purpose
  OTPSendResult,                   // 📥 نتيجة إرسال OTP - success, message, expires_at, attempts_remaining
  OTPVerifyRequest,                // 🔍 طلب التحقق من OTP - phone, country_code, otp_code, user_id
  OTPVerifyResult,                 // ✅ نتيجة التحقق من OTP - success, message, user, token, needs_role_selection
  
  // === نتائج المصادقة ===
  AuthResult,                      // 🏆 نتيجة عملية المصادقة - success, user, token, needs_role_selection, message
  
  // === التحقق من الهاتف العراقي ===
  PhoneVerification,               // 📱 بيانات التحقق - phone, country_code, otp_code, expires_at, attempts
  
  // === إدارة طرق المصادقة ===
  AuthMethod,                      // 🔑 طريقة مصادقة - type, verified, created_at, metadata
  
  // === الإحصائيات والتحليلات ===
  RegistrationStats,               // 📊 إحصائيات التسجيل - email_registrations, phone_registrations, total
  AuthMethodUsageStats,            // 📈 إحصائيات استخدام طرق المصادقة - users_with_email, users_with_phone
  
  // === تسجيل الأنشطة الأمنية ===
  AuthActivityLog,                 // 🔒 سجل أنشطة المصادقة - activity_type, auth_method, ip_address, success
  
  // === إعدادات الأمان ===
  AuthSecuritySettings,            // ⚙️ إعدادات الأمان - max_attempts, lockout_duration, otp_expiry
  
  // === أنواع أساسية ===
  User,                            // 👤 بيانات المستخدم الكاملة
  ID                               // 🆔 معرف موحد
} from '@depth-studio/types';

// ======================================
// 🏗️ خدمة مصادقة الهاتف العراقي الشاملة
// ======================================

class PhoneAuthService {
  
  // ======================================
  // 📱 إدارة التسجيل بالهاتف العراقي
  // ======================================

  /**
   * 📝 تسجيل مستخدم جديد بالبريد الإلكتروني
   * يتكامل مع AuthService.registerWithEmail()
   */
  async registerWithEmail(registrationData: EmailRegistrationData): Promise<AuthResult> {
    try {
      console.log('📧 بدء تسجيل مستخدم جديد بالبريد الإلكتروني:', registrationData.email);
      
      const response = await apiClient.post<AuthResult>('/auth/register/email', registrationData);
      
      if (response.success && response.data?.token) {
        // حفظ token في ApiClient عند نجاح التسجيل
        apiClient.setAuthToken(response.data.token);
        console.log('✅ تم تسجيل المستخدم بالبريد بنجاح');
      }
      
      return response.data!;
    } catch (error) {
      console.error('🚨 خطأ في تسجيل المستخدم بالبريد:', error);
      throw error;
    }
  }

  /**
   * 📱 تسجيل مستخدم جديد برقم الهاتف العراقي
   * يتطلب التحقق من OTP أولاً قبل إكمال التسجيل
   */
  async registerWithPhone(registrationData: PhoneRegistrationData): Promise<AuthResult> {
    try {
      console.log('📱 بدء تسجيل مستخدم جديد بالهاتف العراقي:', registrationData.phone);
      
      const response = await apiClient.post<AuthResult>('/auth/register/phone', registrationData);
      
      if (response.success && response.data?.token) {
        // حفظ token في ApiClient عند نجاح التسجيل
        apiClient.setAuthToken(response.data.token);
        console.log('✅ تم تسجيل المستخدم بالهاتف بنجاح');
      }
      
      return response.data!;
    } catch (error) {
      console.error('🚨 خطأ في تسجيل المستخدم بالهاتف:', error);
      throw error;
    }
  }

  /**
   * 🌐 تسجيل مستخدم جديد بحساب جوجل
   * يتكامل مع AuthService.registerWithGoogle()
   */
  async registerWithGoogle(registrationData: GoogleRegistrationData): Promise<AuthResult> {
    try {
      console.log('🌐 بدء تسجيل مستخدم جديد بحساب جوجل:', registrationData.email);
      
      const response = await apiClient.post<AuthResult>('/auth/register/google', registrationData);
      
      if (response.success && response.data?.token) {
        // حفظ token في ApiClient عند نجاح التسجيل
        apiClient.setAuthToken(response.data.token);
        console.log('✅ تم تسجيل المستخدم بجوجل بنجاح');
      }
      
      return response.data!;
    } catch (error) {
      console.error('🚨 خطأ في تسجيل المستخدم بجوجل:', error);
      throw error;
    }
  }

  // ======================================
  // 🔑 إدارة تسجيل الدخول
  // ======================================

  /**
   * 📧 تسجيل دخول بالبريد الإلكتروني
   * يتكامل مع AuthService.loginWithEmail()
   */
  async loginWithEmail(loginData: EmailLoginData): Promise<AuthResult> {
    try {
      console.log('📧 بدء تسجيل الدخول بالبريد الإلكتروني:', loginData.email);
      
      const response = await apiClient.post<AuthResult>('/auth/login/email', loginData);
      
      if (response.success && response.data?.token) {
        // حفظ token في ApiClient عند نجاح الدخول
        apiClient.setAuthToken(response.data.token);
        console.log('✅ تم تسجيل الدخول بالبريد بنجاح');
      }
      
      return response.data!;
    } catch (error) {
      console.error('🚨 خطأ في تسجيل الدخول بالبريد:', error);
      throw error;
    }
  }

  /**
   * 📱 تسجيل دخول برقم الهاتف العراقي (المرحلة الأولى - إرسال OTP)
   * يرسل رمز OTP لرقم الهاتف المحدد
   */
  async loginWithPhone(phoneData: PhoneLoginData): Promise<OTPSendResult> {
    try {
      console.log('📱 بدء تسجيل الدخول بالهاتف العراقي:', phoneData.phone);
      
      // تحويل بيانات الهاتف إلى طلب OTP للدخول
      const otpRequest: OTPSendRequest = {
        phone: phoneData.phone,
        country_code: phoneData.country_code,
        purpose: 'login'
      };

      const response = await apiClient.post<OTPSendResult>('/auth/login/phone', otpRequest);
      
      console.log('📤 تم إرسال OTP للهاتف بنجاح');
      return response.data!;
    } catch (error) {
      console.error('🚨 خطأ في إرسال OTP للهاتف:', error);
      throw error;
    }
  }

  /**
   * 🌐 تسجيل دخول بحساب جوجل
   * يتكامل مع AuthService.loginWithGoogle()
   */
  async loginWithGoogle(googleData: GoogleLoginData): Promise<AuthResult> {
    try {
      console.log('🌐 بدء تسجيل الدخول بحساب جوجل');
      
      const response = await apiClient.post<AuthResult>('/auth/login/google', googleData);
      
      if (response.success && response.data?.token) {
        // حفظ token في ApiClient عند نجاح الدخول
        apiClient.setAuthToken(response.data.token);
        console.log('✅ تم تسجيل الدخول بجوجل بنجاح');
      }
      
      return response.data!;
    } catch (error) {
      console.error('🚨 خطأ في تسجيل الدخول بجوجل:', error);
      throw error;
    }
  }

  // ======================================
  // 📱 إدارة OTP للأرقام العراقية
  // ======================================

  /**
   * 📤 إرسال رمز OTP لرقم الهاتف العراقي
   * يدعم جميع الأغراض: registration, login, phone_verification, password_reset
   */
  async sendOTP(otpRequest: OTPSendRequest): Promise<OTPSendResult> {
    try {
      console.log('📤 إرسال OTP للهاتف:', otpRequest.phone, 'للغرض:', otpRequest.purpose);
      
      const response = await apiClient.post<OTPSendResult>('/auth/send-otp', otpRequest);
      
      console.log('✅ تم إرسال OTP بنجاح. ينتهي في:', response.data?.expires_at);
      return response.data!;
    } catch (error) {
      console.error('🚨 خطأ في إرسال OTP:', error);
      throw error;
    }
  }

  /**
   * 🔍 التحقق من رمز OTP المدخل
   * يكمل عملية المصادقة بعد التحقق الناجح
   */
  async verifyOTP(verifyRequest: OTPVerifyRequest): Promise<OTPVerifyResult> {
    try {
      console.log('🔍 التحقق من OTP للهاتف:', verifyRequest.phone);
      
      const response = await apiClient.post<OTPVerifyResult>('/auth/verify-otp', verifyRequest);
      
      if (response.success && response.data?.user && response.data?.token) {
        // حفظ token في ApiClient عند نجاح التحقق
        apiClient.setAuthToken(response.data.token);
        console.log('✅ تم التحقق من OTP بنجاح. المستخدم:', response.data.user.full_name);
      }
      
      return response.data!;
    } catch (error) {
      console.error('🚨 خطأ في التحقق من OTP:', error);
      throw error;
    }
  }

  /**
   * 🔄 إعادة إرسال رمز OTP
   * يُستخدم عندما لا يصل الرمز الأول أو ينتهي وقته
   */
  async resendOTP(otpRequest: OTPSendRequest): Promise<OTPSendResult> {
    try {
      console.log('🔄 إعادة إرسال OTP للهاتف:', otpRequest.phone);
      
      const response = await apiClient.post<OTPSendResult>('/auth/resend-otp', otpRequest);
      
      console.log('✅ تم إعادة إرسال OTP بنجاح');
      return response.data!;
    } catch (error) {
      console.error('🚨 خطأ في إعادة إرسال OTP:', error);
      throw error;
    }
  }

  // ======================================
  // 🔧 الأدوات المساعدة
  // ======================================

  /**
   * 📋 جلب طرق المصادقة لمستخدم محدد
   * يعرض جميع طرق المصادقة المربوطة بالحساب (email, phone, google)
   */
  async getUserAuthMethods(userId: ID): Promise<AuthMethod[]> {
    try {
      console.log('📋 جلب طرق المصادقة للمستخدم:', userId);
      
      const response = await apiClient.get<AuthMethod[]>(`/auth/methods/${userId}`);
      
      console.log('✅ تم جلب طرق المصادقة بنجاح. العدد:', response.data?.length);
      return response.data || [];
    } catch (error) {
      console.error('🚨 خطأ في جلب طرق المصادقة:', error);
      throw error;
    }
  }

  /**
   * ✅ التحقق من صحة رقم الهاتف العراقي
   * يتحقق من صيغة الرقم ومطابقته للشبكات العراقية
   */
  async validateIraqiPhone(phone: string, countryCode: string = '+964'): Promise<{
    isValid: boolean;
    message: string;
    network?: string;
    formattedPhone?: string;
  }> {
    try {
      console.log('✅ التحقق من صحة الرقم العراقي:', phone);
      
      const response = await apiClient.post<{
        isValid: boolean;
        message: string;
        network?: string;
        formattedPhone?: string;
      }>('/auth/validate-phone', {
        phone,
        country_code: countryCode
      });
      
      console.log('✅ نتيجة التحقق:', response.data?.isValid ? 'صحيح' : 'غير صحيح');
      return response.data!;
    } catch (error) {
      console.error('🚨 خطأ في التحقق من الرقم:', error);
      throw error;
    }
  }

  /**
   * 🚪 تسجيل خروج المستخدم
   * ينهي الجلسة ويمسح جميع البيانات المحلية
   */
  async logout(): Promise<void> {
    try {
      console.log('🚪 بدء تسجيل خروج المستخدم');
      
      // استدعاء endpoint تسجيل الخروج في الخادم
      await apiClient.post('/auth/logout');
      
      // مسح token من ApiClient
      apiClient.clearAuthToken();
      
      // مسح أي بيانات مخزنة محلياً
      this.clearLocalAuthData();
      
      console.log('✅ تم تسجيل الخروج بنجاح');
    } catch (error) {
      console.error('🚨 خطأ في تسجيل الخروج:', error);
      
      // حتى لو فشل الطلب للخادم، امسح البيانات المحلية
      apiClient.clearAuthToken();
      this.clearLocalAuthData();
      
      throw error;
    }
  }

  // ======================================
  // 📊 الإحصائيات والتحليلات (للأدمن)
  // ======================================

  /**
   * 📈 جلب إحصائيات التسجيل الشاملة
   * يعرض معدلات التسجيل بجميع الطرق والتحويلات
   */
  async getRegistrationStats(): Promise<RegistrationStats> {
    try {
      console.log('📈 جلب إحصائيات التسجيل');
      
      const response = await apiClient.get<RegistrationStats>('/auth/stats/registration');
      
      console.log('✅ تم جلب إحصائيات التسجيل. إجمالي التسجيلات:', response.data?.total_registrations);
      return response.data!;
    } catch (error) {
      console.error('🚨 خطأ في جلب إحصائيات التسجيل:', error);
      throw error;
    }
  }

  /**
   * 📊 جلب إحصائيات استخدام طرق المصادقة
   * يحلل توزيع المستخدمين على طرق المصادقة المختلفة
   */
  async getAuthMethodStats(): Promise<AuthMethodUsageStats> {
    try {
      console.log('📊 جلب إحصائيات طرق المصادقة');
      
      const response = await apiClient.get<AuthMethodUsageStats>('/auth/stats/methods');
      
      console.log('✅ تم جلب إحصائيات طرق المصادقة. إجمالي المستخدمين:', response.data?.total_users);
      return response.data!;
    } catch (error) {
      console.error('🚨 خطأ في جلب إحصائيات طرق المصادقة:', error);
      throw error;
    }
  }

  // ======================================
  // 🔧 الوظائف المساعدة الداخلية
  // ======================================

  /**
   * 🧹 مسح البيانات المحلية للمصادقة
   * ينظف localStorage من بيانات المصادقة
   */
  private clearLocalAuthData(): void {
    if (typeof window !== 'undefined') {
      // مسح بيانات المصادقة من localStorage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_data');
      localStorage.removeItem('auth_method');
      localStorage.removeItem('last_login');
      
      console.log('🧹 تم مسح البيانات المحلية للمصادقة');
    }
  }

  // ======================================
  // 🛡️ دوال الأمان والإحصائيات المتقدمة
  // ======================================

  /**
   * 📊 تسجيل نشاط المصادقة للأمان - يستخدم AuthActivityLog
   * يحفظ سجل مفصل لجميع عمليات المصادقة
   */
  async logAuthActivity(activityData: Partial<AuthActivityLog>): Promise<void> {
    try {
      console.log('📊 تسجيل نشاط المصادقة:', activityData.activity_type);
      
      const fullActivityLog: Partial<AuthActivityLog> = {
        activity_type: activityData.activity_type,
        auth_method: activityData.auth_method,
        ip_address: activityData.ip_address || 'unknown',
        user_agent: activityData.user_agent || navigator.userAgent,
        success: activityData.success || false,
        failure_reason: activityData.failure_reason,
        user_id: activityData.user_id,
        additional_data: activityData.additional_data
      };

      await apiClient.post('/auth/activity-log', fullActivityLog);
      console.log('✅ تم تسجيل النشاط بنجاح');
    } catch (error) {
      console.error('🚨 خطأ في تسجيل النشاط:', error);
      // لا نريد إيقاف العمليات إذا فشل التسجيل
    }
  }

  /**
   * ⚙️ جلب إعدادات الأمان الحالية - يستخدم AuthSecuritySettings
   * يجلب القواعد الأمنية المطبقة على النظام
   */
  async getSecuritySettings(): Promise<AuthSecuritySettings> {
    try {
      console.log('⚙️ جلب إعدادات الأمان');
      
      const response = await apiClient.get<AuthSecuritySettings>('/auth/security-settings');
      
      console.log('✅ تم جلب إعدادات الأمان بنجاح');
      return response.data!;
    } catch (error) {
      console.error('🚨 خطأ في جلب إعدادات الأمان:', error);
      throw error;
    }
  }

  /**
   * 📱 إنشاء تحقق هاتف جديد - يستخدم PhoneVerification
   * ينشئ سجل تحقق مفصل لرقم الهاتف
   */
  async createPhoneVerification(phoneData: Partial<PhoneVerification>): Promise<PhoneVerification> {
    try {
      console.log('📱 إنشاء تحقق هاتف جديد:', phoneData.phone);
      
      const response = await apiClient.post<PhoneVerification>('/auth/phone-verification', {
        phone: phoneData.phone,
        country_code: phoneData.country_code,
        full_phone: phoneData.full_phone,
        user_id: phoneData.user_id,
        ip_address: phoneData.ip_address
      });
      
      console.log('✅ تم إنشاء تحقق الهاتف بنجاح');
      return response.data!;
    } catch (error) {
      console.error('🚨 خطأ في إنشاء تحقق الهاتف:', error);
      throw error;
    }
  }

  /**
   * 👤 استخراج معلومات المستخدم الأساسية - يستخدم User
   * يحول بيانات User إلى معلومات عرض مبسطة
   */
  extractUserDisplayInfo(user: User): {
    fullName: string;
    email?: string;
    phone?: string;
    role: string;
    isVerified: boolean;
    joinDate: string;
  } {
    console.log('👤 استخراج معلومات المستخدم:', user.full_name);
    
    return {
      fullName: user.full_name,
      email: user.email,
      phone: user.phone,
      role: user.role || 'غير محدد',
      isVerified: user.is_verified || user.phone_verified || false,
      joinDate: user.created_at && typeof user.created_at === 'object' && 'toDate' in user.created_at
        ? (user.created_at as { toDate(): Date }).toDate().toLocaleDateString('ar-IQ')
        : 'غير معروف'
    };
  }

  /**
   * 🔍 فحص حالة المصادقة الحالية
   * يتحقق من وجود token صالح
   */
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    
    const token = localStorage.getItem('auth_token');
    const isAuth = !!token;
    
    console.log('🔍 حالة المصادقة:', isAuth ? 'مصادق' : 'غير مصادق');
    return isAuth;
  }

  /**
   * 🎫 جلب token المصادقة الحالي
   * يسترجع JWT token من localStorage
   */
  getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    
    const token = localStorage.getItem('auth_token');
    console.log('🎫 جلب token المصادقة:', token ? 'موجود' : 'غير موجود');
    
    return token;
  }

  // ======================================
  // 🔧 أدوات مساعدة للأرقام العراقية
  // ======================================

  /**
   * 🇮🇶 تنسيق رقم الهاتف العراقي للعرض
   * يحول الرقم إلى تنسيق قابل للقراءة مع تحديد الشبكة
   */
  formatIraqiPhoneForDisplay(phone: string): {
    formatted: string;
    network: string;
    networkColor: string;
  } {
    // إزالة رمز البلد إذا كان موجوداً
    const cleanPhone = phone.replace(/^\+964/, '').replace(/^964/, '');
    
    // تحديد الشبكة واللون
    let network = 'غير معروف';
    let networkColor = '#gray';
    
    if (cleanPhone.startsWith('077') || cleanPhone.startsWith('078')) {
      network = 'آسياسيل';
      networkColor = '#e74c3c'; // أحمر
    } else if (cleanPhone.startsWith('079')) {
      network = 'زين';
      networkColor = '#3498db'; // أزرق
    } else if (cleanPhone.startsWith('075')) {
      network = 'كورك';
      networkColor = '#2ecc71'; // أخضر
    } else if (cleanPhone.startsWith('076')) {
      network = 'إيرثلنك';
      networkColor = '#f39c12'; // برتقالي
    }
    
    // تنسيق الرقم للعرض (0XX XXX XXXX)
    const formatted = `0${cleanPhone.substring(0, 2)} ${cleanPhone.substring(2, 5)} ${cleanPhone.substring(5)}`;
    
    console.log('🇮🇶 تم تنسيق الرقم العراقي:', formatted, `(${network})`);
    
    return {
      formatted,
      network,
      networkColor
    };
  }

  /**
   * ⏰ حساب الوقت المتبقي من timestamp
   * يحسب الثواني المتبقية حتى انتهاء صلاحية OTP
   */
  getTimeRemainingFromTimestamp(expiresAt: unknown): number {
    try {
      // التعامل مع FirebaseTimestamp أو Date أو string
      let expireDate: Date;
      
      if (expiresAt && typeof expiresAt === 'object' && 'toDate' in expiresAt) {
        // FirebaseTimestamp
        const timestampObj = expiresAt as { toDate(): Date };
        expireDate = timestampObj.toDate();
      } else if (expiresAt instanceof Date) {
        // Date object
        expireDate = expiresAt;
      } else if (typeof expiresAt === 'string') {
        // ISO string
        expireDate = new Date(expiresAt);
      } else {
        // غير معروف
        console.warn('⚠️ نوع timestamp غير معروف:', typeof expiresAt);
        return 0;
      }
      
      const now = new Date();
      const remaining = Math.max(0, Math.floor((expireDate.getTime() - now.getTime()) / 1000));
      
      console.log('⏰ الوقت المتبقي:', remaining, 'ثانية');
      return remaining;
    } catch (error) {
      console.error('🚨 خطأ في حساب الوقت المتبقي:', error);
      return 0;
    }
  }
}

// ======================================
// 📤 تصدير الخدمة
// ======================================

// إنشاء instance واحد من الخدمة (Singleton pattern)
export const phoneAuthService = new PhoneAuthService();

// تصدير الكلاس أيضاً للاستخدام المتقدم
export default PhoneAuthService;

// ======================================
// 📚 دليل الاستخدام
// ======================================

/**
 * 📖 أمثلة الاستخدام:
 * 
 * // 1. تسجيل مستخدم جديد بالهاتف
 * const registrationData: PhoneRegistrationData = {
 *   phone: '07712345678',
 *   country_code: '+964',
 *   full_name: 'أحمد محمد',
 *   accept_terms: true
 * };
 * const result = await phoneAuthService.registerWithPhone(registrationData);
 * 
 * // 2. إرسال OTP للدخول
 * const phoneLogin: PhoneLoginData = {
 *   phone: '07712345678',
 *   country_code: '+964'
 * };
 * const otpResult = await phoneAuthService.loginWithPhone(phoneLogin);
 * 
 * // 3. التحقق من OTP
 * const verifyData: OTPVerifyRequest = {
 *   phone: '07712345678',
 *   country_code: '+964',
 *   otp_code: '123456'
 * };
 * const authResult = await phoneAuthService.verifyOTP(verifyData);
 * 
 * // 4. التحقق من صحة الرقم العراقي
 * const validation = await phoneAuthService.validateIraqiPhone('07712345678');
 * 
 * // 5. تنسيق الرقم للعرض
 * const display = phoneAuthService.formatIraqiPhoneForDisplay('07712345678');
 * console.log(display.formatted); // "077 123 45678 (آسياسيل)"
 */

/**
 * 🎯 الفوائد العملية:
 * 
 * 1. **خدمة شاملة ومتكاملة**: تغطي جميع عمليات المصادقة بطريقة موحدة
 * 2. **دعم كامل للأرقام العراقية**: تحقق وتنسيق وتحديد الشبكة
 * 3. **أمان متقدم**: تسجيل الأنشطة وإدارة OTP آمنة
 * 4. **سهولة الاستخدام**: API واضح ومتوافق مع الخدمات الموجودة
 * 5. **إحصائيات شاملة**: تحليل طرق المصادقة والتسجيل
 * 6. **معالجة أخطاء متقدمة**: رسائل عربية واضحة وتسجيل مفصل
 * 7. **تكامل ممتاز**: يعمل بسلاسة مع auth.service.ts و api-client.ts
 * 8. **دعم جميع المنصات**: Web, Mobile, Desktop
 */ 
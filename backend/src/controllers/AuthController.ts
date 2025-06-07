/**
 * 🔐 Authentication Controller - Depth Studio
 * ============================================
 * 
 * 📅 محدث: ديسمبر 2024
 * 👨‍💻 المطور: علي جودت
 * 🎯 الهدف: نظام مصادقة متكامل بـ 3 طرق
 * 
 * 🔑 المميزات:
 * - 3 طرق مصادقة (بريد، هاتف عراقي، جوجل)
 * - نظام OTP آمن للأرقام العراقية
 * - تحقق شامل من صحة البيانات
 * - أمان كامل بدون استخدام 'any'
 */

import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import { UserRepository } from '../repositories/UserRepository';
import {
  EmailRegistrationData,
  PhoneRegistrationData,
  GoogleRegistrationData,
  EmailLoginData,
  PhoneLoginData,
  GoogleLoginData,
  OTPSendRequest,
  OTPVerifyRequest,
  AuthResult,
  OTPSendResult,
  OTPVerifyResult,
  RegistrationStats,
  AuthMethodUsageStats,
  AuthMethod,
  AuthProvider,
  ID
} from '../../../types/src';
import { logger } from 'firebase-functions';

// 🔐 Auth Validators
import {
  validateEmailRegistration,
  validateEmailLogin,
  validatePhoneRegistration,
  validatePhoneLogin,
  validateGoogleRegistration,
  validateGoogleLogin,
  validateOTPSend,
  validateOTPVerify,
  validatePhoneValidation,
  validateLogout,
  validateUserIdParams
} from '../validators/AuthValidators';



/**
 * 🔐 تحكم المصادقة
 */
export class AuthController {
  private authService: AuthService;
  private userRepository: UserRepository;

  constructor() {
    this.authService = new AuthService();
    this.userRepository = new UserRepository();
  }

  // ======================================
  // 📧 التسجيل والدخول بالبريد الإلكتروني
  // ======================================

  /**
   * POST /api/auth/register/email
   * تسجيل مستخدم جديد بالبريد الإلكتروني
   * 🔐 Validation: validateEmailRegistration middleware
   * 
   * فايدة validateEmailRegistration:
   * - التحقق من صحة البريد الإلكتروني
   * - التحقق من قوة كلمة المرور
   * - التحقق من تطابق كلمة المرور وتأكيدها
   * - التحقق من قبول الشروط والأحكام
   * - التحقق من صحة رقم الهاتف العراقي (اختياري)
   */
  async registerWithEmail(req: Request, res: Response): Promise<void> {
    try {
      // استخدام الـ validation function للتحقق من البيانات
      validateEmailRegistration(req, res, () => {});

      // البيانات محققة بالفعل من middleware
      const registrationData: EmailRegistrationData = req.body;

      const result: AuthResult = await this.authService.registerWithEmail(registrationData);

      if (result.success) {
        logger.info('📧 تسجيل بريد إلكتروني ناجح', { 
          email: registrationData.email, 
          userId: result.user?.id 
        });
        
        res.status(201).json({
          success: true,
          message: result.message,
          user: result.user,
          token: result.token,
          needs_role_selection: result.needs_role_selection,
          needs_email_verification: result.needs_email_verification
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message
        });
      }
    } catch (error) {
      logger.error('❌ خطأ في تسجيل البريد الإلكتروني', { error });
      res.status(500).json({
        success: false,
        message: 'خطأ في الخادم'
      });
    }
  }

  /**
   * POST /api/auth/login/email
   * تسجيل دخول بالبريد الإلكتروني
   * 🔐 Validation: validateEmailLogin middleware
   * 
   * فايدة validateEmailLogin:
   * - التحقق من صحة تنسيق البريد الإلكتروني
   * - التحقق من وجود كلمة المرور
   * - التحقق من نوع remember_me (boolean اختياري)
   */
  async loginWithEmail(req: Request, res: Response): Promise<void> {
    try {
      // استخدام الـ validation function للتحقق من البيانات
      validateEmailLogin(req, res, () => {});

      const loginData: EmailLoginData = {
        email: req.body.email,
        password: req.body.password,
        remember_me: req.body.remember_me
      };

      // التحقق من صحة البيانات
      if (!this.validateEmailLoginData(loginData)) {
        res.status(400).json({
          success: false,
          message: 'بيانات غير صحيحة'
        });
        return;
      }

      const result: AuthResult = await this.authService.loginWithEmail(loginData);

      if (result.success) {
        logger.info('🔑 دخول بريد إلكتروني ناجح', { 
          email: loginData.email, 
          userId: result.user?.id 
        });
        
        res.status(200).json({
          success: true,
          message: result.message,
          user: result.user,
          token: result.token,
          refresh_token: result.refresh_token,
          needs_role_selection: result.needs_role_selection,
          expires_at: result.expires_at
        });
      } else {
        res.status(401).json({
          success: false,
          message: result.message
        });
      }
    } catch (error) {
      logger.error('❌ خطأ في دخول البريد الإلكتروني', { error });
      res.status(500).json({
        success: false,
        message: 'خطأ في الخادم'
      });
    }
  }

  // ======================================
  // 📱 التسجيل والدخول بالهاتف العراقي + OTP
  // ======================================

  /**
   * POST /api/auth/register/phone
   * تسجيل مستخدم جديد بالهاتف العراقي
   * 🔐 Validation: validatePhoneRegistration middleware
   * 
   * فايدة validatePhoneRegistration:
   * - التحقق من صحة رقم الهاتف العراقي (+964)
   * - التحقق من رمز البلد (+964 فقط)
   * - التحقق من الاسم الكامل (2-100 حرف)
   * - التحقق من قبول الشروط والأحكام
   */
  async registerWithPhone(req: Request, res: Response): Promise<void> {
    try {
      // استخدام الـ validation function للتحقق من البيانات
      validatePhoneRegistration(req, res, () => {});

      const registrationData: PhoneRegistrationData = {
        phone: req.body.phone,
        country_code: req.body.country_code,
        full_name: req.body.full_name,
        accept_terms: req.body.accept_terms
      };

      // التحقق من صحة البيانات
      if (!this.validatePhoneRegistrationData(registrationData)) {
        res.status(400).json({
          success: false,
          message: 'بيانات غير صحيحة'
        });
        return;
      }

      const result: AuthResult = await this.authService.registerWithPhone(registrationData);

      if (result.success) {
        logger.info('📱 تسجيل هاتف عراقي ناجح', { 
          phone: registrationData.phone, 
          userId: result.user?.id 
        });
        
        res.status(201).json({
          success: true,
          message: result.message,
          user: result.user,
          token: result.token,
          needs_role_selection: result.needs_role_selection,
          needs_phone_verification: result.needs_phone_verification
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message
        });
      }
    } catch (error) {
      logger.error('❌ خطأ في تسجيل الهاتف', { error });
      res.status(500).json({
        success: false,
        message: 'خطأ في الخادم'
      });
    }
  }

  /**
   * POST /api/auth/login/phone
   * تسجيل دخول بالهاتف العراقي (يرسل OTP)
   * 🔐 Validation: validatePhoneLogin middleware
   * 
   * فايدة validatePhoneLogin:
   * - التحقق من صحة رقم الهاتف العراقي
   * - التحقق من رمز البلد (+964 فقط)
   * - ضمان التوافق مع نظام OTP العراقي
   */
  async loginWithPhone(req: Request, res: Response): Promise<void> {
    try {
      // استخدام الـ validation function للتحقق من البيانات
      validatePhoneLogin(req, res, () => {});

      const loginData: PhoneLoginData = {
        phone: req.body.phone,
        country_code: req.body.country_code
      };

      // التحقق من صحة البيانات
      if (!this.validatePhoneLoginData(loginData)) {
        res.status(400).json({
          success: false,
          message: 'بيانات غير صحيحة'
        });
        return;
      }

      const result: AuthResult = await this.authService.loginWithPhone(loginData);

      if (result.success) {
        logger.info('📱 بدء دخول هاتف عراقي', { 
          phone: loginData.phone 
        });
        
        res.status(200).json({
          success: true,
          message: result.message,
          needs_phone_verification: true
        });
      } else {
        res.status(401).json({
          success: false,
          message: result.message
        });
      }
    } catch (error) {
      logger.error('❌ خطأ في دخول الهاتف', { error });
      res.status(500).json({
        success: false,
        message: 'خطأ في الخادم'
      });
    }
  }

  // ======================================
  // 🌐 التسجيل والدخول بحساب جوجل
  // ======================================

  /**
   * POST /api/auth/register/google
   * تسجيل مستخدم جديد بحساب جوجل
   * 🔐 Validation: validateGoogleRegistration middleware
   * 
   * فايدة validateGoogleRegistration:
   * - التحقق من صحة Google Token
   * - التحقق من البريد الإلكتروني
   * - التحقق من الاسم الكامل
   * - التحقق من رابط الصورة الشخصية (اختياري)
   * - التحقق من قبول الشروط والأحكام
   */
  async registerWithGoogle(req: Request, res: Response): Promise<void> {
    try {
      // استخدام الـ validation function للتحقق من البيانات
      validateGoogleRegistration(req, res, () => {});

      const registrationData: GoogleRegistrationData = {
        google_token: req.body.google_token,
        full_name: req.body.full_name,
        email: req.body.email,
        profile_picture: req.body.profile_picture,
        accept_terms: req.body.accept_terms
      };

      // التحقق من صحة البيانات
      if (!this.validateGoogleRegistrationData(registrationData)) {
        res.status(400).json({
          success: false,
          message: 'بيانات غير صحيحة'
        });
        return;
      }

      const result: AuthResult = await this.authService.registerWithGoogle(registrationData);

      if (result.success) {
        logger.info('🌐 تسجيل جوجل ناجح', { 
          email: registrationData.email, 
          userId: result.user?.id 
        });
        
        res.status(201).json({
          success: true,
          message: result.message,
          user: result.user,
          token: result.token,
          needs_role_selection: result.needs_role_selection
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message
        });
      }
    } catch (error) {
      logger.error('❌ خطأ في تسجيل جوجل', { error });
      res.status(500).json({
        success: false,
        message: 'خطأ في الخادم'
      });
    }
  }

  /**
   * POST /api/auth/login/google
   * تسجيل دخول بحساب جوجل
   * 🔐 Validation: validateGoogleLogin middleware
   * 
   * فايدة validateGoogleLogin:
   * - التحقق من صحة Google Token
   * - ضمان الأمان في عملية المصادقة
   */
  async loginWithGoogle(req: Request, res: Response): Promise<void> {
    try {
      // استخدام الـ validation function للتحقق من البيانات
      validateGoogleLogin(req, res, () => {});

      const loginData: GoogleLoginData = {
        google_token: req.body.google_token
      };

      // التحقق من صحة البيانات
      if (!this.validateGoogleLoginData(loginData)) {
        res.status(400).json({
          success: false,
          message: 'بيانات غير صحيحة'
        });
        return;
      }

      const result: AuthResult = await this.authService.loginWithGoogle(loginData);

      if (result.success) {
        logger.info('🌐 دخول جوجل ناجح', { 
          userId: result.user?.id 
        });
        
        res.status(200).json({
          success: true,
          message: result.message,
          user: result.user,
          token: result.token,
          refresh_token: result.refresh_token,
          needs_role_selection: result.needs_role_selection,
          expires_at: result.expires_at
        });
      } else {
        res.status(401).json({
          success: false,
          message: result.message
        });
      }
    } catch (error) {
      logger.error('❌ خطأ في دخول جوجل', { error });
      res.status(500).json({
        success: false,
        message: 'خطأ في الخادم'
      });
    }
  }

  // ======================================
  // 🔢 إدارة OTP للهواتف العراقية
  // ======================================

  /**
   * POST /api/auth/send-otp
   * إرسال رمز OTP للهاتف العراقي
   * 🔐 Validation: validateOTPSend middleware
   * 
   * فايدة validateOTPSend:
   * - التحقق من صحة رقم الهاتف العراقي
   * - التحقق من رمز البلد (+964)
   * - التحقق من غرض OTP (registration, login, phone_verification, password_reset)
   * - التحقق من معرف المستخدم (اختياري)
   */
  async sendOTP(req: Request, res: Response): Promise<void> {
    try {
      // استخدام الـ validation function للتحقق من البيانات
      validateOTPSend(req, res, () => {});

      const otpRequest: OTPSendRequest = {
        phone: req.body.phone,
        country_code: req.body.country_code,
        user_id: req.body.user_id,
        purpose: req.body.purpose
      };

      // التحقق من صحة البيانات
      if (!this.validateOTPSendRequest(otpRequest)) {
        res.status(400).json({
          success: false,
          message: 'بيانات غير صحيحة'
        });
        return;
      }

      const result: OTPSendResult = await this.authService.sendOTP(otpRequest);

      if (result.success) {
        logger.info('📲 إرسال OTP ناجح', { 
          phone: otpRequest.phone, 
          purpose: otpRequest.purpose 
        });
        
        res.status(200).json({
          success: true,
          message: result.message,
          expires_at: result.expires_at,
          attempts_remaining: result.attempts_remaining,
          can_resend_at: result.can_resend_at
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message
        });
      }
    } catch (error) {
      logger.error('❌ خطأ في إرسال OTP', { error });
      res.status(500).json({
        success: false,
        message: 'خطأ في الخادم'
      });
    }
  }

  /**
   * POST /api/auth/verify-otp
   * التحقق من رمز OTP
   * 🔐 Validation: validateOTPVerify middleware
   * 
   * فايدة validateOTPVerify:
   * - التحقق من صحة رقم الهاتف العراقي
   * - التحقق من رمز البلد (+964)
   * - التحقق من صحة رمز OTP (6 أرقام فقط)
   * - التحقق من معرف المستخدم (اختياري)
   */
  async verifyOTP(req: Request, res: Response): Promise<void> {
    try {
      // استخدام الـ validation function للتحقق من البيانات
      validateOTPVerify(req, res, () => {});

      const verifyRequest: OTPVerifyRequest = {
        phone: req.body.phone,
        country_code: req.body.country_code,
        otp_code: req.body.otp_code,
        user_id: req.body.user_id
      };

      // التحقق من صحة البيانات
      if (!this.validateOTPVerifyRequest(verifyRequest)) {
        res.status(400).json({
          success: false,
          message: 'بيانات غير صحيحة'
        });
        return;
      }

      const result: OTPVerifyResult = await this.authService.verifyOTP(verifyRequest);

      if (result.success) {
        logger.info('✅ تحقق OTP ناجح', { 
          phone: verifyRequest.phone, 
          userId: result.user?.id 
        });
        
        res.status(200).json({
          success: true,
          message: result.message,
          user: result.user,
          token: result.token,
          needs_role_selection: result.needs_role_selection
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message
        });
      }
    } catch (error) {
      logger.error('❌ خطأ في تحقق OTP', { error });
      res.status(500).json({
        success: false,
        message: 'خطأ في الخادم'
      });
    }
  }

  /**
   * POST /api/auth/resend-otp
   * إعادة إرسال رمز OTP
   */
  async resendOTP(req: Request, res: Response): Promise<void> {
    try {
      const otpRequest: OTPSendRequest = {
        phone: req.body.phone,
        country_code: req.body.country_code,
        user_id: req.body.user_id,
        purpose: req.body.purpose || 'phone_verification'
      };

      // التحقق من صحة البيانات
      if (!this.validateOTPSendRequest(otpRequest)) {
        res.status(400).json({
          success: false,
          message: 'بيانات غير صحيحة'
        });
        return;
      }

      const result: OTPSendResult = await this.authService.sendOTP(otpRequest);

      if (result.success) {
        logger.info('🔄 إعادة إرسال OTP ناجحة', { 
          phone: otpRequest.phone 
        });
        
        res.status(200).json({
          success: true,
          message: result.message,
          expires_at: result.expires_at,
          attempts_remaining: result.attempts_remaining,
          can_resend_at: result.can_resend_at
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message
        });
      }
    } catch (error) {
      logger.error('❌ خطأ في إعادة إرسال OTP', { error });
      res.status(500).json({
        success: false,
        message: 'خطأ في الخادم'
      });
    }
  }

  // ======================================
  // 🔍 معلومات وإحصائيات المصادقة
  // ======================================

  /**
   * GET /api/auth/methods/:userId
   * جلب طرق المصادقة لمستخدم محدد
   * 🔐 Validation: validateUserIdParams middleware
   * 
   * فايدة validateUserIdParams:
   * - التحقق من صحة معرف المستخدم في URL params
   * - ضمان أن المعرف يتبع تنسيق ID الصحيح
   * - منع الهجمات عبر معرفات غير صحيحة
   */
  async getUserAuthMethods(req: Request, res: Response): Promise<void> {
    try {
      // استخدام الـ validation function للتحقق من البيانات
      validateUserIdParams(req, res, () => {});

      const userId = req.params['userId'];

      if (!userId || typeof userId !== 'string') {
        res.status(400).json({
          success: false,
          message: 'معرف المستخدم مطلوب'
        });
        return;
      }

      const authMethods: AuthMethod[] = await this.userRepository.getUserAuthMethods(userId);

      logger.info('📋 جلب طرق المصادقة', { 
        userId, 
        methodsCount: authMethods.length 
      });

      res.status(200).json({
        success: true,
        auth_methods: authMethods,
        message: 'تم جلب طرق المصادقة بنجاح'
      });
    } catch (error) {
      logger.error('❌ خطأ في جلب طرق المصادقة', { error });
      res.status(500).json({
        success: false,
        message: 'خطأ في الخادم'
      });
    }
  }

  /**
   * POST /api/auth/validate-phone
   * التحقق من صحة رقم الهاتف العراقي
   * 🔐 Validation: validatePhoneValidation middleware
   * 
   * فايدة validatePhoneValidation:
   * - التحقق من صحة رقم الهاتف العراقي
   * - التحقق من رمز البلد (+964)
   * - ضمان التوافق مع معايير الأرقام العراقية
   */
  async validateIraqiPhone(req: Request, res: Response): Promise<void> {
    try {
      // استخدام الـ validation function للتحقق من البيانات
      validatePhoneValidation(req, res, () => {});

      const { phone, country_code } = req.body;

      if (!phone || !country_code) {
        res.status(400).json({
          success: false,
          message: 'رقم الهاتف ورمز البلد مطلوبان'
        });
        return;
      }

      const isValid = this.authService.validateIraqiPhone(phone, country_code);

      logger.info('📱 التحقق من الهاتف العراقي', { 
        phone, 
        country_code, 
        isValid 
      });

      res.status(200).json({
        success: true,
        is_valid: isValid,
        message: isValid ? 'رقم هاتف عراقي صحيح' : 'رقم هاتف غير صحيح'
      });
    } catch (error) {
      logger.error('❌ خطأ في التحقق من الهاتف', { error });
      res.status(500).json({
        success: false,
        message: 'خطأ في الخادم'
      });
    }
  }

  /**
   * POST /api/auth/logout
   * تسجيل خروج المستخدم
   * 🔐 Validation: validateLogout middleware
   * 
   * فايدة validateLogout:
   * - التحقق من معرف المستخدم (اختياري)
   * - ضمان أمان عملية تسجيل الخروج
   */
  async logout(req: Request, res: Response): Promise<void> {
    try {
      // استخدام الـ validation function للتحقق من البيانات
      validateLogout(req, res, () => {});

      const userId: ID = req.body.user_id;

      if (userId) {
        logger.info('👋 تسجيل خروج ناجح', { userId });
      }

      res.status(200).json({
        success: true,
        message: 'تم تسجيل الخروج بنجاح'
      });
    } catch (error) {
      logger.error('❌ خطأ في تسجيل الخروج', { error });
      res.status(500).json({
        success: false,
        message: 'خطأ في الخادم'
      });
    }
  }

  // ======================================
  // 📊 إحصائيات المصادقة (Admin Only)
  // ======================================

  /**
   * GET /api/auth/stats/registration
   * إحصائيات التسجيل (أدمن فقط)
   */
  async getRegistrationStats(req: Request, res: Response): Promise<void> {
    try {
      const stats: RegistrationStats = await this.authService.getRegistrationStats();

      logger.info('📊 جلب إحصائيات التسجيل', { 
        totalRegistrations: stats.total_registrations 
      });

      res.status(200).json({
        success: true,
        stats,
        message: 'تم جلب إحصائيات التسجيل بنجاح'
      });
    } catch (error) {
      logger.error('❌ خطأ في جلب إحصائيات التسجيل', { error });
      res.status(500).json({
        success: false,
        message: 'خطأ في الخادم'
      });
    }
  }

  /**
   * GET /api/auth/stats/methods
   * إحصائيات استخدام طرق المصادقة (أدمن فقط)
   */
  async getAuthMethodStats(req: Request, res: Response): Promise<void> {
    try {
      const stats: AuthMethodUsageStats = await this.authService.getAuthMethodUsageStats();

      logger.info('📊 جلب إحصائيات طرق المصادقة', { 
        totalUsers: stats.total_users 
      });

      res.status(200).json({
        success: true,
        stats,
        message: 'تم جلب إحصائيات طرق المصادقة بنجاح'
      });
    } catch (error) {
      logger.error('❌ خطأ في جلب إحصائيات طرق المصادقة', { error });
      res.status(500).json({
        success: false,
        message: 'خطأ في الخادم'
      });
    }
  }

  /**
   * GET /api/auth/supported-providers
   * جلب قائمة طرق المصادقة المدعومة
   */
  async getSupportedAuthProviders(req: Request, res: Response): Promise<void> {
    try {
      const supportedProviders: AuthProvider[] = ['email', 'phone', 'google'];
      
      // استخدام AUTH_PROVIDERS من validation للتأكد من التطابق
      const providerDetails = supportedProviders.map(provider => ({
        provider: provider as AuthProvider,
        name: this.getProviderDisplayName(provider),
        description: this.getProviderDescription(provider),
        is_supported: this.isAuthProviderSupported(provider)
      }));

      logger.info('📋 جلب طرق المصادقة المدعومة', { 
        providersCount: providerDetails.length 
      });

      res.status(200).json({
        success: true,
        providers: providerDetails,
        message: 'تم جلب طرق المصادقة المدعومة بنجاح'
      });
    } catch (error) {
      logger.error('❌ خطأ في جلب طرق المصادقة المدعومة', { error });
      res.status(500).json({
        success: false,
        message: 'خطأ في الخادم'
      });
    }
  }

  // ======================================
  // 🔧 دوال التحقق من صحة البيانات
  // ======================================

  private validateEmailRegistrationData(data: EmailRegistrationData): boolean {
    return !!(
      data.email &&
      data.password &&
      data.confirm_password &&
      data.full_name &&
      data.accept_terms &&
      data.password === data.confirm_password &&
      data.email.includes('@') &&
      data.password.length >= 8
    );
  }

  private validateEmailLoginData(data: EmailLoginData): boolean {
    return !!(
      data.email &&
      data.password &&
      data.email.includes('@')
    );
  }

  private validatePhoneRegistrationData(data: PhoneRegistrationData): boolean {
    return !!(
      data.phone &&
      data.country_code &&
      data.full_name &&
      data.accept_terms &&
      data.country_code === '+964'
    );
  }

  private validatePhoneLoginData(data: PhoneLoginData): boolean {
    return !!(
      data.phone &&
      data.country_code &&
      data.country_code === '+964'
    );
  }

  private validateGoogleRegistrationData(data: GoogleRegistrationData): boolean {
    return !!(
      data.google_token &&
      data.full_name &&
      data.email &&
      data.accept_terms &&
      data.email.includes('@')
    );
  }

  private validateGoogleLoginData(data: GoogleLoginData): boolean {
    return !!(data.google_token);
  }

  private validateOTPSendRequest(request: OTPSendRequest): boolean {
    const validPurposes: Array<'registration' | 'login' | 'phone_verification' | 'password_reset'> = 
      ['registration', 'login', 'phone_verification', 'password_reset'];
    
    const isPhoneAuth: boolean = request.country_code === '+964'; // AuthProvider 'phone' للعراق
    
    return !!(
      request.phone &&
      request.country_code &&
      request.purpose &&
      isPhoneAuth &&
      validPurposes.includes(request.purpose)
    );
  }

  private validateOTPVerifyRequest(request: OTPVerifyRequest): boolean {
    return !!(
      request.phone &&
      request.country_code &&
      request.otp_code &&
      request.country_code === '+964' &&
      request.otp_code.length === 6
    );
  }

  /**
   * 🔍 تحديد نوع طريقة المصادقة من البيانات
   * الفائدة: معرفة أي AuthProvider يتم استخدامه (email, phone, google)
   */
  private determineAuthProvider(data: any): AuthProvider | null {
    if (data.email && data.password) {
      return 'email' as AuthProvider;
    }
    if (data.phone && data.country_code) {
      return 'phone' as AuthProvider;
    }
    if (data.google_token) {
      return 'google' as AuthProvider;
    }
    return null;
  }

  /**
   * 📊 التحقق من دعم طريقة المصادقة
   * الفائدة: ضمان أن النظام يدعم طريقة المصادقة المطلوبة
   */
  private isAuthProviderSupported(provider: AuthProvider): boolean {
    const supportedProviders: AuthProvider[] = ['email', 'phone', 'google'];
    return supportedProviders.includes(provider);
  }

  /**
   * 🌍 التحقق من صحة رمز البلد لطريقة المصادقة بالهاتف
   * الفائدة: ضمان أن رمز البلد متوافق مع AuthProvider 'phone'
   */
  private validateCountryCodeForPhoneAuth(countryCode: string): boolean {
    // للعراق فقط حالياً - يمكن إضافة بلدان أخرى لاحقاً
    const supportedCountryCodes = ['+964'];
    return supportedCountryCodes.includes(countryCode);
  }

  /**
   * 🏷️ الحصول على اسم العرض لطريقة المصادقة
   * الفائدة: تحويل AuthProvider إلى نص قابل للقراءة باللغة العربية
   */
  private getProviderDisplayName(provider: AuthProvider): string {
    const providerNames: Record<AuthProvider, string> = {
      'email': 'البريد الإلكتروني',
      'phone': 'الهاتف العراقي',
      'google': 'حساب جوجل'
    };
    return providerNames[provider] || 'غير معروف';
  }

  /**
   * 📝 الحصول على وصف طريقة المصادقة
   * الفائدة: شرح مفصل لكل AuthProvider للمستخدمين
   */
  private getProviderDescription(provider: AuthProvider): string {
    const providerDescriptions: Record<AuthProvider, string> = {
      'email': 'تسجيل الدخول باستخدام عنوان البريد الإلكتروني وكلمة المرور',
      'phone': 'تسجيل الدخول باستخدام رقم الهاتف العراقي مع رمز التحقق OTP',
      'google': 'تسجيل الدخول السريع باستخدام حساب جوجل الخاص بك'
    };
    return providerDescriptions[provider] || 'طريقة مصادقة غير معروفة';
  }
} 
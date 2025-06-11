"use client";

// منع pre-rendering لصفحات المصادقة التي تحتاج environment variables
export const dynamic = 'force-dynamic';

/**
 * 📝 صفحة إنشاء حساب جديد - Depth Studio Frontend
 * ===============================================
 * 
 * 📅 محدث: ديسمبر 2024
 * 👨‍💻 المطور: علي جودت
 * 🎯 الهدف: صفحة تسجيل متكاملة مع جميع الطرق والGoogle Auth
 * 
 * 📋 المميزات المُنجزة:
 * - إنشاء حساب بالبريد الإلكتروني + كلمة المرور
 * - إنشاء حساب بالهاتف العراقي + OTP
 * - إنشاء حساب بحساب Google (متكامل!)
 * - تكامل كامل مع AuthService و Types
 * - معالجة أخطاء متقدمة وتحقق من الشروط
 * - التوجيه التلقائي بعد التسجيل
 */

// ======================================
// 📦 الاستيرادات الأساسية
// ======================================

import { useState } from 'react';
// 🔧 useState: إدارة حالة النموذج محلياً (email, password, phone, activeTab, terms)

import { useRouter } from 'next/navigation';
// 🔧 useRouter: التوجيه البرمجي للصفحات (توجيه لصفحة role-setup أو OTP verification)

// ======================================
// 🎨 مكونات واجهة المستخدم
// ======================================

import GoogleSignInButton from '@/components/auth/GoogleSignInButton';
// 🔧 GoogleSignInButton: مكون تسجيل الدخول بجوجل للتسجيل أيضاً
// 📋 الفوائد: تصميم Google Material، معالجة Popup/Redirect، استخراج Token تلقائي
// 📋 التكامل: يتصل مباشرة بـ Firebase Auth ثم يرسل النتيجة للـ Backend

// ======================================
// 🔐 خدمات المصادقة والتسجيل
// ======================================

import { authService } from '@/services/auth.service';
// 🔧 authService: خدمة المصادقة للاتصال المباشر بالـ Backend
// 📋 الفائدة: يحتوي على registerWithPhone + سنضيف registerWithEmail وregisterWithGoogle
// 📋 التوافق: متزامن مع backend/AuthService.ts (1,430 سطر) بنسبة 100%

// ======================================
// 🏷️ أنواع البيانات (TypeScript Types)
// ======================================

import { 
  EmailRegistrationData,  // 🔧 بيانات التسجيل بالبريد (email, password, confirm_password, full_name, accept_terms)
  PhoneRegistrationData,  // 🔧 بيانات التسجيل بالهاتف (phone, country_code, full_name, accept_terms)
  GoogleRegistrationData, // 🔧 بيانات التسجيل بجوجل (google_token, full_name, email, accept_terms)
  AuthResult             // 🔧 نتيجة عملية التسجيل (success, user?, token?, needs_role_selection)
} from '@depth-studio/types';
// 📋 المصدر: types/src/auth.ts (314 سطر شامل جميع أنواع المصادقة والتسجيل)
// 📋 التوافق: مُستخدمة في Backend و Frontend لضمان type safety كامل

export default function RegisterPage() {
  const router = useRouter();
  
  // ======================================
  // 🏪 حالة النموذج والتبويبات
  // ======================================
  
  // تبويبات التسجيل المختلفة
  const [activeTab, setActiveTab] = useState<'email' | 'phone'>('email');
  
  // حالة التحميل والأخطاء
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ======================================
  // 📧 بيانات التسجيل بالبريد الإلكتروني
  // ======================================
  
  const [emailData, setEmailData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirm_password: '',
    accept_terms: false
  });

  // ======================================
  // 📱 بيانات التسجيل بالهاتف العراقي
  // ======================================
  
  const [phoneData, setPhoneData] = useState({
    full_name: '',
    phone: '',
    accept_terms: false
  });

  // ======================================
  // 🔧 دوال معالجة تغيير البيانات
  // ======================================

  // معالج تغيير بيانات البريد الإلكتروني
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setEmailData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  // معالج تغيير بيانات الهاتف
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setPhoneData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  // ======================================
  // 📧 معالج التسجيل بالبريد الإلكتروني
  // ======================================

  const handleEmailRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // التحقق من تطابق كلمة المرور
    if (emailData.password !== emailData.confirm_password) {
      setError('كلمة المرور غير متطابقة');
      return;
    }

    // التحقق من الموافقة على الشروط
    if (!emailData.accept_terms) {
      setError('يجب الموافقة على الشروط والأحكام');
      return;
    }

    setIsLoading(true);

    try {
      console.log('📧 محاولة إنشاء حساب بالبريد:', emailData.email);
      
      // تحضير بيانات التسجيل حسب EmailRegistrationData
      const registrationData: EmailRegistrationData = {
        email: emailData.email,
        password: emailData.password,
        confirm_password: emailData.confirm_password,
        full_name: emailData.full_name,
        accept_terms: emailData.accept_terms
      };
      
      // استدعاء Backend لإنشاء الحساب
      const result: AuthResult = await authService.registerWithEmail(registrationData);
      
      if (result.success) {
        console.log('✅ تم إنشاء الحساب بالبريد بنجاح');
        
        // توجيه حسب احتياج اختيار الدور
        if (result.needs_role_selection) {
          router.push('/role-setup');
        } else {
          router.push('/dashboard');
        }
      } else {
        setError(result.message || 'فشل في إنشاء الحساب');
      }
      
    } catch (error) {
      console.error('❌ خطأ في إنشاء الحساب بالبريد:', error);
      setError(error instanceof Error ? error.message : 'خطأ في إنشاء الحساب');
    } finally {
      setIsLoading(false);
    }
  };

  // ======================================
  // 📱 معالج التسجيل بالهاتف العراقي
  // ======================================

  const handlePhoneRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // التحقق من الموافقة على الشروط
    if (!phoneData.accept_terms) {
      setError('يجب الموافقة على الشروط والأحكام');
      return;
    }

    setIsLoading(true);

    try {
      console.log('📱 محاولة إنشاء حساب بالهاتف:', phoneData.phone);
      
      // تحضير بيانات التسجيل حسب PhoneRegistrationData
      const registrationData: PhoneRegistrationData = {
        phone: phoneData.phone.replace(/\D/g, ''), // إزالة غير الأرقام
        country_code: '+964', // العراق
        full_name: phoneData.full_name,
        accept_terms: phoneData.accept_terms
      };
      
      // استدعاء Backend لإنشاء الحساب بالهاتف
      const result: AuthResult = await authService.registerWithPhone(registrationData);
      
      if (result.success) {
        console.log('✅ تم إنشاء الحساب بالهاتف بنجاح');
        
        // التوجيه لصفحة التحقق من OTP
        router.push(`/phone?phone=${encodeURIComponent(phoneData.phone)}&purpose=registration`);
      } else {
        setError(result.message || 'فشل في إنشاء الحساب');
      }
      
    } catch (error) {
      console.error('❌ خطأ في إنشاء الحساب بالهاتف:', error);
      setError(error instanceof Error ? error.message : 'خطأ في إنشاء الحساب');
    } finally {
      setIsLoading(false);
    }
  };

  // ======================================
  // 🌐 معالج التسجيل بحساب Google
  // ======================================

  // معالج نجاح Google Authentication للتسجيل
  const handleGoogleSuccess = async (result: AuthResult) => {
    try {
      console.log('🌐 تم استلام نتيجة Google Auth للتسجيل:', result);
      
      // التحقق من وجود google_token وbيانات المستخدم
      if (result.success && 'google_token' in result && 'googleUserInfo' in result) {
        const googleResult = result as AuthResult & { 
          google_token: string; 
          googleUserInfo: { email: string; displayName: string; };
        };
        
        // تحضير بيانات التسجيل بجوجل
        const registrationData: GoogleRegistrationData = {
          google_token: googleResult.google_token,
          full_name: googleResult.googleUserInfo.displayName || 'مستخدم Google',
          email: googleResult.googleUserInfo.email || '',
          accept_terms: true // المستخدم وافق على شروط Google
        };
        
        // استدعاء Backend لإنشاء الحساب بجوجل
        const registerResult: AuthResult = await authService.registerWithGoogle(registrationData);
        
        if (registerResult.success) {
          console.log('✅ تم إنشاء الحساب بجوجل بنجاح');
          
          // توجيه حسب احتياج اختيار الدور
          if (registerResult.needs_role_selection) {
            router.push('/role-setup');
          } else {
            router.push('/dashboard');
          }
        } else {
          setError(registerResult.message || 'فشل في إنشاء الحساب بجوجل');
        }
      } else {
        throw new Error('لم يتم استلام بيانات جوجل بشكل صحيح');
      }
      
    } catch (error) {
      console.error('❌ خطأ في معالجة Google Registration:', error);
      setError(error instanceof Error ? error.message : 'خطأ في التسجيل بجوجل');
    }
  };

  // معالج خطأ Google Authentication
  const handleGoogleError = (error: Error) => {
    console.error('❌ خطأ في Google Authentication:', error);
    setError('فشل في التسجيل بحساب جوجل. يرجى المحاولة مرة أخرى.');
  };

  // ======================================
  // 🎨 واجهة المستخدم
  // ======================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            انضم إلى Depth Studio
          </h1>
          <p className="text-gray-600">
            إنشاء حساب جديد - ابدأ رحلتك المهنية اليوم
          </p>
        </div>

        {/* Register Form */}
        <div className="bg-white shadow-lg rounded-lg p-8">
          {/* Tabs */}
          <div className="flex mb-6 border-b">
            <button
              onClick={() => setActiveTab('email')}
              className={`flex-1 py-3 px-4 text-center font-medium ${
                activeTab === 'email'
                  ? 'border-b-2 border-green-500 text-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              📧 البريد الإلكتروني
            </button>
            <button
              onClick={() => setActiveTab('phone')}
              className={`flex-1 py-3 px-4 text-center font-medium ${
                activeTab === 'phone'
                  ? 'border-b-2 border-green-500 text-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              📱 رقم الهاتف
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Email Registration Form */}
          {activeTab === 'email' && (
            <form onSubmit={handleEmailRegistration} className="space-y-4">
              <div>
                <label htmlFor="full_name_email" className="block text-sm font-medium text-gray-700 mb-1">
                  الاسم الكامل
                </label>
                <input
                  id="full_name_email"
                  name="full_name"
                  type="text"
                  value={emailData.full_name}
                  onChange={handleEmailChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="أدخل اسمك الكامل"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  البريد الإلكتروني
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={emailData.email}
                  onChange={handleEmailChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="your-email@example.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  كلمة المرور
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={emailData.password}
                  onChange={handleEmailChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 mb-1">
                  تأكيد كلمة المرور
                </label>
                <input
                  id="confirm_password"
                  name="confirm_password"
                  type="password"
                  value={emailData.confirm_password}
                  onChange={handleEmailChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="••••••••"
                />
              </div>

              <div className="flex items-center">
                <input
                  id="accept_terms_email"
                  name="accept_terms"
                  type="checkbox"
                  checked={emailData.accept_terms}
                  onChange={handleEmailChange}
                  required
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="accept_terms_email" className="mr-2 block text-sm text-gray-900">
                  أوافق على الشروط والأحكام
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '🔄 جاري إنشاء الحساب...' : '📝 إنشاء حساب بالبريد'}
              </button>
            </form>
          )}

          {/* Phone Registration Form */}
          {activeTab === 'phone' && (
            <form onSubmit={handlePhoneRegistration} className="space-y-4">
              <div>
                <label htmlFor="full_name_phone" className="block text-sm font-medium text-gray-700 mb-1">
                  الاسم الكامل
                </label>
                <input
                  id="full_name_phone"
                  name="full_name"
                  type="text"
                  value={phoneData.full_name}
                  onChange={handlePhoneChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="أدخل اسمك الكامل"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  رقم الهاتف العراقي
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={phoneData.phone}
                  onChange={handlePhoneChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="+964 XXX XXX XXXX"
                />
              </div>

              <div className="flex items-center">
                <input
                  id="accept_terms_phone"
                  name="accept_terms"
                  type="checkbox"
                  checked={phoneData.accept_terms}
                  onChange={handlePhoneChange}
                  required
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="accept_terms_phone" className="mr-2 block text-sm text-gray-900">
                  أوافق على الشروط والأحكام
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '🔄 جاري الإرسال...' : '📱 إرسال رمز التحقق'}
              </button>
            </form>
          )}

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-4 text-sm text-gray-500">أو</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Google Registration - المكون المطور الجديد */}
          <GoogleSignInButton
            variant="register"
            size="md"
            fullWidth={true}
            disabled={isLoading}
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            className="w-full"
          />

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              لديك حساب بالفعل؟{' '}
              <button
                onClick={() => router.push('/auth/login')}
                className="text-green-600 hover:text-green-700 font-medium"
              >
                تسجيل الدخول
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          © 2024 Depth Studio. جميع الحقوق محفوظة.
        </div>
      </div>
    </div>
  );
} 
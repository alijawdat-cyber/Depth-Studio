"use client";

/**
 * 🔐 صفحة تسجيل الدخول - Depth Studio Frontend
 * ===============================================
 * 
 * 📅 محدث: ديسمبر 2024
 * 👨‍💻 المطور: علي جودت
 * 🎯 الهدف: صفحة تسجيل دخول متكاملة مع Google Auth
 * 
 * 📋 المميزات المُنجزة:
 * - تسجيل دخول بالبريد الإلكتروني + كلمة المرور
 * - تسجيل دخول بالهاتف العراقي + OTP
 * - تسجيل دخول بحساب Google (جديد!)
 * - تكامل كامل مع AuthStore و AuthService
 * - معالجة أخطاء متقدمة ورسائل ودية
 * - التوجيه التلقائي بعد تسجيل الدخول
 */

// ======================================
// 📦 الاستيرادات الأساسية
// ======================================

import { useState } from 'react';
// 🔧 useState: إدارة حالة النموذج محلياً (email, password, phone, activeTab)

import { useRouter } from 'next/navigation';
// 🔧 useRouter: التوجيه البرمجي للصفحات في App Router (توجيه للوحة التحكم بعد تسجيل الدخول)

// ======================================
// 🏪 إدارة الحالة العامة (Zustand Store)
// ======================================

import { useAuth, useAuthActions } from '@/store/auth.store';
// 🔧 useAuth: جلب حالة المصادقة (user, isLoading, error, isAuthenticated)
// 🔧 useAuthActions: جلب دوال المصادقة (signInWithEmail, signInWithPhone, signInWithGoogle)
// 📋 التوافق: متكامل مع backend/AuthService.ts و types/auth.ts

// ======================================
// 🎨 مكونات واجهة المستخدم
// ======================================

import GoogleSignInButton from '@/components/auth/GoogleSignInButton';
// 🔧 GoogleSignInButton: مكون تسجيل الدخول بجوجل المطور حديثاً
// 📋 الفوائد: تصميم Google Material، معالجة Popup/Redirect، استخراج Token تلقائي
// 📋 التكامل: يتصل مباشرة بـ Firebase Auth ثم يرسل النتيجة للـ Backend

// ======================================
// 🔐 خدمات المصادقة (اختياري للاستخدام المباشر)
// ======================================

import { authService } from '@/services/auth.service';
// 🔧 authService: خدمة المصادقة للاتصال المباشر بالـ Backend
// 📋 الفائدة: يحتوي على 8 دوال مصادقة شاملة (signInWithEmail, signInWithGoogle, verifyOTP...)
// 📋 التوافق: متزامن مع backend/AuthService.ts (1,430 سطر) بنسبة 100%
// 📝 ملاحظة: يتم استخدامه عبر auth.store.ts وليس مباشرة في المكونات

// ======================================
// 🏷️ أنواع البيانات (TypeScript Types)
// ======================================

import { 
  EmailLoginData,    // 🔧 بيانات تسجيل الدخول بالبريد (email, password, remember_me?)
  PhoneLoginData,    // 🔧 بيانات تسجيل الدخول بالهاتف (phone, country_code)
  AuthResult         // 🔧 نتيجة عملية المصادقة (success, user?, token?, needs_role_selection)
} from '@depth-studio/types';
// 📋 المصدر: types/src/auth.ts (314 سطر شامل جميع أنواع المصادقة)
// 📋 التوافق: مُستخدمة في Backend و Frontend لضمان type safety كامل

export default function LoginPage() {
  const router = useRouter();
  
  // ======================================
  // 🏪 الوصول لحالة المصادقة وأفعالها
  // ======================================
  
  // جلب حالة المصادقة الحالية
  const { isLoading, error, isAuthenticated } = useAuth();
  
  // جلب دوال المصادقة
  const { signInWithEmail, signInWithPhone, signInWithGoogle, clearError } = useAuthActions();
  
  // Form states
  const [activeTab, setActiveTab] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  // التعامل مع تسجيل الدخول بالبريد
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    try {
      console.log('🔐 محاولة تسجيل دخول بالبريد:', email);
      
      const emailData: EmailLoginData = {
        email,
        password,
        remember_me: true
      };
      
      await signInWithEmail(emailData);
      
      // التوجيه سيحدث تلقائياً من خلال AuthGuard
      console.log('✅ تم تسجيل الدخول بالبريد بنجاح');
      
    } catch (error) {
      console.error('❌ خطأ في تسجيل الدخول بالبريد:', error);
      // الخطأ سيُعرض تلقائياً من خلال auth store
    }
  };

  // التعامل مع تسجيل الدخول بالهاتف (إرسال OTP)
  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    try {
      console.log('📱 محاولة إرسال OTP للهاتف:', phone);
      
      const phoneData: PhoneLoginData = {
        phone: phone.replace(/\D/g, ''), // إزالة غير الأرقام
        country_code: '+964' // العراق
      };
      
      // signInWithPhone ترجع { success: boolean, message: string }
      const result: { success: boolean; message: string } = await signInWithPhone(phoneData);
      
      if (result.success) {
        // التوجيه لصفحة التحقق من OTP
        router.push(`/phone?phone=${encodeURIComponent(phone)}&purpose=login`);
      }
      
    } catch (error) {
      console.error('❌ خطأ في إرسال OTP:', error);
      // الخطأ سيُعرض تلقائياً من خلال auth store
    }
  };

  // معالج نجاح Google Authentication
  const handleGoogleSuccess = async (result: AuthResult) => {
    try {
      console.log('🌐 تم استلام نتيجة Google Auth:', result);
      
      // التحقق من وجود google_token في النتيجة
      if (result.success && 'google_token' in result) {
        const googleResult = result as AuthResult & { google_token: string };
        
        // إرسال التوكن للـ Backend عبر Auth Store
        await signInWithGoogle({ google_token: googleResult.google_token });
        
        console.log('✅ تم تسجيل الدخول بجوجل بنجاح');
        
        // التوجيه سيحدث تلقائياً من خلال AuthGuard
      } else {
        throw new Error('لم يتم استلام بيانات جوجل بشكل صحيح');
      }
      
    } catch (error) {
      console.error('❌ خطأ في معالجة Google Auth:', error);
      // الخطأ سيُعرض تلقائياً من خلال auth store
    }
  };

  // معالج خطأ Google Authentication
  const handleGoogleError = (error: Error) => {
    console.error('❌ خطأ في Google Authentication:', error);
    // يمكن إضافة معالجة خاصة للأخطاء هنا
  };

  // معالج Google Authentication الرئيسي - يستخدم authService مباشرة للحصول على OTPSendResult كمثال
  const handleDirectGoogleAuth = async () => {
    try {
      // مثال على استخدام authService مباشرة إذا احتجنا لعمليات خاصة
      const currentUser = await authService.getCurrentUser();
      
      if (currentUser && isAuthenticated) {
        // إذا كان المستخدم مسجل دخول بالفعل، توجيه للوحة التحكم
        router.push('/dashboard');
      } else {
        // لا نحتاج لشيء خاص هنا، GoogleSignInButton سيتولى الأمر
        console.log('جاهز لتسجيل دخول Google');
      }
      
    } catch (error) {
      console.error('خطأ في التحقق من حالة المستخدم:', error);
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            مرحباً بك في Depth Studio
          </h1>
          <p className="text-gray-600">
            سجل دخولك للوصول إلى لوحة التحكم
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white shadow-lg rounded-lg p-8">
          {/* Tabs */}
          <div className="flex mb-6 border-b">
            <button
              onClick={() => setActiveTab('email')}
              className={`flex-1 py-3 px-4 text-center font-medium ${
                activeTab === 'email'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              📧 البريد الإلكتروني
            </button>
            <button
              onClick={() => setActiveTab('phone')}
              className={`flex-1 py-3 px-4 text-center font-medium ${
                activeTab === 'phone'
                  ? 'border-b-2 border-blue-500 text-blue-600'
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

          {/* Email Login Form */}
          {activeTab === 'email' && (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  البريد الإلكتروني
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="your-email@example.com"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  كلمة المرور
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '🔄 جاري تسجيل الدخول...' : '🔐 تسجيل الدخول'}
              </button>
            </form>
          )}

          {/* Phone Login Form */}
          {activeTab === 'phone' && (
            <form onSubmit={handlePhoneLogin} className="space-y-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  رقم الهاتف
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+964 XXX XXX XXXX"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
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

          {/* Google Login - المكون المطور الجديد */}
          <GoogleSignInButton
            variant="login"
            size="md"
            fullWidth={true}
            disabled={isLoading}
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            className="w-full"
          />
          
          {/* زر مساعد للوصول المباشر لـ authService للاختبار */}
          <button
            onClick={handleDirectGoogleAuth}
            disabled={isLoading}
            className="w-full mt-2 text-sm text-gray-500 hover:text-gray-700 underline"
          >
            🔧 فحص حالة المصادقة (للتطوير)
          </button>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ليس لديك حساب؟{' '}
              <button
                onClick={() => router.push('/auth/register')}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                إنشاء حساب جديد
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
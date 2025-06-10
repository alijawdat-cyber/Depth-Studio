import { ReactNode } from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'تسجيل الدخول - Depth Studio',
  description: 'منصة إدارة التصوير والمحتوى الرقمي المتطورة',
};

interface AuthLayoutProps {
  children: ReactNode;
}

/**
 * Layout موحد لصفحات المصادقة (تسجيل الدخول والتسجيل)
 * 
 * المميزات:
 * - تصميم متجاوب للموبايل والديسكتوب
 * - دعم للغة العربية مع RTL
 * - خلفية متدرجة احترافية
 * - Card design متطور
 * - تحسين SEO مع metadata
 * - تكامل مع Tailwind CSS
 */
export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4"
      dir="rtl"
    >
      {/* Container الرئيسي */}
      <div className="w-full max-w-md">
        {/* Header للبراند */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Depth Studio
          </h1>
          <p className="text-gray-600">
            منصة إدارة التصوير والمحتوى الرقمي
          </p>
        </div>

        {/* Card للمحتوى */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {children}
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-500">
          © 2024 Depth Studio. جميع الحقوق محفوظة.
        </div>
      </div>
    </div>
  );
} 
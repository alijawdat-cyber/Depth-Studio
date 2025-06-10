/** @type {import('next').NextConfig} */
const nextConfig = {
  // تمكين Image Optimization لـ App Hosting
  images: {
    unoptimized: false, // ✅ تمكين Next.js Image Optimization
  },
  
  // تمكين Quality Checks للإنتاج
  eslint: {
    ignoreDuringBuilds: false, // ✅ تمكين ESLint للجودة
  },
  typescript: {
    ignoreBuildErrors: false, // ✅ تمكين TypeScript checks
  },
  
  // إعدادات تجريبية محسنة
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  
  // Environment Variables للـ Build والRuntime
  env: {
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_DATABASE_URL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
    NEXT_PUBLIC_FCM_VAPID_KEY: process.env.NEXT_PUBLIC_FCM_VAPID_KEY,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
    NEXT_PUBLIC_ENABLE_LOGGING: process.env.NEXT_PUBLIC_ENABLE_LOGGING,
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    NEXT_PUBLIC_FIRESTORE_DATABASE_ID: process.env.NEXT_PUBLIC_FIRESTORE_DATABASE_ID,
    NEXT_PUBLIC_USE_EMULATOR: process.env.NEXT_PUBLIC_USE_EMULATOR
  }
}

module.exports = nextConfig 
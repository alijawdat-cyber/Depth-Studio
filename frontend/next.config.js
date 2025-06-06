/** @type {import('next').NextConfig} */
const nextConfig = {
  // Firebase Hosting configuration
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Enable experimental features if needed
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  // Firebase framework integration
  distDir: '.next',
  // Public runtime configuration - accessible in browser
  publicRuntimeConfig: {
    NEXT_PUBLIC_FIREBASE_API_KEY: 'AIzaSyDHg1-mxejIMPycZJQeE0sZJmWxsimaMFI',
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: 'depth-studio.firebaseapp.com',
    NEXT_PUBLIC_FIREBASE_DATABASE_URL: 'https://depth-studio-default-rtdb.firebaseio.com',
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'depth-studio',
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: 'depth-studio.firebasestorage.app',
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: '584154257700',
    NEXT_PUBLIC_FIREBASE_APP_ID: '1:584154257700:web:b570a34dc3854662c3fbb1',
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: 'G-RY2WLQCK1T',
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: '584154257700-d6vp6d876am0c0loapthj64o4riii6.apps.googleusercontent.com',
    NEXT_PUBLIC_BACKEND_URL: 'https://us-central1-depth-studio.cloudfunctions.net',
    NEXT_PUBLIC_FUNCTIONS_URL: 'https://us-central1-depth-studio.cloudfunctions.net',
    NEXT_PUBLIC_FIRESTORE_DATABASE_ID: 'depth-production',
    NEXT_PUBLIC_APP_ENV: 'production',
    NEXT_PUBLIC_USE_EMULATOR: 'false'
  },
  // Environment variables for build time
  env: {
    NEXT_PUBLIC_FIREBASE_API_KEY: 'AIzaSyDHg1-mxejIMPycZJQeE0sZJmWxsimaMFI',
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: 'depth-studio.firebaseapp.com',
    NEXT_PUBLIC_FIREBASE_DATABASE_URL: 'https://depth-studio-default-rtdb.firebaseio.com',
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'depth-studio',
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: 'depth-studio.firebasestorage.app',
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: '584154257700',
    NEXT_PUBLIC_FIREBASE_APP_ID: '1:584154257700:web:b570a34dc3854662c3fbb1',
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: 'G-RY2WLQCK1T'
  }
}

module.exports = nextConfig 
/**
 * 🔥 Cloud Function للـ Next.js Hosting - Depth Studio
 * ===================================================
 * 
 * هذه الدالة تتعامل مع:
 * ✅ Static files serving
 * ✅ Server-side rendering (SSR)
 * ✅ API routes
 * ✅ Middleware execution
 */

const { onRequest } = require('firebase-functions/v2/https');
const next = require('next');

// إعداد Next.js app
const nextjsDistDir = require('path').join(__dirname, '../hosting/.next');

const nextjsServer = next({
  dev: false,
  conf: {
    distDir: nextjsDistDir,
  },
  customServer: true,
});

const nextjsHandle = nextjsServer.getRequestHandler();

// Cloud Function لخدمة Next.js
exports.nextjsFunc = onRequest(
  {
    memory: '2GiB',
    timeoutSeconds: 300,
    maxInstances: 100,
    minInstances: 0,
    region: 'us-central1',
  },
  async (req, res) => {
    try {
      // تحضير Next.js server إذا لم يكن جاهزاً
      await nextjsServer.prepare();
      
      // تمرير الطلب لـ Next.js
      return await nextjsHandle(req, res);
    } catch (error) {
      console.error('❌ Error in Next.js function:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Something went wrong with the Next.js application'
      });
    }
  }
); 
/**
 * 🧪 صفحة اختبار Firebase Cloud Messaging (FCM)
 */

import { useState } from 'react';
import { messagingService } from '@/lib/messaging';

export default function TestFCM() {
  const [status, setStatus] = useState<string>('جاهز للاختبار');
  const [token, setToken] = useState<string>('');
  const [serviceStatus, setServiceStatus] = useState<any>(null);

  // اختبار تهيئة FCM
  const testFCMInitialization = async () => {
    setStatus('جاري اختبار FCM...');
    
    try {
      const initialized = await messagingService.initialize();
      
      if (initialized) {
        setStatus('✅ تم تهيئة FCM بنجاح!');
        
        // الحصول على حالة الخدمة
        const currentStatus = messagingService.getStatus();
        setServiceStatus(currentStatus);
        
        console.log('📱 FCM Status:', currentStatus);
      } else {
        setStatus('❌ فشل في تهيئة FCM');
      }
    } catch (error) {
      setStatus(`❌ خطأ: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
      console.error('FCM Error:', error);
    }
  };

  // الحصول على Token
  const getToken = async () => {
    setStatus('جاري الحصول على Token...');
    
    try {
      const fcmToken = await messagingService.getDeviceToken();
      
      if (fcmToken) {
        setToken(fcmToken);
        setStatus('✅ تم الحصول على Token بنجاح!');
        console.log('🔑 FCM Token:', fcmToken);
      } else {
        setStatus('❌ لم يتم الحصول على Token');
      }
    } catch (error) {
      setStatus(`❌ خطأ في الحصول على Token: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
    }
  };

  // تسجيل Listener للرسائل
  const setupMessageListener = () => {
    setStatus('جاري تسجيل Listener...');
    
    try {
      const unsubscribe = messagingService.onMessageReceived((payload) => {
        console.log('📨 رسالة واردة:', payload);
        setStatus(`📨 تم استلام رسالة: ${payload.notification?.title || 'بدون عنوان'}`);
      });

      setStatus('✅ تم تسجيل Listener للرسائل');
      
      // حفظ unsubscribe function للاستخدام لاحقاً
      window.fcmUnsubscribe = unsubscribe;
    } catch (error) {
      setStatus(`❌ خطأ في تسجيل Listener: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🧪 اختبار Firebase Cloud Messaging</h1>
      
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <strong>الحالة:</strong> {status}
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button 
          onClick={testFCMInitialization}
          style={{ padding: '10px 20px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          🔄 اختبار التهيئة
        </button>

        <button 
          onClick={getToken}
          style={{ padding: '10px 20px', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          🔑 الحصول على Token
        </button>

        <button 
          onClick={setupMessageListener}
          style={{ padding: '10px 20px', backgroundColor: '#FF9800', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          👂 تسجيل Listener
        </button>
      </div>

      {serviceStatus && (
        <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#e7f3ff', borderRadius: '8px' }}>
          <h3>📊 حالة خدمة FCM:</h3>
          <ul>
            <li><strong>مدعوم:</strong> {serviceStatus.isSupported ? '✅ نعم' : '❌ لا'}</li>
            <li><strong>إذن الإشعارات:</strong> {serviceStatus.hasPermission ? '✅ ممنوح' : '❌ مرفوض'}</li>
            <li><strong>يوجد Token:</strong> {serviceStatus.hasToken ? '✅ نعم' : '❌ لا'}</li>
          </ul>
        </div>
      )}

      {token && (
        <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#fff3cd', borderRadius: '8px' }}>
          <h3>🔑 FCM Token:</h3>
          <textarea 
            value={token} 
            readOnly 
            style={{ width: '100%', height: '80px', fontSize: '12px', fontFamily: 'monospace' }}
          />
          <p style={{ fontSize: '14px', color: '#666' }}>
            انسخ هذا Token لاختبار إرسال الإشعارات من Firebase Console
          </p>
        </div>
      )}

      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <h3>📋 خطوات الاختبار:</h3>
        <ol>
          <li>اضغط "اختبار التهيئة" أولاً</li>
          <li>اضغط "الحصول على Token"</li>
          <li>انسخ Token المعروض</li>
          <li>اذهب إلى Firebase Console → Cloud Messaging</li>
          <li>اضغط "Send your first message"</li>
          <li>املأ العنوان والرسالة</li>
          <li>اختر "Single device" والصق Token</li>
          <li>اضغط "Send"</li>
        </ol>
      </div>
    </div>
  );
}

// TypeScript declaration for global fcmUnsubscribe
declare global {
  interface Window {
    fcmUnsubscribe?: () => void;
  }
} 
/**
 * 🧪 اختبار خدمة رفع الملفات - Depth Studio
 * =========================================
 * 
 * 📅 محدث: ديسمبر 2024
 * 👨‍💻 المطور: علي جودت
 * 🎯 الهدف: اختبار FileUploadService مع Firebase Storage
 */

import { FileUploadService, FileUploadInfo } from '../services/FileUploadService';
import { ContentType } from '../../../types/src/core/enums';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 🎯 دالة إنشاء ملف تجريبي
 */
function createTestFile(): Buffer {
  // إنشاء نص تجريبي بصيغة SVG
  const svgContent = `
<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="200" fill="#4285f4"/>
  <text x="100" y="100" font-family="Arial" font-size="16" 
        fill="white" text-anchor="middle" dy=".3em">
    🎬 Depth Studio Test
  </text>
  <text x="100" y="130" font-family="Arial" font-size="12" 
        fill="white" text-anchor="middle" dy=".3em">
    Firebase Storage تجربة
  </text>
</svg>`.trim();
  
  return Buffer.from(svgContent, 'utf8');
}

/**
 * 🧪 اختبار رفع ملف
 */
async function testFileUpload(): Promise<void> {
  try {
    console.log('🚀 بدء اختبار رفع الملفات...');
    
    // إنشاء خدمة رفع الملفات
    const uploadService = new FileUploadService();
    
    // إنشاء ملف تجريبي
    const testBuffer = createTestFile();
    
    // معلومات الملف التجريبي
    const fileInfo: FileUploadInfo = {
      original_name: 'depth_studio_test.svg',
      file_buffer: testBuffer,
      mime_type: 'image/svg+xml',
      file_size: testBuffer.length,
      content_type: 'graphic_design' as ContentType,
      photographer_id: 'test_photographer_001',
      brand_id: 'test_brand_001',
      campaign_id: 'test_campaign_001'
    };
    
    console.log('📊 معلومات الملف:', {
      اسم_الملف: fileInfo.original_name,
      حجم_الملف: `${fileInfo.file_size} bytes`,
      نوع_المحتوى: fileInfo.content_type,
      نوع_MIME: fileInfo.mime_type
    });
    
    // رفع الملف
    console.log('⬆️  جاري رفع الملف إلى Firebase Storage...');
    const result = await uploadService.uploadFile(fileInfo);
    
    console.log('✅ تم رفع الملف بنجاح!');
    console.log('🔗 رابط الملف:', result.file_url);
    console.log('📁 اسم الملف:', result.filename);
    console.log('📊 تفاصيل إضافية:', {
      حجم_الملف: result.file_size,
      نوع_الملف: result.file_format,
      حالة_المعالجة: result.metadata.processing_status,
      نقاط_الجودة: result.metadata.quality_check.score
    });
    
    return;
    
  } catch (error) {
    console.error('❌ خطأ في رفع الملف:', error);
    
    if (error instanceof Error) {
      console.error('تفاصيل الخطأ:', error.message);
      console.error('Stack trace:', error.stack);
    }
    
    // اقتراحات لحل المشاكل الشائعة
    console.log('\n🔧 اقتراحات لحل المشكلة:');
    console.log('1. تأكد من أن Firebase Admin SDK مُعد صحيحاً');
    console.log('2. تحقق من وجود Service Account Key');
    console.log('3. تأكد من صلاحيات Storage في Firebase');
    console.log('4. تحقق من اتصال الإنترنت');
  }
}

/**
 * 🎯 دالة اختبار بسيطة للاتصال
 */
async function testFirebaseConnection(): Promise<void> {
  try {
    console.log('🔍 اختبار الاتصال بـ Firebase...');
    
    // استيراد إعداد Firebase
    const { app } = await import('../config/firebase');
    
    if (app) {
      console.log('✅ Firebase App متصل بنجاح');
      console.log('📱 معرف التطبيق:', app.name);
    } else {
      console.log('❌ فشل في الاتصال بـ Firebase');
    }
    
  } catch (error) {
    console.error('❌ خطأ في الاتصال:', error);
  }
}

/**
 * 🏃‍♂️ تشغيل الاختبارات
 */
async function runTests(): Promise<void> {
  console.log('🎬 === اختبار Depth Studio - FileUploadService ===\n');
  
  // اختبار الاتصال أولاً
  await testFirebaseConnection();
  console.log('\n' + '='.repeat(50) + '\n');
  
  // اختبار رفع الملف
  await testFileUpload();
  
  console.log('\n🎯 انتهاء الاختبارات');
}

// تشغيل الاختبارات إذا تم استدعاء الملف مباشرة
if (require.main === module) {
  runTests().catch(console.error);
}

export { testFileUpload, testFirebaseConnection, runTests }; 
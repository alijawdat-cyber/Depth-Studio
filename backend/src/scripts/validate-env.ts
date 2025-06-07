#!/usr/bin/env ts-node

/**
 * 🔍 سكربت التحقق من المتغيرات البيئية - Depth Studio
 * 
 * هذا السكربت يتحقق من وجود جميع المتغيرات البيئية المطلوبة
 * لتشغيل التطبيق بشكل آمن وصحيح
 */

// تحميل متغيرات البيئة من ملف .env
import * as dotenv from 'dotenv';
dotenv.config();

import * as fs from 'fs';
import * as path from 'path';

interface EnvironmentVariable {
  name: string;
  required: boolean;
  description: string;
  example?: string;
  sensitive?: boolean;
}

// قائمة المتغيرات المطلوبة
const environmentVariables: EnvironmentVariable[] = [
  // Firebase متغيرات أساسية
  {
    name: 'GOOGLE_APPLICATION_CREDENTIALS',
    required: false, // لأن لدينا fallback
    description: 'مسار ملف Firebase Service Account Key',
    example: '/path/to/serviceAccountKey.json',
    sensitive: true
  },
  {
    name: 'FIREBASE_PROJECT_ID',
    required: false, // لدينا fallback
    description: 'معرف مشروع Firebase',
    example: 'depth-studio'
  },
  {
    name: 'FIREBASE_DATABASE_URL',
    required: false, // لدينا fallback
    description: 'رابط قاعدة البيانات الفعلية',
    example: 'https://depth-studio-default-rtdb.firebaseio.com/'
  },
  {
    name: 'FIREBASE_STORAGE_BUCKET',
    required: false, // لدينا fallback
    description: 'اسم bucket التخزين',
    example: 'depth-studio.firebasestorage.app'
  },
  {
    name: 'FIRESTORE_DATABASE_ID',
    required: false, // لدينا fallback
    description: 'معرف قاعدة بيانات Firestore',
    example: 'depth-production'
  },

  // متغيرات تفعيل الخدمات
  {
    name: 'ENABLE_FCM',
    required: false,
    description: 'تفعيل خدمة الإشعارات FCM',
    example: 'true'
  },
  {
    name: 'ENABLE_PERFORMANCE_MONITORING',
    required: false,
    description: 'تفعيل مراقبة الأداء',
    example: 'true'
  },
  {
    name: 'ENABLE_REMOTE_CONFIG',
    required: false,
    description: 'تفعيل Remote Config',
    example: 'true'
  },

  // متغيرات أمنية (مطلوبة في الإنتاج)
  {
    name: 'JWT_SECRET',
    required: true,
    description: 'مفتاح تشفير JWT للمصادقة',
    example: 'your-super-secret-jwt-key',
    sensitive: true
  },
  {
    name: 'ENCRYPTION_KEY',
    required: true,
    description: 'مفتاح التشفير العام',
    example: 'your-encryption-key-256-bit',
    sensitive: true
  },

  // متغيرات خدمات خارجية
  {
    name: 'SENTRY_DSN',
    required: false,
    description: 'رابط Sentry لمراقبة الأخطاء',
    example: 'https://your-dsn@sentry.io/project-id',
    sensitive: true
  },
  {
    name: 'SENDGRID_API_KEY',
    required: false,
    description: 'مفتاح SendGrid للبريد الإلكتروني',
    example: 'SG.your-sendgrid-key',
    sensitive: true
  },

  // إعدادات البيئة
  {
    name: 'NODE_ENV',
    required: true,
    description: 'نوع البيئة',
    example: 'production'
  },
  {
    name: 'PORT',
    required: false,
    description: 'رقم منفذ الخادم',
    example: '5001'
  }
];

class EnvironmentValidator {
  private errors: string[] = [];
  private warnings: string[] = [];
  private info: string[] = [];

  /**
   * التحقق من جميع المتغيرات
   */
  validate(): boolean {
    console.log('🔍 بدء التحقق من المتغيرات البيئية...\n');

    // التحقق من وجود ملف .env
    this.checkEnvFile();

    // التحقق من كل متغير
    environmentVariables.forEach(variable => {
      this.validateVariable(variable);
    });

    // التحقق من ملف Firebase Service Account
    this.checkFirebaseServiceAccount();

    // طباعة النتائج
    this.printResults();

    return this.errors.length === 0;
  }

  /**
   * التحقق من وجود ملف .env
   */
  private checkEnvFile(): void {
    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      this.info.push('✅ تم العثور على ملف .env');
    } else {
      this.warnings.push('⚠️ لم يتم العثور على ملف .env - سيتم استخدام متغيرات النظام');
    }
  }

  /**
   * التحقق من متغير واحد
   */
  private validateVariable(variable: EnvironmentVariable): void {
    const value = process.env[variable.name];

    if (!value) {
      if (variable.required) {
        this.errors.push(`❌ المتغير المطلوب مفقود: ${variable.name}`);
        this.errors.push(`   📝 الوصف: ${variable.description}`);
        if (variable.example) {
          this.errors.push(`   💡 مثال: ${variable.name}=${variable.example}`);
        }
      } else {
        this.warnings.push(`⚠️ المتغير الاختياري مفقود: ${variable.name}`);
        this.warnings.push(`   📝 الوصف: ${variable.description}`);
      }
    } else {
      // إخفاء القيم الحساسة
      const displayValue = variable.sensitive 
        ? `${value.substring(0, 8)}...` 
        : value;
      
      this.info.push(`✅ ${variable.name}: ${displayValue}`);
    }
  }

  /**
   * التحقق من ملف Firebase Service Account
   */
  private checkFirebaseServiceAccount(): void {
    const possiblePaths = [
      './keys/serviceAccountKey.json',
      '../keys/serviceAccountKey.json',
      '../../backend/keys/serviceAccountKey.json'
    ];

    let found = false;
    for (const filePath of possiblePaths) {
      if (fs.existsSync(filePath)) {
        this.info.push(`✅ تم العثور على Firebase Service Account: ${filePath}`);
        found = true;
        break;
      }
    }

    if (!found && !process.env['GOOGLE_APPLICATION_CREDENTIALS']) {
      this.warnings.push('⚠️ لم يتم العثور على Firebase Service Account Key');
      this.warnings.push('   سيتم استخدام Application Default Credentials');
    }
  }

  /**
   * طباعة النتائج
   */
  private printResults(): void {
    console.log('\n📊 نتائج التحقق:\n');

    if (this.info.length > 0) {
      console.log('✅ المتغيرات الموجودة:');
      this.info.forEach(msg => console.log(`  ${msg}`));
      console.log('');
    }

    if (this.warnings.length > 0) {
      console.log('⚠️ تحذيرات:');
      this.warnings.forEach(msg => console.log(`  ${msg}`));
      console.log('');
    }

    if (this.errors.length > 0) {
      console.log('❌ أخطاء:');
      this.errors.forEach(msg => console.log(`  ${msg}`));
      console.log('');
    }

    // الملخص النهائي
    const isValid = this.errors.length === 0;
    console.log('📋 الملخص:');
    console.log(`  📊 متغيرات موجودة: ${this.info.length}`);
    console.log(`  ⚠️ تحذيرات: ${this.warnings.length}`);
    console.log(`  ❌ أخطاء: ${this.errors.length}`);
    console.log(`  🎯 الحالة: ${isValid ? '✅ جاهز للإنتاج' : '❌ يحتاج إصلاح'}\n`);
  }

  /**
   * إنشاء ملف .env.example
   */
  generateExampleFile(): void {
    const exampleContent = [
      '# ===========================================',
      '# 🔧 متغيرات البيئة - Depth Studio',
      '# ===========================================',
      '# انسخ هذا الملف إلى .env وضع القيم الصحيحة',
      '',
      '# البيئة العامة',
      'NODE_ENV=development',
      'PORT=5001',
      '',
      '# Firebase (اختياري - لدينا fallback)',
      'GOOGLE_APPLICATION_CREDENTIALS=./backend/keys/serviceAccountKey.json',
      'FIREBASE_PROJECT_ID=depth-studio',
      'FIREBASE_DATABASE_URL=https://depth-studio-default-rtdb.firebaseio.com/',
      'FIREBASE_STORAGE_BUCKET=depth-studio.firebasestorage.app',
      'FIRESTORE_DATABASE_ID=depth-production',
      '',
      '# تفعيل الخدمات',
      'ENABLE_FCM=true',
      'ENABLE_PERFORMANCE_MONITORING=true',
      'ENABLE_REMOTE_CONFIG=true',
      '',
      '# الأمان (مطلوب)',
      'JWT_SECRET=your-super-secret-jwt-key-here',
      'ENCRYPTION_KEY=your-256-bit-encryption-key-here',
      '',
      '# خدمات خارجية (اختياري)',
      'SENTRY_DSN=https://your-dsn@sentry.io/project-id',
      'SENDGRID_API_KEY=SG.your-sendgrid-api-key',
      '',
      '# ===========================================',
      '# ⚠️ تذكير: لا تضع القيم الحقيقية في هذا الملف!',
      '# استخدم .env للقيم الفعلية',
      '# ==========================================='
    ];

    const examplePath = path.join(process.cwd(), '.env.example');
    fs.writeFileSync(examplePath, exampleContent.join('\n'));
    console.log(`✅ تم إنشاء ملف .env.example في: ${examplePath}`);
  }
}

// تشغيل السكربت
if (require.main === module) {
  const validator = new EnvironmentValidator();
  const isValid = validator.validate();

  // إنشاء ملف .env.example إذا لم يكن موجود
  const examplePath = path.join(process.cwd(), '.env.example');
  if (!fs.existsSync(examplePath)) {
    validator.generateExampleFile();
  }

  // الخروج بحالة الخطأ إذا لم يمر التحقق
  process.exit(isValid ? 0 : 1);
}

export default EnvironmentValidator; 
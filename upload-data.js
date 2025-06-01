const fs = require('fs');
const { execSync } = require('child_process');

// قراءة البيانات من ملف JSON
const seedData = JSON.parse(fs.readFileSync('seed-data.json', 'utf8'));

console.log('🌱 بدء عملية رفع البيانات الأولية إلى Firestore...\n');

try {
  // كتابة جميع البيانات في ملف واحد لرفعها مرة واحدة
  const allDataFile = 'all-seed-data.json';
  fs.writeFileSync(allDataFile, JSON.stringify(seedData, null, 2));
  
  console.log('📂 رفع جميع المجموعات...');
  
  // رفع البيانات باستخدام Firebase CLI
  const command = `firebase firestore:import ${allDataFile} --project depth-studio`;
  execSync(command, { stdio: 'inherit' });
  
  console.log('✅ تم رفع جميع البيانات بنجاح!\n');
  
  // حذف الملف المؤقت
  fs.unlinkSync(allDataFile);
  
  // عرض ملخص البيانات المرفوعة
  console.log('📋 ملخص البيانات المرفوعة:');
  Object.keys(seedData).forEach(collectionName => {
    const documentsCount = Object.keys(seedData[collectionName]).length;
    console.log(`- ${collectionName}: ${documentsCount} وثيقة`);
  });
  
} catch (error) {
  console.error('❌ خطأ في رفع البيانات:', error.message);
}

console.log('\n🎉 تم الانتهاء من عملية رفع البيانات!'); 
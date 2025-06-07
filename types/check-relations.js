const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://depth-studio-default-rtdb.firebaseio.com/'
});

const db = admin.firestore();
db.settings({ databaseId: 'depth-production' });

async function analyzeRelations() {
  console.log('🔍 فحص العلاقات بين المجموعات:\n');
  
  try {
    // فحص عينة من users
    const users = await db.collection('users').limit(2).get();
    console.log('👥 Users Sample:');
    users.docs.forEach(doc => {
      const data = doc.data();
      console.log(`  📄 ${doc.id} - Role: ${data.primary_role} - Email: ${data.email}`);
    });
    
    // فحص brands وعلاقتها
    const brands = await db.collection('brands').limit(2).get();
    console.log('\n🏢 Brands Sample:');
    brands.docs.forEach(doc => {
      const data = doc.data();
      console.log(`  📄 ${doc.id} - Name: ${data.name} - Coordinator: ${data.assigned_coordinator}`);
    });
    
    // فحص campaigns وعلاقتها
    const campaigns = await db.collection('campaigns').limit(2).get();
    console.log('\n🎯 Campaigns Sample:');
    campaigns.docs.forEach(doc => {
      const data = doc.data();
      console.log(`  📄 ${doc.id} - Brand: ${data.brand_id} - Created by: ${data.created_by}`);
    });
    
    // فحص content وعلاقتها
    const content = await db.collection('content').limit(2).get();
    console.log('\n📁 Content Sample:');
    content.docs.forEach(doc => {
      const data = doc.data();
      console.log(`  📄 ${doc.id} - Campaign: ${data.campaign_id} - Photographer: ${data.photographer_id}`);
    });
    
    // فحص المجموعات الجديدة
    const authMethods = await db.collection('auth_methods').limit(1).get();
    console.log('\n🔐 Auth Methods Sample:');
    authMethods.docs.forEach(doc => {
      const data = doc.data();
      console.log(`  📄 ${doc.id} - Type: ${data.type} - Verified: ${data.verified}`);
    });
    
    const roleApps = await db.collection('role_applications').limit(1).get();
    console.log('\n🎭 Role Applications Sample:');
    roleApps.docs.forEach(doc => {
      const data = doc.data();
      console.log(`  📄 ${doc.id} - User: ${data.user_id} - Role: ${data.selected_role} - Status: ${data.status}`);
    });
    
    const phoneVerif = await db.collection('phone_verifications').limit(1).get();
    console.log('\n📱 Phone Verifications Sample:');
    phoneVerif.docs.forEach(doc => {
      const data = doc.data();
      console.log(`  📄 ${doc.id} - Phone: ${data.phone} - Country: ${data.country_code} - Verified: ${data.verified}`);
    });
    
    console.log('\n📊 تحليل العلاقات:');
    console.log('✅ Users → Brands (assigned_coordinator)');
    console.log('✅ Users → Campaigns (created_by)');
    console.log('✅ Brands → Campaigns (brand_id)');
    console.log('✅ Campaigns → Content (campaign_id)');
    console.log('✅ Users → Content (photographer_id)');
    console.log('✅ Users → Auth Methods (user_id)');
    console.log('✅ Users → Role Applications (user_id)');
    console.log('✅ Users → Phone Verifications (user_id)');
    
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  }
  
  process.exit(0);
}

analyzeRelations(); 
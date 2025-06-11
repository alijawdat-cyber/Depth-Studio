# 🎯 دليل الـ API Endpoints - نظام Depth Studio

## 🌐 الرابط الأساسي
```
https://us-central1-depth-studio.cloudfunctions.net/api
```

## 📋 فهرس الأنظمة

1. [🔐 نظام المصادقة (Authentication)](#auth-system)
2. [👥 نظام اختيار الأدوار (Role Selection)](#role-system)
3. [👤 نظام المستخدمين (Users)](#users-system)
4. [🏢 نظام البراندات (Brands)](#brands-system)
5. [📋 نظام الحملات (Campaigns)](#campaigns-system)
6. [🎨 نظام المحتوى (Content)](#content-system)
7. [💸 نظام المدفوعات (Payments)](#payments-system)
8. [🛠️ نظام المعدات (Equipment)](#equipment-system)
9. [🔔 نظام الإشعارات (Notifications)](#notifications-system)
10. [🏥 نظام الصحة (Health Check)](#health-system)

---

## 🔐 نظام المصادقة (Authentication) {#auth-system}

### 📧 تسجيل بالإيميل
```bash
curl -X POST "https://us-central1-depth-studio.cloudfunctions.net/api/api/auth/register/email" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "confirm_password": "SecurePass123!",
    "full_name": "أحمد محمد العراقي",
    "phone": "+9647701234567",
    "accept_terms": true
  }'
```

### 📱 تسجيل بالهاتف
```bash
curl -X POST "https://us-central1-depth-studio.cloudfunctions.net/api/api/auth/register/phone" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+9647701234567",
    "country_code": "+964",
    "full_name": "سارة أحمد العراقية",
    "accept_terms": true
  }'
```

### 🔐 تسجيل دخول بالإيميل
```bash
curl -X POST "https://us-central1-depth-studio.cloudfunctions.net/api/api/auth/login/email" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'
```

### 📱 تسجيل دخول بالهاتف
```bash
curl -X POST "https://us-central1-depth-studio.cloudfunctions.net/api/api/auth/login/phone" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+9647701234567",
    "country_code": "+964"
  }'
```

### 🔍 التحقق من رقم الهاتف
```bash
curl -X POST "https://us-central1-depth-studio.cloudfunctions.net/api/api/auth/validate-phone" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+9647701234567",
    "country_code": "+964"
  }'
```

### 📨 إرسال رمز التحقق
```bash
curl -X POST "https://us-central1-depth-studio.cloudfunctions.net/api/api/auth/send-otp" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+9647701234567",
    "country_code": "+964"
  }'
```

### ✅ التحقق من رمز OTP
```bash
curl -X POST "https://us-central1-depth-studio.cloudfunctions.net/api/api/auth/verify-otp" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+9647701234567",
    "otp": "123456"
  }'
```

---

## 👥 نظام اختيار الأدوار (Role Selection) {#role-system}

### 📝 تقديم طلب دور
```bash
curl -X POST "https://us-central1-depth-studio.cloudfunctions.net/api/api/roles/submit" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "role": "photographer",
    "experience": "3 years",
    "portfolio_url": "https://portfolio.com",
    "specializations": ["wedding", "commercial"]
  }'
```

### 🔍 البحث في البراندات
```bash
curl -X GET "https://us-central1-depth-studio.cloudfunctions.net/api/api/roles/brands/search?keyword=مطعم&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 📋 الطلبات المعلقة (للأدمن)
```bash
curl -X GET "https://us-central1-depth-studio.cloudfunctions.net/api/api/roles/pending-applications?page=1&limit=10" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### ✅ الموافقة على طلب
```bash
curl -X POST "https://us-central1-depth-studio.cloudfunctions.net/api/api/roles/approve" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "application_id": "app123",
    "admin_notes": "مصور محترف، مقبول"
  }'
```

### ❌ رفض طلب
```bash
curl -X POST "https://us-central1-depth-studio.cloudfunctions.net/api/api/roles/reject" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "application_id": "app123",
    "rejection_reason": "not_qualified",
    "admin_notes": "يحتاج لمزيد من الخبرة"
  }'
```

---

## 👤 نظام المستخدمين (Users) {#users-system}

### 👤 إنشاء مستخدم جديد
```bash
curl -X POST "https://us-central1-depth-studio.cloudfunctions.net/api/api/users" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "email": "newuser@example.com",
    "first_name": "خالد",
    "last_name": "عبدالله",
    "role": "photographer",
    "phone": "+9647701234567"
  }'
```

### 📋 جلب جميع المستخدمين
```bash
curl -X GET "https://us-central1-depth-studio.cloudfunctions.net/api/api/users?page=1&limit=10" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### 👤 جلب مستخدم محدد
```bash
curl -X GET "https://us-central1-depth-studio.cloudfunctions.net/api/api/users/USER_ID" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### ✏️ تحديث مستخدم
```bash
curl -X PUT "https://us-central1-depth-studio.cloudfunctions.net/api/api/users/USER_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "first_name": "خالد الجديد",
    "bio": "مصور محترف متخصص في التصوير التجاري"
  }'
```

### 🗑️ حذف مستخدم
```bash
curl -X DELETE "https://us-central1-depth-studio.cloudfunctions.net/api/api/users/USER_ID" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### 🔍 البحث في المستخدمين
```bash
curl -X GET "https://us-central1-depth-studio.cloudfunctions.net/api/api/users/search?keyword=أحمد&role=photographer&page=1&limit=10" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### 📊 إحصائيات المستخدمين
```bash
curl -X GET "https://us-central1-depth-studio.cloudfunctions.net/api/api/users/stats" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

## 🏢 نظام البراندات (Brands) {#brands-system}

### 🏢 إنشاء براند جديد
```bash
curl -X POST "https://us-central1-depth-studio.cloudfunctions.net/api/api/brands" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "name": "مطعم السلطان",
    "description": "مطعم عراقي أصيل",
    "industry": "food_beverage",
    "type": "restaurant",
    "contact_email": "info@sultan-restaurant.com",
    "phone": "+9647701234567",
    "location": "بغداد - الكرادة"
  }'
```

### 📋 جلب جميع البراندات
```bash
curl -X GET "https://us-central1-depth-studio.cloudfunctions.net/api/api/brands?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 🏢 جلب براند محدد
```bash
curl -X GET "https://us-central1-depth-studio.cloudfunctions.net/api/api/brands/BRAND_ID" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### ✏️ تحديث براند
```bash
curl -X PUT "https://us-central1-depth-studio.cloudfunctions.net/api/api/brands/BRAND_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "description": "أفضل مطعم عراقي في بغداد",
    "website": "https://sultan-restaurant.com"
  }'
```

### 🗑️ حذف براند
```bash
curl -X DELETE "https://us-central1-depth-studio.cloudfunctions.net/api/api/brands/BRAND_ID" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### 🔍 البحث في البراندات
```bash
curl -X GET "https://us-central1-depth-studio.cloudfunctions.net/api/api/brands/search?keyword=مطعم&industry=food_beverage&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 📊 إحصائيات البراندات
```bash
curl -X GET "https://us-central1-depth-studio.cloudfunctions.net/api/api/brands/stats" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

## 📋 نظام الحملات (Campaigns) {#campaigns-system}

### 📋 إنشاء حملة جديدة
```bash
curl -X POST "https://us-central1-depth-studio.cloudfunctions.net/api/api/campaigns" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer BRAND_TOKEN" \
  -d '{
    "title": "حملة صيف 2024",
    "description": "تصوير منتجات صيفية جديدة",
    "brand_id": "BRAND_ID",
    "budget": 5000,
    "start_date": "2024-06-01",
    "end_date": "2024-06-30",
    "requirements": {
      "photography_type": "product",
      "deliverables": 20,
      "style": "modern"
    }
  }'
```

### 📋 جلب جميع الحملات
```bash
curl -X GET "https://us-central1-depth-studio.cloudfunctions.net/api/api/campaigns?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 📋 جلب حملة محددة
```bash
curl -X GET "https://us-central1-depth-studio.cloudfunctions.net/api/api/campaigns/CAMPAIGN_ID" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### ✏️ تحديث حملة
```bash
curl -X PUT "https://us-central1-depth-studio.cloudfunctions.net/api/api/campaigns/CAMPAIGN_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer BRAND_TOKEN" \
  -d '{
    "description": "تصوير منتجات صيفية وشتوية",
    "budget": 6000
  }'
```

### 🔄 تحديث حالة الحملة
```bash
curl -X PATCH "https://us-central1-depth-studio.cloudfunctions.net/api/api/campaigns/CAMPAIGN_ID/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "status": "active",
    "notes": "تم بدء الحملة بنجاح"
  }'
```

### 👨‍💻 تعيين مصور للحملة
```bash
curl -X PATCH "https://us-central1-depth-studio.cloudfunctions.net/api/api/campaigns/CAMPAIGN_ID/photographer" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "photographer_id": "PHOTOGRAPHER_ID",
    "assignment_notes": "مصور متخصص في التصوير التجاري"
  }'
```

---

## 🎨 نظام المحتوى (Content) {#content-system}

### 📤 رفع محتوى جديد
```bash
curl -X POST "https://us-central1-depth-studio.cloudfunctions.net/api/api/content" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer PHOTOGRAPHER_TOKEN" \
  -d '{
    "campaign_id": "CAMPAIGN_ID",
    "title": "صور المنتجات الصيفية",
    "description": "مجموعة صور للمنتجات الجديدة",
    "type": "image",
    "category": "product_photography",
    "file_urls": ["https://example.com/image1.jpg", "https://example.com/image2.jpg"],
    "metadata": {
      "resolution": "4K",
      "format": "JPG"
    }
  }'
```

### 📄 جلب محتوى محدد
```bash
curl -X GET "https://us-central1-depth-studio.cloudfunctions.net/api/api/content/CONTENT_ID" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### ✅ الموافقة على محتوى
```bash
curl -X PATCH "https://us-central1-depth-studio.cloudfunctions.net/api/api/content/CONTENT_ID/approve" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer BRAND_TOKEN" \
  -d '{
    "approval_notes": "محتوى ممتاز ومطابق للمطلوب"
  }'
```

### ❌ رفض محتوى
```bash
curl -X PATCH "https://us-central1-depth-studio.cloudfunctions.net/api/api/content/CONTENT_ID/reject" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer BRAND_TOKEN" \
  -d '{
    "rejection_reason": "poor_quality",
    "feedback": "جودة الصور غير مناسبة، يرجى إعادة التصوير"
  }'
```

### 🔄 طلب تعديل على محتوى
```bash
curl -X PATCH "https://us-central1-depth-studio.cloudfunctions.net/api/api/content/CONTENT_ID/revision" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer BRAND_TOKEN" \
  -d '{
    "revision_notes": "يرجى تعديل الإضاءة في الصورة الثالثة",
    "priority": "medium"
  }'
```

---

## 💸 نظام المدفوعات (Payments) {#payments-system}

### 💳 إنشاء دفعة جديدة
```bash
curl -X POST "https://us-central1-depth-studio.cloudfunctions.net/api/api/payments" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "campaign_id": "CAMPAIGN_ID",
    "photographer_id": "PHOTOGRAPHER_ID",
    "amount": 1500,
    "currency": "USD",
    "payment_type": "milestone",
    "description": "دفعة أولى لحملة الصيف"
  }'
```

### 💰 جلب دفعات المصور
```bash
curl -X GET "https://us-central1-depth-studio.cloudfunctions.net/api/api/payments/photographer/PHOTOGRAPHER_ID?page=1&limit=10" \
  -H "Authorization: Bearer PHOTOGRAPHER_TOKEN"
```

### ✅ تأكيد الدفع
```bash
curl -X PATCH "https://us-central1-depth-studio.cloudfunctions.net/api/api/payments/PAYMENT_ID/confirm" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "transaction_id": "TXN123456",
    "payment_method": "bank_transfer",
    "confirmation_notes": "تم التحويل بنجاح"
  }'
```

---

## 🛠️ نظام المعدات (Equipment) {#equipment-system}

### 🛠️ إضافة معدة جديدة
```bash
curl -X POST "https://us-central1-depth-studio.cloudfunctions.net/api/api/equipment" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "name": "Canon EOS R5",
    "type": "camera",
    "brand": "Canon",
    "model": "EOS R5",
    "category": "professional_camera",
    "rental_price_per_day": 100,
    "purchase_price": 3500,
    "specifications": {
      "resolution": "45MP",
      "video": "8K",
      "weight": "738g"
    }
  }'
```

### 📋 جلب جميع المعدات
```bash
curl -X GET "https://us-central1-depth-studio.cloudfunctions.net/api/api/equipment?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 🎯 تخصيص معدة لمصور
```bash
curl -X POST "https://us-central1-depth-studio.cloudfunctions.net/api/api/equipment/EQUIPMENT_ID/assign" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "photographer_id": "PHOTOGRAPHER_ID",
    "campaign_id": "CAMPAIGN_ID",
    "assignment_date": "2024-06-01",
    "return_date": "2024-06-05",
    "notes": "للاستخدام في تصوير المنتجات"
  }'
```

---

## 🔔 نظام الإشعارات (Notifications) {#notifications-system}

### 📤 إرسال إشعار
```bash
curl -X POST "https://us-central1-depth-studio.cloudfunctions.net/api/api/notifications" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "recipient_id": "USER_ID",
    "title": "حملة جديدة متاحة",
    "message": "تم إضافة حملة تصوير جديدة تناسب تخصصك",
    "type": "campaign_notification",
    "priority": "medium",
    "action_required": true,
    "action_url": "/campaigns/CAMPAIGN_ID"
  }'
```

### 📖 تعليم إشعار كمقروء
```bash
curl -X PATCH "https://us-central1-depth-studio.cloudfunctions.net/api/api/notifications/NOTIFICATION_ID/read" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 🔍 جلب إشعارات المستخدم
```bash
curl -X GET "https://us-central1-depth-studio.cloudfunctions.net/api/api/notifications?page=1&limit=10&is_read=false" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🏥 نظام الصحة (Health Check) {#health-system}

### 🏥 فحص صحة النظام
```bash
curl -X GET "https://us-central1-depth-studio.cloudfunctions.net/api/health"
```

---

## 🧪 طرق الاختبار

### 1. استخدام curl (Terminal)
```bash
# تشغيل الأمثلة أعلاه مباشرة في Terminal
```

### 2. استخدام Postman
1. استيراد الـ collection من الملف المرفق
2. تعديل متغيرات البيئة (BASE_URL, TOKEN)
3. تشغيل الاختبارات

### 3. استخدام Browser
```
https://us-central1-depth-studio.cloudfunctions.net/api
```

---

## 🔑 Authentication Headers

جميع الـ endpoints المحمية تحتاج:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

## 📊 Response Format

### ✅ Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "تم بنجاح"
}
```

### ❌ Error Response
```json
{
  "success": false,
  "message": "خطأ في البيانات",
  "errors": [
    {
      "field": "email",
      "message": "الإيميل مطلوب",
      "code": "required"
    }
  ],
  "error_count": 1
}
```

---

## 📞 دعم ومساعدة

- **API Documentation**: https://docs.depthstudio.app
- **Development Info**: https://us-central1-depth-studio.cloudfunctions.net/devInfo
- **Health Check**: https://us-central1-depth-studio.cloudfunctions.net/api/health 
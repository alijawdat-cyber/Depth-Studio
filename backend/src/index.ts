/**
 * 🚀 Firebase Functions - Depth Studio
 * ====================================
 * 
 * 📅 محدث: ديسمبر 2024
 * 👨‍💻 المطور: علي جودت
 * 🎯 الهدف: API endpoints للنظام الكامل
 */

import * as functions from "firebase-functions";
import express from "express";
import cors from "cors";
import { UserController } from "./controllers/UserController";
import { BrandController } from "./controllers/BrandController";
import { CampaignController } from "./controllers/CampaignController";
import { ContentController } from "./controllers/ContentController";
import { PaymentController } from "./controllers/PaymentController";
import { EquipmentController } from "./controllers/EquipmentController";
import { NotificationController } from "./controllers/NotificationController";
import { AuthController } from "./controllers/AuthController";
import { RoleSelectionController } from "./controllers/RoleSelectionController";
import { services } from "./services";
import { logger } from "firebase-functions";

// Import validators
import { validateSearchUsers } from "./validators/UserValidators";
import { validateSearchBrands } from "./validators/BrandValidators";

// إنشاء Express app
const app = express();

// Middleware
app.use(cors({ origin: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// إنشاء Controllers
const userController = new UserController();
const brandController = new BrandController();
const campaignController = new CampaignController(services.campaigns);
const contentController = new ContentController(services.content);
const paymentController = new PaymentController();
const equipmentController = new EquipmentController();
const notificationController = new NotificationController();
const authController = new AuthController();
const roleSelectionController = new RoleSelectionController();

// ======================================
// 🏠 Routes الأساسية
// ======================================

/**
 * 📋 معلومات API
 */
app.get("/", (req, res) => {
  res.json({
    message: "🎯 Depth Studio API - Backend System",
    version: "2.0.0",
    environment: process.env["NODE_ENV"] || "development",
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: "/api/auth",
      roles: "/api/roles",
      users: "/api/users",
      brands: "/api/brands",
      campaigns: "/api/campaigns",
      content: "/api/content",
      payments: "/api/payments",
      equipment: "/api/equipment",
      notifications: "/api/notifications",
      health: "/health"
    }
  });
});

/**
 * 🏥 Health Check
 */
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    services: {
      firebase: "connected",
      firestore: "connected"
    }
  });
});

// ======================================
// 🔐 Authentication Routes
// ======================================

/**
 * 📧 تسجيل مستخدم جديد بالبريد الإلكتروني
 * POST /api/auth/register/email
 */
app.post("/api/auth/register/email", async (req, res) => {
  await authController.registerWithEmail(req, res);
});

/**
 * 🔑 تسجيل دخول بالبريد الإلكتروني
 * POST /api/auth/login/email
 */
app.post("/api/auth/login/email", async (req, res) => {
  await authController.loginWithEmail(req, res);
});

/**
 * 📱 تسجيل مستخدم جديد بالهاتف العراقي
 * POST /api/auth/register/phone
 */
app.post("/api/auth/register/phone", async (req, res) => {
  await authController.registerWithPhone(req, res);
});

/**
 * 📲 تسجيل دخول بالهاتف العراقي (يرسل OTP)
 * POST /api/auth/login/phone
 */
app.post("/api/auth/login/phone", async (req, res) => {
  await authController.loginWithPhone(req, res);
});

/**
 * 🌐 تسجيل مستخدم جديد بحساب جوجل
 * POST /api/auth/register/google
 */
app.post("/api/auth/register/google", async (req, res) => {
  await authController.registerWithGoogle(req, res);
});

/**
 * 🌍 تسجيل دخول بحساب جوجل
 * POST /api/auth/login/google
 */
app.post("/api/auth/login/google", async (req, res) => {
  await authController.loginWithGoogle(req, res);
});

/**
 * 📲 إرسال رمز OTP للهاتف العراقي
 * POST /api/auth/send-otp
 */
app.post("/api/auth/send-otp", async (req, res) => {
  await authController.sendOTP(req, res);
});

/**
 * ✅ التحقق من رمز OTP
 * POST /api/auth/verify-otp
 */
app.post("/api/auth/verify-otp", async (req, res) => {
  await authController.verifyOTP(req, res);
});

/**
 * 🔄 إعادة إرسال رمز OTP
 * POST /api/auth/resend-otp
 */
app.post("/api/auth/resend-otp", async (req, res) => {
  await authController.resendOTP(req, res);
});

/**
 * 📋 جلب طرق المصادقة لمستخدم محدد
 * GET /api/auth/methods/:userId
 */
app.get("/api/auth/methods/:userId", async (req, res) => {
  await authController.getUserAuthMethods(req, res);
});

/**
 * 🔍 التحقق من صحة رقم الهاتف العراقي
 * POST /api/auth/validate-phone
 */
app.post("/api/auth/validate-phone", async (req, res) => {
  await authController.validateIraqiPhone(req, res);
});

/**
 * 👋 تسجيل خروج المستخدم
 * POST /api/auth/logout
 */
app.post("/api/auth/logout", async (req, res) => {
  await authController.logout(req, res);
});

/**
 * 📊 إحصائيات التسجيل (أدمن فقط)
 * GET /api/auth/stats/registration
 */
app.get("/api/auth/stats/registration", async (req, res) => {
  await authController.getRegistrationStats(req, res);
});

/**
 * 📈 إحصائيات استخدام طرق المصادقة (أدمن فقط)
 * GET /api/auth/stats/methods
 */
app.get("/api/auth/stats/methods", async (req, res) => {
  await authController.getAuthMethodStats(req, res);
});

// ======================================
// 🎭 Role Selection Routes
// ======================================

/**
 * 🎯 تقديم طلب اختيار دور جديد
 * POST /api/roles/:user_id/select
 */
app.post("/api/roles/:user_id/select", async (req, res) => {
  await roleSelectionController.submitRoleSelection(req, res);
});

/**
 * 🔍 البحث عن البراندات لمنسقي البراند
 * GET /api/roles/brands/search
 */
app.get("/api/roles/brands/search", async (req, res) => {
  await roleSelectionController.searchBrandsForCoordinator(req, res);
});

/**
 * 📋 أنواع العقود المتاحة للمصورين
 * GET /api/roles/photographer/contract-types
 */
app.get("/api/roles/photographer/contract-types", async (req, res) => {
  await roleSelectionController.getContractTypesForPhotographer(req, res);
});

/**
 * 📄 طلبات الأدوار المنتظرة موافقة (أدمن فقط)
 * GET /api/roles/pending-applications
 */
app.get("/api/roles/pending-applications", async (req, res) => {
  await roleSelectionController.getPendingRoleApplications(req, res);
});

/**
 * ✅ الموافقة على طلب اختيار دور (أدمن فقط)
 * PATCH /api/roles/applications/:id/approve
 */
app.patch("/api/roles/applications/:id/approve", async (req, res) => {
  await roleSelectionController.approveRoleApplication(req, res);
});

/**
 * ❌ رفض طلب اختيار دور مع الأسباب (أدمن فقط)
 * PATCH /api/roles/applications/:id/reject
 */
app.patch("/api/roles/applications/:id/reject", async (req, res) => {
  await roleSelectionController.rejectRoleApplication(req, res);
});

/**
 * 📊 إحصائيات اختيار الأدوار الشاملة (أدمن فقط)
 * GET /api/roles/selection-stats
 */
app.get("/api/roles/selection-stats", async (req, res) => {
  await roleSelectionController.getRoleSelectionStats(req, res);
});

/**
 * 👤 حالة اختيار دور المستخدم
 * GET /api/roles/user/:userId/status
 */
app.get("/api/roles/user/:userId/status", async (req, res) => {
  await roleSelectionController.getUserRoleSelectionStatus(req, res);
});

// ======================================
// 👥 User Routes
// ======================================

/**
 * 📝 إنشاء مستخدم جديد
 * POST /api/users
 */
app.post("/api/users", async (req, res) => {
  await userController.createUser(req, res);
});

/**
 * 🔍 جلب مستخدم
 * GET /api/users?id=xxx&email=xxx&firebaseUid=xxx
 */
app.get("/api/users", async (req, res) => {
  await userController.getUser(req, res);
});

/**
 * ✅ الموافقة على مستخدم
 * PATCH /api/users/:userId/approve
 */
app.patch("/api/users/:userId/approve", async (req, res) => {
  await userController.approveUser(req, res);
});

/**
 * 🔍 البحث عن مستخدم واحد
 * GET /api/users/get
 */
app.get("/api/users/get", async (req, res) => {
  await userController.getUser(req, res);
});

/**
 * 🔑 تحديث دور المستخدم
 * PATCH /api/users/:userId/role
 */
app.patch("/api/users/:userId/role", async (req, res) => {
  await userController.updateUserRole(req, res);
});

/**
 * 🔍 البحث في المستخدمين
 * GET /api/users/search
 */
app.get("/api/users/search", validateSearchUsers, async (req, res) => {
  await userController.searchUsers(req, res);
});

/**
 * 📊 إحصائيات المستخدمين
 * GET /api/users/stats
 */
app.get("/api/users/stats", async (req, res) => {
  await userController.getUserStats(req, res);
});

/**
 * 🔐 التحقق من صلاحية
 * GET /api/users/:userId/permission
 */
app.get("/api/users/:userId/permission", async (req, res) => {
  await userController.checkPermission(req, res);
});

// ======================================
// 🏢 Brand Routes
// ======================================

/**
 * 📝 إنشاء براند جديد
 * POST /api/brands
 */
app.post("/api/brands", async (req, res) => {
  await brandController.createBrand(req, res);
});

/**
 * ✅ الموافقة على براند
 * PATCH /api/brands/:brandId/approve
 */
app.patch("/api/brands/:brandId/approve", async (req, res) => {
  await brandController.approveBrand(req, res);
});

/**
 * 👨‍💼 تعيين منسق للبراند
 * PATCH /api/brands/:brandId/coordinator
 */
app.patch("/api/brands/:brandId/coordinator", async (req, res) => {
  await brandController.assignCoordinator(req, res);
});

/**
 * 🔍 البحث عن براند واحد
 * GET /api/brands/get
 */
app.get("/api/brands/get", async (req, res) => {
  await brandController.getBrand(req, res);
});

/**
 * 🔄 تحديث حالة البراند
 * PATCH /api/brands/:brandId/status
 */
app.patch("/api/brands/:brandId/status", async (req, res) => {
  await brandController.updateBrandStatus(req, res);
});

/**
 * 💰 تحديث ميزانية البراند
 * PATCH /api/brands/:brandId/budget
 */
app.patch("/api/brands/:brandId/budget", async (req, res) => {
  await brandController.updateBudget(req, res);
});

/**
 * 🔍 البحث في البراندات
 * GET /api/brands/search
 */
app.get("/api/brands/search", validateSearchBrands, async (req, res) => {
  await brandController.searchBrands(req, res);
});

/**
 * 📊 إحصائيات البراندات
 * GET /api/brands/stats
 */
app.get("/api/brands/stats", async (req, res) => {
  await brandController.getBrandStats(req, res);
});

/**
 * 📈 إحصائيات براند محدد
 * GET /api/brands/:brandId/analytics
 */
app.get("/api/brands/:brandId/analytics", async (req, res) => {
  await brandController.getBrandAnalytics(req, res);
});

// ======================================
// 📱 Campaign Routes
// ======================================

/**
 * 📝 إنشاء حملة جديدة
 * POST /api/campaigns
 */
app.post("/api/campaigns", async (req, res) => {
  await campaignController.createCampaign(req, res);
});

/**
 * 🔍 جلب حملة محددة
 * GET /api/campaigns/:id
 */
app.get("/api/campaigns/:id", async (req, res) => {
  await campaignController.getCampaignById(req, res);
});

/**
 * 🔄 تحديث حالة الحملة
 * PATCH /api/campaigns/:id/status
 */
app.patch("/api/campaigns/:id/status", async (req, res) => {
  await campaignController.updateCampaignStatus(req, res);
});

/**
 * 👨‍💻 تعيين مصور للحملة
 * PATCH /api/campaigns/:id/photographer
 */
app.patch("/api/campaigns/:id/photographer", async (req, res) => {
  await campaignController.assignPhotographer(req, res);
});

/**
 * 🔍 البحث المتقدم في الحملات
 * GET /api/campaigns/search
 */
app.get("/api/campaigns/search", async (req, res) => {
  await campaignController.searchCampaigns(req, res);
});

/**
 * 📊 إحصائيات عامة للحملات
 * GET /api/campaigns/stats
 */
app.get("/api/campaigns/stats", async (req, res) => {
  await campaignController.getCampaignStats(req, res);
});

/**
 * 📈 تحليلات حملة محددة
 * GET /api/campaigns/:id/analytics
 */
app.get("/api/campaigns/:id/analytics", async (req, res) => {
  await campaignController.getCampaignAnalytics(req, res);
});

/**
 * 🗑️ حذف/أرشفة حملة
 * DELETE /api/campaigns/:id
 */
app.delete("/api/campaigns/:id", async (req, res) => {
  await campaignController.deleteCampaign(req, res);
});

// ======================================
// 📋 Campaign Task Routes
// ======================================

/**
 * 📝 إنشاء مهام للحملة
 * POST /api/campaigns/:id/tasks
 */
app.post("/api/campaigns/:id/tasks", async (req, res) => {
  await campaignController.createCampaignTasks(req, res);
});

/**
 * 👨‍💻 تخصيص مهمة لمصور
 * PATCH /api/campaigns/:id/tasks/:taskTitle/assign
 */
app.patch("/api/campaigns/:id/tasks/:taskTitle/assign", async (req, res) => {
  await campaignController.assignTaskToPhotographer(req, res);
});

/**
 * 📊 تحديث حالة المهمة
 * PATCH /api/campaigns/:id/tasks/:taskTitle/status
 */
app.patch("/api/campaigns/:id/tasks/:taskTitle/status", async (req, res) => {
  await campaignController.updateTaskStatus(req, res);
});

/**
 * 📋 جلب مهام المصور
 * GET /api/campaigns/:id/photographer/:photographerId/tasks
 */
app.get("/api/campaigns/:id/photographer/:photographerId/tasks", async (req, res) => {
  await campaignController.getPhotographerTasks(req, res);
});

// ======================================
// 🎨 Content Routes
// ======================================

/**
 * 📤 رفع محتوى جديد
 * POST /api/content
 */
app.post("/api/content", async (req, res) => {
  await contentController.uploadContent(req, res);
});

/**
 * 📄 جلب محتوى محدد
 * GET /api/content/:id
 */
app.get("/api/content/:id", async (req, res) => {
  await contentController.getContentById(req, res);
});

/**
 * ✅ الموافقة على محتوى
 * PATCH /api/content/:id/approve
 */
app.patch("/api/content/:id/approve", async (req, res) => {
  await contentController.approveContent(req, res);
});

/**
 * ❌ رفض محتوى
 * PATCH /api/content/:id/reject
 */
app.patch("/api/content/:id/reject", async (req, res) => {
  await contentController.rejectContent(req, res);
});

/**
 * 🔄 طلب تعديل على محتوى
 * PATCH /api/content/:id/revision
 */
app.patch("/api/content/:id/revision", async (req, res) => {
  await contentController.requestRevision(req, res);
});

/**
 * 🔍 البحث في المحتوى
 * GET /api/content/search
 */
app.get("/api/content/search", async (req, res) => {
  await contentController.searchContent(req, res);
});

/**
 * 📊 إحصائيات المحتوى
 * GET /api/content/stats
 */
app.get("/api/content/stats", async (req, res) => {
  await contentController.getContentStats(req, res);
});

/**
 * 👤 تحليل نشاط المستخدم في المحتوى
 * GET /api/content/user/:userId/activity
 */
app.get("/api/content/user/:userId/activity", async (req, res) => {
  await contentController.getUserContentActivity(req, res);
});

/**
 * 📸 تقييم أداء المصور
 * GET /api/content/photographer/:photographerId/performance
 */
app.get("/api/content/photographer/:photographerId/performance", async (req, res) => {
  await contentController.getPhotographerPerformance(req, res);
});

/**
 * 🏢 تحليل أداء البراند في المحتوى
 * GET /api/content/brand/:brandId/performance
 */
app.get("/api/content/brand/:brandId/performance", async (req, res) => {
  await contentController.getBrandContentPerformance(req, res);
});

/**
 * 📂 إحصائيات فئات المحتوى
 * GET /api/content/categories/stats
 */
app.get("/api/content/categories/stats", async (req, res) => {
  await contentController.getCategoryStats(req, res);
});

/**
 * 🎯 اقتراح فئة محتوى مناسبة
 * POST /api/content/suggest-category
 */
app.post("/api/content/suggest-category", async (req, res) => {
  await contentController.suggestCategory(req, res);
});

/**
 * 💰 حساب تكلفة المحتوى حسب الفئة
 * GET /api/content/:id/cost
 */
app.get("/api/content/:id/cost", async (req, res) => {
  await contentController.getContentCost(req, res);
});

// ======================================
// 💸 Payment Routes
// ======================================

/**
 * 📝 إنشاء دفعة جديدة
 * POST /api/payments
 */
app.post("/api/payments", async (req, res) => {
  await paymentController.createPayment(req, res);
});

/**
 * 🔍 جلب دفعة محددة
 * GET /api/payments/:id
 */
app.get("/api/payments/:id", async (req, res) => {
  await paymentController.getPaymentById(req, res);
});

/**
 * 🔄 تحديث حالة الدفعة
 * PATCH /api/payments/:id/status
 */
app.patch("/api/payments/:id/status", async (req, res) => {
  await paymentController.updatePaymentStatus(req, res);
});

/**
 * 🔍 البحث المتقدم في المدفوعات
 * GET /api/payments/search
 */
app.get("/api/payments/search", async (req, res) => {
  await paymentController.searchPayments(req, res);
});

/**
 * 📊 إحصائيات المدفوعات الأساسية
 * GET /api/payments/stats
 */
app.get("/api/payments/stats", async (req, res) => {
  await paymentController.getPaymentStats(req, res);
});

/**
 * 💰 الإحصائيات المالية المتقدمة
 * GET /api/payments/financial-stats
 */
app.get("/api/payments/financial-stats", async (req, res) => {
  await paymentController.getAdvancedFinancialStats(req, res);
});

/**
 * 📈 التقارير المالية الشاملة
 * GET /api/payments/financial-reports
 */
app.get("/api/payments/financial-reports", async (req, res) => {
  await paymentController.getFinancialReports(req, res);
});

/**
 * 💵 أرباح المصور
 * GET /api/payments/photographer/:id/earnings
 */
app.get("/api/payments/photographer/:id/earnings", async (req, res) => {
  await paymentController.getPhotographerEarnings(req, res);
});

/**
 * 📄 إنشاء فاتورة للدفعة
 * POST /api/payments/:id/invoice
 */
app.post("/api/payments/:id/invoice", async (req, res) => {
  await paymentController.generateInvoice(req, res);
});

/**
 * 📋 المدفوعات المستحقة
 * GET /api/payments/pending
 */
app.get("/api/payments/pending", async (req, res) => {
  await paymentController.getPendingPayments(req, res);
});

/**
 * ⏰ المدفوعات المتأخرة
 * GET /api/payments/overdue
 */
app.get("/api/payments/overdue", async (req, res) => {
  await paymentController.getOverduePayments(req, res);
});

/**
 * 🗑️ حذف/أرشفة دفعة
 * DELETE /api/payments/:id
 */
app.delete("/api/payments/:id", async (req, res) => {
  await paymentController.deletePayment(req, res);
});

// ======================================
// 🛠️ Equipment Routes
// ======================================

/**
 * 📝 إضافة معدة جديدة
 * POST /api/equipment
 */
app.post("/api/equipment", async (req, res) => {
  await equipmentController.addEquipment(req, res);
});

/**
 * 📋 تخصيص معدة لمستخدم
 * POST /api/equipment/:id/assign
 */
app.post("/api/equipment/:id/assign", async (req, res) => {
  await equipmentController.assignEquipment(req, res);
});

/**
 * 🔄 إرجاع معدة من المستخدم
 * POST /api/equipment/:id/return
 */
app.post("/api/equipment/:id/return", async (req, res) => {
  await equipmentController.returnEquipment(req, res);
});

/**
 * 🔧 جدولة صيانة للمعدة
 * POST /api/equipment/:id/maintenance
 */
app.post("/api/equipment/:id/maintenance", async (req, res) => {
  await equipmentController.scheduleMaintenance(req, res);
});

/**
 * 🔍 جلب جميع المعدات مع البحث والفلترة
 * GET /api/equipment
 */
app.get("/api/equipment", async (req, res) => {
  await equipmentController.getAllEquipment(req, res);
});

/**
 * 📖 جلب معدة محددة
 * GET /api/equipment/:id
 */
app.get("/api/equipment/:id", async (req, res) => {
  await equipmentController.getEquipmentById(req, res);
});

/**
 * 🔍 جلب المعدات المتاحة
 * GET /api/equipment/available
 */
app.get("/api/equipment/available", async (req, res) => {
  await equipmentController.getAvailableEquipment(req, res);
});

/**
 * 🔍 جلب المعدات حسب النوع
 * GET /api/equipment/type/:type
 */
app.get("/api/equipment/type/:type", async (req, res) => {
  await equipmentController.getEquipmentByType(req, res);
});

/**
 * 📊 إحصائيات المعدات
 * GET /api/equipment/stats
 */
app.get("/api/equipment/stats", async (req, res) => {
  await equipmentController.getEquipmentStats(req, res);
});

/**
 * 📊 تقرير استخدام معدة محددة
 * GET /api/equipment/:id/usage-report
 */
app.get("/api/equipment/:id/usage-report", async (req, res) => {
  await equipmentController.getEquipmentUsageReport(req, res);
});

/**
 * 🔧 المعدات التي تحتاج صيانة
 * GET /api/equipment/maintenance/needed
 */
app.get("/api/equipment/maintenance/needed", async (req, res) => {
  await equipmentController.getEquipmentNeedingMaintenance(req, res);
});

/**
 * ⚠️ المعدات منتهية الضمان
 * GET /api/equipment/warranty/expiring
 */
app.get("/api/equipment/warranty/expiring", async (req, res) => {
  await equipmentController.getEquipmentWithExpiringWarranty(req, res);
});

/**
 * 🔄 تحديث معدة
 * PATCH /api/equipment/:id
 */
app.patch("/api/equipment/:id", async (req, res) => {
  await equipmentController.updateEquipment(req, res);
});

/**
 * 🔄 تحديث حالة المعدة
 * PATCH /api/equipment/:id/condition
 */
app.patch("/api/equipment/:id/condition", async (req, res) => {
  await equipmentController.updateEquipmentCondition(req, res);
});

/**
 * 🗑️ حذف معدة (Soft Delete)
 * DELETE /api/equipment/:id
 */
app.delete("/api/equipment/:id", async (req, res) => {
  await equipmentController.deleteEquipment(req, res);
});

/**
 * 🔍 التحقق من إمكانية تخصيص المعدة
 * GET /api/equipment/:id/can-assign
 */
app.get("/api/equipment/:id/can-assign", async (req, res) => {
  await equipmentController.canAssignEquipment(req, res);
});

// ======================================
// 🔔 Notification Routes
// ======================================

/**
 * 📤 إرسال إشعار جديد
 * POST /api/notifications
 */
app.post("/api/notifications", async (req, res) => {
  await notificationController.sendNotification(req, res);
});

/**
 * 📤 إرسال إشعارات جماعية
 * POST /api/notifications/bulk
 */
app.post("/api/notifications/bulk", async (req, res) => {
  await notificationController.sendBulkNotifications(req, res);
});

/**
 * ⏰ جدولة إشعار للإرسال لاحقاً
 * POST /api/notifications/schedule
 */
app.post("/api/notifications/schedule", async (req, res) => {
  await notificationController.scheduleNotification(req, res);
});

/**
 * 📖 تعليم إشعار كمقروء
 * PATCH /api/notifications/:id/read
 */
app.patch("/api/notifications/:id/read", async (req, res) => {
  await notificationController.markAsRead(req, res);
});

/**
 * 📖 تعليم جميع الإشعارات كمقروءة
 * PATCH /api/notifications/read-all
 */
app.patch("/api/notifications/read-all", async (req, res) => {
  await notificationController.markAllAsRead(req, res);
});

/**
 * ⚡ تحديث حالة الإجراء المطلوب
 * PATCH /api/notifications/:id/action
 */
app.patch("/api/notifications/:id/action", async (req, res) => {
  await notificationController.updateAction(req, res);
});

/**
 * 🔍 جلب إشعارات المستخدم مع البحث والفلترة
 * GET /api/notifications
 */
app.get("/api/notifications", async (req, res) => {
  await notificationController.getNotifications(req, res);
});

/**
 * 📖 جلب إشعار محدد
 * GET /api/notifications/:id
 */
app.get("/api/notifications/:id", async (req, res) => {
  await notificationController.getNotificationById(req, res);
});

/**
 * 🚨 جلب الإشعارات العاجلة
 * GET /api/notifications/urgent
 */
app.get("/api/notifications/urgent", async (req, res) => {
  await notificationController.getUrgentNotifications(req, res);
});

/**
 * ⚡ جلب الإشعارات التي تحتاج إجراء
 * GET /api/notifications/action-required
 */
app.get("/api/notifications/action-required", async (req, res) => {
  await notificationController.getActionRequiredNotifications(req, res);
});

/**
 * 📊 إحصائيات الإشعارات العامة
 * GET /api/notifications/stats
 */
app.get("/api/notifications/stats", async (req, res) => {
  await notificationController.getStats(req, res);
});

/**
 * 📊 نشاط المستخدم في الإشعارات
 * GET /api/notifications/user/:userId/activity
 */
app.get("/api/notifications/user/:userId/activity", async (req, res) => {
  await notificationController.getUserActivity(req, res);
});

/**
 * 📈 تحليل فعالية إشعار محدد
 * GET /api/notifications/:id/effectiveness
 */
app.get("/api/notifications/:id/effectiveness", async (req, res) => {
  await notificationController.getEffectivenessAnalysis(req, res);
});

/**
 * 🗑️ حذف إشعار محدد
 * DELETE /api/notifications/:id
 */
app.delete("/api/notifications/:id", async (req, res) => {
  await notificationController.deleteNotification(req, res);
});

/**
 * 🧹 حذف الإشعارات المنتهية الصلاحية
 * DELETE /api/notifications/cleanup/expired
 */
app.delete("/api/notifications/cleanup/expired", async (req, res) => {
  await notificationController.cleanupExpiredNotifications(req, res);
});

// ======================================
// 🚫 Error Handling
// ======================================

/**
 * 404 - Route not found
 */
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
    method: req.method
  });
});

/**
 * Global Error Handler
 */
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error("🚨 Unhandled error:", error);
  
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env["NODE_ENV"] === "development" ? error.message : undefined
  });
});

// ======================================
// 🚀 Firebase Functions Export
// ======================================

/**
 * 🎯 Main API Function
 * 
 * استخدام:
 * - التطوير: http://localhost:5001/depth-production/us-central1/api
 * - الإنتاج: https://us-central1-depth-production.cloudfunctions.net/api
 */
export const api = functions
  .region("us-central1")
  .runWith({
    memory: "512MB",
    timeoutSeconds: 60,
    minInstances: 0,
    maxInstances: 10
  })
  .https
  .onRequest(app);

/**
 * 🧪 Development Helper Function
 */
export const devInfo = functions
  .region("us-central1")
  .https
  .onRequest((req, res) => {
    res.json({
      message: "🎯 Depth Studio Development Info",
      environment: "development",
      mainAPI: "/api",
      documentation: "https://docs.depthstudio.app",
      version: "2.0.0",
      lastUpdated: "December 2024"
    });
  }); 
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
import { services } from "./services";
import { logger } from "firebase-functions";

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
      users: "/api/users",
      brands: "/api/brands",
      campaigns: "/api/campaigns",
      content: "/api/content",
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
app.get("/api/users/search", async (req, res) => {
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
app.get("/api/brands/search", async (req, res) => {
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
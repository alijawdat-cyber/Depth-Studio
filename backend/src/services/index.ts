/**
 * 🎯 Service Index - Depth Studio
 * ===============================
 * 
 * 📅 محدث: ديسمبر 2024
 * 👨‍💻 المطور: علي جودت
 * 🎯 الهدف: تجميع جميع Services مع Type Safety كامل
 * 
 * 🆕 المضاف حديثاً:
 * - AuthService: نظام مصادقة متقدم مع 3 طرق (البريد، الهاتف العراقي، جوجل)
 * - دعم OTP للأرقام العراقية
 * - إحصائيات وتحليلات المصادقة
 * - RoleSelectionService: إدارة عملية اختيار الأدوار مع الموافقة والرفض
 */

// 🔐 Auth Service (جديد 🆕)
export { AuthService } from "./AuthService";

// 👥 User Service
export { UserService } from "./UserService";

// 🏢 Brand Service  
export { BrandService } from "./BrandService";

// 📱 Campaign Service
export { CampaignService } from "./CampaignService";

// 🎨 Content Service
export { ContentService } from "./ContentService";

// 💸 Payment Service
export { PaymentService, CreatePaymentRequest, PhotographerEarningsReport, Invoice, FinancialReport } from "./PaymentService";

// 🛠️ Equipment Service
export { EquipmentService, CreateEquipmentRequest, AssignEquipmentRequest, ScheduleMaintenanceRequest, EquipmentUsageReport } from "./EquipmentService";

// 🔔 Notification Service
export { NotificationService, CreateNotificationRequest, BulkNotificationRequest, ScheduleNotificationRequest, NotificationDeliveryReport, NotificationEffectivenessAnalysis } from "./NotificationService";

// 🎭 Role Selection Service (جديد 🆕)
export { RoleSelectionService } from "./RoleSelectionService";

// Import للاستخدام الداخلي
import { AuthService } from "./AuthService";
import { UserService } from "./UserService";
import { BrandService } from "./BrandService";
import { CampaignService } from "./CampaignService";
import { ContentService } from "./ContentService";
import { PaymentService } from "./PaymentService";
import { EquipmentService } from "./EquipmentService";
import { NotificationService } from "./NotificationService";
import { RoleSelectionService } from "./RoleSelectionService";
import { RepositoryFactory } from "../repositories";

/**
 * 🏭 Service Factory
 * إنشاء instances من Services مع Singleton pattern
 */
class ServiceFactory {
  private static authService: AuthService | null = null;
  private static userService: UserService | null = null;
  private static brandService: BrandService | null = null;
  private static campaignService: CampaignService | null = null;
  private static contentService: ContentService | null = null;
  private static paymentService: PaymentService | null = null;
  private static equipmentService: EquipmentService | null = null;
  private static notificationService: NotificationService | null = null;
  private static roleSelectionService: RoleSelectionService | null = null;

  /**
   * 🔐 الحصول على Auth Service (جديد 🆕)
   * يوفر مصادقة متقدمة مع 3 طرق: البريد، الهاتف العراقي + OTP، جوجل
   */
  static getAuthService(): AuthService {
    if (!this.authService) {
      this.authService = new AuthService();
    }
    return this.authService;
  }

  /**
   * 👥 الحصول على User Service
   */
  static getUserService(): UserService {
    if (!this.userService) {
      this.userService = new UserService();
    }
    return this.userService;
  }

  /**
   * 🏢 الحصول على Brand Service
   */
  static getBrandService(): BrandService {
    if (!this.brandService) {
      this.brandService = new BrandService();
    }
    return this.brandService;
  }

  /**
   * 📱 الحصول على Campaign Service
   */
  static getCampaignService(): CampaignService {
    if (!this.campaignService) {
      // إنشاء مع dependency injection للـ repositories
      const campaignRepo = RepositoryFactory.getCampaignRepository();
      const userRepo = RepositoryFactory.getUserRepository();
      const brandRepo = RepositoryFactory.getBrandRepository();
      
      this.campaignService = new CampaignService(campaignRepo, userRepo, brandRepo);
    }
    return this.campaignService;
  }

  /**
   * 🎨 الحصول على Content Service
   */
  static getContentService(): ContentService {
    if (!this.contentService) {
      // إنشاء مع dependency injection للـ repositories
      const contentRepo = RepositoryFactory.getContentRepository();
      const userRepo = RepositoryFactory.getUserRepository();
      const brandRepo = RepositoryFactory.getBrandRepository();
      const campaignRepo = RepositoryFactory.getCampaignRepository();
      
      this.contentService = new ContentService(contentRepo, userRepo, brandRepo, campaignRepo);
    }
    return this.contentService;
  }

  /**
   * 💸 الحصول على Payment Service
   */
  static getPaymentService(): PaymentService {
    if (!this.paymentService) {
      this.paymentService = new PaymentService();
    }
    return this.paymentService;
  }

  /**
   * 🛠️ الحصول على Equipment Service
   */
  static getEquipmentService(): EquipmentService {
    if (!this.equipmentService) {
      this.equipmentService = new EquipmentService();
    }
    return this.equipmentService;
  }

  /**
   * 🔔 الحصول على Notification Service
   */
  static getNotificationService(): NotificationService {
    if (!this.notificationService) {
      this.notificationService = new NotificationService();
    }
    return this.notificationService;
  }

  /**
   * 🎭 الحصول على Role Selection Service (جديد 🆕)
   * يوفر إدارة شاملة لعملية اختيار الأدوار مع الموافقة والرفض
   */
  static getRoleSelectionService(): RoleSelectionService {
    if (!this.roleSelectionService) {
      this.roleSelectionService = new RoleSelectionService();
    }
    return this.roleSelectionService;
  }

  /**
   * 🧹 تنظيف جميع الـ instances (للاختبارات)
   */
  static clearInstances(): void {
    this.authService = null;
    this.userService = null;
    this.brandService = null;
    this.campaignService = null;
    this.contentService = null;
    this.paymentService = null;
    this.equipmentService = null;
    this.notificationService = null;
    this.roleSelectionService = null;
  }
}

export { ServiceFactory };

/**
 * 🎯 Services للاستخدام المباشر
 * 🆕 تم إضافة auth service للمصادقة المتقدمة
 * 🆕 تم إضافة role selection service لإدارة اختيار الأدوار
 */
export const services = {
  auth: ServiceFactory.getAuthService(),        // 🆕 خدمة المصادقة المتقدمة
  users: ServiceFactory.getUserService(),
  brands: ServiceFactory.getBrandService(),
  campaigns: ServiceFactory.getCampaignService(),
  content: ServiceFactory.getContentService(),
  payments: ServiceFactory.getPaymentService(),
  equipment: ServiceFactory.getEquipmentService(),
  notifications: ServiceFactory.getNotificationService(),
  roleSelection: ServiceFactory.getRoleSelectionService(),  // 🆕 خدمة اختيار الأدوار
} as const; 
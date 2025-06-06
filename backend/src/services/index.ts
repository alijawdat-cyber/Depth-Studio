/**
 * 🎯 Service Index - Depth Studio
 * ===============================
 * 
 * 📅 محدث: ديسمبر 2024
 * 👨‍💻 المطور: علي جودت
 * 🎯 الهدف: تجميع جميع Services مع Type Safety كامل
 */

// 👥 User Service
export { UserService } from "./UserService";

// 🏢 Brand Service  
export { BrandService } from "./BrandService";

// 📱 Campaign Service
export { CampaignService } from "./CampaignService";

// 🎨 Content Service
export { ContentService } from "./ContentService";

// Import للاستخدام الداخلي
import { UserService } from "./UserService";
import { BrandService } from "./BrandService";
import { CampaignService } from "./CampaignService";
import { ContentService } from "./ContentService";
import { RepositoryFactory } from "../repositories";

/**
 * 🏭 Service Factory
 * إنشاء instances من Services مع Singleton pattern
 */
class ServiceFactory {
  private static userService: UserService | null = null;
  private static brandService: BrandService | null = null;
  private static campaignService: CampaignService | null = null;
  private static contentService: ContentService | null = null;

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
   * 🧹 تنظيف جميع الـ instances (للاختبارات)
   */
  static clearInstances(): void {
    this.userService = null;
    this.brandService = null;
    this.campaignService = null;
    this.contentService = null;
  }
}

export { ServiceFactory };

/**
 * 🎯 Services للاستخدام المباشر
 */
export const services = {
  users: ServiceFactory.getUserService(),
  brands: ServiceFactory.getBrandService(),
  campaigns: ServiceFactory.getCampaignService(),
  content: ServiceFactory.getContentService(),
} as const; 
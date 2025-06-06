/**
 * 📦 Repository Index - Depth Studio
 * ==================================
 * 
 * 📅 محدث: ديسمبر 2024
 * 👨‍💻 المطور: علي جودت
 * 🎯 الهدف: تجميع جميع Repositories مع Type Safety كامل
 */

// 🏗️ Base Repository
export { BaseRepository, QueryOptions, PaginatedResult } from "./BaseRepository";

// 👥 User Repository
export { UserRepository } from "./UserRepository";

// 🏢 Brand Repository  
export { BrandRepository } from "./BrandRepository";

// 📱 Campaign Repository
export { CampaignRepository } from "./CampaignRepository";

// 📁 Content Repository
export { ContentRepository } from "./ContentRepository";

// Import للاستخدام الداخلي
import { UserRepository } from "./UserRepository";
import { BrandRepository } from "./BrandRepository";
import { CampaignRepository } from "./CampaignRepository";
import { ContentRepository } from "./ContentRepository";

/**
 * 🏭 Repository Factory
 * إنشاء instances من Repositories مع Singleton pattern
 */
class RepositoryFactory {
  private static userRepository: UserRepository | null = null;
  private static brandRepository: BrandRepository | null = null;
  private static campaignRepository: CampaignRepository | null = null;
  private static contentRepository: ContentRepository | null = null;

  /**
   * 👥 الحصول على User Repository
   */
  static getUserRepository(): UserRepository {
    if (!this.userRepository) {
      this.userRepository = new UserRepository();
    }
    return this.userRepository;
  }

  /**
   * 🏢 الحصول على Brand Repository
   */
  static getBrandRepository(): BrandRepository {
    if (!this.brandRepository) {
      this.brandRepository = new BrandRepository();
    }
    return this.brandRepository;
  }

  /**
   * 📱 الحصول على Campaign Repository
   */
  static getCampaignRepository(): CampaignRepository {
    if (!this.campaignRepository) {
      this.campaignRepository = new CampaignRepository();
    }
    return this.campaignRepository;
  }

  /**
   * 📁 الحصول على Content Repository
   */
  static getContentRepository(): ContentRepository {
    if (!this.contentRepository) {
      this.contentRepository = new ContentRepository();
    }
    return this.contentRepository;
  }

  /**
   * 🧹 تنظيف جميع الـ instances (للاختبارات)
   */
  static clearInstances(): void {
    this.userRepository = null;
    this.brandRepository = null;
    this.campaignRepository = null;
    this.contentRepository = null;
  }
}

export { RepositoryFactory };

/**
 * 🎯 Repositories للاستخدام المباشر
 */
export const repositories = {
  users: RepositoryFactory.getUserRepository(),
  brands: RepositoryFactory.getBrandRepository(),
  campaigns: RepositoryFactory.getCampaignRepository(),
  content: RepositoryFactory.getContentRepository(),
} as const; 
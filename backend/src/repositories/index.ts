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

// 💸 Payment Repository
export { PaymentRepository, PaymentSearchOptions, PaymentStats, FinancialStats } from "./PaymentRepository";

// 🛠️ Equipment Repository
export { EquipmentRepository, EquipmentSearchOptions, EquipmentStats, EquipmentAssignment, EquipmentMaintenance } from "./EquipmentRepository";

// 🔔 Notification Repository
export { NotificationRepository, NotificationSearchOptions, NotificationStats, UserNotificationActivity } from "./NotificationRepository";

// Import للاستخدام الداخلي
import { UserRepository } from "./UserRepository";
import { BrandRepository } from "./BrandRepository";
import { CampaignRepository } from "./CampaignRepository";
import { ContentRepository } from "./ContentRepository";
import { PaymentRepository } from "./PaymentRepository";
import { EquipmentRepository } from "./EquipmentRepository";
import { NotificationRepository } from "./NotificationRepository";

/**
 * 🏭 Repository Factory
 * إنشاء instances من Repositories مع Singleton pattern
 */
class RepositoryFactory {
  private static userRepository: UserRepository | null = null;
  private static brandRepository: BrandRepository | null = null;
  private static campaignRepository: CampaignRepository | null = null;
  private static contentRepository: ContentRepository | null = null;
  private static paymentRepository: PaymentRepository | null = null;
  private static equipmentRepository: EquipmentRepository | null = null;
  private static notificationRepository: NotificationRepository | null = null;

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
   * 💸 الحصول على Payment Repository
   */
  static getPaymentRepository(): PaymentRepository {
    if (!this.paymentRepository) {
      this.paymentRepository = new PaymentRepository();
    }
    return this.paymentRepository;
  }

  /**
   * 🛠️ الحصول على Equipment Repository
   */
  static getEquipmentRepository(): EquipmentRepository {
    if (!this.equipmentRepository) {
      this.equipmentRepository = new EquipmentRepository();
    }
    return this.equipmentRepository;
  }

  /**
   * 🔔 الحصول على Notification Repository
   */
  static getNotificationRepository(): NotificationRepository {
    if (!this.notificationRepository) {
      this.notificationRepository = new NotificationRepository();
    }
    return this.notificationRepository;
  }

  /**
   * 🧹 تنظيف جميع الـ instances (للاختبارات)
   */
  static clearInstances(): void {
    this.userRepository = null;
    this.brandRepository = null;
    this.campaignRepository = null;
    this.contentRepository = null;
    this.paymentRepository = null;
    this.equipmentRepository = null;
    this.notificationRepository = null;
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
  payments: RepositoryFactory.getPaymentRepository(),
  equipment: RepositoryFactory.getEquipmentRepository(),
  notifications: RepositoryFactory.getNotificationRepository(),
} as const; 
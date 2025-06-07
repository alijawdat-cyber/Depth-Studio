/**
 * 👥 User Service - Depth Studio
 * ==============================
 * 
 * 📅 محدث: ديسمبر 2024
 * 👨‍💻 المطور: علي جودت
 * 🎯 الهدف: المنطق التجاري للمستخدمين بأنواع محكمة 100%
 */

import { User, UserPermissions } from "../../../types/src/users";
import { UserRole, UserStatus } from "../../../types/src/core/enums";
import { ID } from "../../../types/src/core/base";
import { UserRepository } from "../repositories/UserRepository";
import { logger } from "firebase-functions";
import { auth } from "../config/firebase";

/**
 * 👥 خدمة المستخدمين
 */
export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  /**
   * 📝 إنشاء مستخدم جديد
   */
  async createUser(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    primaryRole: UserRole;
  }): Promise<{ user: User; firebaseUser: { uid: string } }> {
    try {
      // إنشاء المستخدم في Firebase Auth
      const firebaseUser = await auth.createUser({
        email: userData.email,
        password: userData.password,
        displayName: `${userData.firstName} ${userData.lastName}`,
        phoneNumber: userData.phone || null,
        emailVerified: false
      });

      // إنشاء مستخدم في Firestore مع جميع الحقول المطلوبة
      const userCreateData = {
        email: userData.email,
        first_name: userData.firstName,
        last_name: userData.lastName,
        full_name: `${userData.firstName} ${userData.lastName}`,
        display_name: `${userData.firstName} ${userData.lastName}`,
        primary_role: userData.primaryRole,
        role: userData.primaryRole, // نفس primary_role
        status: "pending_approval" as const,
        is_verified: false,
        firebase_uid: firebaseUser.uid,
        auth_methods: [],
        auth_providers: ["email" as const],
        registration_method: "email" as const,
        timezone: "Asia/Baghdad",
        is_online: false,
        is_active: true,
        location: undefined,
        profile_photo_url: undefined,
        bio: undefined,
        last_login: undefined,
        last_seen: undefined,
        phone_verified: false,
        role_selected: false,
        role_selection_history: [],
        google_linked: false,
        notification_preferences: {
          email_notifications: true,
          push_notifications: true,
          sms_notifications: false,
          marketing_emails: false
        },
        privacy_settings: {
          profile_visibility: 'private',
          show_online_status: false,
          allow_contact: false
        },
        ...(userData.phone && { phone: userData.phone })
      };

      const newUser = await this.userRepository.create(userCreateData as any);

      logger.info("👥 User created successfully", { 
        userId: newUser.id, 
        firebaseUid: firebaseUser.uid,
        email: userData.email 
      });

      return { user: newUser, firebaseUser };
    } catch (error) {
      logger.error("❌ Error creating user", { email: userData.email, error });
      throw new Error(`Failed to create user: ${error}`);
    }
  }

  /**
   * 🔍 البحث عن مستخدم بطرق متعددة
   */
  async findUser(identifier: { 
    id?: ID; 
    email?: string; 
    firebaseUid?: string; 
  }): Promise<User | null> {
    try {
      if (identifier.id) {
        return await this.userRepository.findById(identifier.id);
      }
      if (identifier.email) {
        return await this.userRepository.findByEmail(identifier.email);
      }
      if (identifier.firebaseUid) {
        return await this.userRepository.findByFirebaseUid(identifier.firebaseUid);
      }
      
      throw new Error("No valid identifier provided");
    } catch (error) {
      logger.error("❌ Error finding user", { identifier, error });
      throw new Error(`Failed to find user: ${error}`);
    }
  }

  /**
   * ✅ الموافقة على مستخدم
   */
  async approveUser(userId: ID, approvedBy: ID): Promise<User> {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      if (user.status !== "pending_approval") {
        throw new Error(`Cannot approve user with status: ${user.status}`);
      }

      const updatedUser = await this.userRepository.update(userId, {
        status: "active",
        updated_by: approvedBy
      });

      logger.info("✅ User approved", { userId, approvedBy });
      return updatedUser;
    } catch (error) {
      logger.error("❌ Error approving user", { userId, approvedBy, error });
      throw new Error(`Failed to approve user: ${error}`);
    }
  }

  /**
   * 🚫 رفض مستخدم
   */
  async rejectUser(userId: ID, rejectedBy: ID): Promise<User> {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      const updatedUser = await this.userRepository.update(userId, {
        status: "suspended",
        updated_by: rejectedBy
      });

      logger.info("🚫 User rejected", { userId, rejectedBy });
      return updatedUser;
    } catch (error) {
      logger.error("❌ Error rejecting user", { userId, rejectedBy, error });
      throw new Error(`Failed to reject user: ${error}`);
    }
  }

  /**
   * 🔑 تحديث دور المستخدم
   */
  async updateUserRole(
    userId: ID, 
    newRole: UserRole, 
    updatedBy: ID
  ): Promise<User> {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      const updatedUser = await this.userRepository.update(userId, {
        primary_role: newRole,
        updated_by: updatedBy
      });

      logger.info("🔑 User role updated", { userId, oldRole: user.primary_role, newRole, updatedBy });
      return updatedUser;
    } catch (error) {
      logger.error("❌ Error updating user role", { userId, newRole, updatedBy, error });
      throw new Error(`Failed to update user role: ${error}`);
    }
  }

  /**
   * 📊 إحصائيات المستخدمين
   */
  async getUserStats(): Promise<{
    total: number;
    byRole: Record<UserRole, number>;
    byStatus: Record<UserStatus, number>;
    activeCount: number;
    pendingApproval: number;
  }> {
    try {
      const allUsers = await this.userRepository.findAll();
      
      const stats = {
        total: allUsers.length,
        byRole: {} as Record<UserRole, number>,
        byStatus: {} as Record<UserStatus, number>,
        activeCount: 0,
        pendingApproval: 0
      };

      // حساب الإحصائيات
      for (const user of allUsers) {
        // حساب حسب الدور
        if (user.primary_role) {
          stats.byRole[user.primary_role] = (stats.byRole[user.primary_role] || 0) + 1;
        }
        
        // حساب حسب الحالة
        stats.byStatus[user.status] = (stats.byStatus[user.status] || 0) + 1;
        
        // حساب النشطين
        if (user.status === "active") {
          stats.activeCount++;
        }
        
        // حساب المنتظرين الموافقة
        if (user.status === "pending_approval") {
          stats.pendingApproval++;
        }
      }

      logger.info("📊 User stats calculated", stats);
      return stats;
    } catch (error) {
      logger.error("❌ Error calculating user stats", error);
      throw new Error(`Failed to calculate user stats: ${error}`);
    }
  }

  /**
   * 🔐 إنشاء صلاحيات للمستخدم الجديد
   */
  async createUserPermissions(userId: ID, role: UserRole, grantedBy: ID): Promise<UserPermissions> {
    try {
      const userPermissions: Omit<UserPermissions, "id" | "created_at" | "updated_at"> = {
        user_id: userId,
        role: role,
        brand_access: [],
        can_approve_content: role === "marketing_coordinator",
        can_view_financials: ["super_admin", "marketing_coordinator"].includes(role),
        can_manage_users: role === "super_admin",
        can_manage_brands: ["super_admin", "marketing_coordinator"].includes(role),
        can_manage_campaigns: ["super_admin", "marketing_coordinator", "brand_coordinator"].includes(role),
        can_view_reports: role !== "new_user",
        is_active: true,
        granted_by: grantedBy,
        granted_at: new Date() as any
      };

      // في التطبيق الحقيقي، هنا راح نستخدم UserPermissionsRepository
      logger.info("🔐 User permissions created", { userId, role, grantedBy });
      
      return userPermissions as UserPermissions;
    } catch (error) {
      logger.error("❌ Error creating user permissions", { userId, role, grantedBy, error });
      throw new Error(`Failed to create user permissions: ${error}`);
    }
  }

  /**
   * ✅ التحقق من صلاحية مستخدم
   */
  async checkUserPermission(
    userId: ID, 
    permission: keyof Omit<UserPermissions, "id" | "user_id" | "role" | "brand_access" | "granted_by" | "granted_at" | "created_at" | "updated_at">
  ): Promise<boolean> {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user || !user.is_active) {
        return false;
      }

      // في التطبيق الحقيقي، هنا راح نجيب الصلاحيات من UserPermissionsRepository
      // للوقت الحالي، نرجع صلاحيات افتراضية حسب الدور
      const hasPermission = user.primary_role ? this.getDefaultPermissionByRole(user.primary_role, permission) : false;
      
      logger.info("✅ Permission checked", { userId, permission, hasPermission });
      return hasPermission;
    } catch (error) {
      logger.error("❌ Error checking user permission", { userId, permission, error });
      return false;
    }
  }

  /**
   * 🔐 الحصول على الصلاحيات الافتراضية حسب الدور
   */
  private getDefaultPermissionByRole(
    role: UserRole, 
    permission: keyof Omit<UserPermissions, "id" | "user_id" | "role" | "brand_access" | "granted_by" | "granted_at" | "created_at" | "updated_at">
  ): boolean {
    const permissions: Record<UserRole, Record<string, boolean>> = {
      super_admin: {
        can_approve_content: true,
        can_view_financials: true,
        can_manage_users: true,
        can_manage_brands: true,
        can_manage_campaigns: true,
        can_view_reports: true,
        is_active: true
      },
      marketing_coordinator: {
        can_approve_content: true,
        can_view_financials: true,
        can_manage_users: false,
        can_manage_brands: true,
        can_manage_campaigns: true,
        can_view_reports: true,
        is_active: true
      },
      brand_coordinator: {
        can_approve_content: false,
        can_view_financials: false,
        can_manage_users: false,
        can_manage_brands: false,
        can_manage_campaigns: true,
        can_view_reports: true,
        is_active: true
      },
      photographer: {
        can_approve_content: false,
        can_view_financials: false,
        can_manage_users: false,
        can_manage_brands: false,
        can_manage_campaigns: false,
        can_view_reports: true,
        is_active: true
      },
      new_user: {
        can_approve_content: false,
        can_view_financials: false,
        can_manage_users: false,
        can_manage_brands: false,
        can_manage_campaigns: false,
        can_view_reports: false,
        is_active: false
      }
    };

    return permissions[role]?.[permission] || false;
  }

  /**
   * 🔍 البحث المتقدم في المستخدمين
   */
  async searchUsers(filters: {
    searchTerm?: string;
    role?: UserRole;
    status?: UserStatus;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{
    users: User[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const { searchTerm, role, status, isActive, page = 1, limit = 10 } = filters;
      
      let users: User[] = [];

      if (searchTerm) {
        users = await this.userRepository.searchUsers(searchTerm);
      } else {
        users = await this.userRepository.findAll();
      }

      // تطبيق الفلاتر
      if (role) {
        users = users.filter(user => user.primary_role === role);
      }
      if (status) {
        users = users.filter(user => user.status === status);
      }
      if (isActive !== undefined) {
        users = users.filter(user => user.is_active === isActive);
      }

      // تطبيق الصفحات
      const total = users.length;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedUsers = users.slice(startIndex, endIndex);

      const result = {
        users: paginatedUsers,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };

      logger.info("🔍 User search completed", { 
        filters, 
        totalFound: total, 
        returned: paginatedUsers.length 
      });

      return result;
    } catch (error) {
      logger.error("❌ Error searching users", { filters, error });
      throw new Error(`Failed to search users: ${error}`);
    }
  }
} 
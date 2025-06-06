/**
 * 👥 User Repository - Depth Studio
 * =================================
 * 
 * 📅 محدث: ديسمبر 2024
 * 👨‍💻 المطور: علي جودت
 * 🎯 الهدف: إدارة المستخدمين بأنواع محكمة 100%
 */

import { User, UserRole, UserStatus, ID, FirebaseTimestamp } from "@/types";
import { BaseRepository, QueryOptions } from "./BaseRepository";
import { DATABASE_CONFIG } from "../config/firebase";
import { logger } from "firebase-functions";
import { FieldValue } from "firebase-admin/firestore";

/**
 * 👥 مستودع المستخدمين
 */
export class UserRepository extends BaseRepository<User> {
  constructor() {
    super(DATABASE_CONFIG.COLLECTIONS.USERS);
  }

  /**
   * 🔍 البحث عن مستخدم بالبريد الإلكتروني
   */
  async findByEmail(email: string): Promise<User | null> {
    try {
      const users = await this.findAll({
        where: [{ field: "email", operator: "==", value: email }],
        limit: 1
      });
      
      const user = users[0] || null;
      if (user) {
        logger.info("🔍 User found by email", { email, userId: user.id });
      }
      
      return user;
    } catch (error) {
      logger.error("❌ Error finding user by email", { email, error });
      throw new Error(`Failed to find user by email: ${error}`);
    }
  }

  /**
   * 🔍 البحث عن مستخدم بـ Firebase UID
   */
  async findByFirebaseUid(firebaseUid: string): Promise<User | null> {
    try {
      const users = await this.findAll({
        where: [{ field: "firebase_uid", operator: "==", value: firebaseUid }],
        limit: 1
      });
      
      const user = users[0] || null;
      if (user) {
        logger.info("🔍 User found by Firebase UID", { firebaseUid, userId: user.id });
      }
      
      return user;
    } catch (error) {
      logger.error("❌ Error finding user by Firebase UID", { firebaseUid, error });
      throw new Error(`Failed to find user by Firebase UID: ${error}`);
    }
  }

  /**
   * 👑 البحث عن المستخدمين حسب الدور
   */
  async findByRole(role: UserRole, options: QueryOptions = {}): Promise<User[]> {
    try {
      const queryOptions: QueryOptions = {
        ...options,
        where: [
          ...(options.where || []),
          { field: "primary_role", operator: "==", value: role }
        ]
      };

      const users = await this.findAll(queryOptions);
      logger.info("👑 Users found by role", { role, count: users.length });
      
      return users;
    } catch (error) {
      logger.error("❌ Error finding users by role", { role, error });
      throw new Error(`Failed to find users by role: ${error}`);
    }
  }

  /**
   * 📊 البحث عن المستخدمين حسب الحالة
   */
  async findByStatus(status: UserStatus, options: QueryOptions = {}): Promise<User[]> {
    try {
      const queryOptions: QueryOptions = {
        ...options,
        where: [
          ...(options.where || []),
          { field: "status", operator: "==", value: status }
        ]
      };

      const users = await this.findAll(queryOptions);
      logger.info("📊 Users found by status", { status, count: users.length });
      
      return users;
    } catch (error) {
      logger.error("❌ Error finding users by status", { status, error });
      throw new Error(`Failed to find users by status: ${error}`);
    }
  }

  /**
   * 🔄 تحديث حالة المستخدم
   */
  async updateStatus(userId: ID, status: UserStatus): Promise<User> {
    try {
      const updatedUser = await this.update(userId, { status });
      logger.info("🔄 User status updated", { userId, status });
      
      return updatedUser;
    } catch (error) {
      logger.error("❌ Error updating user status", { userId, status, error });
      throw new Error(`Failed to update user status: ${error}`);
    }
  }

  /**
   * 👑 تحديث دور المستخدم
   */
  async updateRole(userId: ID, role: UserRole): Promise<User> {
    try {
      const updatedUser = await this.update(userId, { primary_role: role });
      logger.info("👑 User role updated", { userId, role });
      
      return updatedUser;
    } catch (error) {
      logger.error("❌ Error updating user role", { userId, role, error });
      throw new Error(`Failed to update user role: ${error}`);
    }
  }

  /**
   * 🟢 تحديث حالة النشاط
   */
  async updateOnlineStatus(userId: ID, isOnline: boolean): Promise<User> {
    try {
      const baseUpdateData = { is_online: isOnline };
      const updateData = isOnline 
        ? baseUpdateData 
        : { 
            ...baseUpdateData, 
            last_seen: FieldValue.serverTimestamp() as unknown as FirebaseTimestamp 
          };

      const updatedUser = await this.update(userId, updateData);
      logger.info("🟢 User online status updated", { userId, isOnline });
      
      return updatedUser;
    } catch (error) {
      logger.error("❌ Error updating user online status", { userId, isOnline, error });
      throw new Error(`Failed to update user online status: ${error}`);
    }
  }

  /**
   * 🔍 البحث النصي في المستخدمين
   */
  async searchUsers(searchTerm: string, options: QueryOptions = {}): Promise<User[]> {
    try {
      // البحث في الاسم الأول، الاسم الأخير، والبريد الإلكتروني
      const searchQueries = [
        this.findAll({
          ...options,
          where: [
            ...(options.where || []),
            { field: "first_name", operator: ">=", value: searchTerm },
            { field: "first_name", operator: "<=", value: searchTerm + '\uf8ff' }
          ]
        }),
        this.findAll({
          ...options,
          where: [
            ...(options.where || []),
            { field: "last_name", operator: ">=", value: searchTerm },
            { field: "last_name", operator: "<=", value: searchTerm + '\uf8ff' }
          ]
        }),
        this.findAll({
          ...options,
          where: [
            ...(options.where || []),
            { field: "email", operator: ">=", value: searchTerm },
            { field: "email", operator: "<=", value: searchTerm + '\uf8ff' }
          ]
        })
      ];

      const results = await Promise.all(searchQueries);
      const allUsers = results.flat();
      
      // إزالة المكررات
      const uniqueUsers = allUsers.filter((user, index, self) => 
        index === self.findIndex(u => u.id === user.id)
      );

      logger.info("🔍 User search completed", { 
        searchTerm, 
        totalFound: uniqueUsers.length 
      });
      
      return uniqueUsers;
    } catch (error) {
      logger.error("❌ Error searching users", { searchTerm, error });
      throw new Error(`Failed to search users: ${error}`);
    }
  }
} 
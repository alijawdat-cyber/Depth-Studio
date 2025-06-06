/**
 * 👥 User Controller - Depth Studio
 * =================================
 * 
 * 📅 محدث: ديسمبر 2024
 * 👨‍💻 المطور: علي جودت
 * 🎯 الهدف: HTTP endpoints للمستخدمين بأنواع محكمة 100%
 */

import { Request, Response } from "express";
import { UserService } from "../services/UserService";
import { UserRole, UserStatus, ID } from "@/types";
import { logger } from "firebase-functions";

/**
 * 👥 تحكم المستخدمين
 */
export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  /**
   * 📝 إنشاء مستخدم جديد
   */
  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, firstName, lastName, phone, primaryRole } = req.body;

      // التحقق من البيانات المطلوبة
      if (!email || !password || !firstName || !lastName || !primaryRole) {
        res.status(400).json({
          success: false,
          message: "Missing required fields",
          required: ["email", "password", "firstName", "lastName", "primaryRole"]
        });
        return;
      }

      const result = await this.userService.createUser({
        email,
        password,
        firstName,
        lastName,
        phone,
        primaryRole: primaryRole as UserRole
      });

      res.status(201).json({
        success: true,
        message: "User created successfully",
        data: {
          user: result.user,
          firebaseUid: result.firebaseUser.uid
        }
      });

      logger.info("👥 User created via API", { 
        userId: result.user.id, 
        email: result.user.email 
      });
    } catch (error) {
      logger.error("❌ Error in createUser controller", error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Internal server error"
      });
    }
  }

  /**
   * 🔍 البحث عن مستخدم
   */
  async getUser(req: Request, res: Response): Promise<void> {
    try {
      const { id, email, firebaseUid } = req.query;

      if (!id && !email && !firebaseUid) {
        res.status(400).json({
          success: false,
          message: "Please provide id, email, or firebaseUid"
        });
        return;
      }

      const user = await this.userService.findUser({
        id: id as string,
        email: email as string,
        firebaseUid: firebaseUid as string
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message: "User not found"
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: { user }
      });
    } catch (error) {
      logger.error("❌ Error in getUser controller", error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Internal server error"
      });
    }
  }

  /**
   * ✅ الموافقة على مستخدم
   */
  async approveUser(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { approvedBy } = req.body;

      if (!approvedBy) {
        res.status(400).json({
          success: false,
          message: "approvedBy is required"
        });
        return;
      }

      const user = await this.userService.approveUser(userId as ID, approvedBy as ID);

      res.status(200).json({
        success: true,
        message: "User approved successfully",
        data: { user }
      });

      logger.info("✅ User approved via API", { userId, approvedBy });
    } catch (error) {
      logger.error("❌ Error in approveUser controller", error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Internal server error"
      });
    }
  }

  /**
   * 🔑 تحديث دور المستخدم
   */
  async updateUserRole(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { newRole, updatedBy } = req.body;

      if (!newRole || !updatedBy) {
        res.status(400).json({
          success: false,
          message: "newRole and updatedBy are required"
        });
        return;
      }

      const user = await this.userService.updateUserRole(
        userId as ID,
        newRole as UserRole,
        updatedBy as ID
      );

      res.status(200).json({
        success: true,
        message: "User role updated successfully",
        data: { user }
      });

      logger.info("🔑 User role updated via API", { userId, newRole, updatedBy });
    } catch (error) {
      logger.error("❌ Error in updateUserRole controller", error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Internal server error"
      });
    }
  }

  /**
   * 🔍 البحث المتقدم في المستخدمين
   */
  async searchUsers(req: Request, res: Response): Promise<void> {
    try {
      const { 
        searchTerm, 
        role, 
        status, 
        isActive, 
        page = "1", 
        limit = "10" 
      } = req.query;

      const filters: {
        searchTerm?: string;
        role?: UserRole;
        status?: UserStatus;
        isActive?: boolean;
        page?: number;
        limit?: number;
      } = {
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      };

      if (searchTerm) filters.searchTerm = searchTerm as string;
      if (role) filters.role = role as UserRole;
      if (status) filters.status = status as UserStatus;
      if (isActive === "true") filters.isActive = true;
      if (isActive === "false") filters.isActive = false;

      const result = await this.userService.searchUsers(filters);

      res.status(200).json({
        success: true,
        data: result
      });

      logger.info("🔍 Users searched via API", { filters, found: result.total });
    } catch (error) {
      logger.error("❌ Error in searchUsers controller", error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Internal server error"
      });
    }
  }

  /**
   * 📊 إحصائيات المستخدمين
   */
  async getUserStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await this.userService.getUserStats();

      res.status(200).json({
        success: true,
        data: { stats }
      });

      logger.info("📊 User stats retrieved via API");
    } catch (error) {
      logger.error("❌ Error in getUserStats controller", error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Internal server error"
      });
    }
  }

  /**
   * 🔐 التحقق من صلاحية
   */
  async checkPermission(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { permission } = req.query;

      if (!permission) {
        res.status(400).json({
          success: false,
          message: "permission parameter is required"
        });
        return;
      }

      const hasPermission = await this.userService.checkUserPermission(
        userId as ID,
        permission as any
      );

      res.status(200).json({
        success: true,
        data: { 
          userId,
          permission,
          hasPermission 
        }
      });
    } catch (error) {
      logger.error("❌ Error in checkPermission controller", error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Internal server error"
      });
    }
  }
} 
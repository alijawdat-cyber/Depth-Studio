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
import { UserRole, UserStatus } from "../../../types/src/core/enums";
import { ID } from "../../../types/src/core/base";
import { logger } from "firebase-functions";
import {
  CreateUserInput,
  GetUserInput,
  UpdateUserRoleBodyInput,
  SearchUsersInput,
  UserParamsInput
} from "../validators/UserValidators";

/**
 * 👥 تحكم المستخدمين
 * 
 * ملاحظة: جميع التحقق من البيانات يتم عبر middleware
 * في routes، لذلك البيانات هنا مضمونة الصحة
 */
export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  /**
   * 📝 إنشاء مستخدم جديد
   * البيانات محققة عبر validateCreateUser middleware
   */
  async createUser(req: Request<{}, {}, CreateUserInput>, res: Response): Promise<void> {
    try {
      const { email, password, firstName, lastName, phone, primaryRole } = req.body;

      const result = await this.userService.createUser({
        email,
        password,
        firstName,
        lastName,
        ...(phone && { phone }),
        primaryRole: primaryRole as UserRole
      });

      res.status(201).json({
        success: true,
        message: "تم إنشاء المستخدم بنجاح",
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
        message: error instanceof Error ? error.message : "خطأ داخلي في الخادم"
      });
    }
  }

  /**
   * 🔍 البحث عن مستخدم
   * البيانات محققة عبر validateGetUser middleware
   */
  async getUser(req: Request<{}, {}, {}, GetUserInput>, res: Response): Promise<void> {
    try {
      const { id, email, firebaseUid } = req.query;

      const user = await this.userService.findUser({
        id: id as string,
        email: email as string,
        firebaseUid: firebaseUid as string
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message: "المستخدم غير موجود"
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
        message: error instanceof Error ? error.message : "خطأ داخلي في الخادم"
      });
    }
  }

  /**
   * ✅ الموافقة على مستخدم
   * البيانات محققة عبر validateApproveUserParams و validateApproveUserBody middleware
   */
  async approveUser(req: Request<UserParamsInput, {}, { approvedBy: string }>, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { approvedBy } = req.body;

      const user = await this.userService.approveUser(userId as ID, approvedBy as ID);

      res.status(200).json({
        success: true,
        message: "تم الموافقة على المستخدم بنجاح",
        data: { user }
      });

      logger.info("✅ User approved via API", { userId, approvedBy });
    } catch (error) {
      logger.error("❌ Error in approveUser controller", error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "خطأ داخلي في الخادم"
      });
    }
  }

  /**
   * 🔑 تحديث دور المستخدم
   * البيانات محققة عبر validateUpdateUserRoleParams و validateUpdateUserRoleBody middleware
   * @param req Request contains UpdateUserRoleInput data split between params and body
   */
  async updateUserRole(req: Request<UserParamsInput, {}, UpdateUserRoleBodyInput>, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { newRole, updatedBy } = req.body;

      const user = await this.userService.updateUserRole(
        userId as ID,
        newRole as UserRole,
        updatedBy as ID
      );

      res.status(200).json({
        success: true,
        message: "تم تحديث دور المستخدم بنجاح",
        data: { user }
      });

      logger.info("🔑 User role updated via API", { userId, newRole, updatedBy });
    } catch (error) {
      logger.error("❌ Error in updateUserRole controller", error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "خطأ داخلي في الخادم"
      });
    }
  }

  /**
   * 🔍 البحث المتقدم في المستخدمين
   * البيانات محققة عبر validateSearchUsers middleware
   */
  async searchUsers(req: Request, res: Response): Promise<void> {
    try {
      // Type assertion لضمان استخدام SearchUsersInput structure
      const query = req.query as unknown as SearchUsersInput;
      const { searchTerm, role, status, isActive, page, limit, search } = query;

      const filters: {
        searchTerm?: string;
        role?: UserRole;
        status?: UserStatus;
        isActive?: boolean;
        page?: number;
        limit?: number;
      } = {
        page: typeof page === 'number' ? page : parseInt((page as string) || "1"),
        limit: typeof limit === 'number' ? limit : parseInt((limit as string) || "10")
      };

      if (searchTerm) filters.searchTerm = searchTerm as string;
      if (search) filters.searchTerm = search as string; // دعم كلا المعاملين
      if (role) filters.role = role as UserRole;
      if (status) filters.status = status as UserStatus;
      if (typeof isActive === 'boolean') filters.isActive = isActive;
      else if (isActive === "true") filters.isActive = true;
      else if (isActive === "false") filters.isActive = false;

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
        message: error instanceof Error ? error.message : "خطأ داخلي في الخادم"
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
        message: error instanceof Error ? error.message : "خطأ داخلي في الخادم"
      });
    }
  }

  /**
   * 🔐 التحقق من صلاحية
   * البيانات محققة عبر validateUserParams middleware
   * permission يأتي من query params
   */
  async checkPermission(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { permission } = req.query;

      if (!permission) {
        res.status(400).json({
          success: false,
          message: "معايير البحث مطلوبة"
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
        message: error instanceof Error ? error.message : "خطأ داخلي في الخادم"
      });
    }
  }
} 
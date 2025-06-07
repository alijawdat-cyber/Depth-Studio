/**
 * 👥 User Repository - Depth Studio
 * =================================
 * 
 * 📅 محدث: ديسمبر 2024
 * 👨‍💻 المطور: علي جودت
 * 🎯 الهدف: إدارة المستخدمين بأنواع محكمة 100%
 */

import { 
  User, 
  UserRole, 
  UserStatus, 
  ID, 
  FirebaseTimestamp,
  AuthMethod,
  RoleSelection 
} from "@depth-studio/types";
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
   * 📱 البحث عن مستخدم برقم الهاتف
   */
  async findByPhone(phone: string): Promise<User | null> {
    try {
      const users = await this.findAll({
        where: [{ field: "phone", operator: "==", value: phone }],
        limit: 1
      });
      
      const user = users[0] || null;
      if (user) {
        logger.info("📱 User found by phone", { phone, userId: user.id });
      }
      
      return user;
    } catch (error) {
      logger.error("❌ Error finding user by phone", { phone, error });
      throw new Error(`Failed to find user by phone: ${error}`);
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

  // ======================================
  // 🔐 Multi-Authentication Support Methods
  // ======================================

  /**
   * 🌐 البحث عن مستخدم بـ Google ID
   */
  async findByGoogleId(googleId: string): Promise<User | null> {
    try {
      const users = await this.findAll({
        where: [
          { 
            field: "auth_methods", 
            operator: "array-contains-any", 
            value: [{ type: 'google', metadata: { google_id: googleId } }] 
          }
        ],
        limit: 1
      });
      
      const user = users[0] || null;
      if (user) {
        logger.info("🌐 User found by Google ID", { googleId, userId: user.id });
      }
      
      return user;
    } catch (error) {
      logger.error("❌ Error finding user by Google ID", { googleId, error });
      throw new Error(`Failed to find user by Google ID: ${error}`);
    }
  }

  /**
   * 🔗 إنشاء مستخدم مع طريقة مصادقة
   */
  async createWithAuthMethod(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>, authMethod: AuthMethod): Promise<User> {
    try {
      // إضافة طريقة المصادقة إلى بيانات المستخدم
      const userWithAuth: Omit<User, 'id' | 'created_at' | 'updated_at'> = {
        ...userData,
        auth_methods: [authMethod],
        registration_method: authMethod.type,
        phone_verified: authMethod.type === 'phone' && authMethod.verified,
        google_linked: authMethod.type === 'google',
        role_selected: false,
        role_selection_history: [],
        status: 'pending_role_setup',
        is_verified: authMethod.verified
      };

      const newUser = await this.create(userWithAuth);
      
      logger.info("🔗 User created with auth method", { 
        userId: newUser.id, 
        authMethod: authMethod.type 
      });
      
      return newUser;
    } catch (error) {
      logger.error("❌ Error creating user with auth method", { 
        userData, 
        authMethod, 
        error 
      });
      throw new Error(`Failed to create user with auth method: ${error}`);
    }
  }

  /**
   * 🔄 تحديث طرق المصادقة للمستخدم
   */
  async updateAuthMethods(userId: ID, authMethods: AuthMethod[]): Promise<User> {
    try {
      // تحديث طرق المصادقة مع الاحتفاظ بالبيانات الأخرى
      const updateData = {
        auth_methods: authMethods,
        google_linked: authMethods.some(method => method.type === 'google'),
        phone_verified: authMethods.some(method => 
          method.type === 'phone' && method.verified
        )
      };

      const updatedUser = await this.update(userId, updateData);
      
      logger.info("🔄 User auth methods updated", { 
        userId, 
        methodsCount: authMethods.length 
      });
      
      return updatedUser;
    } catch (error) {
      logger.error("❌ Error updating user auth methods", { 
        userId, 
        authMethods, 
        error 
      });
      throw new Error(`Failed to update user auth methods: ${error}`);
    }
  }

  /**
   * 🎭 البحث عن طلبات اختيار الأدوار المنتظرة
   * ملاحظة: هذا method يتطلب إنشاء Firebase Collection منفصلة
   */
  async findPendingRoleSelections(options: QueryOptions = {}): Promise<RoleSelection[]> {
    try {
      // البحث في مجموعة role_applications في Firestore
      const roleSelections = await this.firestore
        .collection('role_applications')
        .where('status', '==', 'pending')
        .orderBy('applied_at', 'desc')
        .get();

      const results: RoleSelection[] = [];
      roleSelections.forEach((doc: FirebaseFirestore.QueryDocumentSnapshot) => {
        results.push({ 
          id: doc.id, 
          ...doc.data() 
        } as RoleSelection);
      });

      logger.info("🎭 Pending role selections found", { count: results.length });
      
      return results;
    } catch (error) {
      logger.error("❌ Error finding pending role selections", { error });
      throw new Error(`Failed to find pending role selections: ${error}`);
    }
  }

  /**
   * ✅ الموافقة على طلب اختيار دور
   */
  async approveRoleSelection(
    roleSelectionId: ID, 
    approvedBy: ID, 
    adminNotes?: string
  ): Promise<RoleSelection> {
    try {
      // الحصول على طلب اختيار الدور
      const roleSelectionDoc = await this.firestore
        .collection('role_applications')
        .doc(roleSelectionId)
        .get();

      if (!roleSelectionDoc.exists) {
        throw new Error('Role selection not found');
      }

      const roleSelection = { 
        id: roleSelectionDoc.id, 
        ...roleSelectionDoc.data() 
      } as RoleSelection;

      // تحديث طلب اختيار الدور
      const updatedRoleSelection: Partial<RoleSelection> = {
        status: 'approved',
        approved_by: approvedBy,
        reviewed_at: FieldValue.serverTimestamp() as unknown as FirebaseTimestamp,
        admin_notes: adminNotes || ''
      };

      await this.firestore
        .collection('role_applications')
        .doc(roleSelectionId)
        .update(updatedRoleSelection);

      // تحديث دور المستخدم في جدول المستخدمين
      await this.update(roleSelection.user_id, {
        role: roleSelection.selected_role,
        primary_role: roleSelection.selected_role,
        role_selected: true,
        status: 'active'
      });

      const result = { 
        ...roleSelection, 
        ...updatedRoleSelection 
      } as RoleSelection;

      logger.info("✅ Role selection approved", { 
        roleSelectionId, 
        userId: roleSelection.user_id,
        role: roleSelection.selected_role,
        approvedBy 
      });
      
      return result;
    } catch (error) {
      logger.error("❌ Error approving role selection", { 
        roleSelectionId, 
        approvedBy, 
        error 
      });
      throw new Error(`Failed to approve role selection: ${error}`);
    }
  }

  /**
   * ❌ رفض طلب اختيار دور
   */
  async rejectRoleSelection(
    roleSelectionId: ID, 
    rejectedBy: ID, 
    rejectionReason: string, 
    adminNotes?: string
  ): Promise<RoleSelection> {
    try {
      // الحصول على طلب اختيار الدور
      const roleSelectionDoc = await this.firestore
        .collection('role_applications')
        .doc(roleSelectionId)
        .get();

      if (!roleSelectionDoc.exists) {
        throw new Error('Role selection not found');
      }

      const roleSelection = { 
        id: roleSelectionDoc.id, 
        ...roleSelectionDoc.data() 
      } as RoleSelection;

      // تحديث طلب اختيار الدور
      const updatedRoleSelection: Partial<RoleSelection> = {
        status: 'rejected',
        approved_by: rejectedBy,
        reviewed_at: FieldValue.serverTimestamp() as unknown as FirebaseTimestamp,
        rejection_reason: rejectionReason,
        admin_notes: adminNotes || ''
      };

      await this.firestore
        .collection('role_applications')
        .doc(roleSelectionId)
        .update(updatedRoleSelection);

      const result = { 
        ...roleSelection, 
        ...updatedRoleSelection 
      } as RoleSelection;

      logger.info("❌ Role selection rejected", { 
        roleSelectionId, 
        userId: roleSelection.user_id,
        role: roleSelection.selected_role,
        rejectedBy,
        reason: rejectionReason 
      });
      
      return result;
    } catch (error) {
      logger.error("❌ Error rejecting role selection", { 
        roleSelectionId, 
        rejectedBy, 
        rejectionReason, 
        error 
      });
      throw new Error(`Failed to reject role selection: ${error}`);
    }
  }

  /**
   * 📋 جلب طرق المصادقة لمستخدم محدد
   */
  async getUserAuthMethods(userId: ID): Promise<AuthMethod[]> {
    try {
      const user = await this.findById(userId);
      
      if (!user) {
        throw new Error('User not found');
      }

      const authMethods = user.auth_methods || [];
      
      logger.info("📋 User auth methods retrieved", { 
        userId, 
        methodsCount: authMethods.length 
      });
      
      return authMethods;
    } catch (error) {
      logger.error("❌ Error getting user auth methods", { userId, error });
      throw new Error(`Failed to get user auth methods: ${error}`);
    }
  }
} 
/**
 * 🎭 خدمة اختيار الأدوار - Depth Studio
 * ======================================
 * 
 * 📅 محدث: ديسمبر 2024
 * 👨‍💻 المطور: علي جودت
 * 🎯 الهدف: إدارة عملية اختيار الأدوار بالكامل
 * 
 * 🎭 الأدوار المدعومة:
 * - منسق التسويق (marketing_coordinator)
 * - منسق البراند (brand_coordinator) 
 * - مصور (photographer)
 * 
 * 🔑 المميزات:
 * - تقديم طلبات اختيار الأدوار
 * - البحث عن البراندات للمنسقين
 * - أنواع العقود للمصورين
 * - موافقة/رفض الطلبات مع الأسباب
 * - إشعارات قرارات الأدوار
 * - إحصائيات شاملة
 */

import { 
  Firestore,
  FieldValue,
  Timestamp 
} from 'firebase-admin/firestore';
import { db } from '../config/firebase';
import { UserRepository } from '../repositories/UserRepository';
import { NotificationService } from './NotificationService';
import { logger } from 'firebase-functions';

import {
  RoleSelection,
  RoleSelectionSubmission,
  RoleSelectionStats,
  User,
  Brand,
  ID,
  UserRole,
  ContractType,
  BrandType,
  BrandStatus,
  Industry,
  FirebaseTimestamp,
  NotificationType
} from '../../../types/src';

/**
 * 🎭 خدمة اختيار الأدوار الشاملة
 */
export class RoleSelectionService {
  private firestore: Firestore;
  private userRepository: UserRepository;
  private notificationService: NotificationService;

  // الأدوار المسموحة للاختيار
  private readonly allowedRoles: UserRole[] = [
    'marketing_coordinator',
    'brand_coordinator', 
    'photographer'
  ];

  // أنواع العقود المتاحة للمصورين
  private readonly contractTypes: ContractType[] = [
    'freelancer',
    'salary'
  ];

  constructor() {
    this.firestore = db;
    this.userRepository = new UserRepository();
    this.notificationService = new NotificationService();
  }

  // ======================================
  // 📝 تقديم طلبات اختيار الأدوار
  // ======================================

  /**
   * تقديم طلب اختيار دور جديد
   */
  async submitRoleSelection(
    userId: ID, 
    submission: RoleSelectionSubmission
  ): Promise<{ success: boolean; roleSelection?: RoleSelection; message: string }> {
    try {
      // التحقق من صحة الدور المطلوب
      if (!this.isRoleAllowed(submission.selected_role)) {
        return {
          success: false,
          message: 'الدور المطلوب غير مدعوم'
        };
      }

      // التحقق من وجود المستخدم
      const user = await this.userRepository.findById(userId);
      if (!user) {
        return {
          success: false,
          message: 'المستخدم غير موجود'
        };
      }

      // التحقق من عدم وجود طلب منتظر مسبقاً
      const existingApplication = await this.getUserPendingApplication(userId);
      if (existingApplication) {
        return {
          success: false,
          message: 'لديك طلب منتظر موافقة بالفعل'
        };
      }

      // التحقق من متطلبات الدور
      const roleValidation = await this.validateRoleRequirements(submission.selected_role, submission.additional_data);
      if (!roleValidation.isValid) {
        return {
          success: false,
          message: roleValidation.message
        };
      }

      // إنشاء طلب اختيار الدور
      const roleSelection: Omit<RoleSelection, 'id' | 'created_at' | 'updated_at'> = {
        user_id: userId,
        selected_role: submission.selected_role,
        additional_data: submission.additional_data || {},
        status: 'pending',
        applied_at: Timestamp.now() as FirebaseTimestamp
      };

      // حفظ الطلب في Firestore
      const docRef = await this.firestore
        .collection('role_applications')
        .add(roleSelection);

      const savedRoleSelection: RoleSelection = {
        id: docRef.id,
        ...roleSelection,
        created_at: Timestamp.now() as FirebaseTimestamp,
        updated_at: Timestamp.now() as FirebaseTimestamp
      };

      // تحديث حالة المستخدم
      await this.userRepository.update(userId, {
        status: 'pending_approval',
        role_selection_history: FieldValue.arrayUnion(savedRoleSelection) as any
      });

      // إرسال إشعار للأدمنز
      await this.notifyAdminsOfNewApplication(savedRoleSelection, user);

      logger.info('🎭 تم تقديم طلب اختيار دور', { 
        userId, 
        role: submission.selected_role,
        applicationId: savedRoleSelection.id 
      });

      return {
        success: true,
        roleSelection: savedRoleSelection,
        message: 'تم تقديم طلبك بنجاح وهو قيد المراجعة'
      };

    } catch (error) {
      logger.error('❌ خطأ في تقديم طلب اختيار الدور', { userId, submission, error });
      return {
        success: false,
        message: 'خطأ في تقديم الطلب'
      };
    }
  }

  // ======================================
  // 🔍 البحث والاستعلامات
  // ======================================

  /**
   * البحث عن البراندات لمنسقي البراند
   */
  async searchBrandsForCoordinator(
    searchQuery: string,
    filters?: {
      brand_type?: BrandType;
      industry?: Industry;
      status?: BrandStatus;
      has_coordinator?: boolean;
    }
  ): Promise<{ brands: Brand[]; total: number; message: string }> {
    try {
      let query = this.firestore.collection('brands').where('status', '==', 'active');

      // تطبيق الفلاتر
      if (filters?.brand_type) {
        query = query.where('brand_type', '==', filters.brand_type);
      }
      if (filters?.industry) {
        query = query.where('industry', '==', filters.industry);
      }
      if (filters?.has_coordinator === false) {
        query = query.where('assigned_coordinator', '==', null);
      }

      const snapshot = await query.limit(50).get();
      const brands: Brand[] = [];

      snapshot.forEach((doc) => {
        const brandData = { id: doc.id, ...doc.data() } as Brand;
        
        // البحث النصي في الاسم والوصف
        const nameMatch = brandData.name.ar?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         brandData.name.en?.toLowerCase().includes(searchQuery.toLowerCase());
        const descMatch = brandData.description.ar?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         brandData.description.en?.toLowerCase().includes(searchQuery.toLowerCase());

        if (!searchQuery || nameMatch || descMatch) {
          brands.push(brandData);
        }
      });

      logger.info('🔍 البحث عن البراندات', { 
        searchQuery, 
        filters, 
        resultsCount: brands.length 
      });

      return {
        brands,
        total: brands.length,
        message: `تم العثور على ${brands.length} براند`
      };

    } catch (error) {
      logger.error('❌ خطأ في البحث عن البراندات', { searchQuery, filters, error });
      return {
        brands: [],
        total: 0,
        message: 'خطأ في البحث'
      };
    }
  }

  /**
   * الحصول على أنواع العقود المتاحة للمصورين
   */
  async getContractTypesForPhotographer(): Promise<{
    contract_types: Array<{
      type: ContractType;
      name_ar: string;
      name_en: string;
      description: string;
      benefits: string[];
    }>;
    message: string;
  }> {
    try {
      const contractTypesDetails = [
        {
          type: 'freelancer' as ContractType,
          name_ar: 'مصور حر',
          name_en: 'Freelancer',
          description: 'العمل كمصور مستقل مع مرونة في الوقت والمشاريع',
          benefits: [
            'مرونة في اختيار المشاريع',
            'أجور أعلى للمشاريع المتخصصة',
            'العمل مع عدة براندات',
            'جدولة زمنية مرنة',
            'فرصة بناء محفظة متنوعة'
          ]
        },
        {
          type: 'salary' as ContractType,
          name_ar: 'مصور براتب ثابت',
          name_en: 'Salaried Employee',
          description: 'العمل كموظف براتب ثابت مع استقرار مالي',
          benefits: [
            'راتب ثابت شهري',
            'استقرار مالي ووظيفي',
            'إجازات مدفوعة',
            'تأمين صحي',
            'فرص التطوير المهني',
            'معدات مجانية'
          ]
        }
      ];

      logger.info('📋 جلب أنواع العقود للمصورين');

      return {
        contract_types: contractTypesDetails,
        message: 'تم جلب أنواع العقود بنجاح'
      };

    } catch (error) {
      logger.error('❌ خطأ في جلب أنواع العقود', { error });
      return {
        contract_types: [],
        message: 'خطأ في جلب أنواع العقود'
      };
    }
  }

  /**
   * جلب طلبات الأدوار المنتظرة موافقة (للأدمن)
   */
  async getPendingRoleApplications(
    filters?: {
      role?: UserRole;
      limit?: number;
      orderBy?: 'applied_at' | 'updated_at';
      orderDirection?: 'asc' | 'desc';
    }
  ): Promise<{ applications: RoleSelection[]; total: number; message: string }> {
    try {
      let query = this.firestore
        .collection('role_applications')
        .where('status', '==', 'pending');

      // تطبيق الفلاتر
      if (filters?.role) {
        query = query.where('selected_role', '==', filters.role);
      }

      // الترتيب
      const orderBy = filters?.orderBy || 'applied_at';
      const orderDirection = filters?.orderDirection || 'desc';
      query = query.orderBy(orderBy, orderDirection);

      // الحد الأقصى
      const limit = filters?.limit || 50;
      query = query.limit(limit);

      const snapshot = await query.get();
      const applications: RoleSelection[] = [];

      for (const doc of snapshot.docs) {
        const applicationData = { id: doc.id, ...doc.data() } as RoleSelection;
        
        // جلب بيانات المستخدم
        const user = await this.userRepository.findById(applicationData.user_id);
        if (user) {
          applications.push({
            ...applicationData,
            user_info: {
              full_name: user.full_name,
              email: user.email,
              phone: user.phone
            }
          } as any);
        }
      }

      logger.info('📋 جلب طلبات الأدوار المنتظرة', { 
        filters, 
        count: applications.length 
      });

      return {
        applications,
        total: applications.length,
        message: `تم العثور على ${applications.length} طلب منتظر`
      };

    } catch (error) {
      logger.error('❌ خطأ في جلب طلبات الأدوار المنتظرة', { filters, error });
      return {
        applications: [],
        total: 0,
        message: 'خطأ في جلب الطلبات'
      };
    }
  }

  // ======================================
  // ✅ موافقة ورفض الطلبات
  // ======================================

  /**
   * الموافقة على طلب اختيار دور
   */
  async approveRoleApplication(
    applicationId: ID,
    approvedBy: ID,
    adminNotes?: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // الحصول على الطلب
      const applicationDoc = await this.firestore
        .collection('role_applications')
        .doc(applicationId)
        .get();

      if (!applicationDoc.exists) {
        return {
          success: false,
          message: 'الطلب غير موجود'
        };
      }

      const application = { id: applicationDoc.id, ...applicationDoc.data() } as RoleSelection;

      if (application.status !== 'pending') {
        return {
          success: false,
          message: 'الطلب تمت مراجعته مسبقاً'
        };
      }

      // تحديث حالة الطلب
      await this.firestore
        .collection('role_applications')
        .doc(applicationId)
        .update({
          status: 'approved',
          approved_by: approvedBy,
          reviewed_at: Timestamp.now(),
          admin_notes: adminNotes || '',
          updated_at: Timestamp.now()
        });

      // تحديث دور المستخدم
      await this.userRepository.update(application.user_id, {
        role: application.selected_role,
        primary_role: application.selected_role,
        role_selected: true,
        status: 'active'
      });

      // إرسال إشعار للمستخدم
      await this.notifyRoleDecision(application.user_id, 'approved', application.selected_role, adminNotes);

      // إذا كان منسق براند، تحديث البراند المختار
      if (application.selected_role === 'brand_coordinator' && application.additional_data?.selected_brand_id) {
        await this.assignCoordinatorToBrand(
          application.additional_data.selected_brand_id,
          application.user_id
        );
      }

      logger.info('✅ تمت الموافقة على طلب اختيار الدور', { 
        applicationId, 
        userId: application.user_id,
        role: application.selected_role,
        approvedBy 
      });

      return {
        success: true,
        message: 'تمت الموافقة على الطلب بنجاح'
      };

    } catch (error) {
      logger.error('❌ خطأ في الموافقة على طلب اختيار الدور', { 
        applicationId, 
        approvedBy, 
        error 
      });
      return {
        success: false,
        message: 'خطأ في الموافقة على الطلب'
      };
    }
  }

  /**
   * رفض طلب اختيار دور مع الأسباب
   */
  async rejectRoleApplication(
    applicationId: ID,
    rejectedBy: ID,
    rejectionReason: string,
    adminNotes?: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // الحصول على الطلب
      const applicationDoc = await this.firestore
        .collection('role_applications')
        .doc(applicationId)
        .get();

      if (!applicationDoc.exists) {
        return {
          success: false,
          message: 'الطلب غير موجود'
        };
      }

      const application = { id: applicationDoc.id, ...applicationDoc.data() } as RoleSelection;

      if (application.status !== 'pending') {
        return {
          success: false,
          message: 'الطلب تمت مراجعته مسبقاً'
        };
      }

      // تحديث حالة الطلب
      await this.firestore
        .collection('role_applications')
        .doc(applicationId)
        .update({
          status: 'rejected',
          approved_by: rejectedBy,
          reviewed_at: Timestamp.now(),
          rejection_reason: rejectionReason,
          admin_notes: adminNotes || '',
          updated_at: Timestamp.now()
        });

      // تحديث حالة المستخدم للسماح بطلب جديد
      await this.userRepository.update(application.user_id, {
        status: 'pending_role_setup'
      });

      // إرسال إشعار للمستخدم
      await this.notifyRoleDecision(
        application.user_id, 
        'rejected', 
        application.selected_role, 
        rejectionReason,
        adminNotes
      );

      logger.info('❌ تم رفض طلب اختيار الدور', { 
        applicationId, 
        userId: application.user_id,
        role: application.selected_role,
        rejectedBy,
        reason: rejectionReason 
      });

      return {
        success: true,
        message: 'تم رفض الطلب بنجاح'
      };

    } catch (error) {
      logger.error('❌ خطأ في رفض طلب اختيار الدور', { 
        applicationId, 
        rejectedBy, 
        rejectionReason, 
        error 
      });
      return {
        success: false,
        message: 'خطأ في رفض الطلب'
      };
    }
  }

  // ======================================
  // 📊 إحصائيات اختيار الأدوار
  // ======================================

  /**
   * جلب إحصائيات اختيار الأدوار الشاملة
   */
  async getRoleSelectionStats(
    dateRange?: {
      startDate: FirebaseTimestamp;
      endDate: FirebaseTimestamp;
    }
  ): Promise<{ stats: RoleSelectionStats; message: string }> {
    try {
      let query: any = this.firestore.collection('role_applications');

      // تطبيق نطاق التاريخ إذا تم تحديده
      if (dateRange) {
        query = query
          .where('applied_at', '>=', dateRange.startDate)
          .where('applied_at', '<=', dateRange.endDate);
      }

      const snapshot = await query.get();
      const applications: RoleSelection[] = [];

      snapshot.forEach((doc: any) => {
        applications.push({ id: doc.id, ...doc.data() } as RoleSelection);
      });

      // حساب الإحصائيات
      const stats: RoleSelectionStats = {
        total_applications: applications.length,
        pending_applications: applications.filter(app => app.status === 'pending').length,
        approved_applications: applications.filter(app => app.status === 'approved').length,
        rejected_applications: applications.filter(app => app.status === 'rejected').length,
        applications_by_role: {},
        average_approval_time_hours: 0,
        approval_rate_percentage: 0
      };

      // إحصائيات حسب الدور
      this.allowedRoles.forEach(role => {
        stats.applications_by_role[role] = applications.filter(app => app.selected_role === role).length;
      });

      // حساب متوسط وقت الموافقة
      const approvedApps = applications.filter(app => app.status === 'approved' && app.reviewed_at);
      if (approvedApps.length > 0) {
        const totalHours = approvedApps.reduce((sum, app) => {
          const appliedTime = app.applied_at.toDate().getTime();
          const reviewedTime = app.reviewed_at!.toDate().getTime();
          return sum + (reviewedTime - appliedTime) / (1000 * 60 * 60);
        }, 0);
        stats.average_approval_time_hours = Math.round(totalHours / approvedApps.length);
      }

      // حساب نسبة الموافقة
      const reviewedApps = applications.filter(app => app.status !== 'pending');
      if (reviewedApps.length > 0) {
        stats.approval_rate_percentage = Math.round(
          (stats.approved_applications / reviewedApps.length) * 100
        );
      }

      logger.info('📊 جلب إحصائيات اختيار الأدوار', { 
        dateRange, 
        totalApps: stats.total_applications 
      });

      return {
        stats,
        message: 'تم جلب الإحصائيات بنجاح'
      };

    } catch (error) {
      logger.error('❌ خطأ في جلب إحصائيات اختيار الأدوار', { dateRange, error });
      return {
        stats: {
          total_applications: 0,
          pending_applications: 0,
          approved_applications: 0,
          rejected_applications: 0,
          applications_by_role: {},
          average_approval_time_hours: 0,
          approval_rate_percentage: 0
        },
        message: 'خطأ في جلب الإحصائيات'
      };
    }
  }

  // ======================================
  // 🔧 دوال مساعدة خاصة
  // ======================================

  /**
   * التحقق من متطلبات الدور المحدد
   */
  async validateRoleRequirements(
    role: UserRole, 
    additionalData?: RoleSelection['additional_data']
  ): Promise<{ isValid: boolean; message: string }> {
    try {
      switch (role) {
        case 'photographer':
          if (!additionalData?.contract_type) {
            return {
              isValid: false,
              message: 'نوع العقد مطلوب للمصورين'
            };
          }
          if (!this.contractTypes.includes(additionalData.contract_type)) {
            return {
              isValid: false,
              message: 'نوع العقد غير صحيح'
            };
          }
          if (!additionalData.specializations || additionalData.specializations.length === 0) {
            return {
              isValid: false,
              message: 'التخصصات مطلوبة للمصورين'
            };
          }
          break;

        case 'brand_coordinator':
          if (!additionalData?.selected_brand_id) {
            return {
              isValid: false,
              message: 'اختيار براند مطلوب لمنسقي البراند'
            };
          }
          // التحقق من وجود البراند
          const brandDoc = await this.firestore
            .collection('brands')
            .doc(additionalData.selected_brand_id)
            .get();
          if (!brandDoc.exists) {
            return {
              isValid: false,
              message: 'البراند المختار غير موجود'
            };
          }
          break;

        case 'marketing_coordinator':
          if (!additionalData?.marketing_experience) {
            return {
              isValid: false,
              message: 'الخبرة التسويقية مطلوبة لمنسقي التسويق'
            };
          }
          break;

        default:
          return {
            isValid: false,
            message: 'الدور غير مدعوم'
          };
      }

      return {
        isValid: true,
        message: 'متطلبات الدور مكتملة'
      };

    } catch (error) {
      logger.error('❌ خطأ في التحقق من متطلبات الدور', { role, additionalData, error });
      return {
        isValid: false,
        message: 'خطأ في التحقق من المتطلبات'
      };
    }
  }

  /**
   * إرسال إشعار قرار الدور للمستخدم
   */
  async notifyRoleDecision(
    userId: ID,
    decision: 'approved' | 'rejected',
    role: UserRole,
    reason?: string,
    adminNotes?: string
  ): Promise<void> {
    try {
      const roleNames: Record<UserRole, string> = {
        'super_admin': 'المدير العام',
        'marketing_coordinator': 'منسق التسويق',
        'brand_coordinator': 'منسق البراند',
        'photographer': 'المصور',
        'new_user': 'مستخدم جديد'
      };

      // تحديد نوع الإشعار بناء على القرار
      const notificationType: NotificationType = decision === 'approved' 
        ? 'task_completed' 
        : 'task_cancelled';

      const title = decision === 'approved' 
        ? `🎉 تم قبول طلبك كـ ${roleNames[role]}`
        : `❌ تم رفض طلبك كـ ${roleNames[role]}`;

      let message = decision === 'approved'
        ? `تهانينا! تم قبول طلبك للعمل كـ ${roleNames[role]}. يمكنك الآن الوصول إلى جميع الميزات المتاحة لدورك.`
        : `نأسف لإبلاغك بأنه تم رفض طلبك للعمل كـ ${roleNames[role]}.`;

      if (reason) {
        message += `\n\nالسبب: ${reason}`;
      }

      if (adminNotes) {
        message += `\n\nملاحظات الإدارة: ${adminNotes}`;
      }

      if (decision === 'rejected') {
        message += '\n\nيمكنك تقديم طلب جديد بعد تحسين المتطلبات المطلوبة.';
      }

      await this.notificationService.sendNotification({
        type: notificationType,
        priority: 'high',
        title,
        message,
        recipient_id: userId,
        recipient_role: 'new_user',
        is_urgent: true
      });

      logger.info('📢 تم إرسال إشعار قرار الدور', { 
        userId, 
        decision, 
        role 
      });

    } catch (error) {
      logger.error('❌ خطأ في إرسال إشعار قرار الدور', { 
        userId, 
        decision, 
        role, 
        error 
      });
    }
  }

  /**
   * التحقق من إذا كان الدور مسموح
   */
  private isRoleAllowed(role: UserRole): boolean {
    return this.allowedRoles.includes(role);
  }

  /**
   * جلب طلب منتظر للمستخدم (إن وجد)
   */
  private async getUserPendingApplication(userId: ID): Promise<RoleSelection | null> {
    try {
      const snapshot = await this.firestore
        .collection('role_applications')
        .where('user_id', '==', userId)
        .where('status', '==', 'pending')
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      if (!doc) {
        return null;
      }
      return { id: doc.id, ...doc.data() } as RoleSelection;

    } catch (error) {
      logger.error('❌ خطأ في جلب طلب المستخدم المنتظر', { userId, error });
      return null;
    }
  }

  /**
   * إشعار الأدمنز بطلب جديد
   */
  private async notifyAdminsOfNewApplication(
    roleSelection: RoleSelection,
    user: User
  ): Promise<void> {
    try {
      const roleNames: Record<UserRole, string> = {
        'super_admin': 'المدير العام',
        'marketing_coordinator': 'منسق التسويق',
        'brand_coordinator': 'منسق البراند',
        'photographer': 'المصور',
        'new_user': 'مستخدم جديد'
      };

      // تحديد نوع الإشعار للأدمن
      const adminNotificationType: NotificationType = 'task_assigned';

      // الحصول على الأدمن الأول لإرسال الإشعار
      const adminSnapshot = await this.firestore
        .collection('users')
        .where('role', '==', 'super_admin')
        .limit(1)
        .get();

      if (!adminSnapshot.empty) {
        const adminDoc = adminSnapshot.docs[0];
        if (adminDoc) {
          await this.notificationService.sendNotification({
            type: adminNotificationType,
            priority: 'high',
            title: `📋 طلب اختيار دور جديد: ${roleNames[roleSelection.selected_role]}`,
            message: `المستخدم ${user.full_name} (${user.email}) قدم طلباً للعمل كـ ${roleNames[roleSelection.selected_role]}. يتطلب مراجعة وموافقة.`,
            recipient_id: adminDoc.id,
            recipient_role: 'super_admin',
            is_urgent: false,
            action_required: true,
            action_url: `/admin/role-applications/${roleSelection.id}`
          });
        }
      }

      logger.info('📢 تم إشعار الأدمنز بطلب جديد', { 
        applicationId: roleSelection.id,
        userId: user.id,
        role: roleSelection.selected_role 
      });

    } catch (error) {
      logger.error('❌ خطأ في إشعار الأدمنز', { roleSelection, user, error });
    }
  }

  /**
   * تعيين منسق للبراند
   */
  private async assignCoordinatorToBrand(brandId: ID, coordinatorId: ID): Promise<void> {
    try {
      await this.firestore
        .collection('brands')
        .doc(brandId)
        .update({
          assigned_coordinator: coordinatorId,
          last_updated_by: coordinatorId,
          updated_at: Timestamp.now()
        });

      logger.info('👨‍💼 تم تعيين منسق للبراند', { brandId, coordinatorId });

    } catch (error) {
      logger.error('❌ خطأ في تعيين منسق للبراند', { brandId, coordinatorId, error });
    }
  }
} 
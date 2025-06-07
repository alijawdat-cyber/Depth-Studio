/**
 * 🛠️ Equipment Service - منطق المعدات
 * ====================================
 * 
 * 📅 محدث: ديسمبر 2024
 * 👨‍💻 المطور: علي جودت
 * 🎯 الهدف: Service شامل لمنطق إدارة المعدات مع Type Safety كامل
 */

import { Equipment } from '../../../types/src/equipment';
import { EquipmentType, EquipmentCondition } from '../../../types/src/core/enums';
import { ID, FirebaseTimestamp } from '../../../types/src/core/base';
import { 
  EquipmentRepository, 
  EquipmentSearchOptions, 
  EquipmentStats,
  EquipmentAssignment,
  EquipmentMaintenance
} from '../repositories/EquipmentRepository';
import { QueryOptions } from '../repositories/BaseRepository';
import { FieldValue } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions';

/**
 * 📝 طلب إضافة معدة جديدة
 */
export interface CreateEquipmentRequest {
  name: string;
  type: EquipmentType;
  brand: string;
  model: string;
  description?: string;
  condition: EquipmentCondition;
  owner_id: ID;
  purchase_price: number;
  purchase_date: FirebaseTimestamp;
  location: string;
  is_portable: boolean;
  warranty_expiry?: FirebaseTimestamp;
}

/**
 * 📋 طلب تخصيص معدة
 */
export interface AssignEquipmentRequest {
  equipment_id: ID;
  user_id: ID;
  reserved_until?: FirebaseTimestamp;
  purpose?: string;
  notes?: string;
}

/**
 * 🔧 طلب جدولة صيانة
 */
export interface ScheduleMaintenanceRequest {
  equipment_id: ID;
  scheduled_date: FirebaseTimestamp;
  type: 'routine' | 'repair' | 'upgrade' | 'inspection';
  description: string;
  estimated_cost?: number;
  estimated_duration?: number;
  assigned_technician?: ID;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

/**
 * 📊 تقرير استخدام المعدة
 */
export interface EquipmentUsageReport {
  equipment_id: ID;
  equipment_name: string;
  type: EquipmentType;
  total_bookings: number;
  total_hours_used: number;
  utilization_rate: number;
  revenue_generated: number;
  average_session_duration: number;
  last_used?: FirebaseTimestamp;
  most_frequent_users: Array<{
    user_id: ID;
    usage_count: number;
    total_hours: number;
  }>;
  condition_history: Array<{
    date: FirebaseTimestamp;
    condition: EquipmentCondition;
    notes?: string;
  }>;
}

/**
 * 🛠️ Equipment Service Class
 */
export class EquipmentService {
  private equipmentRepository: EquipmentRepository;

  constructor() {
    this.equipmentRepository = new EquipmentRepository();
    logger.info('🛠️ EquipmentService initialized');
  }

  // ======================================
  // 🆕 إضافة المعدات
  // ======================================

  /**
   * إضافة معدة جديدة
   */
  async addEquipment(request: CreateEquipmentRequest): Promise<Equipment> {
    try {
      logger.info('🆕 Adding new equipment', { 
        name: request.name, 
        type: request.type 
      });

      // التحقق من صحة البيانات
      this.validateEquipmentData(request);

      // إنشاء كائن المعدة
      const equipmentData: Omit<Equipment, 'id' | 'created_at' | 'updated_at'> = {
        ...request,
        status: 'available',
        is_available: true,
        is_active: true,
        total_bookings: 0,
        total_hours_used: 0
      };

      const equipment = await this.equipmentRepository.create(equipmentData);

      logger.info('✅ Equipment added successfully', { 
        equipmentId: equipment.id,
        name: equipment.name 
      });

      return equipment;
    } catch (error) {
      logger.error('❌ Error adding equipment', { request, error });
      throw error;
    }
  }

  // ======================================
  // 📋 تخصيص المعدات
  // ======================================

  /**
   * تخصيص معدة لمستخدم مع إنشاء سجل التخصيص
   */
  async assignEquipment(request: AssignEquipmentRequest): Promise<Equipment> {
    try {
      logger.info('📋 Assigning equipment to user', { 
        equipmentId: request.equipment_id,
        userId: request.user_id 
      });

      // التحقق من وجود المعدة وتوفرها
      const equipment = await this.equipmentRepository.findById(request.equipment_id);
      if (!equipment) {
        throw new Error('المعدة غير موجودة');
      }

      if (!equipment.is_available || equipment.status !== 'available') {
        throw new Error('المعدة غير متاحة للتخصيص');
      }

      // إنشاء سجل التخصيص باستخدام EquipmentAssignment
      const assignmentRecord: EquipmentAssignment = {
        equipment_id: request.equipment_id,
        user_id: request.user_id,
        assigned_at: FieldValue.serverTimestamp() as FirebaseTimestamp,
        ...(request.reserved_until && { reserved_until: request.reserved_until }),
        ...(request.purpose && { purpose: request.purpose }),
        ...(request.notes && { notes: request.notes })
      };

      // تخصيص المعدة
      const updatedEquipment = await this.equipmentRepository.updateAvailability(
        request.equipment_id,
        false,
        request.user_id,
        request.reserved_until
      );

      // تحديث الحالة إلى "قيد الاستخدام"
      await this.equipmentRepository.update(request.equipment_id, {
        status: 'in_use'
      });

      // تسجيل التخصيص للمراجعة والتتبع
      logger.info('✅ Equipment assigned successfully', { 
        equipmentId: request.equipment_id,
        userId: request.user_id,
        assignmentRecord 
      });

      return updatedEquipment;
    } catch (error) {
      logger.error('❌ Error assigning equipment', { request, error });
      throw error;
    }
  }

  /**
   * إنشاء سجل تخصيص مهني للمعدة
   */
  async createAssignmentRecord(
    equipmentId: ID, 
    userId: ID, 
    options: Partial<EquipmentAssignment> = {}
  ): Promise<EquipmentAssignment> {
    try {
      logger.info('📋 Creating professional equipment assignment record', { 
        equipmentId, 
        userId 
      });

      // إنشاء سجل التخصيص مع التحقق من النوع الصحيح
      const assignmentRecord: EquipmentAssignment = {
        equipment_id: equipmentId,
        user_id: userId,
        assigned_at: FieldValue.serverTimestamp() as FirebaseTimestamp,
        ...(options.reserved_until && { reserved_until: options.reserved_until }),
        ...(options.purpose && { purpose: options.purpose }),
        ...(options.notes && { notes: options.notes })
      };

      logger.info('✅ Assignment record created successfully', { 
        equipmentId,
        userId,
        assignmentRecord 
      });

      return assignmentRecord;
    } catch (error) {
      logger.error('❌ Error creating assignment record', { equipmentId, userId, error });
      throw error;
    }
  }

  // ======================================
  // 🔄 إرجاع المعدات
  // ======================================

  /**
   * إرجاع معدة من المستخدم
   */
  async returnEquipment(
    equipmentId: ID, 
    hoursUsed: number,
    notes?: string
  ): Promise<Equipment> {
    try {
      logger.info('🔄 Returning equipment', { 
        equipmentId, 
        hoursUsed 
      });

      // التحقق من وجود المعدة
      const equipment = await this.equipmentRepository.findById(equipmentId);
      if (!equipment) {
        throw new Error('المعدة غير موجودة');
      }

      if (equipment.is_available || equipment.status !== 'in_use') {
        throw new Error('المعدة ليست قيد الاستخدام');
      }

      // تحديث إحصائيات الاستخدام
      await this.equipmentRepository.updateUsageStats(equipmentId, hoursUsed);

      // إرجاع المعدة للتوفر
      const updatedEquipment = await this.equipmentRepository.updateAvailability(
        equipmentId,
        true
      );

      // تحديث الحالة إلى "متاح"
      await this.equipmentRepository.update(equipmentId, {
        status: 'available',
        ...(notes && { description: `${equipment.description || ''}\nملاحظات الإرجاع: ${notes}` })
      });

      logger.info('✅ Equipment returned successfully', { 
        equipmentId, 
        hoursUsed 
      });

      return updatedEquipment;
    } catch (error) {
      logger.error('❌ Error returning equipment', { equipmentId, hoursUsed, error });
      throw error;
    }
  }

  // ======================================
  // 🔧 جدولة الصيانة
  // ======================================

  /**
   * جدولة صيانة للمعدة مع إنشاء سجل صيانة مهني
   */
  async scheduleMaintenance(request: ScheduleMaintenanceRequest): Promise<Equipment> {
    try {
      logger.info('🔧 Scheduling equipment maintenance', { 
        equipmentId: request.equipment_id,
        type: request.type,
        priority: request.priority 
      });

      // التحقق من وجود المعدة
      const equipment = await this.equipmentRepository.findById(request.equipment_id);
      if (!equipment) {
        throw new Error('المعدة غير موجودة');
      }

      // إنشاء سجل الصيانة باستخدام EquipmentMaintenance
      const maintenanceRecord: EquipmentMaintenance = {
        equipment_id: request.equipment_id,
        scheduled_date: request.scheduled_date,
        type: request.type,
        description: request.description,
        priority: request.priority,
        status: 'scheduled',
        ...(request.estimated_cost && { estimated_cost: request.estimated_cost }),
        ...(request.estimated_duration && { estimated_duration: request.estimated_duration }),
        ...(request.assigned_technician && { assigned_technician: request.assigned_technician })
      };

      // تحديث حالة المعدة إلى "صيانة" إذا كانت الصيانة عاجلة
      if (request.priority === 'urgent') {
        await this.equipmentRepository.update(request.equipment_id, {
          status: 'maintenance',
          is_available: false
        });
      }

      // جدولة تاريخ الصيانة
      const updatedEquipment = await this.equipmentRepository.scheduleMaintenanceDate(
        request.equipment_id,
        request.scheduled_date
      );

      logger.info('✅ Maintenance scheduled successfully', { 
        equipmentId: request.equipment_id,
        scheduledDate: request.scheduled_date,
        maintenanceRecord
      });

      return updatedEquipment;
    } catch (error) {
      logger.error('❌ Error scheduling maintenance', { request, error });
      throw error;
    }
  }

  /**
   * إنشاء سجل صيانة مهني مع تتبع كامل
   */
  async createMaintenanceRecord(
    equipmentId: ID,
    maintenanceData: Omit<EquipmentMaintenance, 'equipment_id'>
  ): Promise<EquipmentMaintenance> {
    try {
      logger.info('🔧 Creating professional maintenance record', { 
        equipmentId,
        type: maintenanceData.type,
        priority: maintenanceData.priority 
      });

      // إنشاء سجل الصيانة مع Type Safety كامل
      const maintenanceRecord: EquipmentMaintenance = {
        equipment_id: equipmentId,
        ...maintenanceData
      };

      // التحقق من صحة بيانات الصيانة
      this.validateMaintenanceData(maintenanceRecord);

      logger.info('✅ Maintenance record created successfully', { 
        equipmentId,
        maintenanceRecord 
      });

      return maintenanceRecord;
    } catch (error) {
      logger.error('❌ Error creating maintenance record', { equipmentId, maintenanceData, error });
      throw error;
    }
  }

  /**
   * تحديث حالة الصيانة مع تتبع مهني
   */
  async updateMaintenanceStatus(
    equipmentId: ID,
    newStatus: EquipmentMaintenance['status'],
    notes?: string,
    actualCost?: number
  ): Promise<EquipmentMaintenance> {
    try {
      logger.info('🔧 Updating maintenance status', { 
        equipmentId,
        newStatus 
      });

      // إنشاء تحديث الصيانة
      const maintenanceUpdate: Partial<EquipmentMaintenance> = {
        status: newStatus,
        ...(notes && { notes }),
        ...(actualCost && { actual_cost: actualCost }),
        ...(newStatus === 'completed' && { 
          completed_at: FieldValue.serverTimestamp() as FirebaseTimestamp 
        })
      };

      // إذا اكتملت الصيانة، نحديث تاريخ آخر صيانة في المعدة
      if (newStatus === 'completed') {
        await this.equipmentRepository.updateLastMaintenance(equipmentId);
        
        // إرجاع المعدة للخدمة إذا كانت الصيانة مكتملة
        await this.equipmentRepository.update(equipmentId, {
          status: 'available',
          is_available: true
        });
      }

      // إنشاء سجل محدث للصيانة
      const updatedMaintenanceRecord: EquipmentMaintenance = {
        equipment_id: equipmentId,
        scheduled_date: FieldValue.serverTimestamp() as FirebaseTimestamp, // يُفترض أن يكون هناك تاريخ مجدول
        type: 'routine', // افتراضي - في التطبيق الحقيقي سيأتي من قاعدة البيانات
        description: notes || 'تحديث حالة الصيانة',
        priority: 'medium', // افتراضي
        status: newStatus,
        ...(notes && { notes }),
        ...(actualCost && { actual_cost: actualCost }),
        ...(newStatus === 'completed' && { 
          completed_at: FieldValue.serverTimestamp() as FirebaseTimestamp 
        })
      };

      logger.info('✅ Maintenance status updated successfully', { 
        equipmentId,
        newStatus,
        updatedMaintenanceRecord 
      });

      return updatedMaintenanceRecord;
    } catch (error) {
      logger.error('❌ Error updating maintenance status', { 
        equipmentId, 
        newStatus, 
        error 
      });
      throw error;
    }
  }

  // ======================================
  // 🔍 البحث والاستعلام
  // ======================================

  /**
   * البحث في المعدات
   */
  async searchEquipment(
    searchOptions: EquipmentSearchOptions = {},
    queryOptions: QueryOptions = {}
  ): Promise<Equipment[]> {
    try {
      logger.info('🔍 Searching equipment with advanced options');

      const equipment = await this.equipmentRepository.searchEquipment(
        searchOptions, 
        queryOptions
      );

      logger.info('🔍 Equipment search completed', { 
        resultsCount: equipment.length 
      });

      return equipment;
    } catch (error) {
      logger.error('❌ Error searching equipment', { searchOptions, queryOptions, error });
      throw error;
    }
  }

  /**
   * جلب المعدات المتاحة
   */
  async getAvailableEquipment(): Promise<Equipment[]> {
    try {
      logger.info('🔍 Getting available equipment');

      const equipment = await this.equipmentRepository.findAvailable();

      logger.info('🔍 Available equipment retrieved', { 
        count: equipment.length 
      });

      return equipment;
    } catch (error) {
      logger.error('❌ Error getting available equipment', error);
      throw error;
    }
  }

  /**
   * جلب المعدات حسب النوع
   */
  async getEquipmentByType(type: EquipmentType): Promise<Equipment[]> {
    try {
      logger.info('🔍 Getting equipment by type', { type });

      const equipment = await this.equipmentRepository.findByType(type);

      logger.info('🔍 Equipment by type retrieved', { 
        type, 
        count: equipment.length 
      });

      return equipment;
    } catch (error) {
      logger.error('❌ Error getting equipment by type', { type, error });
      throw error;
    }
  }

  // ======================================
  // 📊 الإحصائيات والتقارير
  // ======================================

  /**
   * جلب إحصائيات المعدات
   */
  async getEquipmentStats(): Promise<EquipmentStats> {
    try {
      logger.info('📊 Calculating equipment statistics');

      const stats = await this.equipmentRepository.getEquipmentStats();

      logger.info('📊 Equipment statistics calculated', { 
        totalEquipment: stats.total_equipment,
        utilizationRate: `${stats.utilization_rate.toFixed(2)}%`
      });

      return stats;
    } catch (error) {
      logger.error('❌ Error calculating equipment statistics', error);
      throw error;
    }
  }

  /**
   * تقرير استخدام معدة محددة
   */
  async getEquipmentUsageReport(equipmentId: ID): Promise<EquipmentUsageReport> {
    try {
      logger.info('📊 Generating equipment usage report', { equipmentId });

      const equipment = await this.equipmentRepository.findById(equipmentId);
      if (!equipment) {
        throw new Error('المعدة غير موجودة');
      }

      // حساب معدل الاستخدام (افتراضي بناءً على البيانات المتاحة)
      const totalPossibleHours = 8760; // 24 ساعة × 365 يوم
      const utilizationRate = (equipment.total_hours_used / totalPossibleHours) * 100;

      // تقدير الإيراد المولد
      const estimatedHourlyRate = equipment.purchase_price / 1000;
      const revenueGenerated = equipment.total_hours_used * estimatedHourlyRate;

      // متوسط مدة الجلسة
      const averageSessionDuration = equipment.total_bookings > 0 ? 
        equipment.total_hours_used / equipment.total_bookings : 0;

      const report: EquipmentUsageReport = {
        equipment_id: equipment.id!,
        equipment_name: equipment.name,
        type: equipment.type,
        total_bookings: equipment.total_bookings,
        total_hours_used: equipment.total_hours_used,
        utilization_rate: utilizationRate,
        revenue_generated: revenueGenerated,
        average_session_duration: averageSessionDuration,
        ...(equipment.last_used && { last_used: equipment.last_used }),
        most_frequent_users: [], // يمكن تطويرها لاحقاً
        condition_history: [] // يمكن تطويرها لاحقاً
      };

      logger.info('📊 Equipment usage report generated', { 
        equipmentId,
        utilizationRate: `${utilizationRate.toFixed(2)}%`
      });

      return report;
    } catch (error) {
      logger.error('❌ Error generating equipment usage report', { equipmentId, error });
      throw error;
    }
  }

  // ======================================
  // 🔧 إدارة الصيانة المتقدمة
  // ======================================

  /**
   * جلب المعدات التي تحتاج صيانة
   */
  async getEquipmentNeedingMaintenance(): Promise<Equipment[]> {
    try {
      logger.info('🔧 Getting equipment needing maintenance');

      const equipment = await this.equipmentRepository.getEquipmentNeedingMaintenance();

      logger.info('🔧 Equipment needing maintenance retrieved', { 
        count: equipment.length 
      });

      return equipment;
    } catch (error) {
      logger.error('❌ Error getting equipment needing maintenance', error);
      throw error;
    }
  }

  /**
   * جلب المعدات منتهية الضمان
   */
  async getEquipmentWithExpiringWarranty(daysAhead: number = 30): Promise<Equipment[]> {
    try {
      logger.info('⚠️ Getting equipment with expiring warranty', { daysAhead });

      const equipment = await this.equipmentRepository.getEquipmentWithExpiringWarranty(daysAhead);

      logger.info('⚠️ Equipment with expiring warranty retrieved', { 
        count: equipment.length,
        daysAhead 
      });

      return equipment;
    } catch (error) {
      logger.error('❌ Error getting equipment with expiring warranty', { daysAhead, error });
      throw error;
    }
  }

  /**
   * تحديث حالة المعدة
   */
  async updateEquipmentCondition(
    equipmentId: ID, 
    condition: EquipmentCondition,
    notes?: string
  ): Promise<Equipment> {
    try {
      logger.info('🔄 Updating equipment condition', { 
        equipmentId, 
        condition 
      });

      const updatedEquipment = await this.equipmentRepository.updateCondition(
        equipmentId, 
        condition, 
        notes
      );

      // إذا كانت الحالة "تحتاج إصلاح"، جعل المعدة غير متاحة
      if (condition === 'needs_repair') {
        await this.equipmentRepository.update(equipmentId, {
          status: 'maintenance',
          is_available: false
        });
      }

      logger.info('✅ Equipment condition updated', { 
        equipmentId, 
        condition 
      });

      return updatedEquipment;
    } catch (error) {
      logger.error('❌ Error updating equipment condition', { 
        equipmentId, 
        condition, 
        error 
      });
      throw error;
    }
  }

  // ======================================
  // ✅ دوال التحقق والمساعدة
  // ======================================

  /**
   * التحقق من صحة بيانات المعدة
   */
  private validateEquipmentData(data: CreateEquipmentRequest): void {
    if (!data.name || data.name.trim().length === 0) {
      throw new Error('اسم المعدة مطلوب');
    }

    if (!data.type) {
      throw new Error('نوع المعدة مطلوب');
    }

    if (!data.brand || data.brand.trim().length === 0) {
      throw new Error('البراند مطلوب');
    }

    if (!data.model || data.model.trim().length === 0) {
      throw new Error('الموديل مطلوب');
    }

    if (!data.condition) {
      throw new Error('حالة المعدة مطلوبة');
    }

    if (!data.owner_id) {
      throw new Error('معرف المالك مطلوب');
    }

    if (!data.purchase_price || data.purchase_price <= 0) {
      throw new Error('سعر الشراء يجب أن يكون أكبر من صفر');
    }

    if (!data.location || data.location.trim().length === 0) {
      throw new Error('موقع المعدة مطلوب');
    }

    logger.info('✅ Equipment data validation passed');
  }

  /**
   * التحقق من إمكانية تخصيص المعدة
   */
  async canAssignEquipment(equipmentId: ID): Promise<boolean> {
    try {
      const equipment = await this.equipmentRepository.findById(equipmentId);
      
      if (!equipment) {
        return false;
      }

      return equipment.is_available && 
             equipment.status === 'available' && 
             equipment.condition !== 'needs_repair';
    } catch (error) {
      logger.error('❌ Error checking equipment assignment capability', { equipmentId, error });
      return false;
    }
  }

  /**
   * التحقق من صحة بيانات الصيانة
   */
  private validateMaintenanceData(data: EquipmentMaintenance): void {
    if (!data.equipment_id) {
      throw new Error('معرف المعدة مطلوب للصيانة');
    }

    if (!data.scheduled_date) {
      throw new Error('تاريخ الصيانة المجدول مطلوب');
    }

    if (!data.type) {
      throw new Error('نوع الصيانة مطلوب');
    }

    if (!data.description || data.description.trim().length === 0) {
      throw new Error('وصف الصيانة مطلوب');
    }

    if (!data.priority) {
      throw new Error('أولوية الصيانة مطلوبة');
    }

    if (!data.status) {
      throw new Error('حالة الصيانة مطلوبة');
    }

    if (data.estimated_cost && data.estimated_cost < 0) {
      throw new Error('التكلفة المقدرة يجب أن تكون أكبر من أو تساوي صفر');
    }

    if (data.estimated_duration && data.estimated_duration <= 0) {
      throw new Error('المدة المقدرة يجب أن تكون أكبر من صفر');
    }

    logger.info('✅ Maintenance data validation passed');
  }
} 
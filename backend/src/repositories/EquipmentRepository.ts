/**
 * 🛠️ Equipment Repository - إدارة المعدات
 * ==========================================
 * 
 * 📅 محدث: ديسمبر 2024
 * 👨‍💻 المطور: علي جودت
 * 🎯 الهدف: Repository شامل لإدارة المعدات مع Type Safety كامل
 */

import { Equipment } from '../../../types/src/equipment';
import { EquipmentType, EquipmentCondition } from '../../../types/src/core/enums';
import { ID, FirebaseTimestamp } from '../../../types/src/core/base';
import { BaseRepository, QueryOptions } from './BaseRepository';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions';

/**
 * 🔍 خيارات البحث في المعدات
 */
export interface EquipmentSearchOptions {
  type?: EquipmentType;
  condition?: EquipmentCondition;
  status?: 'available' | 'in_use' | 'maintenance' | 'retired';
  owner_id?: ID;
  current_user?: ID;
  location?: string;
  is_available?: boolean;
  is_portable?: boolean;
  min_price?: number;
  max_price?: number;
  brand?: string;
  purchase_date_from?: FirebaseTimestamp;
  purchase_date_to?: FirebaseTimestamp;
  last_used_from?: FirebaseTimestamp;
  last_used_to?: FirebaseTimestamp;
  warranty_expiry_from?: FirebaseTimestamp;
  warranty_expiry_to?: FirebaseTimestamp;
}

/**
 * 📊 إحصائيات المعدات
 */
export interface EquipmentStats {
  total_equipment: number;
  by_type: Record<EquipmentType, number>;
  by_condition: Record<EquipmentCondition, number>;
  by_status: Record<'available' | 'in_use' | 'maintenance' | 'retired', number>;
  total_value: number;
  utilization_rate: number;
  maintenance_pending: number;
  warranty_expiring_soon: number;
  most_used_equipment: Array<{
    equipment_id: ID;
    name: string;
    total_hours_used: number;
  }>;
  revenue_per_type: Record<EquipmentType, number>;
}

/**
 * 📋 تخصيص المعدات
 */
export interface EquipmentAssignment {
  equipment_id: ID;
  user_id: ID;
  assigned_at: FirebaseTimestamp;
  reserved_until?: FirebaseTimestamp;
  purpose?: string;
  notes?: string;
}

/**
 * 🔧 صيانة المعدات
 */
export interface EquipmentMaintenance {
  equipment_id: ID;
  scheduled_date: FirebaseTimestamp;
  type: 'routine' | 'repair' | 'upgrade' | 'inspection';
  description: string;
  estimated_cost?: number;
  estimated_duration?: number; // بالساعات
  assigned_technician?: ID;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  completed_at?: FirebaseTimestamp;
  actual_cost?: number;
  notes?: string;
}

/**
 * 🛠️ Equipment Repository Class
 */
export class EquipmentRepository extends BaseRepository<Equipment> {
  constructor() {
    super('equipment');
    logger.info('🛠️ EquipmentRepository initialized');
  }

  // ======================================
  // 🔍 البحث حسب النوع
  // ======================================

  /**
   * جلب معدات حسب النوع
   */
  async findByType(type: EquipmentType): Promise<Equipment[]> {
    try {
      logger.info('🔍 Finding equipment by type', { type });

      const query = this.collection.where('type', '==', type);
      const snapshot = await query.get();

      const equipment = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Equipment[];

      logger.info('🔍 Equipment found by type', { 
        type, 
        count: equipment.length 
      });

      return equipment;
    } catch (error) {
      logger.error('❌ Error finding equipment by type', { type, error });
      throw error;
    }
  }

  // ======================================
  // 🔍 البحث حسب الحالة
  // ======================================

  /**
   * جلب معدات حسب الحالة
   */
  async findByCondition(condition: EquipmentCondition): Promise<Equipment[]> {
    try {
      logger.info('🔍 Finding equipment by condition', { condition });

      const query = this.collection.where('condition', '==', condition);
      const snapshot = await query.get();

      const equipment = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Equipment[];

      logger.info('🔍 Equipment found by condition', { 
        condition, 
        count: equipment.length 
      });

      return equipment;
    } catch (error) {
      logger.error('❌ Error finding equipment by condition', { condition, error });
      throw error;
    }
  }

  // ======================================
  // 🔍 البحث عن المعدات المتاحة
  // ======================================

  /**
   * جلب المعدات المتاحة
   */
  async findAvailable(): Promise<Equipment[]> {
    try {
      logger.info('🔍 Finding available equipment');

      const query = this.collection
        .where('is_available', '==', true)
        .where('status', '==', 'available');
      
      const snapshot = await query.get();

      const equipment = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Equipment[];

      logger.info('🔍 Available equipment found', { count: equipment.length });

      return equipment;
    } catch (error) {
      logger.error('❌ Error finding available equipment', error);
      throw error;
    }
  }

  // ======================================
  // 🔄 تحديث حالة المعدة
  // ======================================

  /**
   * تحديث حالة المعدة
   */
  async updateCondition(
    equipmentId: ID, 
    condition: EquipmentCondition,
    notes?: string
  ): Promise<Equipment> {
    try {
      logger.info('🔄 Updating equipment condition', { 
        equipmentId, 
        condition 
      });

      const updateData: Partial<Equipment> = {
        condition,
        updated_at: FieldValue.serverTimestamp() as FirebaseTimestamp,
        ...(notes && { 
          description: notes 
        })
      };

      await this.collection.doc(equipmentId).update(updateData);

      const updatedEquipment = await this.findById(equipmentId);
      if (!updatedEquipment) {
        throw new Error('Equipment not found after update');
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
  // 🔍 البحث المتقدم
  // ======================================

  /**
   * البحث المتقدم في المعدات مع خيارات الاستعلام
   */
  async searchEquipment(
    searchOptions: EquipmentSearchOptions, 
    queryOptions: QueryOptions = {}
  ): Promise<Equipment[]> {
    try {
      logger.info('🔍 Advanced equipment search', { searchOptions, queryOptions });

      let query = this.collection as any;

      // فلترة حسب النوع
      if (searchOptions.type) {
        query = query.where('type', '==', searchOptions.type);
      }

      // فلترة حسب الحالة
      if (searchOptions.condition) {
        query = query.where('condition', '==', searchOptions.condition);
      }

      // فلترة حسب الحالة التشغيلية
      if (searchOptions.status) {
        query = query.where('status', '==', searchOptions.status);
      }

      // فلترة حسب المالك
      if (searchOptions.owner_id) {
        query = query.where('owner_id', '==', searchOptions.owner_id);
      }

      // فلترة حسب المستخدم الحالي
      if (searchOptions.current_user) {
        query = query.where('current_user', '==', searchOptions.current_user);
      }

      // فلترة حسب التوفر
      if (searchOptions.is_available !== undefined) {
        query = query.where('is_available', '==', searchOptions.is_available);
      }

      // فلترة حسب قابلية النقل
      if (searchOptions.is_portable !== undefined) {
        query = query.where('is_portable', '==', searchOptions.is_portable);
      }

      // فلترة حسب الموقع
      if (searchOptions.location) {
        query = query.where('location', '==', searchOptions.location);
      }

      // فلترة حسب البراند
      if (searchOptions.brand) {
        query = query.where('brand', '==', searchOptions.brand);
      }

      // تطبيق QueryOptions (ترتيب، حد، إزاحة)
      if (queryOptions.orderBy) {
        for (const order of queryOptions.orderBy) {
          query = query.orderBy(order.field, order.direction);
        }
      }

      if (queryOptions.limit) {
        query = query.limit(queryOptions.limit);
      }

      if (queryOptions.offset) {
        query = query.offset(queryOptions.offset);
      }

      const snapshot = await query.get();
      let equipment = snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data()
      })) as Equipment[];

      // فلترة السعر (لا يمكن استخدام where مع range في Firestore)
      if (searchOptions.min_price !== undefined || searchOptions.max_price !== undefined) {
        equipment = equipment.filter(eq => {
          if (searchOptions.min_price !== undefined && eq.purchase_price < searchOptions.min_price) {
            return false;
          }
          if (searchOptions.max_price !== undefined && eq.purchase_price > searchOptions.max_price) {
            return false;
          }
          return true;
        });
      }

      // فلترة تاريخ الشراء
      if (searchOptions.purchase_date_from || searchOptions.purchase_date_to) {
        equipment = equipment.filter(eq => {
          const purchaseTime = eq.purchase_date.seconds;
          
          if (searchOptions.purchase_date_from && purchaseTime < searchOptions.purchase_date_from.seconds) {
            return false;
          }
          if (searchOptions.purchase_date_to && purchaseTime > searchOptions.purchase_date_to.seconds) {
            return false;
          }
          return true;
        });
      }

      // فلترة تاريخ آخر استخدام
      if (searchOptions.last_used_from || searchOptions.last_used_to) {
        equipment = equipment.filter(eq => {
          if (!eq.last_used) return !searchOptions.last_used_from;
          
          const lastUsedTime = eq.last_used.seconds;
          
          if (searchOptions.last_used_from && lastUsedTime < searchOptions.last_used_from.seconds) {
            return false;
          }
          if (searchOptions.last_used_to && lastUsedTime > searchOptions.last_used_to.seconds) {
            return false;
          }
          return true;
        });
      }

      logger.info('🔍 Equipment search completed', { 
        searchOptionsCount: Object.keys(searchOptions).length,
        queryOptionsCount: Object.keys(queryOptions).length,
        resultsCount: equipment.length 
      });

      return equipment;
    } catch (error) {
      logger.error('❌ Error in equipment search', { searchOptions, queryOptions, error });
      throw error;
    }
  }

  // ======================================
  // 📊 إحصائيات المعدات
  // ======================================

  /**
   * جلب إحصائيات المعدات
   */
  async getEquipmentStats(): Promise<EquipmentStats> {
    try {
      logger.info('📊 Calculating equipment statistics');

      const snapshot = await this.collection.get();
      const allEquipment = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Equipment[];

      // إحصائيات أساسية
      const total_equipment = allEquipment.length;
      const total_value = allEquipment.reduce((sum, eq) => sum + eq.purchase_price, 0);

      // إحصائيات حسب النوع
      const by_type: Record<EquipmentType, number> = {
        camera: 0,
        lens: 0,
        lighting: 0,
        tripod: 0,
        backdrop: 0,
        audio: 0,
        accessories: 0
      };

      // إحصائيات حسب الحالة
      const by_condition: Record<EquipmentCondition, number> = {
        excellent: 0,
        good: 0,
        fair: 0,
        needs_repair: 0
      };

      // إحصائيات حسب الحالة التشغيلية
      const by_status: Record<'available' | 'in_use' | 'maintenance' | 'retired', number> = {
        available: 0,
        in_use: 0,
        maintenance: 0,
        retired: 0
      };

      // حساب الإحصائيات
      let total_hours_used = 0;
      let maintenance_pending = 0;
      let warranty_expiring_soon = 0;
      const currentTime = Math.floor(Date.now() / 1000);
      const oneMonthFromNow = currentTime + (30 * 24 * 60 * 60); // 30 يوم

      allEquipment.forEach(eq => {
        by_type[eq.type]++;
        by_condition[eq.condition]++;
        by_status[eq.status]++;
        
        total_hours_used += eq.total_hours_used;
        
        // المعدات التي تحتاج صيانة
        if (eq.next_maintenance && eq.next_maintenance.seconds <= currentTime) {
          maintenance_pending++;
        }
        
        // المعدات التي تنتهي ضمانتها خلال شهر
        if (eq.warranty_expiry && eq.warranty_expiry.seconds <= oneMonthFromNow) {
          warranty_expiring_soon++;
        }
      });

      // معدل الاستخدام
      const utilization_rate = total_equipment > 0 ? 
        (by_status.in_use / total_equipment) * 100 : 0;

      // أكثر المعدات استخداماً
      const most_used_equipment = allEquipment
        .sort((a, b) => b.total_hours_used - a.total_hours_used)
        .slice(0, 5)
        .map(eq => ({
          equipment_id: eq.id!,
          name: eq.name,
          total_hours_used: eq.total_hours_used
        }));

      // الإيرادات حسب النوع (تقدير بناءً على الاستخدام)
      const revenue_per_type: Record<EquipmentType, number> = {
        camera: 0,
        lens: 0,
        lighting: 0,
        tripod: 0,
        backdrop: 0,
        audio: 0,
        accessories: 0
      };

      allEquipment.forEach(eq => {
        // تقدير الإيراد بناءً على ساعات الاستخدام وسعر الشراء
        const estimatedHourlyRate = eq.purchase_price / 1000; // تقدير بسيط
        revenue_per_type[eq.type] += eq.total_hours_used * estimatedHourlyRate;
      });

      const stats: EquipmentStats = {
        total_equipment,
        by_type,
        by_condition,
        by_status,
        total_value,
        utilization_rate,
        maintenance_pending,
        warranty_expiring_soon,
        most_used_equipment,
        revenue_per_type
      };

      logger.info('📊 Equipment statistics calculated', { 
        total_equipment,
        utilization_rate: `${utilization_rate.toFixed(2)}%`
      });

      return stats;
    } catch (error) {
      logger.error('❌ Error calculating equipment statistics', error);
      throw error;
    }
  }

  // ======================================
  // 🔄 تحديث حالة التوفر
  // ======================================

  /**
   * تحديث حالة توفر المعدة
   */
  async updateAvailability(
    equipmentId: ID, 
    isAvailable: boolean,
    currentUser?: ID,
    reservedUntil?: FirebaseTimestamp
  ): Promise<Equipment> {
    try {
      logger.info('🔄 Updating equipment availability', { 
        equipmentId, 
        isAvailable,
        currentUser 
      });

      const updateData: Partial<Equipment> = {
        is_available: isAvailable,
        updated_at: FieldValue.serverTimestamp() as FirebaseTimestamp,
        ...(currentUser && { current_user: currentUser }),
        ...(reservedUntil && { reserved_until: reservedUntil })
      };

      // إذا كانت المعدة متاحة، نحذف current_user
      if (isAvailable) {
        updateData.current_user = FieldValue.delete() as any;
      }

      await this.collection.doc(equipmentId).update(updateData);

      const updatedEquipment = await this.findById(equipmentId);
      if (!updatedEquipment) {
        throw new Error('Equipment not found after update');
      }

      logger.info('✅ Equipment availability updated', { 
        equipmentId, 
        isAvailable 
      });

      return updatedEquipment;
    } catch (error) {
      logger.error('❌ Error updating equipment availability', { 
        equipmentId, 
        isAvailable, 
        error 
      });
      throw error;
    }
  }

  // ======================================
  // 📈 تحديث إحصائيات الاستخدام
  // ======================================

  /**
   * تحديث إحصائيات استخدام المعدة
   */
  async updateUsageStats(
    equipmentId: ID,
    hoursUsed: number
  ): Promise<Equipment> {
    try {
      logger.info('📈 Updating equipment usage stats', { 
        equipmentId, 
        hoursUsed 
      });

      const updateData: Partial<Equipment> = {
        total_bookings: FieldValue.increment(1) as any,
        total_hours_used: FieldValue.increment(hoursUsed) as any,
        last_used: FieldValue.serverTimestamp() as FirebaseTimestamp,
        updated_at: FieldValue.serverTimestamp() as FirebaseTimestamp
      };

      await this.collection.doc(equipmentId).update(updateData);

      const updatedEquipment = await this.findById(equipmentId);
      if (!updatedEquipment) {
        throw new Error('Equipment not found after update');
      }

      logger.info('✅ Equipment usage stats updated', { 
        equipmentId, 
        hoursUsed 
      });

      return updatedEquipment;
    } catch (error) {
      logger.error('❌ Error updating equipment usage stats', { 
        equipmentId, 
        hoursUsed, 
        error 
      });
      throw error;
    }
  }

  // ======================================
  // 🔧 إدارة الصيانة
  // ======================================

  /**
   * جدولة صيانة للمعدة
   */
  async scheduleMaintenanceDate(
    equipmentId: ID,
    maintenanceDate: FirebaseTimestamp
  ): Promise<Equipment> {
    try {
      logger.info('🔧 Scheduling equipment maintenance', { 
        equipmentId, 
        maintenanceDate 
      });

      const updateData: Partial<Equipment> = {
        next_maintenance: maintenanceDate,
        updated_at: FieldValue.serverTimestamp() as FirebaseTimestamp
      };

      await this.collection.doc(equipmentId).update(updateData);

      const updatedEquipment = await this.findById(equipmentId);
      if (!updatedEquipment) {
        throw new Error('Equipment not found after update');
      }

      logger.info('✅ Equipment maintenance scheduled', { 
        equipmentId 
      });

      return updatedEquipment;
    } catch (error) {
      logger.error('❌ Error scheduling equipment maintenance', { 
        equipmentId, 
        error 
      });
      throw error;
    }
  }

  /**
   * تحديث تاريخ آخر صيانة
   */
  async updateLastMaintenance(equipmentId: ID): Promise<Equipment> {
    try {
      logger.info('🔧 Updating last maintenance date', { equipmentId });

      const updateData: Partial<Equipment> = {
        last_maintenance: FieldValue.serverTimestamp() as FirebaseTimestamp,
        updated_at: FieldValue.serverTimestamp() as FirebaseTimestamp
      };

      await this.collection.doc(equipmentId).update(updateData);

      const updatedEquipment = await this.findById(equipmentId);
      if (!updatedEquipment) {
        throw new Error('Equipment not found after update');
      }

      logger.info('✅ Last maintenance date updated', { equipmentId });

      return updatedEquipment;
    } catch (error) {
      logger.error('❌ Error updating last maintenance date', { 
        equipmentId, 
        error 
      });
      throw error;
    }
  }

  // ======================================
  // 🔍 استعلامات متخصصة
  // ======================================

  /**
   * جلب المعدات التي تحتاج صيانة
   */
  async getEquipmentNeedingMaintenance(): Promise<Equipment[]> {
    try {
      logger.info('🔍 Finding equipment needing maintenance');

      const currentTime = Timestamp.now();
      const query = this.collection
        .where('next_maintenance', '<=', currentTime);
      
      const snapshot = await query.get();

      const equipment = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Equipment[];

      logger.info('🔍 Equipment needing maintenance found', { 
        count: equipment.length 
      });

      return equipment;
    } catch (error) {
      logger.error('❌ Error finding equipment needing maintenance', error);
      throw error;
    }
  }

  /**
   * جلب المعدات منتهية الضمان قريباً
   */
  async getEquipmentWithExpiringWarranty(daysAhead: number = 30): Promise<Equipment[]> {
    try {
      logger.info('🔍 Finding equipment with expiring warranty', { daysAhead });

      const futureTime = new Date();
      futureTime.setDate(futureTime.getDate() + daysAhead);
      const futureTimestamp = Timestamp.fromDate(futureTime);

      const query = this.collection
        .where('warranty_expiry', '<=', futureTimestamp)
        .where('warranty_expiry', '>', Timestamp.now());
      
      const snapshot = await query.get();

      const equipment = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Equipment[];

      logger.info('🔍 Equipment with expiring warranty found', { 
        count: equipment.length,
        daysAhead 
      });

      return equipment;
    } catch (error) {
      logger.error('❌ Error finding equipment with expiring warranty', { 
        daysAhead, 
        error 
      });
      throw error;
    }
  }
} 
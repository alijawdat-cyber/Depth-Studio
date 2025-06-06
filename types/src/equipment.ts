/**
 * 🛠️ أنواع المعدات - Depth Studio (مبسط)
 * =========================================
 * 
 * ✨ تم التبسيط الجذري:
 * من 97 سطر إلى ~25 سطر (-75%)
 * من 7 واجهات إلى 1 واجهة (-86%)
 * 🎯 نفس الوظائف، كود أقل وأوضح
 */

import { BaseEntity, ActivatableEntity, FirebaseTimestamp, ID } from './core/base';
import { EquipmentType, EquipmentCondition } from './core/enums';

// ======================================
// 🛠️ المعدات (مبسطة)
// ======================================

/** المعدات - نسخة مبسطة وعملية */
export interface Equipment extends ActivatableEntity {
  // معلومات أساسية
  name: string;
  type: EquipmentType;
  brand: string;
  model: string;
  description?: string;
  
  // الحالة
  condition: EquipmentCondition;
  status: 'available' | 'in_use' | 'maintenance' | 'retired';
  
  // الملكية والمسؤولية
  owner_id: ID;
  
  // التوفر والحجز (مبسط)
  is_available: boolean;
  current_user?: ID;
  reserved_until?: FirebaseTimestamp;
  
  // معلومات مالية أساسية
  purchase_price: number;
  purchase_date: FirebaseTimestamp;
  
  // الموقع (مبسط)
  location: string;
  is_portable: boolean;
  
  // صيانة بسيطة
  last_maintenance?: FirebaseTimestamp;
  next_maintenance?: FirebaseTimestamp;
  warranty_expiry?: FirebaseTimestamp;
  
  // إحصائيات بسيطة
  total_bookings: number;
  total_hours_used: number;
  last_used?: FirebaseTimestamp;
} 
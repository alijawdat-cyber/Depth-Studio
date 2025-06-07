import { ActivatableEntity, FirebaseTimestamp, ID } from './core/base';
import { EquipmentType, EquipmentCondition } from './core/enums';
export interface Equipment extends ActivatableEntity {
    name: string;
    type: EquipmentType;
    brand: string;
    model: string;
    description?: string;
    condition: EquipmentCondition;
    status: 'available' | 'in_use' | 'maintenance' | 'retired';
    owner_id: ID;
    is_available: boolean;
    current_user?: ID;
    reserved_until?: FirebaseTimestamp;
    purchase_price: number;
    purchase_date: FirebaseTimestamp;
    location: string;
    is_portable: boolean;
    last_maintenance?: FirebaseTimestamp;
    next_maintenance?: FirebaseTimestamp;
    warranty_expiry?: FirebaseTimestamp;
    total_bookings: number;
    total_hours_used: number;
    last_used?: FirebaseTimestamp;
}
//# sourceMappingURL=equipment.d.ts.map
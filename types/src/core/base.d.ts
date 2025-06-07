import { Timestamp } from 'firebase/firestore';
export type ID = string;
export type FirebaseTimestamp = Timestamp;
export interface MultiLanguageText {
    ar: string;
    en: string;
}
export interface BaseEntity {
    id: ID;
    created_at: FirebaseTimestamp;
    updated_at: FirebaseTimestamp;
    created_by?: ID;
    updated_by?: ID;
}
export interface ActivatableEntity extends BaseEntity {
    is_active: boolean;
}
export interface ContactInfo {
    email?: string;
    phone?: string;
    whatsapp?: string;
    address?: string;
}
export interface CurrencyAmount {
    amount: number;
    currency: string;
}
export interface DateRange {
    start_date: FirebaseTimestamp;
    end_date: FirebaseTimestamp;
}
export interface TimeRange {
    start_time: string;
    end_time: string;
}
//# sourceMappingURL=base.d.ts.map
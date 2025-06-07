import { BaseEntity, FirebaseTimestamp, ID } from './core/base';
import { PaymentStatus, PaymentMethod, ContractType } from './core/enums';
export interface Payment extends BaseEntity {
    type: 'task_payment' | 'monthly_salary' | 'bonus' | 'reimbursement';
    description: string;
    reference_id: string;
    recipient_id: ID;
    recipient_name: string;
    recipient_type: 'photographer' | 'coordinator' | 'vendor';
    contract_type: ContractType;
    gross_amount: number;
    deductions: number;
    net_amount: number;
    currency: string;
    campaign_id?: ID;
    task_ids: ID[];
    status: PaymentStatus;
    payment_method: PaymentMethod;
    due_date?: FirebaseTimestamp;
    payment_date?: FirebaseTimestamp;
    approved_by?: ID;
    approved_at?: FirebaseTimestamp;
    approval_notes?: string;
    payment_details?: Record<string, string>;
    tax_amount: number;
    processing_fees: number;
    confirmation_number?: string;
    receipt_url?: string;
}
//# sourceMappingURL=payments.d.ts.map
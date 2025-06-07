import { BaseEntity, FirebaseTimestamp, ID } from './core/base';
import { NotificationType, PriorityLevel, UserRole } from './core/enums';
export interface Notification extends BaseEntity {
    type: NotificationType;
    priority: PriorityLevel;
    title: string;
    message: string;
    recipient_id: ID;
    recipient_role: UserRole;
    sender_id?: ID;
    sender_name?: string;
    is_read: boolean;
    read_at?: FirebaseTimestamp;
    is_urgent: boolean;
    campaign_id?: ID;
    task_id?: ID;
    brand_id?: ID;
    action_required: boolean;
    action_url?: string;
    action_deadline?: FirebaseTimestamp;
    action_completed: boolean;
    action_completed_at?: FirebaseTimestamp;
    expires_at?: FirebaseTimestamp;
    attachment_url?: string;
    attachment_name?: string;
}
//# sourceMappingURL=notifications.d.ts.map
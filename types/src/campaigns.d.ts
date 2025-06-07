import { BaseEntity, FirebaseTimestamp, ID } from './core/base';
import { CampaignStatus, CampaignType, PriorityLevel, TaskStatus } from './core/enums';
export interface Campaign extends BaseEntity {
    name: string;
    description: string;
    brand_id: ID;
    type: CampaignType;
    priority: PriorityLevel;
    status: CampaignStatus;
    created_by: ID;
    assigned_photographers: ID[];
    timeline: {
        start_date: FirebaseTimestamp;
        end_date: FirebaseTimestamp;
    };
    target_completion_date: FirebaseTimestamp;
    total_content_pieces: number;
    content_requirements: string[];
    budget: number;
    currency: string;
    enable_smart_assignment: boolean;
    auto_scheduling: boolean;
    progress_percentage: number;
    total_tasks: number;
    completed_tasks: number;
    pending_tasks: number;
    key_milestones: string[];
}
export interface TaskInfo {
    title: string;
    description: string;
    assigned_photographer?: ID;
    status: TaskStatus;
    priority: PriorityLevel;
    due_date: FirebaseTimestamp;
    progress_percentage: number;
}
//# sourceMappingURL=campaigns.d.ts.map
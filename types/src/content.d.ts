import { BaseEntity, MultiLanguageText, FirebaseTimestamp, ID } from './core/base';
import { ContentType, ContentApprovalStatus } from './core/enums';
export interface Content extends BaseEntity {
    title: string;
    description: string;
    type: ContentType;
    brand_id: ID;
    photographer_id: ID;
    campaign_id?: ID;
    task_id?: ID;
    filename: string;
    file_size: number;
    file_format: string;
    file_url: string;
    thumbnail_url?: string;
    width?: number;
    height?: number;
    duration?: number;
    category: string;
    tags: string[];
    style: string[];
    status: ContentApprovalStatus;
    quality_score: number;
    approved_by?: ID;
    approved_at?: FirebaseTimestamp;
    rejection_reason?: string;
    usage_type: 'exclusive' | 'non_exclusive' | 'limited' | 'unlimited';
    view_count: number;
    download_count: number;
    client_rating?: number;
    shooting_location?: string;
    shooting_date?: FirebaseTimestamp;
    license_expiry?: FirebaseTimestamp;
}
export interface ContentCategory extends BaseEntity {
    name: MultiLanguageText;
    description: MultiLanguageText;
    type: string;
    base_price: number;
    estimated_hours: number;
    complexity_factor: number;
    default_requirements: string[];
    is_active: boolean;
    sort_order: number;
    usage_count: number;
}
//# sourceMappingURL=content.d.ts.map
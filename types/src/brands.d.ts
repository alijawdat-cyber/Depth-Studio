import { ActivatableEntity, MultiLanguageText, ID } from './core/base';
import { BrandStatus, BrandType, Industry } from './core/enums';
export interface Brand extends ActivatableEntity {
    name: MultiLanguageText;
    description: MultiLanguageText;
    brand_type: BrandType;
    industry: Industry;
    status: BrandStatus;
    logo_url?: string;
    primary_color: string;
    secondary_color: string;
    contact_name: string;
    contact_email: string;
    contact_phone: string;
    assigned_coordinator?: ID;
    monthly_budget: number;
    currency: string;
    pricing_tier: string;
    preferred_styles: string[];
    content_categories: string[];
    created_by: ID;
    last_updated_by: ID;
    total_campaigns: number;
    total_content_pieces: number;
    average_project_rating: number;
    total_spent: number;
}
//# sourceMappingURL=brands.d.ts.map
import { BaseEntity, ActivatableEntity, FirebaseTimestamp, ID } from './core/base';
import { UserRole, UserStatus, AuthProvider, ContractType, DayOfWeek, LocationType, VerificationStatus } from './core/enums';
import { AuthMethod, RoleSelection } from './auth';
export interface User extends ActivatableEntity {
    email: string;
    phone?: string;
    full_name: string;
    display_name?: string;
    first_name?: string;
    last_name?: string;
    profile_photo_url?: string;
    role: UserRole;
    primary_role?: UserRole;
    status: UserStatus;
    is_verified: boolean;
    auth_methods: AuthMethod[];
    registration_method: AuthProvider;
    phone_verified: boolean;
    role_selected: boolean;
    role_selection_history: RoleSelection[];
    google_linked: boolean;
    permissions: string[];
    preferences: {
        language: string;
        notifications_enabled: boolean;
        email_notifications: boolean;
        sms_notifications: boolean;
        theme: 'light' | 'dark';
    };
    profile: {
        bio: string;
        avatar_url: string;
        social_links: Record<string, string>;
    };
    location?: string;
    timezone?: string;
    firebase_uid?: string;
    auth_providers?: AuthProvider[];
    last_login?: FirebaseTimestamp;
    last_seen?: FirebaseTimestamp;
    is_online?: boolean;
}
export interface UserPermissions extends BaseEntity {
    user_id: ID;
    role: UserRole;
    brand_access: ID[];
    can_approve_content: boolean;
    can_view_financials: boolean;
    can_manage_users: boolean;
    can_manage_brands: boolean;
    can_manage_campaigns: boolean;
    can_view_reports: boolean;
    is_active: boolean;
    granted_by: ID;
    granted_at: FirebaseTimestamp;
}
export interface PhotographerInfo extends BaseEntity {
    user_id: ID;
    contract_type: ContractType;
    monthly_salary?: number;
    task_base_rate?: number;
    specializations: string[];
    skill_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    available_days: DayOfWeek[];
    preferred_locations: LocationType[];
    max_concurrent_tasks: number;
    availability_status: 'available' | 'busy' | 'unavailable';
    hire_date: FirebaseTimestamp;
    verification_status: VerificationStatus;
    total_tasks_completed: number;
    total_earnings_ytd: number;
    average_rating: number;
    experience_years: number;
    rating: number;
    is_available_for_work: boolean;
}
//# sourceMappingURL=users.d.ts.map
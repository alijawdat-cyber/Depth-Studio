import { BaseEntity, FirebaseTimestamp, ID } from './core/base';
import { AuthProvider, UserRole, ContractType, VerificationStatus } from './core/enums';
import { User } from './users';
export interface AuthMethod {
    type: AuthProvider;
    verified: boolean;
    created_at: FirebaseTimestamp;
    last_used?: FirebaseTimestamp;
    metadata?: {
        email_verified?: boolean;
        phone_country_code?: string;
        phone_verified?: boolean;
        google_id?: string;
        google_email?: string;
        google_picture?: string;
    };
}
export interface PhoneVerification extends BaseEntity {
    phone: string;
    country_code: string;
    full_phone: string;
    otp_code: string;
    expires_at: FirebaseTimestamp;
    attempts: number;
    max_attempts: number;
    verified: boolean;
    status: VerificationStatus;
    user_id?: ID;
    ip_address?: string;
}
export interface OTPSendRequest {
    phone: string;
    country_code: string;
    user_id?: ID;
    purpose: 'registration' | 'login' | 'phone_verification' | 'password_reset';
}
export interface OTPSendResult {
    success: boolean;
    message: string;
    expires_at: FirebaseTimestamp;
    attempts_remaining: number;
    can_resend_at: FirebaseTimestamp;
}
export interface OTPVerifyRequest {
    phone: string;
    country_code: string;
    otp_code: string;
    user_id?: ID;
}
export interface OTPVerifyResult {
    success: boolean;
    message: string;
    user?: User;
    token?: string;
    needs_role_selection: boolean;
}
export interface RoleSelection extends BaseEntity {
    user_id: ID;
    selected_role: UserRole;
    additional_data?: {
        contract_type?: ContractType;
        specializations?: string[];
        experience_years?: number;
        portfolio_links?: string[];
        equipment_owned?: string[];
        selected_brand_id?: ID;
        brand_search_query?: string;
        brand_coordinator_experience?: string;
        marketing_experience?: string;
        campaigns_managed?: number;
    };
    status: 'pending' | 'approved' | 'rejected';
    applied_at: FirebaseTimestamp;
    reviewed_at?: FirebaseTimestamp;
    approved_by?: ID;
    rejection_reason?: string;
    admin_notes?: string;
}
export interface RoleSelectionSubmission {
    selected_role: UserRole;
    additional_data?: RoleSelection['additional_data'];
    motivation?: string;
}
export interface RoleSelectionStats {
    total_applications: number;
    pending_applications: number;
    approved_applications: number;
    rejected_applications: number;
    applications_by_role: {
        [role in UserRole]?: number;
    };
    average_approval_time_hours: number;
    approval_rate_percentage: number;
}
export interface EmailRegistrationData {
    email: string;
    password: string;
    confirm_password: string;
    full_name: string;
    phone?: string;
    accept_terms: boolean;
}
export interface PhoneRegistrationData {
    phone: string;
    country_code: string;
    full_name: string;
    accept_terms: boolean;
}
export interface GoogleRegistrationData {
    google_token: string;
    full_name: string;
    email: string;
    profile_picture?: string;
    accept_terms: boolean;
}
export interface EmailLoginData {
    email: string;
    password: string;
    remember_me?: boolean;
}
export interface PhoneLoginData {
    phone: string;
    country_code: string;
}
export interface GoogleLoginData {
    google_token: string;
}
export interface AuthResult {
    success: boolean;
    user?: User;
    token?: string;
    refresh_token?: string;
    needs_role_selection: boolean;
    needs_phone_verification: boolean;
    needs_email_verification: boolean;
    message: string;
    expires_at?: FirebaseTimestamp;
}
export interface AuthSessionState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    token: string | null;
    error: string | null;
    needs_role_selection: boolean;
}
export interface RegistrationStats {
    email_registrations: number;
    phone_registrations: number;
    google_registrations: number;
    total_registrations: number;
    conversion_rates: {
        email_to_verified: number;
        phone_to_verified: number;
        google_to_active: number;
    };
    daily_registrations: {
        date: string;
        email: number;
        phone: number;
        google: number;
    }[];
}
export interface AuthMethodUsageStats {
    total_users: number;
    users_with_email: number;
    users_with_phone: number;
    users_with_google: number;
    users_with_multiple_methods: number;
    preferred_login_method: {
        email: number;
        phone: number;
        google: number;
    };
}
export interface AuthActivityLog extends BaseEntity {
    user_id?: ID;
    activity_type: 'login_attempt' | 'login_success' | 'login_failed' | 'registration_attempt' | 'registration_success' | 'otp_sent' | 'otp_verified' | 'otp_failed' | 'logout' | 'token_refresh';
    auth_method: AuthProvider;
    ip_address: string;
    user_agent: string;
    location?: {
        country: string;
        city: string;
        lat?: number;
        lng?: number;
    };
    success: boolean;
    failure_reason?: string;
    additional_data?: Record<string, any>;
}
export interface AuthSecuritySettings {
    max_login_attempts: number;
    login_lockout_duration_minutes: number;
    otp_expiry_minutes: number;
    max_otp_attempts: number;
    session_timeout_hours: number;
    require_phone_verification: boolean;
    require_email_verification: boolean;
    allow_multiple_sessions: boolean;
    password_min_length: number;
    password_require_special_chars: boolean;
}
//# sourceMappingURL=auth.d.ts.map
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
    timestamp: string;
    request_id?: string;
}
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    data: T[];
    pagination: PaginationInfo;
}
export interface PaginationInfo {
    current_page: number;
    total_pages: number;
    total_items: number;
    items_per_page: number;
    has_next: boolean;
    has_prev: boolean;
}
export interface QueryOptions {
    page?: number;
    limit?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    search?: string;
    filters?: Record<string, any>;
    include_inactive?: boolean;
}
export interface LoginCredentials {
    email: string;
    password: string;
    remember_me?: boolean;
}
export interface RegisterData {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone?: string;
}
export interface AuthState {
    user: AuthUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}
export interface AuthUser {
    uid: string;
    email: string;
    displayName?: string;
    photoURL?: string;
    emailVerified: boolean;
    phoneNumber?: string;
}
export interface QueryFilter {
    field: string;
    operator: '==' | '!=' | '<' | '<=' | '>' | '>=' | 'array-contains' | 'in' | 'not-in';
    value: any;
}
export interface RepositoryQueryOptions {
    filters?: QueryFilter[];
    orderBy?: {
        field: string;
        direction: 'asc' | 'desc';
    }[];
    limit?: number;
    offset?: number;
}
export interface RepositoryPaginationResult<T> {
    data: T[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalCount: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}
//# sourceMappingURL=api.d.ts.map
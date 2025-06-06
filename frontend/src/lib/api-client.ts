import { httpsCallable, HttpsCallableResult } from 'firebase/functions'
import { functions } from './firebase'
import { authService } from './auth'
import {
  SuperAdminStatsResponse,
  MarketingStatsResponse,
  BrandStatsResponse,
  PhotographerStatsResponse,
  CreateUserData,
  UpdateUserData,
  User,
  UsersListResponse,
  DashboardStatsParams,
  SuccessResponse,
  UserRole
} from './api-types'

// Base API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://us-central1-depth-studio.cloudfunctions.net'

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

// Error Types
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// HTTP Client Class
class HttpClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Accept-Language': 'ar'
    }

    try {
      const user = authService.getCurrentUser()
      if (user) {
        const token = await user.getIdToken()
        headers['Authorization'] = `Bearer ${token}`
      }
    } catch (error) {
      console.warn('Failed to get auth token:', error)
    }

    return headers
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new ApiError(
        errorData.message || `HTTP Error: ${response.status}`,
        response.status,
        errorData.code
      )
    }

    return response.json()
  }

  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(endpoint, this.baseURL)
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value)
      })
    }

    const headers = await this.getAuthHeaders()
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers
    })

    return this.handleResponse<T>(response)
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    const headers = await this.getAuthHeaders()
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers,
      body: data ? JSON.stringify(data) : undefined
    })

    return this.handleResponse<T>(response)
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    const headers = await this.getAuthHeaders()
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers,
      body: data ? JSON.stringify(data) : undefined
    })

    return this.handleResponse<T>(response)
  }

  async delete<T>(endpoint: string): Promise<T> {
    const headers = await this.getAuthHeaders()
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers
    })

    return this.handleResponse<T>(response)
  }
}

// Firebase Functions Client
class FunctionsClient {
  async callFunction<T = unknown, R = unknown>(
    functionName: string, 
    data?: T
  ): Promise<R> {
    try {
      const callable = httpsCallable<T, R>(functions, functionName)
      const result: HttpsCallableResult<R> = await callable(data)
      return result.data
    } catch (error) {
      console.error(`Function ${functionName} error:`, error)
      throw new ApiError(
        `خطأ في استدعاء الدالة: ${functionName}`,
        500,
        'FUNCTION_ERROR'
      )
    }
  }

  // Dashboard Stats Functions
  async getSuperAdminStats(): Promise<SuperAdminStatsResponse> {
    return this.callFunction('getSuperAdminStats')
  }

  async getMarketingStats(params?: DashboardStatsParams): Promise<MarketingStatsResponse> {
    return this.callFunction('getMarketingStats', params)
  }

  async getBrandStats(params?: DashboardStatsParams): Promise<BrandStatsResponse> {
    return this.callFunction('getBrandStats', params)
  }

  async getPhotographerStats(params?: DashboardStatsParams): Promise<PhotographerStatsResponse> {
    return this.callFunction('getPhotographerStats', params)
  }

  // User Management Functions
  async createUser(userData: CreateUserData): Promise<User> {
    return this.callFunction('createUser', userData)
  }

  async updateUser(userId: string, userData: UpdateUserData): Promise<User> {
    return this.callFunction('updateUser', { userId, ...userData })
  }

  async deleteUser(userId: string): Promise<SuccessResponse> {
    return this.callFunction('deleteUser', { userId })
  }

  async getUsersByRole(role: UserRole): Promise<UsersListResponse> {
    return this.callFunction('getUsersByRole', { role })
  }

  async updateUserRole(userId: string, newRole: UserRole): Promise<User> {
    return this.callFunction('updateUserRole', { userId, newRole })
  }

  async toggleUserStatus(userId: string): Promise<User> {
    return this.callFunction('toggleUserStatus', { userId })
  }
}

// API Service Class
export class ApiService {
  private httpClient: HttpClient
  private functionsClient: FunctionsClient

  constructor() {
    this.httpClient = new HttpClient(API_BASE_URL)
    this.functionsClient = new FunctionsClient()
  }

  // HTTP Methods
  get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    return this.httpClient.get(endpoint, params)
  }
  
  post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.httpClient.post(endpoint, data)
  }
  
  put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.httpClient.put(endpoint, data)
  }
  
  delete<T>(endpoint: string): Promise<T> {
    return this.httpClient.delete(endpoint)
  }

  // Functions Methods
  callFunction<T = unknown, R = unknown>(functionName: string, data?: T): Promise<R> {
    return this.functionsClient.callFunction(functionName, data)
  }

  // Dashboard APIs
  dashboard = {
    getSuperAdminStats: () => this.functionsClient.getSuperAdminStats(),
    getMarketingStats: (params?: DashboardStatsParams) => this.functionsClient.getMarketingStats(params),
    getBrandStats: (params?: DashboardStatsParams) => this.functionsClient.getBrandStats(params),
    getPhotographerStats: (params?: DashboardStatsParams) => this.functionsClient.getPhotographerStats(params)
  }

  // User Management APIs
  users = {
    create: (userData: CreateUserData) => this.functionsClient.createUser(userData),
    update: (userId: string, userData: UpdateUserData) => this.functionsClient.updateUser(userId, userData),
    delete: (userId: string) => this.functionsClient.deleteUser(userId),
    getByRole: (role: UserRole) => this.functionsClient.getUsersByRole(role),
    updateRole: (userId: string, newRole: UserRole) => this.functionsClient.updateUserRole(userId, newRole),
    toggleStatus: (userId: string) => this.functionsClient.toggleUserStatus(userId)
  }

  // File Upload API
  async uploadFile(file: File, path: string): Promise<string> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('path', path)

    // Get auth headers manually since getAuthHeaders is private
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Accept-Language': 'ar'
    }

    try {
      const user = authService.getCurrentUser()
      if (user) {
        const token = await user.getIdToken()
        headers['Authorization'] = `Bearer ${token}`
      }
    } catch (error) {
      console.warn('Failed to get auth token for upload:', error)
    }

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      headers,
      body: formData
    })

    if (!response.ok) {
      throw new ApiError('فشل في رفع الملف', response.status)
    }

    const data = await response.json()
    return data.url
  }

  // Batch Operations
  async batchOperation<T>(
    operations: Array<() => Promise<T>>
  ): Promise<Array<T | ApiError>> {
    const results = await Promise.allSettled(operations.map(op => op()))
    
    return results.map(result => 
      result.status === 'fulfilled' 
        ? result.value 
        : new ApiError(result.reason.message || 'Unknown error')
    )
  }

  // Health Check
  async healthCheck(): Promise<{ status: string; timestamp: number }> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`)
      return response.json()
    } catch {
      throw new ApiError('فشل في فحص حالة الخادم')
    }
  }
}

// Create and export singleton instance
export const apiService = new ApiService()

// Export convenience functions
export const callFunction = apiService.callFunction
export const uploadFile = apiService.uploadFile.bind(apiService)

// Export error handling utilities
export const isApiError = (error: unknown): error is ApiError => {
  return error instanceof ApiError
}

export const getErrorMessage = (error: unknown): string => {
  if (isApiError(error)) {
    return error.message
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'حدث خطأ غير متوقع'
} 
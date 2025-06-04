import { ref, computed } from 'vue'
import axios from 'axios'

// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

// Create Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add request interceptor for auth token
api.interceptors.request.use((config: any) => {
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Add response interceptor for error handling
api.interceptors.response.use(
  (response: any) => response,
  (error: any) => {
    console.error('Dashboard API Error:', error)
    return Promise.reject(error)
  }
)

// ======================================
// Dashboard API Functions
// ======================================

/**
 * Get Super Admin Dashboard Data
 */
export async function getSuperAdminDashboard() {
  try {
    const response = await api.get('/api/dashboards/super-admin')
    return response.data
  } catch (error) {
    console.error('Error fetching super admin dashboard:', error)
    throw error
  }
}

/**
 * Get Marketing Coordinator Dashboard Data
 */
export async function getMarketingCoordinatorDashboard() {
  try {
    const response = await api.get('/api/dashboards/marketing-coordinator')
    return response.data
  } catch (error) {
    console.error('Error fetching marketing coordinator dashboard:', error)
    throw error
  }
}

/**
 * Get Brand Coordinator Dashboard Data
 */
export async function getBrandCoordinatorDashboard(brandId: string) {
  try {
    const response = await api.get(`/api/dashboards/brand-coordinator/${brandId}`)
    return response.data
  } catch (error) {
    console.error('Error fetching brand coordinator dashboard:', error)
    throw error
  }
}

/**
 * Get Photographer Dashboard Data
 */
export async function getPhotographerDashboard(photographerId: string) {
  try {
    const response = await api.get(`/api/dashboards/photographer/${photographerId}`)
    return response.data
  } catch (error) {
    console.error('Error fetching photographer dashboard:', error)
    throw error
  }
}

// ======================================
// Reactive Dashboard Composables
// ======================================

/**
 * Reactive Super Admin Dashboard
 */
export function useSuperAdminDashboard() {
  const data = ref(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const refresh = async () => {
    loading.value = true
    error.value = null
    try {
      const result = await getSuperAdminDashboard()
      data.value = result.data
    } catch (err: any) {
      error.value = err.message || 'خطأ في تحميل البيانات'
    } finally {
      loading.value = false
    }
  }

  return {
    data: computed(() => data.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    refresh
  }
}

/**
 * Reactive Marketing Coordinator Dashboard
 */
export function useMarketingCoordinatorDashboard() {
  const data = ref(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const refresh = async () => {
    loading.value = true
    error.value = null
    try {
      const result = await getMarketingCoordinatorDashboard()
      data.value = result.data
    } catch (err: any) {
      error.value = err.message || 'خطأ في تحميل البيانات'
    } finally {
      loading.value = false
    }
  }

  return {
    data: computed(() => data.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    refresh
  }
}

/**
 * Reactive Brand Coordinator Dashboard
 */
export function useBrandCoordinatorDashboard(brandId: string) {
  const data = ref(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const refresh = async () => {
    if (!brandId) return
    
    loading.value = true
    error.value = null
    try {
      const result = await getBrandCoordinatorDashboard(brandId)
      data.value = result.data
    } catch (err: any) {
      error.value = err.message || 'خطأ في تحميل البيانات'
    } finally {
      loading.value = false
    }
  }

  return {
    data: computed(() => data.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    refresh
  }
}

/**
 * Reactive Photographer Dashboard
 */
export function usePhotographerDashboard(photographerId: string) {
  const data = ref(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const refresh = async () => {
    if (!photographerId) return
    
    loading.value = true
    error.value = null
    try {
      const result = await getPhotographerDashboard(photographerId)
      data.value = result.data
    } catch (err: any) {
      error.value = err.message || 'خطأ في تحميل البيانات'
    } finally {
      loading.value = false
    }
  }

  return {
    data: computed(() => data.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    refresh
  }
}

// ======================================
// Auto-refresh functionality
// ======================================

/**
 * Auto-refresh dashboard data at intervals
 */
export function useAutoRefresh(refreshFunction: () => Promise<void>, intervalMs = 30000) {
  let intervalId: number | null = null
  const isActive = ref(false)
  
  const start = () => {
    if (intervalId) return
    
    isActive.value = true
    intervalId = window.setInterval(refreshFunction, intervalMs)
  }
  
  const stop = () => {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
      isActive.value = false
    }
  }
  
  const toggle = () => {
    if (isActive.value) {
      stop()
    } else {
      start()
    }
  }

  return {
    isActive: computed(() => isActive.value),
    start,
    stop,
    toggle
  }
}

// ======================================
// Helper Functions
// ======================================

/**
 * Check API health
 */
export async function checkAPIHealth() {
  try {
    const response = await api.get('/health')
    return response.data
  } catch (error) {
    console.error('API health check failed:', error)
    throw error
  }
}

/**
 * Format Iraqi Dinar currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ar-IQ', {
    style: 'currency',
    currency: 'IQD'
  }).format(amount)
}

/**
 * Format date in Arabic
 */
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('ar-IQ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(dateObj)
}

/**
 * Format time ago in Arabic
 */
export function formatTimeAgo(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffMs = now.getTime() - dateObj.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffMins < 1) return 'الآن'
  if (diffMins < 60) return `منذ ${diffMins} دقيقة`
  if (diffHours < 24) return `منذ ${diffHours} ساعة`
  if (diffDays < 7) return `منذ ${diffDays} يوم`
  return formatDate(dateObj)
} 
'use client'

import { useState, useCallback } from 'react'
import type { Toast } from '@/components/ui/toast'

let toastId = 0

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const newToast = { ...toast, id: (++toastId).toString() }
    setToasts(prev => [...prev, newToast])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  return {
    toasts,
    toast: addToast,
    removeToast
  }
}
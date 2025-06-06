'use client'

import { ToastComponent, type Toast } from './toast'
import { useToast } from '@/hooks/useToast'

export function Toaster(): React.ReactElement {
  const { toasts, removeToast } = useToast()
  
  // استخدام Toast type للتأكد من عدم ظهور warning
  const _: Toast[] = toasts; void _

  return (
    <div className="fixed top-0 right-0 z-50 p-6 space-y-4">
      {toasts.map((toast) => (
        <ToastComponent
          key={toast.id}
          {...toast}
          onClose={removeToast}
        />
      ))}
    </div>
  )
}
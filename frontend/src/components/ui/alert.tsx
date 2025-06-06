'use client'

import React, { useState, useEffect } from 'react'
import clsx from 'clsx'
import { FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaTimes, FaTimesCircle } from 'react-icons/fa'

export interface AlertProps {
  variant?: 'success' | 'warning' | 'error' | 'info'
  title?: string
  message: string
  dismissible?: boolean
  onDismiss?: () => void
  actions?: React.ReactNode
  icon?: React.ReactNode
  className?: string
  autoHide?: boolean
  autoHideDuration?: number
}

const variantStyles = {
  success: {
    container: 'bg-green-50 border-green-200 text-green-800',
    icon: 'text-green-400',
    defaultIcon: FaCheckCircle
  },
  warning: {
    container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    icon: 'text-yellow-400',
    defaultIcon: FaExclamationTriangle
  },
  error: {
    container: 'bg-red-50 border-red-200 text-red-800',
    icon: 'text-red-400',
    defaultIcon: FaTimesCircle
  },
  info: {
    container: 'bg-blue-50 border-blue-200 text-blue-800',
    icon: 'text-blue-400',
    defaultIcon: FaInfoCircle
  }
}

export function Alert({
  variant = 'info',
  title,
  message,
  dismissible = false,
  onDismiss,
  actions,
  icon,
  className,
  autoHide = false,
  autoHideDuration = 5000
}: AlertProps) {
  const [isVisible, setIsVisible] = useState(true)
  const styles = variantStyles[variant]
  const IconComponent = styles.defaultIcon

  useEffect(() => {
    if (autoHide && autoHideDuration > 0) {
      const timer = setTimeout(() => {
        handleDismiss()
      }, autoHideDuration)

      return () => clearTimeout(timer)
    }
  }, [autoHide, autoHideDuration])

  const handleDismiss = () => {
    setIsVisible(false)
    onDismiss?.()
  }

  if (!isVisible) return null

  return (
    <div className={clsx(
      'border rounded-lg p-4',
      styles.container,
      className
    )}>
      <div className="flex">
        {/* الأيقونة */}
        <div className="flex-shrink-0">
          {icon || (
            <IconComponent className={clsx('w-5 h-5', styles.icon)} />
          )}
        </div>
        
        {/* المحتوى */}
        <div className="mr-3 flex-1">
          {title && (
            <h3 className="text-sm font-medium mb-1">
              {title}
            </h3>
          )}
          <div className="text-sm">
            {message}
          </div>
          
          {/* الإجراءات */}
          {actions && (
            <div className="mt-3">
              {actions}
            </div>
          )}
        </div>
        
        {/* زر الإغلاق */}
        {dismissible && (
          <div className="flex-shrink-0 mr-auto">
            <button
              type="button"
              className={clsx(
                'inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2',
                'hover:bg-black hover:bg-opacity-10',
                variant === 'success' && 'focus:ring-green-600',
                variant === 'warning' && 'focus:ring-yellow-600',
                variant === 'error' && 'focus:ring-red-600',
                variant === 'info' && 'focus:ring-blue-600'
              )}
              onClick={handleDismiss}
            >
              <FaTimes className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// مكونات متخصصة للأنواع المختلفة
export function SuccessAlert(props: Omit<AlertProps, 'variant'>) {
  return <Alert {...props} variant="success" />
}

export function WarningAlert(props: Omit<AlertProps, 'variant'>) {
  return <Alert {...props} variant="warning" />
}

export function ErrorAlert(props: Omit<AlertProps, 'variant'>) {
  return <Alert {...props} variant="error" />
}

export function InfoAlert(props: Omit<AlertProps, 'variant'>) {
  return <Alert {...props} variant="info" />
}

// مكون لعرض قائمة من التنبيهات
interface AlertListProps {
  alerts: (AlertProps & { id: string })[]
  onDismiss?: (id: string) => void
  className?: string
}

export function AlertList({ alerts, onDismiss, className }: AlertListProps) {
  return (
    <div className={clsx('space-y-4', className)}>
      {alerts.map(alert => (
        <Alert
          key={alert.id}
          {...alert}
          onDismiss={() => onDismiss?.(alert.id)}
        />
      ))}
    </div>
  )
}

// هوك لإدارة التنبيهات
export function useAlerts() {
  const [alerts, setAlerts] = useState<(AlertProps & { id: string })[]>([])

  const addAlert = (alert: Omit<AlertProps & { id: string }, 'id'>) => {
    const id = Date.now().toString()
    const newAlert = { ...alert, id }
    setAlerts(prev => [...prev, newAlert])
    return id
  }

  const removeAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id))
  }

  const clearAlerts = () => {
    setAlerts([])
  }

  const showSuccess = (message: string, options?: Partial<AlertProps>) => {
    return addAlert({ ...options, message, variant: 'success' })
  }

  const showWarning = (message: string, options?: Partial<AlertProps>) => {
    return addAlert({ ...options, message, variant: 'warning' })
  }

  const showError = (message: string, options?: Partial<AlertProps>) => {
    return addAlert({ ...options, message, variant: 'error' })
  }

  const showInfo = (message: string, options?: Partial<AlertProps>) => {
    return addAlert({ ...options, message, variant: 'info' })
  }

  return {
    alerts,
    addAlert,
    removeAlert,
    clearAlerts,
    showSuccess,
    showWarning,
    showError,
    showInfo
  }
}

// مكون حاوي للتنبيهات العامة
interface AlertContainerProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
}

export function AlertContainer({ position = 'top-right' }: AlertContainerProps) {
  const { alerts, removeAlert } = useAlerts()

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
  }

  if (alerts.length === 0) return null

  return (
    <div className={clsx(
      'fixed z-50 max-w-sm w-full',
      positionClasses[position]
    )}>
      <AlertList 
        alerts={alerts} 
        onDismiss={removeAlert}
      />
    </div>
  )
}
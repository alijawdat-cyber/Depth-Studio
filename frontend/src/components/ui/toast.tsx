'use client'

import React, { useEffect } from 'react'
import clsx from 'clsx'
import { FaCheck, FaTimes, FaExclamationTriangle, FaInfo } from 'react-icons/fa'

export interface Toast {
  id: string
  title: string
  description?: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

interface ToastProps extends Toast {
  onClose: (id: string) => void
}

export function ToastComponent({ 
  id, 
  title, 
  description, 
  type, 
  duration = 5000, 
  onClose 
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id)
    }, duration)

    return () => clearTimeout(timer)
  }, [id, duration, onClose])

  const icons = {
    success: <FaCheck className="w-5 h-5" />,
    error: <FaTimes className="w-5 h-5" />,
    warning: <FaExclamationTriangle className="w-5 h-5" />,
    info: <FaInfo className="w-5 h-5" />
  }

  const styles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  }

  const iconStyles = {
    success: 'text-green-400',
    error: 'text-red-400',
    warning: 'text-yellow-400',
    info: 'text-blue-400'
  }

  return (
    <div className={clsx(
      'max-w-sm w-full shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden',
      'transform transition-all duration-300 ease-in-out',
      styles[type]
    )}>
      <div className="p-4">
        <div className="flex items-start">
          <div className={clsx('flex-shrink-0', iconStyles[type])}>
            {icons[type]}
          </div>
          <div className="mr-3 w-0 flex-1 pt-0.5">
            <p className="text-sm font-medium text-gray-900">{title}</p>
            {description && (
              <p className="mt-1 text-sm text-gray-500">{description}</p>
            )}
          </div>
          <div className="mr-4 flex-shrink-0 flex">
            <button
              className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={() => onClose(id)}
            >
              <FaTimes className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
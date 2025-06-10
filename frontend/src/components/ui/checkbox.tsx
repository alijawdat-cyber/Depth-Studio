'use client'

import React from 'react'
import clsx from 'clsx'
import { FaCheck, FaMinus } from 'react-icons/fa'

export interface CheckboxOption {
  value: string
  label: string
  description?: string
  disabled?: boolean
}

interface CheckboxProps {
  checked: boolean
  indeterminate?: boolean
  // فدالة onChange: الباراميتر checked مستخدم في event handler
  // eslint-disable-next-line no-unused-vars
  onChange: (checked: boolean) => void
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  error?: boolean
  children?: React.ReactNode
  className?: string
}

interface CheckboxGroupProps {
  options: CheckboxOption[]
  values: string[]
  // فدالة onChange: الباراميتر values مستخدم في event handler للمجموعة
  // eslint-disable-next-line no-unused-vars
  onChange: (values: string[]) => void
  orientation?: 'horizontal' | 'vertical'
  size?: 'sm' | 'md' | 'lg'
  error?: string
  className?: string
  maxSelections?: number
}

export function Checkbox({ 
  checked, 
  indeterminate = false,
  onChange, 
  disabled = false, 
  size = 'md',
  error = false,
  children,
  className 
}: CheckboxProps) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4'
  }

  return (
    <label className={clsx(
      'flex items-center cursor-pointer',
      disabled && 'cursor-not-allowed opacity-50',
      className
    )}>
      <div className="relative flex items-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only"
        />
        <div className={clsx(
          'border-2 rounded flex items-center justify-center transition-colors',
          sizes[size],
          checked || indeterminate
            ? 'border-primary-600 bg-primary-600' 
            : 'border-gray-300 bg-white hover:border-primary-400',
          error && 'border-red-300',
          disabled && 'border-gray-200 bg-gray-100'
        )}>
          {checked && (
            <FaCheck className={clsx('text-white', iconSizes[size])} />
          )}
          {indeterminate && !checked && (
            <FaMinus className={clsx('text-white', iconSizes[size])} />
          )}
        </div>
      </div>
      {children && (
        <span className={clsx(
          'mr-3 text-gray-900 select-none',
          textSizes[size],
          disabled && 'text-gray-400',
          error && 'text-red-600'
        )}>
          {children}
        </span>
      )}
    </label>
  )
}

export function CheckboxGroup({
  options,
  values,
  onChange,
  orientation = 'vertical',
  size = 'md',
  error,
  className,
  maxSelections
}: CheckboxGroupProps) {
  const handleCheckboxChange = (optionValue: string, checked: boolean) => {
    if (checked) {
      // التحقق من الحد الأقصى للاختيارات
      if (maxSelections && values.length >= maxSelections) {
        return
      }
      onChange([...values, optionValue])
    } else {
      onChange(values.filter(value => value !== optionValue))
    }
  }

  const isAllSelected = options.every(option => 
    option.disabled || values.includes(option.value)
  )
  
  const isSomeSelected = options.some(option => 
    values.includes(option.value)
  )

  const handleSelectAll = () => {
    if (isAllSelected) {
      // إلغاء تحديد الكل
      onChange([])
    } else {
      // تحديد الكل (مع مراعاة الحد الأقصى والعناصر المعطلة)
      const enabledOptions = options.filter(option => !option.disabled)
      const newValues = maxSelections 
        ? enabledOptions.slice(0, maxSelections).map(option => option.value)
        : enabledOptions.map(option => option.value)
      onChange(newValues)
    }
  }

  return (
    <div className={clsx('w-full', className)}>
      {/* خيار تحديد الكل */}
      {options.length > 2 && (
        <div className="mb-4 pb-3 border-b border-gray-200">
          <Checkbox
            checked={isAllSelected}
            indeterminate={isSomeSelected && !isAllSelected}
            onChange={handleSelectAll}
            size={size}
          >
            <span className="font-medium">تحديد الكل</span>
          </Checkbox>
        </div>
      )}

      {/* قائمة الخيارات */}
      <div className={clsx(
        'space-y-3',
        orientation === 'horizontal' && 'flex flex-wrap gap-6 space-y-0'
      )}>
        {options.map((option) => (
          <div key={option.value}>
            <Checkbox
              checked={values.includes(option.value)}
              onChange={(checked) => handleCheckboxChange(option.value, checked)}
              disabled={option.disabled || Boolean(
                maxSelections && 
                !values.includes(option.value) && 
                values.length >= maxSelections
              )}
              size={size}
              error={!!error}
            >
              <div>
                <div className="font-medium">{option.label}</div>
                {option.description && (
                  <div className="text-sm text-gray-500 mt-1">
                    {option.description}
                  </div>
                )}
              </div>
            </Checkbox>
          </div>
        ))}
      </div>

      {/* رسالة الحد الأقصى */}
      {maxSelections && values.length >= maxSelections && (
        <p className="mt-2 text-sm text-amber-600">
          تم الوصول للحد الأقصى ({maxSelections} عناصر)
        </p>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
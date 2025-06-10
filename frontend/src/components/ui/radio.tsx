'use client'

import React from 'react'
import clsx from 'clsx'

export interface RadioOption {
  value: string
  label: string
  description?: string
  disabled?: boolean
}

interface RadioGroupProps {
  name: string
  options: RadioOption[]
  value?: string
  // فدالة onChange: الباراميتر value مستخدم في event handler
  // eslint-disable-next-line no-unused-vars
  onChange: (value: string) => void
  orientation?: 'horizontal' | 'vertical'
  size?: 'sm' | 'md' | 'lg'
  error?: string
  className?: string
}

interface RadioProps {
  name: string
  value: string
  checked: boolean
  // فدالة onChange: الباراميتر value مستخدم في event handler للـ radio individual
  // eslint-disable-next-line no-unused-vars
  onChange: (value: string) => void
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export function Radio({ 
  name, 
  value, 
  checked, 
  onChange, 
  disabled = false, 
  size = 'md',
  children 
}: RadioProps) {
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

  return (
    <label className={clsx(
      'flex items-center cursor-pointer',
      disabled && 'cursor-not-allowed opacity-50'
    )}>
      <div className="relative flex items-center">
        <input
          type="radio"
          name={name}
          value={value}
          checked={checked}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="sr-only"
        />
        <div className={clsx(
          'border-2 rounded-full flex items-center justify-center transition-colors',
          sizes[size],
          checked 
            ? 'border-primary-600 bg-primary-600' 
            : 'border-gray-300 bg-white hover:border-primary-400',
          disabled && 'border-gray-200 bg-gray-100'
        )}>
          {checked && (
            <div className={clsx(
              'rounded-full bg-white',
              size === 'sm' && 'w-1.5 h-1.5',
              size === 'md' && 'w-2 h-2',
              size === 'lg' && 'w-2.5 h-2.5'
            )} />
          )}
        </div>
      </div>
      <span className={clsx(
        'mr-3 text-gray-900 select-none',
        textSizes[size],
        disabled && 'text-gray-400'
      )}>
        {children}
      </span>
    </label>
  )
}

export function RadioGroup({
  name,
  options,
  value,
  onChange,
  orientation = 'vertical',
  size = 'md',
  error,
  className
}: RadioGroupProps) {
  return (
    <div className={clsx('w-full', className)}>
      <div className={clsx(
        'space-y-3',
        orientation === 'horizontal' && 'flex flex-wrap gap-6 space-y-0'
      )}>
        {options.map((option) => (
          <div key={option.value}>
            <Radio
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={onChange}
              disabled={option.disabled}
              size={size}
            >
              <div>
                <div className="font-medium">{option.label}</div>
                {option.description && (
                  <div className="text-sm text-gray-500 mt-1">
                    {option.description}
                  </div>
                )}
              </div>
            </Radio>
          </div>
        ))}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
'use client'

import React, { useState, useRef, useEffect } from 'react'
import clsx from 'clsx'
import { FaChevronDown, FaCheck } from 'react-icons/fa'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

interface SelectProps {
  options: SelectOption[]
  value?: string
  placeholder?: string
  disabled?: boolean
  error?: string
  // فدالة onChange: الباراميتر value مستخدم في selection handler
  // eslint-disable-next-line no-unused-vars
  onChange: (value: string) => void
  className?: string
}

export function Select({
  options,
  value,
  placeholder = 'اختر...',
  disabled = false,
  error,
  onChange,
  className
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const selectRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find(option => option.value === value)

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  )

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchTerm('')
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleSelect = (optionValue: string) => {
    onChange(optionValue)
    setIsOpen(false)
    setSearchTerm('')
  }

  return (
    <div className="w-full">
      <div className="relative" ref={selectRef}>
        <button
          type="button"
          className={clsx(
            'relative w-full bg-white border rounded-lg px-3 py-2 text-right cursor-default focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            error ? 'border-red-300' : 'border-gray-300',
            disabled && 'bg-gray-50 text-gray-500 cursor-not-allowed',
            className
          )}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
        >
          <span className={clsx(
            'block truncate',
            !selectedOption && 'text-gray-500'
          )}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <span className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
            <FaChevronDown 
              className={clsx(
                'w-4 h-4 text-gray-400 transition-transform',
                isOpen && 'transform rotate-180'
              )} 
            />
          </span>
        </button>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
            {/* شريط البحث */}
            <div className="p-2 border-b border-gray-200">
              <input
                type="text"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="البحث..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* قائمة الخيارات */}
            <div className="max-h-60 overflow-auto">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={clsx(
                      'relative w-full px-3 py-2 text-right cursor-default select-none hover:bg-gray-100',
                      option.disabled && 'text-gray-400 cursor-not-allowed',
                      value === option.value && 'bg-primary-50 text-primary-600'
                    )}
                    onClick={() => !option.disabled && handleSelect(option.value)}
                    disabled={option.disabled}
                  >
                    <span className="block truncate">{option.label}</span>
                    {value === option.value && (
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <FaCheck className="w-4 h-4 text-primary-600" />
                      </span>
                    )}
                  </button>
                ))
              ) : (
                <div className="px-3 py-2 text-gray-500 text-center">
                  لا توجد نتائج
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
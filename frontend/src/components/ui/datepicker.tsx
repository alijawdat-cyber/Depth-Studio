'use client'

import React, { useState, useRef, useEffect } from 'react'
import clsx from 'clsx'
import { FaCalendarAlt, FaChevronLeft, FaChevronRight, FaClock } from 'react-icons/fa'

interface DatePickerProps {
  value?: Date
  // فدالة onChange: الباراميتر date مستخدم في date selection handler
  // eslint-disable-next-line no-unused-vars
  onChange: (date: Date | null) => void
  placeholder?: string
  disabled?: boolean
  error?: string
  showTime?: boolean
  minDate?: Date
  maxDate?: Date
  className?: string
}

const arabicMonths = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
]

const arabicDays = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']

export function DatePicker({
  value,
  onChange,
  placeholder = 'اختر التاريخ',
  disabled = false,
  error,
  showTime = false,
  minDate,
  maxDate,
  className
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(value ? value.getMonth() : new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(value ? value.getFullYear() : new Date().getFullYear())
  const [selectedTime, setSelectedTime] = useState({
    hours: value ? value.getHours() : 12,
    minutes: value ? value.getMinutes() : 0
  })
  
  const datePickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }
    
    if (showTime) {
      options.hour = '2-digit'
      options.minute = '2-digit'
    }
    
    return new Intl.DateTimeFormat('ar-SA', options).format(date)
  }

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay()
  }

  const isDateDisabled = (date: Date) => {
    if (minDate && date < minDate) return true
    if (maxDate && date > maxDate) return true
    return false
  }

  const handleDateSelect = (day: number) => {
    const newDate = new Date(currentYear, currentMonth, day, selectedTime.hours, selectedTime.minutes)
    
    if (!isDateDisabled(newDate)) {
      onChange(newDate)
      if (!showTime) {
        setIsOpen(false)
      }
    }
  }

  const handleTimeChange = (type: 'hours' | 'minutes', newValue: number) => {
    const newTime = { ...selectedTime, [type]: newValue }
    setSelectedTime(newTime)
    
    if (value) {
      const newDate = new Date(
        value.getFullYear(),
        value.getMonth(),
        value.getDate(),
        newTime.hours,
        newTime.minutes
      )
      onChange(newDate)
    }
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11)
        setCurrentYear(currentYear - 1)
      } else {
        setCurrentMonth(currentMonth - 1)
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0)
        setCurrentYear(currentYear + 1)
      } else {
        setCurrentMonth(currentMonth + 1)
      }
    }
  }

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear)
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear)
    const days = []

    // أيام فارغة من الشهر السابق
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="w-8 h-8" />)
    }

    // أيام الشهر الحالي
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day)
      const isSelected = value && 
        value.getDate() === day && 
        value.getMonth() === currentMonth && 
        value.getFullYear() === currentYear
      const isDisabled = isDateDisabled(date)
      const isToday = new Date().toDateString() === date.toDateString()

      days.push(
        <button
          key={day}
          type="button"
          onClick={() => handleDateSelect(day)}
          disabled={isDisabled}
          className={clsx(
            'w-8 h-8 text-sm rounded-full hover:bg-primary-100 transition-colors',
            isSelected && 'bg-primary-600 text-white hover:bg-primary-700',
            isToday && !isSelected && 'bg-primary-50 text-primary-600 font-bold',
            isDisabled && 'text-gray-300 cursor-not-allowed hover:bg-transparent',
            !isSelected && !isToday && !isDisabled && 'text-gray-700'
          )}
        >
          {day}
        </button>
      )
    }

    return days
  }

  return (
    <div className="w-full">
      <div className="relative" ref={datePickerRef}>
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={clsx(
            'w-full flex items-center justify-between px-3 py-2 bg-white border rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            error ? 'border-red-300' : 'border-gray-300',
            disabled && 'bg-gray-50 text-gray-500 cursor-not-allowed',
            className
          )}
        >
          <span className={clsx(
            'block truncate',
            !value && 'text-gray-500'
          )}>
            {value ? formatDate(value) : placeholder}
          </span>
          <FaCalendarAlt className="w-4 h-4 text-gray-400" />
        </button>

        {isOpen && (
          <div className="absolute z-50 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg">
            <div className="p-4">
              {/* التنقل بين الشهور */}
              <div className="flex items-center justify-between mb-4">
                <button
                  type="button"
                  onClick={() => navigateMonth('next')}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <FaChevronLeft className="w-4 h-4" />
                </button>
                
                <h3 className="text-lg font-semibold">
                  {arabicMonths[currentMonth]} {currentYear}
                </h3>
                
                <button
                  type="button"
                  onClick={() => navigateMonth('prev')}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <FaChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* أسماء الأيام */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {arabicDays.map(day => (
                  <div key={day} className="w-8 h-8 flex items-center justify-center text-xs font-medium text-gray-500">
                    {day.slice(0, 2)}
                  </div>
                ))}
              </div>

              {/* التقويم */}
              <div className="grid grid-cols-7 gap-1">
                {renderCalendar()}
              </div>

              {/* منتقي الوقت */}
              {showTime && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-center space-x-2 space-x-reverse">
                    <FaClock className="w-4 h-4 text-gray-500" />
                    <select
                      value={selectedTime.hours}
                      onChange={(e) => handleTimeChange('hours', parseInt(e.target.value))}
                      className="border border-gray-300 rounded px-2 py-1 text-sm"
                    >
                      {Array.from({ length: 24 }, (_, i) => (
                        <option key={i} value={i}>
                          {i.toString().padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                    <span>:</span>
                    <select
                      value={selectedTime.minutes}
                      onChange={(e) => handleTimeChange('minutes', parseInt(e.target.value))}
                      className="border border-gray-300 rounded px-2 py-1 text-sm"
                    >
                      {Array.from({ length: 60 }, (_, i) => (
                        <option key={i} value={i}>
                          {i.toString().padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* أزرار التحكم */}
              <div className="flex justify-between mt-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => onChange(null)}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                >
                  مسح
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700"
                >
                  تأكيد
                </button>
              </div>
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
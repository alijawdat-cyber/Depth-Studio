'use client'

import React from 'react'
import clsx from 'clsx'
import { FaArrowUp, FaArrowDown, FaMinus } from 'react-icons/fa'

export interface StatsCardProps {
  title: string
  value: string | number
  change?: {
    value: number
    type: 'increase' | 'decrease' | 'neutral'
    period?: string
  }
  icon?: React.ReactNode
  description?: string
  loading?: boolean
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gray'
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
  className?: string
}

const colorVariants = {
  blue: {
    bg: 'bg-blue-50',
    icon: 'text-blue-600',
    border: 'border-blue-200'
  },
  green: {
    bg: 'bg-green-50',
    icon: 'text-green-600',
    border: 'border-green-200'
  },
  red: {
    bg: 'bg-red-50',
    icon: 'text-red-600',
    border: 'border-red-200'
  },
  yellow: {
    bg: 'bg-yellow-50',
    icon: 'text-yellow-600',
    border: 'border-yellow-200'
  },
  purple: {
    bg: 'bg-purple-50',
    icon: 'text-purple-600',
    border: 'border-purple-200'
  },
  gray: {
    bg: 'bg-gray-50',
    icon: 'text-gray-600',
    border: 'border-gray-200'
  }
}

const sizeVariants = {
  sm: {
    padding: 'p-4',
    iconSize: 'w-8 h-8',
    titleSize: 'text-sm',
    valueSize: 'text-xl',
    changeSize: 'text-xs'
  },
  md: {
    padding: 'p-6',
    iconSize: 'w-10 h-10',
    titleSize: 'text-base',
    valueSize: 'text-2xl',
    changeSize: 'text-sm'
  },
  lg: {
    padding: 'p-8',
    iconSize: 'w-12 h-12',
    titleSize: 'text-lg',
    valueSize: 'text-3xl',
    changeSize: 'text-base'
  }
}

export function StatsCard({
  title,
  value,
  change,
  icon,
  description,
  loading = false,
  color = 'blue',
  size = 'md',
  onClick,
  className
}: StatsCardProps) {
  const colorClasses = colorVariants[color]
  const sizeClasses = sizeVariants[size]

  const getChangeIcon = () => {
    if (!change) return null
    
    switch (change.type) {
      case 'increase':
        return <FaArrowUp className="w-3 h-3" />
      case 'decrease':
        return <FaArrowDown className="w-3 h-3" />
      case 'neutral':
        return <FaMinus className="w-3 h-3" />
      default:
        return null
    }
  }

  const getChangeColor = () => {
    if (!change) return 'text-gray-500'
    
    switch (change.type) {
      case 'increase':
        return 'text-green-600'
      case 'decrease':
        return 'text-red-600'
      case 'neutral':
        return 'text-gray-500'
      default:
        return 'text-gray-500'
    }
  }

  if (loading) {
    return (
      <div className={clsx(
        'bg-white rounded-lg border border-gray-200 shadow-sm animate-pulse',
        sizeClasses.padding,
        className
      )}>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-2" />
            <div className="h-3 bg-gray-200 rounded w-1/3" />
          </div>
          <div className={clsx('bg-gray-200 rounded-full', sizeClasses.iconSize)} />
        </div>
      </div>
    )
  }

  return (
    <div
      className={clsx(
        'bg-white rounded-lg border border-gray-200 shadow-sm transition-all duration-200',
        onClick && 'cursor-pointer hover:shadow-md hover:border-gray-300',
        sizeClasses.padding,
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          {/* العنوان */}
          <p className={clsx(
            'font-medium text-gray-600 mb-1',
            sizeClasses.titleSize
          )}>
            {title}
          </p>
          
          {/* القيمة */}
          <p className={clsx(
            'font-bold text-gray-900 mb-1',
            sizeClasses.valueSize
          )}>
            {typeof value === 'number' ? value.toLocaleString('ar-SA') : value}
          </p>
          
          {/* التغيير */}
          {change && (
            <div className={clsx(
              'flex items-center space-x-1 space-x-reverse',
              getChangeColor(),
              sizeClasses.changeSize
            )}>
              {getChangeIcon()}
              <span>
                {Math.abs(change.value)}%
                {change.period && ` ${change.period}`}
              </span>
            </div>
          )}
          
          {/* الوصف */}
          {description && (
            <p className={clsx(
              'text-gray-500 mt-1',
              size === 'sm' ? 'text-xs' : 'text-sm'
            )}>
              {description}
            </p>
          )}
        </div>
        
        {/* الأيقونة */}
        {icon && (
          <div className={clsx(
            'flex items-center justify-center rounded-full',
            colorClasses.bg,
            colorClasses.border,
            colorClasses.icon,
            sizeClasses.iconSize,
            'border'
          )}>
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}

// مكون لعرض مجموعة من البطاقات
interface StatsGridProps {
  stats: StatsCardProps[]
  columns?: 1 | 2 | 3 | 4
  className?: string
}

export function StatsGrid({ 
  stats, 
  columns = 4,
  className 
}: StatsGridProps) {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  }

  return (
    <div className={clsx(
      'grid gap-4',
      gridClasses[columns],
      className
    )}>
      {stats.map((stat, index) => (
        <StatsCard key={index} {...stat} />
      ))}
    </div>
  )
}

// مكونات متخصصة للاستخدامات المختلفة
export function SimpleStatsCard({
  title,
  value,
  icon,
  color = 'blue',
  onClick
}: {
  title: string
  value: string | number
  icon?: React.ReactNode
  color?: StatsCardProps['color']
  onClick?: () => void
}) {
  return (
    <StatsCard
      title={title}
      value={value}
      icon={icon}
      color={color}
      onClick={onClick}
      size="sm"
    />
  )
}

export function TrendStatsCard({
  title,
  value,
  previousValue,
  icon,
  color = 'blue',
  period = 'من الشهر الماضي'
}: {
  title: string
  value: number
  previousValue: number
  icon?: React.ReactNode
  color?: StatsCardProps['color']
  period?: string
}) {
  const change = {
    value: previousValue === 0 ? 0 : Math.round(((value - previousValue) / previousValue) * 100),
    type: value > previousValue ? 'increase' as const : 
          value < previousValue ? 'decrease' as const : 'neutral' as const,
    period
  }

  return (
    <StatsCard
      title={title}
      value={value}
      change={change}
      icon={icon}
      color={color}
    />
  )
}
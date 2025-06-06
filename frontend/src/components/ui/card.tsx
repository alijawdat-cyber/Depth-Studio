import React from 'react'
import clsx from 'clsx'

interface BaseCardProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'clickable' | 'elevated' | 'outlined'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
}

interface ClickableCardProps extends BaseCardProps {
  onClick?: () => void
  variant?: 'clickable'
  disabled?: boolean
}

interface DefaultCardProps extends BaseCardProps {
  onClick?: never
  variant?: 'default' | 'elevated' | 'outlined'
}

type CardProps = ClickableCardProps | DefaultCardProps

const cardVariants = {
  default: 'bg-white border border-gray-200 shadow-sm',
  clickable: 'bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200 cursor-pointer',
  elevated: 'bg-white border border-gray-200 shadow-lg',
  outlined: 'bg-white border-2 border-gray-300 shadow-none'
}

const cardSizes = {
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6'
}

export function Card({ 
  children, 
  className, 
  variant = 'default',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  ...props 
}: CardProps) {
  const isClickable = variant === 'clickable' || !!onClick
  const Component = isClickable ? 'button' : 'div'

  const handleClick = () => {
    if (disabled || loading || !onClick) return
    onClick()
  }

  return (
    <Component
      className={clsx(
        'rounded-lg relative overflow-hidden',
        cardVariants[variant],
        cardSizes[size],
        {
          // Clickable states
          'hover:bg-gray-50 active:bg-gray-100': isClickable && !disabled && !loading,
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2': isClickable,
          
          // Disabled state
          'opacity-50 cursor-not-allowed': disabled,
          'hover:shadow-sm hover:border-gray-200': disabled,
          
          // Loading state
          'cursor-wait': loading,
          
          // Remove default button styles
          'border-none p-0 text-left': false, // Keep our custom styling
        },
        className
      )}
      onClick={isClickable ? handleClick : undefined}
      disabled={disabled || loading}
      {...props}
    >
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
        </div>
      )}
      
      {children}
    </Component>
  )
}

interface CardHeaderProps {
  children: React.ReactNode
  className?: string
  actions?: React.ReactNode
}

export function CardHeader({ children, className, actions }: CardHeaderProps) {
  return (
    <div className={clsx('flex items-center justify-between border-b border-gray-200 pb-4 mb-4', className)}>
      <div>{children}</div>
      {actions && <div className="flex items-center space-x-2">{actions}</div>}
    </div>
  )
}

interface CardContentProps {
  children: React.ReactNode
  className?: string
  padded?: boolean
}

export function CardContent({ children, className, padded = true }: CardContentProps) {
  return (
    <div className={clsx(padded && 'px-1 py-1', className)}>
      {children}
    </div>
  )
}

interface CardFooterProps {
  children: React.ReactNode
  className?: string
  actions?: React.ReactNode
  align?: 'left' | 'center' | 'right' | 'between'
}

export function CardFooter({ children, className, actions, align = 'between' }: CardFooterProps) {
  const alignClasses = {
    left: 'justify-start',
    center: 'justify-center', 
    right: 'justify-end',
    between: 'justify-between'
  }

  return (
    <div className={clsx(
      'flex items-center border-t border-gray-200 pt-4 mt-4',
      alignClasses[align],
      className
    )}>
      <div>{children}</div>
      {actions && <div className="flex items-center space-x-2">{actions}</div>}
    </div>
  )
}

// Specialized Card Variants
interface SelectableCardProps extends Omit<CardProps, 'variant'> {
  selected?: boolean
  onSelect?: () => void
}

export function SelectableCard({ 
  children, 
  className, 
  selected = false, 
  onSelect,
  disabled = false,
  ...props 
}: SelectableCardProps) {
  return (
    <Card
      variant="clickable"
      className={clsx(
        'transition-all duration-200',
        {
          'ring-2 ring-primary-600 border-primary-200 bg-primary-50': selected && !disabled,
          'hover:ring-1 hover:ring-primary-300': !selected && !disabled,
        },
        className
      )}
      onClick={onSelect}
      disabled={disabled}
      {...props}
    >
      {selected && (
        <div className="absolute top-2 right-2 w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
          ✓
        </div>
      )}
      {children}
    </Card>
  )
}

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: React.ReactNode
  trend?: {
    value: number
    label: string
    direction: 'up' | 'down' | 'neutral'
  }
  className?: string
}

export function StatsCard({ title, value, subtitle, icon, trend, className }: StatsCardProps) {
  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600', 
    neutral: 'text-gray-600'
  }

  return (
    <Card variant="elevated" className={clsx('text-center', className)}>
      {icon && (
        <div className="flex justify-center mb-3">
          <div className="p-3 bg-primary-100 text-primary-600 rounded-lg">
            {icon}
          </div>
        </div>
      )}
      
      <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
      
      {subtitle && (
        <p className="text-sm text-gray-500">{subtitle}</p>
      )}
      
      {trend && (
        <div className={clsx('text-sm font-medium mt-2', trendColors[trend.direction])}>
          {trend.direction === 'up' && '↗'}
          {trend.direction === 'down' && '↘'}
          {trend.direction === 'neutral' && '→'}
          {' '}{Math.abs(trend.value)}% {trend.label}
        </div>
      )}
    </Card>
  )
}
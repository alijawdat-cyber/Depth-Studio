'use client'

import React from 'react'
import clsx from 'clsx'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'rectangular' | 'circular'
  animation?: 'pulse' | 'wave' | 'none'
  width?: string | number
  height?: string | number
}

export function Skeleton({
  className,
  variant = 'text',
  animation = 'pulse',
  width,
  height
}: SkeletonProps) {
  const baseClasses = 'bg-gray-200'
  
  const variantClasses = {
    text: 'rounded',
    rectangular: 'rounded-md',
    circular: 'rounded-full'
  }
  
  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-wave',
    none: ''
  }

  const style: React.CSSProperties = {}
  if (width) style.width = typeof width === 'number' ? `${width}px` : width
  if (height) style.height = typeof height === 'number' ? `${height}px` : height

  return (
    <div
      className={clsx(
        baseClasses,
        variantClasses[variant],
        animationClasses[animation],
        variant === 'text' && 'h-4',
        className
      )}
      style={style}
    />
  )
}

// مكونات متخصصة للاستخدامات المختلفة

export function TextSkeleton({ 
  lines = 1, 
  className,
  spacing = 'space-y-2'
}: { 
  lines?: number
  className?: string
  spacing?: string
}) {
  return (
    <div className={clsx(spacing, className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton 
          key={index} 
          variant="text" 
          className={clsx(
            index === lines - 1 && lines > 1 && 'w-3/4' // آخر سطر أقصر
          )}
        />
      ))}
    </div>
  )
}

export function AvatarSkeleton({ 
  size = 'md',
  className 
}: { 
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  }

  return (
    <Skeleton
      variant="circular"
      className={clsx(sizes[size], className)}
    />
  )
}

export function CardSkeleton({ 
  showAvatar = false,
  showActions = false,
  className 
}: {
  showAvatar?: boolean
  showActions?: boolean
  className?: string
}) {
  return (
    <div className={clsx('p-6 bg-white rounded-lg border border-gray-200', className)}>
      {showAvatar && (
        <div className="flex items-center space-x-4 space-x-reverse mb-4">
          <AvatarSkeleton size="md" />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" className="w-1/3" />
            <Skeleton variant="text" className="w-1/2" />
          </div>
        </div>
      )}
      
      <div className="space-y-3">
        <Skeleton variant="text" className="w-full" />
        <Skeleton variant="text" className="w-full" />
        <Skeleton variant="text" className="w-3/4" />
      </div>
      
      {showActions && (
        <div className="flex space-x-2 space-x-reverse mt-4">
          <Skeleton variant="rectangular" className="w-20 h-8" />
          <Skeleton variant="rectangular" className="w-20 h-8" />
        </div>
      )}
    </div>
  )
}

export function TableSkeleton({ 
  rows = 5,
  columns = 4,
  showHeader = true,
  className 
}: {
  rows?: number
  columns?: number
  showHeader?: boolean
  className?: string
}) {
  return (
    <div className={clsx('bg-white rounded-lg border border-gray-200 overflow-hidden', className)}>
      <table className="w-full">
        {showHeader && (
          <thead className="bg-gray-50">
            <tr>
              {Array.from({ length: columns }).map((_, index) => (
                <th key={index} className="px-4 py-3">
                  <Skeleton variant="text" className="w-20" />
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody className="divide-y divide-gray-200">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td key={colIndex} className="px-4 py-3">
                  <Skeleton variant="text" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function ListSkeleton({ 
  items = 5,
  showAvatar = true,
  className 
}: {
  items?: number
  showAvatar?: boolean
  className?: string
}) {
  return (
    <div className={clsx('space-y-4', className)}>
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="flex items-center space-x-4 space-x-reverse p-4 bg-white rounded-lg border border-gray-200">
          {showAvatar && <AvatarSkeleton size="md" />}
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" className="w-1/3" />
            <Skeleton variant="text" className="w-full" />
          </div>
          <Skeleton variant="rectangular" className="w-16 h-8" />
        </div>
      ))}
    </div>
  )
}

export function StatsSkeleton({ 
  cards = 4,
  className 
}: {
  cards?: number
  className?: string
}) {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  }

  return (
    <div className={clsx(
      'grid gap-4',
      gridClasses[cards as keyof typeof gridClasses] || 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
      className
    )}>
      {Array.from({ length: cards }).map((_, index) => (
        <div key={index} className="p-6 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Skeleton variant="text" className="w-1/2 mb-2" />
              <Skeleton variant="text" className="w-1/3 h-8 mb-2" />
              <Skeleton variant="text" className="w-1/4" />
            </div>
            <Skeleton variant="circular" className="w-12 h-12" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function FormSkeleton({ 
  fields = 5,
  showButtons = true,
  className 
}: {
  fields?: number
  showButtons?: boolean
  className?: string
}) {
  return (
    <div className={clsx('space-y-6', className)}>
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton variant="text" className="w-1/4" />
          <Skeleton variant="rectangular" className="w-full h-10" />
        </div>
      ))}
      
      {showButtons && (
        <div className="flex space-x-4 space-x-reverse pt-4">
          <Skeleton variant="rectangular" className="w-24 h-10" />
          <Skeleton variant="rectangular" className="w-24 h-10" />
        </div>
      )}
    </div>
  )
}

// هيكل الصفحة الكاملة
export function PageSkeleton() {
  return (
    <div className="space-y-6">
      {/* العنوان */}
      <div className="space-y-2">
        <Skeleton variant="text" className="w-1/3 h-8" />
        <Skeleton variant="text" className="w-1/2" />
      </div>
      
      {/* الإحصائيات */}
      <StatsSkeleton cards={4} />
      
      {/* المحتوى */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TableSkeleton rows={8} columns={5} />
        </div>
        <div>
          <CardSkeleton showAvatar showActions />
        </div>
      </div>
    </div>
  )
}
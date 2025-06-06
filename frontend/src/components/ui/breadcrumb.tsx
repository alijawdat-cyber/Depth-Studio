'use client'

import React from 'react'
import Link from 'next/link'
import clsx from 'clsx'
import { FaHome, FaChevronLeft } from 'react-icons/fa'

export interface BreadcrumbItem {
  label: string
  href?: string
  icon?: React.ReactNode
  active?: boolean
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  separator?: React.ReactNode
  showHome?: boolean
  className?: string
}

export function Breadcrumb({ 
  items, 
  separator = <FaChevronLeft className="w-3 h-3 text-gray-400" />,
  showHome = true,
  className 
}: BreadcrumbProps) {
  // إضافة رابط الرئيسية إذا كان مطلوباً ولم يكن موجوداً
  const breadcrumbItems: BreadcrumbItem[] = showHome && items[0]?.href !== '/' 
    ? [{ label: 'الرئيسية', href: '/', icon: <FaHome className="w-4 h-4" /> }, ...items]
    : items

  return (
    <nav className={clsx('flex items-center space-x-1 space-x-reverse text-sm', className)}>
      <ol className="flex items-center space-x-1 space-x-reverse">
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1
          
          return (
            <li key={index} className="flex items-center">
              {/* العنصر */}
              <div className="flex items-center">
                {item.href && !item.active && !isLast ? (
                  <Link
                    href={item.href}
                    className="flex items-center space-x-1 space-x-reverse text-gray-600 hover:text-primary-600 transition-colors"
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                ) : (
                  <span 
                    className={clsx(
                      'flex items-center space-x-1 space-x-reverse',
                      isLast || item.active 
                        ? 'text-gray-900 font-medium' 
                        : 'text-gray-600'
                    )}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </span>
                )}
              </div>
              
              {/* الفاصل */}
              {!isLast && (
                <span className="mx-2 select-none">
                  {separator}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

// مكون مخصص للاستخدام مع usePathname
interface AutoBreadcrumbProps {
  pathMapping?: Record<string, string>
  homeLabel?: string
  separator?: React.ReactNode
  className?: string
}

export function AutoBreadcrumb({ 
  pathMapping = {},
  homeLabel = 'الرئيسية',
  separator,
  className 
}: AutoBreadcrumbProps) {
  // هذا يحتاج usePathname من next/navigation
  // سنضع مثال ثابت للآن
  const pathname = '/dashboard/users/add' // مثال
  
  const generateBreadcrumbs = () => {
    const paths = pathname.split('/').filter(Boolean)
    const items: BreadcrumbItem[] = []
    
    let currentPath = ''
    
    paths.forEach((path, index) => {
      currentPath += `/${path}`
      const isLast = index === paths.length - 1
      
      // البحث عن تسمية مخصصة
      const label = pathMapping[currentPath] || 
                   pathMapping[path] || 
                   path.charAt(0).toUpperCase() + path.slice(1)
      
      items.push({
        label,
        href: isLast ? undefined : currentPath,
        active: isLast
      })
    })
    
    return items
  }

  return (
    <Breadcrumb 
      items={generateBreadcrumbs()}
      separator={separator}
      showHome={homeLabel !== undefined}
      className={className}
    />
  )
}

// مكونات إضافية للاستخدامات المختلفة
export function SimpleBreadcrumb({ 
  currentPage, 
  parentPage,
  parentHref,
  className 
}: {
  currentPage: string
  parentPage?: string
  parentHref?: string
  className?: string
}) {
  const items: BreadcrumbItem[] = []
  
  if (parentPage && parentHref) {
    items.push({ label: parentPage, href: parentHref })
  }
  
  items.push({ label: currentPage, active: true })
  
  return (
    <Breadcrumb 
      items={items}
      className={className}
    />
  )
}

// مكون للصفحات العميقة
export function DeepBreadcrumb({
  hierarchy,
  className
}: {
  hierarchy: Array<{ label: string; href?: string }>
  className?: string
}) {
  const items: BreadcrumbItem[] = hierarchy.map((item, index) => ({
    label: item.label,
    href: index === hierarchy.length - 1 ? undefined : item.href,
    active: index === hierarchy.length - 1
  }))
  
  return (
    <Breadcrumb 
      items={items}
      className={className}
    />
  )
}
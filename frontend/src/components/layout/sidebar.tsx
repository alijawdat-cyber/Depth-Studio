'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  FaHome, 
  FaUsers, 
  FaChartBar, 
  FaCog, 
  FaFileAlt, 
  FaShoppingCart,
  FaChevronDown,
  FaChevronRight 
} from 'react-icons/fa'
import clsx from 'clsx'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

interface MenuItem {
  label: string
  href?: string
  icon: React.ReactNode
  children?: MenuItem[]
}

const menuItems: MenuItem[] = [
  {
    label: 'الرئيسية',
    href: '/dashboard',
    icon: <FaHome className="w-5 h-5" />
  },
  {
    label: 'المستخدمون',
    icon: <FaUsers className="w-5 h-5" />,
    children: [
      { label: 'جميع المستخدمين', href: '/admin/users', icon: <></> },
      { label: 'إضافة مستخدم', href: '/admin/users/new', icon: <></> }
    ]
  },
  {
    label: 'التقارير',
    icon: <FaChartBar className="w-5 h-5" />,
    children: [
      { label: 'تقارير المبيعات', href: '/admin/reports/financial', icon: <></> },
      { label: 'تقارير الأداء', href: '/admin/reports/projects', icon: <></> }
    ]
  },
  {
    label: 'المنتجات',
          href: '/admin/brands',
    icon: <FaShoppingCart className="w-5 h-5" />
  },
  {
    label: 'الملفات',
          href: '/admin/content',
    icon: <FaFileAlt className="w-5 h-5" />
  },
  {
    label: 'الإعدادات',
          href: '/admin/settings',
    icon: <FaCog className="w-5 h-5" />
  }
]

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const toggleExpanded = (label: string) => {
    setExpandedItems(prev => 
      prev.includes(label) 
        ? prev.filter(item => item !== label)
        : [...prev, label]
    )
  }

  const renderMenuItem = (item: MenuItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems.includes(item.label)
    const isActive = item.href === pathname

    if (hasChildren) {
      return (
        <div key={item.label}>
          <button
            onClick={() => toggleExpanded(item.label)}
            className={clsx(
              'w-full flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors',
              level > 0 && 'pr-8'
            )}
          >
            <div className="flex items-center space-x-3 space-x-reverse">
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </div>
            {isExpanded ? (
              <FaChevronDown className="w-4 h-4" />
            ) : (
              <FaChevronRight className="w-4 h-4" />
            )}
          </button>
          
          {isExpanded && (
            <div className="bg-gray-50">
              {item.children?.map(child => renderMenuItem(child, level + 1))}
            </div>
          )}
        </div>
      )
    }

    return (
      <Link
        key={item.label}
        href={item.href || '#'}
        onClick={onClose}
        className={clsx(
          'flex items-center space-x-3 space-x-reverse px-4 py-3 transition-colors',
          level > 0 && 'pr-8',
          isActive 
            ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-500' 
            : 'text-gray-700 hover:bg-gray-100'
        )}
      >
        {item.icon}
        <span className="font-medium">{item.label}</span>
      </Link>
    )
  }

  return (
    <>
      {/* Overlay للموبايل */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={clsx(
        'fixed lg:static inset-y-0 right-0 z-50 w-64 bg-white border-l border-gray-200 transform transition-transform duration-300 ease-in-out lg:transform-none',
        isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
      )}>
        <div className="flex items-center justify-center h-16 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">لوحة التحكم</h1>
        </div>
        
        <nav className="mt-4">
          {menuItems.map(item => renderMenuItem(item))}
        </nav>
      </aside>
    </>
  )
}
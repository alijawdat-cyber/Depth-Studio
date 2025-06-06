'use client'

import { useState } from 'react'
import { FaBars, FaBell, FaUser, FaSearch, FaCog } from 'react-icons/fa'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface AppBarProps {
  onMenuClick: () => void
}

export function AppBar({ onMenuClick }: AppBarProps) {
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      {/* اليسار - زر القائمة والبحث */}
      <div className="flex items-center space-x-4 space-x-reverse">
        <Button
          variant="ghost"
          size="sm"
          onClick={onMenuClick}
          className="lg:hidden"
        >
          <FaBars className="w-5 h-5" />
        </Button>
        
        <div className="relative hidden md:block">
          <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="البحث..."
            className="pr-10 w-64"
          />
        </div>
      </div>

      {/* اليمين - الإشعارات والملف الشخصي */}
      <div className="flex items-center space-x-3 space-x-reverse">
        {/* أيقونة البحث للموبايل */}
        <Button variant="ghost" size="sm" className="md:hidden">
          <FaSearch className="w-5 h-5" />
        </Button>

        {/* الإشعارات */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative"
          >
            <FaBell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              3
            </span>
          </Button>
          
          {showNotifications && (
            <div className="absolute left-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">الإشعارات</h3>
              </div>
              <div className="p-2">
                <div className="p-3 hover:bg-gray-50 rounded cursor-pointer">
                  <p className="text-sm font-medium">إشعار جديد</p>
                  <p className="text-xs text-gray-500">منذ 5 دقائق</p>
                </div>
                <div className="p-3 hover:bg-gray-50 rounded cursor-pointer">
                  <p className="text-sm font-medium">تحديث هام</p>
                  <p className="text-xs text-gray-500">منذ ساعة</p>
                </div>
                <div className="p-3 hover:bg-gray-50 rounded cursor-pointer">
                  <p className="text-sm font-medium">رسالة جديدة</p>
                  <p className="text-xs text-gray-500">منذ يومين</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* الإعدادات */}
        <Button variant="ghost" size="sm">
          <FaCog className="w-5 h-5" />
        </Button>

        {/* الملف الشخصي */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center space-x-2 space-x-reverse"
          >
            <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
              <FaUser className="w-4 h-4 text-white" />
            </div>
            <span className="hidden md:block font-medium">أحمد محمد</span>
          </Button>
          
          {showProfile && (
            <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              <div className="p-2">
                <button className="w-full text-right px-3 py-2 text-sm hover:bg-gray-50 rounded">
                  الملف الشخصي
                </button>
                <button className="w-full text-right px-3 py-2 text-sm hover:bg-gray-50 rounded">
                  الإعدادات
                </button>
                <hr className="my-1" />
                <button className="w-full text-right px-3 py-2 text-sm hover:bg-gray-50 rounded text-red-600">
                  تسجيل الخروج
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
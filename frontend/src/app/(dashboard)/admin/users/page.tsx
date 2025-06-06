'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { FaPlus, FaSearch, FaEdit, FaTrash, FaEye } from 'react-icons/fa'

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState('all')

  // Mock data - في الإنتاج سيأتي من Firebase
  const users = [
    {
      id: '1',
      display_name: 'علي جواد',
      email: 'ali@depthstudio.com',
      primary_role: 'super_admin',
      is_active: true,
      phone: '+964 770 123 4567',
      created_at: '2024-01-15'
    },
    {
      id: '2', 
      display_name: 'أحمد محمد',
      email: 'ahmed@gmail.com',
      primary_role: 'photographer',
      is_active: true,
      phone: '+964 771 234 5678',
      created_at: '2024-02-20'
    },
    {
      id: '3',
      display_name: 'فاطمة علي', 
      email: 'fatima@gmail.com',
      primary_role: 'brand_coordinator',
      is_active: false,
      phone: '+964 772 345 6789',
      created_at: '2024-03-10'
    },
    {
      id: '4',
      display_name: 'سارة حسن',
      email: 'sara@gmail.com', 
      primary_role: 'marketing_coordinator',
      is_active: true,
      phone: '+964 773 456 7890',
      created_at: '2024-03-15'
    }
  ]

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.display_name.includes(searchTerm) || user.email.includes(searchTerm)
    const matchesRole = selectedRole === 'all' || user.primary_role === selectedRole
    return matchesSearch && matchesRole
  })

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'super_admin': return 'مدير عام'
      case 'photographer': return 'مصور'
      case 'brand_coordinator': return 'منسق براند'
      case 'marketing_coordinator': return 'منسق تسويق'
      default: return 'غير محدد'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">إدارة المستخدمين</h1>
                    <Link href="/admin/users/new">
          <Button className="flex items-center gap-2">
            <FaPlus />
            إضافة مستخدم جديد
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              البحث
            </label>
            <div className="relative">
              <Input
                type="text"
                placeholder="ابحث بالاسم أو البريد الإلكتروني..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الدور
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
            >
              <option value="all">جميع الأدوار</option>
              <option value="super_admin">مدير عام</option>
              <option value="photographer">مصور</option>
              <option value="brand_coordinator">منسق براند</option>
              <option value="marketing_coordinator">منسق تسويق</option>
            </select>
          </div>

          <div className="flex items-end">
            <Button variant="outline" className="w-full">
              تصفية متقدمة
            </Button>
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">المستخدم</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">الدور</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">الحالة</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">تاريخ التسجيل</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div>
                      <div className="font-medium text-gray-900">{user.display_name}</div>
                      <div className="text-sm text-gray-600">{user.email}</div>
                      <div className="text-sm text-gray-500">{user.phone}</div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {getRoleLabel(user.primary_role)}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.is_active ? 'نشط' : 'معطل'}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600">
                    {new Date(user.created_at).toLocaleDateString('ar-EG')}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-center gap-2">
                      <Link href={`/admin/users/${user.id}`}>
                        <Button variant="outline" size="sm">
                          <FaEye />
                        </Button>
                      </Link>
                      <Button variant="outline" size="sm">
                        <FaEdit />
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        <FaTrash />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-500 mb-2">لا توجد نتائج</div>
            <div className="text-sm text-gray-400">جرب تغيير معايير البحث</div>
          </div>
        )}
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{users.length}</div>
          <div className="text-sm text-gray-600">إجمالي المستخدمين</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {users.filter(u => u.is_active).length}
          </div>
          <div className="text-sm text-gray-600">نشط</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-red-600">
            {users.filter(u => !u.is_active).length}
          </div>
          <div className="text-sm text-gray-600">معطل</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {users.filter(u => u.primary_role === 'photographer').length}
          </div>
          <div className="text-sm text-gray-600">مصور</div>
        </Card>
      </div>
    </div>
  )
} 
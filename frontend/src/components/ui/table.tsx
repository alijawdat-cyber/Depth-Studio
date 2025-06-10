'use client'

import React, { useState, useMemo } from 'react'
import clsx from 'clsx'
import { FaSort, FaSortUp, FaSortDown, FaSearch, FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import { Input } from './input'
import { Button } from './button'

export interface TableColumn<T extends Record<string, unknown> = Record<string, unknown>> {
  key: keyof T
  title: string
  // فدالة render: جميع الباراميترات مستخدمة في callback functions من قبل المطورين
  // eslint-disable-next-line no-unused-vars
  render?: (value: T[keyof T], row: T, index: number) => React.ReactNode
  sortable?: boolean
  searchable?: boolean
  width?: string | number
  align?: 'right' | 'left' | 'center'
  className?: string
}

export interface TableProps<T extends Record<string, unknown> = Record<string, unknown>> {
  data: T[]
  columns: TableColumn<T>[]
  loading?: boolean
  pagination?: {
    page: number
    pageSize: number
    total: number
    // فدوال pagination: جميع الباراميترات مستخدمة في event handlers
    // eslint-disable-next-line no-unused-vars
    onPageChange: (page: number) => void
    // eslint-disable-next-line no-unused-vars
    onPageSizeChange: (pageSize: number) => void
  }
  searchable?: boolean
  sortable?: boolean
  selectable?: boolean
  selectedRows?: string[]
  // فدالة onSelectionChange: الباراميتر selectedIds مستخدم في selection callback
  // eslint-disable-next-line no-unused-vars
  onSelectionChange?: (selectedIds: string[]) => void
  rowKey?: keyof T
  // فدوال callback: جميع الباراميترات مستخدمة في event handlers
  // eslint-disable-next-line no-unused-vars
  onRowClick?: (row: T, index: number) => void
  emptyMessage?: string
  className?: string
  // eslint-disable-next-line no-unused-vars
  rowClassName?: (row: T, index: number) => string
}

export function Table<T extends Record<string, unknown>>({
  data,
  columns,
  loading = false,
  pagination,
  searchable = false,
  sortable = true,
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  rowKey = 'id' as keyof T,
  onRowClick,
  emptyMessage = 'لا توجد بيانات',
  className,
  rowClassName
}: TableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T
    direction: 'asc' | 'desc'
  } | null>(null)

  // فلترة البيانات حسب البحث
  const filteredData = useMemo(() => {
    if (!searchable || !searchTerm) return data

    return data.filter(row => {
      return columns.some(column => {
        if (column.searchable === false) return false
        
        const value = row[column.key]
        if (value == null) return false
        
        return String(value).toLowerCase().includes(searchTerm.toLowerCase())
      })
    })
  }, [data, searchTerm, columns, searchable])

  // ترتيب البيانات
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData

    const sorted = [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key]
      const bValue = b[sortConfig.key]

      if (aValue == null && bValue == null) return 0
      if (aValue == null) return 1
      if (bValue == null) return -1

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc' 
          ? aValue.localeCompare(bValue, 'ar')
          : bValue.localeCompare(aValue, 'ar')
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' 
          ? aValue - bValue 
          : bValue - aValue
      }

      const aStr = String(aValue)
      const bStr = String(bValue)
      return sortConfig.direction === 'asc' 
        ? aStr.localeCompare(bStr, 'ar')
        : bStr.localeCompare(aStr, 'ar')
    })

    return sorted
  }, [filteredData, sortConfig])

  const handleSort = (columnKey: keyof T) => {
    if (!sortable) return
    
    const column = columns.find(col => col.key === columnKey)
    if (column?.sortable === false) return

    setSortConfig(current => {
      if (!current || current.key !== columnKey) {
        return { key: columnKey, direction: 'asc' }
      }
      if (current.direction === 'asc') {
        return { key: columnKey, direction: 'desc' }
      }
      return null
    })
  }

  const handleSelectAll = () => {
    if (!onSelectionChange) return
    
    const allIds = sortedData.map(row => String(row[rowKey]))
    const isAllSelected = allIds.every(id => selectedRows.includes(id))
    
    if (isAllSelected) {
      onSelectionChange(selectedRows.filter(id => !allIds.includes(id)))
    } else {
      const uniqueIds = Array.from(new Set([...selectedRows, ...allIds]))
      onSelectionChange(uniqueIds)
    }
  }

  const handleRowSelect = (rowId: string) => {
    if (!onSelectionChange) return
    
    if (selectedRows.includes(rowId)) {
      onSelectionChange(selectedRows.filter(id => id !== rowId))
    } else {
      onSelectionChange([...selectedRows, rowId])
    }
  }

  const getSortIcon = (columnKey: keyof T) => {
    if (!sortConfig || sortConfig.key !== columnKey) {
      return <FaSort className="w-3 h-3 text-gray-400" />
    }
    
    return sortConfig.direction === 'asc' 
      ? <FaSortUp className="w-3 h-3 text-primary-600" />
      : <FaSortDown className="w-3 h-3 text-primary-600" />
  }

  const isAllSelected = sortedData.length > 0 && 
    sortedData.every(row => selectedRows.includes(String(row[rowKey])))
  
  const isSomeSelected = sortedData.some(row => selectedRows.includes(String(row[rowKey])))

  return (
    <div className={clsx('w-full', className)}>
      {/* شريط البحث */}
      {searchable && (
        <div className="mb-4 flex items-center">
          <div className="relative max-w-sm">
            <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="البحث في الجدول..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>
        </div>
      )}

      {/* الجدول */}
      <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {selectable && (
                <th className="w-12 px-4 py-3 text-right">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isSomeSelected && !isAllSelected
                    }}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                </th>
              )}
              
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={clsx(
                    'px-4 py-3 text-sm font-medium text-gray-700',
                    column.align === 'center' && 'text-center',
                    column.align === 'left' && 'text-left',
                    column.align !== 'center' && column.align !== 'left' && 'text-right',
                    (sortable && column.sortable !== false) && 'cursor-pointer hover:bg-gray-100',
                    column.className
                  )}
                  style={{ width: column.width }}
                  onClick={() => handleSort(column.key)}
                >
                  <div className="flex items-center justify-between">
                    <span>{column.title}</span>
                    {(sortable && column.sortable !== false) && getSortIcon(column.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              // سكيليتون لودينغ
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={index}>
                  {selectable && (
                    <td className="px-4 py-3">
                      <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td key={String(column.key)} className="px-4 py-3">
                      <div className="h-4 bg-gray-200 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : sortedData.length === 0 ? (
              <tr>
                <td 
                  colSpan={columns.length + (selectable ? 1 : 0)} 
                  className="px-4 py-8 text-center text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              sortedData.map((row, index) => {
                const rowId = String(row[rowKey])
                return (
                  <tr
                    key={rowId || index}
                    className={clsx(
                      'hover:bg-gray-50 transition-colors',
                      onRowClick && 'cursor-pointer',
                      selectedRows.includes(rowId) && 'bg-primary-50',
                      rowClassName?.(row, index)
                    )}
                    onClick={() => onRowClick?.(row, index)}
                  >
                    {selectable && (
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(rowId)}
                          onChange={() => handleRowSelect(rowId)}
                          onClick={(e) => e.stopPropagation()}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                      </td>
                    )}
                    
                    {columns.map((column) => (
                      <td
                        key={String(column.key)}
                        className={clsx(
                          'px-4 py-3 text-sm text-gray-900',
                          column.align === 'center' && 'text-center',
                          column.align === 'left' && 'text-left',
                          column.align !== 'center' && column.align !== 'left' && 'text-right',
                          column.className
                        )}
                      >
                        {column.render 
                          ? column.render(row[column.key], row, index)
                          : String(row[column.key] ?? '')
                        }
                      </td>
                    ))}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* الترقيم */}
      {pagination && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            عرض {((pagination.page - 1) * pagination.pageSize) + 1} إلى{' '}
            {Math.min(pagination.page * pagination.pageSize, pagination.total)} من{' '}
            {pagination.total} نتيجة
          </div>
          
          <div className="flex items-center space-x-2 space-x-reverse">
            {/* تغيير عدد العناصر */}
            <div className="flex items-center space-x-2 space-x-reverse">
              <span className="text-sm text-gray-700">عدد العناصر:</span>
              <select
                value={pagination.pageSize}
                onChange={(e) => pagination.onPageSizeChange(Number(e.target.value))}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
            
            {/* أزرار التنقل */}
            <div className="flex items-center space-x-1 space-x-reverse">
              <Button
                variant="outline"
                size="sm"
                onClick={() => pagination.onPageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
              >
                <FaChevronRight className="w-4 h-4" />
              </Button>
              
              <span className="px-3 py-1 text-sm">
                صفحة {pagination.page} من {Math.ceil(pagination.total / pagination.pageSize)}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => pagination.onPageChange(pagination.page + 1)}
                disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)}
              >
                <FaChevronLeft className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
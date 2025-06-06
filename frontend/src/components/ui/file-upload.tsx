'use client'

import React, { useState, useRef, useCallback } from 'react'
import clsx from 'clsx'
import { FaCloudUploadAlt, FaImage, FaFilePdf, FaFileWord, FaFileExcel, FaFile, FaTimes, FaEye } from 'react-icons/fa'

export interface UploadedFile {
  id: string
  file: File
  preview?: string
  progress?: number
  error?: string
}

interface FileUploadProps {
  accept?: string
  multiple?: boolean
  maxSize?: number // بالميجابايت
  maxFiles?: number
  onFilesChange: (files: UploadedFile[]) => void
  disabled?: boolean
  error?: string
  className?: string
  variant?: 'default' | 'compact' | 'avatar'
}

const getFileIcon = (fileType: string) => {
  if (fileType.startsWith('image/')) return FaImage
  if (fileType === 'application/pdf') return FaFilePdf
  if (fileType.includes('word')) return FaFileWord
  if (fileType.includes('excel') || fileType.includes('spreadsheet')) return FaFileExcel
  return FaFile
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 بايت'
  const k = 1024
  const sizes = ['بايت', 'كيلوبايت', 'ميجابايت', 'جيجابايت']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function FileUpload({
  accept = '*',
  multiple = false,
  maxSize = 10, // 10MB افتراضي
  maxFiles = 5,
  onFilesChange,
  disabled = false,
  error,
  className,
  variant = 'default'
}: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFiles = useCallback((fileList: FileList) => {
    const newFiles: UploadedFile[] = []
    
    Array.from(fileList).forEach((file, index) => {
      // التحقق من حجم الملف
      if (file.size > maxSize * 1024 * 1024) {
        newFiles.push({
          id: `${Date.now()}-${index}`,
          file,
          error: `حجم الملف يجب أن يكون أقل من ${maxSize} ميجابايت`
        })
        return
      }

      // التحقق من عدد الملفات
      if (!multiple && uploadedFiles.length > 0) {
        return
      }

      if (uploadedFiles.length + newFiles.length >= maxFiles) {
        return
      }

      const uploadedFile: UploadedFile = {
        id: `${Date.now()}-${index}`,
        file,
        progress: 0
      }

      // إنشاء معاينة للصور
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          uploadedFile.preview = e.target?.result as string
          setUploadedFiles(prev => 
            prev.map(f => f.id === uploadedFile.id ? { ...f, preview: uploadedFile.preview } : f)
          )
        }
        reader.readAsDataURL(file)
      }

      newFiles.push(uploadedFile)

      // محاكاة رفع الملف
      simulateUpload(uploadedFile)
    })

    const updatedFiles = multiple 
      ? [...uploadedFiles, ...newFiles]
      : newFiles

    setUploadedFiles(updatedFiles)
    onFilesChange(updatedFiles)
  }, [maxSize, maxFiles, multiple, uploadedFiles, onFilesChange])

  const simulateUpload = (file: UploadedFile) => {
    const interval = setInterval(() => {
      setUploadedFiles(prev => 
        prev.map(f => {
          if (f.id === file.id && f.progress !== undefined && f.progress < 100) {
            const newProgress = f.progress + Math.random() * 30
            return { ...f, progress: Math.min(newProgress, 100) }
          }
          return f
        })
      )
    }, 200)

    setTimeout(() => {
      clearInterval(interval)
      setUploadedFiles(prev => 
        prev.map(f => f.id === file.id ? { ...f, progress: 100 } : f)
      )
    }, 2000)
  }

  const removeFile = (fileId: string) => {
    const updatedFiles = uploadedFiles.filter(f => f.id !== fileId)
    setUploadedFiles(updatedFiles)
    onFilesChange(updatedFiles)
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }, [])

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (disabled) return
    
    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      handleFiles(files)
    }
  }, [disabled, handleFiles])

  const openFileDialog = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  if (variant === 'avatar') {
    return (
      <div className={clsx('relative', className)}>
        <div
          onClick={openFileDialog}
          className={clsx(
            'w-24 h-24 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer transition-colors',
            dragActive && 'border-primary-500 bg-primary-50',
            disabled && 'cursor-not-allowed opacity-50',
            !disabled && 'hover:border-primary-400 hover:bg-gray-50'
          )}
          onDragEnter={handleDragIn}
          onDragLeave={handleDragOut}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {uploadedFiles.length > 0 && uploadedFiles[0].preview ? (
            <img 
              src={uploadedFiles[0].preview} 
              alt="Avatar" 
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <FaImage className="w-8 h-8 text-gray-400" />
          )}
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          className="hidden"
          disabled={disabled}
        />
        
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div className={clsx('w-full', className)}>
        <button
          type="button"
          onClick={openFileDialog}
          disabled={disabled}
          className={clsx(
            'w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors',
            disabled && 'cursor-not-allowed opacity-50'
          )}
        >
          <FaCloudUploadAlt className="inline w-4 h-4 ml-2" />
          اختر ملف
        </button>
        
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          className="hidden"
          disabled={disabled}
        />
        
        {uploadedFiles.length > 0 && (
          <div className="mt-2 text-sm text-gray-600">
            {uploadedFiles.map(file => (
              <div key={file.id} className="flex items-center justify-between">
                <span>{file.file.name}</span>
                <button
                  onClick={() => removeFile(file.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <FaTimes className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    )
  }

  return (
    <div className={clsx('w-full', className)}>
      {/* منطقة الرفع */}
      <div
        className={clsx(
          'border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer',
          dragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300',
          disabled && 'cursor-not-allowed opacity-50',
          !disabled && 'hover:border-primary-400 hover:bg-gray-50',
          error && 'border-red-300'
        )}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <FaCloudUploadAlt className="mx-auto w-12 h-12 text-gray-400 mb-4" />
        <p className="text-lg font-medium text-gray-700 mb-2">
          اسحب الملفات هنا أو انقر للاختيار
        </p>
        <p className="text-sm text-gray-500">
          الحد الأقصى: {formatFileSize(maxSize * 1024 * 1024)} لكل ملف
        </p>
        {multiple && (
          <p className="text-sm text-gray-500">
            يمكنك رفع حتى {maxFiles} ملفات
          </p>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
        className="hidden"
        disabled={disabled}
      />

      {/* قائمة الملفات المرفوعة */}
      {uploadedFiles.length > 0 && (
        <div className="mt-4 space-y-3">
          {uploadedFiles.map((file) => {
            const FileIcon = getFileIcon(file.file.type)
            
            return (
              <div key={file.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  {file.preview ? (
                    <img 
                      src={file.preview} 
                      alt={file.file.name}
                      className="w-12 h-12 rounded object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                      <FileIcon className="w-6 h-6 text-gray-500" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 mr-3 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.file.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatFileSize(file.file.size)}
                  </p>
                  
                  {file.error ? (
                    <p className="text-sm text-red-600">{file.error}</p>
                  ) : file.progress !== undefined && file.progress < 100 ? (
                    <div className="mt-1">
                      <div className="bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary-600 h-2 rounded-full transition-all"
                          style={{ width: `${file.progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {Math.round(file.progress)}%
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-green-600">تم الرفع بنجاح</p>
                  )}
                </div>
                
                <div className="flex space-x-2 space-x-reverse">
                  {file.preview && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        window.open(file.preview, '_blank')
                      }}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <FaEye className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeFile(file.id)
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaTimes className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
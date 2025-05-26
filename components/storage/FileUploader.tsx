'use client'

import React, { useState, useRef } from 'react'
import { storageAPI } from '@/lib/storage-api'
import { MediaUploadResult } from '@/service/media-service'

interface FileUploaderProps {
  onUploadSuccess?: (result: MediaUploadResult) => void
  onUploadError?: (error: string) => void
  accept?: string
  multiple?: boolean
  bucket?: string
  className?: string
}

export function FileUploader({
  onUploadSuccess,
  onUploadError,
  accept = "image/*,video/*,audio/*",
  multiple = false,
  bucket = 'media',
  className = ''
}: FileUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    setUploading(true)
    const fileArray = Array.from(files)

    try {
      for (const file of fileArray) {
        // 验证文件
        const validation = storageAPI.validateFile(file)
        if (!validation.isValid) {
          onUploadError?.(validation.error || '文件验证失败')
          continue
        }

        // 上传文件
        const result = await storageAPI.uploadFile(file, bucket)
        onUploadSuccess?.(result)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '上传失败'
      onUploadError?.(errorMessage)
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={`file-uploader ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />
      
      <div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-all duration-200 ease-in-out
          ${dragOver 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }
          ${uploading ? 'pointer-events-none opacity-50' : ''}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={openFileDialog}
      >
        {uploading ? (
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="text-gray-600 dark:text-gray-400">正在上传...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-4">
            <svg
              className="w-16 h-16 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <div>
              <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                {dragOver ? '释放文件进行上传' : '拖拽文件到此处或点击上传'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                支持图片、视频、音频文件
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                图片最大10MB，视频最大100MB，音频最大50MB
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 
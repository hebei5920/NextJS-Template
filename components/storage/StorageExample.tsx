'use client'

import React, { useState } from 'react'
import { FileUploader } from './FileUploader'
import { MediaGallery } from './MediaGallery'
import { MediaUploadResult, MediaFileInfo } from '@/service/media-service'

interface StorageExampleProps {
  className?: string
  showGallery?: boolean
  bucket?: string
}

export function StorageExample({ 
  className = '',
  showGallery = true,
  bucket = 'media'
}: StorageExampleProps) {
  const [uploadedFiles, setUploadedFiles] = useState<MediaUploadResult[]>([])
  const [selectedFile, setSelectedFile] = useState<MediaFileInfo | null>(null)

  const handleUploadSuccess = (result: MediaUploadResult) => {
    setUploadedFiles(prev => [...prev, result])
  }

  const handleUploadError = (error: string) => {
    console.error('Upload error:', error)
  }

  const handleFileSelect = (file: MediaFileInfo) => {
    setSelectedFile(file)
  }

  const handleFileDelete = (path: string) => {
    setUploadedFiles(prev => prev.filter(f => f.path !== path))
  }

  return (
    <div className={`storage-example ${className}`}>
      {/* 上传区域 */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">文件上传</h3>
        <FileUploader
          onUploadSuccess={handleUploadSuccess}
          onUploadError={handleUploadError}
          multiple={true}
          bucket={bucket}
        />
      </div>

      {/* 最近上传的文件 */}
      {uploadedFiles.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">最近上传</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {uploadedFiles.slice(0, 4).map((file, index) => (
              <div
                key={index}
                className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">
                      {file.path.split('/').pop()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {file.mimetype} • {(file.size / 1024).toFixed(1)}KB
                    </p>
                  </div>
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    查看
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 文件管理画廊 */}
      {showGallery && (
        <div>
          <h3 className="text-lg font-semibold mb-4">文件管理</h3>
          <MediaGallery
            bucket={bucket}
            onFileSelect={handleFileSelect}
            onFileDelete={handleFileDelete}
          />
        </div>
      )}

      {/* 选中文件信息 */}
      {selectedFile && (
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 className="font-semibold mb-2">选中文件</h4>
          <p className="text-sm">
            <strong>文件名:</strong> {selectedFile.path.split('/').pop()}
          </p>
          <p className="text-sm">
            <strong>类型:</strong> {selectedFile.type}
          </p>
          <p className="text-sm">
            <strong>大小:</strong> {(selectedFile.size / 1024).toFixed(1)}KB
          </p>
          <p className="text-sm">
            <strong>上传时间:</strong> {new Date(selectedFile.createdAt).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  )
} 
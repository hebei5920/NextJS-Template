'use client'

import React, { useState } from 'react'
import { FileUploader } from '@/components/storage/FileUploader'
import { MediaGallery } from '@/components/storage/MediaGallery'
import { MediaUploadResult, MediaFileInfo } from '@/service/media-service'

interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'info'
  message: string
}

export default function StorageTestPage() {
  const [uploadResults, setUploadResults] = useState<MediaUploadResult[]>([])
  const [selectedFile, setSelectedFile] = useState<MediaFileInfo | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Date.now().toString()
    const toast: ToastMessage = { id, type, message }
    setToasts(prev => [...prev, toast])
    
    // 3秒后自动移除
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3000)
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  const handleUploadSuccess = (result: MediaUploadResult) => {
    console.log('上传成功:', result)
    setUploadResults(prev => [...prev, result])
    
    const fileName = result.path.split('/').pop()
    showToast('success', `文件上传成功: ${fileName}`)
  }

  const handleUploadError = (error: string) => {
    console.error('上传失败:', error)
    showToast('error', `上传失败: ${error}`)
  }

  const handleFileSelect = (file: MediaFileInfo) => {
    setSelectedFile(file)
    setShowPreview(true)
  }

  const handleFileDelete = (path: string) => {
    console.log('文件已删除:', path)
    setUploadResults(prev => prev.filter(r => r.path !== path))
    const fileName = path.split('/').pop()
    showToast('info', `文件已删除: ${fileName}`)
  }

  const renderToasts = () => {
    if (toasts.length === 0) return null

    return (
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              px-4 py-3 rounded-lg shadow-lg max-w-sm
              ${toast.type === 'success' ? 'bg-green-500 text-white' : ''}
              ${toast.type === 'error' ? 'bg-red-500 text-white' : ''}
              ${toast.type === 'info' ? 'bg-blue-500 text-white' : ''}
              transition-all duration-300 ease-in-out
            `}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                className="ml-3 text-white hover:text-gray-200"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const renderPreview = () => {
    if (!selectedFile) return null

    const { type, url, path } = selectedFile

    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl max-h-[90vh] overflow-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">文件预览</h3>
            <button
              onClick={() => setShowPreview(false)}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>路径:</strong> {path}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>类型:</strong> {type}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>大小:</strong> {(selectedFile.size / 1024).toFixed(1)}KB
            </p>
          </div>

          <div className="max-w-full">
            {type === 'image' && (
              <img
                src={url}
                alt={path}
                className="max-w-full max-h-96 object-contain mx-auto"
              />
            )}
            
            {type === 'video' && (
              <video
                src={url}
                controls
                className="max-w-full max-h-96 mx-auto"
              />
            )}
            
            {type === 'audio' && (
              <div className="text-center">
                <audio
                  src={url}
                  controls
                  className="mx-auto"
                />
                <p className="mt-4 text-gray-600 dark:text-gray-400">
                  音频文件: {path.split('/').pop()}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Supabase Storage 测试页面</h1>

        {/* 功能说明 */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">功能特性</h2>
          <ul className="list-disc list-inside space-y-2 text-sm">
            <li>支持图片、视频、音频文件上传 (拖拽或点击选择)</li>
            <li>文件类型和大小验证 (图片10MB, 视频100MB, 音频50MB)</li>
            <li>自动生成唯一文件名和路径结构</li>
            <li>文件预览功能 (图片/视频/音频)</li>
            <li>文件下载功能</li>
            <li>单个和批量删除功能</li>
            <li>文件类型过滤和搜索</li>
            <li>用户权限控制 (只能管理自己的文件)</li>
          </ul>
        </div>

        {/* 上传区域 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">文件上传</h2>
          <FileUploader
            onUploadSuccess={handleUploadSuccess}
            onUploadError={handleUploadError}
            multiple={true}
          />
        </div>

        {/* 最近上传的文件 */}
        {uploadResults.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">最近上传</h2>
            <div className="space-y-2">
              {uploadResults.map((result, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md"
                >
                  <div>
                    <p className="font-medium text-green-800 dark:text-green-200">
                      {result.path.split('/').pop()}
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      {result.mimetype} | {(result.size / 1024).toFixed(1)}KB
                    </p>
                  </div>
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 text-sm"
                  >
                    查看文件
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 文件管理 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">文件管理</h2>
          <MediaGallery
            onFileSelect={handleFileSelect}
            onFileDelete={handleFileDelete}
          />
        </div>

        {/* 文件预览模态框 */}
        {showPreview && renderPreview()}

        {/* Toast 通知 */}
        {renderToasts()}
      </div>
    </div>
  )
} 
'use client'

import React, { useState, useEffect } from 'react'
import { storageAPI } from '@/lib/storage-api'
import { MediaFileInfo } from '@/service/media-service'

interface MediaGalleryProps {
  bucket?: string
  onFileSelect?: (file: MediaFileInfo) => void
  onFileDelete?: (path: string) => void
  className?: string
}

export function MediaGallery({
  bucket = 'media',
  onFileSelect,
  onFileDelete,
  className = ''
}: MediaGalleryProps) {
  const [files, setFiles] = useState<MediaFileInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set())
  const [filter, setFilter] = useState<'all' | 'image' | 'video' | 'audio'>('all')

  useEffect(() => {
    loadFiles()
  }, [bucket])

  const loadFiles = async () => {
    try {
      setLoading(true)
      const mediaFiles = await storageAPI.getUserMediaFiles(bucket)
      setFiles(mediaFiles)
    } catch (error) {
      console.error('加载文件失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (path: string) => {
    if (!confirm('确定要删除这个文件吗？')) return

    try {
      await storageAPI.deleteFile(path, bucket)
      setFiles(prev => prev.filter(f => f.path !== path))
      onFileDelete?.(path)
    } catch (error) {
      console.error('删除文件失败:', error)
      alert('删除失败')
    }
  }

  const handleBatchDelete = async () => {
    if (selectedFiles.size === 0) return
    if (!confirm(`确定要删除 ${selectedFiles.size} 个文件吗？`)) return

    try {
      const paths = Array.from(selectedFiles)
      await storageAPI.deleteFiles(paths, bucket)
      setFiles(prev => prev.filter(f => !selectedFiles.has(f.path)))
      setSelectedFiles(new Set())
    } catch (error) {
      console.error('批量删除失败:', error)
      alert('批量删除失败')
    }
  }

  const handleDownload = async (file: MediaFileInfo) => {
    try {
      await storageAPI.downloadFileToLocal(file.path, file.path.split('/').pop(), bucket)
    } catch (error) {
      console.error('下载失败:', error)
      alert('下载失败')
    }
  }

  const toggleFileSelection = (path: string) => {
    const newSelection = new Set(selectedFiles)
    if (newSelection.has(path)) {
      newSelection.delete(path)
    } else {
      newSelection.add(path)
    }
    setSelectedFiles(newSelection)
  }

  const filteredFiles = files.filter(file => {
    if (filter === 'all') return true
    return file.type === filter
  })

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return '🖼️'
      case 'video':
        return '🎥'
      case 'audio':
        return '🎵'
      default:
        return '📄'
    }
  }

  const renderFilePreview = (file: MediaFileInfo) => {
    if (file.type === 'image') {
      return (
        <img
          src={file.url}
          alt={file.path}
          className="w-full h-32 object-cover rounded-t-lg"
          loading="lazy"
        />
      )
    } else if (file.type === 'video') {
      return (
        <video
          src={file.url}
          className="w-full h-32 object-cover rounded-t-lg"
          controls={false}
          muted
        />
      )
    } else {
      return (
        <div className="w-full h-32 bg-gray-100 dark:bg-gray-800 rounded-t-lg flex items-center justify-center">
          <span className="text-4xl">{getFileIcon(file.type)}</span>
        </div>
      )
    }
  }

  if (loading) {
    return (
      <div className={`media-gallery ${className}`}>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    )
  }

  return (
    <div className={`media-gallery ${className}`}>
      {/* 工具栏 */}
      <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold">我的文件 ({filteredFiles.length})</h3>
          
          {/* 文件类型过滤 */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
          >
            <option value="all">全部</option>
            <option value="image">图片</option>
            <option value="video">视频</option>
            <option value="audio">音频</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          {selectedFiles.size > 0 && (
            <button
              onClick={handleBatchDelete}
              className="px-3 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              删除选中 ({selectedFiles.size})
            </button>
          )}
          
          <button
            onClick={loadFiles}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            刷新
          </button>
        </div>
      </div>

      {/* 文件网格 */}
      {filteredFiles.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">暂无文件</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredFiles.map((file) => (
            <div
              key={file.id}
              className={`
                bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border-2 transition-all
                ${selectedFiles.has(file.path) 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                  : 'border-transparent hover:shadow-lg'
                }
              `}
            >
              {/* 文件预览 */}
              <div 
                className="cursor-pointer relative"
                onClick={() => onFileSelect?.(file)}
              >
                {renderFilePreview(file)}
                
                {/* 选择复选框 */}
                <div 
                  className="absolute top-2 left-2"
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleFileSelection(file.path)
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedFiles.has(file.path)}
                    onChange={() => {}}
                    className="w-4 h-4"
                  />
                </div>

                {/* 文件类型标识 */}
                <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                  {file.type.toUpperCase()}
                </div>
              </div>

              {/* 文件信息 */}
              <div className="p-3">
                <p className="text-sm font-medium truncate" title={file.path}>
                  {file.path.split('/').pop()}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {storageAPI.formatFileSize(file.size)}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {new Date(file.createdAt).toLocaleDateString()}
                </p>

                {/* 操作按钮 */}
                <div className="flex items-center justify-between mt-3">
                  <button
                    onClick={() => handleDownload(file)}
                    className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                  >
                    下载
                  </button>
                  
                  <button
                    onClick={() => onFileSelect?.(file)}
                    className="text-xs text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200"
                  >
                    预览
                  </button>
                  
                  <button
                    onClick={() => handleDelete(file.path)}
                    className="text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
                  >
                    删除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 
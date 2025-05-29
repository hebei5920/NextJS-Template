'use client'

import { useState } from 'react'
import { useAuth } from './useAuth'
import { 
  supabaseStorage, 
  createServerStorage,
  SUPPORTED_IMAGE_TYPES,
  SUPPORTED_AUDIO_TYPES,
  SUPPORTED_VIDEO_TYPES,
  FILE_SIZE_LIMITS,
  type FileObject,
  type StorageResponse
} from '@/db/storage'

export interface MediaFileInfo {
  id: string
  path: string
  url: string
  size: number
  mimetype: string
  type: 'image' | 'video' | 'audio' | 'unknown'
  createdAt: string
  thumbnailUrl?: string
}

export interface MediaUploadResult {
  url: string
  path: string
  size: number
  mimetype: string
  thumbnailUrl?: string
  thumbnailPath?: string
}

export interface StorageState {
  files: MediaFileInfo[]
  loading: boolean
  error: string | null
  uploadProgress: number
}

export function useStorage() {
  const { user } = useAuth()
  const [state, setState] = useState<StorageState>({
    files: [],
    loading: false,
    error: null,
    uploadProgress: 0
  })

  /**
   * 获取文件类型
   */
  const getFileType = (mimetype: string): 'image' | 'video' | 'audio' | 'unknown' => {
    if (SUPPORTED_IMAGE_TYPES.includes(mimetype)) return 'image'
    if (SUPPORTED_VIDEO_TYPES.includes(mimetype)) return 'video'
    if (SUPPORTED_AUDIO_TYPES.includes(mimetype)) return 'audio'
    return 'unknown'
  }

  /**
   * Generate unique file path
   */
  const generateFilePath = (file: File, folder: string): string => {
    if (!user) throw new Error('User not logged in')
    
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2)
    const fileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const extension = fileName.split('.').pop()
    const baseName = fileName.split('.').slice(0, -1).join('.')
    
    const uniqueName = `${baseName}_${timestamp}_${randomId}.${extension}`
    return `${user.id}/${folder}/${uniqueName}`
  }

  /**
   * Validate file
   */
  const validateFile = (file: File): { isValid: boolean; error?: string } => {
    // 检查文件类型
    if (!SUPPORTED_IMAGE_TYPES.includes(file.type) && 
        !SUPPORTED_VIDEO_TYPES.includes(file.type) && 
        !SUPPORTED_AUDIO_TYPES.includes(file.type)) {
      return {
        isValid: false,
        error: `Unsupported file type: ${file.type}`
      }
    }

    // 检查文件大小
    let sizeLimit: number = 10 * 1024 * 1024 // 默认10MB
    
    if (SUPPORTED_IMAGE_TYPES.includes(file.type)) {
      sizeLimit = FILE_SIZE_LIMITS.image
    } else if (SUPPORTED_VIDEO_TYPES.includes(file.type)) {
      sizeLimit = FILE_SIZE_LIMITS.video
    } else if (SUPPORTED_AUDIO_TYPES.includes(file.type)) {
      sizeLimit = FILE_SIZE_LIMITS.audio
    }

    if (file.size > sizeLimit) {
      const limitMB = Math.round(sizeLimit / (1024 * 1024))
      return {
        isValid: false,
        error: `File size cannot exceed ${limitMB}MB`
      }
    }

    return { isValid: true }
  }

  /**
   * Upload file
   */
  const uploadFile = async (file: File, bucket = 'media'): Promise<MediaUploadResult | null> => {
    if (!user) {
      setState(prev => ({ ...prev, error: 'Please login first' }))
      return null
    }

    setState(prev => ({ ...prev, loading: true, error: null, uploadProgress: 0 }))

    try {
      // Validate file
      const validation = validateFile(file)
      if (!validation.isValid) {
        throw new Error(validation.error)
      }

      // Determine folder based on file type
      const fileType = getFileType(file.type)
      const path = generateFilePath(file, fileType)

      // Upload file using Supabase Storage
      const uploadResult = await supabaseStorage.uploadFile(bucket, path, file, {
        cacheControl: '31536000' // 1 year cache
      })

      if (uploadResult.error || !uploadResult.data) {
        throw uploadResult.error || new Error('Upload failed')
      }

      // Get public URL
      const urlResult = await supabaseStorage.getPublicUrl(bucket, path)
      if (urlResult.error || !urlResult.data) {
        throw urlResult.error || new Error('Failed to get URL')
      }

      const result: MediaUploadResult = {
        url: urlResult.data.publicUrl,
        path,
        size: uploadResult.data.size,
        mimetype: uploadResult.data.mimetype
      }

      setState(prev => ({ ...prev, loading: false, uploadProgress: 100 }))
      return result
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload file'
      setState(prev => ({ ...prev, loading: false, error: errorMessage, uploadProgress: 0 }))
      return null
    }
  }

  /**
   * Batch upload files
   */
  const uploadFiles = async (files: File[], bucket = 'media'): Promise<MediaUploadResult[]> => {
    if (!user) {
      setState(prev => ({ ...prev, error: 'Please login first' }))
      return []
    }

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const uploadPromises = files.map(file => uploadFile(file, bucket))
      const results = await Promise.all(uploadPromises)
      
      // Filter successful results
      const successfulUploads = results.filter((result): result is MediaUploadResult => result !== null)
      
      setState(prev => ({ 
        ...prev, 
        loading: false,
        uploadProgress: 100
      }))
      
      return successfulUploads
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to batch upload files'
      setState(prev => ({ ...prev, loading: false, error: errorMessage, uploadProgress: 0 }))
      return []
    }
  }

  /**
   * Get user media files
   */
  const getUserMediaFiles = async (bucket = 'media'): Promise<MediaFileInfo[]> => {
    if (!user) {
      setState(prev => ({ ...prev, error: 'Please login first' }))
      return []
    }

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const mediaFiles: MediaFileInfo[] = []
      
      // Get files of various types
      for (const type of ['image', 'video', 'audio']) {
        const listResult = await supabaseStorage.listFiles(bucket, `${user.id}/${type}`)
        
        if (!listResult.error && listResult.data) {
          for (const item of listResult.data) {
            if (item.name && !item.path.endsWith('/')) {
              const path = item.path
              const urlResult = await supabaseStorage.getPublicUrl(bucket, path)
              
              if (urlResult.data) {
                mediaFiles.push({
                  id: item.id,
                  path,
                  url: urlResult.data.publicUrl,
                  size: item.size,
                  mimetype: item.mimetype,
                  type: type as 'image' | 'video' | 'audio',
                  createdAt: item.created_at || new Date().toISOString()
                })
              }
            }
          }
        }
      }
      
      // Sort by creation time, newest first
      const sortedFiles = mediaFiles.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      
      setState(prev => ({ 
        ...prev, 
        files: sortedFiles, 
        loading: false 
      }))
      
      return sortedFiles
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get media file list'
      setState(prev => ({ ...prev, loading: false, error: errorMessage }))
      return []
    }
  }

  /**
   * Get download URL
   */
  const getDownloadUrl = async (
    path: string, 
    bucket = 'media', 
    signed = false, 
    expiresIn = 3600
  ): Promise<string> => {
    if (!user) {
      setState(prev => ({ ...prev, error: 'Please login first' }))
      return ''
    }

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      // Check if file belongs to current user
      if (!path.startsWith(user.id + '/')) {
        throw new Error('No permission to access this file')
      }
      
      let url = ''
      
      if (signed) {
        // Get signed private URL
        const result = await supabaseStorage.getSignedUrl(bucket, path, expiresIn)
        if (result.error || !result.data?.signedUrl) {
          throw result.error || new Error('Failed to get signed URL')
        }
        url = result.data.signedUrl
      } else {
        // Get public URL
        const result = await supabaseStorage.getPublicUrl(bucket, path)
        if (result.error || !result.data) {
          throw result.error || new Error('Failed to get URL')
        }
        url = result.data.publicUrl
      }
      
      setState(prev => ({ ...prev, loading: false }))
      return url
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get download link'
      setState(prev => ({ ...prev, loading: false, error: errorMessage }))
      return ''
    }
  }

  /**
   * Delete file
   */
  const deleteFile = async (path: string, bucket = 'media'): Promise<boolean> => {
    if (!user) {
      setState(prev => ({ ...prev, error: 'Please login first' }))
      return false
    }

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      // Check if file belongs to current user
      if (!path.startsWith(user.id + '/')) {
        throw new Error('No permission to delete this file')
      }
      
      const result = await supabaseStorage.deleteFile(bucket, path)
      
      if (result.error) {
        throw result.error
      }
      
      // 从状态中移除已删除的文件
      setState(prev => ({
        ...prev,
        files: prev.files.filter(file => file.path !== path),
        loading: false
      }))
      
      return true
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete file'
      setState(prev => ({ ...prev, loading: false, error: errorMessage }))
      return false
    }
  }

  /**
   * Batch delete files
   */
  const deleteFiles = async (paths: string[], bucket = 'media'): Promise<{success: string[], failed: string[]}> => {
    if (!user) {
      setState(prev => ({ ...prev, error: 'Please login first' }))
      return { success: [], failed: paths }
    }

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      // Check if all files belong to current user
      const invalidPaths = paths.filter(p => !p.startsWith(user.id + '/'))
      if (invalidPaths.length > 0) {
        throw new Error('No permission to delete some files')
      }
      
      const result = await supabaseStorage.deleteFiles(bucket, paths)
      
      if (result.error) {
        throw result.error
      }
      
      const { successful = [], failed = [] } = result.data || { successful: [], failed: [] }
      
      // 从状态中移除已删除的文件
      setState(prev => ({
        ...prev,
        files: prev.files.filter(file => !successful.includes(file.path)),
        loading: false
      }))
      
      return { success: successful, failed }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to batch delete files'
      setState(prev => ({ ...prev, loading: false, error: errorMessage }))
      return { success: [], failed: paths }
    }
  }

  /**
   * Download file to local
   */
  const downloadFileToLocal = async (path: string, filename?: string, bucket = 'media'): Promise<boolean> => {
    if (!user) {
      setState(prev => ({ ...prev, error: 'Please login first' }))
      return false
    }

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      // Get signed URL
      const downloadUrl = await getDownloadUrl(path, bucket, true)
      
      if (!downloadUrl) {
        throw new Error('Failed to get download link')
      }
      
      const response = await fetch(downloadUrl)
      if (!response.ok) {
        throw new Error('Download failed')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      
      // Create download link and trigger download
      const link = document.createElement('a')
      link.href = url
      link.download = filename || path.split('/').pop() || 'download'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      window.URL.revokeObjectURL(url)
      
      setState(prev => ({ ...prev, loading: false }))
      return true
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to download file'
      setState(prev => ({ ...prev, loading: false, error: errorMessage }))
      return false
    }
  }

  /**
   * Get preview URL
   */
  const getPreviewUrl = async (path: string, bucket = 'media'): Promise<string> => {
    return getDownloadUrl(path, bucket, false)
  }

  /**
   * Check file type
   */
  const getFileTypeByFilename = (filename: string): 'image' | 'video' | 'audio' | 'unknown' => {
    const extension = filename.split('.').pop()?.toLowerCase()
    
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif']
    const videoExtensions = ['mp4', 'webm', 'ogg', 'mov', 'avi']
    const audioExtensions = ['mp3', 'wav', 'ogg', 'aac', 'webm']
    
    if (extension && imageExtensions.includes(extension)) return 'image'
    if (extension && videoExtensions.includes(extension)) return 'video'
    if (extension && audioExtensions.includes(extension)) return 'audio'
    
    return 'unknown'
  }

  /**
   * Format file size
   */
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return {
    ...state,
    uploadFile,
    uploadFiles,
    getUserMediaFiles,
    getDownloadUrl,
    deleteFile,
    deleteFiles,
    downloadFileToLocal,
    getPreviewUrl,
    getFileType: getFileTypeByFilename,
    formatFileSize,
    validateFile,
    refreshFiles: () => getUserMediaFiles(),
    clearError: () => setState(prev => ({ ...prev, error: null }))
  }
}

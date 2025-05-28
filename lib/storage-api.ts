import { MediaUploadResult, MediaFileInfo } from '../service/media-service'

export interface StorageAPIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

export class StorageAPI {
  private baseUrl = '/api/storage'

  /**
   * 上传文件
   */
  async uploadFile(file: File, bucket = 'media'): Promise<MediaUploadResult> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('bucket', bucket)

    const response = await fetch(`${this.baseUrl}/upload`, {
      method: 'POST',
      body: formData,
    })

    const result: StorageAPIResponse<MediaUploadResult> = await response.json()

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Upload failed')
    }

    return result.data
  }

  /**
   * 批量上传文件
   */
  async uploadFiles(files: File[], bucket = 'media'): Promise<MediaUploadResult[]> {
    const uploadPromises = files.map(file => this.uploadFile(file, bucket))
    return Promise.all(uploadPromises)
  }

  /**
   * 获取用户的媒体文件列表
   */
  async getUserMediaFiles(bucket = 'media'): Promise<MediaFileInfo[]> {
    const response = await fetch(`${this.baseUrl}/upload?bucket=${bucket}`)
    const result: StorageAPIResponse<MediaFileInfo[]> = await response.json()

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to get file list')
    }

    return result.data
  }

  /**
   * 获取文件下载URL
   */
  async getDownloadUrl(path: string, bucket = 'media', signed = false, expiresIn = 3600): Promise<string> {
    const params = new URLSearchParams({
      path,
      bucket,
      signed: signed.toString(),
      expiresIn: expiresIn.toString()
    })

    const response = await fetch(`${this.baseUrl}/download?${params}`)
    const result: StorageAPIResponse<{ url?: string; downloadUrl?: string }> = await response.json()

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to get download link')
    }

    return result.data.downloadUrl || result.data.url || ''
  }

  /**
   * 删除单个文件
   */
  async deleteFile(path: string, bucket = 'media'): Promise<void> {
    const params = new URLSearchParams({ path, bucket })
    
    const response = await fetch(`${this.baseUrl}/delete?${params}`, {
      method: 'DELETE',
    })

    const result: StorageAPIResponse = await response.json()

    if (!result.success) {
      throw new Error(result.error || 'Failed to delete file')
    }
  }

  /**
   * 批量删除文件
   */
  async deleteFiles(paths: string[], bucket = 'media'): Promise<{ success: string[]; failed: string[] }> {
    const response = await fetch(`${this.baseUrl}/delete?bucket=${bucket}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paths }),
    })

    const result: StorageAPIResponse<{ success: string[]; failed: string[] }> = await response.json()

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Batch delete failed')
    }

    return result.data
  }

  /**
   * 下载文件到本地
   */
  async downloadFileToLocal(path: string, filename?: string, bucket = 'media'): Promise<void> {
    try {
      const downloadUrl = await this.getDownloadUrl(path, bucket, true)
      
      const response = await fetch(downloadUrl)
      if (!response.ok) {
        throw new Error('Download failed')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = filename || path.split('/').pop() || 'download'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      window.URL.revokeObjectURL(url)
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Download failed')
    }
  }

  /**
   * 预览文件（获取可用于预览的URL）
   */
  async getPreviewUrl(path: string, bucket = 'media'): Promise<string> {
    return this.getDownloadUrl(path, bucket, false)
  }

  /**
   * 检查文件类型
   */
  getFileType(filename: string): 'image' | 'video' | 'audio' | 'unknown' {
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
   * 格式化文件大小
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  /**
   * 验证文件类型
   */
  validateFileType(file: File): { isValid: boolean; error?: string } {
    const supportedTypes = [
      // 图片
      'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif', 'image/gif',
      // 视频
      'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo',
      // 音频
      'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/aac', 'audio/mp3', 'audio/webm'
    ]

    if (!supportedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `Unsupported file type: ${file.type}`
      }
    }

    return { isValid: true }
  }

  /**
   * 验证文件大小
   */
  validateFileSize(file: File): { isValid: boolean; error?: string } {
    const limits = {
      image: 10 * 1024 * 1024, // 10MB
      video: 100 * 1024 * 1024, // 100MB
      audio: 50 * 1024 * 1024, // 50MB
    }

    let limit: number
    if (file.type.startsWith('image/')) {
      limit = limits.image
    } else if (file.type.startsWith('video/')) {
      limit = limits.video
    } else if (file.type.startsWith('audio/')) {
      limit = limits.audio
    } else {
      return {
        isValid: false,
        error: 'Unknown file type'
      }
    }

    if (file.size > limit) {
      const limitMB = Math.round(limit / (1024 * 1024))
      return {
        isValid: false,
        error: `File size cannot exceed ${limitMB}MB`
      }
    }

    return { isValid: true }
  }

  /**
   * 完整的文件验证
   */
  validateFile(file: File): { isValid: boolean; error?: string } {
    const typeValidation = this.validateFileType(file)
    if (!typeValidation.isValid) {
      return typeValidation
    }

    const sizeValidation = this.validateFileSize(file)
    if (!sizeValidation.isValid) {
      return sizeValidation
    }

    return { isValid: true }
  }
}

// 导出单例实例
export const storageAPI = new StorageAPI() 
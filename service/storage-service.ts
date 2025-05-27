import { createClient } from '../lib/supabase-client'
import { createClient as createServerClient } from '../lib/supabase-server'

export interface FileUploadOptions {
  bucket: string
  path: string
  file: File
  upsert?: boolean
  cacheControl?: string
  contentType?: string
}

export interface FileDownloadOptions {
  bucket: string
  path: string
  transform?: {
    width?: number
    height?: number
    quality?: number
    format?: 'webp' | 'avif' | 'jpeg' | 'png'
  }
}

export interface StorageUploadResult {
  data: {
    id: string
    path: string
    fullPath: string
    size: number
    mimetype: string
  } | null
  error: Error | null
}

export interface StorageDownloadResult {
  data: {
    publicUrl: string
    signedUrl?: string
  } | null
  error: Error | null
}

// 支持的文件类型
export const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif'
]

export const SUPPORTED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/quicktime',
  'video/x-msvideo'
]
// wav、mp3、ogg、aac
export const SUPPORTED_AUDIO_TYPES = [
  // 'audio/mpeg',
  'audio/wav',
  'audio/ogg',
  'audio/aac',
  'audio/mp3',
  // 'audio/webm'
]

export const ALL_SUPPORTED_TYPES = [
  ...SUPPORTED_IMAGE_TYPES,
  ...SUPPORTED_VIDEO_TYPES,
  ...SUPPORTED_AUDIO_TYPES
]

// 文件大小限制 (bytes)
export const FILE_SIZE_LIMITS = {
  image: 10 * 1024 * 1024, // 10MB
  video: 100 * 1024 * 1024, // 100MB
  audio: 50 * 1024 * 1024, // 50MB
}

export class StorageService {
  private supabase
  private isServer: boolean

  constructor(isServer = false) {
    this.isServer = isServer
    this.supabase = isServer ? createServerClient() : createClient()
  }

  /**
   * 验证文件类型和大小
   */
  validateFile(file: File): { isValid: boolean; error?: string } {
    // 检查文件类型
    if (!ALL_SUPPORTED_TYPES.includes(file.type)) {
      return {
        isValid: false,
        error: `不支持的文件类型: ${file.type}`
      }
    }

    // 检查文件大小
    let sizeLimit: number
    if (SUPPORTED_IMAGE_TYPES.includes(file.type)) {
      sizeLimit = FILE_SIZE_LIMITS.image
    } else if (SUPPORTED_VIDEO_TYPES.includes(file.type)) {
      sizeLimit = FILE_SIZE_LIMITS.video
    } else if (SUPPORTED_AUDIO_TYPES.includes(file.type)) {
      sizeLimit = FILE_SIZE_LIMITS.audio
    } else {
      return {
        isValid: false,
        error: '未知的文件类型'
      }
    }

    if (file.size > sizeLimit) {
      const limitMB = Math.round(sizeLimit / (1024 * 1024))
      return {
        isValid: false,
        error: `文件大小不能超过 ${limitMB}MB`
      }
    }

    return { isValid: true }
  }

  /**
   * 生成唯一文件路径
   */
  generateFilePath(file: File, userId?: string, folder?: string): string {
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2)
    const fileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const extension = fileName.split('.').pop()
    const baseName = fileName.split('.').slice(0, -1).join('.')
    
    const uniqueName = `${baseName}_${timestamp}_${randomId}.${extension}`
    
    if (userId && folder) {
      return `${userId}/${folder}/${uniqueName}`
    } else if (userId) {
      return `${userId}/${uniqueName}`
    } else if (folder) {
      return `${folder}/${uniqueName}`
    }
    
    return uniqueName
  }

  /**
   * 上传文件
   */
  async uploadFile(options: FileUploadOptions): Promise<StorageUploadResult> {
    try {
      // 验证文件
      const validation = this.validateFile(options.file)
      if (!validation.isValid) {
        return {
          data: null,
          error: new Error(validation.error)
        }
      }

      const { data, error } = await this.supabase.storage
        .from(options.bucket)
        .upload(options.path, options.file, {
          upsert: options.upsert || false,
          cacheControl: options.cacheControl || '3600',
          contentType: options.contentType || options.file.type,
        })

      if (error) {
        return { data: null, error }
      }

      return {
        data: {
          id: data.id,
          path: data.path,
          fullPath: data.fullPath,
          size: options.file.size,
          mimetype: options.file.type
        },
        error: null
      }
    } catch (error) {
      return {
        data: null,
        error: error as Error
      }
    }
  }

  /**
   * 获取文件的公共URL
   */
  async getPublicUrl(bucket: string, path: string): Promise<StorageDownloadResult> {
    try {
      const { data } = this.supabase.storage
        .from(bucket)
        .getPublicUrl(path)

      return {
        data: {
          publicUrl: data.publicUrl
        },
        error: null
      }
    } catch (error) {
      return {
        data: null,
        error: error as Error
      }
    }
  }

  /**
   * 获取带签名的私有URL
   */
  async getSignedUrl(bucket: string, path: string, expiresIn = 3600): Promise<StorageDownloadResult> {
    try {
      const { data, error } = await this.supabase.storage
        .from(bucket)
        .createSignedUrl(path, expiresIn)

      if (error) {
        return { data: null, error }
      }

      return {
        data: {
          publicUrl: '',
          signedUrl: data.signedUrl
        },
        error: null
      }
    } catch (error) {
      return {
        data: null,
        error: error as Error
      }
    }
  }

  /**
   * 下载文件
   */
  async downloadFile(bucket: string, path: string): Promise<{ data: Blob | null; error: Error | null }> {
    try {
      const { data, error } = await this.supabase.storage
        .from(bucket)
        .download(path)

      return { data, error }
    } catch (error) {
      return {
        data: null,
        error: error as Error
      }
    }
  }

  /**
   * 删除文件
   */
  async deleteFile(bucket: string, path: string): Promise<{ data: any; error: Error | null }> {
    try {
      const { data, error } = await this.supabase.storage
        .from(bucket)
        .remove([path])

      return { data, error }
    } catch (error) {
      return {
        data: null,
        error: error as Error
      }
    }
  }

  /**
   * 批量删除文件
   */
  async deleteFiles(bucket: string, paths: string[]): Promise<{ data: any; error: Error | null }> {
    try {
      const { data, error } = await this.supabase.storage
        .from(bucket)
        .remove(paths)

      return { data, error }
    } catch (error) {
      return {
        data: null,
        error: error as Error
      }
    }
  }

  /**
   * 列出文件夹中的文件
   */
  async listFiles(bucket: string, path?: string, limit = 100, offset = 0) {
    try {
      const { data, error } = await this.supabase.storage
        .from(bucket)
        .list(path, {
          limit,
          offset,
          sortBy: { column: 'created_at', order: 'desc' }
        })

      return { data, error }
    } catch (error) {
      return {
        data: null,
        error: error as Error
      }
    }
  }

  /**
   * 移动/重命名文件
   */
  async moveFile(bucket: string, fromPath: string, toPath: string) {
    try {
      const { data, error } = await this.supabase.storage
        .from(bucket)
        .move(fromPath, toPath)

      return { data, error }
    } catch (error) {
      return {
        data: null,
        error: error as Error
      }
    }
  }

  /**
   * 复制文件
   */
  async copyFile(bucket: string, fromPath: string, toPath: string) {
    try {
      const { data, error } = await this.supabase.storage
        .from(bucket)
        .copy(fromPath, toPath)

      return { data, error }
    } catch (error) {
      return {
        data: null,
        error: error as Error
      }
    }
  }

  /**
   * 创建存储桶
   */
  async createBucket(bucketName: string, options?: { public?: boolean }) {
    try {
      const { data, error } = await this.supabase.storage
        .createBucket(bucketName, {
          public: options?.public || false
        })

      return { data, error }
    } catch (error) {
      return {
        data: null,
        error: error as Error
      }
    }
  }

  /**
   * 获取存储桶列表
   */
  async listBuckets() {
    try {
      const { data, error } = await this.supabase.storage.listBuckets()
      return { data, error }
    } catch (error) {
      return {
        data: null,
        error: error as Error
      }
    }
  }
}

// 导出实例
export const storageService = new StorageService()

// 服务端实例使用工厂函数避免模块级别初始化时访问cookies
export const createServerStorageService = () => new StorageService(true) 
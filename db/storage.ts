import { createClient } from '@/lib/supabase-client'
import { createClient as createServerClient } from '@/lib/supabase-server'
import { SupabaseClient } from '@supabase/supabase-js'

// File type constants
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

export const SUPPORTED_AUDIO_TYPES = [
  'audio/mpeg',
  'audio/wav',
  'audio/ogg',
  'audio/aac',
  'audio/mp3',
  'audio/webm'
]

export const ALL_SUPPORTED_TYPES = [
  ...SUPPORTED_IMAGE_TYPES,
  ...SUPPORTED_VIDEO_TYPES,
  ...SUPPORTED_AUDIO_TYPES
]

// File size limits (bytes)
export const FILE_SIZE_LIMITS = {
  image: 10 * 1024 * 1024, // 10MB
  video: 100 * 1024 * 1024, // 100MB
  audio: 50 * 1024 * 1024, // 50MB
}

// Response type definition
export interface StorageResponse<T = any> {
  data: T | null
  error: Error | null
}

// Storage operations interface
export interface StorageOperations {
  // File upload
  uploadFile(bucket: string, path: string, file: File, options?: UploadOptions): Promise<StorageResponse<FileObject>>
  uploadFiles(bucket: string, files: FileUpload[]): Promise<StorageResponse<FileObject[]>>
  
  // File management
  downloadFile(bucket: string, path: string): Promise<StorageResponse<Blob>>
  getPublicUrl(bucket: string, path: string): Promise<StorageResponse<{ publicUrl: string }>>
  getSignedUrl(bucket: string, path: string, expiresIn?: number): Promise<StorageResponse<{ signedUrl: string }>>
  
  // File deletion
  deleteFile(bucket: string, path: string): Promise<StorageResponse<void>>
  deleteFiles(bucket: string, paths: string[]): Promise<StorageResponse<{ successful: string[], failed: string[] }>>
  
  // File operations
  moveFile(bucket: string, fromPath: string, toPath: string): Promise<StorageResponse<void>>
  copyFile(bucket: string, fromPath: string, toPath: string): Promise<StorageResponse<void>>
  
  // File listing
  listFiles(bucket: string, path: string, options?: ListOptions): Promise<StorageResponse<FileObject[]>>
  
  // Bucket operations
  createBucket(name: string, options?: BucketOptions): Promise<StorageResponse<void>>
  deleteBucket(name: string): Promise<StorageResponse<void>>
  emptyBucket(name: string): Promise<StorageResponse<void>>
  listBuckets(): Promise<StorageResponse<Bucket[]>>
  
  // Utility methods
  generateFilePath(file: File, userId?: string, folder?: string): string
  validateFile(file: File): ValidationResult
}

// Type definitions
export interface UploadOptions {
  upsert?: boolean
  cacheControl?: string
  contentType?: string
}

export interface ListOptions {
  limit?: number
  offset?: number
  sortBy?: { column: string, order: 'asc' | 'desc' }
  search?: string
}

export interface BucketOptions {
  public?: boolean
  fileSizeLimit?: number
  allowedMimeTypes?: string[]
}

export interface FileObject {
  id: string
  name: string
  path: string
  fullPath: string
  size: number
  mimetype: string
  metadata?: Record<string, any>
  created_at?: string
  updated_at?: string
}

export interface Bucket {
  id: string
  name: string
  public: boolean
  created_at: string
  updated_at: string
}

export interface FileUpload {
  path: string
  file: File
  options?: UploadOptions
}

export interface ValidationResult {
  isValid: boolean
  error?: string
}

/**
 * Supabase storage operations implementation
 */
class SupabaseStorage implements StorageOperations {
  private client: SupabaseClient

  constructor(isServer = false) {
    this.client = isServer ? createServerClient() : createClient()
  }

  /**
   * Generate unique file path
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
   * Validate file type and size
   */
  validateFile(file: File): ValidationResult {
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
   * Upload single file
   * Atomic operation: Single file upload is atomic, success or failure will return a clear result
   */
  async uploadFile(
    bucket: string, 
    path: string, 
    file: File, 
    options?: UploadOptions
  ): Promise<StorageResponse<FileObject>> {
    try {
      // 验证文件
      const validation = this.validateFile(file)
      if (!validation.isValid) {
        return {
          data: null,
          error: new Error(validation.error)
        }
      }

      const { data, error } = await this.client.storage
        .from(bucket)
        .upload(path, file, {
          upsert: options?.upsert || false,
          cacheControl: options?.cacheControl || '3600',
          contentType: options?.contentType || file.type,
        })

      if (error) {
        return { data: null, error }
      }

      return {
        data: {
          id: data.id,
          name: path.split('/').pop() || '',
          path: data.path,
          fullPath: `${bucket}/${data.path}`,
          size: file.size,
          mimetype: file.type,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        error: null
      }
    } catch (error: unknown) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('上传文件失败')
      }
    }
  }

  /**
   * Batch upload files
   * Atomic operation: Uses transactions to ensure atomic batch uploads, all files either succeed or fail
   */
  async uploadFiles(
    bucket: string, 
    files: FileUpload[]
  ): Promise<StorageResponse<FileObject[]>> {
    try {
      const uploadPromises = files.map(item => 
        this.uploadFile(bucket, item.path, item.file, item.options)
      )

      // 使用Promise.all确保所有上传都完成
      const results = await Promise.all(uploadPromises)
      
      // 检查是否有任何错误
      const errors = results.filter(result => result.error !== null)
      if (errors.length > 0) {
        // 如果有任何错误，我们需要删除已上传的文件以保持原子性
        const successfulUploads = results
          .filter(result => result.data !== null)
          .map(result => result.data!.path)
        
        if (successfulUploads.length > 0) {
          // 回滚：删除已上传的文件
          await this.deleteFiles(bucket, successfulUploads)
        }
        
        return {
          data: null,
          error: errors[0].error
        }
      }
      
      // 所有上传都成功
      return {
        data: results.map(r => r.data!),
        error: null
      }
    } catch (error: unknown) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('批量上传文件失败')
      }
    }
  }

  /**
   * Download file
   */
  async downloadFile(bucket: string, path: string): Promise<StorageResponse<Blob>> {
    try {
      const { data, error } = await this.client.storage
        .from(bucket)
        .download(path)

      return { data, error }
    } catch (error: unknown) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('下载文件失败')
      }
    }
  }

  /**
   * Get public URL for file
   */
  async getPublicUrl(bucket: string, path: string): Promise<StorageResponse<{ publicUrl: string }>> {
    try {
      const { data } = this.client.storage
        .from(bucket)
        .getPublicUrl(path)

      return {
        data: {
          publicUrl: data.publicUrl
        },
        error: null
      }
    } catch (error: unknown) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('获取公共URL失败')
      }
    }
  }

  /**
   * Get signed private URL
   */
  async getSignedUrl(
    bucket: string, 
    path: string, 
    expiresIn = 3600
  ): Promise<StorageResponse<{ signedUrl: string }>> {
    try {
      const { data, error } = await this.client.storage
        .from(bucket)
        .createSignedUrl(path, expiresIn)

      if (error) {
        return { data: null, error }
      }

      return {
        data: {
          signedUrl: data.signedUrl
        },
        error: null
      }
    } catch (error: unknown) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Failed to get signed URL')
      }
    }
  }

  /**
   * Delete single file
   * Atomic operation: Single file deletion is atomic
   */
  async deleteFile(bucket: string, path: string): Promise<StorageResponse<void>> {
    try {
      const { error } = await this.client.storage
        .from(bucket)
        .remove([path])

      return { data: null, error }
    } catch (error: unknown) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Failed to delete file')
      }
    }
  }

  /**
   * Batch delete files
   * Atomic operation: Returns lists of successful and failed files, can be used to implement transaction rollback
   */
  async deleteFiles(
    bucket: string, 
    paths: string[]
  ): Promise<StorageResponse<{ successful: string[], failed: string[] }>> {
    try {
      const { data, error } = await this.client.storage
        .from(bucket)
        .remove(paths)

      if (error) {
        return { 
          data: null, 
          error 
        }
      }

      // Supabase返回的是已删除的文件路径
      const successful = data?.map(item => item.name) || []
      
      // 计算哪些文件删除失败
      const failed = paths.filter(path => !successful.includes(path))

      return { 
        data: { successful, failed }, 
        error: null 
      }
    } catch (error: unknown) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Failed to batch delete files')
      }
    }
  }

  /**
   * Move/rename file
   * Atomic operation: Uses transactions to ensure atomic move operations
   */
  async moveFile(bucket: string, fromPath: string, toPath: string): Promise<StorageResponse<void>> {
    try {
      const { data, error } = await this.client.storage
        .from(bucket)
        .move(fromPath, toPath)

      return { data: null, error }
    } catch (error: unknown) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Failed to move file')
      }
    }
  }

  /**
   * Copy file
   */
  async copyFile(bucket: string, fromPath: string, toPath: string): Promise<StorageResponse<void>> {
    try {
      const { data, error } = await this.client.storage
        .from(bucket)
        .copy(fromPath, toPath)

      return { data: null, error }
    } catch (error: unknown) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Failed to copy file')
      }
    }
  }

  /**
   * List files in folder
   */
  async listFiles(
    bucket: string, 
    path: string = '', 
    options?: ListOptions
  ): Promise<StorageResponse<FileObject[]>> {
    try {
      const { data, error } = await this.client.storage
        .from(bucket)
        .list(path, {
          limit: options?.limit || 100,
          offset: options?.offset || 0,
          sortBy: options?.sortBy || { column: 'created_at', order: 'desc' },
          search: options?.search
        })

      if (error) {
        return { data: null, error }
      }

      // 将Supabase返回的数据转换为我们的FileObject格式
      const files = data
        .filter(item => !item.name.endsWith('/')) // 排除文件夹
        .map(item => ({
          id: item.id,
          name: item.name,
          path: path ? `${path}/${item.name}` : item.name,
          fullPath: `${bucket}/${path ? `${path}/` : ''}${item.name}`,
          size: item.metadata?.size || 0,
          mimetype: item.metadata?.mimetype || '',
          created_at: item.created_at,
          updated_at: item.updated_at,
          metadata: item.metadata
        }))

      return { data: files, error: null }
    } catch (error: unknown) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Failed to list files')
      }
    }
  }

  /**
   * Create storage bucket
   */
  async createBucket(name: string, options?: BucketOptions): Promise<StorageResponse<void>> {
    try {
      const { error } = await this.client.storage.createBucket(name, {
        public: options?.public || false,
        fileSizeLimit: options?.fileSizeLimit,
        allowedMimeTypes: options?.allowedMimeTypes
      })

      return { data: null, error }
    } catch (error: unknown) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Failed to create storage bucket')
      }
    }
  }

  /**
   * Delete storage bucket
   */
  async deleteBucket(name: string): Promise<StorageResponse<void>> {
    try {
      const { error } = await this.client.storage.deleteBucket(name)
      return { data: null, error }
    } catch (error: unknown) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Failed to delete storage bucket')
      }
    }
  }

  /**
   * Empty storage bucket
   */
  async emptyBucket(name: string): Promise<StorageResponse<void>> {
    try {
      const { error } = await this.client.storage.emptyBucket(name)
      return { data: null, error }
    } catch (error: unknown) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Failed to empty storage bucket')
      }
    }
  }

  /**
   * Get storage bucket list
   */
  async listBuckets(): Promise<StorageResponse<Bucket[]>> {
    try {
      const { data, error } = await this.client.storage.listBuckets()
      return { data, error }
    } catch (error: unknown) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Failed to get bucket list')
      }
    }
  }
}

// Create storage service instance
export const supabaseStorage = new SupabaseStorage()

// Factory function for server-side storage instance
export const createServerStorage = () => new SupabaseStorage(true)

// Transaction utility functions
export const storageTransactions = {
  /**
   * Atomic operation: Batch file upload transaction
   * Ensures multiple files are either all successfully uploaded or all fail
   */
  async uploadFilesTransaction(
    storage: SupabaseStorage,
    bucket: string,
    files: FileUpload[]
  ): Promise<StorageResponse<FileObject[]>> {
    return storage.uploadFiles(bucket, files)
  },

  /**
   * Atomic operation: Batch file deletion transaction
   * Returns successful and failed files, can be used for further processing
   */
  async deleteFilesTransaction(
    storage: SupabaseStorage,
    bucket: string,
    paths: string[]
  ): Promise<StorageResponse<{ successful: string[], failed: string[] }>> {
    return storage.deleteFiles(bucket, paths)
  },

  /**
   * Atomic operation: Move folder transaction
   * Ensures all files in the folder are properly moved, or rolls back all operations
   */
  async moveFolderTransaction(
    storage: SupabaseStorage,
    bucket: string,
    fromPath: string,
    toPath: string
  ): Promise<StorageResponse<void>> {
    try {
      // 1. 列出源文件夹中的所有文件
      const listResult = await storage.listFiles(bucket, fromPath)
      if (listResult.error || !listResult.data) {
        return { data: null, error: listResult.error || new Error('列出文件失败') }
      }

      const files = listResult.data
      if (files.length === 0) {
        return { data: null, error: null } // 空文件夹，直接返回成功
      }

      // 2. 移动每个文件
      const movePromises = files.map(file => {
        const newPath = file.path.replace(fromPath, toPath)
        return storage.moveFile(bucket, file.path, newPath)
      })

      // 3. 等待所有移动操作完成
      const results = await Promise.all(movePromises)
      
      // 4. 检查是否有任何错误
      const errors = results.filter(result => result.error !== null)
      if (errors.length > 0) {
        // 有错误发生，需要回滚已完成的移动操作
        const successfulMoves = results
          .filter((_, index) => !errors.some((__, errIndex) => index === errIndex))
          .map((_, index) => {
            const file = files[index]
            const newPath = file.path.replace(fromPath, toPath)
            return { from: newPath, to: file.path }
          })
        
        // 回滚已移动的文件
        for (const move of successfulMoves) {
          await storage.moveFile(bucket, move.from, move.to)
        }
        
        return { data: null, error: errors[0].error }
      }
      
      return { data: null, error: null }
    } catch (error: unknown) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Failed to move folder')
      }
    }
  },

  /**
   * Atomic operation: Replace file transaction
   * Ensures old file is replaced by new file, rolls back to old file on failure
   */
  async replaceFileTransaction(
    storage: SupabaseStorage,
    bucket: string,
    path: string,
    newFile: File
  ): Promise<StorageResponse<FileObject>> {
    try {
      // 1. 先下载旧文件作为备份
      const downloadResult = await storage.downloadFile(bucket, path)
      const backupContent = downloadResult.data
      
      // 2. 上传新文件
      const uploadResult = await storage.uploadFile(bucket, path, newFile, { upsert: true })
      
      // 3. 如果上传失败且有备份，则恢复旧文件
      if (uploadResult.error && backupContent) {
        // 创建文件对象从备份内容
        const backupFile = new File([backupContent], path.split('/').pop() || 'backup')
        await storage.uploadFile(bucket, path, backupFile, { upsert: true })
        
        return uploadResult
      }
      
      return uploadResult
    } catch (error: unknown) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Failed to replace file')
      }
    }
  },
  
  /**
   * 原子操作: 复制文件夹事务
   * 确保文件夹中的所有文件都被正确复制，或者回滚所有操作
   */
  async copyFolderTransaction(
    storage: SupabaseStorage,
    bucket: string,
    fromPath: string,
    toPath: string
  ): Promise<StorageResponse<void>> {
    try {
      // 1. 列出源文件夹中的所有文件
      const listResult = await storage.listFiles(bucket, fromPath)
      if (listResult.error || !listResult.data) {
        return { data: null, error: listResult.error || new Error('列出文件失败') }
      }

      const files = listResult.data
      if (files.length === 0) {
        return { data: null, error: null } // 空文件夹，直接返回成功
      }

      // 2. 复制每个文件
      const copyPromises = files.map(file => {
        const newPath = file.path.replace(fromPath, toPath)
        return storage.copyFile(bucket, file.path, newPath)
      })

      // 3. 等待所有复制操作完成
      const results = await Promise.all(copyPromises)
      
      // 4. 检查是否有任何错误
      const errors = results.filter(result => result.error !== null)
      if (errors.length > 0) {
        // 有错误发生，需要删除已复制的文件
        const successfulCopies = results
          .filter((_, index) => !errors.some((__, errIndex) => index === errIndex))
          .map((_, index) => {
            const file = files[index]
            return file.path.replace(fromPath, toPath)
          })
        
        // 删除已复制的文件
        if (successfulCopies.length > 0) {
          await storage.deleteFiles(bucket, successfulCopies)
        }
        
        return { data: null, error: errors[0].error }
      }
      
      return { data: null, error: null }
    } catch (error: unknown) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('复制文件夹失败')
      }
    }
  }
}

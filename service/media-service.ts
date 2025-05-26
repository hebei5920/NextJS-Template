import { StorageService, SUPPORTED_IMAGE_TYPES, SUPPORTED_VIDEO_TYPES, SUPPORTED_AUDIO_TYPES } from './storage-service'

export interface MediaUploadOptions {
  file: File
  userId: string
  bucket?: string
  compress?: boolean
  generateThumbnail?: boolean
}

export interface MediaUploadResult {
  url: string
  path: string
  size: number
  mimetype: string
  thumbnailUrl?: string
  thumbnailPath?: string
}

export interface MediaFileInfo {
  id: string
  path: string
  url: string
  size: number
  mimetype: string
  type: 'image' | 'video' | 'audio'
  createdAt: string
  thumbnailUrl?: string
}

export class MediaService extends StorageService {
  private readonly DEFAULT_BUCKET = 'media'

  constructor(isServer = false) {
    super(isServer)
  }

  /**
   * 获取文件类型
   */
  private getFileType(mimetype: string): 'image' | 'video' | 'audio' | 'unknown' {
    if (SUPPORTED_IMAGE_TYPES.includes(mimetype)) return 'image'
    if (SUPPORTED_VIDEO_TYPES.includes(mimetype)) return 'video'
    if (SUPPORTED_AUDIO_TYPES.includes(mimetype)) return 'audio'
    return 'unknown'
  }

  /**
   * 验证 userId 是否有效
   */
  private validateUserId(userId: string): void {
    if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
      throw new Error('userId 是必需的，且不能为空')
    }
    
    // 验证 userId 格式（UUID格式）
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidPattern.test(userId.trim())) {
      throw new Error('userId 格式无效，必须是有效的 UUID')
    }
  }

  /**
   * 上传图片
   */
  async uploadImage(options: MediaUploadOptions): Promise<MediaUploadResult> {
    const { file, userId, bucket = this.DEFAULT_BUCKET } = options

    // 验证 userId
    this.validateUserId(userId)

    // 验证是否为图片
    if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) {
      throw new Error('只支持图片文件上传')
    }

    const folder = this.getFileType(file.type)
    const path = this.generateFilePath(file, userId, folder)

    const uploadResult = await this.uploadFile({
      bucket,
      path,
      file,
      cacheControl: '31536000' // 1年缓存
    })

    if (uploadResult.error || !uploadResult.data) {
      throw uploadResult.error || new Error('上传失败')
    }

    const urlResult = await this.getPublicUrl(bucket, path)
    if (urlResult.error || !urlResult.data) {
      throw urlResult.error || new Error('获取URL失败')
    }

    return {
      url: urlResult.data.publicUrl,
      path,
      size: uploadResult.data.size,
      mimetype: uploadResult.data.mimetype
    }
  }

  /**
   * 上传视频
   */
  async uploadVideo(options: MediaUploadOptions): Promise<MediaUploadResult> {
    const { file, userId, bucket = this.DEFAULT_BUCKET } = options

    // 验证 userId
    this.validateUserId(userId)

    // 验证是否为视频
    if (!SUPPORTED_VIDEO_TYPES.includes(file.type)) {
      throw new Error('只支持视频文件上传')
    }

    const folder = this.getFileType(file.type)
    const path = this.generateFilePath(file, userId, folder)

    const uploadResult = await this.uploadFile({
      bucket,
      path,
      file,
      cacheControl: '31536000' // 1年缓存
    })

    if (uploadResult.error || !uploadResult.data) {
      throw uploadResult.error || new Error('上传失败')
    }

    const urlResult = await this.getPublicUrl(bucket, path)
    if (urlResult.error || !urlResult.data) {
      throw urlResult.error || new Error('获取URL失败')
    }

    return {
      url: urlResult.data.publicUrl,
      path,
      size: uploadResult.data.size,
      mimetype: uploadResult.data.mimetype
    }
  }

  /**
   * 上传音频
   */
  async uploadAudio(options: MediaUploadOptions): Promise<MediaUploadResult> {
    const { file, userId, bucket = this.DEFAULT_BUCKET } = options

    // 验证 userId
    this.validateUserId(userId)

    // 验证是否为音频
    if (!SUPPORTED_AUDIO_TYPES.includes(file.type)) {
      throw new Error('只支持音频文件上传')
    }

    const folder = this.getFileType(file.type)
    const path = this.generateFilePath(file, userId, folder)

    const uploadResult = await this.uploadFile({
      bucket,
      path,
      file,
      cacheControl: '31536000' // 1年缓存
    })

    if (uploadResult.error || !uploadResult.data) {
      throw uploadResult.error || new Error('上传失败')
    }

    const urlResult = await this.getPublicUrl(bucket, path)
    if (urlResult.error || !urlResult.data) {
      throw urlResult.error || new Error('获取URL失败')
    }

    return {
      url: urlResult.data.publicUrl,
      path,
      size: uploadResult.data.size,
      mimetype: uploadResult.data.mimetype
    }
  }

  /**
   * 通用媒体文件上传
   */
  async uploadMedia(options: MediaUploadOptions): Promise<MediaUploadResult> {
    const fileType = this.getFileType(options.file.type)

    // 验证 userId
    this.validateUserId(options.userId)

    switch (fileType) {
      case 'image':
        return this.uploadImage(options)
      case 'video':
        return this.uploadVideo(options)
      case 'audio':
        return this.uploadAudio(options)
      default:
        throw new Error('不支持的文件类型')
    }
  }

  /**
   * 获取用户的媒体文件列表
   */
  async getUserMediaFiles(userId: string, bucket = this.DEFAULT_BUCKET): Promise<MediaFileInfo[]> {
    // 验证 userId
    this.validateUserId(userId)

    const mediaFiles: MediaFileInfo[] = []

    // 获取各类型文件
    for (const type of ['image', 'video', 'audio']) {
      const { data, error } = await this.listFiles(bucket, `${userId}/${type}`)

      if (!error && data) {
        for (const item of data) {
          if (item.name && !item.name.endsWith('/')) {
            const path = `${userId}/${type}/${item.name}`
            const urlResult = await this.getPublicUrl(bucket, path)

            if (urlResult.data) {
              mediaFiles.push({
                id: item.id || path,
                path,
                url: urlResult.data.publicUrl,
                size: item.metadata?.size || 0,
                mimetype: item.metadata?.mimetype || '',
                type: type as 'image' | 'video' | 'audio',
                createdAt: item.created_at || new Date().toISOString()
              })
            }
          }
        }
      }
    }

    return mediaFiles.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  /**
   * 删除媒体文件
   */
  async deleteMediaFile(path: string, bucket = this.DEFAULT_BUCKET): Promise<boolean> {
    const { error } = await this.deleteFile(bucket, path)
    return !error
  }

  /**
   * 批量删除媒体文件
   */
  async deleteMediaFiles(paths: string[], bucket = this.DEFAULT_BUCKET): Promise<{ success: string[]; failed: string[] }> {
    const result = await this.deleteFiles(bucket, paths)

    if (result.error) {
      return { success: [], failed: paths }
    }

    return { success: paths, failed: [] }
  }

  /**
   * 获取媒体文件的下载链接（带时效）
   */
  async getMediaDownloadUrl(path: string, bucket = this.DEFAULT_BUCKET, expiresIn = 3600): Promise<string> {
    const result = await this.getSignedUrl(bucket, path, expiresIn)

    if (result.error || !result.data?.signedUrl) {
      throw result.error || new Error('获取下载链接失败')
    }

    return result.data.signedUrl
  }

  /**
   * 检查媒体文件是否存在
   */
  async mediaExists(path: string, bucket = this.DEFAULT_BUCKET): Promise<boolean> {
    try {
      const { data, error } = await this.downloadFile(bucket, path)
      return !error && data !== null
    } catch {
      return false
    }
  }

  /**
   * 获取媒体文件大小和元信息
   */
  async getMediaInfo(path: string, bucket = this.DEFAULT_BUCKET): Promise<{ size: number; lastModified: string } | null> {
    try {
      // 通过列表API获取文件信息
      const pathParts = path.split('/')
      const fileName = pathParts.pop()
      const folder = pathParts.join('/')

      const { data, error } = await this.listFiles(bucket, folder)

      if (error || !data) return null

      const fileInfo = data.find(item => item.name === fileName)

      if (!fileInfo) return null

      return {
        size: fileInfo.metadata?.size || 0,
        lastModified: fileInfo.updated_at || fileInfo.created_at || new Date().toISOString()
      }
    } catch {
      return null
    }
  }
}

// 导出实例
export const mediaService = new MediaService()

// 服务端实例使用工厂函数避免模块级别初始化时访问cookies
export const createServerMediaService = () => new MediaService(true) 
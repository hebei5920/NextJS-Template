'use server'

import { createClient } from '@/lib/supabase-server'
import { createServerStorage, storageTransactions } from '@/db/storage'
import { revalidatePath } from 'next/cache'
import {
    SUPPORTED_IMAGE_TYPES,
    SUPPORTED_VIDEO_TYPES,
    SUPPORTED_AUDIO_TYPES,
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

/**
 * 获取文件类型
 */
function getFileType(mimetype: string): 'image' | 'video' | 'audio' | 'unknown' {
    if (SUPPORTED_IMAGE_TYPES.includes(mimetype)) return 'image'
    if (SUPPORTED_VIDEO_TYPES.includes(mimetype)) return 'video'
    if (SUPPORTED_AUDIO_TYPES.includes(mimetype)) return 'audio'
    return 'unknown'
}

/**
 * 生成唯一文件路径
 */
function generateFilePath(userId: string, file: File, folder: string): string {
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2)
    const fileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const extension = fileName.split('.').pop()
    const baseName = fileName.split('.').slice(0, -1).join('.')

    const uniqueName = `${baseName}_${timestamp}_${randomId}.${extension}`
    return `${userId}/${folder}/${uniqueName}`
}

/**
 * 验证文件
 */
function validateFile(file: File): { isValid: boolean; error?: string } {
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
    let sizeLimit: number
    if (SUPPORTED_IMAGE_TYPES.includes(file.type)) {
        sizeLimit = FILE_SIZE_LIMITS.image
    } else if (SUPPORTED_VIDEO_TYPES.includes(file.type)) {
        sizeLimit = FILE_SIZE_LIMITS.video
    } else if (SUPPORTED_AUDIO_TYPES.includes(file.type)) {
        sizeLimit = FILE_SIZE_LIMITS.audio
    } else {
        sizeLimit = FILE_SIZE_LIMITS.image // 默认使用图片大小限制
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
 * 上传单个文件
 */
export async function uploadFile(
    file: File,
    bucket = 'media'
): Promise<{
    result: MediaUploadResult | null
    error: string | null
}> {
    try {
        const supabase = createClient()
        const storage = createServerStorage()

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return { result: null, error: 'Please login first' }
        }

        // 验证文件
        const validation = validateFile(file)
        if (!validation.isValid) {
            return { result: null, error: validation.error || 'Invalid file' }
        }

        // 确定文件夹和路径
        const fileType = getFileType(file.type)
        const path = generateFilePath(user.id, file, fileType)

        // 上传文件
        const uploadResult = await storage.uploadFile(bucket, path, file, {
            cacheControl: '31536000' // 1 year cache
        })

        if (uploadResult.error || !uploadResult.data) {
            throw uploadResult.error || new Error('Upload failed')
        }

        // 获取公共URL
        const urlResult = await storage.getPublicUrl(bucket, path)
        if (urlResult.error || !urlResult.data) {
            throw urlResult.error || new Error('Failed to get URL')
        }

        const result: MediaUploadResult = {
            url: urlResult.data.publicUrl,
            path,
            size: uploadResult.data.size,
            mimetype: uploadResult.data.mimetype
        }

        revalidatePath('/') // 重新验证页面数据
        return { result, error: null }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to upload file'
        return { result: null, error: errorMessage }
    }
}

/**
 * 批量上传文件
 */
export async function uploadFiles(
    files: File[],
    bucket = 'media'
): Promise<{
    results: MediaUploadResult[]
    error: string | null
}> {
    try {
        const uploadPromises = files.map(file => uploadFile(file, bucket))
        const results = await Promise.all(uploadPromises)

        // 过滤成功的上传结果
        const successfulUploads = results
            .filter((result): result is { result: MediaUploadResult; error: null } =>
                result.result !== null && result.error === null
            )
            .map(result => result.result)

        // 检查是否有任何错误
        const errors = results
            .filter(result => result.error !== null)
            .map(result => result.error)

        return {
            results: successfulUploads,
            error: errors.length > 0 ? errors.join('; ') : null
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to batch upload files'
        return { results: [], error: errorMessage }
    }
}

/**
 * 获取用户媒体文件列表
 */
export async function getUserMediaFiles(
    bucket = 'media'
): Promise<{
    files: MediaFileInfo[]
    error: string | null
}> {
    try {
        const supabase = createClient()
        const storage = createServerStorage()

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return { files: [], error: 'Please login first' }
        }

        const mediaFiles: MediaFileInfo[] = []

        // 获取各种类型的文件
        for (const type of ['image', 'video', 'audio']) {
            const listResult = await storage.listFiles(bucket, `${user.id}/${type}`)

            if (!listResult.error && listResult.data) {
                for (const item of listResult.data) {
                    if (item.name && !item.path.endsWith('/')) {
                        const path = item.path
                        const urlResult = await storage.getPublicUrl(bucket, path)

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

        // 按创建时间排序，最新的在前
        const sortedFiles = mediaFiles.sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )

        return { files: sortedFiles, error: null }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to get media file list'
        return { files: [], error: errorMessage }
    }
}

/**
 * 获取下载URL
 */
export async function getDownloadUrl(
    path: string,
    bucket = 'media',
    signed = false,
    expiresIn = 3600
): Promise<{
    url: string
    error: string | null
}> {
    try {
        const supabase = createClient()
        const storage = createServerStorage()

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return { url: '', error: 'Please login first' }
        }

        // 检查文件是否属于当前用户
        if (!path.startsWith(user.id + '/')) {
            return { url: '', error: 'No permission to access this file' }
        }

        if (signed) {
            // 获取签名私有URL
            const result = await storage.getSignedUrl(bucket, path, expiresIn)
            if (result.error || !result.data?.signedUrl) {
                throw result.error || new Error('Failed to get signed URL')
            }
            return { url: result.data.signedUrl, error: null }
        } else {
            // 获取公共URL
            const result = await storage.getPublicUrl(bucket, path)
            if (result.error || !result.data) {
                throw result.error || new Error('Failed to get URL')
            }
            return { url: result.data.publicUrl, error: null }
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to get download link'
        return { url: '', error: errorMessage }
    }
}

/**
 * 删除文件
 */
export async function deleteFile(
    path: string,
    bucket = 'media'
): Promise<{
    success: boolean
    error: string | null
}> {
    try {
        const supabase = createClient()
        const storage = createServerStorage()

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return { success: false, error: 'Please login first' }
        }

        // 检查文件是否属于当前用户
        if (!path.startsWith(user.id + '/')) {
            return { success: false, error: 'No permission to delete this file' }
        }

        const result = await storage.deleteFile(bucket, path)

        if (result.error) {
            throw result.error
        }

        revalidatePath('/') // 重新验证页面数据
        return { success: true, error: null }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete file'
        return { success: false, error: errorMessage }
    }
}

/**
 * 批量删除文件
 */
export async function deleteFiles(
    paths: string[],
    bucket = 'media'
): Promise<{
    successful: string[]
    failed: string[]
    error: string | null
}> {
    try {
        const supabase = createClient()
        const storage = createServerStorage()

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return { successful: [], failed: paths, error: 'Please login first' }
        }

        // 检查所有文件是否属于当前用户
        const invalidPaths = paths.filter(p => !p.startsWith(user.id + '/'))
        if (invalidPaths.length > 0) {
            return {
                successful: [],
                failed: paths,
                error: 'No permission to delete some files'
            }
        }

        // 使用事务删除文件
        const result = await storageTransactions.deleteFilesTransaction(
            storage,
            bucket,
            paths
        )

        if (result.error) {
            throw result.error
        }

        const { successful = [], failed = [] } = result.data || { successful: [], failed: [] }

        revalidatePath('/') // 重新验证页面数据
        return { successful, failed, error: null }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to batch delete files'
        return { successful: [], failed: paths, error: errorMessage }
    }
}

/**
 * 获取预览URL
 */
export async function getPreviewUrl(
    path: string,
    bucket = 'media'
): Promise<{
    url: string
    error: string | null
}> {
    return getDownloadUrl(path, bucket, false)
}

/**
 * 根据文件名获取文件类型
 */
export async function getFileTypeByFilename(filename: string): Promise<'image' | 'video' | 'audio' | 'unknown'> {
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
export async function formatFileSize(bytes: number): Promise<string> {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

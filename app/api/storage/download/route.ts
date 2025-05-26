import { NextRequest, NextResponse } from 'next/server'
import { createServerMediaService } from '@/service/media-service'
import { createClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    // 检查用户认证
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: '未认证用户' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const path = searchParams.get('path')
    const bucket = searchParams.get('bucket') || 'media'
    const signed = searchParams.get('signed') === 'true'
    const expiresIn = parseInt(searchParams.get('expiresIn') || '3600')
    
    if (!path) {
      return NextResponse.json(
        { error: '未提供文件路径' },
        { status: 400 }
      )
    }

    // 检查文件是否属于当前用户
    if (!path.startsWith(user.id + '/')) {
      return NextResponse.json(
        { error: '无权限访问该文件' },
        { status: 403 }
      )
    }

    // 创建服务端媒体服务实例
    const serverMediaService = createServerMediaService()

    if (signed) {
      // 获取带签名的私有下载链接
      const downloadUrl = await serverMediaService.getMediaDownloadUrl(path, bucket, expiresIn)
      
      return NextResponse.json({
        success: true,
        data: {
          downloadUrl,
          expiresIn
        }
      })
    } else {
      // 获取公共URL
      const urlResult = await serverMediaService.getPublicUrl(bucket, path)
      
      if (urlResult.error || !urlResult.data) {
        return NextResponse.json(
          { error: '获取文件URL失败' },
          { status: 500 }
        )
      }
      
      return NextResponse.json({
        success: true,
        data: {
          url: urlResult.data.publicUrl
        }
      })
    }
    
  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '下载失败' },
      { status: 500 }
    )
  }
} 
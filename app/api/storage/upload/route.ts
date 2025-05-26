import { NextRequest, NextResponse } from 'next/server'
import { createServerMediaService } from '@/service/media-service'
import { createClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
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


    const formData = await request.formData()
    const file = formData.get('file') as File
    const bucket = (formData.get('bucket') as string) || 'media'

    if (!file) {
      return NextResponse.json(
        { error: '未提供文件' },
        { status: 400 }
      )
    }

    // 创建服务端媒体服务实例
    const serverMediaService = createServerMediaService()

    // 验证文件类型和大小
    const validation = serverMediaService.validateFile(file)
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    // 上传文件
    const result = await serverMediaService.uploadMedia({
      file,
      userId: user.id,
      bucket
    })

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '上传失败' },
      { status: 500 }
    )
  }
}

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
    const bucket = searchParams.get('bucket') || 'media'

    // 创建服务端媒体服务实例
    const serverMediaService = createServerMediaService()

    // 获取用户的所有媒体文件
    const mediaFiles = await serverMediaService.getUserMediaFiles(user.id, bucket)

    return NextResponse.json({
      success: true,
      data: mediaFiles
    })

  } catch (error) {
    console.error('Get files error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '获取文件列表失败' },
      { status: 500 }
    )
  }
} 
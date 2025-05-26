import { NextRequest, NextResponse } from 'next/server'
import { createServerMediaService } from '@/service/media-service'
import { createClient } from '@/lib/supabase-server'

export async function DELETE(request: NextRequest) {
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
    
    // 也支持从body中获取路径列表进行批量删除
    const body = await request.json().catch(() => ({}))
    const paths = body.paths as string[]
    
    if (!path && (!paths || paths.length === 0)) {
      return NextResponse.json(
        { error: '未提供文件路径' },
        { status: 400 }
      )
    }

    // 创建服务端媒体服务实例
    const serverMediaService = createServerMediaService()

    if (path) {
      // 单个文件删除
      // 检查文件是否属于当前用户
      if (!path.startsWith(user.id + '/')) {
        return NextResponse.json(
          { error: '无权限删除该文件' },
          { status: 403 }
        )
      }

      const success = await serverMediaService.deleteMediaFile(path, bucket)
      
      if (!success) {
        return NextResponse.json(
          { error: '删除文件失败' },
          { status: 500 }
        )
      }
      
      return NextResponse.json({
        success: true,
        message: '文件删除成功'
      })
    } else {
      // 批量删除
      // 检查所有文件是否属于当前用户
      const invalidPaths = paths.filter(p => !p.startsWith(user.id + '/'))
      if (invalidPaths.length > 0) {
        return NextResponse.json(
          { error: '存在无权限删除的文件' },
          { status: 403 }
        )
      }

      const result = await serverMediaService.deleteMediaFiles(paths, bucket)
      
      return NextResponse.json({
        success: true,
        data: result
      })
    }
    
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '删除失败' },
      { status: 500 }
    )
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { UserService } from '@/lib/auth/user-service';

// GET - 获取用户套餐信息
export async function GET() {
  try {
    // 验证用户身份
    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    // 获取用户信息
    const userInfo = await UserService.getUserBySupabaseId(user.id);
    
    if (!userInfo) {
      return NextResponse.json(
        { error: 'User not found' }, 
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      plan: userInfo.plan,
      credits: userInfo.credits,
      success: true 
    });

  } catch (error) {
    console.error('Error getting user plan:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

// POST - 更新用户套餐
export async function POST(request: NextRequest) {
  try {
    // 验证用户身份
    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    // 获取用户信息
    const userInfo = await UserService.getUserBySupabaseId(user.id);
    
    if (!userInfo) {
      return NextResponse.json(
        { error: 'User not found' }, 
        { status: 404 }
      );
    }

    // 解析请求体
    const body = await request.json();
    const { plan } = body;

    // 验证套餐类型
    const validPlans = ['free', 'basic', 'pro', 'enterprise'];
    if (!plan || !validPlans.includes(plan)) {
      return NextResponse.json(
        { error: `Invalid plan. Must be one of: ${validPlans.join(', ')}` }, 
        { status: 400 }
      );
    }

    try {
      // 使用 UserService 的 updateUserPlan 方法
      const updatedUser = await UserService.updateUserPlan(userInfo.id, plan);

      return NextResponse.json({ 
        plan: updatedUser.plan,
        credits: updatedUser.credits,
        success: true 
      });
    } catch (serviceError: any) {
      return NextResponse.json(
        { error: serviceError.message }, 
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error updating user plan:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
} 
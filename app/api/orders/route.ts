import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { OrderService } from '@/lib/auth/order-service';

// GET - 获取用户订单
export async function GET(request: NextRequest) {
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

    // 获取用户订单
    const orders = await OrderService.getOrdersByUserId(user.id);

    return NextResponse.json({
      orders,
      success: true
    });

  } catch (error) {
    console.error('Error getting orders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - 创建新订单
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

    // 解析请求体
    const body = await request.json();
    const {
      price,
      product,
      payEmail,
      payName,
      payCurrency
    } = body;

    // 验证必填字段
    if (!product) {
      return NextResponse.json(
        { error: 'Product is required' },
        { status: 400 }
      );
    }

    // 创建订单数据
    const currentTime = new Date();
    const orderData = {
      userId: user.id,
      price: price || null,
      product,
      payEmail: payEmail || null,
      payName: payName || null,
      payCurrency: payCurrency || null,
      createDate: currentTime,
      updateDate: currentTime
    };

    // 创建订单
    const newOrder = await OrderService.createOrder(orderData);

    return NextResponse.json({
      order: newOrder,
      success: true
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
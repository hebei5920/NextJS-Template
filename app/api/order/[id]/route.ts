import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { OrderService } from '@/service/order-service';

// GET - 获取单个订单
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const orderId = parseInt(params.id);
    if (isNaN(orderId)) {
      return NextResponse.json(
        { error: 'Invalid order ID' },
        { status: 400 }
      );
    }

    // 获取订单
    const order = await OrderService.getOrderById(orderId);

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // 验证订单所有权
    if (order.userId !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      order,
      success: true
    });

  } catch (error) {
    console.error('Error getting order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - 更新订单
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const orderId = parseInt(params.id);
    if (isNaN(orderId)) {
      return NextResponse.json(
        { error: 'Invalid order ID' },
        { status: 400 }
      );
    }

    // 获取现有订单
    const existingOrder = await OrderService.getOrderById(orderId);

    if (!existingOrder) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // 验证订单所有权
    if (existingOrder.userId !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // 解析请求体
    const body = await request.json();
    const {
      price,
      product,
      payEmail,
      payName,
      payCurrency,
      status
    } = body;

    // 创建更新数据
    const updateData: any = {
      updateDate: new Date()
    };

    if (price !== undefined) updateData.price = price;
    if (product !== undefined) updateData.product = product;
    if (payEmail !== undefined) updateData.payEmail = payEmail;
    if (payName !== undefined) updateData.payName = payName;
    if (payCurrency !== undefined) updateData.payCurrency = payCurrency;
    if (status !== undefined) updateData.status = status;

    // 更新订单
    const updatedOrder = await OrderService.updateOrder(orderId, updateData);

    return NextResponse.json({
      order: updatedOrder,
      success: true
    });

  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - 删除订单
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const orderId = parseInt(params.id);
    if (isNaN(orderId)) {
      return NextResponse.json(
        { error: 'Invalid order ID' },
        { status: 400 }
      );
    }

    // 获取现有订单
    const existingOrder = await OrderService.getOrderById(orderId);

    if (!existingOrder) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // 验证订单所有权
    if (existingOrder.userId !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // 删除订单
    await OrderService.deleteOrder(orderId);

    return NextResponse.json({
      success: true,
      message: 'Order deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
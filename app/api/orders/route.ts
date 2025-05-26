import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { OrderService } from '@/lib/order-service';
import { UserService } from '@/lib/user-service';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-04-30.basil"
})

const PRODUCT_TOKEN_LIST = [
  { key: 'prod_SL2WEtUTGlLgST', value: 100 },
  { key: 'prod_SL2Wik94PZXSNa', value: 700 }
]



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


    const rawBody = await request.text()
    const signature = request.headers.get("stripe-signature") || ""

    const event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_KEY || ""
    )

    if (event.type === "checkout.session.completed") {
      const session = event.data.object
      const line_items = await stripe.checkout.sessions.listLineItems(session.id);
      const promises = line_items.data.map(async (ele) => {
        const pId = ele.price?.product as string
        let v = PRODUCT_TOKEN_LIST.find(i => i.key === pId)?.value || 0

        await OrderService.createOrder({
          userId: session.client_reference_id || user.id,
          price: session.amount_total || undefined,
          payEmail: session.customer_details?.email || undefined,
          payName: session.customer_details?.name || undefined,
          product: pId,
          payCurrency: session.currency || undefined,
          status: 'completed',
          createDate: new Date(),
          updateDate: new Date()
        })
        await UserService.addUserCredits(session.client_reference_id || user.id, v)

      });

      await Promise.all(promises);
      return NextResponse.json('success', { status: 200 })
    }


    return NextResponse.json('method not found', { status: 404 })

  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
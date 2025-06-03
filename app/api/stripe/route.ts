import Stripe from 'stripe'
import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase-server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "")

// 订阅计划的价格ID映射
const PRICE_IDS = {
    pro: {
        monthly: 'price_1RQMR0Psq011JgrIqqzrzjPR', // 替换为实际的Pro月度订阅价格ID
        annual: 'price_1RQMRLPsq011JgrImNCwJTre'   // 替换为实际的Pro年度订阅价格ID
    },
    enterprise: {
        monthly: 'price_enterprise_monthly', // 替换为实际的企业月度订阅价格ID
        annual: 'price_enterprise_annual'    // 替换为实际的企业年度订阅价格ID
    }
};

export const POST = async (req: NextRequest, res: NextResponse) => {

    // 验证用户身份
    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    }
    try {
        const { type, interval } = await req.json()

        // 获取对应计划的价格ID
        const priceId = PRICE_IDS[type as keyof typeof PRICE_IDS]?.[interval as 'monthly' | 'annual'];

        if (!priceId) {
            return NextResponse.json(
                { error: 'Invalid plan or interval' },
                { status: 400 }
            );
        }

        const params = {
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            client_reference_id: user.id,
            customer_email: user.email,
            success_url: `${req.headers.get('origin')}/stripe/success`,
            cancel_url: `${req.headers.get('origin')}/stripe/canceled`,
            metadata: {
                type,
                interval,
                userId: user.id
            }
        }


        // Create Checkout Sessions from body params.
        const session = await stripe.checkout.sessions.create(params as Stripe.Checkout.SessionCreateParams);

        return NextResponse.json(session, { status: 200 });
    } catch (err) {
        return NextResponse.json({ message: "Failed to checkout" }, { status: 500 });

    }

}
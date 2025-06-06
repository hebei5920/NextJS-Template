'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import {
    createOrderSimple,
    getOrdersByUserId,
    getOrderById,
    updateOrderStatus,
    cancelOrder,
    completeOrder,
} from '@/db/order'

import { Order } from '@prisma/client'

// Stripe setup for client-side
import { loadStripe } from '@stripe/stripe-js'
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '')


/**
 * 获取当前用户的订单列表
 */
export async function getUserOrders(
    page = 1,
    pageSize = 10
): Promise<{
    orders: Order[]
    total: number
    error: string | null
}> {
    try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return { orders: [], total: 0, error: 'Please login first' }
        }

        const result = await getOrdersByUserId(user.id, page, pageSize)
        return { ...result, error: null }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch orders'
        return { orders: [], total: 0, error: errorMessage }
    }
}

/**
 * 获取订单详情
 */
export async function getOrder(orderId: number): Promise<{
    order: Order | null
    error: string | null
}> {
    try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return { order: null, error: 'Please login first' }
        }

        const order = await getOrderById(orderId)

        // 检查订单是否属于当前用户
        if (order && order.userId !== user.id) {
            return { order: null, error: 'No permission to access this order' }
        }

        return { order, error: null }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch order details'
        return { order: null, error: errorMessage }
    }
}

/**
 * 创建订单（简化版）
 */
export async function createOrder(
    product: string,
    price?: number | null,
    payEmail?: string | null,
    payName?: string | null,
    payCurrency?: string | null,
    status: string = 'pending'
): Promise<{
    order: Order | null
    error: string | null
}> {
    try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return { order: null, error: 'Please login first' }
        }

        const order = await createOrderSimple(
            user.id,
            product,
            price,
            payEmail || user.email || null,
            payName || user.user_metadata?.full_name || null,
            payCurrency,
            status
        )

        revalidatePath('/') // 重新验证页面数据
        return { order, error: null }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to create order'
        return { order: null, error: errorMessage }
    }
}

/**
 * 更新订单状态
 */
export async function updateOrderState(
    orderId: number,
    status: string
): Promise<{
    order: Order | null
    error: string | null
}> {
    try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return { order: null, error: 'Please login first' }
        }

        // 先获取订单确保它属于当前用户
        const existingOrder = await getOrderById(orderId)

        if (!existingOrder) {
            return { order: null, error: 'Order does not exist' }
        }

        if (existingOrder.userId !== user.id) {
            return { order: null, error: 'No permission to operate this order' }
        }

        const updatedOrder = await updateOrderStatus(orderId, status)
        revalidatePath('/') // 重新验证页面数据
        return { order: updatedOrder, error: null }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to update order status'
        return { order: null, error: errorMessage }
    }
}

/**
 * 取消订单
 */
export async function cancelUserOrder(orderId: number): Promise<{
    order: Order | null
    error: string | null
}> {
    try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return { order: null, error: 'Please login first' }
        }

        // 先获取订单确保它属于当前用户
        const existingOrder = await getOrderById(orderId)

        if (!existingOrder) {
            return { order: null, error: 'Order does not exist' }
        }

        if (existingOrder.userId !== user.id) {
            return { order: null, error: 'No permission to operate this order' }
        }

        // 检查订单是否可以取消（只有待处理的订单可以取消）
        if (existingOrder.status !== 'pending') {
            return { order: null, error: 'Only pending orders can be cancelled' }
        }

        const updatedOrder = await cancelOrder(orderId)
        revalidatePath('/') // 重新验证页面数据
        return { order: updatedOrder, error: null }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to cancel order'
        return { order: null, error: errorMessage }
    }
}

/**
 * 创建Stripe结账会话
 */
export async function createCheckoutSession(
    type: 'basic' | 'pro'
): Promise<{
    sessionId: string | null
    error: string | null
}> {
    try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return { sessionId: null, error: 'Please login first' }
        }

        // 创建Stripe会话 - 按照 app/api/stripe/route.ts 的期望参数格式发送请求
        const response = await fetch('/api/stripe', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: user.id,
                type: type // 'basic' 或 'pro'
            }),
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(errorData.message || `Failed to create checkout session: ${response.status}`)
        }

        // 从响应中获取会话信息
        const session = await response.json()

        // 重定向到Stripe结账页面
        const stripe = await stripePromise
        if (!stripe) {
            throw new Error('Failed to load Stripe')
        }

        // 使用会话ID重定向到Stripe结账页面
        const { error } = await stripe.redirectToCheckout({
            sessionId: session.id
        })

        if (error) {
            throw error
        }

        return session.id
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to create checkout session'
        return { sessionId: null, error: errorMessage }
    }
}

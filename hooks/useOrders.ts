'use client'

import { useState } from 'react'
import { useAuth } from './useAuth'
import { createClient } from '@/lib/supabase-client'
import { Order, Prisma } from '@prisma/client'
import { 
  createOrderSimple, 
  getOrdersByUserId, 
  getOrderById, 
  updateOrderStatus, 
  cancelOrder, 
  completeOrder 
} from '@/db/order'

// Stripe setup for client-side
import { loadStripe } from '@stripe/stripe-js'
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '')

// Product token mappings from API
const PRODUCT_TOKEN_LIST = [
  { key: 'prod_SL2WEtUTGlLgST', value: 100 },
  { key: 'prod_SL2Wik94PZXSNa', value: 700 }
]

export interface OrdersState {
  orders: Order[]
  total: number
  page: number
  pageSize: number
  loading: boolean
  error: string | null
}

export function useOrders() {
  const { user } = useAuth()
  const [state, setState] = useState<OrdersState>({
    orders: [],
    total: 0,
    page: 1,
    pageSize: 10,
    loading: false,
    error: null
  })
  const supabase = createClient()

  /**
   * 获取当前用户的订单列表
   */
  const getUserOrders = async (page = 1, pageSize = 10): Promise<{orders: Order[], total: number} | null> => {
    if (!user) {
      setState(prev => ({ ...prev, error: '请先登录' }))
      return null
    }

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      // 直接调用数据库函数，不通过API
      const result = await getOrdersByUserId(user.id, page, pageSize)
      
      // 更新状态
      setState(prev => ({
        ...prev,
        orders: result.orders,
        total: result.total,
        page,
        pageSize,
        loading: false
      }))
      
      return result
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '获取订单失败'
      setState(prev => ({ ...prev, loading: false, error: errorMessage }))
      return null
    }
  }

  /**
   * 获取订单详情
   */
  const getOrder = async (orderId: number): Promise<Order | null> => {
    if (!user) {
      setState(prev => ({ ...prev, error: '请先登录' }))
      return null
    }

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const order = await getOrderById(orderId)
      
      // 检查订单是否属于当前用户
      if (order && order.userId !== user.id) {
        throw new Error('无权限访问该订单')
      }
      
      setState(prev => ({ ...prev, loading: false }))
      return order
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '获取订单详情失败'
      setState(prev => ({ ...prev, loading: false, error: errorMessage }))
      return null
    }
  }

  /**
   * 创建订单（简化版）
   */
  const createOrder = async (
    product: string,
    price?: number | null,
    payEmail?: string | null,
    payName?: string | null,
    payCurrency?: string | null,
    status: string = 'pending'
  ): Promise<Order | null> => {
    if (!user) {
      setState(prev => ({ ...prev, error: '请先登录' }))
      return null
    }

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      // 直接调用数据库函数，不通过API
      const order = await createOrderSimple(
        user.id, 
        product,
        price,
        payEmail || user.email || null,
        payName || user.user_metadata?.full_name || null,
        payCurrency,
        status
      )
      
      // 添加到本地状态
      setState(prev => ({
        ...prev,
        orders: [order, ...prev.orders],
        total: prev.total + 1,
        loading: false
      }))
      
      return order
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '创建订单失败'
      setState(prev => ({ ...prev, loading: false, error: errorMessage }))
      return null
    }
  }

  /**
   * 更新订单状态
   */
  const updateOrderState = async (orderId: number, status: string): Promise<Order | null> => {
    if (!user) {
      setState(prev => ({ ...prev, error: '请先登录' }))
      return null
    }

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      // 先获取订单确保它属于当前用户
      const existingOrder = await getOrderById(orderId)
      
      if (!existingOrder) {
        throw new Error('订单不存在')
      }
      
      if (existingOrder.userId !== user.id) {
        throw new Error('无权限操作该订单')
      }
      
      // 更新订单状态
      const updatedOrder = await updateOrderStatus(orderId, status)
      
      // 更新本地状态
      setState(prev => ({
        ...prev,
        orders: prev.orders.map(order => 
          order.id === orderId ? updatedOrder : order
        ),
        loading: false
      }))
      
      return updatedOrder
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '更新订单状态失败'
      setState(prev => ({ ...prev, loading: false, error: errorMessage }))
      return null
    }
  }

  /**
   * 取消订单
   */
  const cancelUserOrder = async (orderId: number): Promise<Order | null> => {
    if (!user) {
      setState(prev => ({ ...prev, error: '请先登录' }))
      return null
    }

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      // 先获取订单确保它属于当前用户
      const existingOrder = await getOrderById(orderId)
      
      if (!existingOrder) {
        throw new Error('订单不存在')
      }
      
      if (existingOrder.userId !== user.id) {
        throw new Error('无权限操作该订单')
      }
      
      // 检查订单是否可以取消（只有待处理的订单可以取消）
      if (existingOrder.status !== 'pending') {
        throw new Error('只有待处理的订单可以取消')
      }
      
      // 取消订单
      const updatedOrder = await cancelOrder(orderId)
      
      // 更新本地状态
      setState(prev => ({
        ...prev,
        orders: prev.orders.map(order => 
          order.id === orderId ? updatedOrder : order
        ),
        loading: false
      }))
      
      return updatedOrder
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '取消订单失败'
      setState(prev => ({ ...prev, loading: false, error: errorMessage }))
      return null
    }
  }

  /**
   * 创建Stripe结账会话
   * @param type 订阅类型，'basic' 或 'pro'
   */
  const createCheckoutSession = async (type: 'basic' | 'pro'): Promise<string | null> => {
    if (!user) {
      setState(prev => ({ ...prev, error: '请先登录' }))
      return null
    }

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
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
        throw new Error(errorData.message || `创建结账会话失败: ${response.status}`)
      }

      // 从响应中获取会话信息
      const session = await response.json()
      
      // 重定向到Stripe结账页面
      const stripe = await stripePromise
      if (!stripe) {
        throw new Error('Stripe加载失败')
      }
      
      // 使用会话ID重定向到Stripe结账页面
      const { error } = await stripe.redirectToCheckout({ 
        sessionId: session.id 
      })
      
      if (error) {
        throw error
      }
      
      setState(prev => ({ ...prev, loading: false }))
      return session.id
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '创建结账会话失败'
      setState(prev => ({ ...prev, loading: false, error: errorMessage }))
      return null
    }
  }

  return {
    ...state,
    getUserOrders,
    getOrder,
    createOrder,
    updateOrderState,
    cancelUserOrder,
    createCheckoutSession,
    refreshOrders: () => getUserOrders(state.page, state.pageSize),
    clearError: () => setState(prev => ({ ...prev, error: null }))
  }
}

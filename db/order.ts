import { prisma } from './index'
import { Prisma, Order } from '@prisma/client'
import { userValidation } from './user'

/**
 * 订单数据校验
 */
export const orderValidation = {
  /**
   * 验证订单状态
   */
  isValidStatus(status: string): boolean {
    return ['pending', 'completed', 'failed', 'cancelled'].includes(status)
  },

  /**
   * 验证价格
   */
  isValidPrice(price: number | null): boolean {
    return price === null || (!isNaN(price) && price >= 0)
  },

  /**
   * 验证商品名称
   */
  isValidProduct(product: string): boolean {
    return !!product && product.trim().length > 0
  },

  /**
   * 验证邮箱格式
   */
  isValidEmail(email: string | null): boolean {
    if (email === null) return true
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },

  /**
   * 验证货币代码
   */
  isValidCurrency(currency: string | null): boolean {
    if (currency === null) return true
    const currencyRegex = /^[A-Z]{3}$/
    return currencyRegex.test(currency)
  }
}

/**
 * 创建订单
 */
export async function createOrder(data: Prisma.OrderCreateInput): Promise<Order> {
  // 验证用户 ID
  if (!data.user?.connect?.supabaseId || !userValidation.isValidSupabaseId(data.user.connect.supabaseId)) {
    throw new Error('Invalid user ID')
  }

  // 验证商品名称
  if (!orderValidation.isValidProduct(data.product)) {
    throw new Error('Invalid product name')
  }

  // 验证价格
  if (!orderValidation.isValidPrice(data.price || null)) {
    throw new Error('Invalid price')
  }

  // 验证支付邮箱
  if (data.payEmail && !orderValidation.isValidEmail(data.payEmail)) {
    throw new Error('Invalid payment email')
  }

  // 验证货币
  if (data.payCurrency && !orderValidation.isValidCurrency(data.payCurrency)) {
    throw new Error('Invalid currency code')
  }

  // 验证状态
  if (data.status && !orderValidation.isValidStatus(data.status)) {
    throw new Error('Invalid order status')
  }

  try {
    return await prisma.order.create({
      data
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // 外键约束错误
      if (error.code === 'P2003') {
        throw new Error('User does not exist')
      }
    }
    
    throw error
  }
}

/**
 * 简化版创建订单（适用于API调用）
 */
export async function createOrderSimple(
  userId: string,
  product: string,
  price?: number | null,
  payEmail?: string | null,
  payName?: string | null,
  payCurrency?: string | null,
  status: string = 'pending'
): Promise<Order> {
  // 验证用户 ID
  if (!userValidation.isValidSupabaseId(userId)) {
    throw new Error('Invalid user ID')
  }

  // 验证商品名称
  if (!orderValidation.isValidProduct(product)) {
    throw new Error('Invalid product name')
  }

  // 验证价格
  if (price !== undefined && !orderValidation.isValidPrice(price)) {
    throw new Error('Invalid price')
  }

  // 验证支付邮箱
  if (payEmail && !orderValidation.isValidEmail(payEmail)) {
    throw new Error('Invalid payment email')
  }

  // 验证货币
  if (payCurrency && !orderValidation.isValidCurrency(payCurrency)) {
    throw new Error('Invalid currency code')
  }

  // 验证状态
  if (!orderValidation.isValidStatus(status)) {
    throw new Error('Invalid order status')
  }

  try {
    const currentTime = new Date()
    
    return await prisma.order.create({
      data: {
        userId,
        product,
        price: price || null,
        payEmail: payEmail || null,
        payName: payName || null,
        payCurrency: payCurrency || null,
        status,
        createDate: currentTime,
        updateDate: currentTime
      }
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // 外键约束错误
      if (error.code === 'P2003') {
        throw new Error('User does not exist')
      }
    }
    
    throw error
  }
}

/**
 * 通过 ID 获取订单
 */
export async function getOrderById(id: number): Promise<Order | null> {
  if (isNaN(id) || id <= 0) {
    throw new Error('Invalid order ID')
  }

  return prisma.order.findUnique({
    where: { id }
  })
}

/**
 * 获取用户的所有订单
 */
export async function getOrdersByUserId(userId: string, page = 1, pageSize = 10): Promise<{ orders: Order[]; total: number }> {
  // 验证用户 ID
  if (!userValidation.isValidSupabaseId(userId)) {
    throw new Error('Invalid user ID')
  }

  if (isNaN(page) || page < 1) {
    throw new Error('Page number must be a positive integer')
  }

  if (isNaN(pageSize) || pageSize < 1) {
    throw new Error('Items per page must be a positive integer')
  }

  const skip = (page - 1) * pageSize

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: { userId },
      skip,
      take: pageSize,
      orderBy: {
        createDate: 'desc'
      }
    }),
    prisma.order.count({
      where: { userId }
    })
  ])

  return {
    orders,
    total
  }
}

/**
 * 更新订单
 */
export async function updateOrder(id: number, data: Prisma.OrderUpdateInput): Promise<Order> {
  // 验证订单 ID
  if (isNaN(id) || id <= 0) {
    throw new Error('Invalid order ID')
  }

  // 验证商品名称
  if (data.product && typeof data.product === 'string' && !orderValidation.isValidProduct(data.product)) {
    throw new Error('Invalid product name')
  }

  // 验证价格
  if (data.price !== undefined && !orderValidation.isValidPrice(data.price as number | null)) {
    throw new Error('Invalid price')
  }

  // 验证支付邮箱
  if (data.payEmail !== undefined && !orderValidation.isValidEmail(data.payEmail as string | null)) {
    throw new Error('Invalid payment email')
  }

  // 验证货币
  if (data.payCurrency !== undefined && !orderValidation.isValidCurrency(data.payCurrency as string | null)) {
    throw new Error('Invalid currency code')
  }

  // 验证状态
  if (data.status && typeof data.status === 'string' && !orderValidation.isValidStatus(data.status)) {
    throw new Error('Invalid order status')
  }

  try {
    return await prisma.order.update({
      where: { id },
      data: {
        ...data,
        updateDate: new Date()
      }
    })
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        throw new Error('Order does not exist')
      }
      // 外键约束错误
      if (error.code === 'P2003') {
        throw new Error('User does not exist')
      }
    }
    
    throw error
  }
}

/**
 * 更新订单状态
 */
export async function updateOrderStatus(id: number, status: string): Promise<Order> {
  // 验证订单 ID
  if (isNaN(id) || id <= 0) {
    throw new Error('Invalid order ID')
  }

  // 验证状态
  if (!orderValidation.isValidStatus(status)) {
    throw new Error('Invalid order status')
  }

  try {
    return await prisma.order.update({
      where: { id },
      data: {
        status,
        updateDate: new Date()
      }
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        throw new Error('Order does not exist')
      }
    }
    
    throw error
  }
}

/**
 * 完成订单
 */
export async function completeOrder(id: number): Promise<Order> {
  return updateOrderStatus(id, 'completed')
}

/**
 * 取消订单
 */
export async function cancelOrder(id: number): Promise<Order> {
  return updateOrderStatus(id, 'cancelled')
}

/**
 * 标记订单为失败
 */
export async function failOrder(id: number): Promise<Order> {
  return updateOrderStatus(id, 'failed')
}

/**
 * 删除订单
 */
export async function deleteOrder(id: number): Promise<void> {
  // 验证订单 ID
  if (isNaN(id) || id <= 0) {
    throw new Error('Invalid order ID')
  }

  try {
    await prisma.order.delete({
      where: { id }
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        throw new Error('Order does not exist')
      }
    }
    
    throw error
  }
}

/**
 * 获取所有订单（分页）
 */
export async function getAllOrders(page = 1, pageSize = 20): Promise<{
  orders: Order[];
  total: number;
  page: number;
  totalPages: number;
}> {
  if (isNaN(page) || page < 1) {
    throw new Error('Page number must be a positive integer')
  }

  if (isNaN(pageSize) || pageSize < 1) {
    throw new Error('Items per page must be a positive integer')
  }

  const skip = (page - 1) * pageSize

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      skip,
      take: pageSize,
      orderBy: {
        createDate: 'desc'
      }
    }),
    prisma.order.count()
  ])

  return {
    orders,
    total,
    page,
    totalPages: Math.ceil(total / pageSize)
  }
}

/**
 * 根据状态获取订单
 */
export async function getOrdersByStatus(status: string, page = 1, pageSize = 20): Promise<{
  orders: Order[];
  total: number;
  page: number;
  totalPages: number;
}> {
  // 验证状态
  if (!orderValidation.isValidStatus(status)) {
    throw new Error('Invalid order status')
  }

  if (isNaN(page) || page < 1) {
    throw new Error('Page number must be a positive integer')
  }

  if (isNaN(pageSize) || pageSize < 1) {
    throw new Error('Items per page must be a positive integer')
  }

  const skip = (page - 1) * pageSize

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: { status },
      skip,
      take: pageSize,
      orderBy: {
        createDate: 'desc'
      }
    }),
    prisma.order.count({
      where: { status }
    })
  ])

  return {
    orders,
    total,
    page,
    totalPages: Math.ceil(total / pageSize)
  }
}

/**
 * 获取用户的订单统计
 */
export async function getUserOrderStats(userId: string): Promise<{
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  totalAmount: number;
}> {
  // 验证用户 ID
  if (!userValidation.isValidSupabaseId(userId)) {
    throw new Error('Invalid user ID')
  }

  try {
    const [totalOrders, completedOrders, pendingOrders, totalAmountResult] = await Promise.all([
      prisma.order.count({ 
        where: { userId } 
      }),
      prisma.order.count({ 
        where: { 
          userId, 
          status: 'completed' 
        } 
      }),
      prisma.order.count({ 
        where: { 
          userId, 
          status: 'pending' 
        } 
      }),
      prisma.order.aggregate({
        where: { 
          userId, 
          status: 'completed',
          price: { not: null }
        },
        _sum: { 
          price: true 
        }
      })
    ])

    return {
      totalOrders,
      completedOrders,
      pendingOrders,
      totalAmount: totalAmountResult._sum.price || 0
    }
  } catch (error) {
    console.error('Error getting user order stats:', error)
    throw new Error('Failed to get user order statistics')
  }
}

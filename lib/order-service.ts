import { PrismaClient } from '@prisma/client';
import { DatabaseOrder, CreateOrderData, UpdateOrderData } from '@/types/auth';

// 如果没有全局 Prisma 实例，创建一个
declare global {
    var __prisma: PrismaClient | undefined;
}

const prisma = globalThis.__prisma || new PrismaClient();

if (process.env.NODE_ENV === 'development') {
    globalThis.__prisma = prisma;
}

/**
 * 订单服务 - 处理订单创建、查询和更新
 */
export class OrderService {

    /**
     * 创建新订单
     */
    static async createOrder(orderData: CreateOrderData): Promise<DatabaseOrder> {
        try {
            const currentTime = new Date();

            const newOrder = await prisma.order.create({
                data: {
                    userId: orderData.userId,
                    price: orderData.price || null,
                    product: orderData.product,
                    payEmail: orderData.payEmail || null,
                    payName: orderData.payName || null,
                    payCurrency: orderData.payCurrency || null,
                    status: orderData.status || 'pending',
                    createDate: orderData.createDate || currentTime,
                    updateDate: orderData.updateDate || currentTime
                }
            });

            return newOrder;
        } catch (error) {
            console.error('Error creating order:', error);
            throw new Error('创建订单失败');
        }
    }

    /**
     * 通过 ID 获取订单
     */
    static async getOrderById(id: number): Promise<DatabaseOrder | null> {
        try {
            return await prisma.order.findUnique({
                where: { id }
            });
        } catch (error) {
            console.error('Error getting order by ID:', error);
            throw new Error('获取订单失败');
        }
    }

    /**
     * 获取用户的所有订单
     */
    static async getOrdersByUserId(userId: string): Promise<DatabaseOrder[]> {
        try {
            return await prisma.order.findMany({
                where: { userId },
                orderBy: { createDate: 'desc' }
            });
        } catch (error) {
            console.error('Error getting orders by user ID:', error);
            throw new Error('获取用户订单失败');
        }
    }

    /**
     * 更新订单
     */
    static async updateOrder(id: number, updateData: UpdateOrderData): Promise<DatabaseOrder> {
        try {
            const updatedOrder = await prisma.order.update({
                where: { id },
                data: {
                    ...updateData,
                    updateDate: updateData.updateDate || new Date()
                }
            });

            return updatedOrder;
        } catch (error) {
            console.error('Error updating order:', error);
            throw new Error('更新订单失败');
        }
    }

    /**
     * 更新订单状态
     */
    static async updateOrderStatus(id: number, status: string): Promise<DatabaseOrder> {
        try {
            const updatedOrder = await prisma.order.update({
                where: { id },
                data: {
                    status,
                    updateDate: new Date()
                }
            });

            return updatedOrder;
        } catch (error) {
            console.error('Error updating order status:', error);
            throw new Error('更新订单状态失败');
        }
    }

    /**
     * 完成订单（设置状态为已完成）
     */
    static async completeOrder(id: number): Promise<DatabaseOrder> {
        return await this.updateOrderStatus(id, 'completed');
    }

    /**
     * 取消订单
     */
    static async cancelOrder(id: number): Promise<DatabaseOrder> {
        return await this.updateOrderStatus(id, 'cancelled');
    }

    /**
     * 标记订单为失败
     */
    static async failOrder(id: number): Promise<DatabaseOrder> {
        return await this.updateOrderStatus(id, 'failed');
    }

    /**
     * 删除订单
     */
    static async deleteOrder(id: number): Promise<void> {
        try {
            await prisma.order.delete({
                where: { id }
            });
        } catch (error) {
            console.error('Error deleting order:', error);
            throw new Error('删除订单失败');
        }
    }

    /**
     * 获取所有订单（分页）
     */
    static async getAllOrders(page: number = 1, limit: number = 20): Promise<{
        orders: DatabaseOrder[];
        total: number;
        page: number;
        totalPages: number;
    }> {
        try {
            const skip = (page - 1) * limit;

            const [orders, total] = await Promise.all([
                prisma.order.findMany({
                    skip,
                    take: limit,
                    orderBy: { createDate: 'desc' }
                }),
                prisma.order.count()
            ]);

            return {
                orders,
                total,
                page,
                totalPages: Math.ceil(total / limit)
            };
        } catch (error) {
            console.error('Error getting all orders:', error);
            throw new Error('获取订单列表失败');
        }
    }

    /**
     * 根据状态获取订单
     */
    static async getOrdersByStatus(status: string): Promise<DatabaseOrder[]> {
        try {
            return await prisma.order.findMany({
                where: { status },
                orderBy: { createDate: 'desc' }
            });
        } catch (error) {
            console.error('Error getting orders by status:', error);
            throw new Error('获取订单失败');
        }
    }

    /**
     * 获取用户的订单统计
     */
    static async getUserOrderStats(userId: string): Promise<{
        totalOrders: number;
        completedOrders: number;
        pendingOrders: number;
        totalAmount: number;
    }> {
        try {
            const [totalOrders, completedOrders, pendingOrders, totalAmountResult] = await Promise.all([
                prisma.order.count({ where: { userId } }),
                prisma.order.count({ where: { userId, status: 'completed' } }),
                prisma.order.count({ where: { userId, status: 'pending' } }),
                prisma.order.aggregate({
                    where: { userId, status: 'completed' },
                    _sum: { price: true }
                })
            ]);

            return {
                totalOrders,
                completedOrders,
                pendingOrders,
                totalAmount: totalAmountResult._sum.price || 0
            };
        } catch (error) {
            console.error('Error getting user order stats:', error);
            throw new Error('获取用户订单统计失败');
        }
    }
} 
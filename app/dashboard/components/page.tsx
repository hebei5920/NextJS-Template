'use client';

import { useState, useEffect } from 'react';

interface UserBalanceData {
  credits: number;
  plan: string;
  success: boolean;
}

interface Order {
  id: number;
  product: string;
  price: number | null;
  status: string;
  createDate: string;
  updateDate: string;
}

export default function UserBalance() {
  const [balance, setBalance] = useState<UserBalanceData | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 获取用户余额信息
  const fetchBalance = async () => {
    try {
      const response = await fetch('/api/user/credits');
      const data = await response.json();
      
      if (data.success) {
        setBalance(data);
      } else {
        setError(data.error || '获取余额失败');
      }
    } catch (err) {
      setError('网络错误');
      console.error('Error fetching balance:', err);
    }
  };

  // 获取用户订单
  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      const data = await response.json();
      
      if (data.success) {
        setOrders(data.orders);
      } else {
        setError(data.error || '获取订单失败');
      }
    } catch (err) {
      setError('网络错误');
      console.error('Error fetching orders:', err);
    }
  };

  // 创建测试订单
  const createTestOrder = async () => {
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product: '测试产品',
          price: 99.99,
          payEmail: 'test@example.com',
          payCurrency: 'USD'
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        await fetchOrders(); // 刷新订单列表
      } else {
        setError(data.error || '创建订单失败');
      }
    } catch (err) {
      setError('网络错误');
      console.error('Error creating order:', err);
    }
  };

  // 更新积分
  const updateCredits = async (action: 'add' | 'deduct', amount: number) => {
    try {
      const response = await fetch('/api/user/credits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, amount }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setBalance(prev => prev ? { ...prev, credits: data.credits } : null);
      } else {
        setError(data.error || '更新积分失败');
      }
    } catch (err) {
      setError('网络错误');
      console.error('Error updating credits:', err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchBalance(), fetchOrders()]);
      setLoading(false);
    };
    
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">错误: {error}</p>
          <button 
            onClick={() => {
              setError(null);
              window.location.reload();
            }}
            className="mt-2 text-red-600 underline"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* 用户余额和套餐信息 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">账户信息</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-700">当前余额</h3>
            <p className="text-3xl font-bold text-blue-900">{balance?.credits || 0} 积分</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-green-700">当前套餐</h3>
            <p className="text-2xl font-bold text-green-900 capitalize">{balance?.plan || 'free'}</p>
          </div>
        </div>
        
        {/* 积分操作 */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3">积分操作</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => updateCredits('add', 100)}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              增加 100 积分
            </button>
            <button
              onClick={() => updateCredits('deduct', 50)}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              扣减 50 积分
            </button>
          </div>
        </div>
      </div>

      {/* 订单管理 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">我的订单</h2>
          <button
            onClick={createTestOrder}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            创建测试订单
          </button>
        </div>
        
        {orders.length === 0 ? (
          <p className="text-gray-500 text-center py-8">暂无订单</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left">订单ID</th>
                  <th className="px-4 py-2 text-left">产品</th>
                  <th className="px-4 py-2 text-left">价格</th>
                  <th className="px-4 py-2 text-left">状态</th>
                  <th className="px-4 py-2 text-left">创建时间</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-t">
                    <td className="px-4 py-2">#{order.id}</td>
                    <td className="px-4 py-2">{order.product}</td>
                    <td className="px-4 py-2">
                      {order.price ? `$${order.price}` : '免费'}
                    </td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded text-sm ${
                        order.status === 'completed' ? 'bg-green-100 text-green-800' :
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'failed' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      {new Date(order.createDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 
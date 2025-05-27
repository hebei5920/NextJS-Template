'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { XCircle, RefreshCw, ArrowLeft, HelpCircle, CreditCard } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function PaymentCanceledPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [reason, setReason] = useState<string>('用户取消');

  useEffect(() => {
    // 检查取消原因
    const error = searchParams.get('error');
    const error_description = searchParams.get('error_description');
    
    if (error) {
      switch (error) {
        case 'payment_intent_payment_failed':
          setReason('支付失败');
          break;
        case 'card_declined':
          setReason('银行卡被拒绝');
          break;
        case 'insufficient_funds':
          setReason('余额不足');
          break;
        default:
          setReason(error_description || '支付过程中出现问题');
      }
    }
  }, [searchParams]);

  const retryPayment = () => {
    router.push('/pricing');
  };

  const goHome = () => {
    router.push('/');
  };

  const contactSupport = () => {
    // 可以跳转到客服页面或打开客服聊天
    window.open('mailto:support@example.com?subject=支付问题咨询', '_blank');
  };

  const goToPricing = () => {
    router.push('/pricing');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          {/* 取消图标 */}
          <div className="mb-8">
            <div className="w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
            </div>
            
            {/* 失败动画效果 */}
            <div className="flex justify-center space-x-1 mb-6">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-red-500 rounded-full animate-pulse"
                  style={{ animationDelay: `${i * 0.3}s` }}
                />
              ))}
            </div>
          </div>

          {/* 主标题 */}
          <h1 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              支付未完成
            </span>
          </h1>

          <p className="text-xl text-muted-foreground mb-8">
            很抱歉，您的支付过程被中断或失败了
          </p>

          {/* 错误信息 */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-red-200 dark:border-red-800 mb-8">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-red-600" />
              问题详情
            </h3>
            
            <div className="space-y-3 text-left">
              {user && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">用户:</span>
                  <span className="font-medium">{user.email}</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">时间:</span>
                <span>{new Date().toLocaleString('zh-CN')}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">原因:</span>
                <span className="text-red-600 font-medium">{reason}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">状态:</span>
                <span className="text-red-600 font-medium">✗ 未完成</span>
              </div>
            </div>
          </div>

          {/* 解决方案 */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800 mb-8">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-4">
              💡 可能的解决方案
            </h4>
            <ul className="text-blue-800 dark:text-blue-200 text-sm space-y-2 text-left">
              <li>• 检查您的银行卡信息是否正确</li>
              <li>• 确保您的银行卡有足够的余额</li>
              <li>• 尝试使用其他支付方式</li>
              <li>• 联系您的银行确认国际支付是否被限制</li>
              <li>• 如果问题持续，请联系我们的客服团队</li>
            </ul>
          </div>

          {/* 行动按钮 */}
          <div className="space-y-4 mb-8">
            <h3 className="text-lg font-semibold mb-4">您可以尝试：</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={retryPayment}
                className="btn-primary flex items-center justify-center gap-2 py-3"
              >
                <RefreshCw className="w-5 h-5" />
                重新支付
              </button>
              
              <button
                onClick={contactSupport}
                className="btn-secondary flex items-center justify-center gap-2 py-3"
              >
                <HelpCircle className="w-5 h-5" />
                联系客服
              </button>
            </div>
          </div>

          {/* 常见问题 */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-6 border border-yellow-200 dark:border-yellow-800 mb-8">
            <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-4">
              🤔 常见支付问题
            </h4>
            <div className="space-y-3 text-yellow-800 dark:text-yellow-200 text-sm text-left">
              <details className="group">
                <summary className="cursor-pointer hover:text-yellow-600 dark:hover:text-yellow-300">
                  银行卡被拒绝怎么办？
                </summary>
                <p className="mt-2 pl-4 border-l-2 border-yellow-300 dark:border-yellow-600">
                  请确认卡号、有效期、CVV码正确，并联系您的银行确认是否开通了国际支付功能。
                </p>
              </details>
              
              <details className="group">
                <summary className="cursor-pointer hover:text-yellow-600 dark:hover:text-yellow-300">
                  支付页面显示错误？
                </summary>
                <p className="mt-2 pl-4 border-l-2 border-yellow-300 dark:border-yellow-600">
                  请尝试清空浏览器缓存，关闭广告拦截器，或使用其他浏览器重试。
                </p>
              </details>
              
              <details className="group">
                <summary className="cursor-pointer hover:text-yellow-600 dark:hover:text-yellow-300">
                  如何联系客服？
                </summary>
                <p className="mt-2 pl-4 border-l-2 border-yellow-300 dark:border-yellow-600">
                  您可以发送邮件到 support@example.com 或使用页面右下角的在线客服。
                </p>
              </details>
            </div>
          </div>

          {/* 导航按钮 */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={goHome}
              className="btn-secondary flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              返回首页
            </button>
            
            <button
              onClick={goToPricing}
              className="btn-secondary flex items-center gap-2"
            >
              <CreditCard className="w-4 h-4" />
              查看套餐
            </button>
          </div>

          {/* 联系信息 */}
          <div className="mt-12 text-center text-sm text-muted-foreground">
            <p>需要帮助？请联系客服：support@example.com</p>
            <p className="mt-1">工作时间：周一至周五 9:00-18:00</p>
            <p className="mt-2 text-xs">
              如果您的银行卡已被扣款但订单未成功，请保留银行流水记录并联系客服处理。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 
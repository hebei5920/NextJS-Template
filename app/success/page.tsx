'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, Sparkles, ArrowRight, Download, Mail } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/providers/language-provider';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 获取Stripe session ID
    const session_id = searchParams.get('session_id');
    setSessionId(session_id);

    // 验证支付状态
    if (session_id) {
      verifyPaymentStatus(session_id);
    } else {
      setIsLoading(false);
    }
  }, [searchParams]);

  const verifyPaymentStatus = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/stripe/verify?session_id=${sessionId}`);
      const result = await response.json();

      if (result.success && result.data.success) {
        console.log('Payment verified:', result.data);
        // 支付验证成功
      } else {
        console.warn('Payment verification failed:', result);
        // 可以显示警告或重定向到失败页面
      }
    } catch (error) {
      console.error('Failed to verify payment:', error);
      // 验证失败，但不影响用户体验
    } finally {
      setIsLoading(false);
    }
  };


  const goToVoiceCloning = () => {
    router.push('/');
  };

  const goHome = () => {
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('success.verifying_payment')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          {/* 成功图标 */}
          <div className="mb-8">
            <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
            </div>

            {/* 成功动画效果 */}
            <div className="flex justify-center space-x-1 mb-6">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-green-500 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          </div>

          {/* 主标题 */}
          <h1 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              {t('success.title')}
            </span>
          </h1>

          <p className="text-xl text-muted-foreground mb-8">
            {t('success.subtitle')}
          </p>

          {/* 订单信息 */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-green-200 dark:border-green-800 mb-8">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-green-600" />
              {t('success.order_details')}
            </h3>

            <div className="space-y-3 text-left">
              {user && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('common.user')}:</span>
                  <span className="font-medium">{user.email}</span>
                </div>
              )}

              {sessionId && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('success.payment_id')}:</span>
                  <span className="font-mono text-sm">{sessionId.slice(0, 20)}...</span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('success.payment_time')}:</span>
                <span>{new Date().toLocaleString('zh-CN')}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('success.payment_status')}:</span>
                <span className="text-green-600 font-medium">{t('success.completed')}</span>
              </div>
            </div>
          </div>

          {/* 下一步行动 */}
          <div className="space-y-4 mb-8">
            <h3 className="text-lg font-semibold mb-4">{t('success.next_steps')}</h3>

            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              <button
                onClick={goToVoiceCloning}
                className="btn-primary flex items-center justify-center gap-2 py-3"
              >
                <Sparkles className="w-5 h-5" />
                {t('success.start_voice_cloning')}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 服务说明 */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800 mb-8">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
              {t('success.welcome_premium')}
            </h4>
            <ul className="text-blue-800 dark:text-blue-200 text-sm space-y-2 text-left">
              <li>• {t('success.premium_benefits.account_upgraded')}</li>
              <li>• {t('success.premium_benefits.email_confirmation')}</li>
              <li>• {t('success.premium_benefits.contact_support')}</li>
              <li>• {t('success.premium_benefits.manage_subscription')}</li>
            </ul>
          </div>
 

          {/* 联系信息 */}
          <div className="mt-12 text-center text-sm text-muted-foreground">
            <p>{t('success.support_email')}</p>
            <p className="mt-1">{t('common.working_hours')}</p>
          </div>
        </div>
      </div>
    </div>
  );
} 
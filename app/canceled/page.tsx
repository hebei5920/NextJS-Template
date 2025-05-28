'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { XCircle, RefreshCw, ArrowLeft, HelpCircle, CreditCard } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/providers/language-provider';

export default function PaymentCanceledPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [reason, setReason] = useState<string>('');

  useEffect(() => {
    // 设置默认原因
    setReason(t('canceled.payment_reasons.user_canceled'));
    
    // 检查取消原因
    const error = searchParams.get('error');
    const error_description = searchParams.get('error_description');
    
    if (error) {
      switch (error) {
        case 'payment_intent_payment_failed':
          setReason(t('canceled.payment_reasons.payment_failed'));
          break;
        case 'card_declined':
          setReason(t('canceled.payment_reasons.card_declined'));
          break;
        case 'insufficient_funds':
          setReason(t('canceled.payment_reasons.insufficient_funds'));
          break;
        default:
          setReason(error_description || t('canceled.payment_reasons.payment_error'));
      }
    }
  }, [searchParams, t]);

  const retryPayment = () => {
    router.push('/pricing');
  };

  const goHome = () => {
    router.push('/');
  };

  const contactSupport = () => {
    // 可以跳转到客服页面或打开客服聊天
    window.open(`mailto:support@example.com?subject=${encodeURIComponent(t('canceled.contact_subject'))}`, '_blank');
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
              {t('canceled.title')}
            </span>
          </h1>

          <p className="text-xl text-muted-foreground mb-8">
            {t('canceled.subtitle')}
          </p>

          {/* 错误信息 */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-red-200 dark:border-red-800 mb-8">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-red-600" />
              {t('canceled.problem_details')}
            </h3>
            
            <div className="space-y-3 text-left">
              {user && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('common.user')}:</span>
                  <span className="font-medium">{user.email}</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('common.time')}:</span>
                <span>{new Date().toLocaleString('zh-CN')}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('common.reason')}:</span>
                <span className="text-red-600 font-medium">{reason}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('common.status')}:</span>
                <span className="text-red-600 font-medium">{t('canceled.not_completed')}</span>
              </div>
            </div>
          </div>

          {/* 解决方案 */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800 mb-8">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-4">
              {t('canceled.solutions_title')}
            </h4>
            <ul className="text-blue-800 dark:text-blue-200 text-sm space-y-2 text-left">
              <li>• {t('canceled.solutions.check_card_info')}</li>
              <li>• {t('canceled.solutions.check_balance')}</li>
              <li>• {t('canceled.solutions.try_other_payment')}</li>
              <li>• {t('canceled.solutions.contact_bank')}</li>
              <li>• {t('canceled.solutions.contact_support')}</li>
            </ul>
          </div>

          {/* 行动按钮 */}
          <div className="space-y-4 mb-8">
            <h3 className="text-lg font-semibold mb-4">{t('canceled.you_can_try')}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={retryPayment}
                className="btn-primary flex items-center justify-center gap-2 py-3"
              >
                <RefreshCw className="w-5 h-5" />
                {t('canceled.retry_payment')}
              </button>
              
              <button
                onClick={contactSupport}
                className="btn-secondary flex items-center justify-center gap-2 py-3"
              >
                <HelpCircle className="w-5 h-5" />
                {t('common.contact_support')}
              </button>
            </div>
          </div>

          {/* 常见问题 */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-6 border border-yellow-200 dark:border-yellow-800 mb-8">
            <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-4">
              {t('canceled.common_issues')}
            </h4>
            <div className="space-y-3 text-yellow-800 dark:text-yellow-200 text-sm text-left">
              <details className="group">
                <summary className="cursor-pointer hover:text-yellow-600 dark:hover:text-yellow-300">
                  {t('canceled.faq.card_declined.question')}
                </summary>
                <p className="mt-2 pl-4 border-l-2 border-yellow-300 dark:border-yellow-600">
                  {t('canceled.faq.card_declined.answer')}
                </p>
              </details>
              
              <details className="group">
                <summary className="cursor-pointer hover:text-yellow-600 dark:hover:text-yellow-300">
                  {t('canceled.faq.payment_error.question')}
                </summary>
                <p className="mt-2 pl-4 border-l-2 border-yellow-300 dark:border-yellow-600">
                  {t('canceled.faq.payment_error.answer')}
                </p>
              </details>
              
              <details className="group">
                <summary className="cursor-pointer hover:text-yellow-600 dark:hover:text-yellow-300">
                  {t('canceled.faq.contact_support.question')}
                </summary>
                <p className="mt-2 pl-4 border-l-2 border-yellow-300 dark:border-yellow-600">
                  {t('canceled.faq.contact_support.answer')}
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
              {t('common.back_to_home')}
            </button>
            
            <button
              onClick={goToPricing}
              className="btn-secondary flex items-center gap-2"
            >
              <CreditCard className="w-4 h-4" />
              {t('canceled.view_plans')}
            </button>
          </div>

          {/* 联系信息 */}
          <div className="mt-12 text-center text-sm text-muted-foreground">
            <p>{t('canceled.support_notice')}</p>
            <p className="mt-1">{t('common.working_hours')}</p>
            <p className="mt-2 text-xs">
              {t('canceled.refund_notice')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 
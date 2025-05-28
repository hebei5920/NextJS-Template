'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Star, Zap, Crown, Sparkles } from 'lucide-react';
import { useTranslation } from '@/providers/language-provider';
import { useAuth } from '@/hooks/useAuth';
import getStripe from '@/lib/stripe';

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: {
    monthly: number;
    yearly: number;
  };
  features: string[];
  limitations: string[];
  popular?: boolean;
  icon: React.ReactNode;
  color: string;
}

export function PricingPlans() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const isAuthenticated = !!user && !loading;

  // 获取本地化的定价方案数据
  const getPricingPlans = (): PricingPlan[] => [
    {
      id: 'free',
      name: t('components.pricing.plans.free.name'),
      description: t('components.pricing.plans.free.description'),
      price: {
        monthly: 0,
        yearly: 0,
      },
      features: [
        t('components.pricing.plans.free.features.clones'),
        t('components.pricing.plans.free.features.duration'),
        t('components.pricing.plans.free.features.quality'),
        t('components.pricing.plans.free.features.speed'),
      ],
      limitations: [
        t('components.pricing.plans.free.limitations.watermark'),
        t('components.pricing.plans.free.limitations.commercial'),
      ],
      icon: <Sparkles className="h-6 w-6" />,
      color: 'text-gray-600',
    },
    {
      id: 'pro',
      name: t('components.pricing.plans.pro.name'),
      description: t('components.pricing.plans.pro.description'),
      price: {
        monthly: 29,
        yearly: 290,
      },
      features: [
        t('components.pricing.plans.pro.features.clones'),
        t('components.pricing.plans.pro.features.duration'),
        t('components.pricing.plans.pro.features.quality'),
        t('components.pricing.plans.pro.features.speed'),
        t('components.pricing.plans.pro.features.watermark'),
        t('components.pricing.plans.pro.features.voices'),
        t('components.pricing.plans.pro.features.batch'),
      ],
      limitations: [],
      popular: true,
      icon: <Zap className="h-6 w-6" />,
      color: 'text-blue-600',
    },
    {
      id: 'enterprise',
      name: t('components.pricing.plans.enterprise.name'),
      description: t('components.pricing.plans.enterprise.description'),
      price: {
        monthly: 99,
        yearly: 990,
      },
      features: [
        t('components.pricing.plans.enterprise.features.clones'),
        t('components.pricing.plans.enterprise.features.duration'),
        t('components.pricing.plans.enterprise.features.quality'),
        t('components.pricing.plans.enterprise.features.speed'),
        t('components.pricing.plans.enterprise.features.custom'),
        t('components.pricing.plans.enterprise.features.api'),
        t('components.pricing.plans.enterprise.features.team'),
        t('components.pricing.plans.enterprise.features.support'),
        t('components.pricing.plans.enterprise.features.license'),
      ],
      limitations: [],
      icon: <Crown className="h-6 w-6" />,
      color: 'text-purple-600',
    },
  ];

  // 简单的toast通知函数
  const showToast = (title: string, description: string, variant: 'default' | 'destructive' = 'default') => {
    // 使用浏览器原生通知或者简单的alert
    if (variant === 'destructive') {
      alert(`${t('common.error')}: ${title}\n${description}`);
    } else {
      alert(`${title}\n${description}`);
    }
  };

  // 处理套餐订阅
  const handleSubscription = async (type: string) => {
    if (!isAuthenticated) {
 
      router.push('/login');
      return;
    }

    let userId = user?.id;
    if (!userId) {
      // 额外检查，确保用户ID存在
      router.push('/api/auth/signin');
      return;
    }

    if (type === 'free') {
      showToast(
        t('components.pricing.freeUser'),
        t('components.pricing.freeUserDesc')
      );
      return;
    }

    try {
      setIsLoading(true);
      setSelectedPlan(type);

      const stripe = await getStripe();
      const response = await fetch("/api/stripe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
          userId, 
          type,
          billingCycle 
        })
      });

      if (response.status === 500) {
        showToast(
          t('components.pricing.serverError'),
          t('components.pricing.serverErrorDesc'),
          'destructive'
        );
        return;
      }

      const data = await response.json();
      const result = await stripe?.redirectToCheckout({ sessionId: data.id });

      if (result?.error) {
        console.log(result.error.message);
        showToast(
          t('components.pricing.paymentError'),
          result.error.message || t('components.pricing.paymentErrorDesc'),
          'destructive'
        );
      }
    } catch (error) {
      console.error('Subscription error:', error);
      showToast(
        t('components.pricing.subscriptionFailed'),
        t('components.pricing.subscriptionFailedDesc'),
        'destructive'
      );
    } finally {
      setIsLoading(false);
      setSelectedPlan(null);
    }
  };

  const formatPrice = (price: number) => {
    return price === 0 ? t('components.pricing.free') : `¥${price}`;
  };

  const calculateYearlySavings = (monthly: number, yearly: number) => {
    if (monthly === 0) return 0;
    const monthlyCost = monthly * 12;
    const savings = monthlyCost - yearly;
    const percentage = Math.round((savings / monthlyCost) * 100);
    return percentage;
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-12">
      {/* 标题部分 */}
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-4">
          {t('components.pricing.title')}
          <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            {t('components.pricing.titleHighlight')}
          </span>
        </h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          {t('components.pricing.description')}
        </p>
      </div>

      {/* 计费周期切换 */}
      <div className="flex justify-center mb-12">
        <div className="bg-muted p-1 rounded-lg flex">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
              billingCycle === 'monthly'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t('components.pricing.monthly')}
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all relative ${
              billingCycle === 'yearly'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t('components.pricing.yearly')}
            <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
              {t('components.pricing.yearlySave')}
            </span>
          </button>
        </div>
      </div>

      {/* 定价卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {getPricingPlans().map((plan) => {
          const price = plan.price[billingCycle];
          const savings = calculateYearlySavings(plan.price.monthly, plan.price.yearly);
          
          return (
            <div
              key={plan.id}
              className={`pricing-card ${plan.popular ? 'featured' : ''} relative p-8 rounded-xl border bg-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col h-full`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <Star className="h-4 w-4" />
                    {t('components.pricing.popular')}
                  </div>
                </div>
              )}

              {/* 计划头部 */}
              <div className="text-center mb-6">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 ${plan.color} mb-4`}>
                  {plan.icon}
                </div>
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-muted-foreground">{plan.description}</p>
              </div>

              {/* 价格 */}
              <div className="text-center mb-8">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold">{formatPrice(price)}</span>
                  {price > 0 && (
                    <span className="text-muted-foreground">
                      /{billingCycle === 'monthly' ? t('components.pricing.perMonth') : t('components.pricing.perYear')}
                    </span>
                  )}
                </div>
                {billingCycle === 'yearly' && savings > 0 && (
                  <div className="text-green-600 text-sm mt-2">
                    {t('components.pricing.savePercent').replace('{percent}', savings.toString())}
                  </div>
                )}
              </div>

              {/* 功能列表 - 增加 flex-grow 让这部分自动填充空间 */}
              <div className="space-y-4 mb-8 flex-grow">
                <div>
                  <h4 className="font-semibold mb-3 text-green-600">{t('components.pricing.includedFeatures')}</h4>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {plan.limitations.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3 text-amber-600">{t('components.pricing.limitations')}</h4>
                    <ul className="space-y-2">
                      {plan.limitations.map((limitation, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <div className="h-4 w-4 rounded-full bg-amber-200 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">{limitation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* 订阅按钮 - 固定在底部 */}
              <div className="mt-auto">
                <button
                  onClick={() => handleSubscription(plan.id)}
                  disabled={isLoading || loading}
                  className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                    plan.popular
                      ? 'btn-primary'
                      : 'btn-secondary hover:bg-primary hover:text-primary-foreground'
                  }`}
                >
                  {isLoading && selectedPlan === plan.id ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      {t('components.pricing.processing')}
                    </>
                  ) : loading ? (
                    t('components.pricing.loading')
                  ) : !isAuthenticated ? (
                    plan.id === 'free' ? t('components.pricing.startFree') : t('components.pricing.loginToSubscribe')
                  ) : (
                    plan.id === 'free' ? t('components.pricing.startFree') : t('components.pricing.subscribe')
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 底部说明 */}
      <div className="text-center mt-12 space-y-4">
        <p className="text-muted-foreground">
          {t('components.pricing.trialNote')}
        </p>
        <div className="flex justify-center gap-8 text-sm text-muted-foreground">
          <span>{t('components.pricing.features.securePayment')}</span>
          <span>{t('components.pricing.features.instantActivation')}</span>
          <span>{t('components.pricing.features.support247')}</span>
        </div>
      </div>
    </div>
  );
} 
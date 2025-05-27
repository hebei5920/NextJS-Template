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

const pricingPlans: PricingPlan[] = [
  {
    id: 'free',
    name: '免费版',
    description: '体验基础语音克隆功能',
    price: {
      monthly: 0,
      yearly: 0,
    },
    features: [
      '每月 3 次语音克隆',
      '最长 30 秒音频',
      '基础音质',
      '标准处理速度',
    ],
    limitations: [
      '有水印',
      '不支持商业使用',
    ],
    icon: <Sparkles className="h-6 w-6" />,
    color: 'text-gray-600',
  },
  {
    id: 'pro',
    name: '专业版',
    description: '适合个人创作者和小团队',
    price: {
      monthly: 29,
      yearly: 290,
    },
    features: [
      '每月 100 次语音克隆',
      '最长 5 分钟音频',
      '高清音质',
      '快速处理',
      '无水印',
      '多种音色选择',
      '批量处理',
    ],
    limitations: [],
    popular: true,
    icon: <Zap className="h-6 w-6" />,
    color: 'text-blue-600',
  },
  {
    id: 'enterprise',
    name: '企业版',
    description: '为企业和专业团队定制',
    price: {
      monthly: 99,
      yearly: 990,
    },
    features: [
      '无限次语音克隆',
      '无时长限制',
      '超高清音质',
      '优先处理',
      '自定义音色训练',
      'API 接口',
      '团队协作',
      '专属客服',
      '商业授权',
    ],
    limitations: [],
    icon: <Crown className="h-6 w-6" />,
    color: 'text-purple-600',
  },
];

export function PricingPlans() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const isAuthenticated = !!user && !loading;

  // 简单的toast通知函数
  const showToast = (title: string, description: string, variant: 'default' | 'destructive' = 'default') => {
    // 使用浏览器原生通知或者简单的alert
    if (variant === 'destructive') {
      alert(`错误: ${title}\n${description}`);
    } else {
      alert(`${title}\n${description}`);
    }
  };

  // 处理套餐订阅
  const handleSubscription = async (type: string) => {
    if (!isAuthenticated) {
      showToast(
        '需要登录',
        '请先登录账户以继续订阅',
        'destructive'
      );
      router.push('/auth/login');
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
        '免费用户',
        '您已经是免费用户，可以开始使用基础功能'
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
          '服务器错误',
          '支付服务暂时不可用，请稍后重试',
          'destructive'
        );
        return;
      }

      const data = await response.json();
      const result = await stripe?.redirectToCheckout({ sessionId: data.id });

      if (result?.error) {
        console.log(result.error.message);
        showToast(
          '支付错误',
          result.error.message || '跳转到支付页面时出错',
          'destructive'
        );
      }
    } catch (error) {
      console.error('订阅错误:', error);
      showToast(
        '订阅失败',
        '处理订阅请求时出错，请稍后重试',
        'destructive'
      );
    } finally {
      setIsLoading(false);
      setSelectedPlan(null);
    }
  };

  const formatPrice = (price: number) => {
    return price === 0 ? '免费' : `¥${price}`;
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
          选择适合您的
          <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            定价方案
          </span>
        </h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          从免费体验到企业级解决方案，我们为每个需求提供完美的语音克隆服务
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
            按月付费
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all relative ${
              billingCycle === 'yearly'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            按年付费
            <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
              省17%
            </span>
          </button>
        </div>
      </div>

      {/* 定价卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {pricingPlans.map((plan) => {
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
                    最受欢迎
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
                      /{billingCycle === 'monthly' ? '月' : '年'}
                    </span>
                  )}
                </div>
                {billingCycle === 'yearly' && savings > 0 && (
                  <div className="text-green-600 text-sm mt-2">
                    相比按月付费节省 {savings}%
                  </div>
                )}
              </div>

              {/* 功能列表 - 增加 flex-grow 让这部分自动填充空间 */}
              <div className="space-y-4 mb-8 flex-grow">
                <div>
                  <h4 className="font-semibold mb-3 text-green-600">包含功能：</h4>
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
                    <h4 className="font-semibold mb-3 text-amber-600">限制：</h4>
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
                      处理中...
                    </>
                  ) : loading ? (
                    '加载中...'
                  ) : !isAuthenticated ? (
                    plan.id === 'free' ? '开始免费使用' : '登录后订阅'
                  ) : (
                    plan.id === 'free' ? '开始免费使用' : '立即订阅'
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
          所有计划都包含 7 天免费试用期，随时可以取消订阅
        </p>
        <div className="flex justify-center gap-8 text-sm text-muted-foreground">
          <span>✓ 安全支付</span>
          <span>✓ 即时激活</span>
          <span>✓ 24/7 客服支持</span>
        </div>
      </div>
    </div>
  );
} 
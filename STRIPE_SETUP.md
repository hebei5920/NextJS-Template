# Stripe 支付配置说明

## 环境变量配置

在 `.env` 文件中添加以下配置：

```bash
# Stripe 配置
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## Stripe 控制台设置

### 1. 创建产品和价格

在 Stripe 控制台中需要创建以下产品和价格：

#### 专业版 (Pro)
- **月付价格ID**: `price_1RQMR0Psq011JgrIqqzrzjPR`
- **年付价格ID**: `price_1RQMR0Psq011JgrIqqzrzjPR_yearly`
- 价格: ¥29/月, ¥290/年

#### 企业版 (Enterprise)  
- **月付价格ID**: `price_1RQMRLPsq011JgrImNCwJTre`
- **年付价格ID**: `price_1RQMRLPsq011JgrImNCwJTre_yearly`
- 价格: ¥99/月, ¥990/年

### 2. Webhook 配置

设置 webhook 端点: `/api/orders`

监听事件:
- `checkout.session.completed`

### 3. 支付流程

1. 用户选择套餐和计费周期
2. 系统调用 `/api/stripe` 创建 checkout session
3. 重定向到 Stripe 支付页面
4. 支付成功后重定向到 `/success`
5. 支付取消后重定向到 `/canceled`

## 价格ID 映射

当前价格ID映射在 `app/api/stripe/route.ts` 中：

```javascript
const PRICE_ID_LIST = [
    { 
        key: 'pro', 
        monthly: 'price_1RQMR0Psq011JgrIqqzrzjPR',
        yearly: 'price_1RQMR0Psq011JgrIqqzrzjPR_yearly'
    },
    { 
        key: 'enterprise', 
        monthly: 'price_1RQMRLPsq011JgrImNCwJTre',
        yearly: 'price_1RQMRLPsq011JgrImNCwJTre_yearly'
    },
]
```

## 注意事项

1. 年付模式使用 `subscription` 模式，月付使用 `payment` 模式
2. 确保在 Stripe 控制台中创建了对应的价格ID
3. 测试环境和生产环境需要使用不同的密钥
4. 支付成功后会触发 webhook 来处理订单 
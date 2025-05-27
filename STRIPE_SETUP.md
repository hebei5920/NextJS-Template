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

## 支付结果页面

### 成功页面 (`/success`)
- 显示支付成功状态
- 展示订单详情和用户信息
- 提供快捷导航到主要功能
- 自动验证支付状态
- 支持保存支付凭证

### 取消页面 (`/canceled`)
- 显示支付失败或取消信息
- 提供问题排查建议
- 常见问题解答
- 重试支付和联系客服选项
- 智能错误原因识别

## API 端点

### 支付相关
- `POST /api/stripe` - 创建支付会话
- `GET /api/stripe/verify` - 验证支付状态
- `POST /api/orders` - Webhook 处理订单

### 验证API使用方法
```javascript
// 验证支付状态
const response = await fetch(`/api/stripe/verify?session_id=${sessionId}`);
const result = await response.json();

if (result.success && result.data.success) {
  // 支付成功
  console.log('Payment verified:', result.data);
} else {
  // 支付失败
  console.log('Payment failed');
}
```

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
## 支付页面功能

### 成功页面特性
- ✅ 实时支付状态验证
- ✅ 用户友好的成功反馈
- ✅ 订单详情展示
- ✅ 快捷导航菜单
- ✅ 支付凭证保存
- ✅ 自动重定向选项

### 失败页面特性
- ✅ 智能错误原因识别
- ✅ 问题解决方案建议
- ✅ 常见问题解答
- ✅ 一键重试支付
- ✅ 客服联系方式
- ✅ 银行卡问题排查

## 注意事项

1. 年付模式使用 `subscription` 模式，月付使用 `payment` 模式
2. 确保在 Stripe 控制台中创建了对应的价格ID
3. 测试环境和生产环境需要使用不同的密钥
4. 支付成功后会触发 webhook 来处理订单
5. 支付页面支持深色模式和响应式设计
6. 所有支付状态都会进行实时验证
7. 用户可以在任何时候联系客服获得帮助 

## stripe listen --events checkout.session.completed --forward-to localhost:3000/api/order
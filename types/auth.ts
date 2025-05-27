// 基础 Supabase 用户类型（匹配 @supabase/supabase-js User 类型）
export interface SupabaseUser {
  id: string;
  aud?: string;
  role?: string;
  email?: string;
  email_confirmed_at?: string;
  phone?: string;
  phone_confirmed_at?: string;
  confirmed_at?: string;
  last_sign_in_at?: string;
  created_at?: string;
  updated_at?: string;
  is_anonymous?: boolean;
  app_metadata: {
    provider?: string;
    providers?: string[];
    [key: string]: any;
  };
  user_metadata: {
    // Google 字段
    sub?: string;
    name?: string;
    given_name?: string;
    family_name?: string;
    picture?: string;
    locale?: string;

    // GitHub 字段
    id?: number;
    login?: string;
    avatar_url?: string;
    email?: string;
    [key: string]: any;
  };
  identities?: {
    id?: string;
    user_id?: string;
    provider: string;
    identity_data: {
      sub?: string;
      name?: string;
      picture?: string;
      id?: number;
      login?: string;
      avatar_url?: string;
      email?: string;
      [key: string]: any;
    };
    last_sign_in_at?: string;
    created_at?: string;
    updated_at?: string;
  }[];
}

// 数据库用户类型（严格匹配 Prisma schema）
export interface DatabaseUser {
  id: number;
  email: string;
  supabaseId: string | null;
  provider: string | null;
  providerUserId: string | null;
  avatarUrl: string | null;
  username: string | null;
  githubUsername: string | null;
  githubId: number | null;
  googleId: string | null;
  emailVerified: boolean;
  isActive: boolean;
  credits: number; // 用户余额/积分，支持一位小数
  plan: string;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date | null;
}

// 用户创建数据
export interface CreateUserData {
  email: string;
  supabaseId: string;
  provider: string;
  providerUserId?: string;
  avatarUrl?: string;
  username?: string;
  githubUsername?: string;
  googleUsername?: string;
  githubId?: number;
  googleId?: string;
  emailVerified?: boolean;
  credits?: number; // 用户余额/积分，支持一位小数
  plan?: string;
}

// 用户更新数据
export interface UpdateUserData {
  avatarUrl?: string;
  username?: string;
  githubUsername?: string;
  githubId?: number;
  googleId?: string;
  emailVerified?: boolean;
  lastLoginAt?: Date;
  credits?: number; // 用户余额/积分，支持一位小数
  plan?: string;
}

// 订单类型
export interface DatabaseOrder {
  id: number;
  userId: string;
  price: number | null;
  product: string;
  payEmail: string | null;
  payName: string | null;
  payCurrency: string | null;
  status: string;
  createDate: Date;
  updateDate: Date;
}

// 创建订单数据
export interface CreateOrderData {
  userId: string;
  price?: number;
  product: string;
  payEmail?: string;
  payName?: string;
  payCurrency?: string;
  status?: string;
  createDate?: Date;
  updateDate?: Date;
}

// 更新订单数据
export interface UpdateOrderData {
  price?: number;
  product?: string;
  payEmail?: string;
  payName?: string;
  payCurrency?: string;
  status?: string;
  updateDate?: Date;
}

// OAuth 提供商类型
export type OAuthProvider = 'google' | 'github' | 'email';

// 用户套餐类型
export type UserPlan = 'free' | 'basic' | 'pro' | 'enterprise';

// 订单状态类型
export type OrderStatus = 'pending' | 'completed' | 'failed' | 'cancelled';

// 用户处理结果
export interface UserProcessingResult {
  user: DatabaseUser;
  isNewUser: boolean;
} 
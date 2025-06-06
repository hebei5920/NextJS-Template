import { prisma } from './index'
import { Prisma, User } from '@prisma/client'

/**
 * 用户数据校验
 */
export const userValidation = {
  /**
   * 验证邮箱格式
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },

  /**
   * 验证 Supabase ID 格式（UUID格式）
   */
  isValidSupabaseId(supabaseId: string): boolean {
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    return uuidPattern.test(supabaseId)
  },

  /**
   * 验证用户套餐类型
   */
  isValidPlan(plan: string): boolean {
    return ['free', 'basic', 'pro', 'enterprise'].includes(plan)
  },

  /**
   * 验证积分值
   */
  isValidCredits(credits: number): boolean {
    return !isNaN(credits) && credits >= 0
  },

  /**
   * 验证 OAuth 提供商
   */
  isValidProvider(provider: string): boolean {
    return ['google', 'github', 'email'].includes(provider)
  }
}

/**
 * 创建用户
 */
export async function createUser(data: Prisma.UserCreateInput): Promise<User> {
  // 校验邮箱
  if (!data.email || !userValidation.isValidEmail(data.email)) {
    throw new Error('无效的邮箱地址')
  }

  // 校验 Supabase ID
  if (data.supabaseId && !userValidation.isValidSupabaseId(data.supabaseId)) {
    throw new Error('无效的 Supabase ID')
  }

  // 校验套餐
  if (data.plan && !userValidation.isValidPlan(data.plan)) {
    throw new Error('无效的用户套餐类型')
  }

  // 校验积分
  if (data.credits !== undefined && !userValidation.isValidCredits(data.credits)) {
    throw new Error('积分值必须为非负数')
  }

  // 校验提供商
  if (data.provider && !userValidation.isValidProvider(data.provider)) {
    throw new Error('无效的 OAuth 提供商')
  }

  try {
    return await prisma.user.create({
      data
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // 处理唯一约束错误
      if (error.code === 'P2002') {
        const target = error.meta?.target as string[]
        if (target.includes('email')) {
          throw new Error('邮箱已被使用')
        }
        if (target.includes('supabase_id')) {
          throw new Error('Supabase ID 已关联其他账户')
        }
        if (target.includes('username')) {
          throw new Error('用户名已被使用')
        }
      }
    }

    throw error
  }
}

/**
 * 通过 ID 查询用户
 */
export async function getUserById(id: number): Promise<User | null> {
  if (isNaN(id) || id <= 0) {
    throw new Error('无效的用户 ID')
  }

  return prisma.user.findUnique({
    where: { id }
  })
}

/**
 * 通过 Supabase ID 查询用户
 */
export async function getUserBySupabaseId(supabaseId: string): Promise<User | null> {
  if (!userValidation.isValidSupabaseId(supabaseId)) {
    throw new Error('无效的 Supabase ID 格式')
  }

  return prisma.user.findUnique({
    where: { supabaseId }
  })
}

/**
 * 通过邮箱查询用户
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  if (!userValidation.isValidEmail(email)) {
    throw new Error('无效的邮箱格式')
  }

  return prisma.user.findUnique({
    where: { email }
  })
}

/**
 * 更新用户信息
 */
export async function updateUser(id: number, data: Prisma.UserUpdateInput): Promise<User> {
  // 校验用户 ID
  if (isNaN(id) || id <= 0) {
    throw new Error('无效的用户 ID')
  }

  // 校验邮箱
  if (data.email && typeof data.email === 'string' && !userValidation.isValidEmail(data.email)) {
    throw new Error('无效的邮箱地址')
  }

  // 校验 Supabase ID
  if (data.supabaseId && typeof data.supabaseId === 'string' && !userValidation.isValidSupabaseId(data.supabaseId)) {
    throw new Error('无效的 Supabase ID')
  }

  // 校验套餐
  if (data.plan && typeof data.plan === 'string' && !userValidation.isValidPlan(data.plan)) {
    throw new Error('无效的用户套餐类型')
  }

  // 校验积分
  if (data.credits !== undefined && typeof data.credits === 'number' && !userValidation.isValidCredits(data.credits)) {
    throw new Error('积分值必须为非负数')
  }

  try {
    return await prisma.user.update({
      where: { id },
      data
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // 处理唯一约束错误
      if (error.code === 'P2002') {
        const target = error.meta?.target as string[]
        if (target.includes('email')) {
          throw new Error('邮箱已被使用')
        }
        if (target.includes('supabase_id')) {
          throw new Error('Supabase ID 已关联其他账户')
        }
        if (target.includes('username')) {
          throw new Error('用户名已被使用')
        }
      }
    }

    throw error
  }
}

/**
 * 通过 Supabase ID 更新用户信息
 */
export async function updateUserBySupabaseId(supabaseId: string, data: Prisma.UserUpdateInput): Promise<User> {
  // 校验 Supabase ID
  if (!userValidation.isValidSupabaseId(supabaseId)) {
    throw new Error('无效的 Supabase ID 格式')
  }

  // 校验邮箱
  if (data.email && typeof data.email === 'string' && !userValidation.isValidEmail(data.email)) {
    throw new Error('无效的邮箱地址')
  }

  // 校验套餐
  if (data.plan && typeof data.plan === 'string' && !userValidation.isValidPlan(data.plan)) {
    throw new Error('无效的用户套餐类型')
  }

  // 校验积分
  if (data.credits !== undefined && typeof data.credits === 'number' && !userValidation.isValidCredits(data.credits)) {
    throw new Error('积分值必须为非负数')
  }

  try {
    return await prisma.user.update({
      where: { supabaseId },
      data
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        throw new Error('用户不存在')
      }
      // 处理唯一约束错误
      if (error.code === 'P2002') {
        const target = error.meta?.target as string[]
        if (target.includes('email')) {
          throw new Error('邮箱已被使用')
        }
        if (target.includes('username')) {
          throw new Error('用户名已被使用')
        }
      }
    }

    throw error
  }
}

/**
 * 更新用户积分
 */
export async function updateUserCredits(supabaseId: string, credits: number): Promise<User> {
  // 校验 Supabase ID
  if (!userValidation.isValidSupabaseId(supabaseId)) {
    throw new Error('无效的 Supabase ID 格式')
  }

  // 校验积分值
  if (!userValidation.isValidCredits(credits)) {
    throw new Error('积分值必须为非负数')
  }

  try {
    return await prisma.user.update({
      where: { supabaseId },
      data: { credits }
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        throw new Error('用户不存在')
      }
    }

    throw error
  }
}

/**
 * 增加用户积分
 */
export async function addUserCredits(supabaseId: string, amount: number): Promise<User> {
  // 校验 Supabase ID
  if (!userValidation.isValidSupabaseId(supabaseId)) {
    throw new Error('无效的 Supabase ID 格式')
  }

  // 校验增加值
  if (isNaN(amount) || amount <= 0) {
    throw new Error('积分增加值必须为正数')
  }

  try {
    return await prisma.user.update({
      where: { supabaseId },
      data: {
        credits: {
          increment: amount
        }
      }
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        throw new Error('用户不存在')
      }
    }

    throw error
  }
}

/**
 * 扣减用户积分
 */
export async function deductUserCredits(supabaseId: string, amount: number): Promise<User> {
  // 校验 Supabase ID
  if (!userValidation.isValidSupabaseId(supabaseId)) {
    throw new Error('无效的 Supabase ID 格式')
  }

  // 校验扣减值
  if (isNaN(amount) || amount <= 0) {
    throw new Error('积分扣减值必须为正数')
  }

  // 查询当前用户积分
  const user = await prisma.user.findUnique({
    where: { supabaseId },
    select: { credits: true }
  })

  if (!user) {
    throw new Error('用户不存在')
  }

  // 检查积分是否充足
  if (user.credits < amount) {
    throw new Error('用户积分不足')
  }

  try {
    return await prisma.user.update({
      where: { supabaseId },
      data: {
        credits: {
          decrement: amount
        }
      }
    })
  } catch (error) {
    throw error
  }
}

/**
 * 更新用户登录时间
 */
export async function updateUserLoginTime(supabaseId: string): Promise<User> {
  // 校验 Supabase ID
  if (!userValidation.isValidSupabaseId(supabaseId)) {
    throw new Error('无效的 Supabase ID 格式')
  }

  try {
    return await prisma.user.update({
      where: { supabaseId },
      data: {
        lastLoginAt: new Date()
      }
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        throw new Error('用户不存在')
      }
    }

    throw error
  }
}

/**
 * 获取所有用户
 */
export async function getAllUsers(page = 1, pageSize = 10): Promise<{ users: User[], total: number }> {
  if (isNaN(page) || page < 1) {
    throw new Error('页码必须为正整数')
  }

  if (isNaN(pageSize) || pageSize < 1) {
    throw new Error('每页数量必须为正整数')
  }

  const skip = (page - 1) * pageSize

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip,
      take: pageSize,
      orderBy: {
        createdAt: 'desc'
      }
    }),
    prisma.user.count()
  ])

  return {
    users,
    total
  }
}

import { prisma } from './index'
import { User } from '@prisma/client'
import { getUserBySupabaseId, updateUserLoginTime, createUser, getUserByEmail, updateUser } from './user'
import { userValidation } from './user'

/**
 * 认证数据校验
 */
export const authValidation = {
  /**
   * 验证 Supabase 用户对象
   */
  validateSupabaseUser(supabaseUser: any): { isValid: boolean; error?: string } {
    if (!supabaseUser) {
      return { isValid: false, error: 'Supabase 用户对象为空' }
    }

    if (!supabaseUser.id) {
      return { isValid: false, error: 'Supabase 用户 ID 为空' }
    }

    if (!userValidation.isValidSupabaseId(supabaseUser.id)) {
      return { isValid: false, error: '无效的 Supabase ID 格式' }
    }

    if (!supabaseUser.email) {
      return { isValid: false, error: 'Supabase 用户邮箱为空' }
    }

    if (!userValidation.isValidEmail(supabaseUser.email)) {
      return { isValid: false, error: '无效的邮箱格式' }
    }

    return { isValid: true }
  }
}

/**
 * 处理来自 OAuth 提供商的用户数据，提取必要信息
 */
export function processSupabaseUser(supabaseUser: any): any {
  // 验证用户数据
  const validation = authValidation.validateSupabaseUser(supabaseUser)
  if (!validation.isValid) {
    throw new Error(validation.error)
  }

  // 检测 OAuth 提供商
  let provider = 'email'
  let providerUserId = null
  let avatarUrl = null
  let username = null
  let githubUsername = null
  let githubId = null
  let googleId = null
  let emailVerified = false

  // 从用户元数据中提取信息
  const identities = supabaseUser.identities || []
  const appMetadata = supabaseUser.app_metadata || {}
  const userMetadata = supabaseUser.user_metadata || {}

  // 确定提供商
  if (identities.length > 0) {
    provider = identities[0].provider || 'email'
    providerUserId = identities[0].id
  } else if (appMetadata.provider) {
    provider = appMetadata.provider
  }

  // 处理 GitHub 特定数据
  if (provider === 'github') {
    githubUsername = userMetadata.user_name || userMetadata.preferred_username
    username = githubUsername
    githubId = userMetadata.sub ? parseInt(userMetadata.sub, 10) : null
    avatarUrl = userMetadata.avatar_url
  }
  
  // 处理 Google 特定数据
  if (provider === 'google') {
    googleId = userMetadata.sub
    username = userMetadata.name || userMetadata.email?.split('@')[0]
    avatarUrl = userMetadata.avatar_url || userMetadata.picture
  }

  // 一般数据
  emailVerified = supabaseUser.email_confirmed_at != null || 
                  userMetadata.email_verified === true

  // 如果没有设置用户名，使用邮箱前缀
  if (!username) {
    username = supabaseUser.email.split('@')[0]
  }

  // 构建用户数据对象
  return {
    email: supabaseUser.email,
    supabaseId: supabaseUser.id,
    provider,
    providerUserId,
    avatarUrl,
    username,
    githubUsername,
    githubId,
    googleId,
    emailVerified
  }
}

/**
 * 用户登录后的主要处理逻辑：查找用户，如果不存在则创建
 */
export async function findOrCreateUser(supabaseUser: any): Promise<{
  user: User;
  isNewUser: boolean;
}> {
  try {
    // 验证用户数据
    const validation = authValidation.validateSupabaseUser(supabaseUser)
    if (!validation.isValid) {
      throw new Error(validation.error)
    }

    // 首先尝试通过 supabaseId 查找用户
    let existingUser = await getUserBySupabaseId(supabaseUser.id)

    if (existingUser) {
      // 用户存在，更新最后登录时间
      const updatedUser = await updateUserLoginTime(supabaseUser.id)
      return {
        user: updatedUser,
        isNewUser: false
      }
    }

    // 用户不存在，尝试通过邮箱查找
    const email = supabaseUser.email
    if (email) {
      existingUser = await getUserByEmail(email)

      if (existingUser) {
        // 找到邮箱匹配的用户，绑定 Supabase ID
        const userData = processSupabaseUser(supabaseUser)
        
        // 构建更新数据
        const updateData: any = {
          supabaseId: userData.supabaseId,
          provider: userData.provider,
          providerUserId: userData.providerUserId,
          lastLoginAt: new Date()
        }

        // 只更新空值字段，避免覆盖现有数据
        if (userData.avatarUrl) updateData.avatarUrl = userData.avatarUrl
        if (userData.username) updateData.username = userData.username
        if (userData.githubUsername) updateData.githubUsername = userData.githubUsername
        if (userData.githubId) updateData.githubId = userData.githubId
        if (userData.googleId) updateData.googleId = userData.googleId
        if (userData.emailVerified) updateData.emailVerified = userData.emailVerified

        const updatedUser = await updateUser(existingUser.id, updateData)
        return {
          user: updatedUser,
          isNewUser: false
        }
      }
    }

    // 用户完全不存在，创建新用户
    const userData = processSupabaseUser(supabaseUser)
    
    // 设置最后登录时间
    const lastLoginAt = supabaseUser.last_sign_in_at ? new Date(supabaseUser.last_sign_in_at) : new Date()

    const newUser = await createUser({
      email: userData.email,
      supabaseId: userData.supabaseId,
      provider: userData.provider,
      providerUserId: userData.providerUserId,
      avatarUrl: userData.avatarUrl,
      username: userData.username,
      githubUsername: userData.githubUsername,
      githubId: userData.githubId,
      googleId: userData.googleId,
      emailVerified: userData.emailVerified,
      isActive: true,
      lastLoginAt
    })

    return {
      user: newUser,
      isNewUser: true
    }
  } catch (error) {
    console.error('Error in findOrCreateUser:', error)
    throw error
  }
}

/**
 * 获取用户安全信息（用于客户端）
 * 返回安全的用户信息，不包含敏感数据
 */
export async function getUserInfo(supabaseUserId: string): Promise<any | null> {
  try {
    // 验证 Supabase ID
    if (!userValidation.isValidSupabaseId(supabaseUserId)) {
      throw new Error('无效的 Supabase ID 格式')
    }

    const user = await getUserBySupabaseId(supabaseUserId)

    if (!user) {
      return null
    }

    // 返回客户端安全的用户信息
    return {
      id: user.id,
      email: user.email,
      provider: user.provider,
      avatarUrl: user.avatarUrl,
      username: user.username,
      githubUsername: user.githubUsername,
      emailVerified: user.emailVerified,
      isActive: user.isActive,
      credits: user.credits,
      plan: user.plan,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt
    }
  } catch (error) {
    console.error('Error getting user info:', error)
    return null
  }
}

/**
 * 检查用户是否存在
 */
export async function userExists(supabaseUserId: string): Promise<boolean> {
  try {
    // 验证 Supabase ID
    if (!userValidation.isValidSupabaseId(supabaseUserId)) {
      throw new Error('无效的 Supabase ID 格式')
    }

    const user = await getUserBySupabaseId(supabaseUserId)
    return user !== null
  } catch (error) {
    console.error('Error checking user existence:', error)
    return false
  }
}

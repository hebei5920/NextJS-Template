'use server'

import { createClient } from '@/lib/supabase-server'
import {
  getUserBySupabaseId,
  updateUserCredits,
  addUserCredits as dbAddUserCredits,
  updateUserBySupabaseId,
  userValidation,
} from '@/db/user'
import { revalidatePath } from 'next/cache'
import { User } from '@prisma/client'

/**
 * 获取当前用户信息
 */
export async function getCurrentUser(): Promise<{
  user: User | null
  error: string | null
}> {
  try {
    const supabase = createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()

    if (!authUser) {
      return { user: null, error: 'Please login first' }
    }

    const user = await getUserBySupabaseId(authUser.id)
    return { user, error: null }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to get user information'
    return { user: null, error: errorMessage }
  }
}

/**
 * 获取用户积分
 */
export async function getUserCredits(): Promise<{
  credits: number | null
  error: string | null
}> {
  try {
    const { user, error } = await getCurrentUser()
    if (error) return { credits: null, error }
    return { credits: user?.credits ?? null, error: null }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to get user credits'
    return { credits: null, error: errorMessage }
  }
}

/**
 * 增加用户积分
 */
export async function addUserCredits(amount: number): Promise<{
  user: User | null
  error: string | null
}> {
  try {
    const supabase = createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()

    if (!authUser) {
      return { user: null, error: 'Please login first' }
    }

    if (isNaN(amount) || amount <= 0) {
      return { user: null, error: 'Credit increase value must be positive' }
    }

    const updatedUser = await dbAddUserCredits(authUser.id, amount)
    revalidatePath('/') // Revalidate all user data
    return { user: updatedUser, error: null }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to add credits'
    return { user: null, error: errorMessage }
  }
}

/**
 * 扣减用户积分
 */
export async function deductUserCredits(amount: number): Promise<{
  user: User | null
  error: string | null
}> {
  try {
    const supabase = createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()

    if (!authUser) {
      return { user: null, error: 'Please login first' }
    }

    if (isNaN(amount) || amount <= 0) {
      return { user: null, error: 'Credit deduction value must be positive' }
    }

    const userInfo = await getUserBySupabaseId(authUser.id)
    if (!userInfo) {
      return { user: null, error: 'User does not exist' }
    }

    if (userInfo.credits < amount) {
      return { user: null, error: 'Insufficient credits' }
    }

    const newCredits = userInfo.credits - amount
    const updatedUser = await updateUserCredits(authUser.id, newCredits)
    revalidatePath('/') // Revalidate all user data
    return { user: updatedUser, error: null }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to deduct credits'
    return { user: null, error: errorMessage }
  }
}

/**
 * 设置用户积分
 */
export async function setUserCredits(amount: number): Promise<{
  user: User | null
  error: string | null
}> {
  try {
    const supabase = createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()

    if (!authUser) {
      return { user: null, error: 'Please login first' }
    }

    if (!userValidation.isValidCredits(amount)) {
      return { user: null, error: 'Credit value must be non-negative' }
    }

    const updatedUser = await updateUserCredits(authUser.id, amount)
    revalidatePath('/') // Revalidate all user data
    return { user: updatedUser, error: null }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to set credits'
    return { user: null, error: errorMessage }
  }
}

/**
 * 更新用户套餐
 */
export async function updateUserPlan(plan: 'free' | 'basic' | 'pro' | 'enterprise'): Promise<{
  user: User | null
  error: string | null
}> {
  try {
    const supabase = createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()

    if (!authUser) {
      return { user: null, error: 'Please login first' }
    }

    if (!userValidation.isValidPlan(plan)) {
      return {
        user: null,
        error: `Invalid plan type, must be one of the following: free, basic, pro, enterprise`
      }
    }

    const updatedUser = await updateUserBySupabaseId(authUser.id, { plan })
    revalidatePath('/') // Revalidate all user data
    return { user: updatedUser, error: null }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update plan'
    return { user: null, error: errorMessage }
  }
}

/**
 * 检查用户积分是否足够
 */
export async function hasEnoughCredits(amount: number): Promise<{
  hasEnough: boolean
  error: string | null
}> {
  try {
    const { user, error } = await getCurrentUser()
    if (error) return { hasEnough: false, error }
    return { hasEnough: user ? user.credits >= amount : false, error: null }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to check credits'
    return { hasEnough: false, error: errorMessage }
  }
}

/**
 * 消费积分（用于功能使用场景）
 */
export async function consumeCredits(amount: number, feature: string): Promise<{
  success: boolean
  error: string | null
}> {
  try {
    const supabase = createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()

    if (!authUser) {
      return { success: false, error: 'Please login first' }
    }

    if (isNaN(amount) || amount <= 0) {
      return { success: false, error: 'Consumption credit value must be positive' }
    }

    const { hasEnough, error: checkError } = await hasEnoughCredits(amount)
    if (checkError) return { success: false, error: checkError }

    if (!hasEnough) {
      return { success: false, error: 'Insufficient credits, cannot use this feature' }
    }

    const { user: updatedUser, error: deductError } = await deductUserCredits(amount)
    if (deductError || !updatedUser) {
      return { success: false, error: deductError || 'Failed to deduct credits' }
    }

    // 记录积分消费
    console.log(`User ${authUser.id} used ${amount} credits for ${feature}`)

    return { success: true, error: null }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to consume credits'
    return { success: false, error: errorMessage }
  }
}

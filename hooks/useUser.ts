'use client'

import { useState } from 'react'
import { useAuth } from './useAuth'
import {
  getUserBySupabaseId,
  updateUserCredits,
  addUserCredits as dbAddUserCredits,
  updateUserBySupabaseId,
  userValidation
} from '@/db/user'
import { User } from '@prisma/client'
import { createClient } from '@/lib/supabase-client'

export interface UserState {
  user: User | null
  loading: boolean
  error: string | null
}

// 有效的用户套餐类型
export type UserPlan = 'free' | 'basic' | 'pro' | 'enterprise'

export function useUser() {
  const { user: authUser } = useAuth()
  const [state, setState] = useState<UserState>({
    user: null,
    loading: false,
    error: null
  })
  const supabase = createClient()

  /**
   * 获取当前用户信息
   */
  const getUserInfo = async (): Promise<User | null> => {
    if (!authUser) {
      setState(prev => ({ ...prev, error: 'Please login first' }))
      return null
    }

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      // 直接使用数据库函数获取用户信息
      const userInfo = await getUserBySupabaseId(authUser.id)

      setState(prev => ({
        ...prev,
        user: userInfo,
        loading: false
      }))

      return userInfo
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get user information'
      setState(prev => ({ ...prev, loading: false, error: errorMessage }))
      return null
    }
  }

  /**
   * 获取用户积分
   */
  const getUserCredits = async (): Promise<number | null> => {
    const userInfo = await getUserInfo()
    return userInfo ? userInfo.credits : null
  }

  /**
   * 获取用户套餐
   */
  const getUserPlan = async (): Promise<UserPlan | null> => {
    const userInfo = await getUserInfo()
    return userInfo ? userInfo.plan as UserPlan : null
  }

  /**
   * 增加用户积分
   */
  const addUserCredits = async (amount: number): Promise<User | null> => {
    if (!authUser) {
      setState(prev => ({ ...prev, error: 'Please login first' }))
      return null
    }

    // 验证积分值
    if (isNaN(amount) || amount <= 0) {
      setState(prev => ({ ...prev, error: 'Credit increase value must be positive' }))
      return null
    }

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      // 直接使用数据库函数增加积分
      const updatedUser = await dbAddUserCredits(authUser.id, amount)

      setState(prev => ({
        ...prev,
        user: updatedUser,
        loading: false
      }))

      return updatedUser
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add credits'
      setState(prev => ({ ...prev, loading: false, error: errorMessage }))
      return null
    }
  }

  /**
   * 扣减用户积分
   */
  const deductUserCredits = async (amount: number): Promise<User | null> => {
    if (!authUser) {
      setState(prev => ({ ...prev, error: 'Please login first' }))
      return null
    }

    // 验证积分值
    if (isNaN(amount) || amount <= 0) {
      setState(prev => ({ ...prev, error: 'Credit deduction value must be positive' }))
      return null
    }

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      // 获取当前用户信息
      const userInfo = await getUserBySupabaseId(authUser.id)

      if (!userInfo) {
        throw new Error('User does not exist')
      }

      // 检查积分是否足够
      if (userInfo.credits < amount) {
        throw new Error('Insufficient credits')
      }

      // 计算新的积分值
      const newCredits = userInfo.credits - amount

      // 更新积分
      const updatedUser = await updateUserCredits(authUser.id, newCredits)

      setState(prev => ({
        ...prev,
        user: updatedUser,
        loading: false
      }))

      return updatedUser
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to deduct credits'
      setState(prev => ({ ...prev, loading: false, error: errorMessage }))
      return null
    }
  }

  /**
   * 设置用户积分
   */
  const setUserCredits = async (amount: number): Promise<User | null> => {
    if (!authUser) {
      setState(prev => ({ ...prev, error: 'Please login first' }))
      return null
    }

    // 验证积分值
    if (!userValidation.isValidCredits(amount)) {
      setState(prev => ({ ...prev, error: 'Credit value must be non-negative' }))
      return null
    }

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      // 直接使用数据库函数设置积分
      const updatedUser = await updateUserCredits(authUser.id, amount)

      setState(prev => ({
        ...prev,
        user: updatedUser,
        loading: false
      }))

      return updatedUser
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to set credits'
      setState(prev => ({ ...prev, loading: false, error: errorMessage }))
      return null
    }
  }

  /**
   * 更新用户套餐
   */
  const updateUserPlan = async (plan: UserPlan): Promise<User | null> => {
    if (!authUser) {
      setState(prev => ({ ...prev, error: 'Please login first' }))
      return null
    }

    // 验证套餐类型
    if (!userValidation.isValidPlan(plan)) {
      setState(prev => ({
        ...prev,
        error: `Invalid plan type, must be one of the following: free, basic, pro, enterprise`
      }))
      return null
    }

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      // 使用数据库函数更新用户套餐
      const updatedUser = await updateUserBySupabaseId(authUser.id, { plan })

      setState(prev => ({
        ...prev,
        user: updatedUser,
        loading: false
      }))

      return updatedUser
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update plan'
      setState(prev => ({ ...prev, loading: false, error: errorMessage }))
      return null
    }
  }

  /**
   * 检查用户积分是否足够
   */
  const hasEnoughCredits = async (amount: number): Promise<boolean> => {
    if (!authUser) {
      setState(prev => ({ ...prev, error: 'Please login first' }))
      return false
    }

    try {
      const userInfo = await getUserInfo()
      return userInfo ? userInfo.credits >= amount : false
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to check credits'
      setState(prev => ({ ...prev, error: errorMessage }))
      return false
    }
  }

  /**
   * 消费积分（用于功能使用场景）
   */
  const consumeCredits = async (amount: number, feature: string): Promise<boolean> => {
    if (!authUser) {
      setState(prev => ({ ...prev, error: 'Please login first' }))
      return false
    }

    // 验证积分值
    if (isNaN(amount) || amount <= 0) {
      setState(prev => ({ ...prev, error: 'Consumption credit value must be positive' }))
      return false
    }

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      // 检查积分是否足够
      const hasEnough = await hasEnoughCredits(amount)

      if (!hasEnough) {
        setState(prev => ({
          ...prev,
          error: 'Insufficient credits, cannot use this feature',
          loading: false
        }))
        return false
      }

      // 扣减积分
      const updatedUser = await deductUserCredits(amount)

      if (!updatedUser) {
        throw new Error('Failed to deduct credits')
      }

      // 这里可以添加积分消费记录逻辑
      console.log(`User ${authUser.id} used ${amount} credits for ${feature}`)

      setState(prev => ({ ...prev, loading: false }))
      return true
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to consume credits'
      setState(prev => ({ ...prev, loading: false, error: errorMessage }))
      return false
    }
  }

  return {
    ...state,
    getUserInfo,
    getUserCredits,
    getUserPlan,
    addUserCredits,
    deductUserCredits,
    setUserCredits,
    updateUserPlan,
    hasEnoughCredits,
    consumeCredits,
    refreshUserInfo: getUserInfo,
    clearError: () => setState(prev => ({ ...prev, error: null }))
  }
}

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
      setState(prev => ({ ...prev, error: '请先登录' }))
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
      const errorMessage = error instanceof Error ? error.message : '获取用户信息失败'
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
      setState(prev => ({ ...prev, error: '请先登录' }))
      return null
    }

    // 验证积分值
    if (isNaN(amount) || amount <= 0) {
      setState(prev => ({ ...prev, error: '积分增加值必须为正数' }))
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
      const errorMessage = error instanceof Error ? error.message : '增加积分失败'
      setState(prev => ({ ...prev, loading: false, error: errorMessage }))
      return null
    }
  }

  /**
   * 扣减用户积分
   */
  const deductUserCredits = async (amount: number): Promise<User | null> => {
    if (!authUser) {
      setState(prev => ({ ...prev, error: '请先登录' }))
      return null
    }

    // 验证积分值
    if (isNaN(amount) || amount <= 0) {
      setState(prev => ({ ...prev, error: '积分扣减值必须为正数' }))
      return null
    }

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      // 获取当前用户信息
      const userInfo = await getUserBySupabaseId(authUser.id)

      if (!userInfo) {
        throw new Error('用户不存在')
      }

      // 检查积分是否足够
      if (userInfo.credits < amount) {
        throw new Error('积分不足')
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
      const errorMessage = error instanceof Error ? error.message : '扣减积分失败'
      setState(prev => ({ ...prev, loading: false, error: errorMessage }))
      return null
    }
  }

  /**
   * 设置用户积分
   */
  const setUserCredits = async (amount: number): Promise<User | null> => {
    if (!authUser) {
      setState(prev => ({ ...prev, error: '请先登录' }))
      return null
    }

    // 验证积分值
    if (!userValidation.isValidCredits(amount)) {
      setState(prev => ({ ...prev, error: '积分值必须为非负数' }))
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
      const errorMessage = error instanceof Error ? error.message : '设置积分失败'
      setState(prev => ({ ...prev, loading: false, error: errorMessage }))
      return null
    }
  }

  /**
   * 更新用户套餐
   */
  const updateUserPlan = async (plan: UserPlan): Promise<User | null> => {
    if (!authUser) {
      setState(prev => ({ ...prev, error: '请先登录' }))
      return null
    }

    // 验证套餐类型
    if (!userValidation.isValidPlan(plan)) {
      setState(prev => ({
        ...prev,
        error: `无效的套餐类型，必须是以下之一: free, basic, pro, enterprise`
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
      const errorMessage = error instanceof Error ? error.message : '更新套餐失败'
      setState(prev => ({ ...prev, loading: false, error: errorMessage }))
      return null
    }
  }

  /**
   * 检查用户积分是否足够
   */
  const hasEnoughCredits = async (amount: number): Promise<boolean> => {
    if (!authUser) {
      setState(prev => ({ ...prev, error: '请先登录' }))
      return false
    }

    try {
      const userInfo = await getUserInfo()
      return userInfo ? userInfo.credits >= amount : false
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '检查积分失败'
      setState(prev => ({ ...prev, error: errorMessage }))
      return false
    }
  }

  /**
   * 消费积分（用于功能使用场景）
   */
  const consumeCredits = async (amount: number, feature: string): Promise<boolean> => {
    if (!authUser) {
      setState(prev => ({ ...prev, error: '请先登录' }))
      return false
    }

    // 验证积分值
    if (isNaN(amount) || amount <= 0) {
      setState(prev => ({ ...prev, error: '消费积分值必须为正数' }))
      return false
    }

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      // 检查积分是否足够
      const hasEnough = await hasEnoughCredits(amount)

      if (!hasEnough) {
        setState(prev => ({
          ...prev,
          error: '积分不足，无法使用此功能',
          loading: false
        }))
        return false
      }

      // 扣减积分
      const updatedUser = await deductUserCredits(amount)

      if (!updatedUser) {
        throw new Error('扣减积分失败')
      }

      // 这里可以添加积分消费记录逻辑
      console.log(`用户 ${authUser.id} 使用了 ${amount} 积分用于 ${feature}`)

      setState(prev => ({ ...prev, loading: false }))
      return true
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '消费积分失败'
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

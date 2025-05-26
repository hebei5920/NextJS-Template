import { PrismaClient } from '@prisma/client';
import { UserProcessor } from '../lib/user-processor';

// 如果没有全局 Prisma 实例，创建一个
declare global {
  var __prisma: PrismaClient | undefined;
}

const prisma = globalThis.__prisma || new PrismaClient();

if (process.env.NODE_ENV === 'development') {
  globalThis.__prisma = prisma;
}

/**
 * 用户服务 - 处理用户查找和创建逻辑
 */
export class UserService {

  /**
   * 用户登录后的主要处理逻辑：查找用户，如果不存在则创建
   */
  static async findOrCreateUser(supabaseUser: any): Promise<any> {
    try {
      // 首先尝试通过 supabaseId 查找用户
      let existingUser = await this.findUserBySupabaseId(supabaseUser.id);

      if (existingUser) {
        // 用户存在，更新最后登录时间
        const updatedUser = await this.updateUserLoginTime(existingUser.id);
        return {
          user: updatedUser,
          isNewUser: false
        };
      }

      // 用户不存在，尝试通过邮箱查找
      const email = supabaseUser.email;
      if (email) {
        existingUser = await this.findUserByEmail(email);

        if (existingUser) {
          // 找到邮箱匹配的用户，绑定 Supabase ID
          const updatedUser = await this.bindSupabaseToUser(existingUser.id, supabaseUser);
          return {
            user: updatedUser,
            isNewUser: false
          };
        }
      }

      // 用户完全不存在，创建新用户
      const newUser = await this.createUser(supabaseUser);
      return {
        user: newUser,
        isNewUser: true
      };

    } catch (error) {
      console.error('Error in findOrCreateUser:', error);
      throw new Error('用户处理失败');
    }
  }

  /**
   * 通过 Supabase ID 查找用户
   */
  private static async findUserBySupabaseId(supabaseId: string): Promise<any | null> {
    return await prisma.user.findUnique({
      where: {
        supabaseId
      }
    });
  }

  /**
   * 通过邮箱查找用户
   */
  private static async findUserByEmail(email: string): Promise<any | null> {
    return await prisma.user.findUnique({
      where: {
        email
      }
    });
  }

  /**
   * 创建新用户
   */
  private static async createUser(supabaseUser: any): Promise<any> {
    // 处理 Supabase 用户数据
    const createData = UserProcessor.processSupabaseUser(supabaseUser);

    // 设置最后登录时间
    const lastLoginAt = supabaseUser.last_sign_in_at ? new Date(supabaseUser.last_sign_in_at) : new Date();

    try {
      const newUser = await prisma.user.create({
        data: {
          email: createData.email,
          supabaseId: createData.supabaseId,
          provider: createData.provider,
          providerUserId: createData.providerUserId || null,
          avatarUrl: createData.avatarUrl || null,
          username: createData.username || null,
          githubUsername: createData.githubUsername || null,
          githubId: createData.githubId || null,
          googleId: createData.googleId || null,
          emailVerified: createData.emailVerified || false,
          isActive: true,
          lastLoginAt
        }
      });

      return newUser;
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('创建用户失败');
    }
  }

  /**
   * 绑定 Supabase 到现有用户
   */
  private static async bindSupabaseToUser(userId: number, supabaseUser: any): Promise<any> {
    const createData = UserProcessor.processSupabaseUser(supabaseUser);
    const lastLoginAt = supabaseUser.last_sign_in_at ? new Date(supabaseUser.last_sign_in_at) : new Date();

    const updateData: any = {
      lastLoginAt
    };

    // 只更新空值字段，避免覆盖现有数据
    if (createData.avatarUrl) updateData.avatarUrl = createData.avatarUrl;
    if (createData.username) updateData.username = createData.username;
    if (createData.githubUsername) updateData.githubUsername = createData.githubUsername;
    if (createData.githubId) updateData.githubId = createData.githubId;
    if (createData.googleId) updateData.googleId = createData.googleId;
    if (createData.emailVerified) updateData.emailVerified = createData.emailVerified;

    try {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          supabaseId: createData.supabaseId,
          provider: createData.provider,
          providerUserId: createData.providerUserId || null,
          ...updateData
        }
      });

      return updatedUser;
    } catch (error) {
      console.error('Error binding Supabase to user:', error);
      throw new Error('绑定用户失败');
    }
  }

  /**
   * 更新用户最后登录时间
   */
  private static async updateUserLoginTime(userId: number): Promise<any> {
    try {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          lastLoginAt: new Date()
        }
      });

      return updatedUser;
    } catch (error) {
      console.error('Error updating user login time:', error);
      throw new Error('更新登录时间失败');
    }
  }

  /**
   * 通过 ID 获取用户
   */
  static async getUserById(id: number): Promise<any | null> {
    return await prisma.user.findUnique({
      where: { id }
    });
  }

  /**
   * 通过 Supabase ID 获取用户
   */
  static async getUserBySupabaseId(supabaseId: string): Promise<any | null> {
    return await prisma.user.findUnique({
      where: { supabaseId }
    });
  }

  /**
   * 更新用户积分
   */
  static async updateUserCredits(userId: string, credits: number): Promise<any> {
    try {
      const updatedUser = await prisma.user.update({
        where: { supabaseId: userId },
        data: { credits }
      });
      return updatedUser;
    } catch (error) {
      console.error('Error updating user credits:', error);
      throw new Error('更新用户积分失败');
    }
  }

  /**
   * 增加用户积分
   */
  static async addUserCredits(supabaseId: string, amount: number): Promise<any> {
    try {
      const updatedUser = await prisma.user.update({
        where: { supabaseId },
        data: {
          credits: {
            increment: amount
          }
        }
      });
      return updatedUser;
    } catch (error) {
      console.error('Error adding user credits:', error);
      throw new Error('增加用户积分失败');
    }
  }

  /**
   * 扣减用户积分
   */
  static async deductUserCredits(userId: number, amount: number): Promise<any> {
    try {
      // 先检查用户当前积分
      const user = await this.getUserById(userId);
      if (!user) {
        throw new Error('用户不存在');
      }

      if (user.credits < amount) {
        throw new Error('积分不足');
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          credits: {
            decrement: amount
          }
        }
      });
      return updatedUser;
    } catch (error) {
      console.error('Error deducting user credits:', error);
      throw error;
    }
  }
} 
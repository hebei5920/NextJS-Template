import { UserService } from './user-service';

/**
 * 认证处理器 - 处理用户登录回调和认证逻辑
 */
export class AuthService {

  /**
   * 处理 OAuth 登录回调
   * 这是用户登录后的主要入口点
   */
  static async handleOAuthCallback(supabaseUser: any): Promise<any> {
    try {
      console.log('Processing OAuth callback for user:', supabaseUser.id);

      // 验证 Supabase 用户数据
      if (!supabaseUser.id) {
        throw new Error('Invalid Supabase user: missing ID');
      }

      if (!supabaseUser.email) {
        throw new Error('Invalid Supabase user: missing email');
      }

      // 使用 UserService 查找或创建用户
      const result = await UserService.findOrCreateUser(supabaseUser);


      return result;

    } catch (error) {
      console.error('Error handling OAuth callback:', error);
      throw error;
    }
  }


  /**
   * 获取用户信息（用于客户端）
   * 返回安全的用户信息，不包含敏感数据
   */
  static async getUserInfo(supabaseUserId: string): Promise<any> {
    try {
      const user = await UserService.getUserBySupabaseId(supabaseUserId);

      if (!user) {
        return null;
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
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt
      };

    } catch (error) {
      console.error('Error getting user info:', error);
      return null;
    }
  }

  /**
   * 检查用户是否存在
   */
  static async userExists(supabaseUserId: string): Promise<boolean> {
    try {
      const user = await UserService.getUserBySupabaseId(supabaseUserId);
      return user !== null;
    } catch (error) {
      console.error('Error checking user existence:', error);
      return false;
    }
  }
}

/**
 * 使用示例：
 * 
 * // 在 OAuth 回调路由中使用
 * export async function GET(request: Request) {
 *   const { searchParams } = new URL(request.url);
 *   const code = searchParams.get('code');
 *   
 *   if (code) {
 *     const supabase = createServerClient();
 *     const { data, error } = await supabase.auth.exchangeCodeForSession(code);
 *     
 *     if (data.user && !error) {
 *       // 处理用户登录
 *       const result = await AuthService.handleOAuthCallback(data.user);
 *       
 *       // 重定向到应用
 *       return NextResponse.redirect('/dashboard');
 *     }
 *   }
 *   
 *   return NextResponse.redirect('/auth/error');
 * }
 * 
 * // 在 API 路由中获取用户信息
 * export async function GET(request: Request) {
 *   const supabase = createServerClient();
 *   const { data: { user } } = await supabase.auth.getUser();
 *   
 *   if (user) {
 *     const userInfo = await AuthService.getUserInfo(user.id);
 *     return NextResponse.json({ user: userInfo });
 *   }
 *   
 *   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 * }
 */ 
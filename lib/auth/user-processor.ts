/**
 * 用户数据处理器 - 将 Supabase 用户数据转换为数据库格式
 */
export class UserProcessor {
  
  /**
   * 将 Supabase 用户数据转换为数据库创建数据
   */
  static processSupabaseUser(supabaseUser: any): any {
    const provider = supabaseUser.app_metadata?.provider || 'email';
    const metadata = supabaseUser.user_metadata;
    const identity = supabaseUser.identities?.[0];
    const identityData = identity?.identity_data;

    // 获取邮箱
    const email = supabaseUser.email || metadata.email || identityData?.email || '';

    const createData: any = {
      email,
      supabaseId: supabaseUser.id,
      provider,
      emailVerified: !!(supabaseUser.email_confirmed_at || supabaseUser.confirmed_at),
    };

    // 根据提供商处理特定字段
    switch (provider) {
      case 'google':
        this.processGoogleData(createData, metadata, identityData);
        break;
      case 'github':
        this.processGitHubData(createData, metadata, identityData);
        break;
    }

    return createData;
  }

  /**
   * 处理 Google 用户数据
   */
  private static processGoogleData( 
    createData: any, 
    metadata: any, 
    identityData?: any
  ): void {
    // Google ID
    createData.googleId = metadata.sub || identityData?.sub;
    
    // 提供商用户ID
    createData.providerUserId = createData.googleId;
    
    // 头像
    createData.avatarUrl = metadata.picture || identityData?.picture;
    
    // 用户名（Google 通常不提供用户名，使用邮箱前缀）
    if (!createData.username && createData.email) {
      createData.username = createData.email.split('@')[0];
    }
  }

  /**
   * 处理 GitHub 用户数据
   */
  private static processGitHubData(
    createData: any, 
    metadata: any, 
    identityData?: any
  ): void {
    // GitHub ID
    const githubId = metadata.id || identityData?.id;
    createData.githubId = githubId;
    
    // 提供商用户ID
    createData.providerUserId = githubId ? String(githubId) : undefined;
    
    // GitHub 用户名
    const githubLogin = metadata.login || identityData?.login;
    createData.githubUsername = githubLogin;
    createData.username = githubLogin;
    
    // 头像
    createData.avatarUrl = metadata.avatar_url || identityData?.avatar_url;
  }

  /**
   * 获取提供商类型
   */
  static getProvider(supabaseUser: any): any {
    return (supabaseUser.app_metadata?.provider as any) || 'email';
  }
} 
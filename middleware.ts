import { withAuth } from 'next-auth/middleware';

export default withAuth(
  function middleware(req) {
    // 中间件逻辑可以在这里添加
    console.log('Middleware executed for:', req.nextUrl.pathname);
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        console.log('Checking authorization for:', pathname, 'Token exists:', !!token);

        // 公开路由 - 不需要登录
        const publicRoutes = [
          '/',
          '/login',
        ];

        // 公开的API路由 - 认证相关的API
        const publicApiRoutes = [
          '/api/auth/signin',
          '/api/auth/signout',
          '/api/auth/session',
          '/api/auth/providers',
          '/api/auth/callback',
          '/api/auth/csrf',
        ];

        // 如果是公开路由，允许访问
        if (publicRoutes.includes(pathname)) {
          return true;
        }

        // 如果是公开API路由，允许访问
        if (publicApiRoutes.some(route => pathname.startsWith(route))) {
          return true;
        }

        // 其他所有路由都需要登录
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * 匹配所有路径除了:
     * - /_next/static (静态文件)
     * - /_next/image (图像优化文件)  
     * - /favicon.ico (favicon文件)
     * - 公开资源文件
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}; 
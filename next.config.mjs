import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 性能优化
  poweredByHeader: false, // 移除 X-Powered-By 头
  compress: true, // 启用 gzip 压缩
  reactStrictMode: true, // 启用严格模式
  swcMinify: true, // 使用 SWC 进行压缩

  // 构建优化
  output: 'standalone', // 生成独立的构建输出
  productionBrowserSourceMaps: false, // 生产环境不生成 source maps
  optimizeFonts: true, // 优化字体加载
  images: {
    domains: [], // 添加你的图片域名
    formats: ['image/avif', 'image/webp'], // 启用现代图片格式
  },

  // 开发体验
  experimental: {
    serverActions: true,
    optimizeCss: true, // 优化 CSS
    scrollRestoration: true, // 优化滚动恢复
   },

  // webpack 优化
  webpack: (config, { dev, isServer }) => {
    // 忽略 Supabase realtime 相关的可选依赖
    config.externals = config.externals || [];
    config.externals.push({
      'bufferutil': 'bufferutil',
      'utf-8-validate': 'utf-8-validate',
    });

    // 生产环境优化
    if (!dev) {
      // 代码分割优化
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          maxSize: 244000,
          cacheGroups: {
            default: false,
            vendors: false,
            // 公共模块
            commons: {
              name: 'commons',
              chunks: 'all',
              minChunks: 2,
            },
            // 共享模块
            shared: {
              name: 'shared',
              chunks: 'all',
              minChunks: 2,
              priority: 10,
            },
          },
        },
      };
    }

    // 对于客户端构建，完全忽略这些模块
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'bufferutil': false,
        'utf-8-validate': false,
      };
    }

    return config;
  },

  // 安全配置
  headers: async () => {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);

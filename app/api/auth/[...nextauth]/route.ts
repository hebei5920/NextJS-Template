import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import CredentialsProvider from 'next-auth/providers/credentials';
import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import bcrypt from 'bcryptjs';
import { connectDB, User } from '@/models';
import { MongoClient } from 'mongodb';

// 强制动态渲染
export const dynamic = 'force-dynamic';

const client = new MongoClient(process.env.MONGODB_URI!);
const clientPromise = client.connect();

const handler = NextAuth({
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      httpOptions: {
        timeout: 300000
      }
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      httpOptions: {
        timeout: 300000
      }
    }),
    CredentialsProvider({
      id: 'credentials',
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Missing credentials');
        }

        try {
          await connectDB();

          const user = await User.findOne({ email: credentials.email }).select('+password');

          if (!user) {
            throw new Error('User not found');
          }

          if (!user.password) {
            throw new Error('Please use social login');
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

          if (!isPasswordValid) {
            throw new Error('Invalid password');
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            image: user.avatar,
          };
        } catch (error: any) {
          console.error('Auth error:', error);
          throw new Error(error.message || 'Authentication failed');
        }
      }
    })
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
      }

      // 处理OAuth登录（Google, GitHub等）
      if ((account?.provider === 'google' || account?.provider === 'github') && user) {
        try {
          await connectDB();

          // 查找或创建用户
          let dbUser = await User.findOne({ email: user.email });

          if (!dbUser) {
            dbUser = await User.create({
              email: user.email,
              name: user.name,
              avatar: user.image,
              provider: account.provider,
              providerId: account.providerAccountId,
              emailVerified: new Date(), // OAuth账户默认邮箱已验证
              isEmailVerified: true,
            });
          } else if (!dbUser.providerId) {
            // 更新现有用户的OAuth信息
            dbUser.provider = account.provider;
            dbUser.providerId = account.providerAccountId;
            dbUser.avatar = user.image;
            dbUser.emailVerified = new Date();
            dbUser.isEmailVerified = true;
            await dbUser.save();
          }

          token.id = dbUser._id.toString();
        } catch (error) {
          console.error('JWT callback error:', error);
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;

        // 获取最新的用户信息
        try {
          await connectDB();
          const user = await User.findById(token.id);
          if (user) {
            session.user.name = user.name;
            session.user.email = user.email;
            session.user.image = user.avatar;
          }
        } catch (error) {
          console.error('Session callback error:', error);
        }
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      // 允许所有认证成功的登录
      return true;
    },
  },
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log('User signed in:', { user: user.email, provider: account?.provider });

      // 更新最后登录时间
      try {
        await connectDB();
        await User.findByIdAndUpdate(user.id, {
          lastLoginAt: new Date()
        });
      } catch (error) {
        console.error('Failed to update last login:', error);
      }
    },
    async signOut({ session, token }) {
      console.log('User signed out:', session?.user?.email);
    },
  },
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET

});

export { handler as GET, handler as POST }; 
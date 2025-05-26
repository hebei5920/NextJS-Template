import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function verifyAuth(request: NextRequest) {
  try {
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET 
    });

    if (!token) {
      return {
        success: false,
        error: 'Unauthorized - Please login first',
        status: 401
      };
    }

    return {
      success: true,
      userId: token.id as string,
      user: {
        id: token.id as string,
        email: token.email as string,
        name: token.name as string,
      }
    };
  } catch (error) {
    console.error('Auth verification error:', error);
    return {
      success: false,
      error: 'Authentication failed',
      status: 500
    };
  }
} 
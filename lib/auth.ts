import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * JWT 토큰의 만료 시간을 디코딩하여 반환
 */
function getTokenExpiry(token: string): number {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    return payload.exp * 1000; // JWT의 exp는 초 단위이므로 밀리초로 변환
  } catch (error) {
    return 0;
  }
}

/**
 * Refresh Token을 이용하여 새로운 Access Token을 받아오는 함수
 */
async function refreshAccessToken(refreshToken: string) {
  try {
    if (!API_BASE_URL) {
      return null;
    }

    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      return null;
    }

    const refreshedTokens = await response.json();

    return {
      accessToken: refreshedTokens.access_token,
      refreshToken: refreshedTokens.refresh_token,
      accessTokenExpires: getTokenExpiry(refreshedTokens.access_token),
    };
  } catch (error) {
    return null;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: '이메일', type: 'email' },
        password: { label: '비밀번호', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        if (!API_BASE_URL) {
          console.error('API_BASE_URL이 설정되지 않았습니다.');
          return null;
        }

        try {
          const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          if (!response.ok) {
            return null;
          }

          const loginData = await response.json();

          if (!loginData.access_token || !loginData.refresh_token) {
            return null;
          }

          // 사용자 정보 가져오기
          const userResponse = await fetch(`${API_BASE_URL}/users/me`, {
            headers: {
              'Authorization': `Bearer ${loginData.access_token}`,
            },
          });

          if (!userResponse.ok) {
            return null;
          }

          const userData = await userResponse.json();

          return {
            id: userData.id.toString(),
            email: userData.email,
            name: userData.full_name || userData.username,
            role: userData.role,
            accessToken: loginData.access_token,
            refreshToken: loginData.refresh_token,
            accessTokenExpires: getTokenExpiry(loginData.access_token),
          };
        } catch (error) {
          console.error('인증 중 오류 발생:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // 초기 로그인 시
      if (user) {
        token.accessToken = (user as any).accessToken;
        token.refreshToken = (user as any).refreshToken;
        token.accessTokenExpires = (user as any).accessTokenExpires;
        token.role = (user as any).role;
        return token;
      }

      // 토큰이 아직 유효한 경우
      if (token.accessTokenExpires && Date.now() < token.accessTokenExpires) {
        return token;
      }

      // 토큰이 만료된 경우 refresh 시도
      if (token.refreshToken) {
        const refreshedTokens = await refreshAccessToken(token.refreshToken);
        
        if (refreshedTokens) {
          return {
            ...token,
            accessToken: refreshedTokens.accessToken,
            refreshToken: refreshedTokens.refreshToken,
            accessTokenExpires: refreshedTokens.accessTokenExpires,
          };
        }
      }

      // refresh 실패 시 토큰 무효화
      return {
        ...token,
        accessToken: undefined,
        refreshToken: undefined,
        accessTokenExpires: undefined,
      };
    },
    async session({ session, token }) {
      if (token) {
        session.accessToken = token.accessToken as string;
        session.refreshToken = token.refreshToken as string;
        session.accessTokenExpires = token.accessTokenExpires as number;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login', // 에러 시 로그인 페이지로 리다이렉트
  },
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7일 (refresh token 만료 시간에 맞춤)
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
  // JWT 설정 개선
  jwt: {
    maxAge: 7 * 24 * 60 * 60, // 7일
  },
}; 
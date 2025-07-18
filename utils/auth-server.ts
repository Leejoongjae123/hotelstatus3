import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';

/**
 * 서버 사이드에서 현재 세션의 토큰이 유효한지 확인
 */
export async function getValidSession() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.accessToken) {
      return null;
    }

    // 토큰 만료 확인
    if (session.accessTokenExpires && Date.now() >= session.accessTokenExpires) {
      return null;
    }

    return session;
  } catch (error) {
    console.error('세션 확인 중 오류:', error);
    return null;
  }
}

/**
 * 서버 사이드에서 인증된 API 요청을 위한 헤더 생성
 */
export async function getServerAuthHeaders(): Promise<Record<string, string> | null> {
  const session = await getValidSession();
  
  if (!session?.accessToken) {
    return null;
  }

  return {
    'Authorization': `Bearer ${session.accessToken}`,
    'Content-Type': 'application/json',
  };
}

/**
 * 서버 사이드에서 인증된 fetch 요청
 */
export async function authenticatedServerFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response | null> {
  const headers = await getServerAuthHeaders();
  
  if (!headers) {
    return null;
  }

  return fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });
}

/**
 * 인증 실패 응답 생성
 */
export function createUnauthorizedResponse(message: string = '인증이 필요합니다.') {
  return NextResponse.json(
    { error: message },
    { status: 401 }
  );
}

/**
 * API Route에서 인증 검사를 위한 미들웨어 함수
 */
export async function withAuth<T>(
  handler: (session: NonNullable<Awaited<ReturnType<typeof getValidSession>>>) => Promise<T>
): Promise<T | NextResponse> {
  const session = await getValidSession();
  
  if (!session) {
    return createUnauthorizedResponse();
  }

  return handler(session);
} 
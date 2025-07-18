import { getSession, signOut } from 'next-auth/react';

/**
 * 현재 세션의 토큰이 유효한지 확인
 */
export async function isTokenValid(): Promise<boolean> {
  const session = await getSession();
  
  if (!session?.accessToken || !session?.accessTokenExpires) {
    return false;
  }

  // 토큰 만료 5분 전을 여유시간으로 설정
  const bufferTime = 5 * 60 * 1000; // 5분
  return Date.now() < (session.accessTokenExpires - bufferTime);
}

/**
 * API 호출을 위한 Authorization 헤더 반환
 */
export async function getAuthHeaders(): Promise<Record<string, string>> {
  const session = await getSession();
  
  if (!session?.accessToken) {
    return {};
  }

  return {
    'Authorization': `Bearer ${session.accessToken}`,
  };
}

/**
 * 인증된 API 요청을 위한 fetch 래퍼
 * 토큰이 무효하거나 만료된 경우 자동으로 로그아웃 처리
 */
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const session = await getSession();
  
  if (!session?.accessToken) {
    throw new Error('로그인이 필요합니다.');
  }

  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${session.accessToken}`,
    'Content-Type': 'application/json',
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // 401 Unauthorized 응답인 경우 자동 로그아웃
  if (response.status === 401) {
    await signOut({ callbackUrl: '/login' });
    throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
  }

  return response;
}

/**
 * 세션 상태 확인 및 자동 갱신
 * 컴포넌트에서 주기적으로 호출하여 세션 상태를 확인
 */
export async function validateSession(): Promise<boolean> {
  try {
    const valid = await isTokenValid();
    
    if (!valid) {
      const session = await getSession();
      
      // 세션은 있지만 토큰이 무효한 경우 로그아웃
      if (session) {
        await signOut({ callbackUrl: '/login' });
      }
      
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('세션 검증 중 오류:', error);
    return false;
  }
}

/**
 * 백엔드 로그아웃 API 호출
 * 서버에서 refresh token을 무효화
 */
export async function logoutFromBackend(): Promise<void> {
  try {
    const session = await getSession();
    
    if (!session?.refreshToken || !process.env.NEXT_PUBLIC_API_BASE_URL) {
      return;
    }

    await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessToken}`,
      },
      body: JSON.stringify({
        refresh_token: session.refreshToken,
      }),
    });
  } catch (error) {
    // 백엔드 로그아웃이 실패해도 클라이언트 로그아웃은 진행
    console.error('백엔드 로그아웃 중 오류:', error);
  }
}

/**
 * 완전한 로그아웃 처리
 * 백엔드에서 refresh token 무효화 후 클라이언트 세션 종료
 */
export async function completeLogout(): Promise<void> {
  await logoutFromBackend();
  await signOut({ callbackUrl: '/login' });
} 
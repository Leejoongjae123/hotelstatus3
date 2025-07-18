import { NextRequest, NextResponse } from 'next/server';
import { withAuth, authenticatedServerFetch } from '@/utils/auth-server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function GET(request: NextRequest) {
  return withAuth(async (session) => {
    try {
      // URL에서 쿼리 파라미터 추출
      const { searchParams } = new URL(request.url);
      const page = searchParams.get('page') || '1';
      const limit = searchParams.get('limit') || '10';

      const response = await authenticatedServerFetch(
        `${API_BASE_URL}/hotel-platforms?page=${page}&limit=${limit}`,
        { method: 'GET' }
      );

      if (!response) {
        return NextResponse.json(
          { error: '인증이 필요합니다.' },
          { status: 401 }
        );
      }

      const data = await response.json();

      if (!response.ok) {
        let errorMessage = '호텔 플랫폼 정보를 가져올 수 없습니다.';
        
        if (data.detail) {
          if (typeof data.detail === 'string') {
            errorMessage = data.detail;
          } else if (Array.isArray(data.detail)) {
            errorMessage = '입력 데이터에 오류가 있습니다.';
          }
        }
        
        return NextResponse.json(
          { error: errorMessage },
          { status: response.status }
        );
      }

      return NextResponse.json(data);
    } catch (error) {
      return NextResponse.json(
        { error: '서버 오류가 발생했습니다.' },
        { status: 500 }
      );
    }
  });
}

export async function POST(request: NextRequest) {
  return withAuth(async (session) => {
    try {
      const body = await request.json();

      // status 필드가 없으면 기본값 설정
      if (!body.status) {
        body.status = 'active';
      }

      const response = await authenticatedServerFetch(
        `${API_BASE_URL}/hotel-platforms`,
        {
          method: 'POST',
          body: JSON.stringify(body),
        }
      );

      if (!response) {
        return NextResponse.json(
          { error: '인증이 필요합니다.' },
          { status: 401 }
        );
      }

      const data = await response.json();

      if (!response.ok) {
        let errorMessage = '호텔 플랫폼 정보를 저장할 수 없습니다.';
        
        if (data.detail) {
          if (typeof data.detail === 'string') {
            errorMessage = data.detail;
          } else if (Array.isArray(data.detail)) {
            errorMessage = '입력 데이터에 오류가 있습니다.';
          }
        }
        
        return NextResponse.json(
          { error: errorMessage },
          { status: response.status }
        );
      }

      return NextResponse.json(data);
    } catch (error) {
      return NextResponse.json(
        { error: '서버 오류가 발생했습니다.' },
        { status: 500 }
      );
    }
  });
} 
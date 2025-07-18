import { NextRequest, NextResponse } from 'next/server';
import { withAuth, authenticatedServerFetch } from '@/utils/auth-server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export async function GET(request: NextRequest) {
  return withAuth(async (session) => {
    try {
      const { searchParams } = new URL(request.url);
      
      // 쿼리 파라미터 추출
      const page = searchParams.get('page') || '1';
      const limit = searchParams.get('limit') || '10';
      const agent = searchParams.get('agent') || '';
      const result = searchParams.get('result') || '';
      const platform = searchParams.get('platform') || '';

      // FastAPI 엔드포인트를 위한 URL 구성
      const params = new URLSearchParams({
        page,
        limit,
        ...(agent && { agent }),
        ...(result && { result }),
        ...(platform && { platform })
      });

      // FastAPI 서버로 인증된 요청
      const response = await authenticatedServerFetch(
        `${API_BASE_URL}/logs?${params}`,
        { 
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (!response) {
        return NextResponse.json(
          { error: '인증이 필요합니다. 로그인 후 다시 시도해주세요.' },
          { status: 401 }
        );
      }

      if (!response.ok) {
        let errorMessage = '로그 데이터를 가져올 수 없습니다.';
        
        try {
          const errorData = await response.json();
          if (errorData.detail) {
            errorMessage = errorData.detail;
          }
        } catch (parseError) {
          // JSON 파싱 실패 시 기본 메시지 사용
        }

        return NextResponse.json(
          { error: errorMessage },
          { status: response.status }
        );
      }

      const data = await response.json();
      
      // FastAPI 응답 데이터 구조에 맞게 변환
      return NextResponse.json({
        items: data.items || [],
        total: data.total || 0,
        page: data.page || parseInt(page),
        limit: data.limit || parseInt(limit),
        total_pages: data.total_pages || 1,
        has_next: data.has_next || false,
        has_prev: data.has_prev || false
      });

    } catch (error) {
      console.error('로그 API 에러:', error);
      return NextResponse.json(
        { error: 'FastAPI 서버 연결에 실패했습니다. 서버가 실행 중인지 확인해주세요.' },
        { status: 500 }
      );
    }
  });
} 
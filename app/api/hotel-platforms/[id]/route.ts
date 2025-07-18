import { NextRequest, NextResponse } from 'next/server';
import { withAuth, authenticatedServerFetch } from '@/utils/auth-server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  return withAuth(async (session) => {
    try {
      const { id } = await params;

      const response = await authenticatedServerFetch(
        `${API_BASE_URL}/hotel-platforms/${id}`,
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (session) => {
    try {
      const { id } = await params;
      const body = await request.json();

      const response = await authenticatedServerFetch(
        `${API_BASE_URL}/hotel-platforms/${id}`,
        {
          method: 'PUT',
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
        let errorMessage = '호텔 플랫폼 정보를 수정할 수 없습니다.';
        
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (session) => {
    try {
      const { id } = await params;

      const response = await authenticatedServerFetch(
        `${API_BASE_URL}/hotel-platforms/${id}`,
        { method: 'DELETE' }
      );

      if (!response) {
        return NextResponse.json(
          { error: '인증이 필요합니다.' },
          { status: 401 }
        );
      }

      if (!response.ok) {
        const data = await response.json();
        let errorMessage = '호텔 플랫폼 정보를 삭제할 수 없습니다.';
        
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

      return NextResponse.json({ message: '삭제되었습니다.' });
    } catch (error) {
      return NextResponse.json(
        { error: '서버 오류가 발생했습니다.' },
        { status: 500 }
      );
    }
  });
} 
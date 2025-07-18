'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (status === 'loading') return; // 로딩 중이면 대기
    
    if (status === 'unauthenticated') {
      setIsRedirecting(true);
      router.push('/login');
    }
  }, [status, router]);

  // 로딩 중이거나 리다이렉트 중일 때
  if (status === 'loading' || isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">
            {isRedirecting ? '로그인 페이지로 이동 중...' : '인증 확인 중...'}
          </p>
        </div>
      </div>
    );
  }

  // 인증되지 않은 경우
  if (status === 'unauthenticated') {
    return null; // 리다이렉트 중이므로 아무것도 렌더링하지 않음
  }

  // 인증된 경우에만 children 렌더링
  return <>{children}</>;
} 
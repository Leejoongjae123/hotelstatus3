import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function Home() {
  try {
    const session = await getServerSession(authOptions);
    
    if (session) {
      redirect('/dashboard');
    } else {
      redirect('/login');
    }
  } catch (error) {
    // 세션 확인 중 오류가 발생한 경우 로그인 페이지로 리다이렉트
    redirect('/login');
  }
}

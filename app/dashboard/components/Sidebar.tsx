'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { completeLogout } from '@/utils/auth';
import { 
  User, 
  FileText,
  LogOut,
  Hotel,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useSidebarStore } from '@/store/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import Link from 'next/link';
export default function Sidebar() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const { isOpen, close } = useSidebarStore();

  const handleLogout = async () => {
    await completeLogout();
  };

  // 모바일에서 라우트 변경 시 사이드바 닫기
  useEffect(() => {
    if (isMobile) {
      close();
    }
  }, [pathname, isMobile, close]);

  // 모바일에서 오버레이 클릭 시 사이드바 닫기
  const handleOverlayClick = () => {
    if (isMobile) {
      close();
    }
  };

  const menuItems = [
    {
      name: '로그인 정보',
      href: '/dashboard/login-info',
      icon: User,
    },
    {
      name: '로그 메뉴',
      href: '/dashboard/logs',
      icon: FileText,
    },
  ];

  const isActive = (href: string) => {
    return pathname === href;
  };

  // 데스크톱에서는 항상 표시
  if (!isMobile) {
    return (
      <div className="flex flex-col h-full bg-card border-r w-64">
        {/* 헤더 */}
        <div className="p-6 border-b">
          <Link href="/dashboard">
          <div className="flex items-center gap-2">
            <Hotel className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-bold">예약관리 솔루션</h1>
          </div>
          </Link>
        </div>

        {/* 사용자 정보 */}
        <div className="p-6 border-b w-full flex justify-center">
          <div className="flex items-center gap-3 justify-center w-full">
            <div className="w-full flex flex-col justify-center items-center">
              <p className="text-lg font-bold truncate">
                {session?.user?.name || '사용자'}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {session?.user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* 메뉴 */}
        <div className="flex-1 p-4">
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.href}
                  variant={isActive(item.href) ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => router.push(item.href)}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {item.name}
                </Button>
              );
            })}
          </nav>
        </div>

        {/* 로그아웃 */}
        <div className="p-4 border-t">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-destructive hover:text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            로그아웃
          </Button>
        </div>
      </div>
    );
  }

  // 모바일에서는 오버레이와 함께 표시
  return (
    <>
      {/* 오버레이 */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={handleOverlayClick}
        />
      )}
      
      {/* 사이드바 */}
      <div className={`
        fixed left-0 top-0 h-full bg-card border-r w-64 z-50 transform transition-transform duration-300 ease-in-out md:hidden
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* 헤더 */}
        <div className="p-6 border-b flex items-center justify-between">
          <Link href="/dashboard">
          <div className="flex items-center gap-2">
            <Hotel className="h-8 w-8 text-primary" />
            <h1 className="text-lg font-bold">예약관리 솔루션</h1>
          </div>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={close}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* 사용자 정보 */}
        <div className="p-6 border-b w-full flex justify-center">
          <div className="flex items-center gap-3 justify-center w-full">
            <div className="w-full flex flex-col justify-center items-center">
              <p className="text-lg font-bold truncate">
                {session?.user?.name || '사용자'}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {session?.user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* 메뉴 */}
        <div className="flex-1 p-4">
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.href}
                  variant={isActive(item.href) ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => router.push(item.href)}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {item.name}
                </Button>
              );
            })}
          </nav>
        </div>

        {/* 로그아웃 */}
        <div className="p-4 border-t">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-destructive hover:text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            로그아웃
          </Button>
        </div>
      </div>
    </>
  );
} 
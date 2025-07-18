import Sidebar from './components/Sidebar';
import MobileHeader from './components/MobileHeader';
import AuthGuard from '@/components/AuthGuard';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <MobileHeader />
          <main className="flex-1 overflow-auto bg-muted/30">
            <div className="h-full md:p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
} 
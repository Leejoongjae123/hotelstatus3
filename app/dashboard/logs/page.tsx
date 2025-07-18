import { Suspense } from 'react';
import LogsTable from './components/LogsTable';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function LogsPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">로그 관리</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          시스템에서 발생한 로그와 활동 내역을 조회하고 관리합니다.
        </p>
      </div>

      <Suspense fallback={
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">로그를 불러오는 중...</p>
          </CardContent>
        </Card>
      }>
        <LogsTable />
      </Suspense>
    </div>
  );
} 
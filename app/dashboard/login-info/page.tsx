import LoginInfoTable from './components/LoginInfoTable';

export default function LoginInfoPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">로그인 정보 관리</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          호텔 플랫폼별 로그인 정보를 관리합니다.
        </p>
      </div>

      <LoginInfoTable />
    </div>
  );
} 
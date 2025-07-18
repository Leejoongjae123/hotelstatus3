'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Platform } from '@/app/types';
import { PlatformModalProps, PlatformFormData } from './types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

// 기본 플랫폼 목록을 상수로 정의 (새로운 API 값 사용)
const DEFAULT_PLATFORMS: Platform[] = [
  { value: 'YANOLJA', name: '야놀자' },
  { value: 'GOOD_CHOICE', name: '여기어때_사장님' },
  { value: 'GOOD_CHOICE_HOTEL', name: '여기어때_파트너' },
  { value: 'NAVER', name: '네이버' },
  { value: 'AIR_BNB', name: '에어비앤비' },
  { value: 'AGODA', name: '아고다' },
  { value: 'BOOKING_HOLDINGS', name: '부킹닷컴' },
  { value: 'EXPEDIA', name: '익스피디아' }
];

export default function PlatformModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  editingPlatform 
}: PlatformModalProps) {
  const [formData, setFormData] = useState<PlatformFormData>({
    platform: '',
    login_id: '',
    login_password: '',
    hotel_name: '',
    mfa_id: '',
    mfa_password: '',
    mfa_platform: '',
    status: 'active',
  });
  // 초기값을 기본 플랫폼 목록으로 설정
  const [platforms, setPlatforms] = useState<Platform[]>(DEFAULT_PLATFORMS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { data: session } = useSession();

  const mfaPlatforms = [
    { value: '구글', name: '구글' },
    { value: '네이버', name: '네이버' },
    
  ];

  const statusOptions = [
    { value: 'active', name: '활성' },
    { value: 'inactive', name: '비활성' },
  ];

  useEffect(() => {
    if (isOpen) {
      // 기본 플랫폼 목록으로 초기화 (API 호출 제거)
      setPlatforms(DEFAULT_PLATFORMS);
      
      if (editingPlatform) {
        setFormData({
          platform: editingPlatform.platform,
          login_id: editingPlatform.login_id,
          login_password: editingPlatform.login_password,
          hotel_name: editingPlatform.hotel_name,
          mfa_id: editingPlatform.mfa_id || '',
          mfa_password: editingPlatform.mfa_password || '',
          mfa_platform: editingPlatform.mfa_platform || '',
          status: editingPlatform.status || 'active',
        });
      } else {
        setFormData({
          platform: '',
          login_id: '',
          login_password: '',
          hotel_name: '',
          mfa_id: '',
          mfa_password: '',
          mfa_platform: '',
          status: 'active',
        });
      }
      setError('');
    }
  }, [isOpen, editingPlatform]);

  // fetchPlatforms 함수 제거 (더 이상 사용하지 않음)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.accessToken) {
      setError('인증이 필요합니다.');
      return;
    }

    if (!formData.platform || !formData.login_id || !formData.login_password || !formData.hotel_name) {
      setError('필수 필드를 모두 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const url = editingPlatform 
        ? `/api/hotel-platforms/${editingPlatform.id}`
        : `/api/hotel-platforms`;

      const method = editingPlatform ? 'PUT' : 'POST';

      const requestBody: any = {
        login_id: formData.login_id,
        login_password: formData.login_password,
        hotel_name: formData.hotel_name,
        mfa_id: formData.mfa_id,
        mfa_password: formData.mfa_password,
        mfa_platform: formData.mfa_platform,
        status: formData.status,
      };

      if (!editingPlatform) {
        requestBody.platform = formData.platform;
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        // 에러 처리 개선: 객체인 경우 문자열로 변환
        let errorMessage = '저장 중 오류가 발생했습니다.';
        
        if (data.detail) {
          if (typeof data.detail === 'string') {
            errorMessage = data.detail;
          } else if (Array.isArray(data.detail)) {
            errorMessage = '입력 데이터에 오류가 있습니다.';
          }
        } else if (data.error) {
          if (typeof data.error === 'string') {
            errorMessage = data.error;
          }
        }
        
        setError(errorMessage);
        return;
      }

      onSuccess();
      onClose();
    } catch (error) {
      setError('서버 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {editingPlatform ? '플랫폼 정보 수정' : '새 플랫폼 추가'}
          </DialogTitle>
          <DialogDescription>
            호텔 플랫폼의 로그인 정보를 {editingPlatform ? '수정' : '입력'}해주세요.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 플랫폼 선택 (수정 시 비활성화) */}
          <div className="space-y-2">
            <Label htmlFor="platform">플랫폼 <span className="text-destructive">*</span></Label>
            {editingPlatform ? (
              <Input 
                value={platforms.find(p => p.value === formData.platform)?.name || formData.platform}
                disabled
                className="bg-muted"
              />
            ) : (
              <Select 
                value={formData.platform} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, platform: value as import('@/app/types').PlatformType }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="플랫폼을 선택해주세요" />
                </SelectTrigger>
                <SelectContent>
                  {platforms.map((platform) => (
                    <SelectItem key={platform.value} value={platform.value}>
                      {platform.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* 상태 선택 */}
          <div className="space-y-2">
            <Label htmlFor="status">상태 <span className="text-destructive">*</span></Label>
            <Select 
              value={formData.status} 
              onValueChange={(value: 'active' | 'inactive') => setFormData(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="상태를 선택해주세요" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 로그인 ID */}
          <div className="space-y-2">
            <Label htmlFor="login_id">로그인 ID <span className="text-destructive">*</span></Label>
            <Input
              id="login_id"
              type="text"
              value={formData.login_id}
              onChange={(e) => setFormData(prev => ({ ...prev, login_id: e.target.value }))}
              placeholder="플랫폼 로그인 ID를 입력하세요"
            />
          </div>

          {/* 로그인 비밀번호 */}
          <div className="space-y-2">
            <Label htmlFor="login_password">로그인 비밀번호 <span className="text-destructive">*</span></Label>
            <Input
              id="login_password"
              type="password"
              value={formData.login_password}
              onChange={(e) => setFormData(prev => ({ ...prev, login_password: e.target.value }))}
              placeholder="플랫폼 로그인 비밀번호를 입력하세요"
            />
          </div>

          {/* 호텔명 */}
          <div className="space-y-2">
            <Label htmlFor="hotel_name">호텔명 <span className="text-destructive">*</span></Label>
            <Input
              id="hotel_name"
              type="text"
              value={formData.hotel_name}
              onChange={(e) => setFormData(prev => ({ ...prev, hotel_name: e.target.value }))}
              placeholder="호텔명을 입력하세요"
            />
          </div>

          {/* MFA 정보 (선택사항) */}
          <div className="space-y-4 border-t pt-4">
            <h4 className="text-sm font-medium">MFA 정보 (선택사항)</h4>
            
            
            <div className="space-y-2">
              <Label htmlFor="mfa_id">MFA ID</Label>
              <Input
                id="mfa_id"
                type="text"
                value={formData.mfa_id}
                onChange={(e) => setFormData(prev => ({ ...prev, mfa_id: e.target.value }))}
                placeholder="MFA ID를 입력하세요"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mfa_password">MFA 비밀번호</Label>
              <Input
                id="mfa_password"
                type="password"
                value={formData.mfa_password}
                onChange={(e) => setFormData(prev => ({ ...prev, mfa_password: e.target.value }))}
                placeholder="MFA 비밀번호를 입력하세요"
              />
            </div>

            <div className="space-y-2 w-full">
              <Label htmlFor="mfa_platform">MFA 플랫폼</Label>
              <Select 
                
                value={formData.mfa_platform} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, mfa_platform: value }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="MFA 플랫폼을 선택해주세요" />
                </SelectTrigger>
                <SelectContent>
                  {mfaPlatforms.map((platform) => (
                    <SelectItem key={platform.value} value={platform.value}>
                      {platform.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingPlatform ? '수정' : '추가'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 
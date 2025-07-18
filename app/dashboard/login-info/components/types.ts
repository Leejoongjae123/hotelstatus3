export interface PlatformFormData {
  platform: import('@/app/types').PlatformType;
  login_id: string;
  login_password: string;
  hotel_name: string;
  mfa_id?: string;
  mfa_password?: string;
  mfa_platform?: string;
  status: 'active' | 'inactive';
}

export interface PlatformModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingPlatform?: PlatformFormData & { id: number } | null;
}

// API 응답 구조 타입 추가
export interface PlatformListResponse {
  items: import('@/app/types').HotelPlatform[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
} 
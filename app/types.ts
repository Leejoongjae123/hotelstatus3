export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HotelPlatform {
  id: number;
  user_id: number;
  platform: PlatformType;
  login_id: string;
  login_password?: string;
  hotel_name: string;
  mfa_id?: string;
  mfa_password?: string;
  mfa_platform?: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface Platform {
  value: string;
  name: string;
}

// 플랫폼 타입 정의
export type PlatformType = 
  | ''
  | 'YANOLJA'
  | 'GOOD_CHOICE'
  | 'GOOD_CHOICE_HOTEL'
  | 'NAVER'
  | 'AIR_BNB'
  | 'AGODA'
  | 'BOOKING_HOLDINGS'
  | 'EXPEDIA'; 
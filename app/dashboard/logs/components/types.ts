export interface Log {
  id: number;
  user_id: string;
  accom_id?: string;
  room_reserve_id?: string;
  ota_place_name?: string;
  prepaid?: number;
  fee?: number;
  check_in_sched?: number | string;
  check_out_sched?: number | string;
  visit_type?: "ON_CAR" | "ON_FOOT" | "WALK_IN" | "";
  stay_type?: "DAYS" | "HOURS" | "";
  reserve_no?: string;
  phone?: string;
  guest_name?: string;
  ota_room_name?: string;
  canceled?: boolean;
  agent?: "YANOLJA" | "YEOGI_BOSS" | "YEOGI_PARTNER" | "NAVER" | "AIRBNB" | "AGODA" | "BOOKING" | "EXPEDIA" | "";
  result?: "success" | "fail" | "";
  description?: "LOGIN_FAIL" | "PARSING_FAIL" | "NETWORK_ERROR" | "EMPTY" | "";
  error_message?: string;
  // 호텔 플랫폼 관련 필드들
  platform?: "YANOLJA" | "GOOD_CHOICE" | "GOOD_CHOICE_HOTEL" | "NAVER" | "AIR_BNB" | "AGODA" | "BOOKING_HOLDINGS" | "EXPEDIA" | "";
  login_id?: string;
  login_password?: string;
  hotel_name?: string;
  mfa_id?: string;
  mfa_password?: string;
  mfa_platform?: string;
  platform_status?: "active" | "inactive" | "";
  created_at: string;
  updated_at: string;
}

export interface LogListResponse {
  items: Log[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface LogFilter {
  agent?: string;
  result?: string;
  platform?: string;
  searchTerm?: string;
}

export interface AgentOption {
  value: string;
  name: string;
}

export interface ResultOption {
  value: string;
  name: string;
}

export interface DescriptionOption {
  value: string;
  name: string;
} 
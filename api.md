# 호텔 상태 관리 시스템 API 문서

## 개요

호텔 플랫폼 통합 관리 API는 여러 호텔 플랫폼의 로그인 정보를 안전하게 관리하고, 호텔 운영자가 다양한 플랫폼에서 호텔 상태를 효율적으로 관리할 수 있도록 도와주는 RESTful API입니다.

- **Base URL**: `https://hotelstatus-95797723085.europe-west1.run.app` (개발환경)
- **API 버전**: 1.0.0
- **문서 형식**: JSON

## 인증 방법

### 1. JWT 토큰 인증
- **헤더**: `Authorization: Bearer {token}`
- **특징**: 임시 토큰, 만료됨 (기본 30분)
- **용도**: 일반적인 API 호출

### 2. API 키 인증
- **헤더**: `X-API-Key: {api_key}` 또는 `Authorization: Bearer {api_key}`
- **특징**: 영구 토큰, 만료되지 않음
- **용도**: 자동화된 시스템, 장기간 접근

## 지원 플랫폼

| 플랫폼 값 | 플랫폼 이름 |
|----------|------------|
| `야놀자` | 야놀자 |
| `여기어때_사장님` | 여기어때 사장님 |
| `여기어때_파트너` | 여기어때 파트너 |
| `네이버` | 네이버 호텔 |
| `에어비앤비` | 에어비앤비 |
| `아고다` | 아고다 |
| `부킹닷컴` | 부킹닷컴 |
| `익스피디아` | 익스피디아 |

---

## API 엔드포인트

### 1. 시스템

#### GET /
시스템 상태 확인

**응답:**
```json
{
  "message": "호텔 상태 관리 시스템 API에 오신 것을 환영합니다!"
}
```

#### GET /protected
인증 테스트용 보호된 라우트

**인증**: JWT 토큰 또는 API 키 필요

**응답:**
```json
{
  "message": "안녕하세요, {사용자명}님! 인증된 사용자만 접근할 수 있는 페이지입니다."
}
```

---

### 2. 인증 (Authentication)

#### POST /signup
회원가입

**요청 본문:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**응답:**
```json
{
  "id": "uuid-string",
  "username": "generated-username",
  "email": "user@example.com",
  "full_name": null,
  "is_active": true,
  "role": "client",
  "created_at": "2024-01-01T00:00:00Z"
}
```

#### POST /login
일반 로그인

**요청 본문:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**응답:**
```json
{
  "access_token": "jwt-token-string",
  "token_type": "bearer"
}
```

#### POST /token
OAuth2 형식 로그인

**요청 본문 (form-data):**
```
username: user@example.com
password: password123
```

**응답:**
```json
{
  "access_token": "jwt-token-string",
  "token_type": "bearer"
}
```

---

### 3. 사용자 관리 (User)

#### GET /users/me
현재 사용자 정보 조회

**인증**: JWT 토큰 또는 API 키 필요

**응답:**
```json
{
  "id": "uuid-string",
  "username": "username",
  "email": "user@example.com",
  "full_name": "홍길동",
  "is_active": true,
  "role": "client",
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

### 4. API 키 관리 (API Keys)

#### POST /api-keys
API 키 생성

**인증**: JWT 토큰만 가능 (API 키로는 접근 불가)

**요청 본문:**
```json
{
  "name": "My API Key"
}
```

**응답:**
```json
{
  "id": "uuid-string",
  "name": "My API Key",
  "api_key": "hms_abcdef1234567890...", // 한 번만 표시됨
  "key_prefix": "hms_abcdef12",
  "status": "active",
  "created_at": "2024-01-01T00:00:00Z",
  "expires_at": null
}
```

#### GET /api-keys
사용자의 API 키 목록 조회

**인증**: JWT 토큰 또는 API 키 필요

**응답:**
```json
[
  {
    "id": "uuid-string",
    "name": "My API Key",
    "key_prefix": "hms_abcdef12",
    "status": "active",
    "last_used_at": "2024-01-01T00:00:00Z",
    "created_at": "2024-01-01T00:00:00Z",
    "expires_at": null
  }
]
```

#### DELETE /api-keys/{api_key_id}
API 키 무효화

**인증**: JWT 토큰 또는 API 키 필요

**응답:**
```json
{
  "message": "API 키가 성공적으로 무효화되었습니다"
}
```

---

### 5. 호텔 플랫폼 관리 (Hotel Platform)

#### GET /platforms
사용 가능한 플랫폼 목록 조회

**응답:**
```json
[
  {
    "value": "야놀자",
    "name": "야놀자"
  },
  {
    "value": "여기어때_사장님",
    "name": "여기어때_사장님"
  }
]
```

#### POST /hotel-platforms
호텔 플랫폼 로그인 정보 생성

**인증**: JWT 토큰 또는 API 키 필요

**요청 본문:**
```json
{
  "platform": "야놀자",
  "login_id": "hotel_manager",
  "login_password": "mypassword123",
  "hotel_name": "서울 그랜드 호텔",
  "mfa_id": "mfa_id_123",
  "mfa_password": "mfa_password456",
  "mfa_platform": "Google Authenticator",
  "status": "active"
}
```

**응답:**
```json
{
  "id": 1,
  "user_id": "uuid-string",
  "platform": "야놀자",
  "login_id": "hotel_manager",
  "login_password": "encrypted_password",
  "hotel_name": "서울 그랜드 호텔",
  "mfa_id": "mfa_id_123",
  "mfa_password": "encrypted_mfa_password",
  "mfa_platform": "Google Authenticator",
  "status": "active",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

#### GET /hotel-platforms
호텔 플랫폼 목록 조회 (페이지네이션)

**인증**: JWT 토큰 또는 API 키 필요

**쿼리 파라미터:**
- `page`: 페이지 번호 (기본값: 1)
- `limit`: 페이지당 항목 수 (기본값: 10, 최대: 100)
- `platform`: 플랫폼 필터 (선택사항)

**예시 요청:**
```
GET /hotel-platforms?page=1&limit=10&platform=야놀자
```

**응답:**
```json
{
  "items": [
    {
      "id": 1,
      "user_id": "uuid-string",
      "platform": "야놀자",
      "login_id": "hotel_manager",
      "login_password": "decrypted_password", // 복호화된 비밀번호
      "hotel_name": "서울 그랜드 호텔",
      "mfa_id": "mfa_id_123",
      "mfa_password": "decrypted_mfa_password", // 복호화된 MFA 비밀번호
      "mfa_platform": "Google Authenticator",
      "status": "active",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10,
  "total_pages": 1,
  "has_next": false,
  "has_prev": false
}
```

#### GET /hotel-platforms/{platform_id}
특정 호텔 플랫폼 상세 정보 조회

**인증**: JWT 토큰 또는 API 키 필요

**응답:**
```json
{
  "id": 1,
  "user_id": "uuid-string",
  "platform": "야놀자",
  "login_id": "hotel_manager",
  "login_password": "decrypted_password", // 복호화된 비밀번호
  "hotel_name": "서울 그랜드 호텔",
  "mfa_id": "mfa_id_123",
  "mfa_password": "decrypted_mfa_password", // 복호화된 MFA 비밀번호
  "mfa_platform": "Google Authenticator",
  "status": "active",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

#### GET /hotel-platforms/platform/{platform_name}
플랫폼명으로 호텔 플랫폼 정보 조회

**인증**: JWT 토큰 또는 API 키 필요

**예시 요청:**
```
GET /hotel-platforms/platform/야놀자
```

**응답:** 위의 상세 정보 조회와 동일

#### PUT /hotel-platforms/{platform_id}
호텔 플랫폼 정보 수정

**인증**: JWT 토큰 또는 API 키 필요

**요청 본문 (선택적 필드):**
```json
{
  "login_id": "updated_manager",
  "login_password": "updatedpassword123",
  "hotel_name": "업데이트된 호텔명",
  "mfa_id": "updated_mfa_id",
  "mfa_password": "updated_mfa_password",
  "mfa_platform": "SMS",
  "status": "active"
}
```

**응답:** 업데이트된 플랫폼 정보

#### DELETE /hotel-platforms/{platform_id}
호텔 플랫폼 정보 삭제

**인증**: JWT 토큰 또는 API 키 필요

**응답:**
```json
{
  "message": "야놀자 플랫폼 정보가 성공적으로 삭제되었습니다"
}
```

---

### 6. 로그 관리 (Logs)

#### POST /hotel-platforms/{platform_id}/logs
호텔 플랫폼 정보로 로그 생성

**인증**: JWT 토큰 또는 API 키 필요

**요청 본문:**
```json
{
  "ota_place_name": "호텔 아이크루",
  "prepaid": 50000,
  "fee": 70000,
  "check_in_sched": 1678886400000,
  "check_out_sched": 1678972800000,
  "visit_type": "ON_CAR",
  "stay_type": "DAYS",
  "reserve_no": "R123456789",
  "phone": "01012345678",
  "guest_name": "홍길동",
  "ota_room_name": "스탠다드 더블",
  "canceled": false,
  "agent": "YANOLJA",
  "result": "success",
  "description": "로그인 실패",
  "error_message": "네트워크 연결 오류"
}
```

**응답:**
```json
{
  "id": 1,
  "user_id": "uuid-string",
  "ota_place_name": "호텔 아이크루",
  "prepaid": 50000,
  "fee": 70000,
  "check_in_sched": 1678886400000,
  "check_out_sched": 1678972800000,
  "visit_type": "ON_CAR",
  "stay_type": "DAYS",
  "reserve_no": "R123456789",
  "phone": "01012345678",
  "guest_name": "홍길동",
  "ota_room_name": "스탠다드 더블",
  "canceled": false,
  "agent": "YANOLJA",
  "result": "success",
  "description": "로그인 실패",
  "error_message": "네트워크 연결 오류",
  "platform": "야놀자",
  "login_id": "hotel_manager",
  "login_password": "decrypted_password",
  "hotel_name": "서울 그랜드 호텔",
  "mfa_id": "mfa_id_123",
  "mfa_password": "decrypted_mfa_password",
  "mfa_platform": "Google Authenticator",
  "platform_status": "active",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

#### POST /logs
로그 생성

**인증**: JWT 토큰 또는 API 키 필요

**요청 본문:**
```json
{
  "ota_place_name": "호텔 아이크루",
  "prepaid": 50000,
  "fee": 70000,
  "check_in_sched": 1678886400000,
  "check_out_sched": 1678972800000,
  "visit_type": "ON_CAR",
  "stay_type": "DAYS",
  "reserve_no": "R123456789",
  "phone": "01012345678",
  "guest_name": "홍길동",
  "ota_room_name": "스탠다드 더블",
  "canceled": false,
  "agent": "YANOLJA",
  "result": "success",
  "description": "로그인 실패",
  "error_message": "네트워크 연결 오류",
  "platform": "야놀자",
  "login_id": "hotel_manager",
  "login_password": "mypassword123",
  "hotel_name": "서울 그랜드 호텔",
  "mfa_id": "mfa_id_123",
  "mfa_password": "mfa_password456",
  "mfa_platform": "Google Authenticator",
  "platform_status": "active"
}
```

**응답:** 위의 로그 생성 응답과 동일

#### GET /logs
로그 목록 조회 (페이지네이션)

**인증**: JWT 토큰 또는 API 키 필요

**쿼리 파라미터:**
- `page`: 페이지 번호 (기본값: 1)
- `limit`: 페이지당 항목 수 (기본값: 10, 최대: 100)
- `agent`: 에이전트 필터 (선택사항)
- `result`: 결과 필터 (선택사항)
- `platform`: 플랫폼 타입 필터 (선택사항)

**예시 요청:**
```
GET /logs?page=1&limit=10&agent=YANOLJA&result=success&platform=야놀자
```

**응답:**
```json
{
  "items": [
    {
      "id": 1,
      "user_id": "uuid-string",
      "ota_place_name": "호텔 아이크루",
      "prepaid": 50000,
      "fee": 70000,
      "check_in_sched": 1678886400000,
      "check_out_sched": 1678972800000,
      "visit_type": "ON_CAR",
      "stay_type": "DAYS",
      "reserve_no": "R123456789",
      "phone": "01012345678",
      "guest_name": "홍길동",
      "ota_room_name": "스탠다드 더블",
      "canceled": false,
      "agent": "YANOLJA",
      "result": "success",
      "description": "로그인 실패",
      "error_message": "네트워크 연결 오류",
      "platform": "야놀자",
      "login_id": "hotel_manager",
      "login_password": "decrypted_password",
      "hotel_name": "서울 그랜드 호텔",
      "mfa_id": "mfa_id_123",
      "mfa_password": "decrypted_mfa_password",
      "mfa_platform": "Google Authenticator",
      "platform_status": "active",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10,
  "total_pages": 1,
  "has_next": false,
  "has_prev": false
}
```

#### GET /logs/{log_id}
특정 로그 상세 정보 조회

**인증**: JWT 토큰 또는 API 키 필요

**응답:** 로그 상세 정보 (위의 로그 생성 응답과 동일)

#### PUT /logs/{log_id}
로그 정보 수정

**인증**: JWT 토큰 또는 API 키 필요

**요청 본문 (선택적 필드):**
```json
{
  "ota_place_name": "업데이트된 호텔명",
  "prepaid": 60000,
  "fee": 80000,
  "agent": "YEOGI_BOSS",
  "result": "fail",
  "description": "네트워크 에러",
  "error_message": "연결 시간 초과"
}
```

**응답:** 업데이트된 로그 정보

#### DELETE /logs/{log_id}
로그 삭제

**인증**: JWT 토큰 또는 API 키 필요

**응답:**
```json
{
  "message": "로그 ID 1가 성공적으로 삭제되었습니다"
}
```

#### GET /logs/agents
사용 가능한 에이전트 목록 조회

**응답:**
```json
[
  {
    "value": "YANOLJA",
    "name": "YANOLJA"
  },
  {
    "value": "YEOGI_BOSS",
    "name": "YEOGI_BOSS"
  }
]
```

#### GET /logs/results
사용 가능한 결과 타입 목록 조회

**응답:**
```json
[
  {
    "value": "success",
    "name": "success"
  },
  {
    "value": "fail",
    "name": "fail"
  }
]
```

#### GET /logs/descriptions
사용 가능한 설명 목록 조회

**응답:**
```json
[
  {
    "value": "로그인 실패",
    "name": "로그인 실패"
  },
  {
    "value": "파싱 실패",
    "name": "파싱 실패"
  },
  {
    "value": "네트워크 에러",
    "name": "네트워크 에러"
  },
  {
    "value": "",
    "name": ""
  }
]
```

---

## 데이터 모델

### User (사용자)
```typescript
interface User {
  id: string;
  username: string;
  email: string;
  full_name?: string;
  is_active: boolean;
  role: "client" | "admin";
  created_at: string;
}
```

### HotelPlatform (호텔 플랫폼)
```typescript
interface HotelPlatform {
  id: number;
  user_id: string;
  platform: "야놀자" | "여기어때_사장님" | "여기어때_파트너" | "네이버" | "에어비앤비" | "아고다" | "부킹닷컴" | "익스피디아";
  login_id: string;
  login_password: string; // 응답시 복호화됨
  hotel_name: string;
  mfa_id?: string;
  mfa_password?: string; // 응답시 복호화됨
  mfa_platform?: string;
  status: "active" | "deactive";
  created_at: string;
  updated_at?: string;
}
```

### ApiKey (API 키)
```typescript
interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  status: "active" | "revoked";
  last_used_at?: string;
  created_at: string;
  expires_at?: string;
}

interface ApiKeyCreate {
  id: string;
  name: string;
  api_key: string; // 생성시에만 반환
  key_prefix: string;
  status: "active" | "revoked";
  created_at: string;
  expires_at?: string;
}
```

### Log (로그)
```typescript
interface Log {
  id: number;
  user_id: string;
  
  // 기본 정보
  ota_place_name: string;
  prepaid?: number;
  fee?: number;
  check_in_sched?: number; // timestamp
  check_out_sched?: number; // timestamp
  visit_type?: "ON_CAR" | "ON_FOOT";
  stay_type?: "DAYS" | "HOURS";
  reserve_no?: string;
  phone?: string;
  guest_name?: string;
  ota_room_name?: string;
  canceled: boolean;
  agent: "YANOLJA" | "YEOGI_BOSS" | "YEOGI_PARTNER" | "NAVER" | "AIRBNB" | "AGODA" | "BOOKING" | "EXPEDIA";
  result: "success" | "fail";
  description?: "로그인 실패" | "파싱 실패" | "네트워크 에러" | "";
  error_message?: string;
  
  // 플랫폼 정보
  platform?: "야놀자" | "여기어때_사장님" | "여기어때_파트너" | "네이버" | "에어비앤비" | "아고다" | "부킹닷컴" | "익스피디아";
  login_id?: string;
  login_password?: string; // 응답시 복호화됨
  hotel_name?: string;
  mfa_id?: string;
  mfa_password?: string; // 응답시 복호화됨
  mfa_platform?: string;
  platform_status?: string;
  
  created_at: string;
  updated_at?: string;
}
```

### PaginatedResponse (페이지네이션 응답)
```typescript
interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}
```

---

## 에러 응답

모든 에러는 다음 형태로 반환됩니다:

```json
{
  "detail": "에러 메시지"
}
```

### HTTP 상태 코드

- `200 OK`: 성공
- `201 Created`: 생성 성공
- `400 Bad Request`: 잘못된 요청
- `401 Unauthorized`: 인증 실패
- `403 Forbidden`: 권한 없음
- `404 Not Found`: 리소스를 찾을 수 없음
- `422 Unprocessable Entity`: 유효성 검사 실패
- `500 Internal Server Error`: 서버 내부 오류

---

## 프론트엔드 개발 가이드

### 1. 인증 흐름
1. 회원가입 (`POST /signup`) 또는 로그인 (`POST /login`)
2. 받은 JWT 토큰을 localStorage에 저장
3. 모든 API 요청에 `Authorization: Bearer {token}` 헤더 추가
4. 또는 API 키 생성 후 `X-API-Key: {api_key}` 헤더 사용

### 2. API 키 사용 (선택사항)
1. JWT 토큰으로 로그인 후 API 키 생성 (`POST /api-keys`)
2. 받은 API 키를 안전하게 저장
3. 이후 모든 API 요청에 `X-API-Key: {api_key}` 헤더 사용

### 3. 페이지네이션 처리
- `page`와 `limit` 파라미터로 페이지네이션 제어
- 응답의 `has_next`, `has_prev`로 페이지 네비게이션 구현
- `total_pages`로 전체 페이지 수 파악

### 4. 필터링
- 각 목록 API는 관련 필터 파라미터 지원
- 쿼리 파라미터로 전달 (예: `?platform=야놀자&result=success`)

### 5. 보안 주의사항
- 비밀번호는 응답에서 복호화되어 제공되므로 안전하게 처리
- API 키는 생성 시 한 번만 제공되므로 반드시 저장
- JWT 토큰 만료 시 재로그인 필요

### 6. TypeScript 타입 정의
위의 데이터 모델 섹션의 TypeScript 인터페이스를 프로젝트에 포함하여 타입 안정성 확보 
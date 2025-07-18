# 호텔 상태 관리 시스템 - 로그인/회원가입 API

FastAPI와 PostgreSQL을 이용한 사용자 인증 시스템입니다.

## 주요 기능

- 🔐 사용자 회원가입
- 🔑 로그인 (JWT 토큰 기반)
- 🔄 Refresh 토큰을 통한 자동 토큰 갱신
- 🛡️ 비밀번호 암호화 (bcrypt)
- 🔒 보호된 엔드포인트 접근
- 📊 사용자 정보 관리
- 🔑 API 키 지원 (영구 토큰)

## 기술 스택

- **Backend**: FastAPI
- **Database**: PostgreSQL
- **ORM**: SQLAlchemy
- **Authentication**: JWT (JSON Web Tokens) + Refresh Token
- **Password Hashing**: bcrypt

## 설치 및 실행

### 1. 의존성 설치
```bash
pip install -r requirements.txt
```

### 2. 환경변수 설정
`.env` 파일을 생성하고 다음 내용을 추가하세요:
```env
DATABASE_URL=postgresql://hotelstatus:dlwndwo2!@34.81.137.138:5432/postgres
SECRET_KEY=your-secret-key-here-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### 3. 애플리케이션 실행
```bash
python main.py
```
또는
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8080
```

### 4. API 문서 확인
브라우저에서 다음 주소로 접속하세요:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 🚀 프론트엔드 개발자를 위한 가이드

### 인증 플로우 개요

1. **회원가입** → 계정 생성
2. **로그인** → Access Token + Refresh Token 받기
3. **API 호출** → Access Token을 헤더에 포함
4. **토큰 만료시** → Refresh Token으로 새 토큰 발급
5. **로그아웃** → Refresh Token 무효화

### 🔧 JavaScript/TypeScript 예제

#### 1. 회원가입

```javascript
const signup = async (email, password) => {
  try {
    const response = await fetch('http://localhost:8000/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        password: password
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || '회원가입에 실패했습니다');
    }

    const userData = await response.json();
    console.log('회원가입 성공:', userData);
    return userData;
  } catch (error) {
    console.error('회원가입 오류:', error.message);
    throw error;
  }
};

// 사용 예시
signup('user@example.com', 'mypassword123');
```

#### 2. 로그인

```javascript
const login = async (email, password) => {
  try {
    const response = await fetch('http://localhost:8000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        password: password
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || '로그인에 실패했습니다');
    }

    const tokenData = await response.json();
    
    // 토큰을 로컬 스토리지에 저장
    localStorage.setItem('accessToken', tokenData.access_token);
    localStorage.setItem('refreshToken', tokenData.refresh_token);
    
    console.log('로그인 성공:', tokenData);
    return tokenData;
  } catch (error) {
    console.error('로그인 오류:', error.message);
    throw error;
  }
};

// 사용 예시
login('user@example.com', 'mypassword123');
```

#### 3. 토큰 갱신 (Refresh Token)

```javascript
const refreshAccessToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!refreshToken) {
      throw new Error('Refresh token이 없습니다');
    }

    const response = await fetch('http://localhost:8000/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refresh_token: refreshToken
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || '토큰 갱신에 실패했습니다');
    }

    const tokenData = await response.json();
    
    // 새로운 토큰들로 업데이트
    localStorage.setItem('accessToken', tokenData.access_token);
    localStorage.setItem('refreshToken', tokenData.refresh_token);
    
    console.log('토큰 갱신 성공:', tokenData);
    return tokenData;
  } catch (error) {
    console.error('토큰 갱신 오류:', error.message);
    // 갱신 실패시 로그인 페이지로 리다이렉트
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    throw error;
  }
};
```

#### 4. 보호된 API 호출 (자동 토큰 갱신 포함)

```javascript
const apiCall = async (url, options = {}) => {
  const makeRequest = async (token) => {
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
  };

  try {
    const accessToken = localStorage.getItem('accessToken');
    
    if (!accessToken) {
      throw new Error('로그인이 필요합니다');
    }

    let response = await makeRequest(accessToken);

    // 토큰이 만료된 경우 (401 에러)
    if (response.status === 401) {
      console.log('토큰이 만료되었습니다. 갱신을 시도합니다...');
      
      try {
        const newTokenData = await refreshAccessToken();
        response = await makeRequest(newTokenData.access_token);
      } catch (refreshError) {
        throw new Error('로그인이 필요합니다');
      }
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'API 호출에 실패했습니다');
    }

    return await response.json();
  } catch (error) {
    console.error('API 호출 오류:', error.message);
    throw error;
  }
};

// 사용 예시 - 현재 사용자 정보 조회
const getCurrentUser = async () => {
  try {
    const userData = await apiCall('http://localhost:8000/users/me');
    console.log('현재 사용자:', userData);
    return userData;
  } catch (error) {
    console.error('사용자 정보 조회 실패:', error.message);
  }
};
```

#### 5. 로그아웃

```javascript
const logout = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (refreshToken) {
      // 서버에서 refresh token 무효화
      await fetch('http://localhost:8000/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          refresh_token: refreshToken
        })
      });
    }
    
    // 로컬 스토리지에서 토큰 제거
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    
    console.log('로그아웃 완료');
  } catch (error) {
    console.error('로그아웃 오류:', error.message);
    // 오류가 발생해도 로컬 토큰은 제거
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
};
```

#### 6. 인증 상태 확인 유틸리티

```javascript
// 로그인 상태 확인
const isLoggedIn = () => {
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');
  return !!(accessToken && refreshToken);
};

// 토큰 만료 시간 확인 (JWT 디코딩)
const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    return true;
  }
};

// 자동 토큰 갱신 설정 (페이지 로드시 실행)
const initializeAuth = async () => {
  if (isLoggedIn()) {
    const accessToken = localStorage.getItem('accessToken');
    
    if (isTokenExpired(accessToken)) {
      try {
        await refreshAccessToken();
        console.log('토큰이 자동으로 갱신되었습니다');
      } catch (error) {
        console.log('자동 토큰 갱신 실패, 로그인이 필요합니다');
        logout();
      }
    }
  }
};

// 페이지 로드시 실행
initializeAuth();
```

### 🔐 React/Next.js 커스텀 훅 예제

```javascript
// useAuth.js
import { useState, useEffect, useContext, createContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      if (isLoggedIn()) {
        const userData = await getCurrentUser();
        setUser(userData);
      }
    } catch (error) {
      console.error('인증 초기화 실패:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const tokenData = await loginAPI(email, password);
    const userData = await getCurrentUser();
    setUser(userData);
    return userData;
  };

  const logout = () => {
    logoutAPI();
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

## API 엔드포인트

### 🏠 기본
- `GET /` - 웰컴 메시지

### 👤 인증
- `POST /signup` - 회원가입
- `POST /login` - 로그인 (JSON 형식)
- `POST /token` - 로그인 (OAuth2 형식)
- `POST /auth/refresh` - 액세스 토큰 갱신
- `POST /auth/logout` - 로그아웃
- `GET /auth/refresh-tokens` - 리프레시 토큰 목록 조회
- `DELETE /auth/refresh-tokens/{id}` - 특정 리프레시 토큰 무효화
- `DELETE /auth/refresh-tokens` - 모든 리프레시 토큰 무효화

### 🔑 API 키 관리
- `POST /api-keys` - API 키 생성
- `GET /api-keys` - API 키 목록 조회
- `DELETE /api-keys/{id}` - API 키 무효화

### 🔒 보호된 엔드포인트
- `GET /users/me` - 현재 사용자 정보 조회
- `GET /protected` - 보호된 라우트 예시

### 🏨 호텔 플랫폼 관리
- `GET /platforms` - 사용 가능한 플랫폼 목록
- `POST /hotel-platforms` - 호텔 플랫폼 정보 생성
- `GET /hotel-platforms` - 호텔 플랫폼 목록 조회
- `GET /hotel-platforms/{id}` - 호텔 플랫폼 상세 조회
- `PUT /hotel-platforms/{id}` - 호텔 플랫폼 정보 수정
- `DELETE /hotel-platforms/{id}` - 호텔 플랫폼 정보 삭제

## 📝 응답 형태

### 로그인 성공 응답
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "a1b2c3d4e5f6...",
  "token_type": "bearer",
  "expires_in": 1800
}
```

### 사용자 정보 응답
```json
{
  "id": 1,
  "username": "user123",
  "email": "user@example.com",
  "full_name": "홍길동",
  "is_active": true,
  "role": "client",
  "created_at": "2024-01-01T00:00:00",
  "updated_at": "2024-01-01T00:00:00"
}
```

### 에러 응답
```json
{
  "detail": "이메일 또는 비밀번호가 잘못되었습니다"
}
```

## 🛡️ 보안 고려사항

### 토큰 저장 방법
- **개발환경**: localStorage 사용 가능
- **운영환경**: httpOnly 쿠키 권장 (XSS 방어)

### 자동 로그아웃 설정
```javascript
// 토큰 만료 30초 전에 자동 갱신
setInterval(async () => {
  const accessToken = localStorage.getItem('accessToken');
  if (accessToken && isTokenExpired(accessToken)) {
    try {
      await refreshAccessToken();
    } catch (error) {
      logout();
    }
  }
}, 30000); // 30초마다 확인
```

## 🐛 에러 처리

### 일반적인 에러 코드
- `400` - 잘못된 요청 (이메일 중복, 비밀번호 형식 오류 등)
- `401` - 인증 실패 (잘못된 로그인 정보, 만료된 토큰)
- `403` - 권한 없음 (비활성화된 사용자)
- `404` - 리소스 없음
- `422` - 유효성 검증 실패

### 에러 처리 예제
```javascript
const handleApiError = (error) => {
  if (error.message.includes('401')) {
    // 인증 오류 - 로그인 페이지로 리다이렉트
    logout();
    window.location.href = '/login';
  } else if (error.message.includes('403')) {
    // 권한 오류
    alert('접근 권한이 없습니다');
  } else {
    // 기타 오류
    alert(error.message || '알 수 없는 오류가 발생했습니다');
  }
};
```

## 사용 예시

### 회원가입
```bash
curl -X POST "http://localhost:8000/signup" \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "testpassword123"
     }'
```

### 로그인
```bash
curl -X POST "http://localhost:8000/login" \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "testpassword123"
     }'
```

### 토큰 갱신
```bash
curl -X POST "http://localhost:8000/auth/refresh" \
     -H "Content-Type: application/json" \
     -d '{
       "refresh_token": "your_refresh_token_here"
     }'
```

### 보호된 엔드포인트 접근
```bash
curl -X GET "http://localhost:8000/users/me" \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

## 데이터베이스 구조

### users 테이블
| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| id | Integer | 기본키 (자동증가) |
| username | String(50) | 사용자명 (유니크) |
| email | String(100) | 이메일 (유니크) |
| hashed_password | String(255) | 암호화된 비밀번호 |
| full_name | String(100) | 전체 이름 (선택사항) |
| is_active | Boolean | 활성 상태 |
| role | String(20) | 사용자 역할 |
| created_at | DateTime | 생성일시 |
| updated_at | DateTime | 수정일시 |

### refresh_tokens 테이블
| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| id | String | 기본키 (UUID) |
| user_id | Integer | 사용자 ID (외래키) |
| token_hash | String(255) | 토큰 해시 |
| status | String(20) | 토큰 상태 |
| expires_at | DateTime | 만료일시 |
| created_at | DateTime | 생성일시 |

## 보안 기능

- ✅ 비밀번호 bcrypt 해싱
- ✅ JWT 토큰 기반 인증
- ✅ Refresh Token 로테이션
- ✅ 토큰 만료 시간 설정
- ✅ 사용자명/이메일 중복 방지
- ✅ 활성 사용자 확인
- ✅ API 키 지원

## 주의사항

⚠️ **운영환경에서는 반드시 다음을 변경하세요:**
- `SECRET_KEY`를 강력한 랜덤 문자열로 변경
- 데이터베이스 연결 정보를 환경변수로 관리
- HTTPS 사용 권장
- 토큰을 httpOnly 쿠키에 저장 (XSS 방어)
- CORS 설정 확인 
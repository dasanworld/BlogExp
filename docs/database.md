# 블로그 체험단 SaaS — 데이터베이스 설계 최종본

> 이 문서는 유저플로우를 기반으로 설계된 PostgreSQL 데이터베이스 스키마와 데이터플로우를 포함합니다.

---

## 📊 목차

1. [ERD 개요](#erd-개요)
2. [데이터플로우](#데이터플로우)
3. [테이블 스키마](#테이블-스키마)
4. [제약조건 및 인덱스](#제약조건-및-인덱스)
5. [트리거 및 RLS 정책](#트리거-및-rls-정책)
6. [마이그레이션 가이드](#마이그레이션-가이드)

---

## ERD 개요

### 전체 구조

```
auth.users (Supabase Auth)
    ↓
users ─┬─→ user_consents
       ├─→ influencer_profiles ─→ influencer_channels
       ├─→ advertiser_profiles ─→ campaigns
       └─→ campaign_applications
```

### 테이블 간 관계

```
users (1) ──── (1) influencer_profiles
                     │
                     └─── (N) influencer_channels

users (1) ──── (1) advertiser_profiles
                     │
                     └─── (N) campaigns
                               │
                               └─── (N) campaign_applications
                                          │
                                          └─── (1) influencer_profiles

users (1) ──── (N) user_consents
```

---

## 데이터플로우

### 1. 회원가입 & 역할 선택 플로우

```
사용자 입력 (이름, 휴대폰번호, 이메일, 약관동의, 역할)
  ↓
auth.users (Supabase Auth 계정 생성)
  ↓
users (프로필 기본 정보: user_id, name, phone, email, role)
  ↓
user_consents (약관 동의 이력: user_id, consent_type, agreed_at)
  ↓
[역할 분기]
  ├─ role = 'influencer' → influencer_profiles 레코드 생성
  └─ role = 'advertiser' → advertiser_profiles 레코드 생성
```

### 2. 인플루언서 정보 등록 플로우

```
인플루언서 입력 (생년월일, SNS 채널 정보)
  ↓
influencer_profiles UPDATE (birth_date, verification_status)
  ↓
influencer_channels INSERT (channel_type, channel_name, channel_url, status)
  ↓
비동기 검증 잡 큐 (채널 패턴 매칭, 메트릭 수집)
  ↓
influencer_channels UPDATE (status: pending → verified / failed)
```

### 3. 광고주 정보 등록 플로우

```
광고주 입력 (업체명, 위치, 카테고리, 사업자등록번호)
  ↓
advertiser_profiles UPDATE (
  business_name, location, category, 
  business_registration_number, verification_status
)
  ↓
비동기 검증 잡 큐 (사업자번호 검증)
  ↓
advertiser_profiles UPDATE (verification_status: pending → verified / failed)
```

### 4. 홈 & 체험단 목록 탐색 플로우

```
사용자 홈 접속 + 필터/정렬 선택
  ↓
campaigns SELECT (
  WHERE status = 'recruiting'
  AND recruitment_end_date >= NOW()
  ORDER BY created_at DESC
  LIMIT/OFFSET for pagination
)
  ↓
체험단 목록 렌더링 (카드 형태)
```

### 5. 체험단 상세 조회 플로우

```
체험단 카드 클릭
  ↓
campaigns SELECT (
  JOIN advertiser_profiles (매장 정보)
  WHERE campaign_id = ?
)
  ↓
권한 체크 (
  IF user.role = 'influencer'
    → influencer_profiles.verification_status = 'verified' 확인
)
  ↓
체험단 상세 정보 렌더링 (기간, 혜택, 미션, 모집인원)
```

### 6. 체험단 지원 플로우

```
인플루언서 지원서 제출 (각오, 방문 예정일자)
  ↓
유효성 검사 (
  - 중복 지원 방지: campaign_applications SELECT WHERE user_id + campaign_id
  - 모집기간 검증: campaigns.recruitment_end_date >= NOW()
  - 인플루언서 검증 완료: influencer_profiles.verification_status = 'verified'
)
  ↓
campaign_applications INSERT (
  campaign_id, user_id, application_message, 
  visit_date, status='pending', applied_at=NOW()
)
  ↓
제출 성공 피드백
```

### 7. 내 지원 목록 조회 플로우 (인플루언서)

```
인플루언서 "내 지원 목록" 접근 + 상태 필터 선택
  ↓
campaign_applications SELECT (
  JOIN campaigns (체험단 정보)
  WHERE user_id = current_user.id
  AND status IN (filter_statuses)  -- pending/selected/rejected
  ORDER BY applied_at DESC
)
  ↓
지원 목록 렌더링 (신청완료/선정/반려)
```

### 8. 광고주 체험단 등록 플로우

```
광고주 "체험단 등록" 버튼 클릭 + 정보 입력
  ↓
권한 검증 (
  user.role = 'advertiser'
  AND advertiser_profiles.verification_status = 'verified'
)
  ↓
campaigns INSERT (
  advertiser_id, title, description, 
  benefits, mission, location,
  recruitment_start_date, recruitment_end_date,
  experience_start_date, experience_end_date,
  total_slots, status='recruiting'
)
  ↓
내 체험단 목록 갱신
```

### 9. 광고주 체험단 관리 & 선정 플로우

```
광고주 체험단 상세 접근
  ↓
[지원자 목록 조회]
campaign_applications SELECT (
  JOIN users, influencer_profiles, influencer_channels
  WHERE campaign_id = ?
  ORDER BY applied_at
)
  ↓
[모집 종료]
광고주 "모집종료" 버튼 클릭
  → campaigns UPDATE (status = 'recruiting' → 'closed')
  ↓
[체험단 선정]
광고주 "선정" 버튼 클릭 + 인원 선택
  ↓
campaign_applications UPDATE (
  status = 'selected' WHERE application_id IN (selected_ids)
  status = 'rejected' WHERE application_id NOT IN (selected_ids)
)
  ↓
campaigns UPDATE (
  status = 'selection_completed',
  selected_count = COUNT(selected_ids)
)
  ↓
선정 완료 피드백 (광고주 & 인플루언서 알림)
```

### 핵심 데이터 흐름 요약

```
┌─────────────────────────────────────────────────────────────┐
│                     회원가입 & 인증                          │
│  auth.users → users → user_consents                         │
│      ├─ influencer_profiles → influencer_channels           │
│      └─ advertiser_profiles                                  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      체험단 생성                             │
│  advertiser_profiles → campaigns                            │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    체험단 지원 & 관리                         │
│  campaigns ← campaign_applications → influencer_profiles    │
│      ↓                     ↓                                 │
│  상태 변경              선정/반려 처리                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 테이블 스키마

### 1. users (사용자 기본 정보)

**설명**: Supabase Auth와 연동되는 사용자 프로필 테이블

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | UUID | PRIMARY KEY | Supabase Auth의 user.id와 동일 |
| name | VARCHAR(100) | NOT NULL | 사용자 이름 |
| phone | VARCHAR(20) | NOT NULL | 휴대폰번호 |
| email | VARCHAR(255) | NOT NULL, UNIQUE | 이메일 |
| role | VARCHAR(20) | NOT NULL, CHECK | 역할 (advertiser/influencer) |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 생성 일시 |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 수정 일시 |

**인덱스**:
- `idx_users_email` on (email)
- `idx_users_role` on (role)
- `idx_users_created_at` on (created_at DESC)

---

### 2. user_consents (약관 동의 이력)

**설명**: 사용자별 약관 동의 이력 저장

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | UUID | PRIMARY KEY | 약관 동의 ID |
| user_id | UUID | NOT NULL, FK → users(id) | 사용자 ID |
| consent_type | VARCHAR(50) | NOT NULL | 약관 유형 |
| agreed | BOOLEAN | NOT NULL, DEFAULT true | 동의 여부 |
| agreed_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 동의 일시 |

**인덱스**:
- `idx_user_consents_user_id` on (user_id)
- `idx_user_consents_type` on (consent_type)

---

### 3. influencer_profiles (인플루언서 프로필)

**설명**: 인플루언서 추가 정보 및 검증 상태

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| user_id | UUID | PRIMARY KEY, FK → users(id) | 사용자 ID (1:1) |
| birth_date | DATE | NULL | 생년월일 |
| verification_status | VARCHAR(20) | NOT NULL, DEFAULT 'pending', CHECK | 검증 상태 |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 생성 일시 |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 수정 일시 |

**인덱스**:
- `idx_influencer_verification_status` on (verification_status)

---

### 4. influencer_channels (인플루언서 SNS 채널)

**설명**: 인플루언서의 SNS 채널 정보 (1:N 관계)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | UUID | PRIMARY KEY | 채널 ID |
| user_id | UUID | NOT NULL, FK → influencer_profiles(user_id) | 인플루언서 ID |
| channel_type | VARCHAR(50) | NOT NULL | 채널 유형 (instagram, youtube 등) |
| channel_name | VARCHAR(255) | NOT NULL | 채널명 |
| channel_url | VARCHAR(500) | NOT NULL | 채널 URL |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'pending', CHECK | 검증 상태 |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 생성 일시 |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 수정 일시 |

**인덱스**:
- `idx_influencer_channels_user_id` on (user_id)
- `idx_influencer_channels_type` on (channel_type)
- `idx_influencer_channels_status` on (status)
- `idx_influencer_channels_unique_url` UNIQUE on (user_id, channel_url)

---

### 5. advertiser_profiles (광고주 프로필)

**설명**: 광고주(업체) 정보 및 검증 상태

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| user_id | UUID | PRIMARY KEY, FK → users(id) | 사용자 ID (1:1) |
| business_name | VARCHAR(255) | NOT NULL | 업체명 |
| location | TEXT | NOT NULL | 위치 (주소) |
| category | VARCHAR(100) | NOT NULL | 카테고리 |
| business_registration_number | VARCHAR(50) | NOT NULL, UNIQUE | 사업자등록번호 |
| verification_status | VARCHAR(20) | NOT NULL, DEFAULT 'pending', CHECK | 검증 상태 |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 생성 일시 |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 수정 일시 |

**인덱스**:
- `idx_advertiser_verification_status` on (verification_status)
- `idx_advertiser_category` on (category)
- `idx_advertiser_business_reg_num` UNIQUE on (business_registration_number)

---

### 6. campaigns (체험단 모집)

**설명**: 광고주가 등록한 체험단 모집 정보

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | UUID | PRIMARY KEY | 체험단 ID |
| advertiser_id | UUID | NOT NULL, FK → advertiser_profiles(user_id) | 광고주 ID |
| title | VARCHAR(255) | NOT NULL | 체험단 제목 |
| description | TEXT | NOT NULL | 상세 설명 |
| benefits | TEXT | NOT NULL | 제공 혜택 |
| mission | TEXT | NOT NULL | 미션 내용 |
| location | TEXT | NOT NULL | 체험 장소 |
| recruitment_start_date | TIMESTAMPTZ | NOT NULL | 모집 시작일 |
| recruitment_end_date | TIMESTAMPTZ | NOT NULL | 모집 종료일 |
| experience_start_date | DATE | NOT NULL | 체험 시작일 |
| experience_end_date | DATE | NOT NULL | 체험 종료일 |
| total_slots | INTEGER | NOT NULL, CHECK (> 0) | 총 모집 인원 |
| selected_count | INTEGER | NOT NULL, DEFAULT 0, CHECK (>= 0) | 선정된 인원 |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'recruiting', CHECK | 모집 상태 |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 생성 일시 |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 수정 일시 |

**체크 제약조건**:
- `check_recruitment_dates`: recruitment_end_date >= recruitment_start_date
- `check_experience_dates`: experience_end_date >= experience_start_date
- `check_selected_count`: selected_count <= total_slots

**인덱스**:
- `idx_campaigns_advertiser_id` on (advertiser_id)
- `idx_campaigns_status` on (status)
- `idx_campaigns_recruitment_dates` on (recruitment_start_date, recruitment_end_date)
- `idx_campaigns_created_at` on (created_at DESC)
- `idx_campaigns_recruiting` on (status, recruitment_end_date) WHERE status = 'recruiting'

---

### 7. campaign_applications (체험단 지원서)

**설명**: 인플루언서의 체험단 지원 정보

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | UUID | PRIMARY KEY | 지원서 ID |
| campaign_id | UUID | NOT NULL, FK → campaigns(id) | 체험단 ID |
| user_id | UUID | NOT NULL, FK → influencer_profiles(user_id) | 인플루언서 ID |
| application_message | TEXT | NOT NULL | 각오 한마디 |
| visit_date | DATE | NOT NULL | 방문 예정일자 |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'pending', CHECK | 지원 상태 |
| applied_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 지원 일시 |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 수정 일시 |

**유니크 제약조건**:
- `unique_campaign_application` UNIQUE on (campaign_id, user_id) - 중복 지원 방지

**인덱스**:
- `idx_applications_campaign_id` on (campaign_id)
- `idx_applications_user_id` on (user_id)
- `idx_applications_status` on (status)
- `idx_applications_applied_at` on (applied_at DESC)
- `idx_applications_user_status` on (user_id, status)

---

## 제약조건 및 인덱스

### 기본키 (Primary Key)
- 모든 테이블에 **UUID** 기반 기본키 사용
- `users`, `influencer_profiles`, `advertiser_profiles`는 Supabase Auth의 user.id와 동일한 UUID 사용

### 외래키 (Foreign Key)
- 모든 외래키에 `ON DELETE CASCADE` 적용
- 사용자 삭제 시 관련 데이터 자동 삭제로 참조 무결성 보장

### 유니크 제약 (Unique Constraints)
1. `users.email` - 이메일 중복 방지
2. `advertiser_profiles.business_registration_number` - 사업자등록번호 중복 방지
3. `influencer_channels(user_id, channel_url)` - 동일 사용자의 동일 채널 URL 중복 방지
4. `campaign_applications(campaign_id, user_id)` - 체험단 중복 지원 방지

### 체크 제약 (Check Constraints)
1. `users.role` - 'advertiser' 또는 'influencer'만 허용
2. 검증 상태 필드 - 정의된 상태값만 허용 (pending/verified/failed)
3. 지원 상태 필드 - pending/selected/rejected만 허용
4. 모집 상태 필드 - recruiting/closed/selection_completed만 허용
5. `campaigns.total_slots` - 양수만 허용
6. `campaigns.selected_count` - 0 이상이며 total_slots 이하
7. 날짜 제약 - 종료일 >= 시작일

### 인덱스 전략
1. **외래키 인덱스** - JOIN 성능 최적화
2. **상태 컬럼 인덱스** - 필터링 성능 최적화
3. **날짜 컬럼 인덱스** - 정렬 및 범위 조회 최적화
4. **복합 인덱스** - 자주 함께 조회되는 컬럼 (user_id + status 등)
5. **부분 인덱스** - 특정 조건의 데이터만 인덱싱 (모집 중인 체험단)

---

## 트리거 및 RLS 정책

### updated_at 자동 업데이트 트리거

모든 테이블의 `updated_at` 컬럼을 UPDATE 시 자동으로 현재 시각으로 갱신하는 트리거가 적용됩니다.

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

적용 테이블:
- users
- influencer_profiles
- influencer_channels
- advertiser_profiles
- campaigns
- campaign_applications

### Row Level Security (RLS) 정책

#### users 테이블
- ✅ 사용자는 자신의 프로필만 조회/수정 가능

#### influencer_profiles 테이블
- ✅ 인플루언서는 자신의 프로필만 조회/수정 가능

#### influencer_channels 테이블
- ✅ 인플루언서는 자신의 채널만 관리 가능 (CRUD)

#### advertiser_profiles 테이블
- ✅ 광고주는 자신의 프로필만 조회/수정 가능

#### campaigns 테이블
- ✅ 모든 사용자는 모집 중인 체험단 조회 가능
- ✅ 광고주는 자신의 체험단만 관리 가능 (CRUD)

#### campaign_applications 테이블
- ✅ 인플루언서는 자신의 지원서만 조회 가능
- ✅ 인플루언서는 지원서 제출 가능 (INSERT)
- ✅ 광고주는 자신의 체험단 지원서만 조회/수정 가능

---

## 마이그레이션 가이드

### 마이그레이션 파일 실행 순서

1. **20250104000001_create_users_table.sql**
   - users 테이블 생성
   - user_consents 테이블 생성

2. **20250104000002_create_influencer_tables.sql**
   - influencer_profiles 테이블 생성
   - influencer_channels 테이블 생성

3. **20250104000003_create_advertiser_tables.sql**
   - advertiser_profiles 테이블 생성

4. **20250104000004_create_campaign_tables.sql**
   - campaigns 테이블 생성
   - campaign_applications 테이블 생성

5. **20250104000005_create_triggers.sql**
   - updated_at 자동 업데이트 트리거 함수 및 적용

6. **20250104000006_create_rls_policies.sql**
   - 모든 테이블에 RLS 정책 적용

### 마이그레이션 실행 방법

```bash
# Supabase CLI를 사용한 마이그레이션
supabase db reset  # 개발 환경에서 초기화 (주의!)
supabase db push   # 로컬 마이그레이션을 원격에 적용

# 또는 개별 마이그레이션 실행
psql -h localhost -U postgres -d postgres -f supabase/migrations/20250104000001_create_users_table.sql
```

### 롤백 전략

각 마이그레이션 파일은 순서대로 실행되어야 하며, 롤백 시에는 역순으로 테이블을 삭제해야 합니다.

```sql
-- 롤백 순서 (역순)
DROP TABLE IF EXISTS campaign_applications CASCADE;
DROP TABLE IF EXISTS campaigns CASCADE;
DROP TABLE IF EXISTS advertiser_profiles CASCADE;
DROP TABLE IF EXISTS influencer_channels CASCADE;
DROP TABLE IF EXISTS influencer_profiles CASCADE;
DROP TABLE IF EXISTS user_consents CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
```

---

## 데이터 타입 선택 이유

| 타입 | 사용 이유 | 적용 컬럼 |
|------|-----------|-----------|
| UUID | 분산 환경에서 안전하며 예측 불가능한 ID | 모든 기본키, 외래키 |
| VARCHAR(n) | 길이 제한이 있는 문자열 | 이름, 이메일, 역할, 카테고리 등 |
| TEXT | 길이 제한이 없는 긴 문자열 | 설명, 혜택, 미션, 메시지 등 |
| TIMESTAMPTZ | 타임존을 포함한 타임스탬프 (국제화 대응) | 생성/수정 일시, 모집 기간 |
| DATE | 날짜만 필요한 경우 | 생년월일, 체험 기간, 방문일 |
| INTEGER | 정수 | 모집 인원, 선정 인원 |
| BOOLEAN | 참/거짓 | 약관 동의 여부 |

---

## 테이블 요약

| # | 테이블명 | 설명 | 주요 컬럼 |
|---|----------|------|-----------|
| 1 | users | 사용자 기본 정보 | id, name, phone, email, role |
| 2 | user_consents | 약관 동의 이력 | id, user_id, consent_type, agreed |
| 3 | influencer_profiles | 인플루언서 프로필 | user_id, birth_date, verification_status |
| 4 | influencer_channels | SNS 채널 정보 | id, user_id, channel_type, channel_name, channel_url |
| 5 | advertiser_profiles | 광고주 프로필 | user_id, business_name, location, category, business_registration_number |
| 6 | campaigns | 체험단 모집 | id, advertiser_id, title, description, benefits, mission, dates, slots |
| 7 | campaign_applications | 체험단 지원서 | id, campaign_id, user_id, application_message, visit_date, status |

---

## 핵심 비즈니스 로직

### 회원가입 시
1. Supabase Auth로 계정 생성 (`auth.users`)
2. `users` 테이블에 프로필 저장
3. `user_consents` 테이블에 약관 동의 이력 저장
4. 역할에 따라 `influencer_profiles` 또는 `advertiser_profiles` 레코드 생성

### 인플루언서 등록 시
1. `influencer_profiles`에 생년월일 저장
2. `influencer_channels`에 SNS 채널 정보 저장
3. 비동기 검증 작업 큐에 추가
4. 검증 완료 후 `verification_status` 업데이트

### 광고주 등록 시
1. `advertiser_profiles`에 업체 정보 저장
2. 사업자등록번호 중복 체크
3. 비동기 검증 작업 큐에 추가
4. 검증 완료 후 `verification_status` 업데이트

### 체험단 지원 시
1. 중복 지원 체크 (`campaign_applications` UNIQUE 제약)
2. 모집 기간 검증 (`campaigns.recruitment_end_date`)
3. 인플루언서 검증 상태 확인 (`influencer_profiles.verification_status`)
4. `campaign_applications` 저장 (status='pending')

### 체험단 선정 시
1. 광고주가 지원자 선택
2. `campaign_applications` 상태 업데이트 (selected/rejected)
3. `campaigns.selected_count` 업데이트
4. `campaigns.status` → 'selection_completed'

---

## 성능 최적화 전략

### 인덱스 활용
- 외래키 컬럼에 인덱스 생성으로 JOIN 성능 향상
- 상태 컬럼 인덱스로 필터링 쿼리 최적화
- 복합 인덱스로 다중 조건 쿼리 최적화
- 부분 인덱스로 자주 조회되는 데이터만 인덱싱

### 쿼리 최적화
- 모집 중인 체험단만 인덱싱 (WHERE status = 'recruiting')
- 페이지네이션을 위한 LIMIT/OFFSET 최적화
- 불필요한 컬럼 SELECT 방지 (필요한 컬럼만 조회)

### 데이터 정합성
- 외래키 제약조건으로 참조 무결성 보장
- 체크 제약조건으로 잘못된 데이터 입력 방지
- 유니크 제약조건으로 중복 데이터 방지
- 트리거로 자동 타임스탬프 관리

---

## 보안 고려사항

### Row Level Security (RLS)
- Supabase Auth 기반 접근 제어
- 사용자는 자신의 데이터만 접근 가능
- 광고주는 자신의 체험단 지원서만 관리 가능
- 모집 중인 체험단은 모든 사용자가 조회 가능

### 데이터 검증
- 필수 필드 NOT NULL 제약
- 이메일 UNIQUE 제약으로 중복 가입 방지
- 사업자등록번호 UNIQUE 제약으로 중복 등록 방지
- 체크 제약조건으로 유효한 값만 허용

### 민감 정보 처리
- 사업자등록번호는 암호화 저장 권장
- 휴대폰번호는 마스킹 처리 권장
- 개인정보는 RLS로 접근 제어

---

## 확장 가능성

### 향후 추가 가능한 기능
1. **알림 시스템** - `notifications` 테이블 추가
2. **리뷰 시스템** - `reviews` 테이블 추가
3. **결제 시스템** - `payments`, `transactions` 테이블 추가
4. **포인트 시스템** - `points`, `point_transactions` 테이블 추가
5. **관리자 시스템** - `admin_users`, `audit_logs` 테이블 추가
6. **파일 업로드** - `media_files` 테이블 추가
7. **채팅 시스템** - `messages`, `conversations` 테이블 추가

### 스케일링 전략
- 읽기 복제본(Read Replica) 활용
- 캐싱 레이어 추가 (Redis)
- 파티셔닝 (날짜 기반, ID 범위 기반)
- 아카이빙 전략 (오래된 데이터 별도 보관)

---

## 참고 문서

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Database Indexing Best Practices](https://www.postgresql.org/docs/current/indexes.html)

---

**작성일**: 2025-11-04  
**데이터베이스**: PostgreSQL (Supabase)  
**버전**: 1.0.0


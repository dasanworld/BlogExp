# 블로그 체험단 SaaS — PostgreSQL 데이터베이스 스키마

## ERD 개요

```
auth.users (Supabase Auth)
    ↓
users ─┬─→ user_consents
       ├─→ influencer_profiles ─→ influencer_channels
       ├─→ advertiser_profiles ─→ campaigns
       └─→ campaign_applications
```

---

## 테이블 스키마

### 1. users (사용자 기본 정보)

**설명**: Supabase Auth와 연동되는 사용자 프로필 테이블

```sql
CREATE TABLE users (
  -- 기본키 (Supabase Auth의 user.id와 동일)
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- 기본 정보
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  
  -- 역할 (광고주/인플루언서)
  role VARCHAR(20) NOT NULL CHECK (role IN ('advertiser', 'influencer')),
  
  -- 타임스탬프
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at DESC);
```

---

### 2. user_consents (약관 동의 이력)

**설명**: 사용자별 약관 동의 이력 저장

```sql
CREATE TABLE user_consents (
  -- 기본키
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 외래키
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- 약관 정보
  consent_type VARCHAR(50) NOT NULL, -- 'terms_of_service', 'privacy_policy', 'marketing' 등
  agreed BOOLEAN NOT NULL DEFAULT true,
  
  -- 타임스탬프
  agreed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_user_consents_user_id ON user_consents(user_id);
CREATE INDEX idx_user_consents_type ON user_consents(consent_type);
```

---

### 3. influencer_profiles (인플루언서 프로필)

**설명**: 인플루언서 추가 정보 및 검증 상태

```sql
CREATE TABLE influencer_profiles (
  -- 기본키 (users 테이블과 1:1 관계)
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  
  -- 인플루언서 정보
  birth_date DATE, -- 생년월일
  
  -- 검증 상태
  verification_status VARCHAR(20) NOT NULL DEFAULT 'pending' 
    CHECK (verification_status IN ('pending', 'verified', 'failed')),
  
  -- 타임스탬프
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_influencer_verification_status ON influencer_profiles(verification_status);
```

---

### 4. influencer_channels (인플루언서 SNS 채널)

**설명**: 인플루언서의 SNS 채널 정보 (1:N 관계)

```sql
CREATE TABLE influencer_channels (
  -- 기본키
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 외래키
  user_id UUID NOT NULL REFERENCES influencer_profiles(user_id) ON DELETE CASCADE,
  
  -- 채널 정보
  channel_type VARCHAR(50) NOT NULL, -- 'instagram', 'youtube', 'blog', 'tiktok' 등
  channel_name VARCHAR(255) NOT NULL, -- 채널명
  channel_url VARCHAR(500) NOT NULL, -- 채널 URL
  
  -- 검증 상태
  status VARCHAR(20) NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending', 'verified', 'failed')),
  
  -- 타임스탬프
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_influencer_channels_user_id ON influencer_channels(user_id);
CREATE INDEX idx_influencer_channels_type ON influencer_channels(channel_type);
CREATE INDEX idx_influencer_channels_status ON influencer_channels(status);

-- 유니크 제약 (동일 사용자가 동일 URL 중복 등록 방지)
CREATE UNIQUE INDEX idx_influencer_channels_unique_url ON influencer_channels(user_id, channel_url);
```

---

### 5. advertiser_profiles (광고주 프로필)

**설명**: 광고주(업체) 정보 및 검증 상태

```sql
CREATE TABLE advertiser_profiles (
  -- 기본키 (users 테이블과 1:1 관계)
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  
  -- 업체 정보
  business_name VARCHAR(255) NOT NULL, -- 업체명
  location TEXT NOT NULL, -- 위치 (주소)
  category VARCHAR(100) NOT NULL, -- 카테고리 (음식점, 카페, 뷰티 등)
  business_registration_number VARCHAR(50) NOT NULL UNIQUE, -- 사업자등록번호
  
  -- 검증 상태
  verification_status VARCHAR(20) NOT NULL DEFAULT 'pending' 
    CHECK (verification_status IN ('pending', 'verified', 'failed')),
  
  -- 타임스탬프
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_advertiser_verification_status ON advertiser_profiles(verification_status);
CREATE INDEX idx_advertiser_category ON advertiser_profiles(category);
CREATE UNIQUE INDEX idx_advertiser_business_reg_num ON advertiser_profiles(business_registration_number);
```

---

### 6. campaigns (체험단 모집)

**설명**: 광고주가 등록한 체험단 모집 정보

```sql
CREATE TABLE campaigns (
  -- 기본키
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 외래키 (광고주)
  advertiser_id UUID NOT NULL REFERENCES advertiser_profiles(user_id) ON DELETE CASCADE,
  
  -- 체험단 기본 정보
  title VARCHAR(255) NOT NULL, -- 체험단 제목
  description TEXT NOT NULL, -- 상세 설명
  benefits TEXT NOT NULL, -- 제공 혜택
  mission TEXT NOT NULL, -- 미션 내용
  location TEXT NOT NULL, -- 체험 장소
  
  -- 모집 기간
  recruitment_start_date TIMESTAMPTZ NOT NULL, -- 모집 시작일
  recruitment_end_date TIMESTAMPTZ NOT NULL, -- 모집 종료일
  
  -- 체험 기간
  experience_start_date DATE NOT NULL, -- 체험 시작일
  experience_end_date DATE NOT NULL, -- 체험 종료일
  
  -- 모집 인원
  total_slots INTEGER NOT NULL CHECK (total_slots > 0), -- 총 모집 인원
  selected_count INTEGER NOT NULL DEFAULT 0 CHECK (selected_count >= 0), -- 선정된 인원
  
  -- 상태
  status VARCHAR(20) NOT NULL DEFAULT 'recruiting' 
    CHECK (status IN ('recruiting', 'closed', 'selection_completed')),
  
  -- 타임스탬프
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- 제약조건
  CONSTRAINT check_recruitment_dates CHECK (recruitment_end_date >= recruitment_start_date),
  CONSTRAINT check_experience_dates CHECK (experience_end_date >= experience_start_date),
  CONSTRAINT check_selected_count CHECK (selected_count <= total_slots)
);

-- 인덱스
CREATE INDEX idx_campaigns_advertiser_id ON campaigns(advertiser_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_recruitment_dates ON campaigns(recruitment_start_date, recruitment_end_date);
CREATE INDEX idx_campaigns_created_at ON campaigns(created_at DESC);

-- 모집 중인 체험단 조회 최적화
CREATE INDEX idx_campaigns_recruiting ON campaigns(status, recruitment_end_date) 
  WHERE status = 'recruiting';
```

---

### 7. campaign_applications (체험단 지원서)

**설명**: 인플루언서의 체험단 지원 정보

```sql
CREATE TABLE campaign_applications (
  -- 기본키
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 외래키
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES influencer_profiles(user_id) ON DELETE CASCADE,
  
  -- 지원 정보
  application_message TEXT NOT NULL, -- 각오 한마디
  visit_date DATE NOT NULL, -- 방문 예정일자
  
  -- 상태
  status VARCHAR(20) NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending', 'selected', 'rejected')),
  
  -- 타임스탬프
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- 중복 지원 방지 (하나의 체험단에 동일 사용자가 여러 번 지원 불가)
  CONSTRAINT unique_campaign_application UNIQUE (campaign_id, user_id)
);

-- 인덱스
CREATE INDEX idx_applications_campaign_id ON campaign_applications(campaign_id);
CREATE INDEX idx_applications_user_id ON campaign_applications(user_id);
CREATE INDEX idx_applications_status ON campaign_applications(status);
CREATE INDEX idx_applications_applied_at ON campaign_applications(applied_at DESC);

-- 인플루언서가 자신의 지원 목록 조회 최적화
CREATE INDEX idx_applications_user_status ON campaign_applications(user_id, status);
```

---

## 데이터베이스 제약조건 요약

### 기본키 (Primary Key)
- 모든 테이블에 UUID 기반 기본키 사용
- `users`, `influencer_profiles`, `advertiser_profiles`는 Supabase Auth의 user.id와 동일한 UUID 사용

### 외래키 (Foreign Key)
- 모든 외래키에 `ON DELETE CASCADE` 적용 (사용자 삭제 시 관련 데이터 자동 삭제)
- 참조 무결성 보장

### 유니크 제약 (Unique Constraints)
- `users.email`: 이메일 중복 방지
- `advertiser_profiles.business_registration_number`: 사업자등록번호 중복 방지
- `influencer_channels(user_id, channel_url)`: 동일 사용자의 동일 채널 URL 중복 방지
- `campaign_applications(campaign_id, user_id)`: 체험단 중복 지원 방지

### 체크 제약 (Check Constraints)
- `users.role`: 'advertiser' 또는 'influencer'만 허용
- `*_status`: 정의된 상태값만 허용 (pending, verified, failed 등)
- `campaigns.total_slots`: 양수만 허용
- `campaigns.selected_count`: 0 이상이며 total_slots 이하
- `campaigns` 날짜 제약: 종료일 >= 시작일

### 인덱스 전략
- 외래키 컬럼에 인덱스 생성 (JOIN 성능 최적화)
- 상태 컬럼에 인덱스 생성 (필터링 최적화)
- 날짜 컬럼에 인덱스 생성 (정렬 및 범위 조회 최적화)
- 복합 인덱스 활용 (자주 함께 조회되는 컬럼)
- 부분 인덱스 활용 (모집 중인 체험단만 인덱싱)

---

## 타임스탬프 자동 업데이트 트리거

**설명**: `updated_at` 컬럼을 자동으로 업데이트하는 트리거 함수

```sql
-- 트리거 함수 생성
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 각 테이블에 트리거 적용
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_influencer_profiles_updated_at
  BEFORE UPDATE ON influencer_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_influencer_channels_updated_at
  BEFORE UPDATE ON influencer_channels
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_advertiser_profiles_updated_at
  BEFORE UPDATE ON advertiser_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaign_applications_updated_at
  BEFORE UPDATE ON campaign_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

## Row Level Security (RLS) 정책 가이드

**설명**: Supabase RLS를 활용한 데이터 접근 제어

### users 테이블
```sql
-- 자신의 프로필만 조회/수정 가능
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);
```

### influencer_profiles 테이블
```sql
ALTER TABLE influencer_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Influencers can view own profile"
  ON influencer_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Influencers can update own profile"
  ON influencer_profiles FOR UPDATE
  USING (auth.uid() = user_id);
```

### influencer_channels 테이블
```sql
ALTER TABLE influencer_channels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Influencers can manage own channels"
  ON influencer_channels FOR ALL
  USING (auth.uid() = user_id);
```

### advertiser_profiles 테이블
```sql
ALTER TABLE advertiser_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Advertisers can view own profile"
  ON advertiser_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Advertisers can update own profile"
  ON advertiser_profiles FOR UPDATE
  USING (auth.uid() = user_id);
```

### campaigns 테이블
```sql
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 모집 중인 체험단 조회 가능
CREATE POLICY "Anyone can view recruiting campaigns"
  ON campaigns FOR SELECT
  USING (status = 'recruiting');

-- 광고주는 자신의 체험단 관리 가능
CREATE POLICY "Advertisers can manage own campaigns"
  ON campaigns FOR ALL
  USING (auth.uid() = advertiser_id);
```

### campaign_applications 테이블
```sql
ALTER TABLE campaign_applications ENABLE ROW LEVEL SECURITY;

-- 인플루언서는 자신의 지원서 조회 가능
CREATE POLICY "Influencers can view own applications"
  ON campaign_applications FOR SELECT
  USING (auth.uid() = user_id);

-- 인플루언서는 지원서 제출 가능
CREATE POLICY "Influencers can create applications"
  ON campaign_applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 광고주는 자신의 체험단 지원서 조회/수정 가능
CREATE POLICY "Advertisers can view applications for own campaigns"
  ON campaign_applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = campaign_applications.campaign_id
      AND campaigns.advertiser_id = auth.uid()
    )
  );

CREATE POLICY "Advertisers can update applications for own campaigns"
  ON campaign_applications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = campaign_applications.campaign_id
      AND campaigns.advertiser_id = auth.uid()
    )
  );
```

---

## 마이그레이션 파일 생성 순서

1. `0001_create_users_table.sql` - users, user_consents
2. `0002_create_influencer_tables.sql` - influencer_profiles, influencer_channels
3. `0003_create_advertiser_tables.sql` - advertiser_profiles
4. `0004_create_campaign_tables.sql` - campaigns, campaign_applications
5. `0005_create_triggers.sql` - updated_at 트리거
6. `0006_create_rls_policies.sql` - RLS 정책

---

## 테이블 간 관계 요약

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

## 데이터 타입 선택 이유

- **UUID**: 분산 환경에서 안전하며 예측 불가능한 ID
- **VARCHAR**: 길이 제한이 있는 문자열 (이름, 이메일 등)
- **TEXT**: 길이 제한이 없는 긴 문자열 (설명, 미션 등)
- **TIMESTAMPTZ**: 타임존을 포함한 타임스탬프 (국제화 대응)
- **DATE**: 날짜만 필요한 경우 (생년월일, 체험 날짜 등)
- **INTEGER**: 정수 (모집 인원 등)
- **BOOLEAN**: 참/거짓 (약관 동의 등)


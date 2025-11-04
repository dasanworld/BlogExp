-- ============================================================================
-- Migration: 20250104000004_create_campaign_tables.sql
-- Description: 체험단 모집 및 지원서 테이블 생성
-- Created: 2025-11-04
-- ============================================================================

-- ============================================================================
-- 1. campaigns 테이블 생성 (체험단 모집)
-- ============================================================================

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

-- 인덱스 생성
CREATE INDEX idx_campaigns_advertiser_id ON campaigns(advertiser_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_recruitment_dates ON campaigns(recruitment_start_date, recruitment_end_date);
CREATE INDEX idx_campaigns_created_at ON campaigns(created_at DESC);

-- 모집 중인 체험단 조회 최적화 (부분 인덱스)
CREATE INDEX idx_campaigns_recruiting ON campaigns(status, recruitment_end_date) 
  WHERE status = 'recruiting';

-- 테이블 코멘트
COMMENT ON TABLE campaigns IS '광고주가 등록한 체험단 모집 정보';
COMMENT ON COLUMN campaigns.id IS '체험단 고유 ID';
COMMENT ON COLUMN campaigns.advertiser_id IS '광고주 ID (외래키)';
COMMENT ON COLUMN campaigns.title IS '체험단 제목';
COMMENT ON COLUMN campaigns.description IS '체험단 상세 설명';
COMMENT ON COLUMN campaigns.benefits IS '인플루언서에게 제공되는 혜택';
COMMENT ON COLUMN campaigns.mission IS '인플루언서가 수행해야 할 미션';
COMMENT ON COLUMN campaigns.location IS '체험 장소';
COMMENT ON COLUMN campaigns.recruitment_start_date IS '모집 시작 일시';
COMMENT ON COLUMN campaigns.recruitment_end_date IS '모집 종료 일시';
COMMENT ON COLUMN campaigns.experience_start_date IS '체험 시작 날짜';
COMMENT ON COLUMN campaigns.experience_end_date IS '체험 종료 날짜';
COMMENT ON COLUMN campaigns.total_slots IS '총 모집 인원 (양수만 허용)';
COMMENT ON COLUMN campaigns.selected_count IS '선정된 인원 (0 이상, total_slots 이하)';
COMMENT ON COLUMN campaigns.status IS '모집 상태 - recruiting(모집중), closed(모집종료), selection_completed(선정완료)';
COMMENT ON COLUMN campaigns.created_at IS '체험단 등록 일시';
COMMENT ON COLUMN campaigns.updated_at IS '체험단 정보 수정 일시';

-- ============================================================================
-- 2. campaign_applications 테이블 생성 (체험단 지원서)
-- ============================================================================

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

-- 인덱스 생성
CREATE INDEX idx_applications_campaign_id ON campaign_applications(campaign_id);
CREATE INDEX idx_applications_user_id ON campaign_applications(user_id);
CREATE INDEX idx_applications_status ON campaign_applications(status);
CREATE INDEX idx_applications_applied_at ON campaign_applications(applied_at DESC);

-- 인플루언서가 자신의 지원 목록 조회 최적화 (복합 인덱스)
CREATE INDEX idx_applications_user_status ON campaign_applications(user_id, status);

-- 테이블 코멘트
COMMENT ON TABLE campaign_applications IS '인플루언서의 체험단 지원 정보';
COMMENT ON COLUMN campaign_applications.id IS '지원서 고유 ID';
COMMENT ON COLUMN campaign_applications.campaign_id IS '체험단 ID (외래키)';
COMMENT ON COLUMN campaign_applications.user_id IS '인플루언서 ID (외래키)';
COMMENT ON COLUMN campaign_applications.application_message IS '지원 시 작성한 각오 한마디';
COMMENT ON COLUMN campaign_applications.visit_date IS '방문 예정일자';
COMMENT ON COLUMN campaign_applications.status IS '지원 상태 - pending(대기중), selected(선정), rejected(반려)';
COMMENT ON COLUMN campaign_applications.applied_at IS '지원 일시';
COMMENT ON COLUMN campaign_applications.updated_at IS '지원서 수정 일시 (상태 변경 등)';


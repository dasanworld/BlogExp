-- ============================================================================
-- Migration: 20250104000002_create_influencer_tables.sql
-- Description: 인플루언서 프로필 및 SNS 채널 테이블 생성
-- Created: 2025-11-04
-- ============================================================================

-- ============================================================================
-- 1. influencer_profiles 테이블 생성 (인플루언서 프로필)
-- ============================================================================

CREATE TABLE influencer_profiles (
  -- 기본키 (users 테이블과 1:1 관계)
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  
  -- 인플루언서 정보
  birth_date DATE, -- 생년월일 (NULL 허용 - 초기 가입 시 미입력 가능)
  
  -- 검증 상태
  verification_status VARCHAR(20) NOT NULL DEFAULT 'pending' 
    CHECK (verification_status IN ('pending', 'verified', 'failed')),
  
  -- 타임스탬프
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_influencer_verification_status ON influencer_profiles(verification_status);

-- 테이블 코멘트
COMMENT ON TABLE influencer_profiles IS '인플루언서 프로필 정보 및 검증 상태';
COMMENT ON COLUMN influencer_profiles.user_id IS '사용자 ID (users 테이블과 1:1 관계)';
COMMENT ON COLUMN influencer_profiles.birth_date IS '생년월일';
COMMENT ON COLUMN influencer_profiles.verification_status IS '검증 상태 - pending(대기중), verified(검증완료), failed(검증실패)';
COMMENT ON COLUMN influencer_profiles.created_at IS '프로필 생성 일시';
COMMENT ON COLUMN influencer_profiles.updated_at IS '프로필 수정 일시';

-- ============================================================================
-- 2. influencer_channels 테이블 생성 (인플루언서 SNS 채널)
-- ============================================================================

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

-- 인덱스 생성
CREATE INDEX idx_influencer_channels_user_id ON influencer_channels(user_id);
CREATE INDEX idx_influencer_channels_type ON influencer_channels(channel_type);
CREATE INDEX idx_influencer_channels_status ON influencer_channels(status);

-- 유니크 제약 (동일 사용자가 동일 URL 중복 등록 방지)
CREATE UNIQUE INDEX idx_influencer_channels_unique_url 
  ON influencer_channels(user_id, channel_url);

-- 테이블 코멘트
COMMENT ON TABLE influencer_channels IS '인플루언서의 SNS 채널 정보 (1:N 관계)';
COMMENT ON COLUMN influencer_channels.id IS '채널 고유 ID';
COMMENT ON COLUMN influencer_channels.user_id IS '인플루언서 ID (외래키)';
COMMENT ON COLUMN influencer_channels.channel_type IS '채널 유형 (instagram, youtube, blog, tiktok 등)';
COMMENT ON COLUMN influencer_channels.channel_name IS '채널명';
COMMENT ON COLUMN influencer_channels.channel_url IS '채널 URL';
COMMENT ON COLUMN influencer_channels.status IS '검증 상태 - pending(대기중), verified(검증완료), failed(검증실패)';
COMMENT ON COLUMN influencer_channels.created_at IS '채널 등록 일시';
COMMENT ON COLUMN influencer_channels.updated_at IS '채널 정보 수정 일시';


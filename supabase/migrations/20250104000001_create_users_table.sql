-- ============================================================================
-- Migration: 20250104000001_create_users_table.sql
-- Description: 사용자 기본 정보 및 약관 동의 이력 테이블 생성
-- Created: 2025-11-04
-- ============================================================================

-- ============================================================================
-- 1. users 테이블 생성 (사용자 기본 정보)
-- ============================================================================

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

-- 인덱스 생성
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- 테이블 코멘트
COMMENT ON TABLE users IS '사용자 기본 정보 테이블 - Supabase Auth와 연동';
COMMENT ON COLUMN users.id IS 'Supabase Auth의 user.id와 동일한 UUID';
COMMENT ON COLUMN users.name IS '사용자 이름';
COMMENT ON COLUMN users.phone IS '휴대폰번호';
COMMENT ON COLUMN users.email IS '이메일 (중복 불가)';
COMMENT ON COLUMN users.role IS '역할 - advertiser(광고주) 또는 influencer(인플루언서)';
COMMENT ON COLUMN users.created_at IS '계정 생성 일시';
COMMENT ON COLUMN users.updated_at IS '정보 수정 일시';

-- ============================================================================
-- 2. user_consents 테이블 생성 (약관 동의 이력)
-- ============================================================================

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

-- 인덱스 생성
CREATE INDEX idx_user_consents_user_id ON user_consents(user_id);
CREATE INDEX idx_user_consents_type ON user_consents(consent_type);

-- 테이블 코멘트
COMMENT ON TABLE user_consents IS '사용자별 약관 동의 이력 저장 테이블';
COMMENT ON COLUMN user_consents.id IS '약관 동의 이력 고유 ID';
COMMENT ON COLUMN user_consents.user_id IS '사용자 ID (외래키)';
COMMENT ON COLUMN user_consents.consent_type IS '약관 유형 (예: terms_of_service, privacy_policy, marketing)';
COMMENT ON COLUMN user_consents.agreed IS '동의 여부 (기본값: true)';
COMMENT ON COLUMN user_consents.agreed_at IS '동의한 일시';


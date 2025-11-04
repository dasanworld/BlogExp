-- ============================================================================
-- Migration: 20250104000003_create_advertiser_tables.sql
-- Description: 광고주 프로필 테이블 생성
-- Created: 2025-11-04
-- ============================================================================

-- ============================================================================
-- 1. advertiser_profiles 테이블 생성 (광고주 프로필)
-- ============================================================================

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

-- 인덱스 생성
CREATE INDEX idx_advertiser_verification_status ON advertiser_profiles(verification_status);
CREATE INDEX idx_advertiser_category ON advertiser_profiles(category);
CREATE UNIQUE INDEX idx_advertiser_business_reg_num ON advertiser_profiles(business_registration_number);

-- 테이블 코멘트
COMMENT ON TABLE advertiser_profiles IS '광고주(업체) 정보 및 검증 상태';
COMMENT ON COLUMN advertiser_profiles.user_id IS '사용자 ID (users 테이블과 1:1 관계)';
COMMENT ON COLUMN advertiser_profiles.business_name IS '업체명';
COMMENT ON COLUMN advertiser_profiles.location IS '업체 위치 (주소)';
COMMENT ON COLUMN advertiser_profiles.category IS '업체 카테고리 (음식점, 카페, 뷰티 등)';
COMMENT ON COLUMN advertiser_profiles.business_registration_number IS '사업자등록번호 (중복 불가)';
COMMENT ON COLUMN advertiser_profiles.verification_status IS '검증 상태 - pending(대기중), verified(검증완료), failed(검증실패)';
COMMENT ON COLUMN advertiser_profiles.created_at IS '프로필 생성 일시';
COMMENT ON COLUMN advertiser_profiles.updated_at IS '프로필 수정 일시';


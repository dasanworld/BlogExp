-- ============================================================================
-- Migration: 20250104000006_create_rls_policies.sql
-- Description: Row Level Security (RLS) 정책 설정
-- Created: 2025-11-04
-- ============================================================================

-- ============================================================================
-- 1. users 테이블 RLS 정책
-- ============================================================================

-- RLS 활성화
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 프로필만 조회 가능
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- 사용자는 자신의 프로필만 수정 가능
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- ============================================================================
-- 2. user_consents 테이블 RLS 정책
-- ============================================================================

-- RLS 활성화
ALTER TABLE user_consents ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 약관 동의 이력만 조회 가능
CREATE POLICY "Users can view own consents"
  ON user_consents FOR SELECT
  USING (auth.uid() = user_id);

-- 사용자는 자신의 약관 동의 이력만 생성 가능
CREATE POLICY "Users can create own consents"
  ON user_consents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 3. influencer_profiles 테이블 RLS 정책
-- ============================================================================

-- RLS 활성화
ALTER TABLE influencer_profiles ENABLE ROW LEVEL SECURITY;

-- 인플루언서는 자신의 프로필만 조회 가능
CREATE POLICY "Influencers can view own profile"
  ON influencer_profiles FOR SELECT
  USING (auth.uid() = user_id);

-- 인플루언서는 자신의 프로필만 생성 가능
CREATE POLICY "Influencers can create own profile"
  ON influencer_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 인플루언서는 자신의 프로필만 수정 가능
CREATE POLICY "Influencers can update own profile"
  ON influencer_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 4. influencer_channels 테이블 RLS 정책
-- ============================================================================

-- RLS 활성화
ALTER TABLE influencer_channels ENABLE ROW LEVEL SECURITY;

-- 인플루언서는 자신의 채널만 조회 가능
CREATE POLICY "Influencers can view own channels"
  ON influencer_channels FOR SELECT
  USING (auth.uid() = user_id);

-- 인플루언서는 자신의 채널만 생성 가능
CREATE POLICY "Influencers can create own channels"
  ON influencer_channels FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 인플루언서는 자신의 채널만 수정 가능
CREATE POLICY "Influencers can update own channels"
  ON influencer_channels FOR UPDATE
  USING (auth.uid() = user_id);

-- 인플루언서는 자신의 채널만 삭제 가능
CREATE POLICY "Influencers can delete own channels"
  ON influencer_channels FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 5. advertiser_profiles 테이블 RLS 정책
-- ============================================================================

-- RLS 활성화
ALTER TABLE advertiser_profiles ENABLE ROW LEVEL SECURITY;

-- 광고주는 자신의 프로필만 조회 가능
CREATE POLICY "Advertisers can view own profile"
  ON advertiser_profiles FOR SELECT
  USING (auth.uid() = user_id);

-- 광고주는 자신의 프로필만 생성 가능
CREATE POLICY "Advertisers can create own profile"
  ON advertiser_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 광고주는 자신의 프로필만 수정 가능
CREATE POLICY "Advertisers can update own profile"
  ON advertiser_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 6. campaigns 테이블 RLS 정책
-- ============================================================================

-- RLS 활성화
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 모집 중인 체험단 조회 가능
CREATE POLICY "Anyone can view recruiting campaigns"
  ON campaigns FOR SELECT
  USING (status = 'recruiting');

-- 광고주는 자신의 모든 체험단 조회 가능 (상태 무관)
CREATE POLICY "Advertisers can view own campaigns"
  ON campaigns FOR SELECT
  USING (auth.uid() = advertiser_id);

-- 광고주는 자신의 체험단만 생성 가능
CREATE POLICY "Advertisers can create own campaigns"
  ON campaigns FOR INSERT
  WITH CHECK (auth.uid() = advertiser_id);

-- 광고주는 자신의 체험단만 수정 가능
CREATE POLICY "Advertisers can update own campaigns"
  ON campaigns FOR UPDATE
  USING (auth.uid() = advertiser_id);

-- 광고주는 자신의 체험단만 삭제 가능
CREATE POLICY "Advertisers can delete own campaigns"
  ON campaigns FOR DELETE
  USING (auth.uid() = advertiser_id);

-- ============================================================================
-- 7. campaign_applications 테이블 RLS 정책
-- ============================================================================

-- RLS 활성화
ALTER TABLE campaign_applications ENABLE ROW LEVEL SECURITY;

-- 인플루언서는 자신의 지원서 조회 가능
CREATE POLICY "Influencers can view own applications"
  ON campaign_applications FOR SELECT
  USING (auth.uid() = user_id);

-- 인플루언서는 지원서 제출 가능
CREATE POLICY "Influencers can create applications"
  ON campaign_applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 광고주는 자신의 체험단 지원서 조회 가능
CREATE POLICY "Advertisers can view applications for own campaigns"
  ON campaign_applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = campaign_applications.campaign_id
      AND campaigns.advertiser_id = auth.uid()
    )
  );

-- 광고주는 자신의 체험단 지원서 상태 수정 가능 (선정/반려)
CREATE POLICY "Advertisers can update applications for own campaigns"
  ON campaign_applications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = campaign_applications.campaign_id
      AND campaigns.advertiser_id = auth.uid()
    )
  );

-- ============================================================================
-- RLS 정책 요약
-- ============================================================================

-- 1. users: 자신의 프로필만 조회/수정
-- 2. user_consents: 자신의 약관 동의 이력만 조회/생성
-- 3. influencer_profiles: 인플루언서는 자신의 프로필만 관리
-- 4. influencer_channels: 인플루언서는 자신의 채널만 CRUD
-- 5. advertiser_profiles: 광고주는 자신의 프로필만 관리
-- 6. campaigns: 모집 중인 체험단은 모두 조회 가능, 광고주는 자신의 체험단만 CRUD
-- 7. campaign_applications: 인플루언서는 지원서 제출 및 조회, 광고주는 자신의 체험단 지원서 조회/수정


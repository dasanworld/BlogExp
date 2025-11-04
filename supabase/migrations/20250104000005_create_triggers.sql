-- ============================================================================
-- Migration: 20250104000005_create_triggers.sql
-- Description: updated_at 자동 업데이트 트리거 생성
-- Created: 2025-11-04
-- ============================================================================

-- ============================================================================
-- 1. 트리거 함수 생성
-- ============================================================================

-- updated_at 컬럼을 자동으로 현재 시각으로 업데이트하는 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_updated_at_column() IS 'UPDATE 시 updated_at 컬럼을 자동으로 현재 시각으로 갱신하는 트리거 함수';

-- ============================================================================
-- 2. users 테이블 트리거 적용
-- ============================================================================

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TRIGGER update_users_updated_at ON users IS 'users 테이블의 updated_at 자동 업데이트 트리거';

-- ============================================================================
-- 3. influencer_profiles 테이블 트리거 적용
-- ============================================================================

CREATE TRIGGER update_influencer_profiles_updated_at
  BEFORE UPDATE ON influencer_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TRIGGER update_influencer_profiles_updated_at ON influencer_profiles IS 'influencer_profiles 테이블의 updated_at 자동 업데이트 트리거';

-- ============================================================================
-- 4. influencer_channels 테이블 트리거 적용
-- ============================================================================

CREATE TRIGGER update_influencer_channels_updated_at
  BEFORE UPDATE ON influencer_channels
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TRIGGER update_influencer_channels_updated_at ON influencer_channels IS 'influencer_channels 테이블의 updated_at 자동 업데이트 트리거';

-- ============================================================================
-- 5. advertiser_profiles 테이블 트리거 적용
-- ============================================================================

CREATE TRIGGER update_advertiser_profiles_updated_at
  BEFORE UPDATE ON advertiser_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TRIGGER update_advertiser_profiles_updated_at ON advertiser_profiles IS 'advertiser_profiles 테이블의 updated_at 자동 업데이트 트리거';

-- ============================================================================
-- 6. campaigns 테이블 트리거 적용
-- ============================================================================

CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TRIGGER update_campaigns_updated_at ON campaigns IS 'campaigns 테이블의 updated_at 자동 업데이트 트리거';

-- ============================================================================
-- 7. campaign_applications 테이블 트리거 적용
-- ============================================================================

CREATE TRIGGER update_campaign_applications_updated_at
  BEFORE UPDATE ON campaign_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TRIGGER update_campaign_applications_updated_at ON campaign_applications IS 'campaign_applications 테이블의 updated_at 자동 업데이트 트리거';


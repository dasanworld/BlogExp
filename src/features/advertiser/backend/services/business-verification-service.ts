import type { SupabaseClient } from '@supabase/supabase-js';
import { validateBusinessNumber } from '@/lib/utils/business-number-utils';

export const verifyBusinessNumber = async (
  businessNumber: string,
): Promise<boolean> => {
  try {
    const isValid = validateBusinessNumber(businessNumber);
    
    if (!isValid) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('사업자번호 검증 오류:', error);
    return false;
  }
};

export const updateBusinessVerificationStatus = async (
  client: SupabaseClient,
  userId: string,
  verified: boolean,
): Promise<boolean> => {
  try {
    const { error } = await client
      .from('advertiser_profiles')
      .update({
        verification_status: verified ? 'verified' : 'failed',
      })
      .eq('user_id', userId);

    return !error;
  } catch (error) {
    console.error('검증 상태 업데이트 오류:', error);
    return false;
  }
};

export const verifyAdvertiserBusinessNumber = async (
  client: SupabaseClient,
  userId: string,
  businessNumber: string,
): Promise<boolean> => {
  try {
    const isValid = await verifyBusinessNumber(businessNumber);
    
    if (!isValid) {
      await updateBusinessVerificationStatus(client, userId, false);
      return false;
    }

    await updateBusinessVerificationStatus(client, userId, true);
    return true;
  } catch (error) {
    console.error('광고주 사업자번호 검증 오류:', error);
    await updateBusinessVerificationStatus(client, userId, false);
    return false;
  }
};

import type { SupabaseClient } from '@supabase/supabase-js';
import { failure, success, type HandlerResult } from '@/backend/http/response';
import type { UpdateAdvertiserProfileRequest, AdvertiserProfileResponse } from '../schema/profile-schema';
import { advertiserProfileErrorCodes, type AdvertiserProfileServiceError } from '../errors/profile-error';
import { normalizeBusinessNumber } from '@/lib/utils/business-number-utils';

export const getAdvertiserProfile = async (
  client: SupabaseClient,
  userId: string,
): Promise<HandlerResult<AdvertiserProfileResponse, AdvertiserProfileServiceError>> => {
  try {
    const { data: profile, error } = await client
      .from('advertiser_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !profile) {
      return failure(404, advertiserProfileErrorCodes.profileNotFound, '프로필을 찾을 수 없습니다');
    }

    return success<AdvertiserProfileResponse>({
      userId: profile.user_id,
      businessName: profile.business_name,
      location: profile.location,
      category: profile.category,
      businessRegistrationNumber: profile.business_registration_number,
      verificationStatus: profile.verification_status,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
    });
  } catch (error) {
    return failure(500, advertiserProfileErrorCodes.internalError, '프로필 조회 중 오류가 발생했습니다', error);
  }
};

export const updateAdvertiserProfile = async (
  client: SupabaseClient,
  userId: string,
  request: UpdateAdvertiserProfileRequest,
): Promise<HandlerResult<AdvertiserProfileResponse, AdvertiserProfileServiceError>> => {
  try {
    const normalizedBusinessNumber = normalizeBusinessNumber(request.businessRegistrationNumber);

    const { data: existing, error: checkError } = await client
      .from('advertiser_profiles')
      .select('user_id')
      .eq('business_registration_number', normalizedBusinessNumber)
      .neq('user_id', userId)
      .maybeSingle();

    if (checkError) {
      return failure(500, advertiserProfileErrorCodes.internalError, '중복 확인 중 오류가 발생했습니다', checkError);
    }

    if (existing) {
      return failure(409, advertiserProfileErrorCodes.businessNumberExists, '이미 등록된 사업자등록번호입니다');
    }

    const { data: updated, error: updateError } = await client
      .from('advertiser_profiles')
      .update({
        business_name: request.businessName,
        location: request.location,
        category: request.category,
        business_registration_number: normalizedBusinessNumber,
        verification_status: 'pending',
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (updateError || !updated) {
      return failure(500, advertiserProfileErrorCodes.profileUpdateFailed, '프로필 업데이트에 실패했습니다', updateError);
    }

    return success<AdvertiserProfileResponse>(
      {
        userId: updated.user_id,
        businessName: updated.business_name,
        location: updated.location,
        category: updated.category,
        businessRegistrationNumber: updated.business_registration_number,
        verificationStatus: updated.verification_status,
        createdAt: updated.created_at,
        updatedAt: updated.updated_at,
      },
      201,
    );
  } catch (error) {
    return failure(500, advertiserProfileErrorCodes.internalError, '프로필 등록 중 오류가 발생했습니다', error);
  }
};

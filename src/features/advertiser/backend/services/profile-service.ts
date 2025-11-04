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
    // 0. 보조: users 테이블에 사용자가 없으면 Auth에서 가져와 생성 (FK 보장)
    const { data: existedUser, error: checkUserErr } = await client
      .from('users')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    if (checkUserErr) {
      return failure(500, advertiserProfileErrorCodes.internalError, '사용자 확인 중 오류가 발생했습니다', checkUserErr);
    }

    if (!existedUser) {
      // 서비스 롤로 Auth에서 사용자 조회
      const { data: adminUser, error: adminErr } = await client.auth.admin.getUserById(userId);
      if (adminErr || !adminUser?.user) {
        return failure(500, advertiserProfileErrorCodes.internalError, '인증 사용자 정보를 조회할 수 없습니다', adminErr);
      }

      const email = adminUser.user.email;
      const meta = (adminUser.user.user_metadata || {}) as { name?: string; phone?: string; role?: string };
      const name = meta.name;
      const phone = meta.phone;
      const role = (meta.role as string | undefined) ?? 'advertiser';

      if (!email || !name || !phone) {
        return failure(400, advertiserProfileErrorCodes.invalidInput, '사용자 기본정보(이름/휴대폰/이메일)가 없어 프로필을 생성할 수 없습니다');
      }

      const { error: createUserErr } = await client
        .from('users')
        .insert({ id: userId, name, phone, email, role });

      if (createUserErr) {
        return failure(500, advertiserProfileErrorCodes.profileUpdateFailed, '사용자 기본정보 저장에 실패했습니다', createUserErr);
      }
    }
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

    // 행이 없으면 INSERT (온보딩 최초 등록)
    let final = updated;
    if ((!updated || updateError?.code === 'PGRST116') /* No rows updated */) {
      const { data: inserted, error: insertError } = await client
        .from('advertiser_profiles')
        .insert({
          user_id: userId,
          business_name: request.businessName,
          location: request.location,
          category: request.category,
          business_registration_number: normalizedBusinessNumber,
          verification_status: 'pending',
        })
        .select()
        .single();

      if (insertError || !inserted) {
        return failure(500, advertiserProfileErrorCodes.profileUpdateFailed, '프로필 저장에 실패했습니다', insertError);
      }

      final = inserted;
    } else if (updateError) {
      return failure(500, advertiserProfileErrorCodes.profileUpdateFailed, '프로필 업데이트에 실패했습니다', updateError);
    }

    return success<AdvertiserProfileResponse>(
      {
        userId: final.user_id,
        businessName: final.business_name,
        location: final.location,
        category: final.category,
        businessRegistrationNumber: final.business_registration_number,
        verificationStatus: final.verification_status,
        createdAt: final.created_at,
        updatedAt: final.updated_at,
      },
      201,
    );
  } catch (error) {
    return failure(500, advertiserProfileErrorCodes.internalError, '프로필 등록 중 오류가 발생했습니다', error);
  }
};

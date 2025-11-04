import type { SupabaseClient } from '@supabase/supabase-js';
import {
  failure,
  success,
  type HandlerResult,
} from '@/backend/http/response';
import type { SignupRequest, SignupResponse } from '../schema/signup-schema';
import { signupErrorCodes, type SignupServiceError } from '../errors/signup-error';

export const checkEmailExists = async (
  client: SupabaseClient,
  email: string,
): Promise<boolean> => {
  const { data, error } = await client
    .from('users')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (error) throw error;
  return data !== null;
};

export const checkPhoneExists = async (
  client: SupabaseClient,
  phone: string,
): Promise<boolean> => {
  const { data, error } = await client
    .from('users')
    .select('id')
    .eq('phone', phone)
    .maybeSingle();

  if (error) throw error;
  return data !== null;
};

export const createUserAccount = async (
  client: SupabaseClient,
  request: SignupRequest,
): Promise<HandlerResult<SignupResponse, SignupServiceError, unknown>> => {
  try {
    const [emailExists, phoneExists] = await Promise.all([
      checkEmailExists(client, request.email),
      checkPhoneExists(client, request.phone),
    ]);

    if (emailExists) {
      return failure(400, signupErrorCodes.emailExists, '이미 사용 중인 이메일입니다');
    }

    if (phoneExists) {
      return failure(400, signupErrorCodes.phoneExists, '이미 사용 중인 휴대폰번호입니다');
    }

    const { data: authData, error: authError } = await client.auth.signUp({
      email: request.email,
      password: request.password,
      options: {
        data: {
          name: request.name,
          phone: request.phone,
          role: request.role,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify`,
      },
    });

    if (authError || !authData.user) {
      return failure(
        500,
        signupErrorCodes.authCreationFailed,
        '계정 생성에 실패했습니다',
        authError,
      );
    }

    const userId = authData.user.id;

    const { error: userError } = await client
      .from('users')
      .insert({
        id: userId,
        name: request.name,
        phone: request.phone,
        email: request.email,
        role: request.role,
      });

    if (userError) {
      return failure(
        500,
        signupErrorCodes.userCreationFailed,
        '사용자 프로필 생성에 실패했습니다',
        userError,
      );
    }

    const consents = [
      { user_id: userId, consent_type: 'terms_of_service', agreed: request.consents.termsOfService },
      { user_id: userId, consent_type: 'privacy_policy', agreed: request.consents.privacyPolicy },
    ];

    if (request.consents.marketing) {
      consents.push({ user_id: userId, consent_type: 'marketing', agreed: true });
    }

    const { error: consentError } = await client
      .from('user_consents')
      .insert(consents);

    if (consentError) {
      return failure(
        500,
        signupErrorCodes.consentSaveFailed,
        '약관 동의 저장에 실패했습니다',
        consentError,
      );
    }

    if (request.role === 'advertiser') {
      const { error: profileError } = await client
        .from('advertiser_profiles')
        .insert({
          user_id: userId,
          verification_status: 'pending',
        });

      if (profileError) {
        return failure(
          500,
          signupErrorCodes.profileCreationFailed,
          '광고주 프로필 생성에 실패했습니다',
          profileError,
        );
      }
    } else {
      const { error: profileError } = await client
        .from('influencer_profiles')
        .insert({
          user_id: userId,
          verification_status: 'pending',
        });

      if (profileError) {
        return failure(
          500,
          signupErrorCodes.profileCreationFailed,
          '인플루언서 프로필 생성에 실패했습니다',
          profileError,
        );
      }
    }

    const redirectUrl = request.role === 'advertiser'
      ? '/advertiser/onboarding'
      : '/influencer/onboarding';

    return success<SignupResponse>({
      userId,
      email: request.email,
      role: request.role,
      emailVerificationRequired: true,
      redirectUrl,
    }, 201);

  } catch (error) {
    return failure(
      500,
      signupErrorCodes.internalError,
      '회원가입 처리 중 오류가 발생했습니다',
      error,
    );
  }
};

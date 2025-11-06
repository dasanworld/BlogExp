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

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const { data: authData, error: authError } = await client.auth.signUp({
      email: request.email,
      password: request.password,
      options: {
        data: {
          name: request.name,
          phone: request.phone,
          role: request.role,
        },
        emailRedirectTo: `${appUrl}/auth/verify`,
      },
    });

    if (authError || !authData.user) {
      const message = (authError?.message || '').toLowerCase();
      // 이미 등록된 이메일인 경우 400으로 변환
      if (message.includes('registered') || message.includes('already')) {
        return failure(
          400,
          signupErrorCodes.emailExists,
          '이미 사용 중인 이메일입니다',
          authError,
        );
      }
      // 허용되지 않은 리디렉션/URL 설정 문제를 400으로 변환
      if (message.includes('redirect') || message.includes('url') || message.includes('callback')) {
        return failure(
          400,
          signupErrorCodes.invalidInput,
          '앱 URL 설정이 올바르지 않습니다. 환경변수 NEXT_PUBLIC_APP_URL을 확인해주세요.',
          authError,
        );
      }

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
      // 롤백: Auth 사용자 삭제 시도 (고아 계정 방지)
      try {
        await client.auth.admin.deleteUser(userId);
      } catch {
        // 롤백 실패는 무시 (추가 로깅은 라우트에서 수행)
      }
      const pgCode = (userError as any).code as string | undefined; // e.g., '23505' duplicate key
      const msg = (userError as any).message as string | undefined;
      if (pgCode === '23505') {
        const lower = (msg || '').toLowerCase();
        if (lower.includes('email')) {
          return failure(400, signupErrorCodes.emailExists, '이미 사용 중인 이메일입니다', userError);
        }
        if (lower.includes('phone')) {
          return failure(400, signupErrorCodes.phoneExists, '이미 사용 중인 휴대폰번호입니다', userError);
        }
      }
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
      // 롤백: Auth 사용자 및 users 레코드 삭제 시도
      try {
        await client.from('users').delete().eq('id', userId);
      } catch {}
      try {
        await client.auth.admin.deleteUser(userId);
      } catch {}
      return failure(
        500,
        signupErrorCodes.consentSaveFailed,
        '약관 동의 저장에 실패했습니다',
        consentError,
      );
    }

    if (request.role === 'advertiser') {
      // 광고주는 온보딩에서 필수 정보를 입력해야 하므로, 여기서는 프로필을 생성하지 않습니다.
      // 이후 /api/advertiser/profile에서 없으면 INSERT 처리합니다.
    } else {
      const { error: profileError } = await client
        .from('influencer_profiles')
        .insert({
          user_id: userId,
          verification_status: 'pending',
        });

      if (profileError) {
        // 롤백: 선행 데이터 제거
        try { await client.from('user_consents').delete().eq('user_id', userId); } catch {}
        try { await client.from('users').delete().eq('id', userId); } catch {}
        try { await client.auth.admin.deleteUser(userId); } catch {}
        return failure(
          500,
          signupErrorCodes.profileCreationFailed,
          '인플루언서 프로필 생성에 실패했습니다',
          profileError,
        );
      }
    }

    const redirectUrl = request.role === 'advertiser'
      ? '/login?redirectedFrom=/advertiser/onboarding'
      : '/login?redirectedFrom=/influencer/onboarding';

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

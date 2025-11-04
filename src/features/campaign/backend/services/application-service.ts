import { SupabaseClient } from '@supabase/supabase-js';
import {
  success,
  failure,
  type HandlerResult,
} from '@/backend/http/response';
import {
  CreateApplicationRequest,
  CreateApplicationResponse,
} from '../schema/application-schema';

interface InfluencerVerificationCheck {
  verificationStatus: string;
  isVerified: boolean;
}

interface CampaignStatusCheck {
  status: string;
  recruitmentEndDate: string;
  totalSlots: number;
  applicantCount: number;
  exists: boolean;
}

interface ApplicationCheckResult {
  hasApplications: boolean;
}

export const createCampaignApplication = async (
  client: SupabaseClient,
  userId: string,
  campaignId: string,
  request: CreateApplicationRequest
): Promise<
  HandlerResult<CreateApplicationResponse, string>
> => {
  try {
    const { data: influencer, error: influencerError } = await client
      .from('influencer_profiles')
      .select('verification_status')
      .eq('user_id', userId)
      .single();

    if (influencerError || !influencer) {
      return failure(
        403,
        'INFLUENCER_NOT_FOUND',
        '인플루언서 프로필을 찾을 수 없습니다'
      );
    }

    // 개발 단계에서는 'pending' 상태도 신청 허용 (운영 전환 시 주석 해제)
    // if (influencer.verification_status !== 'verified') {
    //   return failure(
    //     403,
    //     'INFLUENCER_NOT_VERIFIED',
    //     '프로필 검증을 완료해주세요'
    //   );
    // }

    const { data: campaign, error: campaignError } = await client
      .from('campaigns')
      .select('id, status, recruitment_end_date, total_slots')
      .eq('id', campaignId)
      .single();

    if (campaignError || !campaign) {
      return failure(404, 'CAMPAIGN_NOT_FOUND', '체험단을 찾을 수 없습니다');
    }

    if (campaign.status !== 'recruiting') {
      return failure(
        400,
        'CAMPAIGN_NOT_RECRUITING',
        '모집이 진행 중이 아닙니다'
      );
    }

    const now = new Date();
    const recruitmentEnd = new Date(campaign.recruitment_end_date);
    if (now > recruitmentEnd) {
      return failure(
        400,
        'RECRUITMENT_CLOSED',
        '모집이 종료되어 지원할 수 없습니다'
      );
    }

    const { data: existingApplication, error: checkError } = await client
      .from('campaign_applications')
      .select('id')
      .eq('campaign_id', campaignId)
      .eq('user_id', userId)
      .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116') {
      return failure(
        500,
        'DATABASE_ERROR',
        '중복 확인 중 오류가 발생했습니다'
      );
    }

    if (existingApplication) {
      return failure(
        400,
        'DUPLICATE_APPLICATION',
        '이미 지원한 체험단입니다'
      );
    }

    const { data: applicationsData } = await client
      .from('campaign_applications')
      .select('id', { count: 'exact' })
      .eq('campaign_id', campaignId);

    const currentApplicantCount = applicationsData ? applicationsData.length : 0;

    if (currentApplicantCount >= campaign.total_slots) {
      return failure(
        400,
        'RECRUITMENT_FULL',
        '모집 인원이 마감되었습니다'
      );
    }

    const visitDate = new Date(request.visitDate);
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    if (visitDate < todayStart) {
      return failure(
        400,
        'INVALID_VISIT_DATE',
        '오늘 이후의 날짜를 선택해주세요'
      );
    }

    const { data: newApplication, error: insertError } = await client
      .from('campaign_applications')
      .insert({
        campaign_id: campaignId,
        user_id: userId,
        application_message: request.applicationMessage,
        visit_date: request.visitDate,
        status: 'pending',
      })
      .select('id, applied_at')
      .single();

    if (insertError || !newApplication) {
      if (insertError?.code === '23505') {
        return failure(
          400,
          'DUPLICATE_APPLICATION',
          '이미 지원한 체험단입니다'
        );
      }
      return failure(
        500,
        'APPLICATION_INSERT_ERROR',
        '지원서 저장에 실패했습니다',
        insertError
      );
    }

    const response: CreateApplicationResponse = {
      applicationId: newApplication.id,
      campaignId,
      status: 'pending',
      appliedAt: (newApplication as any).applied_at,
      message: '지원이 완료되었습니다',
    };

    return success(response);
  } catch (error) {
    return failure(
      500,
      'INTERNAL_ERROR',
      '오류 발생',
      error instanceof Error ? error.message : undefined
    );
  }
};

import { SupabaseClient } from '@supabase/supabase-js';
import { ApplicantsResponse, ApplicantsResponseSchema } from '../schema/campaign-detail-schema';
import { failure, success } from '@/backend/http/response';
import type { SuccessResult, ErrorResult } from '@/backend/http/response';

const errorCodes = {
  notFound: 'NOT_FOUND',
  forbidden: 'FORBIDDEN',
  fetchFailed: 'FETCH_FAILED',
  internalError: 'INTERNAL_ERROR',
};

export const getApplicants = async (
  client: SupabaseClient,
  advertiserId: string,
  campaignId: string
): Promise<SuccessResult<ApplicantsResponse> | ErrorResult<string>> => {
  try {
    const { data: campaign, error: campaignError } = await client
      .from('campaigns')
      .select('advertiser_id')
      .eq('id', campaignId)
      .single();

    if (campaignError || !campaign) {
      return failure(404, errorCodes.notFound, '캠페인을 찾을 수 없습니다');
    }

    if (campaign.advertiser_id !== advertiserId) {
      return failure(403, errorCodes.forbidden, '접근 권한이 없습니다');
    }

    const { data, error } = await client
      .from('campaign_applications')
      .select(
        `
        id,
        user_id,
        application_message,
        visit_date,
        applied_at,
        status,
        applicant:users!inner(
          id,
          name
        ),
        channels:influencer_channels(
          id,
          channel_type,
          channel_name,
          channel_url
        )
      `
      )
      .eq('campaign_id', campaignId)
      .order('applied_at', { ascending: false });

    if (error) {
      return failure(500, errorCodes.fetchFailed, '지원자 조회 실패', error);
    }

    const applicants = (data || []).map((item: any) => ({
      applicationId: item.id,
      applicantId: item.user_id,
      applicantName: item.applicant.name,
      applicationMessage: item.application_message,
      visitDate: item.visit_date,
      appliedAt: item.applied_at,
      status: item.status,
      channels: item.channels.map((ch: any) => ({
        id: ch.id,
        channelType: ch.channel_type,
        channelName: ch.channel_name,
        channelUrl: ch.channel_url,
      })),
    }));

    const response: ApplicantsResponse = {
      applicants,
      total: applicants.length,
    };

    const validated = ApplicantsResponseSchema.safeParse(response);
    if (!validated.success) {
      return failure(500, 'RESPONSE_ERROR', '응답 검증 실패', validated.error.errors);
    }

    return success(validated.data);
  } catch (error) {
    return failure(500, errorCodes.internalError, '오류 발생', error);
  }
};

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

    // 2) 1차: 신청 목록 (조인 없이)
    const { data: applications, error: appError } = await client
      .from('campaign_applications')
      .select('id, user_id, application_message, visit_date, applied_at, status')
      .eq('campaign_id', campaignId)
      .order('applied_at', { ascending: false });

    if (appError) {
      return failure(500, errorCodes.fetchFailed, '지원자 조회 실패', appError);
    }

    const userIds = (applications || []).map((a: any) => a.user_id);

    // 3) 사용자 정보 조회 (users)
    const usersMap: Record<string, { id: string; name: string }> = {};
    if (userIds.length > 0) {
      const { data: users, error: usersError } = await client
        .from('users')
        .select('id, name')
        .in('id', userIds);
      if (usersError) {
        return failure(500, errorCodes.fetchFailed, '사용자 조회 실패', usersError);
      }
      (users || []).forEach((u: any) => {
        usersMap[u.id] = { id: u.id, name: u.name };
      });
    }

    // 4) 채널 정보 조회 (influencer_channels by user_id)
    const channelsMap: Record<string, any[]> = {};
    if (userIds.length > 0) {
      const { data: channels, error: channelsError } = await client
        .from('influencer_channels')
        .select('id, user_id, channel_type, channel_name, channel_url')
        .in('user_id', userIds);
      if (channelsError) {
        return failure(500, errorCodes.fetchFailed, '채널 조회 실패', channelsError);
      }
      (channels || []).forEach((ch: any) => {
        const arr = channelsMap[ch.user_id] || (channelsMap[ch.user_id] = []);
        arr.push({
          id: ch.id,
          channelType: ch.channel_type,
          channelName: ch.channel_name,
          channelUrl: ch.channel_url,
        });
      });
    }

    const applicants = (applications || []).map((item: any) => ({
      applicationId: item.id,
      applicantId: item.user_id,
      applicantName: usersMap[item.user_id]?.name ?? '(알수없음)',
      applicationMessage: item.application_message,
      visitDate: item.visit_date,
      appliedAt: item.applied_at,
      status: item.status,
      channels: channelsMap[item.user_id] || [],
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

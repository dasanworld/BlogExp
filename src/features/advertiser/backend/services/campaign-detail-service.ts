import { SupabaseClient } from '@supabase/supabase-js';
import { CampaignDetailForAdvertiser, CampaignDetailForAdvertiserSchema } from '../schema/campaign-detail-schema';
import { failure, success } from '@/backend/http/response';
import type { SuccessResult, ErrorResult } from '@/backend/http/response';

interface ServiceError {
  code: string;
  message: string;
}

const errorCodes = {
  notFound: 'NOT_FOUND',
  forbidden: 'FORBIDDEN',
  fetchFailed: 'FETCH_FAILED',
  internalError: 'INTERNAL_ERROR',
};

export const getCampaignDetail = async (
  client: SupabaseClient,
  advertiserId: string,
  campaignId: string
): Promise<SuccessResult<CampaignDetailForAdvertiser> | ErrorResult<string>> => {
  try {
    const { data: campaign, error } = await client
      .from('campaigns')
      .select(
        `
        *,
        applicant_count:campaign_applications(count)
      `
      )
      .eq('id', campaignId)
      .single();

    if (error || !campaign) {
      return failure(404, errorCodes.notFound, '캠페인을 찾을 수 없습니다');
    }

    if (campaign.advertiser_id !== advertiserId) {
      return failure(403, errorCodes.forbidden, '접근 권한이 없습니다');
    }

    const response: CampaignDetailForAdvertiser = {
      id: campaign.id,
      advertiserId: campaign.advertiser_id,
      title: campaign.title,
      description: campaign.description,
      benefits: campaign.benefits,
      mission: campaign.mission,
      location: campaign.location,
      recruitmentStartDate: campaign.recruitment_start_date,
      recruitmentEndDate: campaign.recruitment_end_date,
      experienceStartDate: campaign.experience_start_date,
      experienceEndDate: campaign.experience_end_date,
      totalSlots: campaign.total_slots,
      selectedCount: campaign.selected_count,
      applicantCount: campaign.applicant_count?.[0]?.count || 0,
      status: campaign.status,
      createdAt: campaign.created_at,
      updatedAt: campaign.updated_at,
    };

    const validated = CampaignDetailForAdvertiserSchema.safeParse(response);
    if (!validated.success) {
      return failure(500, 'RESPONSE_ERROR', '응답 검증 실패', validated.error.errors);
    }

    return success(validated.data);
  } catch (error) {
    return failure(500, errorCodes.internalError, '오류 발생', error);
  }
};

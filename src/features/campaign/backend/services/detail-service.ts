import { SupabaseClient } from '@supabase/supabase-js';
import {
  success,
  failure,
  type HandlerResult,
} from '@/backend/http/response';
import {
  CampaignDetailResponse,
  CampaignDetailResponseSchema,
} from '../schema/detail-schema';

function calculateDaysLeft(endDate: string): number {
  const now = new Date();
  const end = new Date(endDate);
  const diffTime = end.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export const getCampaignDetail = async (
  client: SupabaseClient,
  campaignId: string,
  userId?: string
): Promise<HandlerResult<CampaignDetailResponse, string>> => {
  try {
    const { data: campaign, error: campaignError } = await client
      .from('campaigns')
      .select(
        `
        *,
        advertiser:advertiser_profiles!inner(business_name, category, location)
      `
      )
      .eq('id', campaignId)
      .single();

    if (campaignError || !campaign) {
      return failure(404, 'NOT_FOUND', '체험단을 찾을 수 없습니다');
    }

    const { data: applicationsData, error: applicationsError } = await client
      .from('campaign_applications')
      .select('id', { count: 'exact' })
      .eq('campaign_id', campaignId);

    const applicantCount =
      applicationsError || !applicationsData ? 0 : applicationsData.length;

    let userApplicationStatus: string | null = null;
    if (userId) {
      const { data: application } = await client
        .from('campaign_applications')
        .select('status')
        .eq('campaign_id', campaignId)
        .eq('user_id', userId)
        .maybeSingle();

      userApplicationStatus = application ? application.status : 'not_applied';
    }

    const advertiser = campaign.advertiser as any;
    const detailResponse: CampaignDetailResponse = {
      id: campaign.id,
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
      applicantCount,
      status: campaign.status,
      daysLeft: calculateDaysLeft(campaign.recruitment_end_date),
      thumbnailUrl: campaign.thumbnail_url || null,
      advertiser: {
        businessName: advertiser?.business_name || '',
        category: advertiser?.category || '',
        location: advertiser?.location || '',
      },
      userApplicationStatus:
        (userApplicationStatus as any) || null,
    };

    return success(detailResponse);
  } catch (error) {
    return failure(
      500,
      'INTERNAL_ERROR',
      '오류 발생',
      error instanceof Error ? error.message : undefined
    );
  }
};

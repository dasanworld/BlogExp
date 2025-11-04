import { SupabaseClient } from '@supabase/supabase-js';
import { CampaignListQuery, CampaignListResponse, CampaignCard } from '../schema/list-schema';
import { success, failure, type HandlerResult } from '@/backend/http/response';

const calculateDaysLeft = (endDate: string): number => {
  const end = new Date(endDate);
  const now = new Date();
  const diffTime = end.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const campaignErrorCodes = {
  fetchError: 'FETCH_ERROR',
  internalError: 'INTERNAL_ERROR',
};

export const getCampaigns = async (
  client: SupabaseClient,
  query: CampaignListQuery
): Promise<HandlerResult<CampaignListResponse, string>> => {
  try {
    const status = query.status || 'recruiting';
    
    let queryBuilder = client
      .from('campaigns')
      .select(
        `
        id,
        title,
        recruitment_end_date,
        total_slots,
        location,
        advertiser:advertiser_profiles(business_name, category)
        `,
        { count: 'exact' }
      )
      .eq('status', status)
      .gte('recruitment_end_date', new Date().toISOString());

    if (query.category) {
      queryBuilder = queryBuilder.eq('advertiser.category', query.category);
    }

    if (query.location) {
      queryBuilder = queryBuilder.ilike('location', `%${query.location}%`);
    }

    switch (query.sort) {
      case 'deadline':
        queryBuilder = queryBuilder.order('recruitment_end_date', { ascending: true });
        break;
      case 'popular':
        queryBuilder = queryBuilder.order('total_slots', { ascending: false });
        break;
      default:
        queryBuilder = queryBuilder.order('created_at', { ascending: false });
    }

    const offset = (query.page - 1) * query.limit;
    queryBuilder = queryBuilder.range(offset, offset + query.limit - 1);

    const { data, error, count } = await queryBuilder;

    if (error) {
      return failure(500, campaignErrorCodes.fetchError, '목록 조회 실패', error);
    }

    if (!data) {
      return success({
        campaigns: [],
        total: 0,
        page: query.page,
        hasMore: false,
      });
    }

    const applicantCountResponse = await client
      .from('campaign_applications')
      .select('campaign_id')
      .in('campaign_id', data.map(c => c.id));

    const applicantCountMap: Record<string, number> = {};
    if (applicantCountResponse.data) {
      applicantCountResponse.data.forEach(app => {
        applicantCountMap[app.campaign_id] = (applicantCountMap[app.campaign_id] || 0) + 1;
      });
    }

    const campaigns: CampaignCard[] = data.map((c: any) => {
      const advertiser = c.advertiser as any;
      return {
        id: c.id,
        title: c.title,
        businessName: advertiser?.business_name || '',
        category: advertiser?.category || '',
        location: c.location,
        recruitmentEndDate: c.recruitment_end_date,
        totalSlots: c.total_slots,
        applicantCount: applicantCountMap[c.id] || 0,
        daysLeft: calculateDaysLeft(c.recruitment_end_date),
        thumbnailUrl: null,
      };
    });

    return success({
      campaigns,
      total: count || 0,
      page: query.page,
      hasMore: (count || 0) > offset + query.limit,
    });
  } catch (error) {
    return failure(500, campaignErrorCodes.internalError, '오류 발생', error);
  }
};

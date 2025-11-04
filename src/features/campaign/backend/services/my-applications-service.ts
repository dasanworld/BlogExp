import { SupabaseClient } from '@supabase/supabase-js';
import {
  MyApplicationsQuery,
  MyApplicationsResponse,
  MyApplicationsStatusCount,
} from '../schema/my-applications-schema';
import { success, failure, type HandlerResult } from '@/backend/http/response';

export const getMyApplications = async (
  client: SupabaseClient,
  userId: string,
  query: MyApplicationsQuery
): Promise<HandlerResult<MyApplicationsResponse, string>> => {
  try {
    // 1) 지원 내역 기본 필드만 조회 (조인 제거)
    let baseQuery = client
      .from('campaign_applications')
      .select(
        'id, status, applied_at, visit_date, application_message, campaign_id',
        { count: 'exact' }
      )
      .eq('user_id', userId);

    if (query.status) {
      baseQuery = baseQuery.eq('status', query.status);
    }

    baseQuery = baseQuery.order('applied_at', { ascending: false });

    const offset = (query.page - 1) * query.limit;
    baseQuery = baseQuery.range(offset, offset + query.limit - 1);

    const { data: applicationRows, error: applicationError, count } = await baseQuery;

    if (applicationError) {
      return failure(500, 'FETCH_ERROR', '목록 조회 실패', applicationError);
    }

    const applicationsData = applicationRows || [];
    const campaignIds = Array.from(new Set(applicationsData.map((a: any) => a.campaign_id)));

    // 2) 캠페인 정보 조회
    let campaignsMap = new Map<string, any>();
    let advertiserMap = new Map<string, any>();
    if (campaignIds.length > 0) {
      const { data: campaigns, error: campaignsError } = await client
        .from('campaigns')
        .select('id, title, status, recruitment_start_date, recruitment_end_date, experience_start_date, experience_end_date, advertiser_id')
        .in('id', campaignIds);

      if (campaignsError) {
        return failure(500, 'FETCH_ERROR', '캠페인 조회 실패', campaignsError);
      }
      campaignsMap = new Map(campaigns?.map((c: any) => [c.id, c]) || []);

      const advertiserIds = Array.from(new Set((campaigns || []).map((c: any) => c.advertiser_id)));
      if (advertiserIds.length > 0) {
        const { data: advertisers, error: advertisersError } = await client
          .from('advertiser_profiles')
          .select('user_id, business_name, category, location')
          .in('user_id', advertiserIds);

        if (advertisersError) {
          return failure(500, 'FETCH_ERROR', '광고주 정보 조회 실패', advertisersError);
        }
        advertiserMap = new Map(advertisers?.map((a: any) => [a.user_id, a]) || []);
      }
    }

    const applications = applicationsData.map((item: any) => {
      const campaign = campaignsMap.get(item.campaign_id);
      const advertiser = campaign ? advertiserMap.get(campaign.advertiser_id) : undefined;
      return {
        applicationId: item.id,
        status: item.status,
        appliedAt: item.applied_at,
        visitDate: item.visit_date,
        applicationMessage: item.application_message,
        campaign: {
          id: campaign?.id || item.campaign_id,
          title: campaign?.title || '',
          businessName: advertiser?.business_name || '',
          category: advertiser?.category || '',
          location: advertiser?.location || '',
          recruitmentStartDate: campaign?.recruitment_start_date || '',
          recruitmentEndDate: campaign?.recruitment_end_date || '',
          experienceStartDate: campaign?.experience_start_date || '',
          experienceEndDate: campaign?.experience_end_date || '',
          status: campaign?.status || 'recruiting',
        },
      };
    });

    const { data: statusData, error: statusError } = await client
      .from('campaign_applications')
      .select('status')
      .eq('user_id', userId);

    if (statusError) {
      return failure(500, 'FETCH_ERROR', '상태 집계 조회 실패', statusError);
    }

    const statusCounts: MyApplicationsStatusCount = {
      pending: 0,
      selected: 0,
      rejected: 0,
    };

    (statusData || []).forEach((item: any) => {
      if (item.status === 'pending') {
        statusCounts.pending++;
      } else if (item.status === 'selected') {
        statusCounts.selected++;
      } else if (item.status === 'rejected') {
        statusCounts.rejected++;
      }
    });

    const total = count || 0;

    return success<MyApplicationsResponse>({
      applications,
      statusCounts,
      total,
      page: query.page,
      limit: query.limit,
      hasMore: total > offset + query.limit,
    });
  } catch (error) {
    return failure(500, 'INTERNAL_ERROR', '오류 발생', error);
  }
};

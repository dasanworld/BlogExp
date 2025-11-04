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
    let queryBuilder = client
      .from('campaign_applications')
      .select(
        `
        id,
        status,
        applied_at,
        visit_date,
        application_message,
        campaign:campaigns!inner(
          id,
          title,
          status,
          recruitment_start_date,
          recruitment_end_date,
          experience_start_date,
          experience_end_date,
          advertiser:advertiser_profiles!inner(
            business_name,
            category,
            location
          )
        )
        `,
        { count: 'exact' }
      )
      .eq('user_id', userId);

    if (query.status) {
      queryBuilder = queryBuilder.eq('status', query.status);
    }

    queryBuilder = queryBuilder.order('applied_at', { ascending: false });

    const offset = (query.page - 1) * query.limit;
    queryBuilder = queryBuilder.range(offset, offset + query.limit - 1);

    const { data, error, count } = await queryBuilder;

    if (error) {
      return failure(500, 'FETCH_ERROR', '목록 조회 실패', error);
    }

    const applications = (data || []).map((item: any) => ({
      applicationId: item.id,
      status: item.status,
      appliedAt: item.applied_at,
      visitDate: item.visit_date,
      applicationMessage: item.application_message,
      campaign: {
        id: item.campaign.id,
        title: item.campaign.title,
        businessName: item.campaign.advertiser.business_name,
        category: item.campaign.advertiser.category,
        location: item.campaign.advertiser.location,
        recruitmentStartDate: item.campaign.recruitment_start_date,
        recruitmentEndDate: item.campaign.recruitment_end_date,
        experienceStartDate: item.campaign.experience_start_date,
        experienceEndDate: item.campaign.experience_end_date,
        status: item.campaign.status,
      },
    }));

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

import { SupabaseClient } from '@supabase/supabase-js';
import {
  CreateCampaignRequest,
  UpdateCampaignRequest,
  CampaignListQuery,
  CampaignResponse,
  CampaignListResponse,
  CampaignResponseSchema,
  CampaignListResponseSchema,
} from '../schema/campaign-schema';
import { failure, success } from '@/backend/http/response';
import type { SuccessResult, ErrorResult } from '@/backend/http/response';

interface CampaignServiceError {
  code: string;
  message: string;
}

const errorCodes = {
  notAdvertiser: 'NOT_ADVERTISER',
  notVerified: 'NOT_VERIFIED',
  createFailed: 'CREATE_FAILED',
  fetchFailed: 'FETCH_FAILED',
  notFound: 'NOT_FOUND',
  forbidden: 'FORBIDDEN',
  cannotDelete: 'CANNOT_DELETE',
  deleteFailed: 'DELETE_FAILED',
  updateFailed: 'UPDATE_FAILED',
  internalError: 'INTERNAL_ERROR',
};

export const createCampaign = async (
  client: SupabaseClient,
  advertiserId: string,
  request: CreateCampaignRequest
): Promise<SuccessResult<CampaignResponse> | ErrorResult<string>> => {
  try {
    const { data: profile } = await client
      .from('advertiser_profiles')
      .select('user_id, verification_status')
      .eq('user_id', advertiserId)
      .single();

    if (!profile) {
      return failure(403, errorCodes.notAdvertiser, '광고주만 캠페인을 생성할 수 있습니다');
    }

    if (profile.verification_status !== 'verified') {
      return failure(403, errorCodes.notVerified, '인증된 광고주만 캠페인을 생성할 수 있습니다');
    }

    const { data: campaign, error } = await client
      .from('campaigns')
      .insert({
        advertiser_id: advertiserId,
        title: request.title,
        description: request.description,
        benefits: request.benefits,
        mission: request.mission,
        location: request.location,
        recruitment_start_date: request.recruitmentStartDate,
        recruitment_end_date: request.recruitmentEndDate,
        experience_start_date: request.experienceStartDate,
        experience_end_date: request.experienceEndDate,
        total_slots: request.totalSlots,
        status: 'recruiting',
      })
      .select()
      .single();

    if (error || !campaign) {
      return failure(500, errorCodes.createFailed, '캠페인 생성에 실패했습니다', error);
    }

    const response: CampaignResponse = {
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
      status: campaign.status,
      applicantCount: 0,
      createdAt: campaign.created_at,
      updatedAt: campaign.updated_at,
    };

    return success(response, 201);
  } catch (error) {
    return failure(500, errorCodes.internalError, '오류 발생', error);
  }
};

export const getMyCampaigns = async (
  client: SupabaseClient,
  advertiserId: string,
  query: CampaignListQuery
): Promise<SuccessResult<CampaignListResponse> | ErrorResult<string>> => {
  try {
    let queryBuilder = client
      .from('campaigns')
      .select(
        `
        *,
        applicant_count:campaign_applications(count)
      `,
        { count: 'exact' }
      )
      .eq('advertiser_id', advertiserId);

    if (query.status) {
      queryBuilder = queryBuilder.eq('status', query.status);
    }

    queryBuilder = queryBuilder.order('created_at', { ascending: false });

    const offset = (query.page - 1) * query.limit;
    queryBuilder = queryBuilder.range(offset, offset + query.limit - 1);

    const { data, error, count } = await queryBuilder;

    if (error) {
      return failure(500, errorCodes.fetchFailed, '목록 조회 실패', error);
    }

    const campaigns: CampaignResponse[] = (data || []).map((campaign: any) => ({
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
      status: campaign.status,
      applicantCount: campaign.applicant_count?.[0]?.count || 0,
      createdAt: campaign.created_at,
      updatedAt: campaign.updated_at,
    }));

    const allCampaigns = await client
      .from('campaigns')
      .select('status', { count: 'exact' })
      .eq('advertiser_id', advertiserId);

    const statusCounts = {
      recruiting: 0,
      closed: 0,
      selection_completed: 0,
    };

    (allCampaigns.data || []).forEach((c: any) => {
      statusCounts[c.status as keyof typeof statusCounts]++;
    });

    const response: CampaignListResponse = {
      campaigns,
      statusCounts,
      total: count || 0,
      page: query.page,
      limit: query.limit,
      hasMore: (count || 0) > offset + query.limit,
    };

    return success(response);
  } catch (error) {
    return failure(500, errorCodes.internalError, '오류 발생', error);
  }
};

export const getCampaignById = async (
  client: SupabaseClient,
  advertiserId: string,
  campaignId: string
): Promise<SuccessResult<CampaignResponse> | ErrorResult<string>> => {
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
      .eq('advertiser_id', advertiserId)
      .single();

    if (error || !campaign) {
      return failure(404, errorCodes.notFound, '캠페인을 찾을 수 없습니다');
    }

    const response: CampaignResponse = {
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
      status: campaign.status,
      applicantCount: campaign.applicant_count?.[0]?.count || 0,
      createdAt: campaign.created_at,
      updatedAt: campaign.updated_at,
    };

    return success(response);
  } catch (error) {
    return failure(500, errorCodes.internalError, '오류 발생', error);
  }
};

export const updateCampaign = async (
  client: SupabaseClient,
  advertiserId: string,
  campaignId: string,
  request: UpdateCampaignRequest
): Promise<SuccessResult<CampaignResponse> | ErrorResult<string>> => {
  try {
    const { data: campaign, error: fetchError } = await client
      .from('campaigns')
      .select('advertiser_id, total_slots')
      .eq('id', campaignId)
      .single();

    if (fetchError || !campaign) {
      return failure(404, errorCodes.notFound, '캠페인을 찾을 수 없습니다');
    }

    if (campaign.advertiser_id !== advertiserId) {
      return failure(403, errorCodes.forbidden, '권한이 없습니다');
    }

    if (request.totalSlots !== undefined && request.totalSlots !== campaign.total_slots) {
      const { data: applicants } = await client
        .from('campaign_applications')
        .select('id', { count: 'exact' })
        .eq('campaign_id', campaignId);

      if ((applicants?.length || 0) > request.totalSlots) {
        return failure(
          400,
          errorCodes.updateFailed,
          '현재 지원자보다 적은 인원으로 변경할 수 없습니다'
        );
      }
    }

    const updateData: any = {};
    if (request.title !== undefined) updateData.title = request.title;
    if (request.description !== undefined) updateData.description = request.description;
    if (request.benefits !== undefined) updateData.benefits = request.benefits;
    if (request.mission !== undefined) updateData.mission = request.mission;
    if (request.location !== undefined) updateData.location = request.location;
    if (request.recruitmentStartDate !== undefined)
      updateData.recruitment_start_date = request.recruitmentStartDate;
    if (request.recruitmentEndDate !== undefined)
      updateData.recruitment_end_date = request.recruitmentEndDate;
    if (request.experienceStartDate !== undefined)
      updateData.experience_start_date = request.experienceStartDate;
    if (request.experienceEndDate !== undefined)
      updateData.experience_end_date = request.experienceEndDate;
    if (request.totalSlots !== undefined) updateData.total_slots = request.totalSlots;

    const { data: updated, error: updateError } = await client
      .from('campaigns')
      .update(updateData)
      .eq('id', campaignId)
      .select(
        `
        *,
        applicant_count:campaign_applications(count)
      `
      )
      .single();

    if (updateError || !updated) {
      return failure(500, errorCodes.updateFailed, '캠페인 수정에 실패했습니다', updateError);
    }

    const response: CampaignResponse = {
      id: updated.id,
      advertiserId: updated.advertiser_id,
      title: updated.title,
      description: updated.description,
      benefits: updated.benefits,
      mission: updated.mission,
      location: updated.location,
      recruitmentStartDate: updated.recruitment_start_date,
      recruitmentEndDate: updated.recruitment_end_date,
      experienceStartDate: updated.experience_start_date,
      experienceEndDate: updated.experience_end_date,
      totalSlots: updated.total_slots,
      selectedCount: updated.selected_count,
      status: updated.status,
      applicantCount: updated.applicant_count?.[0]?.count || 0,
      createdAt: updated.created_at,
      updatedAt: updated.updated_at,
    };

    return success(response);
  } catch (error) {
    return failure(500, errorCodes.internalError, '오류 발생', error);
  }
};

export const deleteCampaign = async (
  client: SupabaseClient,
  advertiserId: string,
  campaignId: string
): Promise<SuccessResult<void> | ErrorResult<string>> => {
  try {
    const { data: campaign } = await client
      .from('campaigns')
      .select('advertiser_id, status')
      .eq('id', campaignId)
      .single();

    if (!campaign) {
      return failure(404, errorCodes.notFound, '캠페인을 찾을 수 없습니다');
    }

    if (campaign.advertiser_id !== advertiserId) {
      return failure(403, errorCodes.forbidden, '권한이 없습니다');
    }

    if (campaign.status === 'selection_completed') {
      return failure(400, errorCodes.cannotDelete, '선정 완료된 캠페인은 삭제할 수 없습니다');
    }

    const { error } = await client.from('campaigns').delete().eq('id', campaignId);

    if (error) {
      return failure(500, errorCodes.deleteFailed, '삭제 실패', error);
    }

    return success(undefined);
  } catch (error) {
    return failure(500, errorCodes.internalError, '오류 발생', error);
  }
};

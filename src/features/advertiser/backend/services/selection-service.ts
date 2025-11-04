import { SupabaseClient } from '@supabase/supabase-js';
import { SelectApplicantsRequest } from '../schema/selection-schema';
import { failure, success } from '@/backend/http/response';
import type { SuccessResult, ErrorResult } from '@/backend/http/response';

const errorCodes = {
  campaignNotFound: 'NOT_FOUND',
  forbidden: 'FORBIDDEN',
  alreadyCompleted: 'ALREADY_COMPLETED',
  exceededSlots: 'EXCEEDED_SLOTS',
  invalidStatus: 'INVALID_STATUS',
  updateFailed: 'UPDATE_FAILED',
  internalError: 'INTERNAL_ERROR',
};

export const closeCampaign = async (
  client: SupabaseClient,
  advertiserId: string,
  campaignId: string
): Promise<SuccessResult<void> | ErrorResult<string>> => {
  try {
    const { data: campaign, error: fetchError } = await client
      .from('campaigns')
      .select('advertiser_id, status')
      .eq('id', campaignId)
      .single();

    if (fetchError || !campaign) {
      return failure(404, errorCodes.campaignNotFound, '캠페인을 찾을 수 없습니다');
    }

    if (campaign.advertiser_id !== advertiserId) {
      return failure(403, errorCodes.forbidden, '접근 권한이 없습니다');
    }

    if (campaign.status !== 'recruiting') {
      return failure(400, errorCodes.invalidStatus, '모집 중인 캠페인만 종료할 수 있습니다');
    }

    const { error: updateError } = await client
      .from('campaigns')
      .update({ status: 'closed' })
      .eq('id', campaignId);

    if (updateError) {
      return failure(500, errorCodes.updateFailed, '모집 종료 실패', updateError);
    }

    return success(undefined);
  } catch (error) {
    return failure(500, errorCodes.internalError, '오류 발생', error);
  }
};

export const selectApplicants = async (
  client: SupabaseClient,
  advertiserId: string,
  request: SelectApplicantsRequest
): Promise<SuccessResult<void> | ErrorResult<string>> => {
  try {
    const { data: campaign, error: fetchError } = await client
      .from('campaigns')
      .select('advertiser_id, status, total_slots')
      .eq('id', request.campaignId)
      .single();

    if (fetchError || !campaign) {
      return failure(404, errorCodes.campaignNotFound, '캠페인을 찾을 수 없습니다');
    }

    if (campaign.advertiser_id !== advertiserId) {
      return failure(403, errorCodes.forbidden, '접근 권한이 없습니다');
    }

    if (campaign.status === 'selection_completed') {
      return failure(400, errorCodes.alreadyCompleted, '이미 선정이 완료되었습니다');
    }

    if (request.selectedApplicationIds.length > campaign.total_slots) {
      return failure(
        400,
        errorCodes.exceededSlots,
        `모집 인원을 초과할 수 없습니다 (최대 ${campaign.total_slots}명)`
      );
    }

    const { error: selectError } = await client
      .from('campaign_applications')
      .update({ status: 'selected' })
      .eq('campaign_id', request.campaignId)
      .in('id', request.selectedApplicationIds);

    if (selectError) {
      return failure(500, errorCodes.updateFailed, '선정 처리 실패', selectError);
    }

    const { error: rejectError } = await client
      .from('campaign_applications')
      .update({ status: 'rejected' })
      .eq('campaign_id', request.campaignId)
      .not('id', 'in', `(${request.selectedApplicationIds.map(() => '?').join(',')})`)
      .not('status', 'eq', 'selected');

    if (rejectError) {
      return failure(500, errorCodes.updateFailed, '반려 처리 실패', rejectError);
    }

    const { error: campaignError } = await client
      .from('campaigns')
      .update({
        status: 'selection_completed',
        selected_count: request.selectedApplicationIds.length,
      })
      .eq('id', request.campaignId);

    if (campaignError) {
      return failure(500, errorCodes.updateFailed, '캠페인 업데이트 실패', campaignError);
    }

    return success(undefined);
  } catch (error) {
    return failure(500, errorCodes.internalError, '오류 발생', error);
  }
};

import type { SupabaseClient } from '@supabase/supabase-js';
import { failure, success, type HandlerResult } from '@/backend/http/response';
import type { UpdateProfileRequest, ProfileResponse } from '../schema/profile-schema';
import { profileErrorCodes, type ProfileServiceError } from '../errors/profile-error';
import { normalizeUrl } from '@/lib/utils/url-utils';

export const getInfluencerProfile = async (
  client: SupabaseClient,
  userId: string,
): Promise<HandlerResult<ProfileResponse, ProfileServiceError, unknown>> => {
  try {
    const { data: profile, error: profileError } = await client
      .from('influencer_profiles')
      .select(`
        user_id,
        birth_date,
        verification_status,
        created_at,
        updated_at,
        influencer_channels(
          id,
          channel_type,
          channel_name,
          channel_url,
          status,
          created_at,
          updated_at
        )
      `)
      .eq('user_id', userId)
      .single();

    if (profileError || !profile) {
      return failure(404, profileErrorCodes.profileNotFound, '프로필을 찾을 수 없습니다');
    }

    return success<ProfileResponse>({
      userId: profile.user_id,
      birthDate: profile.birth_date,
      verificationStatus: profile.verification_status,
      channels: (profile.influencer_channels || []).map((ch: any) => ({
        id: ch.id,
        channelType: ch.channel_type,
        channelName: ch.channel_name,
        channelUrl: ch.channel_url,
        status: ch.status,
        createdAt: ch.created_at,
        updatedAt: ch.updated_at,
      })),
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
    });
  } catch (error) {
    return failure(500, profileErrorCodes.internalError, '프로필 조회 중 오류가 발생했습니다', error);
  }
};

export const updateInfluencerProfile = async (
  client: SupabaseClient,
  userId: string,
  request: UpdateProfileRequest,
): Promise<HandlerResult<ProfileResponse, ProfileServiceError, unknown>> => {
  try {
    const { error: profileError } = await client
      .from('influencer_profiles')
      .update({ birth_date: request.birthDate })
      .eq('user_id', userId);

    if (profileError) {
      return failure(500, profileErrorCodes.profileUpdateFailed, '프로필 업데이트에 실패했습니다', profileError);
    }

    const { error: deleteError } = await client
      .from('influencer_channels')
      .delete()
      .eq('user_id', userId);

    if (deleteError) {
      return failure(500, profileErrorCodes.channelDeleteFailed, '기존 채널 삭제에 실패했습니다', deleteError);
    }

    const channelsToInsert = request.channels.map(ch => ({
      user_id: userId,
      channel_type: ch.channelType,
      channel_name: ch.channelName,
      channel_url: normalizeUrl(ch.channelUrl),
      status: 'pending' as const,
    }));

    const { data: channels, error: insertError } = await client
      .from('influencer_channels')
      .insert(channelsToInsert)
      .select();

    if (insertError || !channels) {
      return failure(500, profileErrorCodes.channelInsertFailed, '채널 등록에 실패했습니다', insertError);
    }

    const { data: profile, error: fetchError } = await client
      .from('influencer_profiles')
      .select(`
        user_id,
        birth_date,
        verification_status,
        created_at,
        updated_at,
        influencer_channels(
          id,
          channel_type,
          channel_name,
          channel_url,
          status,
          created_at,
          updated_at
        )
      `)
      .eq('user_id', userId)
      .single();

    if (fetchError || !profile) {
      return failure(404, profileErrorCodes.profileNotFound, '프로필을 찾을 수 없습니다');
    }

    return success<ProfileResponse>(
      {
        userId: profile.user_id,
        birthDate: profile.birth_date,
        verificationStatus: profile.verification_status,
        channels: (profile.influencer_channels || []).map((ch: any) => ({
          id: ch.id,
          channelType: ch.channel_type,
          channelName: ch.channel_name,
          channelUrl: ch.channel_url,
          status: ch.status,
          createdAt: ch.created_at,
          updatedAt: ch.updated_at,
        })),
        createdAt: profile.created_at,
        updatedAt: profile.updated_at,
      },
      201,
    );
  } catch (error) {
    return failure(500, profileErrorCodes.internalError, '프로필 등록 중 오류가 발생했습니다', error);
  }
};

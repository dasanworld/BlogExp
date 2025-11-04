import type { SupabaseClient } from '@supabase/supabase-js';
import { failure, success, type HandlerResult } from '@/backend/http/response';
import { profileErrorCodes, type ProfileServiceError } from '../errors/profile-error';
import { normalizeUrl } from '@/lib/utils/url-utils';

export interface ChannelData {
  id: string;
  userId: string;
  channelType: string;
  channelName: string;
  channelUrl: string;
  status: 'pending' | 'verified' | 'failed';
  createdAt: string;
  updatedAt: string;
}

export const getChannels = async (
  client: SupabaseClient,
  userId: string,
): Promise<HandlerResult<ChannelData[], ProfileServiceError>> => {
  try {
    const { data: channels, error } = await client
      .from('influencer_channels')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return failure(500, profileErrorCodes.internalError, '채널 조회에 실패했습니다', error);
    }

    return success(
      (channels || []).map((ch: any) => ({
        id: ch.id,
        userId: ch.user_id,
        channelType: ch.channel_type,
        channelName: ch.channel_name,
        channelUrl: ch.channel_url,
        status: ch.status,
        createdAt: ch.created_at,
        updatedAt: ch.updated_at,
      })),
    );
  } catch (error) {
    return failure(500, profileErrorCodes.internalError, '채널 조회 중 오류가 발생했습니다', error);
  }
};

export const addChannel = async (
  client: SupabaseClient,
  userId: string,
  channelType: string,
  channelName: string,
  channelUrl: string,
): Promise<HandlerResult<ChannelData, ProfileServiceError>> => {
  try {
    const normalizedUrl = normalizeUrl(channelUrl);

    const { data: existing, error: checkError } = await client
      .from('influencer_channels')
      .select('id')
      .eq('user_id', userId)
      .eq('channel_url', normalizedUrl)
      .maybeSingle();

    if (checkError) {
      return failure(500, profileErrorCodes.internalError, '채널 중복 확인에 실패했습니다', checkError);
    }

    if (existing) {
      return failure(409, profileErrorCodes.duplicateChannelUrl, '이미 등록된 채널입니다');
    }

    const { data: channel, error: insertError } = await client
      .from('influencer_channels')
      .insert({
        user_id: userId,
        channel_type: channelType,
        channel_name: channelName,
        channel_url: normalizedUrl,
        status: 'pending',
      })
      .select()
      .single();

    if (insertError || !channel) {
      return failure(500, profileErrorCodes.channelInsertFailed, '채널 추가에 실패했습니다', insertError);
    }

    return success<ChannelData>(
      {
        id: channel.id,
        userId: channel.user_id,
        channelType: channel.channel_type,
        channelName: channel.channel_name,
        channelUrl: channel.channel_url,
        status: channel.status,
        createdAt: channel.created_at,
        updatedAt: channel.updated_at,
      },
      201,
    );
  } catch (error) {
    return failure(500, profileErrorCodes.internalError, '채널 추가 중 오류가 발생했습니다', error);
  }
};

export const updateChannel = async (
  client: SupabaseClient,
  userId: string,
  channelId: string,
  channelType: string,
  channelName: string,
  channelUrl: string,
): Promise<HandlerResult<ChannelData, ProfileServiceError>> => {
  try {
    const { data: channel, error: getError } = await client
      .from('influencer_channels')
      .select('*')
      .eq('id', channelId)
      .eq('user_id', userId)
      .single();

    if (getError || !channel) {
      return failure(404, profileErrorCodes.channelNotFound, '채널을 찾을 수 없습니다');
    }

    const normalizedUrl = normalizeUrl(channelUrl);

    if (normalizedUrl !== channel.channel_url) {
      const { data: existing, error: checkError } = await client
        .from('influencer_channels')
        .select('id')
        .eq('user_id', userId)
        .eq('channel_url', normalizedUrl)
        .neq('id', channelId)
        .maybeSingle();

      if (checkError) {
        return failure(500, profileErrorCodes.internalError, '채널 중복 확인에 실패했습니다', checkError);
      }

      if (existing) {
        return failure(409, profileErrorCodes.duplicateChannelUrl, '이미 등록된 채널입니다');
      }
    }

    const { data: updated, error: updateError } = await client
      .from('influencer_channels')
      .update({
        channel_type: channelType,
        channel_name: channelName,
        channel_url: normalizedUrl,
        status: 'pending',
      })
      .eq('id', channelId)
      .select()
      .single();

    if (updateError || !updated) {
      return failure(500, profileErrorCodes.channelUpdateFailed, '채널 업데이트에 실패했습니다', updateError);
    }

    return success<ChannelData>({
      id: updated.id,
      userId: updated.user_id,
      channelType: updated.channel_type,
      channelName: updated.channel_name,
      channelUrl: updated.channel_url,
      status: updated.status,
      createdAt: updated.created_at,
      updatedAt: updated.updated_at,
    });
  } catch (error) {
    return failure(500, profileErrorCodes.internalError, '채널 업데이트 중 오류가 발생했습니다', error);
  }
};

export const deleteChannel = async (
  client: SupabaseClient,
  userId: string,
  channelId: string,
): Promise<HandlerResult<void, ProfileServiceError>> => {
  try {
    const { data: channel, error: getError } = await client
      .from('influencer_channels')
      .select('id')
      .eq('id', channelId)
      .eq('user_id', userId)
      .single();

    if (getError || !channel) {
      return failure(404, profileErrorCodes.channelNotFound, '채널을 찾을 수 없습니다');
    }

    const { error: deleteError } = await client
      .from('influencer_channels')
      .delete()
      .eq('id', channelId);

    if (deleteError) {
      return failure(500, profileErrorCodes.channelDeleteFailed, '채널 삭제에 실패했습니다', deleteError);
    }

    return success<void>(undefined);
  } catch (error) {
    return failure(500, profileErrorCodes.internalError, '채널 삭제 중 오류가 발생했습니다', error);
  }
};

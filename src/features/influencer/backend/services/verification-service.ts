import type { SupabaseClient } from '@supabase/supabase-js';
import { validateChannelUrl, isInstagramUrl, isYoutubeUrl, isTiktokUrl, isTwitterUrl, isFacebookUrl, isNaverBlogUrl, isThreadsUrl } from '@/lib/utils/url-utils';

export interface VerificationResult {
  channelId: string;
  verified: boolean;
  reason?: string;
}

export const verifyChannelUrl = async (
  channelType: string,
  channelUrl: string,
): Promise<boolean> => {
  try {
    const isValid = validateChannelUrl(channelUrl, channelType);
    
    if (!isValid) {
      return false;
    }

    switch (channelType.toLowerCase()) {
      case 'instagram':
        return isInstagramUrl(channelUrl);
      case 'youtube':
        return isYoutubeUrl(channelUrl);
      case 'tiktok':
        return isTiktokUrl(channelUrl);
      case 'twitter':
        return isTwitterUrl(channelUrl);
      case 'facebook':
        return isFacebookUrl(channelUrl);
      case 'naver':
        return isNaverBlogUrl(channelUrl);
      case 'threads':
        return isThreadsUrl(channelUrl);
      case 'blog':
        return true;
      default:
        return true;
    }
  } catch (error) {
    console.error('채널 검증 오류:', error);
    return false;
  }
};

export const updateChannelVerificationStatus = async (
  client: SupabaseClient,
  channelId: string,
  verified: boolean,
): Promise<boolean> => {
  try {
    const { error } = await client
      .from('influencer_channels')
      .update({
        status: verified ? 'verified' : 'failed',
      })
      .eq('id', channelId);

    return !error;
  } catch (error) {
    console.error('채널 상태 업데이트 오류:', error);
    return false;
  }
};

export const updateProfileVerificationStatus = async (
  client: SupabaseClient,
  userId: string,
): Promise<'verified' | 'pending' | 'failed'> => {
  try {
    const { data: channels, error: fetchError } = await client
      .from('influencer_channels')
      .select('status')
      .eq('user_id', userId);

    if (fetchError || !channels || channels.length === 0) {
      return 'pending';
    }

    const hasFailedChannel = channels.some((ch: any) => ch.status === 'failed');
    const hasPendingChannel = channels.some((ch: any) => ch.status === 'pending');
    const allVerified = channels.every((ch: any) => ch.status === 'verified');

    let newStatus: 'verified' | 'pending' | 'failed' = 'pending';

    if (allVerified) {
      newStatus = 'verified';
    } else if (hasFailedChannel) {
      newStatus = 'failed';
    }

    const { error: updateError } = await client
      .from('influencer_profiles')
      .update({ verification_status: newStatus })
      .eq('user_id', userId);

    if (updateError) {
      console.error('프로필 상태 업데이트 오류:', updateError);
      return 'pending';
    }

    return newStatus;
  } catch (error) {
    console.error('프로필 검증 상태 업데이트 오류:', error);
    return 'pending';
  }
};

export const verifyInfluencerChannels = async (
  client: SupabaseClient,
  userId: string,
): Promise<VerificationResult[]> => {
  try {
    const { data: channels, error: fetchError } = await client
      .from('influencer_channels')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'pending');

    if (fetchError || !channels) {
      return [];
    }

    const results: VerificationResult[] = [];

    for (const channel of channels) {
      const verified = await verifyChannelUrl(channel.channel_type, channel.channel_url);
      await updateChannelVerificationStatus(client, channel.id, verified);

      results.push({
        channelId: channel.id,
        verified,
        reason: verified ? '검증 완료' : '채널 검증 실패',
      });
    }

    await updateProfileVerificationStatus(client, userId);

    return results;
  } catch (error) {
    console.error('채널 일괄 검증 오류:', error);
    return [];
  }
};

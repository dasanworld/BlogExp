import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/remote/api-client';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import { CampaignDetailForAdvertiser } from '../types/advertiser-types';

export const useCampaignDetail = (campaignId: string) => {
  const { isAuthenticated } = useCurrentUser();
  return useQuery<CampaignDetailForAdvertiser>({
    queryKey: ['campaignDetail', campaignId],
    queryFn: async () => {
      const response = await apiClient.get(`/advertiser/campaigns/${campaignId}/detail`);
      return response.data as CampaignDetailForAdvertiser;
    },
    enabled: !!campaignId && isAuthenticated,
    retry: false,
  });
};

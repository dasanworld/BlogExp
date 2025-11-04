'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/remote/api-client';
import { CampaignDetailResponse } from '../types/campaign-types';

export const useCampaignDetail = (campaignId: string) => {
  return useQuery<CampaignDetailResponse>({
    queryKey: ['campaign', campaignId],
    queryFn: async () => {
      const response = await apiClient.get(`/campaigns/${campaignId}`);
      return response.data;
    },
    enabled: !!campaignId,
    staleTime: 1000 * 60 * 5,
  });
};

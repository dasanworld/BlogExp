'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { CampaignDetailResponse } from '../types/campaign-types';

export const useCampaignDetail = (campaignId: string) => {
  return useQuery<CampaignDetailResponse>({
    queryKey: ['campaign', campaignId],
    queryFn: async () => {
      const response = await axios.get(`/api/campaigns/${campaignId}`);
      return response.data.data;
    },
    enabled: !!campaignId,
    staleTime: 1000 * 60 * 5,
  });
};

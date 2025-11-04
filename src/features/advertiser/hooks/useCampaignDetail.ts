import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { CampaignDetailForAdvertiser } from '../types/advertiser-types';

export const useCampaignDetail = (campaignId: string) => {
  return useQuery<CampaignDetailForAdvertiser>({
    queryKey: ['campaignDetail', campaignId],
    queryFn: async () => {
      const response = await axios.get(`/api/advertiser/campaigns/${campaignId}/detail`);
      return response.data.data;
    },
    enabled: !!campaignId,
  });
};

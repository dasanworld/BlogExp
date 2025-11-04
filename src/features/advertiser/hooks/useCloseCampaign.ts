import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export const useCloseCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (campaignId: string) => {
      const response = await axios.put(`/api/advertiser/campaigns/${campaignId}/close`);
      return response.data;
    },
    onSuccess: (_, campaignId) => {
      queryClient.invalidateQueries({ queryKey: ['campaignDetail', campaignId] });
      queryClient.invalidateQueries({ queryKey: ['myCampaigns'] });
    },
  });
};

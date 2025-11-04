import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/remote/api-client';

export const useCloseCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (campaignId: string) => {
      const response = await apiClient.put(`/advertiser/campaigns/${campaignId}/close`);
      return response.data;
    },
    onSuccess: (_, campaignId) => {
      queryClient.invalidateQueries({ queryKey: ['campaignDetail', campaignId] });
      queryClient.invalidateQueries({ queryKey: ['myCampaigns'] });
    },
  });
};

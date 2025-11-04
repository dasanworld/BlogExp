import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/remote/api-client';
import { CreateCampaignRequest, Campaign } from '../types/advertiser-types';

export const useCreateCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation<Campaign, Error, CreateCampaignRequest>({
    mutationFn: async (data) => {
      const response = await apiClient.post('/advertiser/campaigns', data);
      return response.data as Campaign;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myCampaigns'] });
    },
  });
};

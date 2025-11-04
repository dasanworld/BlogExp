import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/remote/api-client';
import { UpdateCampaignRequest, Campaign } from '../types/advertiser-types';

interface UseUpdateCampaignParams {
  id: string;
  data: UpdateCampaignRequest;
}

export const useUpdateCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation<Campaign, Error, UseUpdateCampaignParams>({
    mutationFn: async ({ id, data }) => {
      const response = await apiClient.put(`/advertiser/campaigns/${id}`, data);
      return response.data as Campaign;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myCampaigns'] });
    },
  });
};

import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { UpdateCampaignRequest, Campaign } from '../types/advertiser-types';

interface UseUpdateCampaignParams {
  id: string;
  data: UpdateCampaignRequest;
}

export const useUpdateCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation<Campaign, Error, UseUpdateCampaignParams>({
    mutationFn: async ({ id, data }) => {
      const response = await axios.put(`/api/advertiser/campaigns/${id}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myCampaigns'] });
    },
  });
};

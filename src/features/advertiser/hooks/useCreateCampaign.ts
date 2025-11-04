import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { CreateCampaignRequest, Campaign } from '../types/advertiser-types';

export const useCreateCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation<Campaign, Error, CreateCampaignRequest>({
    mutationFn: async (data) => {
      const response = await axios.post('/api/advertiser/campaigns', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myCampaigns'] });
    },
  });
};

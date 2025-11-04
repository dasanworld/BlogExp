import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export const useDeleteCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (campaignId) => {
      await axios.delete(`/api/advertiser/campaigns/${campaignId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myCampaigns'] });
    },
  });
};

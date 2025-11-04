import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/remote/api-client';

interface SelectApplicantsRequest {
  campaignId: string;
  selectedApplicationIds: string[];
}

export const useSelectApplicants = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: SelectApplicantsRequest) => {
      const response = await apiClient.post(`/advertiser/campaigns/${request.campaignId}/select`, {
        selectedApplicationIds: request.selectedApplicationIds,
      });
      return response.data;
    },
    onSuccess: (_, request) => {
      queryClient.invalidateQueries({ queryKey: ['campaignDetail', request.campaignId] });
      queryClient.invalidateQueries({ queryKey: ['applicants', request.campaignId] });
      queryClient.invalidateQueries({ queryKey: ['myCampaigns'] });
    },
  });
};

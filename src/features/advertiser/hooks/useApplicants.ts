import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/remote/api-client';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import { ApplicantsResponse } from '../types/advertiser-types';

export const useApplicants = (campaignId: string) => {
  const { isAuthenticated } = useCurrentUser();
  return useQuery<ApplicantsResponse>({
    queryKey: ['applicants', campaignId],
    queryFn: async () => {
      const response = await apiClient.get(`/advertiser/campaigns/${campaignId}/applicants`);
      return response.data as ApplicantsResponse;
    },
    enabled: !!campaignId && isAuthenticated,
    retry: false,
  });
};

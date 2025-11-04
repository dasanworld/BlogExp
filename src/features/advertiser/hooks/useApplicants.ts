import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { ApplicantsResponse } from '../types/advertiser-types';

export const useApplicants = (campaignId: string) => {
  return useQuery<ApplicantsResponse>({
    queryKey: ['applicants', campaignId],
    queryFn: async () => {
      const response = await axios.get(`/api/advertiser/campaigns/${campaignId}/applicants`);
      return response.data.data;
    },
    enabled: !!campaignId,
  });
};

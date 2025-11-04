'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

interface ApplicationStatusResponse {
  status: 'not_applied' | 'pending' | 'selected' | 'rejected' | null;
}

export const useCheckApplicationStatus = (
  campaignId: string,
  userId?: string
) => {
  return useQuery<ApplicationStatusResponse>({
    queryKey: ['applicationStatus', campaignId, userId],
    queryFn: async () => {
      const response = await axios.get(
        `/api/campaigns/${campaignId}/application-status`,
        {
          params: { userId },
        }
      );
      return response.data.data;
    },
    enabled: !!campaignId && !!userId,
    staleTime: 1000 * 60 * 1,
  });
};

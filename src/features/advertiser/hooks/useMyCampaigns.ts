import { useInfiniteQuery } from '@tanstack/react-query';
import axios from 'axios';
import { CampaignListResponse } from '../types/advertiser-types';

interface UseMyClaimsOptions {
  status?: 'recruiting' | 'closed' | 'selection_completed';
  limit?: number;
}

export const useMyCampaigns = (options: UseMyClaimsOptions = {}) => {
  const { status, limit = 20 } = options;

  return useInfiniteQuery<CampaignListResponse>({
    queryKey: ['myCampaigns', { status }],
    queryFn: async ({ pageParam = 1 }) => {
      const params = new URLSearchParams();
      params.set('page', String(pageParam));
      params.set('limit', String(limit));
      if (status) {
        params.set('status', status);
      }

      const response = await axios.get(`/api/advertiser/campaigns?${params.toString()}`);
      return response.data.data;
    },
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.page + 1 : undefined;
    },
    initialPageParam: 1,
  });
};

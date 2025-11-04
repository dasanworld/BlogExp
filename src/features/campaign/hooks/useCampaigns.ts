'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import axios from 'axios';
import { CampaignListResponse } from '../types/campaign-types';

interface UseCampaignsOptions {
  category?: string;
  location?: string;
  sort?: 'latest' | 'deadline' | 'popular';
  limit?: number;
}

export const useCampaigns = (options: UseCampaignsOptions = {}) => {
  const { category, location, sort = 'latest', limit = 20 } = options;

  return useInfiniteQuery<CampaignListResponse>({
    queryKey: ['campaigns', { category, location, sort }],
    queryFn: async ({ pageParam = 1 }) => {
      const params = new URLSearchParams();
      params.set('page', String(pageParam));
      params.set('limit', String(limit));
      params.set('sort', sort);
      params.set('status', 'recruiting');

      if (category) {
        params.set('category', category);
      }
      if (location) {
        params.set('location', location);
      }

      const response = await axios.get(`/api/campaigns?${params.toString()}`);
      return response.data;
    },
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.page + 1 : undefined;
    },
    initialPageParam: 1,
  });
};

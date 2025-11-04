'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import axios from 'axios';
import { MyApplicationsResponse } from '../types/campaign-types';

interface UseMyApplicationsOptions {
  status?: 'pending' | 'selected' | 'rejected';
  limit?: number;
}

export const useMyApplications = (options: UseMyApplicationsOptions = {}) => {
  const { status, limit = 20 } = options;

  return useInfiniteQuery<MyApplicationsResponse>({
    queryKey: ['myApplications', { status }],
    queryFn: async ({ pageParam = 1 }) => {
      const params = new URLSearchParams();
      params.set('page', String(pageParam));
      params.set('limit', String(limit));

      if (status) {
        params.set('status', status);
      }

      const response = await axios.get(`/api/my/applications?${params.toString()}`);
      return response.data.data;
    },
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.page + 1 : undefined;
    },
    initialPageParam: 1,
  });
};

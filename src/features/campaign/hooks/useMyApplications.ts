'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/remote/api-client';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import { MyApplicationsResponse } from '../types/campaign-types';

interface UseMyApplicationsOptions {
  status?: 'pending' | 'selected' | 'rejected';
  limit?: number;
}

export const useMyApplications = (options: UseMyApplicationsOptions = {}) => {
  const { status, limit = 20 } = options;
  const { isAuthenticated } = useCurrentUser();

  return useInfiniteQuery<MyApplicationsResponse>({
    queryKey: ['myApplications', { status }],
    queryFn: async ({ pageParam = 1 }) => {
      const params = new URLSearchParams();
      params.set('page', String(pageParam));
      params.set('limit', String(limit));

      if (status) {
        params.set('status', status);
      }

      const response = await apiClient.get(`/my/applications?${params.toString()}`);
      return response.data as MyApplicationsResponse;
    },
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.page + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: isAuthenticated,
    retry: false,
  });
};

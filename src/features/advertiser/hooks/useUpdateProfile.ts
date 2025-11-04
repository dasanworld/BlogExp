'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import { apiClient, isAxiosError } from '@/lib/remote/api-client';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser-client';
import type { UpdateAdvertiserProfileRequest, AdvertiserProfileResponse } from '../backend/schema/profile-schema';

const PROFILE_QUERY_KEY = ['advertiser', 'profile'];

export const useUpdateAdvertiserProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateAdvertiserProfileRequest): Promise<AdvertiserProfileResponse> => {
      const supabase = getSupabaseBrowserClient();
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth.user?.id;
      // DEBUG
      // eslint-disable-next-line no-console
      console.info('[AdvertiserProfile][PUT] userId=', userId ?? '(none)');
      if (!userId) {
        throw new Error('로그인이 필요합니다');
      }
      // 헤더는 apiClient 인터셉터가 자동 주입
      const response = await apiClient.put('/advertiser/profile', data);
      return response.data as AdvertiserProfileResponse;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(PROFILE_QUERY_KEY, data);
    },
  });
};

export const useGetAdvertiserProfile = () => {
  const { isAuthenticated } = useCurrentUser();
  return useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: async (): Promise<AdvertiserProfileResponse | null> => {
      const supabase = getSupabaseBrowserClient();
      const { data: auth } = await supabase.auth.getUser();
      const headers = auth.user?.id ? { 'x-user-id': auth.user.id } : undefined;
      try {
        const response = await apiClient.get('/advertiser/profile', { headers });
        return response.data as AdvertiserProfileResponse;
      } catch (error) {
        if (isAxiosError(error) && error.response?.status === 404) {
          // 프로필이 아직 없으면 null 반환 (에러로 취급하지 않음)
          return null;
        }
        throw error;
      }
    },
    enabled: isAuthenticated,
    retry: false,
  });
};

export const useInvalidateAdvertiserProfile = () => {
  const queryClient = useQueryClient();

  return () => queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
};

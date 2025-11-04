'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/remote/api-client';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser-client';
import type { UpdateProfileRequest, ProfileResponse } from '../backend/schema/profile-schema';

const PROFILE_QUERY_KEY = ['influencer', 'profile'];

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateProfileRequest): Promise<ProfileResponse> => {
      const supabase = getSupabaseBrowserClient();
      const { data: auth } = await supabase.auth.getUser();
      const headers = auth.user?.id ? { 'x-user-id': auth.user.id } : undefined;
      const response = await apiClient.put('/influencer/profile', data, { headers });
      return response.data as ProfileResponse;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(PROFILE_QUERY_KEY, data);
    },
  });
};

export const useGetProfile = () => {
  return useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: async (): Promise<ProfileResponse> => {
      const supabase = getSupabaseBrowserClient();
      const { data: auth } = await supabase.auth.getUser();
      const headers = auth.user?.id ? { 'x-user-id': auth.user.id } : undefined;
      const response = await apiClient.get('/influencer/profile', { headers });
      return response.data as ProfileResponse;
    },
  });
};

export const useInvalidateProfile = () => {
  const queryClient = useQueryClient();

  return () => queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
};

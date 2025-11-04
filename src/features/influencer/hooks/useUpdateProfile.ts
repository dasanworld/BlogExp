'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import type { UpdateProfileRequest, ProfileResponse } from '../backend/schema/profile-schema';

const PROFILE_QUERY_KEY = ['influencer', 'profile'];

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateProfileRequest): Promise<ProfileResponse> => {
      const response = await axios.put('/api/influencer/profile', data);
      return response.data;
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
      const response = await axios.get('/api/influencer/profile');
      return response.data;
    },
  });
};

export const useInvalidateProfile = () => {
  const queryClient = useQueryClient();

  return () => queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
};

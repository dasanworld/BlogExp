'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import type { UpdateAdvertiserProfileRequest, AdvertiserProfileResponse } from '../backend/schema/profile-schema';

const PROFILE_QUERY_KEY = ['advertiser', 'profile'];

export const useUpdateAdvertiserProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateAdvertiserProfileRequest): Promise<AdvertiserProfileResponse> => {
      const response = await axios.put('/api/advertiser/profile', data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(PROFILE_QUERY_KEY, data);
    },
  });
};

export const useGetAdvertiserProfile = () => {
  return useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: async (): Promise<AdvertiserProfileResponse> => {
      const response = await axios.get('/api/advertiser/profile');
      return response.data;
    },
  });
};

export const useInvalidateAdvertiserProfile = () => {
  const queryClient = useQueryClient();

  return () => queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
};

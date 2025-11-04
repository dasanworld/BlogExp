'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/remote/api-client';
import type { SignupRequest, SignupResponse } from '../backend/schema/signup-schema';

export const useSignup = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: SignupRequest): Promise<SignupResponse> => {
      const response = await apiClient.post('/auth/signup', data);
      return response.data as SignupResponse;
    },
    onSuccess: (data) => {
      if (data.redirectUrl) {
        router.push(data.redirectUrl);
      }
    },
  });
};

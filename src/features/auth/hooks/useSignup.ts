'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import type { SignupRequest, SignupResponse } from '../backend/schema/signup-schema';

export const useSignup = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: SignupRequest): Promise<SignupResponse> => {
      const response = await axios.post('/api/auth/signup', data);
      return response.data;
    },
    onSuccess: (data) => {
      if (data.redirectUrl) {
        router.push(data.redirectUrl);
      }
    },
  });
};

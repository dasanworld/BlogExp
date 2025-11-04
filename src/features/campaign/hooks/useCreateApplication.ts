'use client';

import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/remote/api-client';
import {
  CreateApplicationRequest,
  CreateApplicationResponse,
} from '../types/campaign-types';

export const useCreateApplication = () => {
  return useMutation<
    CreateApplicationResponse,
    Error,
    {
      campaignId: string;
      request: CreateApplicationRequest;
    }
  >({
    mutationFn: async ({ campaignId, request }) => {
      const response = await apiClient.post(
        `/campaigns/${campaignId}/apply`,
        {
          applicationMessage: request.applicationMessage,
          visitDate: request.visitDate,
        }
      );
      return response.data as CreateApplicationResponse;
    },
  });
};

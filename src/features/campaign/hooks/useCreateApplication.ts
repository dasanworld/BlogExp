'use client';

import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
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
      const response = await axios.post(
        `/api/campaigns/${campaignId}/apply`,
        {
          applicationMessage: request.applicationMessage,
          visitDate: request.visitDate,
        }
      );
      return response.data.data;
    },
  });
};

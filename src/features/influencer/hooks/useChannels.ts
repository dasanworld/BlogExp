'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import type { ChannelData } from '../backend/services/channel-service';

const CHANNELS_QUERY_KEY = ['influencer', 'channels'];

export const useGetChannels = () => {
  return useQuery({
    queryKey: CHANNELS_QUERY_KEY,
    queryFn: async (): Promise<ChannelData[]> => {
      const response = await axios.get('/api/influencer/channels');
      return response.data;
    },
  });
};

export const useAddChannel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      channelType: string;
      channelName: string;
      channelUrl: string;
    }): Promise<ChannelData> => {
      const response = await axios.post('/api/influencer/channels', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHANNELS_QUERY_KEY });
    },
  });
};

export const useUpdateChannel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      channelId: string;
      channelType: string;
      channelName: string;
      channelUrl: string;
    }): Promise<ChannelData> => {
      const response = await axios.put(`/api/influencer/channels/${data.channelId}`, {
        channelType: data.channelType,
        channelName: data.channelName,
        channelUrl: data.channelUrl,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHANNELS_QUERY_KEY });
    },
  });
};

export const useDeleteChannel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (channelId: string): Promise<void> => {
      await axios.delete(`/api/influencer/channels/${channelId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHANNELS_QUERY_KEY });
    },
  });
};

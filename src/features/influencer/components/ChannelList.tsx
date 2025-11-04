'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Trash2, Edit2 } from 'lucide-react';
import type { ChannelInput } from '../backend/schema/profile-schema';

interface ChannelListProps {
  channels: ChannelInput[];
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
}

export const ChannelList = ({ channels, onEdit, onDelete }: ChannelListProps) => {
  if (channels.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        등록된 채널이 없습니다
      </div>
    );
  }

  return (
    <div className="space-y-3 mt-3">
      {channels.map((channel, index) => (
        <Card key={index} className="p-4 flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm">
              {channel.channelType.charAt(0).toUpperCase() + channel.channelType.slice(1)}
            </p>
            <p className="text-gray-600 text-sm truncate">{channel.channelName}</p>
            <p className="text-gray-400 text-xs truncate">{channel.channelUrl}</p>
          </div>
          <div className="flex gap-2 ml-4 flex-shrink-0">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onEdit(index)}
              className="h-8 w-8 p-0"
            >
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onDelete(index)}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};

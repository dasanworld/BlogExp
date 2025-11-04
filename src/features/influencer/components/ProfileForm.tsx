'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ChannelList } from './ChannelList';
import { ChannelFormDialog } from './ChannelFormDialog';
import { useUpdateProfile, useGetProfile } from '../hooks/useUpdateProfile';
import { UpdateProfileRequestSchema, type UpdateProfileRequest, type ChannelInput } from '../backend/schema/profile-schema';
import { calculateAge } from '@/lib/utils/date-utils';

export const ProfileForm = () => {
  const router = useRouter();
  const updateProfile = useUpdateProfile();
  const { data: existingProfile } = useGetProfile();
  
  const [channels, setChannels] = useState<ChannelInput[]>([]);
  const [isChannelDialogOpen, setIsChannelDialogOpen] = useState(false);
  const [editingChannel, setEditingChannel] = useState<{ index: number; data: ChannelInput } | null>(null);
  const [age, setAge] = useState<number | null>(null);

  const form = useForm<UpdateProfileRequest>({
    resolver: zodResolver(UpdateProfileRequestSchema),
    defaultValues: {
      birthDate: existingProfile?.birthDate || '',
      channels: existingProfile?.channels.map(ch => ({
        channelType: ch.channelType,
        channelName: ch.channelName,
        channelUrl: ch.channelUrl,
      })) || [],
    },
  });

  useEffect(() => {
    if (existingProfile?.channels) {
      setChannels(
        existingProfile.channels.map(ch => ({
          channelType: ch.channelType,
          channelName: ch.channelName,
          channelUrl: ch.channelUrl,
        }))
      );
      form.setValue('channels', existingProfile.channels.map(ch => ({
        channelType: ch.channelType,
        channelName: ch.channelName,
        channelUrl: ch.channelUrl,
      })));
    }
  }, [existingProfile, form]);

  const handleBirthDateChange = (dateString: string) => {
    form.setValue('birthDate', dateString);
    if (dateString) {
      try {
        const calculatedAge = calculateAge(dateString);
        setAge(calculatedAge);
      } catch {
        setAge(null);
      }
    }
  };

  const handleAddChannel = (channel: ChannelInput) => {
    if (editingChannel !== null) {
      const updated = [...channels];
      updated[editingChannel.index] = channel;
      setChannels(updated);
      setEditingChannel(null);
      form.setValue('channels', updated);
    } else {
      const updated = [...channels, channel];
      setChannels(updated);
      form.setValue('channels', updated);
    }
    setIsChannelDialogOpen(false);
  };

  const handleDeleteChannel = (index: number) => {
    const updated = channels.filter((_, i) => i !== index);
    setChannels(updated);
    form.setValue('channels', updated);
  };

  const handleEditChannel = (index: number) => {
    setEditingChannel({ index, data: channels[index] });
    setIsChannelDialogOpen(true);
  };

  const onSubmit = async (data: UpdateProfileRequest) => {
    const result = await updateProfile.mutateAsync(data);
    if (result) {
      router.push('/influencer/dashboard');
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* 생년월일 */}
          <FormField
            control={form.control}
            name="birthDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>생년월일</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      handleBirthDateChange(e.target.value);
                    }}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </FormControl>
                {age !== null && (
                  <p className="text-sm text-gray-600">
                    만 {age}세
                  </p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 채널 목록 */}
          <div>
            <FormLabel>SNS 채널</FormLabel>
            <ChannelList
              channels={channels}
              onEdit={handleEditChannel}
              onDelete={handleDeleteChannel}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setEditingChannel(null);
                setIsChannelDialogOpen(true);
              }}
              className="mt-3 w-full"
            >
              + 채널 추가
            </Button>
            {form.formState.errors.channels && (
              <p className="text-sm text-red-600 mt-2">
                {form.formState.errors.channels.message}
              </p>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={updateProfile.isPending}
          >
            {updateProfile.isPending ? '처리 중...' : '등록 완료'}
          </Button>
        </form>
      </Form>

      <ChannelFormDialog
        open={isChannelDialogOpen}
        onClose={() => {
          setIsChannelDialogOpen(false);
          setEditingChannel(null);
        }}
        onSubmit={handleAddChannel}
        initialData={editingChannel?.data}
      />
    </>
  );
};

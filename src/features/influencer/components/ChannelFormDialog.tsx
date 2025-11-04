'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { ChannelInputSchema, type ChannelInput, ChannelType } from '../backend/schema/profile-schema';

interface ChannelFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ChannelInput) => void;
  initialData?: ChannelInput;
}

export const ChannelFormDialog = ({
  open,
  onClose,
  onSubmit,
  initialData,
}: ChannelFormDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ChannelInput>({
    resolver: zodResolver(ChannelInputSchema),
    defaultValues: initialData || {
      channelType: 'instagram',
      channelName: '',
      channelUrl: '',
    },
    values: initialData || undefined,
  });

  const handleFormSubmit = async (data: ChannelInput) => {
    setIsSubmitting(true);
    try {
      onSubmit(data);
      form.reset();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset();
      onClose();
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>
            {initialData ? '채널 수정' : '채널 추가'}
          </SheetTitle>
          <SheetDescription>
            SNS 채널 정보를 입력해주세요
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 mt-6">
            <FormField
              control={form.control}
              name="channelType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>채널 유형</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="채널을 선택해주세요" />
                      </SelectTrigger>
                      <SelectContent>
                        {ChannelType.options.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="channelName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>채널명</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="예: @myaccount"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="channelUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>채널 URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://instagram.com/myaccount"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting}
              >
                취소
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? '처리 중...' : initialData ? '수정' : '추가'}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};

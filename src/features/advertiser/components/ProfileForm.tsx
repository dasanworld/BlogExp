'use client';

import { useEffect, useState } from 'react';
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
import { CategorySelector } from './CategorySelector';
import { AddressSearch } from './AddressSearch';
import { useUpdateAdvertiserProfile, useGetAdvertiserProfile } from '../hooks/useUpdateProfile';
import { UpdateAdvertiserProfileRequestSchema, type UpdateAdvertiserProfileRequest, type CategoryEnum } from '../backend/schema/profile-schema';
import { formatBusinessNumber, normalizeBusinessNumber } from '@/lib/utils/business-number-utils';

export const AdvertiserProfileForm = () => {
  const router = useRouter();
  const updateProfile = useUpdateAdvertiserProfile();
  const { data: existingProfile } = useGetAdvertiserProfile();
  const [formattedBusinessNumber, setFormattedBusinessNumber] = useState('');

  const form = useForm<UpdateAdvertiserProfileRequest>({
    resolver: zodResolver(UpdateAdvertiserProfileRequestSchema),
    defaultValues: {
      businessName: existingProfile?.businessName || '',
      location: existingProfile?.location || '',
      category: (existingProfile?.category || 'restaurant') as CategoryEnum,
      businessRegistrationNumber: existingProfile?.businessRegistrationNumber || '',
    },
  });

  useEffect(() => {
    if (existingProfile) {
      form.reset({
        businessName: existingProfile.businessName,
        location: existingProfile.location,
        category: existingProfile.category as CategoryEnum,
        businessRegistrationNumber: existingProfile.businessRegistrationNumber,
      });
      setFormattedBusinessNumber(formatBusinessNumber(existingProfile.businessRegistrationNumber));
    }
  }, [existingProfile, form]);

  const handleBusinessNumberChange = (value: string) => {
    const normalized = normalizeBusinessNumber(value);
    setFormattedBusinessNumber(formatBusinessNumber(normalized));
    form.setValue('businessRegistrationNumber', normalized);
  };

  const onSubmit = async (data: UpdateAdvertiserProfileRequest) => {
    const result = await updateProfile.mutateAsync(data);
    if (result) {
      router.push('/advertiser/campaigns');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* 업체명 */}
        <FormField
          control={form.control}
          name="businessName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>업체명</FormLabel>
              <FormControl>
                <Input
                  placeholder="예: 홍길동 카페"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 위치 */}
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>위치</FormLabel>
              <FormControl>
                <AddressSearch
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 카테고리 */}
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>카테고리</FormLabel>
              <FormControl>
                <CategorySelector
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 사업자등록번호 */}
        <FormField
          control={form.control}
          name="businessRegistrationNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>사업자등록번호</FormLabel>
              <FormControl>
                <Input
                  placeholder="예: 123-45-67890"
                  maxLength={12}
                  value={formattedBusinessNumber}
                  onChange={(e) => handleBusinessNumberChange(e.target.value)}
                  onBlur={field.onBlur}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={updateProfile.isPending}
        >
          {updateProfile.isPending ? '처리 중...' : '등록 완료'}
        </Button>
      </form>
    </Form>
  );
};

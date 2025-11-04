'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RoleSelector } from './RoleSelector';
import { ConsentCheckboxes } from './ConsentCheckboxes';
import { useSignup } from '../hooks/useSignup';
import { SignupRequestSchema, type SignupRequest } from '../backend/schema/signup-schema';
import { formatPhoneInput } from '../lib/validation';

export const SignupForm = () => {
  const signup = useSignup();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SignupRequest>({
    resolver: zodResolver(SignupRequestSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      password: '',
      role: 'influencer' as const,
      consents: {
        termsOfService: true,
        privacyPolicy: true,
        marketing: false,
      },
    },
  });

  const onSubmit = async (data: SignupRequest) => {
    setIsSubmitting(true);
    try {
      await signup.mutateAsync(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneInput(e.target.value);
    form.setValue('phone', formatted);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* 이름 */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>이름</FormLabel>
              <FormControl>
                <Input placeholder="홍길동" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 휴대폰번호 */}
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>휴대폰번호</FormLabel>
              <FormControl>
                <Input 
                  placeholder="010-1234-5678" 
                  {...field}
                  onChange={(e) => {
                    handlePhoneChange(e);
                    field.onChange(e);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 이메일 */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>이메일</FormLabel>
              <FormControl>
                <Input type="email" placeholder="example@email.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 비밀번호 */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>비밀번호</FormLabel>
              <FormControl>
                <Input type="password" placeholder="8자 이상, 영문/숫자/특수문자 조합" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 역할 선택 */}
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>역할 선택</FormLabel>
              <FormControl>
                <RoleSelector value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 약관 동의 */}
        <FormField
          control={form.control}
          name="consents"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <ConsentCheckboxes
                  value={field.value as { termsOfService: true; privacyPolicy: true; marketing?: boolean }}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 제출 버튼 */}
        <Button type="submit" className="w-full" disabled={isSubmitting || signup.isPending}>
          {isSubmitting || signup.isPending ? '처리 중...' : '회원가입'}
        </Button>

        {/* 에러 메시지 */}
        {signup.isError && (
          <div className="text-sm text-red-600">
            {typeof signup.error === 'object' && signup.error !== null && 'response' in signup.error
              ? (signup.error as any).response?.data?.error?.message
              : '회원가입에 실패했습니다'}
          </div>
        )}
      </form>
    </Form>
  );
};

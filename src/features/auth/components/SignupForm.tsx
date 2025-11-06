'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { useToast } from '@/hooks/use-toast';
import { extractApiErrorMessage, isAxiosError } from '@/lib/remote/api-client';

export const SignupForm = () => {
  const signup = useSignup();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState<string | undefined>(undefined);

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
      const result = await signup.mutateAsync(data);
      setRedirectUrl(result.redirectUrl);
      setIsDialogOpen(true);
    } catch (error) {
      const message = extractApiErrorMessage(error, '회원가입에 실패했습니다');
      // 필드별 에러 매핑 (백엔드 에러코드 기준)
      if (isAxiosError(error)) {
        const code = (error.response?.data?.error?.code as string) ?? '';
        if (code === 'EMAIL_ALREADY_EXISTS') {
          form.setError('email', { type: 'server', message: '이미 사용 중인 이메일입니다' });
        }
        if (code === 'PHONE_ALREADY_EXISTS') {
          form.setError('phone', { type: 'server', message: '이미 사용 중인 휴대폰번호입니다' });
        }
        if (code === 'INVALID_SIGNUP_INPUT') {
          // 가능한 경우, 서버의 상세 포맷을 일괄 메시지로 출력
          // 개별 필드 에러는 react-hook-form + zod가 이미 클라이언트에서 처리합니다
        }
      }
      toast({ title: '회원가입 실패', description: message, variant: 'destructive' });
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
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsDialogOpen(false)} />
          <div className="relative z-10 w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-slate-900">회원가입 신청 완료</h3>
            <p className="mt-2 text-sm text-slate-600">
              입력하신 이메일로 인증 메일이 발송되었습니다. 메일함을 확인하고 인증을 완료해주세요.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsDialogOpen(false)}
                className="rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                닫기
              </button>
              <button
                type="button"
                onClick={() => router.push(redirectUrl ?? '/login')}
                className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white hover:bg-slate-800"
              >
                로그인으로 이동
              </button>
            </div>
          </div>
        </div>
      )}
    </Form>
  );
};

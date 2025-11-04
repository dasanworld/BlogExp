'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { SignupForm } from '@/features/auth/components/SignupForm';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useCurrentUser();

  useEffect(() => {
    if (isAuthenticated) {
      const redirectedFrom = searchParams.get('redirectedFrom') ?? '/';
      router.replace(redirectedFrom);
    }
  }, [isAuthenticated, router, searchParams]);

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="container max-w-md mx-auto py-12">
      <Card>
        <CardHeader>
          <CardTitle>회원가입</CardTitle>
          <CardDescription>
            블로그 체험단에 오신 것을 환영합니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignupForm />
        </CardContent>
      </Card>
    </div>
  );
}

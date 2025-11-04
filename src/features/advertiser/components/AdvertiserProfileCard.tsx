'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useGetAdvertiserProfile } from '../hooks/useUpdateProfile';

export const AdvertiserProfileCard = () => {
  const { data: profile, isLoading } = useGetAdvertiserProfile();

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <CardTitle>광고주 프로필</CardTitle>
          <p className="text-sm text-slate-500">캠페인 관리를 위한 업체 정보를 확인하세요.</p>
        </div>
        {profile && (
          <Badge
            className={
              profile.verificationStatus === 'verified'
                ? 'bg-emerald-100 text-emerald-800'
                : profile.verificationStatus === 'failed'
                ? 'bg-red-100 text-red-800'
                : 'bg-yellow-100 text-yellow-800'
            }
          >
            {profile.verificationStatus === 'verified'
              ? '인증 완료'
              : profile.verificationStatus === 'failed'
              ? '인증 실패'
              : '인증 대기'}
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="animate-pulse h-16 bg-slate-100 rounded" />
        ) : profile ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-slate-500">업체명</p>
              <p className="text-slate-900 font-medium">{profile.businessName}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">카테고리</p>
              <p className="text-slate-900 font-medium">{profile.category}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">사업자등록번호</p>
              <p className="text-slate-900 font-medium">{profile.businessRegistrationNumber}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-600">아직 광고주 프로필이 없습니다. 온보딩을 완료해 주세요.</p>
            <Button asChild>
              <Link href="/advertiser/onboarding">프로필 등록</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};



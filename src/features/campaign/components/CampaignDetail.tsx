'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCampaignDetail } from '../hooks/useCampaignDetail';
import { ApplyButton } from './ApplyButton';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';

interface CampaignDetailProps {
  campaignId: string;
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'recruiting':
      return 'bg-green-500';
    case 'closed':
      return 'bg-gray-500';
    case 'selection_completed':
      return 'bg-blue-500';
    default:
      return 'bg-gray-500';
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'recruiting':
      return '모집 중';
    case 'closed':
      return '모집 종료';
    case 'selection_completed':
      return '선정 완료';
    default:
      return '알 수 없음';
  }
}

function getDaysBadgeColor(daysLeft: number): string {
  if (daysLeft <= 0) return 'bg-gray-500';
  if (daysLeft <= 3) return 'bg-red-500';
  if (daysLeft <= 7) return 'bg-yellow-500';
  return 'bg-green-500';
}

function getDaysBadgeText(daysLeft: number): string {
  if (daysLeft <= 0) return '마감됨';
  if (daysLeft === 1) return 'D-1';
  return `D-${daysLeft}`;
}

export const CampaignDetail = ({ campaignId }: CampaignDetailProps) => {
  const router = useRouter();
  const { data: campaign, isLoading, error } = useCampaignDetail(campaignId);
  const { user: currentUser } = useCurrentUser();

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center">
          <p className="text-red-600">체험단을 찾을 수 없습니다.</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push('/')}
          >
            목록으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="space-y-6">
          <div className="h-12 w-3/4 bg-slate-200 rounded animate-pulse" />
          <div className="h-64 w-full bg-slate-200 rounded animate-pulse" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-24 bg-slate-200 rounded animate-pulse" />
            <div className="h-24 bg-slate-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="container mx-auto py-8">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center">
          <p className="text-slate-600">체험단을 찾을 수 없습니다.</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push('/')}
          >
            목록으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  const isRecruitmentFull =
    campaign.applicantCount >= campaign.totalSlots;
  const canApply =
    campaign.status === 'recruiting' &&
    campaign.userApplicationStatus === 'not_applied' &&
    !isRecruitmentFull;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="container mx-auto py-8 space-y-6 max-w-3xl">
      {/* Header with back button */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
        >
          ← 돌아가기
        </Button>
      </div>

      {/* Title and status badge */}
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            {campaign.title}
          </h1>
          <p className="text-lg text-slate-600">
            {campaign.advertiser.businessName}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Badge className={`${getStatusColor(campaign.status)} text-white text-base`}>
            {getStatusLabel(campaign.status)}
          </Badge>
          <Badge
            className={`${getDaysBadgeColor(campaign.daysLeft)} text-white text-base`}
          >
            {getDaysBadgeText(campaign.daysLeft)}
          </Badge>
        </div>
      </div>

      {/* Thumbnail image */}
      {campaign.thumbnailUrl && (
        <div className="relative w-full h-96 rounded-lg overflow-hidden bg-slate-100">
          <Image
            src={campaign.thumbnailUrl}
            alt={campaign.title}
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* Key information card */}
      <Card>
        <CardContent className="pt-6">
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <dt className="font-semibold text-slate-600 text-sm mb-1">
                카테고리
              </dt>
              <dd className="text-lg text-slate-900">
                {campaign.advertiser.category}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-600 text-sm mb-1">
                위치
              </dt>
              <dd className="text-lg text-slate-900">
                {campaign.advertiser.location}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-600 text-sm mb-1">
                모집 인원
              </dt>
              <dd className="text-lg text-slate-900">
                {campaign.applicantCount} / {campaign.totalSlots}명
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-600 text-sm mb-1">
                선정 인원
              </dt>
              <dd className="text-lg text-slate-900">
                {campaign.selectedCount}명
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Recruitment dates */}
      <Card>
        <CardContent className="pt-6">
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <dt className="font-semibold text-slate-600 text-sm mb-1">
                모집 기간
              </dt>
              <dd className="text-slate-900">
                {formatDate(campaign.recruitmentStartDate)} ~{' '}
                {formatDate(campaign.recruitmentEndDate)}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-600 text-sm mb-1">
                체험 기간
              </dt>
              <dd className="text-slate-900">
                {campaign.experienceStartDate} ~{' '}
                {campaign.experienceEndDate}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Recruitment progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-700">모집 진행률</span>
              <span className="text-sm text-slate-600">
                {Math.min(
                  Math.round(
                    (campaign.applicantCount / campaign.totalSlots) * 100
                  ),
                  100
                )}
                %
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3">
              <div
                className={`h-full rounded-full transition-all ${
                  isRecruitmentFull ? 'bg-red-500' : 'bg-blue-500'
                }`}
                style={{
                  width: `${Math.min(
                    (campaign.applicantCount / campaign.totalSlots) * 100,
                    100
                  )}%`,
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle>상세 설명</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-slate-700 leading-relaxed">
            {campaign.description}
          </p>
        </CardContent>
      </Card>

      {/* Benefits */}
      <Card>
        <CardHeader>
          <CardTitle>제공 혜택</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-slate-700 leading-relaxed">
            {campaign.benefits}
          </p>
        </CardContent>
      </Card>

      {/* Mission */}
      <Card>
        <CardHeader>
          <CardTitle>미션</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-slate-700 leading-relaxed">
            {campaign.mission}
          </p>
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardHeader>
          <CardTitle>체험 장소</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-700">{campaign.location}</p>
        </CardContent>
      </Card>

      {/* Application status alerts */}
      {campaign.userApplicationStatus === 'pending' && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="text-blue-800">
            이미 지원한 체험단입니다. 결과를 기다려주세요.
          </p>
        </div>
      )}

      {campaign.userApplicationStatus === 'selected' && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <p className="text-green-800">
            축하합니다! 이 체험단에 선정되었습니다.
          </p>
        </div>
      )}

      {campaign.userApplicationStatus === 'rejected' && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-red-800">
            죄송하지만 이번 체험단에 선정되지 못했습니다.
          </p>
        </div>
      )}

      {/* Recruitment full alert */}
      {isRecruitmentFull && campaign.status === 'recruiting' && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <p className="text-yellow-800">
            모집 인원이 마감되었습니다.
          </p>
        </div>
      )}

      {/* Recruitment closed alert */}
      {campaign.status === 'closed' && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p className="text-gray-800">
            모집이 종료되었습니다.
          </p>
        </div>
      )}

      {/* Apply button */}
      {canApply && (
        <ApplyButton campaignId={campaign.id} />
      )}

      {campaign.userApplicationStatus === 'not_applied' && !canApply && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="text-blue-800">
            {campaign.status !== 'recruiting'
              ? '모집이 진행 중이 아닙니다.'
              : isRecruitmentFull
                ? '모집 인원이 마감되었습니다.'
                : '지원할 수 없습니다.'}
          </p>
        </div>
      )}

      {!currentUser && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="text-blue-800">
            로그인 후 지원할 수 있습니다.
          </p>
        </div>
      )}
    </div>
  );
};

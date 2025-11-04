'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useMyApplications } from '../hooks/useMyApplications';
import { MyApplicationCard } from './MyApplicationCard';

type ApplicationStatus = 'pending' | 'selected' | 'rejected';

export const MyApplicationList = () => {
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'all'>(
    'all'
  );
  const [sortOrder, setSortOrder] = useState<'latest' | 'oldest' | 'visit_date'>(
    'latest'
  );

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useMyApplications(
      statusFilter === 'all' ? {} : { status: statusFilter }
    );

  const applications = data?.pages.flatMap((page) => page.applications) || [];
  const statusCounts = data?.pages[0]?.statusCounts || {
    pending: 0,
    selected: 0,
    rejected: 0,
  };

  const sortedApplications = [...applications].sort((a, b) => {
    switch (sortOrder) {
      case 'oldest':
        return new Date(a.appliedAt).getTime() - new Date(b.appliedAt).getTime();
      case 'visit_date':
        return new Date(a.visitDate).getTime() - new Date(b.visitDate).getTime();
      case 'latest':
      default:
        return new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime();
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-48 bg-slate-200 rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-12 text-center">
        <p className="text-slate-600 mb-4">
          아직 지원한 체험단이 없습니다.
        </p>
        <Button asChild>
          <Link href="/">체험단 둘러보기</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Filter Tabs */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">상태</h3>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={statusFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('all')}
            className="text-sm"
          >
            전체 ({applications.length})
          </Button>
          <Button
            variant={statusFilter === 'pending' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('pending')}
            className="text-sm"
          >
            대기중 ({statusCounts.pending})
          </Button>
          <Button
            variant={statusFilter === 'selected' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('selected')}
            className="text-sm"
          >
            선정됨 ({statusCounts.selected})
          </Button>
          <Button
            variant={statusFilter === 'rejected' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('rejected')}
            className="text-sm"
          >
            미선정 ({statusCounts.rejected})
          </Button>
        </div>
      </div>

      {/* Sort Options */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">정렬</h3>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={sortOrder === 'latest' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortOrder('latest')}
            className="text-sm"
          >
            최신순
          </Button>
          <Button
            variant={sortOrder === 'oldest' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortOrder('oldest')}
            className="text-sm"
          >
            과거순
          </Button>
          <Button
            variant={sortOrder === 'visit_date' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortOrder('visit_date')}
            className="text-sm"
          >
            방문일 임박순
          </Button>
        </div>
      </div>

      {/* Applications List */}
      {sortedApplications.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center">
          <p className="text-slate-600">해당 상태의 지원이 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedApplications.map((application) => (
            <MyApplicationCard
              key={application.applicationId}
              application={application}
            />
          ))}
        </div>
      )}

      {/* Load More Button */}
      {hasNextPage && (
        <Button
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
          variant="outline"
          className="w-full"
        >
          {isFetchingNextPage ? '로딩 중...' : '더보기'}
        </Button>
      )}
    </div>
  );
};

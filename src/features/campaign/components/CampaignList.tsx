'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCampaigns } from '../hooks/useCampaigns';
import { CampaignCard } from './CampaignCard';
import { CampaignFilter } from './CampaignFilter';
import { CampaignFilters } from '../types/campaign-types';

export const CampaignList = () => {
  const [filters, setFilters] = useState<CampaignFilters>({});
  const [sort, setSort] = useState<'latest' | 'deadline' | 'popular'>('latest');

  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useCampaigns({
    category: filters.category,
    location: filters.location,
    sort,
  });

  const campaigns = data?.pages.flatMap((page) => page.campaigns) || [];
  const isEmpty = !isLoading && campaigns.length === 0;

  return (
    <div className="space-y-6">
      <CampaignFilter value={filters} onChange={setFilters} onSort={setSort} />

      {isLoading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-lg border border-slate-200 h-80 animate-pulse bg-slate-100"
            />
          ))}
        </div>
      )}

      {isEmpty && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-12 text-center">
          <p className="text-slate-600">
            조건에 맞는 체험단이 없습니다. 필터를 변경해보세요.
          </p>
        </div>
      )}

      {!isLoading && campaigns.length > 0 && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {campaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>

          {hasNextPage && (
            <div className="flex justify-center">
              <Button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                variant="outline"
              >
                {isFetchingNextPage ? '로딩 중...' : '더보기'}
              </Button>
            </div>
          )}

          {!hasNextPage && campaigns.length > 0 && (
            <div className="text-center py-4">
              <p className="text-sm text-slate-500">모든 체험단을 확인했습니다</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

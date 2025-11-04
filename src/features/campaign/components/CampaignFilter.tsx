'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Filter, X } from 'lucide-react';
import { CampaignFilters } from '../types/campaign-types';

interface CampaignFilterProps {
  value: CampaignFilters;
  onChange: (filters: CampaignFilters) => void;
  onSort?: (sort: 'latest' | 'deadline' | 'popular') => void;
}

const categoryOptions = [
  { value: 'restaurant', label: '음식점' },
  { value: 'cafe', label: '카페' },
  { value: 'beauty', label: '뷰티' },
  { value: 'fashion', label: '패션' },
  { value: 'entertainment', label: '엔터테인먼트' },
  { value: 'other', label: '기타' },
];

const locationOptions = [
  { value: 'seoul', label: '서울' },
  { value: 'gyeonggi', label: '경기' },
  { value: 'incheon', label: '인천' },
  { value: 'busan', label: '부산' },
  { value: 'daegu', label: '대구' },
  { value: 'daejeon', label: '대전' },
  { value: 'gwangju', label: '광주' },
  { value: 'ulsan', label: '울산' },
];

export const CampaignFilter = ({ value, onChange, onSort }: CampaignFilterProps) => {
  const [localFilters, setLocalFilters] = useState<CampaignFilters>(value);
  const [isOpen, setIsOpen] = useState(false);

  const handleApplyFilters = () => {
    onChange(localFilters);
    setIsOpen(false);
  };

  const handleReset = () => {
    setLocalFilters({});
    onChange({});
    setIsOpen(false);
  };

  const hasActiveFilters = Object.values(value).some(v => v);

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-2">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="w-4 h-4" />
              필터
              {hasActiveFilters && <span className="ml-1 rounded-full bg-blue-500 text-white text-xs w-5 h-5 flex items-center justify-center">
                {Object.values(value).filter(v => v).length}
              </span>}
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>필터</SheetTitle>
              <SheetDescription>조건을 선택하여 체험단을 찾아보세요</SheetDescription>
            </SheetHeader>

            <div className="space-y-6 py-6">
              <div className="space-y-3">
                <Label htmlFor="category">카테고리</Label>
                <Select
                  value={localFilters.category || ''}
                  onValueChange={(val) =>
                    setLocalFilters({ ...localFilters, category: val || undefined })
                  }
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="카테고리 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label htmlFor="location">지역</Label>
                <Select
                  value={localFilters.location || ''}
                  onValueChange={(val) =>
                    setLocalFilters({ ...localFilters, location: val || undefined })
                  }
                >
                  <SelectTrigger id="location">
                    <SelectValue placeholder="지역 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {locationOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={handleReset}>
                초기화
              </Button>
              <Button className="flex-1" onClick={handleApplyFilters}>
                적용
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="gap-1"
          >
            <X className="w-3 h-3" />
            초기화
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Label htmlFor="sort" className="text-sm">
          정렬
        </Label>
        <Select
          defaultValue="latest"
          onValueChange={(val) => onSort?.(val as 'latest' | 'deadline' | 'popular')}
        >
          <SelectTrigger id="sort" className="w-auto">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="latest">최신순</SelectItem>
            <SelectItem value="deadline">마감 임박순</SelectItem>
            <SelectItem value="popular">인기순</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

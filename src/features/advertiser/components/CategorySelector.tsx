'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Category, type CategoryEnum } from '../backend/schema/profile-schema';

interface CategorySelectorProps {
  value: CategoryEnum;
  onChange: (value: CategoryEnum) => void;
}

const categoryLabels: Record<CategoryEnum, string> = {
  restaurant: '음식점',
  cafe: '카페',
  beauty: '뷰티',
  fashion: '패션',
  entertainment: '엔터테인먼트',
  other: '기타',
};

export const CategorySelector = ({ value, onChange }: CategorySelectorProps) => {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="카테고리를 선택해주세요" />
      </SelectTrigger>
      <SelectContent>
        {Category.options.map((category) => (
          <SelectItem key={category} value={category}>
            {categoryLabels[category as CategoryEnum]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

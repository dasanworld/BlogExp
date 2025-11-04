'use client';

import { Card } from '@/components/ui/card';
import { UserCircle, Store } from 'lucide-react';

type Role = 'advertiser' | 'influencer';

interface RoleSelectorProps {
  value?: Role;
  onChange: (value: Role) => void;
}

export const RoleSelector = ({ value, onChange }: RoleSelectorProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Card
        className={`p-4 cursor-pointer transition-all ${
          value === 'influencer'
            ? 'border-primary bg-primary/5'
            : 'hover:border-gray-400'
        }`}
        onClick={() => onChange('influencer')}
        role="radio"
        aria-checked={value === 'influencer'}
      >
        <div className="flex flex-col items-center gap-2">
          <UserCircle className="w-12 h-12" />
          <h3 className="font-semibold">인플루언서</h3>
          <p className="text-sm text-gray-600 text-center">
            체험단에 참여하고 리뷰를 작성합니다
          </p>
        </div>
      </Card>

      <Card
        className={`p-4 cursor-pointer transition-all ${
          value === 'advertiser'
            ? 'border-primary bg-primary/5'
            : 'hover:border-gray-400'
        }`}
        onClick={() => onChange('advertiser')}
        role="radio"
        aria-checked={value === 'advertiser'}
      >
        <div className="flex flex-col items-center gap-2">
          <Store className="w-12 h-12" />
          <h3 className="font-semibold">광고주</h3>
          <p className="text-sm text-gray-600 text-center">
            체험단을 등록하고 관리합니다
          </p>
        </div>
      </Card>
    </div>
  );
};

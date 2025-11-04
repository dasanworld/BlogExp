'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface ApplyButtonProps {
  campaignId: string;
}

export const ApplyButton = ({ campaignId }: ApplyButtonProps) => {
  const router = useRouter();

  const handleApply = () => {
    router.push(`/campaigns/${campaignId}/apply`);
  };

  return (
    <div className="flex gap-3">
      <Button onClick={handleApply} size="lg" className="flex-1">
        지원하기
      </Button>
    </div>
  );
};

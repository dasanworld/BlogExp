'use client';

import { Badge } from '@/components/ui/badge';

interface ApplicationStatusBadgeProps {
  status: 'pending' | 'selected' | 'rejected';
}

export const ApplicationStatusBadge = ({
  status,
}: ApplicationStatusBadgeProps) => {
  const variants: Record<
    'pending' | 'selected' | 'rejected',
    { label: string; className: string }
  > = {
    pending: {
      label: '대기중',
      className: 'bg-yellow-100 text-yellow-800',
    },
    selected: {
      label: '선정됨',
      className: 'bg-green-100 text-green-800',
    },
    rejected: {
      label: '미선정',
      className: 'bg-gray-100 text-gray-800',
    },
  };

  const variant = variants[status];

  return (
    <Badge className={variant.className}>
      {variant.label}
    </Badge>
  );
};

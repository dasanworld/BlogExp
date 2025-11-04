interface CampaignStatusBadgeProps {
  status: 'recruiting' | 'closed' | 'selection_completed';
}

export const CampaignStatusBadge = ({ status }: CampaignStatusBadgeProps) => {
  const getStatusLabel = () => {
    switch (status) {
      case 'recruiting':
        return '모집 중';
      case 'closed':
        return '모집 종료';
      case 'selection_completed':
        return '선정 완료';
      default:
        return status;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'recruiting':
        return 'bg-blue-100 text-blue-800';
      case 'closed':
        return 'bg-yellow-100 text-yellow-800';
      case 'selection_completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${getStatusColor()}`}
    >
      {getStatusLabel()}
    </span>
  );
};

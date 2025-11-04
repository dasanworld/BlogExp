'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ApplicantItem } from '../types/advertiser-types';
import { Badge } from '@/components/ui/badge';

interface ApplicantDetailDialogProps {
  applicant: ApplicantItem | null;
  open: boolean;
  onClose: () => void;
}

export const ApplicantDetailDialog = ({
  applicant,
  open,
  onClose,
}: ApplicantDetailDialogProps) => {
  if (!applicant) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return '대기 중';
      case 'selected':
        return '선정됨';
      case 'rejected':
        return '반려됨';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      case 'selected':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>지원자 상세 정보</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">{applicant.applicantName}</h3>
              <p className="text-sm text-slate-500 mt-1">ID: {applicant.applicantId}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(applicant.status)}`}>
              {getStatusLabel(applicant.status)}
            </span>
          </div>

          <div>
            <h4 className="text-sm font-medium text-slate-600 mb-2">SNS 채널</h4>
            <div className="space-y-2">
              {applicant.channels.map((channel) => (
                <div key={channel.id} className="flex items-center gap-2">
                  <Badge variant="outline">{channel.channelType}</Badge>
                  <a
                    href={channel.channelUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    {channel.channelName}
                  </a>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-slate-600 mb-2">각오 한마디</h4>
            <p className="text-slate-700 whitespace-pre-wrap">{applicant.applicationMessage}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-slate-600 mb-1">방문 예정일</h4>
              <p className="text-slate-900">{formatDate(applicant.visitDate)}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-slate-600 mb-1">지원 일시</h4>
              <p className="text-slate-900">{formatDate(applicant.appliedAt)}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

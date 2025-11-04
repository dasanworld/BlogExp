'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ApplicantItem } from '../types/advertiser-types';
import { ApplicantDetailDialog } from './ApplicantDetailDialog';
import { SelectionDialog } from './SelectionDialog';

interface ApplicantListProps {
  campaignId: string;
  applicants: ApplicantItem[];
  totalSlots: number;
  campaignStatus: 'recruiting' | 'closed' | 'selection_completed';
}

export const ApplicantList = ({
  campaignId,
  applicants,
  totalSlots,
  campaignStatus,
}: ApplicantListProps) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<ApplicantItem | null>(null);
  const [selectionDialogOpen, setSelectionDialogOpen] = useState(false);

  const handleRowClick = (applicant: ApplicantItem) => {
    setSelectedApplicant(applicant);
    setDetailDialogOpen(true);
  };

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

  if (applicants.length === 0) {
    return (
      <div className="bg-white p-8 rounded-lg border border-slate-200 text-center">
        <p className="text-slate-500">아직 지원자가 없습니다</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-slate-900">
            지원자 목록 ({applicants.length}명)
          </h3>
          {campaignStatus !== 'selection_completed' && (
            <Button
              onClick={() => setSelectionDialogOpen(true)}
              disabled={selectedIds.length === 0}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              선정하기 ({selectedIds.length}명)
            </Button>
          )}
        </div>

        <div className="bg-white rounded-lg border border-slate-200 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 border-b border-slate-200">
                <TableHead className="w-12 px-4 py-3">
                  {campaignStatus !== 'selection_completed' && (
                    <Checkbox
                      checked={selectedIds.length === applicants.length}
                      onCheckedChange={(checked) => {
                        setSelectedIds(
                          checked ? applicants.map((a) => a.applicationId) : []
                        );
                      }}
                    />
                  )}
                </TableHead>
                <TableHead className="px-4 py-3 text-slate-600 font-medium">이름</TableHead>
                <TableHead className="px-4 py-3 text-slate-600 font-medium">채널</TableHead>
                <TableHead className="px-4 py-3 text-slate-600 font-medium">방문 예정일</TableHead>
                <TableHead className="px-4 py-3 text-slate-600 font-medium">지원일</TableHead>
                <TableHead className="px-4 py-3 text-slate-600 font-medium">상태</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applicants.map((applicant) => (
                <TableRow
                  key={applicant.applicationId}
                  className="border-b border-slate-200 hover:bg-slate-50 cursor-pointer"
                  onClick={() => handleRowClick(applicant)}
                >
                  <TableCell className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    {campaignStatus !== 'selection_completed' && (
                      <Checkbox
                        checked={selectedIds.includes(applicant.applicationId)}
                        onCheckedChange={(checked) => {
                          setSelectedIds((prev) =>
                            checked
                              ? [...prev, applicant.applicationId]
                              : prev.filter((id) => id !== applicant.applicationId)
                          );
                        }}
                      />
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-slate-900 font-medium">
                    {applicant.applicantName}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {applicant.channels.map((ch) => (
                        <Badge key={ch.id} variant="outline" className="text-xs">
                          {ch.channelType}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-slate-700">
                    {formatDate(applicant.visitDate)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-slate-700">
                    {formatDate(applicant.appliedAt)}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(applicant.status)}`}
                    >
                      {getStatusLabel(applicant.status)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <ApplicantDetailDialog
        applicant={selectedApplicant}
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
      />

      <SelectionDialog
        campaignId={campaignId}
        selectedIds={selectedIds}
        totalSlots={totalSlots}
        open={selectionDialogOpen}
        onClose={() => setSelectionDialogOpen(false)}
        onSuccess={() => {
          setSelectedIds([]);
          setSelectionDialogOpen(false);
        }}
      />
    </>
  );
};

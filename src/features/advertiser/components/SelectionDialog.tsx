'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSelectApplicants } from '../hooks/useSelectApplicants';
import { useCloseCampaign } from '../hooks/useCloseCampaign';
import { useState } from 'react';

interface SelectionDialogProps {
  campaignId: string;
  selectedIds: string[];
  totalSlots: number;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const SelectionDialog = ({
  campaignId,
  selectedIds,
  totalSlots,
  open,
  onClose,
  onSuccess,
}: SelectionDialogProps) => {
  const selectApplicants = useSelectApplicants();
  const [showConfirm, setShowConfirm] = useState(false);

  const exceededSlots = selectedIds.length > totalSlots;

  const handleConfirm = async () => {
    try {
      await selectApplicants.mutateAsync({
        campaignId,
        selectedApplicationIds: selectedIds,
      });
      onSuccess();
      setShowConfirm(false);
    } catch (error: any) {
      alert(error.response?.data?.error?.message || '선정 처리 중 오류가 발생했습니다');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>선정 확인</DialogTitle>
        </DialogHeader>

        {!showConfirm ? (
          <div className="space-y-4">
            <p className="text-slate-700">
              <strong>{selectedIds.length}명</strong>을 선정하시겠습니까?
            </p>

            {exceededSlots && (
              <Alert variant="destructive">
                <AlertDescription>
                  모집 인원({totalSlots}명)을 초과했습니다. {selectedIds.length - totalSlots}명을 선택
                  해제해주세요.
                </AlertDescription>
              </Alert>
            )}

            <Alert>
              <AlertDescription>
                선정되지 않은 지원자는 자동으로 반려됩니다.
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-slate-700">정말로 진행하시겠습니까?</p>
            <Alert>
              <AlertDescription>
                이 작업은 되돌릴 수 없습니다.
              </AlertDescription>
            </Alert>
          </div>
        )}

        <DialogFooter className="gap-2">
          {!showConfirm ? (
            <>
              <Button variant="outline" onClick={onClose}>
                취소
              </Button>
              <Button
                onClick={() => setShowConfirm(true)}
                disabled={exceededSlots}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                다음
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setShowConfirm(false)}>
                뒤로
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={selectApplicants.isPending}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {selectApplicants.isPending ? '처리 중...' : '확인'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

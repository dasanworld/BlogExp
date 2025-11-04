'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCloseCampaign } from '../hooks/useCloseCampaign';

interface CloseCampaignDialogProps {
  campaignId: string;
  applicantCount: number;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CloseCampaignDialog = ({
  campaignId,
  applicantCount,
  open,
  onClose,
  onSuccess,
}: CloseCampaignDialogProps) => {
  const closeCampaign = useCloseCampaign();

  const handleConfirm = async () => {
    try {
      await closeCampaign.mutateAsync(campaignId);
      onSuccess();
      onClose();
    } catch (error: any) {
      alert(error.response?.data?.error?.message || '모집 종료 중 오류가 발생했습니다');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>모집 종료 확인</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-slate-700">모집을 종료하시겠습니까?</p>

          {applicantCount === 0 && (
            <Alert variant="destructive">
              <AlertDescription>
                현재 지원자가 없습니다. 그래도 진행하시겠습니까?
              </AlertDescription>
            </Alert>
          )}

          <Alert>
            <AlertDescription>
              종료 후에는 새로운 지원자가 추가로 지원할 수 없습니다.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={closeCampaign.isPending}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            {closeCampaign.isPending ? '처리 중...' : '종료'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Campaign } from '../types/advertiser-types';
import { CampaignForm } from './CampaignForm';

interface UpdateCampaignDialogProps {
  open: boolean;
  onClose: () => void;
  campaign: Campaign;
  onSuccess?: () => void;
}

export const UpdateCampaignDialog = ({ open, onClose, campaign, onSuccess }: UpdateCampaignDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>체험단 수정</DialogTitle>
        </DialogHeader>
        <CampaignForm
          initialData={campaign}
          onSuccess={() => {
            onSuccess?.();
            onClose();
          }}
        />
      </DialogContent>
    </Dialog>
  );
};



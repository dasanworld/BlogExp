'use client';

import { useState } from 'react';
import { CampaignForm } from './CampaignForm';

interface CreateCampaignDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateCampaignDialog = ({ isOpen, onClose }: CreateCampaignDialogProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900">신규 체험단 등록</h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 text-2xl"
          >
            ×
          </button>
        </div>

        <CampaignForm onSuccess={onClose} />
      </div>
    </div>
  );
};

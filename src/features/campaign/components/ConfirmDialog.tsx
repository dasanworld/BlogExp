'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CampaignDetailResponse } from '../types/campaign-types';
import { useCreateApplication } from '../hooks/useCreateApplication';

interface ConfirmDialogProps {
  isOpen: boolean;
  campaign: CampaignDetailResponse;
  formData: {
    applicationMessage: string;
    visitDate: string;
  };
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog = ({
  isOpen,
  campaign,
  formData,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  const [errorMessage, setErrorMessage] = useState<string>('');
  const { mutate: createApplication, isPending } = useCreateApplication();

  if (!isOpen) return null;

  const handleConfirm = () => {
    setErrorMessage('');
    createApplication(
      {
        campaignId: campaign.id,
        request: {
          applicationMessage: formData.applicationMessage,
          visitDate: formData.visitDate,
        },
      },
      {
        onSuccess: () => {
          onConfirm();
        },
        onError: (error) => {
          const errorMsg =
            error instanceof Error
              ? error.message
              : '지원 중 오류가 발생했습니다. 다시 시도해주세요.';
          setErrorMessage(errorMsg);
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            지원하시겠습니까?
          </h2>

          <div className="space-y-4 mb-6">
            <div className="rounded-lg bg-slate-50 p-4 space-y-3">
              <div>
                <p className="text-xs font-semibold text-slate-600">
                  체험단명
                </p>
                <p className="text-sm text-slate-900">{campaign.title}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-600">
                  업체
                </p>
                <p className="text-sm text-slate-900">
                  {campaign.advertiser.businessName}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-600">
                  방문 예정일
                </p>
                <p className="text-sm text-slate-900">
                  {new Date(formData.visitDate).toLocaleDateString('ko-KR')}
                </p>
              </div>
            </div>

            <div className="rounded-lg bg-blue-50 p-4 border border-blue-200">
              <p className="text-xs font-semibold text-blue-900 mb-2">
                각오 한마디
              </p>
              <p className="text-sm text-blue-800 whitespace-pre-wrap">
                {formData.applicationMessage}
              </p>
            </div>
          </div>

          {errorMessage && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 mb-4">
              <p className="text-sm text-red-800">{errorMessage}</p>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isPending}
              className="flex-1"
            >
              취소
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isPending}
              className="flex-1"
            >
              {isPending ? '지원 중...' : '확인'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

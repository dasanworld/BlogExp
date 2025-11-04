'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CampaignDetailResponse } from '../types/campaign-types';
import { ConfirmDialog } from './ConfirmDialog';

interface ApplicationFormProps {
  campaign: CampaignDetailResponse;
  onSuccess: () => void;
  onCancel: () => void;
}

interface FormData {
  applicationMessage: string;
  visitDate: string;
}

export const ApplicationForm = ({
  campaign,
  onSuccess,
  onCancel,
}: ApplicationFormProps) => {
  const [formData, setFormData] = useState<FormData>({
    applicationMessage: '',
    visitDate: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.applicationMessage) {
      newErrors.applicationMessage = '각오 한마디를 입력해주세요';
    } else if (formData.applicationMessage.length < 10) {
      newErrors.applicationMessage = '각오 한마디는 10자 이상이어야 합니다';
    } else if (formData.applicationMessage.length > 500) {
      newErrors.applicationMessage = '각오 한마디는 500자 이하여야 합니다';
    }

    if (!formData.visitDate) {
      newErrors.visitDate = '방문 예정일자를 선택해주세요';
    } else {
      const visitDate = new Date(formData.visitDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (visitDate < today) {
        newErrors.visitDate = '오늘 이후의 날짜를 선택해주세요';
      }

      const experienceStart = new Date(campaign.experienceStartDate);
      const experienceEnd = new Date(campaign.experienceEndDate);
      experienceEnd.setHours(23, 59, 59, 999);

      if (visitDate < experienceStart || visitDate > experienceEnd) {
        newErrors.visitDate = '체험 기간 내의 날짜를 선택해주세요';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setShowConfirmDialog(true);
    }
  };

  const getMinDate = (): string => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getMaxDate = (): string => {
    const end = new Date(campaign.experienceEndDate);
    const year = end.getFullYear();
    const month = String(end.getMonth() + 1).padStart(2, '0');
    const day = String(end.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>체험단 지원</CardTitle>
          <p className="text-sm text-slate-600 mt-2">{campaign.title}</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-lg bg-slate-50 p-4 space-y-3">
              <div>
                <p className="text-sm font-semibold text-slate-700">모집 기간</p>
                <p className="text-sm text-slate-600">
                  {new Date(campaign.recruitmentStartDate).toLocaleDateString(
                    'ko-KR'
                  )}{' '}
                  ~{' '}
                  {new Date(campaign.recruitmentEndDate).toLocaleDateString(
                    'ko-KR'
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">모집 인원</p>
                <p className="text-sm text-slate-600">
                  {campaign.applicantCount} / {campaign.totalSlots}명
                </p>
              </div>
            </div>

            <div>
              <label htmlFor="applicationMessage" className="block text-sm font-semibold text-slate-700 mb-2">
                각오 한마디
              </label>
              <textarea
                id="applicationMessage"
                name="applicationMessage"
                value={formData.applicationMessage}
                onChange={handleInputChange}
                placeholder="이 체험단에 참여하고 싶은 이유를 작성해주세요"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={5}
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-slate-500">
                  최소 10자, 최대 500자
                </p>
                <p className="text-xs text-slate-500">
                  {formData.applicationMessage.length}/500
                </p>
              </div>
              {errors.applicationMessage && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.applicationMessage}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="visitDate" className="block text-sm font-semibold text-slate-700 mb-2">
                방문 예정일자
              </label>
              <input
                id="visitDate"
                type="date"
                name="visitDate"
                value={formData.visitDate}
                onChange={handleInputChange}
                min={getMinDate()}
                max={getMaxDate()}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-slate-500 mt-1">
                체험 기간: {campaign.experienceStartDate} ~{' '}
                {campaign.experienceEndDate}
              </p>
              {errors.visitDate && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.visitDate}
                </p>
              )}
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1"
              >
                취소
              </Button>
              <Button type="submit" className="flex-1">
                지원하기
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <ConfirmDialog
        isOpen={showConfirmDialog}
        campaign={campaign}
        formData={formData}
        onConfirm={() => {
          setShowConfirmDialog(false);
          onSuccess();
        }}
        onCancel={() => setShowConfirmDialog(false)}
      />
    </>
  );
};

'use client';

import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateCampaignSchema } from '../backend/schema/campaign-schema';
import { CreateCampaignRequest, Campaign } from '../types/advertiser-types';
import { useCreateCampaign } from '../hooks/useCreateCampaign';
import { useUpdateCampaign } from '../hooks/useUpdateCampaign';

interface CampaignFormProps {
  initialData?: Campaign;
  onSuccess?: () => void;
}

export const CampaignForm = ({ initialData, onSuccess }: CampaignFormProps) => {
  const formatDatetimeLocal = (iso: string) => {
    // ISO -> yyyy-MM-ddTHH:mm
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const mi = pad(d.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
  };
  const createCampaign = useCreateCampaign();
  const updateCampaign = useUpdateCampaign();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateCampaignRequest>({
    resolver: zodResolver(CreateCampaignSchema) as any,
    defaultValues: initialData
      ? {
          title: initialData.title,
          description: initialData.description,
          benefits: initialData.benefits,
          mission: initialData.mission,
          location: initialData.location,
          imgLink: initialData.imgLink ?? '',
          recruitmentStartDate: formatDatetimeLocal(initialData.recruitmentStartDate),
          recruitmentEndDate: formatDatetimeLocal(initialData.recruitmentEndDate),
          experienceStartDate: initialData.experienceStartDate,
          experienceEndDate: initialData.experienceEndDate,
          totalSlots: initialData.totalSlots,
        }
      : {
          title: '',
          description: '',
          benefits: '',
          mission: '',
          location: '',
          imgLink: '',
          recruitmentStartDate: '',
          recruitmentEndDate: '',
          experienceStartDate: '',
          experienceEndDate: '',
          totalSlots: 5,
        },
  });

  const toIso = (v: string) => (v ? new Date(v).toISOString() : v);

  const onSubmit: SubmitHandler<CreateCampaignRequest> = async (data) => {
    try {
      const payload: CreateCampaignRequest = {
        ...data,
        imgLink: data.imgLink?.trim() ? data.imgLink.trim() : undefined,
        recruitmentStartDate: toIso(data.recruitmentStartDate) as any,
        recruitmentEndDate: toIso(data.recruitmentEndDate) as any,
      };
      if (initialData) {
        await updateCampaign.mutateAsync({
          id: initialData.id,
          data: payload,
        });
      } else {
        await createCampaign.mutateAsync(payload);
      }
      onSuccess?.();
    } catch {
    }
  };

  const isLoading = createCampaign.isPending || updateCampaign.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-900 mb-2">
          체험단 제목 *
        </label>
        <input
          {...register('title')}
          type="text"
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="체험단의 제목을 입력하세요"
        />
        {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-900 mb-2">
          대표 이미지 링크 (선택)
        </label>
        <input
          {...register('imgLink')}
          type="url"
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="https://example.com/image.jpg"
        />
        {errors as any && (errors as any).imgLink && (
          <p className="text-red-600 text-sm mt-1">{(errors as any).imgLink.message as string}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-900 mb-2">
          상세 설명 *
        </label>
        <textarea
          {...register('description')}
          rows={4}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="체험단의 상세 설명을 입력하세요"
        />
        {errors.description && (
          <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-900 mb-2">
          제공 혜택 *
        </label>
        <textarea
          {...register('benefits')}
          rows={3}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="제공하는 혜택을 입력하세요"
        />
        {errors.benefits && <p className="text-red-600 text-sm mt-1">{errors.benefits.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-900 mb-2">
          미션 *
        </label>
        <textarea
          {...register('mission')}
          rows={3}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="진행할 미션을 입력하세요"
        />
        {errors.mission && <p className="text-red-600 text-sm mt-1">{errors.mission.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-900 mb-2">
          위치 *
        </label>
        <input
          {...register('location')}
          type="text"
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="체험할 위치를 입력하세요"
        />
        {errors.location && <p className="text-red-600 text-sm mt-1">{errors.location.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-900 mb-2">
            모집 시작일 *
          </label>
          <input
            {...register('recruitmentStartDate')}
            type="datetime-local"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="YYYY-MM-DDTHH:MM"
            step={60}
          />
          {errors.recruitmentStartDate && (
            <p className="text-red-600 text-sm mt-1">{errors.recruitmentStartDate.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-900 mb-2">
            모집 종료일 *
          </label>
          <input
            {...register('recruitmentEndDate')}
            type="datetime-local"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="YYYY-MM-DDTHH:MM"
            step={60}
          />
          {errors.recruitmentEndDate && (
            <p className="text-red-600 text-sm mt-1">{errors.recruitmentEndDate.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-900 mb-2">
            체험 시작일 *
          </label>
          <input
            {...register('experienceStartDate')}
            type="date"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.experienceStartDate && (
            <p className="text-red-600 text-sm mt-1">{errors.experienceStartDate.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-900 mb-2">
            체험 종료일 *
          </label>
          <input
            {...register('experienceEndDate')}
            type="date"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.experienceEndDate && (
            <p className="text-red-600 text-sm mt-1">{errors.experienceEndDate.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-900 mb-2">
          모집 인원 *
        </label>
        <input
          {...register('totalSlots', { valueAsNumber: true })}
          type="number"
          min="1"
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="모집할 인원 수를 입력하세요"
        />
        {errors.totalSlots && (
          <p className="text-red-600 text-sm mt-1">{errors.totalSlots.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? '저장 중...' : initialData ? '수정하기' : '등록하기'}
      </button>
    </form>
  );
};

import { z } from 'zod';

const isDateTimeLocal = (v: string) => /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(v);

export const CreateCampaignSchema = z
  .object({
    title: z
      .string()
      .min(5, '제목은 5자 이상')
      .max(255, '제목은 255자 이하'),
    description: z
      .string()
      .min(10, '상세 설명은 10자 이상')
      .max(5000, '상세 설명은 5000자 이하'),
    benefits: z
      .string()
      .min(10, '혜택은 10자 이상')
      .max(2000, '혜택은 2000자 이하'),
    mission: z
      .string()
      .min(10, '미션은 10자 이상')
      .max(2000, '미션은 2000자 이하'),
    location: z
      .string()
      .min(5, '위치를 입력해주세요')
      .max(500, '위치는 500자 이하'),
    recruitmentStartDate: z
      .string()
      .refine((v) => isDateTimeLocal(v) || !Number.isNaN(Date.parse(v)), {
        message: '유효한 날짜/시간을 입력해주세요',
      })
      .refine((date) => new Date(date) >= new Date(), {
        message: '모집 시작일은 오늘 이후여야 합니다',
      }),
    recruitmentEndDate: z
      .string()
      .refine((v) => isDateTimeLocal(v) || !Number.isNaN(Date.parse(v)), {
        message: '유효한 날짜/시간을 입력해주세요',
      }),
    experienceStartDate: z.string().date(),
    experienceEndDate: z.string().date(),
    totalSlots: z
      .number()
      .int()
      .min(1, '모집 인원은 최소 1명 이상')
      .max(1000, '모집 인원은 최대 1000명'),
  })
  .refine(
    (data) => new Date(data.recruitmentEndDate) > new Date(data.recruitmentStartDate),
    {
      message: '모집 종료일은 모집 시작일 이후여야 합니다',
      path: ['recruitmentEndDate'],
    }
  )
  .refine(
    (data) => new Date(data.experienceEndDate) >= new Date(data.experienceStartDate),
    {
      message: '체험 종료일은 체험 시작일 이후여야 합니다',
      path: ['experienceEndDate'],
    }
  )
  .refine(
    (data) => new Date(data.experienceStartDate) >= new Date(data.recruitmentEndDate),
    {
      message: '체험 시작일은 모집 종료일 이후여야 합니다',
      path: ['experienceStartDate'],
    }
  );

export type CreateCampaignRequest = z.infer<typeof CreateCampaignSchema>;

export type UpdateCampaignRequest = Partial<CreateCampaignRequest>;

export const CampaignListQuerySchema = z.object({
  status: z.enum(['recruiting', 'closed', 'selection_completed']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type CampaignListQuery = z.infer<typeof CampaignListQuerySchema>;

export const CampaignResponseSchema = z.object({
  id: z.string().uuid(),
  advertiserId: z.string().uuid(),
  title: z.string(),
  description: z.string(),
  benefits: z.string(),
  mission: z.string(),
  location: z.string(),
  recruitmentStartDate: z.string(),
  recruitmentEndDate: z.string(),
  experienceStartDate: z.string(),
  experienceEndDate: z.string(),
  totalSlots: z.number().int(),
  selectedCount: z.number().int(),
  status: z.enum(['recruiting', 'closed', 'selection_completed']),
  applicantCount: z.number().int().default(0),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type CampaignResponse = z.infer<typeof CampaignResponseSchema>;

export const CampaignListResponseSchema = z.object({
  campaigns: z.array(CampaignResponseSchema),
  statusCounts: z.object({
    recruiting: z.number().int(),
    closed: z.number().int(),
    selection_completed: z.number().int(),
  }),
  total: z.number().int(),
  page: z.number().int(),
  limit: z.number().int(),
  hasMore: z.boolean(),
});

export type CampaignListResponse = z.infer<typeof CampaignListResponseSchema>;

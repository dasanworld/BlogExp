import { z } from 'zod';

export const CampaignDetailResponseSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string(),
  benefits: z.string(),
  mission: z.string(),
  location: z.string(),
  recruitmentStartDate: z.string(),
  recruitmentEndDate: z.string(),
  experienceStartDate: z.string(),
  experienceEndDate: z.string(),
  totalSlots: z.number().int().positive(),
  selectedCount: z.number().int().nonnegative(),
  applicantCount: z.number().int().nonnegative(),
  status: z.enum(['recruiting', 'closed', 'selection_completed']),
  daysLeft: z.number().int(),
  thumbnailUrl: z.string().nullable(),

  advertiser: z.object({
    businessName: z.string(),
    category: z.string(),
    location: z.string(),
  }),

  userApplicationStatus: z
    .enum(['not_applied', 'pending', 'selected', 'rejected'])
    .nullable(),
});

export type CampaignDetailResponse = z.infer<
  typeof CampaignDetailResponseSchema
>;

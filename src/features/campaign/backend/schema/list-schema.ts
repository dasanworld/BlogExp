import { z } from 'zod';

export const CampaignListQuerySchema = z.object({
  status: z.enum(['recruiting', 'closed', 'selection_completed']).optional().default('recruiting'),
  category: z.string().optional(),
  location: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.enum(['latest', 'deadline', 'popular']).default('latest'),
});

export type CampaignListQuery = z.infer<typeof CampaignListQuerySchema>;

export const CampaignCardSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  businessName: z.string(),
  category: z.string(),
  location: z.string(),
  recruitmentEndDate: z.string(),
  totalSlots: z.number().int().positive(),
  applicantCount: z.number().int().nonnegative(),
  daysLeft: z.number().int(),
  thumbnailUrl: z.string().nullable(),
});

export type CampaignCard = z.infer<typeof CampaignCardSchema>;

export const CampaignListResponseSchema = z.object({
  campaigns: z.array(CampaignCardSchema),
  total: z.number().int(),
  page: z.number().int(),
  hasMore: z.boolean(),
});

export type CampaignListResponse = z.infer<typeof CampaignListResponseSchema>;

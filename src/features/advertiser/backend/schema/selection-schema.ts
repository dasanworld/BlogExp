import { z } from 'zod';

export const CloseCampaignRequestSchema = z.object({
  campaignId: z.string().uuid(),
});

export type CloseCampaignRequest = z.infer<typeof CloseCampaignRequestSchema>;

export const SelectApplicantsRequestSchema = z.object({
  campaignId: z.string().uuid(),
  selectedApplicationIds: z.array(z.string().uuid()).min(1, '최소 1명 이상 선정해야 합니다'),
});

export type SelectApplicantsRequest = z.infer<typeof SelectApplicantsRequestSchema>;

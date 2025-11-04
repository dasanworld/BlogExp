import { z } from 'zod';

export const CampaignDetailForAdvertiserSchema = z.object({
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
  applicantCount: z.number().int(),
  status: z.enum(['recruiting', 'closed', 'selection_completed']),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type CampaignDetailForAdvertiser = z.infer<typeof CampaignDetailForAdvertiserSchema>;

export const ApplicantChannelSchema = z.object({
  id: z.string().uuid(),
  channelType: z.string(),
  channelName: z.string(),
  channelUrl: z.string(),
});

export type ApplicantChannel = z.infer<typeof ApplicantChannelSchema>;

export const ApplicantItemSchema = z.object({
  applicationId: z.string().uuid(),
  applicantId: z.string().uuid(),
  applicantName: z.string(),
  applicationMessage: z.string(),
  visitDate: z.string(),
  appliedAt: z.string(),
  status: z.enum(['pending', 'selected', 'rejected']),
  channels: z.array(ApplicantChannelSchema),
});

export type ApplicantItem = z.infer<typeof ApplicantItemSchema>;

export const ApplicantsResponseSchema = z.object({
  applicants: z.array(ApplicantItemSchema),
  total: z.number().int(),
});

export type ApplicantsResponse = z.infer<typeof ApplicantsResponseSchema>;

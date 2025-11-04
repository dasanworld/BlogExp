import { z } from 'zod';

export const MyApplicationsQuerySchema = z.object({
  status: z
    .enum(['pending', 'selected', 'rejected'])
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type MyApplicationsQuery = z.infer<
  typeof MyApplicationsQuerySchema
>;

export const MyApplicationItemSchema = z.object({
  applicationId: z.string().uuid(),
  status: z.enum(['pending', 'selected', 'rejected']),
  appliedAt: z.string(),
  visitDate: z.string(),
  applicationMessage: z.string(),
  campaign: z.object({
    id: z.string().uuid(),
    title: z.string(),
    businessName: z.string(),
    category: z.string(),
    location: z.string(),
    recruitmentStartDate: z.string(),
    recruitmentEndDate: z.string(),
    experienceStartDate: z.string(),
    experienceEndDate: z.string(),
    status: z.enum(['recruiting', 'closed', 'selection_completed']),
  }),
});

export type MyApplicationItem = z.infer<
  typeof MyApplicationItemSchema
>;

export const MyApplicationsStatusCountSchema = z.object({
  pending: z.number(),
  selected: z.number(),
  rejected: z.number(),
});

export type MyApplicationsStatusCount = z.infer<
  typeof MyApplicationsStatusCountSchema
>;

export const MyApplicationsResponseSchema = z.object({
  applications: z.array(MyApplicationItemSchema),
  statusCounts: MyApplicationsStatusCountSchema,
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  hasMore: z.boolean(),
});

export type MyApplicationsResponse = z.infer<
  typeof MyApplicationsResponseSchema
>;

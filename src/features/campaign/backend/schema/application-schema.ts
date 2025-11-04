import { z } from 'zod';

export const CreateApplicationRequestSchema = z.object({
  applicationMessage: z
    .string()
    .min(10, '각오 한마디는 10자 이상이어야 합니다')
    .max(500, '각오 한마디는 500자 이하여야 합니다'),
  visitDate: z.string().date('방문 예정일자는 유효한 날짜여야 합니다'),
});

export type CreateApplicationRequest = z.infer<
  typeof CreateApplicationRequestSchema
>;

export const CreateApplicationResponseSchema = z.object({
  applicationId: z.string().uuid(),
  campaignId: z.string().uuid(),
  status: z.enum(['pending', 'selected', 'rejected']),
  appliedAt: z.string().datetime(),
  message: z.string(),
});

export type CreateApplicationResponse = z.infer<
  typeof CreateApplicationResponseSchema
>;

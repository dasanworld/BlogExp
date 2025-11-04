import { z } from 'zod';

const birthDateSchema = z.string()
  .refine((date) => {
    const birthDate = new Date(date);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1 >= 14;
    }
    return age >= 14;
  }, '만 14세 이상만 등록 가능합니다');

export const ChannelType = z.enum([
  'instagram',
  'youtube',
  'blog',
  'tiktok',
  'facebook',
  'twitter',
  'naver',
  'threads',
]);

export type ChannelTypeEnum = z.infer<typeof ChannelType>;

export const ChannelInputSchema = z.object({
  channelType: ChannelType,
  channelName: z.string().min(1, '채널명을 입력해주세요').max(255),
  channelUrl: z.string().url('올바른 URL 형식이 아닙니다'),
});

export type ChannelInput = z.infer<typeof ChannelInputSchema>;

export const UpdateProfileRequestSchema = z.object({
  birthDate: birthDateSchema,
  channels: z.array(ChannelInputSchema).min(1, '최소 1개 이상의 채널을 등록해주세요'),
});

export type UpdateProfileRequest = z.infer<typeof UpdateProfileRequestSchema>;

export const ProfileResponseSchema = z.object({
  userId: z.string().uuid(),
  birthDate: z.string().nullable(),
  verificationStatus: z.enum(['pending', 'verified', 'failed']),
  channels: z.array(z.object({
    id: z.string().uuid(),
    channelType: ChannelType,
    channelName: z.string(),
    channelUrl: z.string().url(),
    status: z.enum(['pending', 'verified', 'failed']),
    createdAt: z.string(),
    updatedAt: z.string(),
  })),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type ProfileResponse = z.infer<typeof ProfileResponseSchema>;

export const GetProfileResponseSchema = ProfileResponseSchema;

export type GetProfileResponse = z.infer<typeof GetProfileResponseSchema>;

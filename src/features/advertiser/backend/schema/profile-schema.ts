import { z } from 'zod';

const businessNumberSchema = z.string()
  .regex(/^\d{10}$/, '사업자등록번호는 10자리 숫자입니다')
  .refine((value) => {
    const weights = [1, 3, 7, 1, 3, 7, 1, 3, 5];
    const nums = value.split('').map(Number);
    let sum = 0;
    
    for (let i = 0; i < 9; i++) {
      sum += nums[i] * weights[i];
    }
    
    sum += Math.floor((nums[8] * 5) / 10);
    const checkDigit = (10 - (sum % 10)) % 10;
    
    return checkDigit === nums[9];
  }, '유효하지 않은 사업자등록번호입니다');

export const Category = z.enum([
  'restaurant',
  'cafe',
  'beauty',
  'fashion',
  'entertainment',
  'other',
]);

export type CategoryEnum = z.infer<typeof Category>;

export const UpdateAdvertiserProfileRequestSchema = z.object({
  businessName: z.string().min(2, '업체명을 2자 이상 입력해주세요').max(255),
  location: z.string().min(5, '위치를 입력해주세요'),
  category: Category,
  businessRegistrationNumber: businessNumberSchema,
});

export type UpdateAdvertiserProfileRequest = z.infer<typeof UpdateAdvertiserProfileRequestSchema>;

export const AdvertiserProfileResponseSchema = z.object({
  userId: z.string().uuid(),
  businessName: z.string(),
  location: z.string(),
  category: Category,
  businessRegistrationNumber: z.string(),
  verificationStatus: z.enum(['pending', 'verified', 'failed']),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type AdvertiserProfileResponse = z.infer<typeof AdvertiserProfileResponseSchema>;

export const GetAdvertiserProfileResponseSchema = AdvertiserProfileResponseSchema;

export type GetAdvertiserProfileResponse = z.infer<typeof GetAdvertiserProfileResponseSchema>;

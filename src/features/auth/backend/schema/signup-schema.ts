import { z } from 'zod';

export const SignupRequestSchema = z.object({
  name: z.string()
    .min(2, '이름은 2자 이상이어야 합니다')
    .max(100, '이름은 100자 이하여야 합니다')
    .regex(/^[가-힣a-zA-Z\s]+$/, '이름은 한글 또는 영문만 가능합니다'),

  phone: z.string()
    .regex(/^010-?\d{4}-?\d{4}$/, '올바른 휴대폰 번호 형식이 아닙니다')
    .transform(val => val.replace(/-/g, '')),

  email: z.string()
    .email('올바른 이메일 형식이 아닙니다')
    .toLowerCase(),

  password: z.string()
    .min(8, '비밀번호는 8자 이상이어야 합니다')
    .regex(/^(?=.*[a-zA-Z])(?=.*\d)|(?=.*[a-zA-Z])(?=.*[!@#$%^&*])|(?=.*\d)(?=.*[!@#$%^&*])/, 
      '비밀번호는 영문, 숫자, 특수문자 중 2가지 이상 조합이어야 합니다'),

  role: z.enum(['advertiser', 'influencer'], {
    errorMap: () => ({ message: '역할을 선택해주세요' })
  }),

  consents: z.object({
    termsOfService: z.literal(true, {
      errorMap: () => ({ message: '서비스 이용약관에 동의해주세요' })
    }),
    privacyPolicy: z.literal(true, {
      errorMap: () => ({ message: '개인정보 처리방침에 동의해주세요' })
    }),
    marketing: z.boolean().optional().default(false),
  }),
});

export type SignupRequest = z.infer<typeof SignupRequestSchema>;

export const SignupResponseSchema = z.object({
  userId: z.string().uuid(),
  email: z.string().email(),
  role: z.enum(['advertiser', 'influencer']),
  emailVerificationRequired: z.boolean(),
  redirectUrl: z.string().optional(),
});

export type SignupResponse = z.infer<typeof SignupResponseSchema>;

export const EmailVerificationRequestSchema = z.object({
  token: z.string().min(1, '검증 토큰이 필요합니다'),
});

export type EmailVerificationRequest = z.infer<typeof EmailVerificationRequestSchema>;

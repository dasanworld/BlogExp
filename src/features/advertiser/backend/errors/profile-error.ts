export const advertiserProfileErrorCodes = {
  profileNotFound: 'PROFILE_NOT_FOUND',
  profileUpdateFailed: 'PROFILE_UPDATE_FAILED',
  businessNumberExists: 'BUSINESS_NUMBER_EXISTS',
  invalidBusinessNumber: 'INVALID_BUSINESS_NUMBER',
  businessNumberVerificationFailed: 'BUSINESS_NUMBER_VERIFICATION_FAILED',
  invalidInput: 'INVALID_INPUT',
  unauthorized: 'UNAUTHORIZED',
  internalError: 'INTERNAL_ERROR',
  rateLimitExceeded: 'RATE_LIMIT_EXCEEDED',
} as const;

export type AdvertiserProfileServiceError = typeof advertiserProfileErrorCodes[keyof typeof advertiserProfileErrorCodes];

export const signupErrorCodes = {
  invalidInput: 'INVALID_SIGNUP_INPUT',
  emailExists: 'EMAIL_ALREADY_EXISTS',
  phoneExists: 'PHONE_ALREADY_EXISTS',
  authCreationFailed: 'AUTH_ACCOUNT_CREATION_FAILED',
  emailVerificationFailed: 'EMAIL_VERIFICATION_FAILED',
  userCreationFailed: 'USER_CREATION_FAILED',
  profileCreationFailed: 'PROFILE_CREATION_FAILED',
  consentSaveFailed: 'CONSENT_SAVE_FAILED',
  rateLimitExceeded: 'RATE_LIMIT_EXCEEDED',
  internalError: 'INTERNAL_SERVER_ERROR',
} as const;

export type SignupErrorCode = typeof signupErrorCodes[keyof typeof signupErrorCodes];
export type SignupServiceError = SignupErrorCode;

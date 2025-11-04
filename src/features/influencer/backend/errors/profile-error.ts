export const profileErrorCodes = {
  profileNotFound: 'PROFILE_NOT_FOUND',
  profileUpdateFailed: 'PROFILE_UPDATE_FAILED',
  channelDeleteFailed: 'CHANNEL_DELETE_FAILED',
  channelInsertFailed: 'CHANNEL_INSERT_FAILED',
  channelNotFound: 'CHANNEL_NOT_FOUND',
  channelUpdateFailed: 'CHANNEL_UPDATE_FAILED',
  duplicateChannelUrl: 'DUPLICATE_CHANNEL_URL',
  invalidBirthDate: 'INVALID_BIRTH_DATE',
  ageRestriction: 'AGE_RESTRICTION',
  unauthorized: 'UNAUTHORIZED',
  invalidInput: 'INVALID_INPUT',
  internalError: 'INTERNAL_ERROR',
} as const;

export type ProfileServiceError = typeof profileErrorCodes[keyof typeof profileErrorCodes];

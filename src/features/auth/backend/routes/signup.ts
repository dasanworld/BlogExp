import type { Hono } from 'hono';
import {
  failure,
  respond,
  type ErrorResult,
} from '@/backend/http/response';
import {
  getLogger,
  getSupabase,
  type AppEnv,
} from '@/backend/hono/context';
import { SignupRequestSchema } from '../schema/signup-schema';
import { createUserAccount } from '../services/signup-service';
import { signupErrorCodes, type SignupServiceError } from '../errors/signup-error';

export const registerSignupRoutes = (app: Hono<AppEnv>) => {
  app.post('/auth/signup', async (c) => {
    const logger = getLogger(c);
    const supabase = getSupabase(c);

    let body;
    try {
      body = await c.req.json();
    } catch {
      return respond(
        c,
        failure(
          400,
          signupErrorCodes.invalidInput,
          '요청 형식이 올바르지 않습니다',
        ),
      );
    }

    const parsedBody = SignupRequestSchema.safeParse(body);

    if (!parsedBody.success) {
      return respond(
        c,
        failure(
          400,
          signupErrorCodes.invalidInput,
          '입력 데이터가 유효하지 않습니다',
          parsedBody.error.format(),
        ),
      );
    }

    const result = await createUserAccount(supabase, parsedBody.data);

    if (!result.ok) {
      const errorResult = result as ErrorResult<SignupServiceError, unknown>;

      if (errorResult.error.code === signupErrorCodes.internalError) {
        logger.error('Signup failed', errorResult.error);
      } else {
        logger.warn('Signup validation failed', errorResult.error.code);
      }
    } else {
      logger.info('User signed up successfully', { userId: result.data.userId });
    }

    return respond(c, result);
  });
};

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
  // Next.js [[...hono]]가 /api/* 경로로 위임하므로, 실제 라우트는 
  // '/api/...' 프리픽스를 포함해야 매칭됩니다.
  app.post('/api/auth/signup', async (c) => {
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
      // 모든 실패 케이스 로깅을 강화하여 원인 파악 용이하게
      logger.error('Signup failed', {
        code: errorResult.error.code,
        message: errorResult.error.message,
        details: errorResult.error.details,
      });
    } else {
      logger.info('User signed up successfully', { userId: result.data.userId });
    }

    return respond(c, result);
  });
};

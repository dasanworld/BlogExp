import type { Hono } from 'hono';
import { failure, respond } from '@/backend/http/response';
import { getLogger, getSupabase, type AppEnv } from '@/backend/hono/context';
import { UpdateProfileRequestSchema } from '../schema/profile-schema';
import { getInfluencerProfile, updateInfluencerProfile } from '../services/profile-service';
import { profileErrorCodes } from '../errors/profile-error';

export const registerProfileRoutes = (app: Hono<AppEnv>) => {
  app.get('/api/influencer/profile', async (c) => {
    const logger = getLogger(c);
    const supabase = getSupabase(c);
    const userId = c.req.header('x-user-id');

    if (!userId) {
      return respond(
        c,
        failure(401, profileErrorCodes.unauthorized, '인증이 필요합니다'),
      );
    }

    const result = await getInfluencerProfile(supabase, userId);
    return respond(c, result);
  });

  app.put('/api/influencer/profile', async (c) => {
    const logger = getLogger(c);
    const supabase = getSupabase(c);
    const userId = c.req.header('x-user-id');

    if (!userId) {
      return respond(
        c,
        failure(401, profileErrorCodes.unauthorized, '인증이 필요합니다'),
      );
    }

    let body;
    try {
      body = await c.req.json();
    } catch {
      return respond(
        c,
        failure(400, profileErrorCodes.invalidInput, '요청 형식이 올바르지 않습니다'),
      );
    }

    const parsedBody = UpdateProfileRequestSchema.safeParse(body);

    if (!parsedBody.success) {
      return respond(
        c,
        failure(
          400,
          profileErrorCodes.invalidInput,
          '입력 데이터가 유효하지 않습니다',
          parsedBody.error.format(),
        ),
      );
    }

    const result = await updateInfluencerProfile(supabase, userId, parsedBody.data);
    return respond(c, result);
  });
};

import type { Hono } from 'hono';
import { failure, respond } from '@/backend/http/response';
import { getLogger, getSupabase, type AppEnv } from '@/backend/hono/context';
import { UpdateAdvertiserProfileRequestSchema } from '../schema/profile-schema';
import { getAdvertiserProfile, updateAdvertiserProfile } from '../services/profile-service';
import { advertiserProfileErrorCodes } from '../errors/profile-error';

export const registerAdvertiserProfileRoutes = (app: Hono<AppEnv>) => {
  // 호환성을 위해 '/advertiser/profile'와 '/api/advertiser/profile' 모두 등록
  const paths = ['/advertiser/profile', '/api/advertiser/profile'] as const;

  paths.forEach((path) => {
    app.get(path, async (c) => {
    const logger = getLogger(c);
    const supabase = getSupabase(c);
    const userId = c.req.header('x-user-id');
    logger.info?.(`[AdvertiserProfile][GET] path=${path} userId=${userId ?? '-'} reqPath=${c.req.path}`);

    if (!userId) {
      return respond(
        c,
        failure(401, advertiserProfileErrorCodes.unauthorized, '인증이 필요합니다'),
      );
    }

    const result = await getAdvertiserProfile(supabase, userId);
    return respond(c, result);
    });

    app.put(path, async (c) => {
      const logger = getLogger(c);
      const supabase = getSupabase(c);
      const userId = c.req.header('x-user-id');
      logger.info?.(`[AdvertiserProfile][PUT] path=${path} userId=${userId ?? '-'} reqPath=${c.req.path}`);

      if (!userId) {
        return respond(
          c,
          failure(401, advertiserProfileErrorCodes.unauthorized, '인증이 필요합니다'),
        );
      }

      let body;
      try {
        body = await c.req.json();
      } catch {
        return respond(
          c,
          failure(400, advertiserProfileErrorCodes.invalidInput, '요청 형식이 올바르지 않습니다'),
        );
      }

      const parsedBody = UpdateAdvertiserProfileRequestSchema.safeParse(body);

      if (!parsedBody.success) {
        return respond(
          c,
          failure(
            400,
            advertiserProfileErrorCodes.invalidInput,
            '입력 데이터가 유효하지 않습니다',
            parsedBody.error.format(),
          ),
        );
      }

      const result = await updateAdvertiserProfile(supabase, userId, parsedBody.data);
      return respond(c, result);
    });
  });
};

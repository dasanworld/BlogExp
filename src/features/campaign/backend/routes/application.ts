import { Hono } from 'hono';
import { getSupabase, type AppEnv, getLogger } from '@/backend/hono/context';
import { failure, respond } from '@/backend/http/response';
import { createCampaignApplication } from '../services/application-service';
import {
  CreateApplicationRequestSchema,
  CreateApplicationResponseSchema,
} from '../schema/application-schema';

const router = new Hono<AppEnv>();

router.post('/api/campaigns/:id/apply', async (c) => {
  try {
    const campaignId = c.req.param('id');
    const logger = getLogger(c);

    if (!campaignId || campaignId.length === 0) {
      return respond(
        c,
        failure(400, 'BAD_REQUEST', '체험단 ID가 필요합니다')
      );
    }

    const userId = c.req.header('x-user-id');
    if (!userId) {
      return respond(
        c,
        failure(401, 'UNAUTHORIZED', '로그인이 필요합니다')
      );
    }

    const body = await c.req.json();

    const validatedRequest = CreateApplicationRequestSchema.safeParse(body);
    if (!validatedRequest.success) {
      return respond(
        c,
        failure(
          400,
          'VALIDATION_ERROR',
          '입력값이 올바르지 않습니다',
          validatedRequest.error.errors
        )
      );
    }

    const supabase = getSupabase(c);

    logger?.debug({
      message: 'createCampaignApplication',
      campaignId,
      userId,
    });

    const result = await createCampaignApplication(
      supabase,
      userId,
      campaignId,
      validatedRequest.data
    );

    if (!result.ok) {
      return respond(c, result);
    }

    const validated = CreateApplicationResponseSchema.safeParse(result.data);
    if (!validated.success) {
      return respond(
        c,
        failure(500, 'VALIDATION_ERROR', '응답 스키마 검증 실패')
      );
    }

    return respond(c, result);
  } catch (error) {
    const logger = getLogger(c);
    logger?.error({
      message: 'createCampaignApplication error',
      error: error instanceof Error ? error.message : String(error),
    });

    return respond(
      c,
      failure(500, 'INTERNAL_ERROR', '오류 발생')
    );
  }
});

export const registerCampaignApplicationRoutes = (app: Hono<AppEnv>) => {
  app.route('', router);
};

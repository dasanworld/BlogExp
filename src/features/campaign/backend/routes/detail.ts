import { Hono } from 'hono';
import { getSupabase, type AppEnv, getLogger } from '@/backend/hono/context';
import { failure, respond } from '@/backend/http/response';
import { getCampaignDetail } from '../services/detail-service';
import { CampaignDetailResponseSchema } from '../schema/detail-schema';

const router = new Hono<AppEnv>();

router.get('/api/campaigns/:id', async (c) => {
  try {
    const campaignId = c.req.param('id');
    const logger = getLogger(c);

    if (!campaignId || campaignId.length === 0) {
      return respond(
        c,
        failure(400, 'BAD_REQUEST', '체험단 ID가 필요합니다')
      );
    }

    const supabase = getSupabase(c);
    const userId = c.req.header('x-user-id') || undefined;

    logger?.debug({
      message: 'getCampaignDetail',
      campaignId,
    });

    const result = await getCampaignDetail(supabase, campaignId, userId);

    if (!result.ok) {
      return respond(c, result);
    }

    const validated = CampaignDetailResponseSchema.safeParse(result.data);
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
      message: 'getCampaignDetail error',
      error: error instanceof Error ? error.message : String(error),
    });

    return respond(
      c,
      failure(500, 'INTERNAL_ERROR', '오류 발생')
    );
  }
});

export const registerCampaignDetailRoutes = (app: Hono<AppEnv>) => {
  app.route('', router);
};

import type { Hono } from 'hono';
import { getSupabase, type AppEnv } from '@/backend/hono/context';
import { respond, failure, success } from '@/backend/http/response';
import { closeCampaign, selectApplicants } from '../services/selection-service';
import { SelectApplicantsRequestSchema } from '../schema/selection-schema';

const campaignErrorCodes = {
  unauthorized: 'UNAUTHORIZED',
  validationError: 'VALIDATION_ERROR',
  internalError: 'INTERNAL_ERROR',
};

export const registerCampaignActionRoutes = (app: Hono<AppEnv>) => {
  app.put('/api/advertiser/campaigns/:id/close', async (c) => {
    const userId = c.req.header('x-user-id');
    if (!userId) {
      return respond(c, failure(401, campaignErrorCodes.unauthorized, '로그인이 필요합니다'));
    }

    const campaignId = c.req.param('id');
    const supabase = getSupabase(c);
    const result = await closeCampaign(supabase, userId, campaignId);

    return respond(c, result);
  });

  app.post('/api/advertiser/campaigns/:id/select', async (c) => {
    const userId = c.req.header('x-user-id');
    if (!userId) {
      return respond(c, failure(401, campaignErrorCodes.unauthorized, '로그인이 필요합니다'));
    }

    try {
      const body = await c.req.json();
      const campaignId = c.req.param('id');

      const validatedBody = SelectApplicantsRequestSchema.safeParse({
        ...body,
        campaignId,
      });

      if (!validatedBody.success) {
        return respond(
          c,
          failure(400, campaignErrorCodes.validationError, '유효하지 않은 요청입니다', validatedBody.error.errors)
        );
      }

      const supabase = getSupabase(c);
      const result = await selectApplicants(supabase, userId, validatedBody.data);

      return respond(c, result);
    } catch (error) {
      return respond(c, failure(400, 'INVALID_JSON', 'JSON 파싱 실패', error));
    }
  });
};

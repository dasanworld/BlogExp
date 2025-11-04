import type { Hono } from 'hono';
import { getCampaigns } from '../services/list-service';
import { CampaignListQuerySchema, CampaignListResponseSchema } from '../schema/list-schema';
import { respond, failure, success } from '@/backend/http/response';
import { getSupabase, type AppEnv } from '@/backend/hono/context';

const campaignErrorCodes = {
  invalidQuery: 'INVALID_QUERY',
  fetchError: 'FETCH_ERROR',
  internalError: 'INTERNAL_ERROR',
};

export const registerCampaignListRoutes = (app: Hono<AppEnv>) => {
  app.get('/api/campaigns', async (c) => {
    const queryParams = {
      status: c.req.query('status'),
      category: c.req.query('category'),
      location: c.req.query('location'),
      page: c.req.query('page'),
      limit: c.req.query('limit'),
      sort: c.req.query('sort'),
    };

    const parseResult = CampaignListQuerySchema.safeParse(queryParams);
    if (!parseResult.success) {
      return respond(
        c,
        failure(
          400,
          campaignErrorCodes.invalidQuery,
          '잘못된 쿼리 파라미터입니다',
          parseResult.error.errors
        )
      );
    }

    const supabase = getSupabase(c);
    const result = await getCampaigns(supabase, parseResult.data);

    if (!result.ok) {
      return respond(c, result);
    }

    const validationResult = CampaignListResponseSchema.safeParse(result.data);
    if (!validationResult.success) {
      return respond(
        c,
        failure(
          500,
          campaignErrorCodes.internalError,
          '응답 데이터 검증 실패',
          validationResult.error.errors
        )
      );
    }

    return respond(c, success(validationResult.data, 200));
  });
};

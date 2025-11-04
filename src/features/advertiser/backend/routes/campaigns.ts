import type { Hono } from 'hono';
import { getSupabase, type AppEnv } from '@/backend/hono/context';
import { respond, failure, success } from '@/backend/http/response';
import {
  CreateCampaignSchema,
  CampaignListQuerySchema,
  CampaignListResponseSchema,
  CampaignResponseSchema,
} from '../schema/campaign-schema';
import {
  createCampaign,
  getMyCampaigns,
  getCampaignById,
  updateCampaign,
  deleteCampaign,
} from '../services/campaign-service';

const campaignErrorCodes = {
  notAdvertiser: 'NOT_ADVERTISER',
  notVerified: 'NOT_VERIFIED',
  createFailed: 'CREATE_FAILED',
  fetchFailed: 'FETCH_FAILED',
  notFound: 'NOT_FOUND',
  forbidden: 'FORBIDDEN',
  cannotDelete: 'CANNOT_DELETE',
  deleteFailed: 'DELETE_FAILED',
  updateFailed: 'UPDATE_FAILED',
  internalError: 'INTERNAL_ERROR',
};

export const registerAdvertiserCampaignRoutes = (app: Hono<AppEnv>) => {
  app.get('/api/advertiser/campaigns', async (c) => {
    const userId = c.req.header('x-user-id');
    if (!userId) {
      return respond(c, failure(401, 'UNAUTHORIZED', '로그인이 필요합니다'));
    }

    const query = {
      status: c.req.query('status'),
      page: c.req.query('page'),
      limit: c.req.query('limit'),
    };

    const validatedQuery = CampaignListQuerySchema.safeParse(query);
    if (!validatedQuery.success) {
      return respond(
        c,
        failure(400, 'VALIDATION_ERROR', '유효하지 않은 요청입니다', validatedQuery.error.errors)
      );
    }

    const supabase = getSupabase(c);
    const result = await getMyCampaigns(supabase, userId, validatedQuery.data);

    if (result.ok) {
      const validated = CampaignListResponseSchema.safeParse(result.data);
      if (!validated.success) {
        return respond(
          c,
          failure(500, 'RESPONSE_ERROR', '응답 검증 실패', validated.error.errors)
        );
      }
      return respond(c, success(validated.data, 200));
    }

    return respond(c, result);
  });

  app.get('/api/advertiser/campaigns/:id', async (c) => {
    const userId = c.req.header('x-user-id');
    if (!userId) {
      return respond(c, failure(401, 'UNAUTHORIZED', '로그인이 필요합니다'));
    }

    const campaignId = c.req.param('id');
    const supabase = getSupabase(c);
    const result = await getCampaignById(supabase, userId, campaignId);

    if (result.ok) {
      const validated = CampaignResponseSchema.safeParse(result.data);
      if (!validated.success) {
        return respond(
          c,
          failure(500, 'RESPONSE_ERROR', '응답 검증 실패', validated.error.errors)
        );
      }
      return respond(c, success(validated.data, 200));
    }

    return respond(c, result);
  });

  app.post('/api/advertiser/campaigns', async (c) => {
    const userId = c.req.header('x-user-id');
    if (!userId) {
      return respond(c, failure(401, 'UNAUTHORIZED', '로그인이 필요합니다'));
    }

    try {
      const body = await c.req.json();
      const validatedBody = CreateCampaignSchema.safeParse(body);

      if (!validatedBody.success) {
        return respond(
          c,
          failure(400, 'VALIDATION_ERROR', '유효하지 않은 요청입니다', validatedBody.error.errors)
        );
      }

      const supabase = getSupabase(c);
      const result = await createCampaign(supabase, userId, validatedBody.data);

      if (result.ok) {
        const validated = CampaignResponseSchema.safeParse(result.data);
        if (!validated.success) {
          return respond(
            c,
            failure(500, 'RESPONSE_ERROR', '응답 검증 실패', validated.error.errors)
          );
        }
        return respond(c, success(validated.data, result.status));
      }

      return respond(c, result);
    } catch (error) {
      return respond(c, failure(400, 'INVALID_JSON', 'JSON 파싱 실패', error));
    }
  });

  app.put('/api/advertiser/campaigns/:id', async (c) => {
    const userId = c.req.header('x-user-id');
    if (!userId) {
      return respond(c, failure(401, 'UNAUTHORIZED', '로그인이 필요합니다'));
    }

    try {
      const campaignId = c.req.param('id');
      const body = await c.req.json();
      const validatedBody = CreateCampaignSchema.safeParse(body);

      if (!validatedBody.success) {
        return respond(
          c,
          failure(400, 'VALIDATION_ERROR', '유효하지 않은 요청입니다', validatedBody.error.errors)
        );
      }

      const supabase = getSupabase(c);
      const result = await updateCampaign(supabase, userId, campaignId, validatedBody.data);

      if (result.ok) {
        const validated = CampaignResponseSchema.safeParse(result.data);
        if (!validated.success) {
          return respond(
            c,
            failure(500, 'RESPONSE_ERROR', '응답 검증 실패', validated.error.errors)
          );
        }
        return respond(c, success(validated.data, 200));
      }

      return respond(c, result);
    } catch (error) {
      return respond(c, failure(400, 'INVALID_JSON', 'JSON 파싱 실패', error));
    }
  });

  app.delete('/api/advertiser/campaigns/:id', async (c) => {
    const userId = c.req.header('x-user-id');
    if (!userId) {
      return respond(c, failure(401, 'UNAUTHORIZED', '로그인이 필요합니다'));
    }

    const campaignId = c.req.param('id');
    const supabase = getSupabase(c);
    const result = await deleteCampaign(supabase, userId, campaignId);

    return respond(c, result);
  });
};

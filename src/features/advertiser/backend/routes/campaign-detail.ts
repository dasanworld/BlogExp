import type { Hono } from 'hono';
import { getSupabase, type AppEnv } from '@/backend/hono/context';
import { respond, failure, success } from '@/backend/http/response';
import { getCampaignDetail } from '../services/campaign-detail-service';
import { getApplicants } from '../services/applicant-service';
import { CampaignDetailForAdvertiserSchema } from '../schema/campaign-detail-schema';
import { ApplicantsResponseSchema } from '../schema/campaign-detail-schema';

const campaignErrorCodes = {
  unauthorized: 'UNAUTHORIZED',
  notFound: 'NOT_FOUND',
  forbidden: 'FORBIDDEN',
  fetchFailed: 'FETCH_FAILED',
  internalError: 'INTERNAL_ERROR',
};

export const registerCampaignDetailRoutes = (app: Hono<AppEnv>) => {
  app.get('/api/advertiser/campaigns/:id/detail', async (c) => {
    const userId = c.req.header('x-user-id');
    if (!userId) {
      return respond(c, failure(401, campaignErrorCodes.unauthorized, '로그인이 필요합니다'));
    }

    const campaignId = c.req.param('id');
    const supabase = getSupabase(c);
    const result = await getCampaignDetail(supabase, userId, campaignId);

    if (result.ok) {
      const validated = CampaignDetailForAdvertiserSchema.safeParse(result.data);
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

  app.get('/api/advertiser/campaigns/:id/applicants', async (c) => {
    const userId = c.req.header('x-user-id');
    if (!userId) {
      return respond(c, failure(401, campaignErrorCodes.unauthorized, '로그인이 필요합니다'));
    }

    const campaignId = c.req.param('id');
    const supabase = getSupabase(c);
    const result = await getApplicants(supabase, userId, campaignId);

    if (result.ok) {
      const validated = ApplicantsResponseSchema.safeParse(result.data);
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
};

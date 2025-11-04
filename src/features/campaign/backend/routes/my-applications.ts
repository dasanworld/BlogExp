import { Hono } from 'hono';
import { getSupabase, type AppEnv, getLogger } from '@/backend/hono/context';
import { failure, respond } from '@/backend/http/response';
import { getMyApplications } from '../services/my-applications-service';
import {
  MyApplicationsQuerySchema,
  MyApplicationsResponseSchema,
} from '../schema/my-applications-schema';

const router = new Hono<AppEnv>();

router.get('/api/my/applications', async (c) => {
  try {
    const logger = getLogger(c);

    const userId = c.req.header('x-user-id');
    if (!userId) {
      return respond(
        c,
        failure(401, 'UNAUTHORIZED', '로그인이 필요합니다')
      );
    }

    const query = {
      status: c.req.query('status'),
      page: c.req.query('page'),
      limit: c.req.query('limit'),
    };

    const validatedQuery = MyApplicationsQuerySchema.safeParse(query);
    if (!validatedQuery.success) {
      return respond(
        c,
        failure(
          400,
          'VALIDATION_ERROR',
          '쿼리 파라미터가 올바르지 않습니다',
          validatedQuery.error.errors
        )
      );
    }

    const supabase = getSupabase(c);

    logger?.debug({
      message: 'getMyApplications',
      userId,
      query: validatedQuery.data,
    });

    const result = await getMyApplications(
      supabase,
      userId,
      validatedQuery.data
    );

    if (!result.ok) {
      return respond(c, result);
    }

    const validated = MyApplicationsResponseSchema.safeParse(result.data);
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
      message: 'getMyApplications error',
      error: error instanceof Error ? error.message : String(error),
    });

    return respond(
      c,
      failure(500, 'INTERNAL_ERROR', '내 지원 목록 조회 중 오류가 발생했습니다')
    );
  }
});

export const registerMyApplicationsRoutes = (app: Hono<AppEnv>) => {
  app.route('', router);
};

import type { Hono } from 'hono';
import { failure, respond } from '@/backend/http/response';
import { getLogger, getSupabase, type AppEnv } from '@/backend/hono/context';
import { ChannelInputSchema } from '../schema/profile-schema';
import {
  getChannels,
  addChannel,
  updateChannel,
  deleteChannel,
} from '../services/channel-service';
import { profileErrorCodes } from '../errors/profile-error';

export const registerChannelRoutes = (app: Hono<AppEnv>) => {
  app.get('/influencer/channels', async (c) => {
    const logger = getLogger(c);
    const supabase = getSupabase(c);
    const userId = c.req.header('x-user-id');

    if (!userId) {
      return respond(
        c,
        failure(401, profileErrorCodes.unauthorized, '인증이 필요합니다'),
      );
    }

    const result = await getChannels(supabase, userId);
    return respond(c, result);
  });

  app.post('/influencer/channels', async (c) => {
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

    const parsedBody = ChannelInputSchema.safeParse(body);

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

    const result = await addChannel(
      supabase,
      userId,
      parsedBody.data.channelType,
      parsedBody.data.channelName,
      parsedBody.data.channelUrl,
    );
    return respond(c, result);
  });

  app.put('/influencer/channels/:id', async (c) => {
    const logger = getLogger(c);
    const supabase = getSupabase(c);
    const userId = c.req.header('x-user-id');
    const channelId = c.req.param('id');

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

    const parsedBody = ChannelInputSchema.safeParse(body);

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

    const result = await updateChannel(
      supabase,
      userId,
      channelId,
      parsedBody.data.channelType,
      parsedBody.data.channelName,
      parsedBody.data.channelUrl,
    );
    return respond(c, result);
  });

  app.delete('/influencer/channels/:id', async (c) => {
    const logger = getLogger(c);
    const supabase = getSupabase(c);
    const userId = c.req.header('x-user-id');
    const channelId = c.req.param('id');

    if (!userId) {
      return respond(
        c,
        failure(401, profileErrorCodes.unauthorized, '인증이 필요합니다'),
      );
    }

    const result = await deleteChannel(supabase, userId, channelId);
    return respond(c, result);
  });
};

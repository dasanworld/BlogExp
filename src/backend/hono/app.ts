import { Hono } from "hono";
import { errorBoundary } from "@/backend/middleware/error";
import { withAppContext } from "@/backend/middleware/context";
import { withSupabase } from "@/backend/middleware/supabase";
import { registerExampleRoutes } from "@/features/example/backend/route";
import { registerSignupRoutes } from "@/features/auth/backend/routes/signup";
import { registerProfileRoutes } from "@/features/influencer/backend/routes/profile";
import { registerChannelRoutes } from "@/features/influencer/backend/routes/channels";
import { registerAdvertiserProfileRoutes } from "@/features/advertiser/backend/routes/profile";
import { registerCampaignListRoutes } from "@/features/campaign/backend/routes/list";
import { registerCampaignDetailRoutes } from "@/features/campaign/backend/routes/detail";
import { registerCampaignApplicationRoutes } from "@/features/campaign/backend/routes/application";
import { registerMyApplicationsRoutes } from "@/features/campaign/backend/routes/my-applications";
import { registerAdvertiserCampaignRoutes } from "@/features/advertiser/backend/routes/campaigns";
import { registerCampaignDetailRoutes as registerAdvertiserCampaignDetailRoutes } from "@/features/advertiser/backend/routes/campaign-detail";
import { registerCampaignActionRoutes } from "@/features/advertiser/backend/routes/campaign-actions";
import type { AppEnv } from "@/backend/hono/context";

let singletonApp: Hono<AppEnv> | null = null;

export const createHonoApp = () => {
  if (singletonApp && process.env.NODE_ENV === "production") {
    return singletonApp;
  }

  const app = new Hono<AppEnv>();

  app.use("*", errorBoundary());
  app.use("*", withAppContext());
  app.use("*", withSupabase());

  // DEBUG: 요청 로깅 (개발 중 라우팅 문제 추적용)
  app.use("*", async (c, next) => {
    try {
      const xuid = c.req.header("x-user-id");
      console.info(`[API] ${c.req.method} ${c.req.path} x-user-id=${xuid ?? "-"}`);
    } catch {}
    await next();
  });

  registerExampleRoutes(app);
  registerSignupRoutes(app);
  registerProfileRoutes(app);
  registerChannelRoutes(app);
  registerAdvertiserProfileRoutes(app);
  registerCampaignListRoutes(app);
  registerCampaignDetailRoutes(app);
  registerCampaignApplicationRoutes(app);
  registerMyApplicationsRoutes(app);
  registerAdvertiserCampaignRoutes(app);
  registerAdvertiserCampaignDetailRoutes(app);
  registerCampaignActionRoutes(app);

  // DEBUG 헬스체크
  app.get("/api/__debug/ping", (c) => c.json({ ok: true }));

  app.notFound((c) => {
    return c.json(
      {
        error: {
          code: "NOT_FOUND",
          message: `Route not found: ${c.req.method} ${c.req.path}`,
        },
      },
      404
    );
  });

  if (process.env.NODE_ENV === "production") {
    singletonApp = app;
  }

  return app;
};

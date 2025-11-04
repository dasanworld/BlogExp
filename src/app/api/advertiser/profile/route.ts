import { handle } from 'hono/vercel';
import { createHonoApp } from '@/backend/hono/app';

const app = createHonoApp();

export const GET = handle(app);
export const PUT = handle(app);
export const OPTIONS = handle(app);

export const runtime = 'nodejs';



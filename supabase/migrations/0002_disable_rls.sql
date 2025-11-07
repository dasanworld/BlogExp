-- Disable Row Level Security for application tables
-- Note: This removes all RLS protections. Use only if your environment is secured otherwise.

-- users
ALTER TABLE IF EXISTS public.users NO FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.users DISABLE ROW LEVEL SECURITY;

-- advertiser_profiles
ALTER TABLE IF EXISTS public.advertiser_profiles NO FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.advertiser_profiles DISABLE ROW LEVEL SECURITY;

-- influencer_profiles
ALTER TABLE IF EXISTS public.influencer_profiles NO FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.influencer_profiles DISABLE ROW LEVEL SECURITY;

-- influencer_channels
ALTER TABLE IF EXISTS public.influencer_channels NO FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.influencer_channels DISABLE ROW LEVEL SECURITY;

-- campaigns
ALTER TABLE IF EXISTS public.campaigns NO FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.campaigns DISABLE ROW LEVEL SECURITY;

-- campaign_applications
ALTER TABLE IF EXISTS public.campaign_applications NO FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.campaign_applications DISABLE ROW LEVEL SECURITY;

-- user_consents
ALTER TABLE IF EXISTS public.user_consents NO FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_consents DISABLE ROW LEVEL SECURITY;

-- Optional: drop policies if any exist (keeps schema clean)
-- DO AT YOUR OWN RISK if you plan to re-enable RLS later.
-- Example:
-- DO $$
-- DECLARE r record;
-- BEGIN
--   FOR r IN SELECT polname FROM pg_policies WHERE schemaname='public' AND tablename='users' LOOP
--     EXECUTE format('DROP POLICY IF EXISTS %I ON public.users', r.polname);
--   END LOOP;
-- END$$;




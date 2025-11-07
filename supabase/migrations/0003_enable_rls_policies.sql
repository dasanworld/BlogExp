-- OPTIONAL TEMPLATE: Re-enable RLS with minimal policies
-- Note: This file is a template for later hardening. Do NOT apply while 0002_disable_rls.sql is active.

-- USERS
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;
-- Anyone authenticated can read own row; inserts allowed for backend API (service role bypasses RLS)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='users' AND polname='users_select_own'
  ) THEN
    CREATE POLICY users_select_own ON public.users
      FOR SELECT TO authenticated
      USING (id::text = auth.uid()::text);
  END IF;
END $$;

-- ADVERTISER PROFILES
ALTER TABLE IF EXISTS public.advertiser_profiles ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='advertiser_profiles' AND polname='adv_select_own'
  ) THEN
    CREATE POLICY adv_select_own ON public.advertiser_profiles
      FOR SELECT TO authenticated
      USING (user_id::text = auth.uid()::text);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='advertiser_profiles' AND polname='adv_upsert_own'
  ) THEN
    CREATE POLICY adv_upsert_own ON public.advertiser_profiles
      FOR INSERT TO authenticated
      WITH CHECK (user_id::text = auth.uid()::text);
    CREATE POLICY adv_update_own ON public.advertiser_profiles
      FOR UPDATE TO authenticated
      USING (user_id::text = auth.uid()::text)
      WITH CHECK (user_id::text = auth.uid()::text);
  END IF;
END $$;

-- INFLUENCER PROFILES
ALTER TABLE IF EXISTS public.influencer_profiles ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='influencer_profiles' AND polname='inf_select_own'
  ) THEN
    CREATE POLICY inf_select_own ON public.influencer_profiles
      FOR SELECT TO authenticated
      USING (user_id::text = auth.uid()::text);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='influencer_profiles' AND polname='inf_upsert_own'
  ) THEN
    CREATE POLICY inf_upsert_own ON public.influencer_profiles
      FOR INSERT TO authenticated
      WITH CHECK (user_id::text = auth.uid()::text);
    CREATE POLICY inf_update_own ON public.influencer_profiles
      FOR UPDATE TO authenticated
      USING (user_id::text = auth.uid()::text)
      WITH CHECK (user_id::text = auth.uid()::text);
  END IF;
END $$;

-- INFLUENCER CHANNELS
ALTER TABLE IF EXISTS public.influencer_channels ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='influencer_channels' AND polname='chan_select_own'
  ) THEN
    CREATE POLICY chan_select_own ON public.influencer_channels
      FOR SELECT TO authenticated
      USING (user_id::text = auth.uid()::text);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='influencer_channels' AND polname='chan_upsert_own'
  ) THEN
    CREATE POLICY chan_upsert_own ON public.influencer_channels
      FOR INSERT TO authenticated
      WITH CHECK (user_id::text = auth.uid()::text);
    CREATE POLICY chan_update_own ON public.influencer_channels
      FOR UPDATE TO authenticated
      USING (user_id::text = auth.uid()::text)
      WITH CHECK (user_id::text = auth.uid()::text);
  END IF;
END $$;

-- CAMPAIGNS
ALTER TABLE IF EXISTS public.campaigns ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='campaigns' AND polname='camp_select_public'
  ) THEN
    CREATE POLICY camp_select_public ON public.campaigns
      FOR SELECT TO anon, authenticated
      USING (true);
  END IF;
END $$;

-- CAMPAIGN APPLICATIONS
ALTER TABLE IF EXISTS public.campaign_applications ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='campaign_applications' AND polname='apps_select_own'
  ) THEN
    CREATE POLICY apps_select_own ON public.campaign_applications
      FOR SELECT TO authenticated
      USING (user_id::text = auth.uid()::text);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='campaign_applications' AND polname='apps_insert_own'
  ) THEN
    CREATE POLICY apps_insert_own ON public.campaign_applications
      FOR INSERT TO authenticated
      WITH CHECK (user_id::text = auth.uid()::text);
  END IF;
END $$;

-- USER CONSENTS
ALTER TABLE IF EXISTS public.user_consents ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_consents' AND polname='consents_select_own'
  ) THEN
    CREATE POLICY consents_select_own ON public.user_consents
      FOR SELECT TO authenticated
      USING (user_id::text = auth.uid()::text);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_consents' AND polname='consents_insert_own'
  ) THEN
    CREATE POLICY consents_insert_own ON public.user_consents
      FOR INSERT TO authenticated
      WITH CHECK (user_id::text = auth.uid()::text);
  END IF;
END $$;




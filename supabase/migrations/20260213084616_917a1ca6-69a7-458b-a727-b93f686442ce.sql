
-- Add privacy toggle fields to profiles
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS show_name boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_contacts boolean NOT NULL DEFAULT true;

-- Create profile_views table (logs which club user viewed which profile)
CREATE TABLE public.profile_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  viewer_user_id uuid NOT NULL,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  viewed_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;

-- Viewers can see their own view history
CREATE POLICY "Users can view own view history"
  ON public.profile_views FOR SELECT
  USING (auth.uid() = viewer_user_id OR has_role('admin'::app_role));

-- Employers can insert views
CREATE POLICY "Employers can log views"
  ON public.profile_views FOR INSERT
  WITH CHECK (auth.uid() = viewer_user_id AND has_role('employer'::app_role));

-- Admins can manage
CREATE POLICY "Admins manage profile_views"
  ON public.profile_views FOR ALL
  USING (has_role('admin'::app_role))
  WITH CHECK (has_role('admin'::app_role));

-- Profile owners can see who viewed them
CREATE POLICY "Profile owners can see their views"
  ON public.profile_views FOR SELECT
  USING (is_profile_owner(profile_id));

-- Create club_access table (quotas for employer users)
CREATE TABLE public.club_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  free_views_remaining integer NOT NULL DEFAULT 30,
  free_views_per_week integer NOT NULL DEFAULT 10,
  trial_expires_at timestamptz NOT NULL DEFAULT (now() + interval '14 days'),
  is_subscribed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.club_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own access"
  ON public.club_access FOR SELECT
  USING (auth.uid() = user_id OR has_role('admin'::app_role));

CREATE POLICY "Users can update own access"
  ON public.club_access FOR UPDATE
  USING (auth.uid() = user_id OR has_role('admin'::app_role))
  WITH CHECK (auth.uid() = user_id OR has_role('admin'::app_role));

CREATE POLICY "System can insert access"
  ON public.club_access FOR INSERT
  WITH CHECK (auth.uid() = user_id OR has_role('admin'::app_role));

CREATE POLICY "Admins manage club_access"
  ON public.club_access FOR ALL
  USING (has_role('admin'::app_role))
  WITH CHECK (has_role('admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_club_access_updated_at
  BEFORE UPDATE ON public.club_access
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create club_access when employer role is assigned
CREATE OR REPLACE FUNCTION public.auto_create_club_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.role = 'employer' THEN
    INSERT INTO public.club_access (user_id)
    VALUES (NEW.user_id)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_employer_role_create_access
  AFTER INSERT ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_create_club_access();

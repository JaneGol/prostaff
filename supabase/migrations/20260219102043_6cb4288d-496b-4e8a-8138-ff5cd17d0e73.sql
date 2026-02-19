-- Restrict direct SELECT on profiles to owner and admin only.
-- Public access now goes through the get-profile edge function (uses service role).
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (
    (auth.uid() = user_id) 
    OR has_role('admin'::app_role)
  );

-- Similarly restrict related tables: remove is_profile_public from SELECT policies
-- so that public users can't directly query these tables.
-- The edge function fetches with service role key.

DROP POLICY IF EXISTS "View experiences" ON public.experiences;
CREATE POLICY "View experiences"
  ON public.experiences
  FOR SELECT
  USING (
    is_profile_owner(profile_id) 
    OR has_role('admin'::app_role)
  );

DROP POLICY IF EXISTS "View profile skills" ON public.profile_skills;
CREATE POLICY "View profile skills"
  ON public.profile_skills
  FOR SELECT
  USING (
    is_profile_owner(profile_id) 
    OR has_role('admin'::app_role)
  );

DROP POLICY IF EXISTS "View sport experience" ON public.profile_sports_experience;
CREATE POLICY "View sport experience"
  ON public.profile_sports_experience
  FOR SELECT
  USING (
    is_profile_owner(profile_id) 
    OR has_role('admin'::app_role)
  );

DROP POLICY IF EXISTS "View open-to sports" ON public.profile_sports_open_to;
CREATE POLICY "View open-to sports"
  ON public.profile_sports_open_to
  FOR SELECT
  USING (
    is_profile_owner(profile_id) 
    OR has_role('admin'::app_role)
  );

DROP POLICY IF EXISTS "View education" ON public.candidate_education;
CREATE POLICY "View education"
  ON public.candidate_education
  FOR SELECT
  USING (
    is_profile_owner(profile_id) 
    OR has_role('admin'::app_role)
  );

DROP POLICY IF EXISTS "View certificates" ON public.candidate_certificates;
CREATE POLICY "View certificates"
  ON public.candidate_certificates
  FOR SELECT
  USING (
    is_profile_owner(profile_id) 
    OR has_role('admin'::app_role)
  );

DROP POLICY IF EXISTS "View portfolio" ON public.candidate_portfolio;
CREATE POLICY "View portfolio"
  ON public.candidate_portfolio
  FOR SELECT
  USING (
    is_profile_owner(profile_id) 
    OR has_role('admin'::app_role)
  );
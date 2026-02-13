
-- 1. Add secondary_role_id to profiles
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS secondary_role_id uuid REFERENCES public.specialist_roles(id),
  ADD COLUMN IF NOT EXISTS hide_current_org boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS visibility_level text NOT NULL DEFAULT 'public_preview',
  ADD COLUMN IF NOT EXISTS about_useful text,
  ADD COLUMN IF NOT EXISTS about_style text,
  ADD COLUMN IF NOT EXISTS about_goals text,
  ADD COLUMN IF NOT EXISTS desired_role_ids uuid[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS desired_contract_type text,
  ADD COLUMN IF NOT EXISTS desired_city text,
  ADD COLUMN IF NOT EXISTS desired_country text;

-- 2. Role relations (compatibility matrix)
CREATE TABLE IF NOT EXISTS public.role_relations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  primary_role_id uuid NOT NULL REFERENCES public.specialist_roles(id) ON DELETE CASCADE,
  secondary_role_id uuid NOT NULL REFERENCES public.specialist_roles(id) ON DELETE CASCADE,
  is_allowed boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(primary_role_id, secondary_role_id)
);
ALTER TABLE public.role_relations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read role_relations" ON public.role_relations FOR SELECT USING (true);
CREATE POLICY "Admins manage role_relations" ON public.role_relations FOR ALL USING (has_role('admin'::app_role)) WITH CHECK (has_role('admin'::app_role));

-- 3. Extend search_status enum with new value
ALTER TYPE public.search_status ADD VALUE IF NOT EXISTS 'not_looking_but_open';

-- 4. Education table
CREATE TABLE IF NOT EXISTS public.candidate_education (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  institution text NOT NULL,
  degree text,
  field_of_study text,
  start_year int,
  end_year int,
  country text,
  city text,
  is_current boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.candidate_education ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Manage own education" ON public.candidate_education FOR ALL USING (is_profile_owner(profile_id) OR has_role('admin'::app_role)) WITH CHECK (is_profile_owner(profile_id) OR has_role('admin'::app_role));
CREATE POLICY "View education" ON public.candidate_education FOR SELECT USING (is_profile_owner(profile_id) OR has_role('admin'::app_role) OR is_profile_public(profile_id));

-- 5. Certificates table
CREATE TABLE IF NOT EXISTS public.candidate_certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  issuer text,
  year int,
  url text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.candidate_certificates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Manage own certificates" ON public.candidate_certificates FOR ALL USING (is_profile_owner(profile_id) OR has_role('admin'::app_role)) WITH CHECK (is_profile_owner(profile_id) OR has_role('admin'::app_role));
CREATE POLICY "View certificates" ON public.candidate_certificates FOR SELECT USING (is_profile_owner(profile_id) OR has_role('admin'::app_role) OR is_profile_public(profile_id));

-- 6. Portfolio items table
CREATE TABLE IF NOT EXISTS public.candidate_portfolio (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'other',
  title text NOT NULL,
  url text NOT NULL,
  description text,
  tags text[] DEFAULT '{}',
  visibility text NOT NULL DEFAULT 'public',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.candidate_portfolio ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Manage own portfolio" ON public.candidate_portfolio FOR ALL USING (is_profile_owner(profile_id) OR has_role('admin'::app_role)) WITH CHECK (is_profile_owner(profile_id) OR has_role('admin'::app_role));
CREATE POLICY "View portfolio" ON public.candidate_portfolio FOR SELECT USING (is_profile_owner(profile_id) OR has_role('admin'::app_role) OR is_profile_public(profile_id));

-- 7. Extend profile_skills with proficiency, is_top, custom support
ALTER TABLE public.profile_skills 
  ADD COLUMN IF NOT EXISTS proficiency int DEFAULT 2,
  ADD COLUMN IF NOT EXISTS is_top boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS custom_name text,
  ADD COLUMN IF NOT EXISTS custom_group text,
  ADD COLUMN IF NOT EXISTS is_custom boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'approved';

-- Make skill_id nullable for custom skills
ALTER TABLE public.profile_skills ALTER COLUMN skill_id DROP NOT NULL;

-- 8. Extend experiences with more fields
ALTER TABLE public.experiences
  ADD COLUMN IF NOT EXISTS employment_type text DEFAULT 'full_time',
  ADD COLUMN IF NOT EXISTS achievements jsonb DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS tools jsonb DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS sport_ids uuid[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS is_remote boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS hide_org boolean DEFAULT false;

-- 9. Extend profile_sports_experience with context_level
ALTER TABLE public.profile_sports_experience 
  ADD COLUMN IF NOT EXISTS context_level text,
  ADD COLUMN IF NOT EXISTS role_in_sport text;

-- 10. Support sport group selection in open_to
ALTER TABLE public.profile_sports_open_to 
  ADD COLUMN IF NOT EXISTS sport_group text;
-- Make sport_id nullable for group-based selection  
ALTER TABLE public.profile_sports_open_to ALTER COLUMN sport_id DROP NOT NULL;

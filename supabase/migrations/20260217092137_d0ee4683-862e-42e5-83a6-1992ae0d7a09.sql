
-- Fix specialist_roles: drop restrictive SELECT and recreate as PERMISSIVE
DROP POLICY IF EXISTS "Anyone can read specialist roles" ON public.specialist_roles;
CREATE POLICY "Anyone can read specialist roles"
  ON public.specialist_roles
  FOR SELECT
  USING (true);

-- Fix skills: drop restrictive SELECT and recreate as PERMISSIVE
DROP POLICY IF EXISTS "Anyone can read skills" ON public.skills;
CREATE POLICY "Anyone can read skills"
  ON public.skills
  FOR SELECT
  USING (true);

-- Fix sports: drop restrictive SELECT and recreate as PERMISSIVE
DROP POLICY IF EXISTS "Anyone can read sports" ON public.sports;
CREATE POLICY "Anyone can read sports"
  ON public.sports
  FOR SELECT
  USING (true);

-- Fix role_relations: drop restrictive SELECT and recreate as PERMISSIVE
DROP POLICY IF EXISTS "Anyone can read role_relations" ON public.role_relations;
CREATE POLICY "Anyone can read role_relations"
  ON public.role_relations
  FOR SELECT
  USING (true);

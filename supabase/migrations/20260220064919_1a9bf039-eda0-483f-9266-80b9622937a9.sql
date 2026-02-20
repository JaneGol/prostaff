
-- Drop the recursive policy
DROP POLICY IF EXISTS "Employers can view applicant profiles" ON public.profiles;

-- Create a security definer function to check if a profile is an applicant to employer's jobs
CREATE OR REPLACE FUNCTION public.is_applicant_to_my_jobs(_profile_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.applications a
    JOIN public.jobs j ON j.id = a.job_id
    JOIN public.companies c ON c.id = j.company_id
    WHERE a.profile_id = _profile_id
      AND c.user_id = auth.uid()
  )
$$;

-- Re-create the policy using the function (no recursion)
CREATE POLICY "Employers can view applicant profiles"
ON public.profiles
FOR SELECT
USING (is_applicant_to_my_jobs(id));

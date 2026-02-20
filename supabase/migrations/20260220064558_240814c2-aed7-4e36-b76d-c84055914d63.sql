
-- Allow employers to view profiles of candidates who applied to their jobs
CREATE POLICY "Employers can view applicant profiles"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.applications a
    JOIN public.jobs j ON j.id = a.job_id
    JOIN public.companies c ON c.id = j.company_id
    WHERE a.profile_id = profiles.id
      AND c.user_id = auth.uid()
  )
);

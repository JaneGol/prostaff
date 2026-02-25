
-- Fix: Jobs SELECT policy should also check moderation_status
DROP POLICY IF EXISTS "Anyone can view active jobs" ON public.jobs;

CREATE POLICY "Anyone can view active published jobs"
ON public.jobs
FOR SELECT
USING (
  (status = 'active' AND (moderation_status = 'published' OR moderation_status IS NULL))
  OR is_job_owner(id)
  OR has_role('admin'::app_role)
);

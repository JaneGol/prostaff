
-- 1. Fix analytics_events: validate user_id matches auth.uid() or is null
DROP POLICY IF EXISTS "Anyone can insert analytics_events" ON public.analytics_events;

CREATE POLICY "Validated insert analytics_events"
ON public.analytics_events
FOR INSERT
TO public
WITH CHECK (
  user_id IS NULL OR user_id = auth.uid()
);

-- 2. Fix page_views: same validation for user_id
DROP POLICY IF EXISTS "Anyone can insert page_views" ON public.page_views;

CREATE POLICY "Validated insert page_views"
ON public.page_views
FOR INSERT
TO public
WITH CHECK (
  user_id IS NULL OR user_id = auth.uid()
);

-- 3. Profiles: remove email/phone/telegram from employer applicant view
-- Create a restricted view for employer access that hides contacts
-- Actually, better approach: the existing RLS is already tight (no public read).
-- But employers seeing applicant profiles get contacts via is_applicant_to_my_jobs.
-- We should NOT restrict that since applicants explicitly applied.
-- Instead, ensure no other leak path exists by verifying no public SELECT policy.
-- Current policies are correct - no changes needed for profiles RLS.

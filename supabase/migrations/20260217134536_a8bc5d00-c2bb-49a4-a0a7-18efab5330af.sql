-- Allow companies to be created without a user_id (for auto-imported companies from HH)
ALTER TABLE public.companies ALTER COLUMN user_id DROP NOT NULL;

-- Update RLS: allow insert for service role (edge functions) when user_id is null
DROP POLICY IF EXISTS "Users can create own company" ON public.companies;
CREATE POLICY "Users can create own company"
ON public.companies
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  OR user_id IS NULL
  OR has_role('admin'::app_role)
);
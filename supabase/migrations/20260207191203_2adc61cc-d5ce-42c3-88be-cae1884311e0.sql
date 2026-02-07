-- Add policy to allow users to create their own role during registration
CREATE POLICY "Users can create own role"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
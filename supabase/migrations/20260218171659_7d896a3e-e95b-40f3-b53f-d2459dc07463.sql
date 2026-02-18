-- Drop the existing policy that only works for authenticated users
DROP POLICY "Anyone can view companies" ON public.companies;

-- Recreate with proper access for all roles (including anon)
CREATE POLICY "Anyone can view companies" 
ON public.companies 
FOR SELECT 
TO public
USING (true);
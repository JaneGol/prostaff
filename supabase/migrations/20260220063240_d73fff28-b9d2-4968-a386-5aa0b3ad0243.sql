-- Allow employers to insert skills (so recommended skills can be auto-created)
CREATE POLICY "Employers can create skills"
ON public.skills
FOR INSERT
WITH CHECK (has_role('employer'::app_role) OR has_role('admin'::app_role));

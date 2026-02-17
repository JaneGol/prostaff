-- Add role_id to hh_sources to map each source to a specialist role
ALTER TABLE public.hh_sources
ADD COLUMN role_id uuid REFERENCES public.specialist_roles(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX idx_hh_sources_role_id ON public.hh_sources(role_id);

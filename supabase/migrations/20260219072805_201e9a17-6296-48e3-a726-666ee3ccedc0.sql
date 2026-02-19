
-- Add specialization_id to profiles for explicit specialization selection
ALTER TABLE public.profiles 
ADD COLUMN specialization_id uuid REFERENCES public.specializations(id);

-- Backfill specialization_id from existing role_id → specialist_roles.specialization_id
UPDATE public.profiles p
SET specialization_id = sr.specialization_id
FROM public.specialist_roles sr
WHERE p.role_id = sr.id AND sr.specialization_id IS NOT NULL AND p.specialization_id IS NULL;


-- Add secondary specialization field to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS secondary_specialization_id uuid REFERENCES public.specializations(id);

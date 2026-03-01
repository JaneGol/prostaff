
-- Add items_skipped and skip_reasons to import_runs
ALTER TABLE public.import_runs ADD COLUMN items_skipped integer DEFAULT 0;
ALTER TABLE public.import_runs ADD COLUMN skip_reasons jsonb;

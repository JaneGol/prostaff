
-- Добавляем поля внешнего источника в таблицу jobs
ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS external_source text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS external_id text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS external_url text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS source_id uuid DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS moderation_status text DEFAULT 'published';

-- Уникальность по внешнему источнику + ID (дедупликация)
CREATE UNIQUE INDEX IF NOT EXISTS idx_jobs_external_source_id 
  ON public.jobs (external_source, external_id) 
  WHERE external_source IS NOT NULL AND external_id IS NOT NULL;

-- Таблица источников HH
CREATE TABLE public.hh_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL DEFAULT 'search' CHECK (type IN ('employer', 'search')),
  employer_id text DEFAULT NULL,
  search_query text DEFAULT NULL,
  filters_json jsonb DEFAULT '{}'::jsonb,
  is_enabled boolean NOT NULL DEFAULT true,
  import_interval_minutes integer NOT NULL DEFAULT 60,
  moderation_mode text NOT NULL DEFAULT 'draft_review' CHECK (moderation_mode IN ('auto_publish', 'draft_review')),
  company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.hh_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage hh_sources"
  ON public.hh_sources FOR ALL
  USING (has_role('admin'::app_role))
  WITH CHECK (has_role('admin'::app_role));

CREATE POLICY "Admins can read hh_sources"
  ON public.hh_sources FOR SELECT
  USING (has_role('admin'::app_role));

-- FK от jobs к hh_sources
ALTER TABLE public.jobs
  ADD CONSTRAINT jobs_source_id_fkey 
  FOREIGN KEY (source_id) REFERENCES public.hh_sources(id) ON DELETE SET NULL;

-- Таблица логов импорта
CREATE TABLE public.import_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id uuid NOT NULL REFERENCES public.hh_sources(id) ON DELETE CASCADE,
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz DEFAULT NULL,
  status text NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'success', 'failed', 'partial')),
  items_found integer DEFAULT 0,
  items_created integer DEFAULT 0,
  items_updated integer DEFAULT 0,
  items_closed integer DEFAULT 0,
  error_message text DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.import_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage import_runs"
  ON public.import_runs FOR ALL
  USING (has_role('admin'::app_role))
  WITH CHECK (has_role('admin'::app_role));

-- Триггер updated_at для hh_sources
CREATE TRIGGER update_hh_sources_updated_at
  BEFORE UPDATE ON public.hh_sources
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();


-- Analytics: page views tracking
CREATE TABLE public.page_views (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid,
    session_id text NOT NULL,
    page_path text NOT NULL,
    page_title text,
    referrer text,
    user_agent text,
    device_type text,
    created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

-- Only admins can read page_views
CREATE POLICY "Admins can read page_views"
ON public.page_views FOR SELECT
USING (has_role('admin'::app_role));

-- Anyone can insert page views (anonymous tracking)
CREATE POLICY "Anyone can insert page_views"
ON public.page_views FOR INSERT
WITH CHECK (true);

-- Analytics: click/event tracking  
CREATE TABLE public.analytics_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid,
    session_id text NOT NULL,
    event_type text NOT NULL,
    event_category text,
    event_label text,
    event_value text,
    page_path text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read analytics_events"
ON public.analytics_events FOR SELECT
USING (has_role('admin'::app_role));

CREATE POLICY "Anyone can insert analytics_events"
ON public.analytics_events FOR INSERT
WITH CHECK (true);

-- Indexes for fast queries
CREATE INDEX idx_page_views_created_at ON public.page_views(created_at DESC);
CREATE INDEX idx_page_views_page_path ON public.page_views(page_path);
CREATE INDEX idx_page_views_session ON public.page_views(session_id);
CREATE INDEX idx_analytics_events_created_at ON public.analytics_events(created_at DESC);
CREATE INDEX idx_analytics_events_type ON public.analytics_events(event_type);
CREATE INDEX idx_analytics_events_category ON public.analytics_events(event_category);

-- Function to auto-assign admin role for specific email
CREATE OR REPLACE FUNCTION public.auto_assign_admin_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.email = 'e89030922661@gmail.com' THEN
        INSERT INTO public.user_roles (user_id, role)
        VALUES (NEW.id, 'admin')
        ON CONFLICT (user_id, role) DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$;

-- Trigger on auth.users insert
CREATE TRIGGER on_auth_user_created_admin
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.auto_assign_admin_role();

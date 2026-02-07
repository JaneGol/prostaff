-- ============================================
-- ТИПЫ ДЛЯ ВАКАНСИЙ
-- ============================================

-- Тип контракта
CREATE TYPE public.contract_type AS ENUM ('full_time', 'part_time', 'contract', 'internship', 'freelance');

-- Статус вакансии
CREATE TYPE public.job_status AS ENUM ('draft', 'active', 'paused', 'closed');

-- Статус отклика
CREATE TYPE public.application_status AS ENUM ('pending', 'reviewed', 'shortlisted', 'interview', 'rejected', 'hired');

-- ============================================
-- ТАБЛИЦА ВАКАНСИЙ
-- ============================================

CREATE TABLE public.jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT,
    responsibilities TEXT,
    role_id UUID REFERENCES public.specialist_roles(id),
    level experience_level,
    contract_type contract_type DEFAULT 'full_time',
    salary_min INTEGER,
    salary_max INTEGER,
    salary_currency TEXT DEFAULT 'RUB',
    city TEXT,
    country TEXT DEFAULT 'Россия',
    is_remote BOOLEAN DEFAULT false,
    is_relocatable BOOLEAN DEFAULT false,
    status job_status DEFAULT 'active',
    views_count INTEGER DEFAULT 0,
    applications_count INTEGER DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================
-- ТАБЛИЦА ОТКЛИКОВ
-- ============================================

CREATE TABLE public.applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    cover_letter TEXT,
    status application_status DEFAULT 'pending',
    employer_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (job_id, profile_id)
);

-- ============================================
-- СВЯЗЬ ВАКАНСИЯ-НАВЫКИ
-- ============================================

CREATE TABLE public.job_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
    skill_id UUID REFERENCES public.skills(id) ON DELETE CASCADE NOT NULL,
    is_required BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (job_id, skill_id)
);

-- ============================================
-- ТРИГГЕРЫ
-- ============================================

CREATE TRIGGER update_jobs_updated_at
    BEFORE UPDATE ON public.jobs
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_applications_updated_at
    BEFORE UPDATE ON public.applications
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- ФУНКЦИИ-ПОМОЩНИКИ
-- ============================================

-- Проверка владельца вакансии (через компанию)
CREATE OR REPLACE FUNCTION public.is_job_owner(_job_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.jobs j
        JOIN public.companies c ON c.id = j.company_id
        WHERE j.id = _job_id AND c.user_id = auth.uid()
    )
$$;

-- Проверка владельца отклика
CREATE OR REPLACE FUNCTION public.is_application_owner(_application_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.applications a
        JOIN public.profiles p ON p.id = a.profile_id
        WHERE a.id = _application_id AND p.user_id = auth.uid()
    )
$$;

-- ============================================
-- ВКЛЮЧЕНИЕ RLS
-- ============================================

ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_skills ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS ПОЛИТИКИ ДЛЯ ВАКАНСИЙ
-- ============================================

-- Все могут видеть активные вакансии
CREATE POLICY "Anyone can view active jobs"
    ON public.jobs FOR SELECT
    USING (status = 'active' OR public.is_job_owner(id) OR public.has_role('admin'));

-- Владельцы компании могут создавать вакансии
CREATE POLICY "Company owners can create jobs"
    ON public.jobs FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.companies c 
            WHERE c.id = company_id AND c.user_id = auth.uid()
        )
    );

-- Владельцы могут редактировать свои вакансии
CREATE POLICY "Job owners can update jobs"
    ON public.jobs FOR UPDATE
    USING (public.is_job_owner(id) OR public.has_role('admin'))
    WITH CHECK (public.is_job_owner(id) OR public.has_role('admin'));

-- Владельцы могут удалять свои вакансии
CREATE POLICY "Job owners can delete jobs"
    ON public.jobs FOR DELETE
    USING (public.is_job_owner(id) OR public.has_role('admin'));

-- ============================================
-- RLS ПОЛИТИКИ ДЛЯ ОТКЛИКОВ
-- ============================================

-- Специалисты видят свои отклики, работодатели - отклики на свои вакансии
CREATE POLICY "View applications"
    ON public.applications FOR SELECT
    USING (
        public.has_role('admin')
        OR EXISTS (
            SELECT 1 FROM public.profiles p 
            WHERE p.id = profile_id AND p.user_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM public.jobs j
            JOIN public.companies c ON c.id = j.company_id
            WHERE j.id = job_id AND c.user_id = auth.uid()
        )
    );

-- Специалисты могут откликаться на вакансии
CREATE POLICY "Specialists can apply"
    ON public.applications FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles p 
            WHERE p.id = profile_id AND p.user_id = auth.uid()
        )
    );

-- Специалисты могут обновлять свои отклики, работодатели - статусы
CREATE POLICY "Update applications"
    ON public.applications FOR UPDATE
    USING (
        public.has_role('admin')
        OR public.is_application_owner(id)
        OR EXISTS (
            SELECT 1 FROM public.jobs j
            JOIN public.companies c ON c.id = j.company_id
            WHERE j.id = job_id AND c.user_id = auth.uid()
        )
    )
    WITH CHECK (
        public.has_role('admin')
        OR public.is_application_owner(id)
        OR EXISTS (
            SELECT 1 FROM public.jobs j
            JOIN public.companies c ON c.id = j.company_id
            WHERE j.id = job_id AND c.user_id = auth.uid()
        )
    );

-- Специалисты могут отзывать свои отклики
CREATE POLICY "Specialists can delete own applications"
    ON public.applications FOR DELETE
    USING (public.is_application_owner(id) OR public.has_role('admin'));

-- ============================================
-- RLS ПОЛИТИКИ ДЛЯ НАВЫКОВ ВАКАНСИЙ
-- ============================================

CREATE POLICY "View job skills"
    ON public.job_skills FOR SELECT
    USING (true);

CREATE POLICY "Manage job skills"
    ON public.job_skills FOR ALL
    USING (public.is_job_owner(job_id) OR public.has_role('admin'))
    WITH CHECK (public.is_job_owner(job_id) OR public.has_role('admin'));
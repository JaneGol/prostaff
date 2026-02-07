-- Создаем тип для ролей пользователей
CREATE TYPE public.app_role AS ENUM ('specialist', 'employer', 'admin');

-- Создаем тип для уровня опыта
CREATE TYPE public.experience_level AS ENUM ('intern', 'junior', 'middle', 'senior', 'head');

-- Создаем тип для статуса поиска работы
CREATE TYPE public.search_status AS ENUM ('actively_looking', 'open_to_offers', 'not_looking');

-- ============================================
-- СПРАВОЧНЫЕ ТАБЛИЦЫ
-- ============================================

-- Справочник ролей специалистов (аналитик, тренер и т.д.)
CREATE TABLE public.specialist_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    name_en TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Справочник навыков
CREATE TABLE public.skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================
-- ТАБЛИЦА РОЛЕЙ ПОЛЬЗОВАТЕЛЕЙ
-- ============================================
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (user_id, role)
);

-- ============================================
-- ОСНОВНЫЕ ТАБЛИЦЫ
-- ============================================

-- Профили специалистов
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    role_id UUID REFERENCES public.specialist_roles(id),
    level experience_level DEFAULT 'middle',
    bio TEXT,
    avatar_url TEXT,
    city TEXT,
    country TEXT DEFAULT 'Россия',
    is_relocatable BOOLEAN DEFAULT false,
    is_remote_available BOOLEAN DEFAULT false,
    search_status search_status DEFAULT 'open_to_offers',
    is_public BOOLEAN DEFAULT true,
    email TEXT,
    phone TEXT,
    telegram TEXT,
    linkedin_url TEXT,
    portfolio_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Компании/клубы
CREATE TABLE public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    logo_url TEXT,
    website TEXT,
    city TEXT,
    country TEXT DEFAULT 'Россия',
    league TEXT,
    founded_year INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Связь профиль-навыки
CREATE TABLE public.profile_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    skill_id UUID REFERENCES public.skills(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (profile_id, skill_id)
);

-- Опыт работы
CREATE TABLE public.experiences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    company_name TEXT NOT NULL,
    position TEXT NOT NULL,
    league TEXT,
    team_level TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    is_current BOOLEAN DEFAULT false,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================
-- ФУНКЦИИ-ПОМОЩНИКИ (SECURITY DEFINER)
-- ============================================

-- Проверка роли пользователя
CREATE OR REPLACE FUNCTION public.has_role(_role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid() AND role = _role
    )
$$;

-- Проверка владельца профиля
CREATE OR REPLACE FUNCTION public.is_profile_owner(_profile_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = _profile_id AND user_id = auth.uid()
    )
$$;

-- Проверка владельца компании
CREATE OR REPLACE FUNCTION public.is_company_owner(_company_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.companies
        WHERE id = _company_id AND user_id = auth.uid()
    )
$$;

-- Проверка публичности профиля
CREATE OR REPLACE FUNCTION public.is_profile_public(_profile_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = _profile_id AND is_public = true
    )
$$;

-- Автообновление updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ТРИГГЕРЫ
-- ============================================

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_companies_updated_at
    BEFORE UPDATE ON public.companies
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_experiences_updated_at
    BEFORE UPDATE ON public.experiences
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- ВКЛЮЧЕНИЕ RLS
-- ============================================

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialist_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS ПОЛИТИКИ
-- ============================================

-- USER_ROLES: только чтение своей роли, админы могут всё
CREATE POLICY "Users can view own roles"
    ON public.user_roles FOR SELECT
    USING (auth.uid() = user_id OR public.has_role('admin'));

CREATE POLICY "Only admins can manage roles"
    ON public.user_roles FOR ALL
    USING (public.has_role('admin'))
    WITH CHECK (public.has_role('admin'));

-- SPECIALIST_ROLES: все аутентифицированные могут читать
CREATE POLICY "Anyone can read specialist roles"
    ON public.specialist_roles FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Only admins can manage specialist roles"
    ON public.specialist_roles FOR ALL
    USING (public.has_role('admin'))
    WITH CHECK (public.has_role('admin'));

-- SKILLS: все аутентифицированные могут читать
CREATE POLICY "Anyone can read skills"
    ON public.skills FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Only admins can manage skills"
    ON public.skills FOR ALL
    USING (public.has_role('admin'))
    WITH CHECK (public.has_role('admin'));

-- PROFILES: владелец и работодатели (публичные)
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (
        auth.uid() = user_id 
        OR public.has_role('admin')
        OR (public.has_role('employer') AND is_public = true)
        OR (is_public = true)
    );

CREATE POLICY "Users can create own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = user_id OR public.has_role('admin'))
    WITH CHECK (auth.uid() = user_id OR public.has_role('admin'));

CREATE POLICY "Users can delete own profile"
    ON public.profiles FOR DELETE
    USING (auth.uid() = user_id OR public.has_role('admin'));

-- COMPANIES: владелец и все могут читать
CREATE POLICY "Anyone can view companies"
    ON public.companies FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can create own company"
    ON public.companies FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own company"
    ON public.companies FOR UPDATE
    USING (auth.uid() = user_id OR public.has_role('admin'))
    WITH CHECK (auth.uid() = user_id OR public.has_role('admin'));

CREATE POLICY "Users can delete own company"
    ON public.companies FOR DELETE
    USING (auth.uid() = user_id OR public.has_role('admin'));

-- PROFILE_SKILLS
CREATE POLICY "View profile skills"
    ON public.profile_skills FOR SELECT
    USING (
        public.is_profile_owner(profile_id)
        OR public.has_role('admin')
        OR public.is_profile_public(profile_id)
    );

CREATE POLICY "Manage own profile skills"
    ON public.profile_skills FOR ALL
    USING (public.is_profile_owner(profile_id) OR public.has_role('admin'))
    WITH CHECK (public.is_profile_owner(profile_id) OR public.has_role('admin'));

-- EXPERIENCES
CREATE POLICY "View experiences"
    ON public.experiences FOR SELECT
    USING (
        public.is_profile_owner(profile_id)
        OR public.has_role('admin')
        OR public.is_profile_public(profile_id)
    );

CREATE POLICY "Manage own experiences"
    ON public.experiences FOR ALL
    USING (public.is_profile_owner(profile_id) OR public.has_role('admin'))
    WITH CHECK (public.is_profile_owner(profile_id) OR public.has_role('admin'));

-- ============================================
-- НАЧАЛЬНЫЕ ДАННЫЕ: РОЛИ СПЕЦИАЛИСТОВ
-- ============================================

INSERT INTO public.specialist_roles (name, name_en) VALUES
    ('Видеоаналитик', 'Video Analyst'),
    ('Аналитик данных', 'Data Analyst'),
    ('Главный тренер', 'Head Coach'),
    ('Помощник тренера', 'Assistant Coach'),
    ('Тренер вратарей', 'Goalkeeper Coach'),
    ('Тренер по физподготовке', 'Fitness Coach'),
    ('Спортивный врач', 'Sports Doctor'),
    ('Физиотерапевт', 'Physiotherapist'),
    ('Массажист', 'Massage Therapist'),
    ('Нутрициолог', 'Nutritionist'),
    ('Психолог', 'Sports Psychologist'),
    ('Скаут', 'Scout'),
    ('Спортивный директор', 'Sporting Director'),
    ('Менеджер команды', 'Team Manager'),
    ('Переводчик', 'Interpreter'),
    ('Медиа-менеджер', 'Media Manager'),
    ('Аналитик GPS/отслеживания', 'GPS/Tracking Analyst'),
    ('Реабилитолог', 'Rehabilitation Specialist'),
    ('S&C специалист', 'Strength & Conditioning'),
    ('Администратор академии', 'Academy Administrator');

-- ============================================
-- НАЧАЛЬНЫЕ ДАННЫЕ: НАВЫКИ
-- ============================================

INSERT INTO public.skills (name, category) VALUES
    -- Аналитические инструменты
    ('Wyscout', 'Аналитика'),
    ('Hudl', 'Аналитика'),
    ('InStat', 'Аналитика'),
    ('Opta', 'Аналитика'),
    ('StatsBomb', 'Аналитика'),
    ('Tableau', 'Визуализация'),
    ('Power BI', 'Визуализация'),
    -- Программирование
    ('Python', 'Программирование'),
    ('R', 'Программирование'),
    ('SQL', 'Программирование'),
    ('Excel', 'Инструменты'),
    -- GPS и отслеживание
    ('Catapult', 'GPS'),
    ('STATSports', 'GPS'),
    ('Polar', 'GPS'),
    ('Kinexon', 'GPS'),
    -- Видеоанализ
    ('Sportscode', 'Видео'),
    ('Nacsport', 'Видео'),
    ('LongoMatch', 'Видео'),
    ('Dartfish', 'Видео'),
    -- Медицина и физподготовка
    ('Реабилитация травм', 'Медицина'),
    ('Спортивное питание', 'Медицина'),
    ('Кинезиотейпирование', 'Медицина'),
    ('Физиотерапия', 'Медицина'),
    -- Языки
    ('Английский язык', 'Языки'),
    ('Испанский язык', 'Языки'),
    ('Немецкий язык', 'Языки'),
    ('Португальский язык', 'Языки'),
    -- Soft skills
    ('Работа в команде', 'Soft skills'),
    ('Презентации', 'Soft skills'),
    ('Управление проектами', 'Soft skills');

-- ============================================
-- ЭТАП 1: Миграция БД — новая структура ролей
-- ============================================

-- 1. Создать таблицу role_groups
CREATE TABLE public.role_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  title text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.role_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read role_groups" ON public.role_groups
  FOR SELECT USING (true);
CREATE POLICY "Admins manage role_groups" ON public.role_groups
  FOR ALL USING (has_role('admin'::app_role))
  WITH CHECK (has_role('admin'::app_role));

-- Заполнить группы
INSERT INTO public.role_groups (key, title, sort_order) VALUES
  ('coaches', 'Тренеры', 1),
  ('fitness', 'Физическая подготовка', 2),
  ('analytics', 'Аналитика и данные', 3),
  ('medical', 'Медицина и восстановление', 4),
  ('other', 'Другое', 5);

-- 2. Добавить новые колонки в specialist_roles
ALTER TABLE public.specialist_roles
  ADD COLUMN IF NOT EXISTS group_id uuid REFERENCES public.role_groups(id),
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS is_custom_allowed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS sort_order int NOT NULL DEFAULT 0;

-- 3. Сбросить все FK-ссылки перед удалением старых ролей
UPDATE public.profiles SET role_id = NULL, secondary_role_id = NULL, specialization_id = NULL, secondary_specialization_id = NULL;
UPDATE public.jobs SET role_id = NULL, specialization_id = NULL;
UPDATE public.hh_sources SET role_id = NULL;
DELETE FROM public.role_relations;
DELETE FROM public.specialist_roles;

-- 4. Вставить новые роли по ТЗ
INSERT INTO public.specialist_roles (name, group_id, sort_order, description, is_custom_allowed) VALUES
  -- Тренеры
  ('Главный тренер', (SELECT id FROM role_groups WHERE key='coaches'), 1, NULL, false),
  ('Ассистент тренера', (SELECT id FROM role_groups WHERE key='coaches'), 2, NULL, false),
  ('Старший тренер', (SELECT id FROM role_groups WHERE key='coaches'), 3, NULL, false),
  ('Тренер вратарей', (SELECT id FROM role_groups WHERE key='coaches'), 4, NULL, false),
  ('Тренер спортивной школы / академии', (SELECT id FROM role_groups WHERE key='coaches'), 5, NULL, false),
  ('Тренер молодёжных команд', (SELECT id FROM role_groups WHERE key='coaches'), 6, NULL, false),
  ('Тренер по индивидуальной подготовке', (SELECT id FROM role_groups WHERE key='coaches'), 7, NULL, false),
  ('Тренер по стандартам', (SELECT id FROM role_groups WHERE key='coaches'), 8, NULL, false),
  ('Тренер по навыкам', (SELECT id FROM role_groups WHERE key='coaches'), 9, NULL, false),
  ('Тренер (по виду спорта)', (SELECT id FROM role_groups WHERE key='coaches'), 10, 'Для плавания, тенниса, лёгкой атлетики, гимнастики, единоборств и др.', false),
  -- Физическая подготовка
  ('Тренер по физической подготовке (индивидуальная)', (SELECT id FROM role_groups WHERE key='fitness'), 1, NULL, false),
  ('Тренер по физической подготовке (команда)', (SELECT id FROM role_groups WHERE key='fitness'), 2, NULL, false),
  ('Тренер по физической подготовке (Gym)', (SELECT id FROM role_groups WHERE key='fitness'), 3, NULL, false),
  ('Тренер по физической подготовке (беговая)', (SELECT id FROM role_groups WHERE key='fitness'), 4, NULL, false),
  ('Тренер по ОФП', (SELECT id FROM role_groups WHERE key='fitness'), 5, NULL, false),
  -- Аналитика и данные
  ('Видеоаналитик', (SELECT id FROM role_groups WHERE key='analytics'), 1, NULL, false),
  ('Матчевый аналитик', (SELECT id FROM role_groups WHERE key='analytics'), 2, NULL, false),
  ('Аналитик данных', (SELECT id FROM role_groups WHERE key='analytics'), 3, NULL, false),
  ('Аналитик соперника', (SELECT id FROM role_groups WHERE key='analytics'), 4, NULL, false),
  ('Аналитик GPS / Performance', (SELECT id FROM role_groups WHERE key='analytics'), 5, NULL, false),
  ('Скаут-аналитик', (SELECT id FROM role_groups WHERE key='analytics'), 6, NULL, false),
  -- Медицина и восстановление
  ('Спортивный врач', (SELECT id FROM role_groups WHERE key='medical'), 1, NULL, false),
  ('Реабилитолог', (SELECT id FROM role_groups WHERE key='medical'), 2, NULL, false),
  ('Физиотерапевт', (SELECT id FROM role_groups WHERE key='medical'), 3, NULL, false),
  ('Массажист', (SELECT id FROM role_groups WHERE key='medical'), 4, NULL, false),
  ('Нутрициолог', (SELECT id FROM role_groups WHERE key='medical'), 5, NULL, false),
  ('Спортивный психолог', (SELECT id FROM role_groups WHERE key='medical'), 6, NULL, false),
  -- Другое
  ('Менеджер команды', (SELECT id FROM role_groups WHERE key='other'), 1, NULL, false),
  ('Спортивный директор', (SELECT id FROM role_groups WHERE key='other'), 2, NULL, false),
  ('Переводчик', (SELECT id FROM role_groups WHERE key='other'), 3, NULL, false),
  ('Другое (свой вариант)', (SELECT id FROM role_groups WHERE key='other'), 99, 'Введите свою роль, если не нашли подходящую', true);

-- 5. Создать таблицу custom_roles
CREATE TABLE public.custom_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  group_id uuid REFERENCES public.role_groups(id),
  title text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  normalized_role_id uuid REFERENCES public.specialist_roles(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.custom_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create own custom role" ON public.custom_roles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "View custom roles" ON public.custom_roles
  FOR SELECT USING (auth.uid() = user_id OR status = 'approved' OR has_role('admin'::app_role));
CREATE POLICY "Admins manage custom_roles" ON public.custom_roles
  FOR ALL USING (has_role('admin'::app_role))
  WITH CHECK (has_role('admin'::app_role));

-- 6. Добавить custom_role_id в profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS custom_role_id uuid REFERENCES public.custom_roles(id);

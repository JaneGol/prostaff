
-- 1. Create specializations table
CREATE TABLE public.specializations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  group_key text NOT NULL, -- coaching, performance, analytics, medical, other
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- RLS: readable by everyone, manageable by admins
ALTER TABLE public.specializations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read specializations"
ON public.specializations FOR SELECT
TO public
USING (true);

CREATE POLICY "Admins manage specializations"
ON public.specializations FOR ALL
USING (has_role('admin'::app_role))
WITH CHECK (has_role('admin'::app_role));

-- 2. Add specialization_id to specialist_roles
ALTER TABLE public.specialist_roles
ADD COLUMN specialization_id uuid REFERENCES public.specializations(id);

-- 3. Add specialization_id to jobs
ALTER TABLE public.jobs
ADD COLUMN specialization_id uuid REFERENCES public.specializations(id);

-- 4. Insert specializations

-- COACHING (group_key = 'coaching')
INSERT INTO public.specializations (id, name, group_key, sort_order) VALUES
  ('a0000001-0000-0000-0000-000000000001', 'Главный тренер', 'coaching', 1),
  ('a0000001-0000-0000-0000-000000000002', 'Ассистент тренера', 'coaching', 2),
  ('a0000001-0000-0000-0000-000000000003', 'Тренер вратарей', 'coaching', 3),
  ('a0000001-0000-0000-0000-000000000004', 'Тренер академии / ДЮСШ', 'coaching', 4),
  ('a0000001-0000-0000-0000-000000000005', 'Тренер молодёжных команд', 'coaching', 5),
  ('a0000001-0000-0000-0000-000000000006', 'Тренер по индивидуальной подготовке', 'coaching', 6),
  ('a0000001-0000-0000-0000-000000000007', 'Тренер по стандартам', 'coaching', 7),
  ('a0000001-0000-0000-0000-000000000008', 'Старший тренер', 'coaching', 8);

-- PERFORMANCE (group_key = 'performance')
INSERT INTO public.specializations (id, name, group_key, sort_order) VALUES
  ('a0000002-0000-0000-0000-000000000001', 'S&C тренер', 'performance', 1),
  ('a0000002-0000-0000-0000-000000000002', 'Тренер по ОФП', 'performance', 2),
  ('a0000002-0000-0000-0000-000000000003', 'Тренер по физической подготовке', 'performance', 3),
  ('a0000002-0000-0000-0000-000000000004', 'Тренер по восстановлению', 'performance', 4),
  ('a0000002-0000-0000-0000-000000000005', 'Тренер по скиллам', 'performance', 5);

-- ANALYTICS (group_key = 'analytics')
INSERT INTO public.specializations (id, name, group_key, sort_order) VALUES
  ('a0000003-0000-0000-0000-000000000001', 'Видеоаналитика', 'analytics', 1),
  ('a0000003-0000-0000-0000-000000000002', 'Аналитика данных', 'analytics', 2),
  ('a0000003-0000-0000-0000-000000000003', 'Матчевая аналитика', 'analytics', 3),
  ('a0000003-0000-0000-0000-000000000004', 'Аналитика соперника', 'analytics', 4),
  ('a0000003-0000-0000-0000-000000000005', 'Аналитика GPS / трекинга', 'analytics', 5),
  ('a0000003-0000-0000-0000-000000000006', 'Скаутинг и рекрутинг', 'analytics', 6);

-- MEDICAL (group_key = 'medical')
INSERT INTO public.specializations (id, name, group_key, sort_order) VALUES
  ('a0000004-0000-0000-0000-000000000001', 'Спортивный врач', 'medical', 1),
  ('a0000004-0000-0000-0000-000000000002', 'Реабилитация', 'medical', 2),
  ('a0000004-0000-0000-0000-000000000003', 'Физиотерапия', 'medical', 3),
  ('a0000004-0000-0000-0000-000000000004', 'Массаж', 'medical', 4),
  ('a0000004-0000-0000-0000-000000000005', 'Нутрициология', 'medical', 5),
  ('a0000004-0000-0000-0000-000000000006', 'Психология', 'medical', 6);

-- OTHER (group_key = 'other')
INSERT INTO public.specializations (id, name, group_key, sort_order) VALUES
  ('a0000005-0000-0000-0000-000000000001', 'Менеджмент команды', 'other', 1),
  ('a0000005-0000-0000-0000-000000000002', 'Администрирование', 'other', 2),
  ('a0000005-0000-0000-0000-000000000003', 'Скаутинг', 'other', 3),
  ('a0000005-0000-0000-0000-000000000004', 'Образование и методология', 'other', 4),
  ('a0000005-0000-0000-0000-000000000005', 'Операционная деятельность', 'other', 5);

-- 5. Link existing specialist_roles to specializations

-- Coaching roles
UPDATE public.specialist_roles SET specialization_id = 'a0000001-0000-0000-0000-000000000001' WHERE id = 'e74c6476-9b5f-4ccd-a3b8-03faa2988d46'; -- Главный тренер
UPDATE public.specialist_roles SET specialization_id = 'a0000001-0000-0000-0000-000000000002' WHERE id = 'bd25686c-1063-4613-8afb-9d1c2aee3047'; -- Помощник тренера
UPDATE public.specialist_roles SET specialization_id = 'a0000001-0000-0000-0000-000000000003' WHERE id = 'c7c42a56-6bd1-4080-949a-f7f80e5c5651'; -- Тренер вратарей

-- Performance roles
UPDATE public.specialist_roles SET specialization_id = 'a0000002-0000-0000-0000-000000000001' WHERE id = 'a9620db1-3cf0-4d57-a6bf-28c2961c43e1'; -- S&C специалист
UPDATE public.specialist_roles SET specialization_id = 'a0000002-0000-0000-0000-000000000003' WHERE id = 'cfd950a8-5ebe-4ba9-b16f-94e05903c4f2'; -- Тренер по физподготовке

-- Analytics roles
UPDATE public.specialist_roles SET specialization_id = 'a0000003-0000-0000-0000-000000000002' WHERE id = 'b79fbfc7-3c12-44aa-8606-fcba449c9373'; -- Аналитик данных
UPDATE public.specialist_roles SET specialization_id = 'a0000003-0000-0000-0000-000000000001' WHERE id = 'c19b18bc-4521-45b4-8ed7-54aa647cb17f'; -- Видеоаналитик
UPDATE public.specialist_roles SET specialization_id = 'a0000003-0000-0000-0000-000000000005' WHERE id = '96069546-82b6-4337-9079-a5473e238b3f'; -- Аналитик GPS

-- Medical roles
UPDATE public.specialist_roles SET specialization_id = 'a0000004-0000-0000-0000-000000000001' WHERE id = '98271286-d569-4074-8d96-16dcf258fdcf'; -- Спортивный врач
UPDATE public.specialist_roles SET specialization_id = 'a0000004-0000-0000-0000-000000000002' WHERE id = '0bd7deb6-adca-4ff7-b83f-ca8ad11758ad'; -- Реабилитолог
UPDATE public.specialist_roles SET specialization_id = 'a0000004-0000-0000-0000-000000000004' WHERE id = '2e135641-1951-4b35-af1f-e9ad866fd889'; -- Массажист
UPDATE public.specialist_roles SET specialization_id = 'a0000004-0000-0000-0000-000000000003' WHERE id = '8a1775dd-4e59-4a99-b378-07b19069b1ff'; -- Физиотерапевт
UPDATE public.specialist_roles SET specialization_id = 'a0000004-0000-0000-0000-000000000005' WHERE id = '2056f7c5-6c00-491f-a298-bec303ff15cf'; -- Нутрициолог

-- Other roles
UPDATE public.specialist_roles SET specialization_id = 'a0000005-0000-0000-0000-000000000003' WHERE id = '362ad39d-e65d-4f79-ab97-0710ff4b40e7'; -- Скаут
UPDATE public.specialist_roles SET specialization_id = 'a0000005-0000-0000-0000-000000000001' WHERE id = '179b0d8c-7a31-49e6-9662-c53c4397cedc'; -- Спортивный директор
UPDATE public.specialist_roles SET specialization_id = 'a0000005-0000-0000-0000-000000000001' WHERE id = 'e5ac0126-f293-4664-80eb-a4147d15bd05'; -- Менеджер команды
UPDATE public.specialist_roles SET specialization_id = 'a0000005-0000-0000-0000-000000000002' WHERE id = 'e1c0d411-0ace-49c8-a1f1-e9f3c7996ce1'; -- Администратор академии
UPDATE public.specialist_roles SET specialization_id = 'a0000005-0000-0000-0000-000000000005' WHERE id = '7d84c3f8-6859-4c4e-af48-9d22d111178a'; -- Медиа-менеджер
UPDATE public.specialist_roles SET specialization_id = 'a0000005-0000-0000-0000-000000000005' WHERE id = '65ffb93a-82fe-476e-87a9-a6310c25109c'; -- Переводчик
UPDATE public.specialist_roles SET specialization_id = 'a0000004-0000-0000-0000-000000000006' WHERE id = 'c863d569-2553-42ba-b105-fb6aa73dd52d'; -- Психолог


-- Sports reference table
CREATE TABLE public.sports (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  name_en text,
  slug text NOT NULL UNIQUE,
  icon text, -- lucide icon name
  type_participation text DEFAULT 'team', -- team/individual/pair
  type_activity text DEFAULT 'game', -- game/cyclic/combat/power/technical/coordination/extreme/mixed
  season text DEFAULT 'all', -- summer/winter/all
  is_olympic boolean DEFAULT false,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.sports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read sports" ON public.sports FOR SELECT USING (true);
CREATE POLICY "Only admins can manage sports" ON public.sports FOR ALL USING (has_role('admin'::app_role)) WITH CHECK (has_role('admin'::app_role));

-- Profile sports experience (опыт в видах спорта)
CREATE TABLE public.profile_sports_experience (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sport_id uuid NOT NULL REFERENCES public.sports(id) ON DELETE CASCADE,
  years integer DEFAULT 1,
  level text, -- beginner/intermediate/advanced/expert
  created_at timestamptz DEFAULT now(),
  UNIQUE(profile_id, sport_id)
);

ALTER TABLE public.profile_sports_experience ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Manage own sport experience" ON public.profile_sports_experience FOR ALL
  USING (is_profile_owner(profile_id) OR has_role('admin'::app_role))
  WITH CHECK (is_profile_owner(profile_id) OR has_role('admin'::app_role));

CREATE POLICY "View sport experience" ON public.profile_sports_experience FOR SELECT
  USING (is_profile_owner(profile_id) OR has_role('admin'::app_role) OR is_profile_public(profile_id));

-- Profile sports open to (готов работать в)
CREATE TABLE public.profile_sports_open_to (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sport_id uuid NOT NULL REFERENCES public.sports(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(profile_id, sport_id)
);

ALTER TABLE public.profile_sports_open_to ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Manage own open-to sports" ON public.profile_sports_open_to FOR ALL
  USING (is_profile_owner(profile_id) OR has_role('admin'::app_role))
  WITH CHECK (is_profile_owner(profile_id) OR has_role('admin'::app_role));

CREATE POLICY "View open-to sports" ON public.profile_sports_open_to FOR SELECT
  USING (is_profile_owner(profile_id) OR has_role('admin'::app_role) OR is_profile_public(profile_id));

-- Seed sports data (25-30 core sports)
INSERT INTO public.sports (name, name_en, slug, icon, type_participation, type_activity, season, is_olympic, sort_order) VALUES
  ('Футбол', 'Football', 'football', 'circle-dot', 'team', 'game', 'all', true, 1),
  ('Мини-футбол', 'Futsal', 'futsal', 'circle-dot', 'team', 'game', 'all', false, 2),
  ('Пляжный футбол', 'Beach Football', 'beach-football', 'sun', 'team', 'game', 'summer', false, 3),
  ('Хоккей', 'Ice Hockey', 'ice-hockey', 'snowflake', 'team', 'game', 'winter', true, 4),
  ('Хоккей с мячом', 'Bandy', 'bandy', 'snowflake', 'team', 'game', 'winter', false, 5),
  ('Баскетбол', 'Basketball', 'basketball', 'target', 'team', 'game', 'all', true, 6),
  ('Волейбол', 'Volleyball', 'volleyball', 'activity', 'team', 'game', 'all', true, 7),
  ('Пляжный волейбол', 'Beach Volleyball', 'beach-volleyball', 'sun', 'team', 'game', 'summer', true, 8),
  ('Гандбол', 'Handball', 'handball', 'hand', 'team', 'game', 'all', true, 9),
  ('Водное поло', 'Water Polo', 'water-polo', 'waves', 'team', 'game', 'all', true, 10),
  ('Регби', 'Rugby', 'rugby', 'shield', 'team', 'game', 'all', true, 11),
  ('Бейсбол', 'Baseball', 'baseball', 'diamond', 'team', 'game', 'summer', true, 12),
  ('Бокс', 'Boxing', 'boxing', 'swords', 'individual', 'combat', 'all', true, 13),
  ('ММА', 'MMA', 'mma', 'swords', 'individual', 'combat', 'all', false, 14),
  ('Борьба', 'Wrestling', 'wrestling', 'swords', 'individual', 'combat', 'all', true, 15),
  ('Дзюдо', 'Judo', 'judo', 'swords', 'individual', 'combat', 'all', true, 16),
  ('Лёгкая атлетика', 'Athletics', 'athletics', 'timer', 'individual', 'cyclic', 'summer', true, 17),
  ('Плавание', 'Swimming', 'swimming', 'waves', 'individual', 'cyclic', 'all', true, 18),
  ('Велоспорт', 'Cycling', 'cycling', 'bike', 'individual', 'cyclic', 'all', true, 19),
  ('Лыжные гонки', 'Cross-Country Skiing', 'cross-country-skiing', 'mountain-snow', 'individual', 'cyclic', 'winter', true, 20),
  ('Гребля', 'Rowing', 'rowing', 'waves', 'team', 'cyclic', 'summer', true, 21),
  ('Тяжёлая атлетика', 'Weightlifting', 'weightlifting', 'dumbbell', 'individual', 'power', 'all', true, 22),
  ('Гимнастика', 'Gymnastics', 'gymnastics', 'sparkles', 'individual', 'coordination', 'all', true, 23),
  ('Фигурное катание', 'Figure Skating', 'figure-skating', 'snowflake', 'individual', 'coordination', 'winter', true, 24),
  ('Теннис', 'Tennis', 'tennis', 'target', 'individual', 'game', 'all', true, 25),
  ('Настольный теннис', 'Table Tennis', 'table-tennis', 'target', 'individual', 'game', 'all', true, 26),
  ('Автоспорт', 'Motorsport', 'motorsport', 'gauge', 'individual', 'technical', 'all', false, 27),
  ('Киберспорт', 'Esports', 'esports', 'monitor', 'team', 'mixed', 'all', false, 28),
  ('Триатлон', 'Triathlon', 'triathlon', 'timer', 'individual', 'cyclic', 'summer', true, 29),
  ('Конькобежный спорт', 'Speed Skating', 'speed-skating', 'snowflake', 'individual', 'cyclic', 'winter', true, 30);

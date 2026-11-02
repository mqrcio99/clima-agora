CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT CHECK (char_length(display_name) <= 80),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  city_name TEXT NOT NULL CHECK (char_length(city_name) BETWEEN 2 AND 120),
  display_name TEXT NOT NULL CHECK (char_length(display_name) BETWEEN 2 AND 120),
  latitude DOUBLE PRECISION NOT NULL CHECK (latitude BETWEEN -90 AND 90),
  longitude DOUBLE PRECISION NOT NULL CHECK (longitude BETWEEN -180 AND 180),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, city_name),
  UNIQUE (user_id, latitude, longitude)
);

CREATE TABLE IF NOT EXISTS public.preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  unit_system TEXT NOT NULL DEFAULT 'metric' CHECK (unit_system IN ('metric', 'imperial')),
  theme_preference TEXT NOT NULL DEFAULT 'auto' CHECK (theme_preference IN ('auto', 'light', 'dark')),
  default_city TEXT CHECK (char_length(default_city) BETWEEN 2 AND 120),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS profiles_updated_at_idx
  ON public.profiles (updated_at);

CREATE INDEX IF NOT EXISTS favorites_user_id_idx
  ON public.favorites (user_id);

CREATE INDEX IF NOT EXISTS favorites_user_city_idx
  ON public.favorites (user_id, city_name);

CREATE INDEX IF NOT EXISTS preferences_user_id_idx
  ON public.preferences (user_id);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "favorites_select_own"
ON public.favorites
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "favorites_insert_own"
ON public.favorites
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "favorites_update_own"
ON public.favorites
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "favorites_delete_own"
ON public.favorites
FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "preferences_select_own"
ON public.preferences
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "preferences_insert_own"
ON public.preferences
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "preferences_update_own"
ON public.preferences
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "preferences_delete_own"
ON public.preferences
FOR DELETE
USING (auth.uid() = user_id);

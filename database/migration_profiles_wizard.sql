-- Migration: إضافة أعمدة wizard S-02 لجدول profiles
ALTER TABLE public.profiles

  -- الخطوة 1
  ADD COLUMN IF NOT EXISTS first_name        TEXT,
  ADD COLUMN IF NOT EXISTS last_name         TEXT,
  ADD COLUMN IF NOT EXISTS full_name         TEXT,
  ADD COLUMN IF NOT EXISTS dob               DATE,
  ADD COLUMN IF NOT EXISTS gender            TEXT CHECK (gender IN ('male','female')),
  ADD COLUMN IF NOT EXISTS weight_kg         NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS height_cm         NUMERIC(5,1),
  ADD COLUMN IF NOT EXISTS blood_type        TEXT,
  ADD COLUMN IF NOT EXISTS timezone          TEXT,

  -- الخطوة 2
  ADD COLUMN IF NOT EXISTS inbody_weight     NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS inbody_fat        NUMERIC(4,1),
  ADD COLUMN IF NOT EXISTS inbody_muscle     NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS inbody_visceral   INT,
  ADD COLUMN IF NOT EXISTS inbody_bmr        INT,
  ADD COLUMN IF NOT EXISTS inbody_water      NUMERIC(4,1),
  ADD COLUMN IF NOT EXISTS inbody_date       DATE,
  ADD COLUMN IF NOT EXISTS wearable_device   TEXT,

  -- الخطوة 3
  ADD COLUMN IF NOT EXISTS bio_constitution      TEXT,
  ADD COLUMN IF NOT EXISTS constitution_scores   JSONB,

  -- الخطوة 4
  ADD COLUMN IF NOT EXISTS activity_level        TEXT,
  ADD COLUMN IF NOT EXISTS diet_type             TEXT,
  ADD COLUMN IF NOT EXISTS meals_per_day         TEXT,
  ADD COLUMN IF NOT EXISTS last_meal_time        TEXT,
  ADD COLUMN IF NOT EXISTS has_snack             BOOLEAN,
  ADD COLUMN IF NOT EXISTS snack_type            TEXT,
  ADD COLUMN IF NOT EXISTS has_caffeine          BOOLEAN,
  ADD COLUMN IF NOT EXISTS caffeine_type         TEXT,
  ADD COLUMN IF NOT EXISTS last_caffeine_time    TEXT,
  ADD COLUMN IF NOT EXISTS daily_water           TEXT,
  ADD COLUMN IF NOT EXISTS fasting_level         TEXT,
  ADD COLUMN IF NOT EXISTS sleep_time            TEXT,
  ADD COLUMN IF NOT EXISTS wake_time             TEXT,
  ADD COLUMN IF NOT EXISTS sleep_hours           NUMERIC(4,1),

  -- الخطوة 5
  ADD COLUMN IF NOT EXISTS chronic_conditions    JSONB,
  ADD COLUMN IF NOT EXISTS injuries              JSONB,
  ADD COLUMN IF NOT EXISTS surgeries             JSONB,
  ADD COLUMN IF NOT EXISTS medications           JSONB,
  ADD COLUMN IF NOT EXISTS no_medications        BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS smoking_status        TEXT,
  ADD COLUMN IF NOT EXISTS smoking_packs         NUMERIC(4,1),
  ADD COLUMN IF NOT EXISTS smoking_years         INT,
  ADD COLUMN IF NOT EXISTS allergies             JSONB,
  ADD COLUMN IF NOT EXISTS health_notes          TEXT,

  -- الخطوة 6
  ADD COLUMN IF NOT EXISTS goals                 JSONB,
  ADD COLUMN IF NOT EXISTS goals_mode            TEXT,

  -- الحالة
  ADD COLUMN IF NOT EXISTS setup_step            INT DEFAULT 1,
  ADD COLUMN IF NOT EXISTS setup_completed       BOOLEAN DEFAULT false;

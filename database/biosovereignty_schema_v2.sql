-- ================================================================
-- BioSovereignty Platform — Complete Database Schema v2.0
-- Hetzner VPS | Supabase Self-Hosted | PostgreSQL
-- ================================================================
-- Tables : 26
-- Storage : Hetzner Only (user-data, exports)
-- Security: RLS on ALL tables | audit_logs mandatory
-- Compliance: PDPL (Saudi Arabia)
-- ================================================================

-- ================================================================
-- 0. EXTENSIONS
-- ================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";      -- for text search


-- ================================================================
-- 1. ENUMS
-- ================================================================

CREATE TYPE supplement_form     AS ENUM ('capsule','tablet','powder','liquid','softgel','spray');
CREATE TYPE goal_status         AS ENUM ('active','paused','completed','cancelled');
CREATE TYPE goal_category       AS ENUM ('weight','muscle','sleep','energy','performance','labs','custom');
CREATE TYPE upload_type         AS ENUM ('lab_result','inbody','progress_photo','document','other');
CREATE TYPE audit_action        AS ENUM ('INSERT','UPDATE','DELETE','SELECT','LOGIN','LOGOUT','EXPORT','DOWNLOAD');
CREATE TYPE deletion_status     AS ENUM ('pending','in_progress','completed','rejected');
CREATE TYPE alert_severity      AS ENUM ('info','warning','critical');
CREATE TYPE alert_source_type   AS ENUM ('system','n8n','claude','manual');
CREATE TYPE meal_source_type    AS ENUM ('manual','photo','barcode','voice');
CREATE TYPE vital_source_type   AS ENUM ('manual','whoop','cgm','other');
CREATE TYPE session_type        AS ENUM ('chat','meeting_room','weekly_review','monthly_review','second_opinion','debate');
CREATE TYPE pr_type             AS ENUM ('1rm','reps','volume','time','distance');
CREATE TYPE change_type         AS ENUM ('added','removed','dose_changed','timing_changed','paused','resumed');
CREATE TYPE snapshot_type       AS ENUM ('periodic','session_end','manual','milestone');
CREATE TYPE deletion_scope      AS ENUM ('full_account','specific_data','export_then_delete');
CREATE TYPE user_role           AS ENUM ('owner','tester','admin');
CREATE TYPE photo_angle         AS ENUM ('front','side','back','custom');


-- ================================================================
-- 2. HELPER: updated_at AUTO-TRIGGER
-- ================================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


-- ================================================================
-- 3. AUDIT LOG TRIGGER FUNCTION
-- ================================================================

CREATE OR REPLACE FUNCTION audit_trigger_fn()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  _user_id UUID;
BEGIN
  -- Try to get current user id safely
  BEGIN
    _user_id := auth.uid();
  EXCEPTION WHEN OTHERS THEN
    _user_id := NULL;
  END;

  INSERT INTO public.audit_logs (
    user_id,
    action,
    table_name,
    record_id,
    old_data,
    new_data,
    performed_at
  )
  VALUES (
    _user_id,
    TG_OP::audit_action,
    TG_TABLE_NAME,
    CASE
      WHEN TG_OP = 'DELETE' THEN OLD.id
      ELSE NEW.id
    END,
    CASE WHEN TG_OP IN ('UPDATE','DELETE') THEN row_to_json(OLD)::JSONB ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT','UPDATE') THEN row_to_json(NEW)::JSONB ELSE NULL END,
    NOW()
  );
  RETURN NULL;
END;
$$;


-- ================================================================
-- 4. MACRO: attach audit + updated_at triggers to a table
-- ================================================================
-- Usage after each CREATE TABLE:
--   SELECT attach_audit_trigger('table_name');
--   SELECT attach_updated_at_trigger('table_name');  -- if has updated_at

CREATE OR REPLACE FUNCTION attach_audit_trigger(tbl TEXT)
RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
  EXECUTE format(
    'CREATE TRIGGER audit_%I
     AFTER INSERT OR UPDATE OR DELETE ON public.%I
     FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();',
    tbl, tbl
  );
END;
$$;

CREATE OR REPLACE FUNCTION attach_updated_at_trigger(tbl TEXT)
RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
  EXECUTE format(
    'CREATE TRIGGER set_updated_at_%I
     BEFORE UPDATE ON public.%I
     FOR EACH ROW EXECUTE FUNCTION set_updated_at();',
    tbl, tbl
  );
END;
$$;


-- ================================================================
-- 5. TABLES
-- ================================================================

-- ──────────────────────────────────────────────
-- 5.1  USERS  (auth layer)
-- ──────────────────────────────────────────────
CREATE TABLE public.users (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT UNIQUE NOT NULL,
  full_name     TEXT,
  role          user_role NOT NULL DEFAULT 'owner',
  language      TEXT NOT NULL DEFAULT 'ar' CHECK (language IN ('ar','en')),
  is_active     BOOLEAN NOT NULL DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

SELECT attach_updated_at_trigger('users');
SELECT attach_audit_trigger('users');


-- ──────────────────────────────────────────────
-- 5.2  PROFILES  (الدستور الحيوي)
-- ──────────────────────────────────────────────
CREATE TABLE public.profiles (
  id                       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                  UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  -- Personal
  date_of_birth            DATE,
  gender                   TEXT CHECK (gender IN ('male','female')),
  height_cm                NUMERIC(5,1),
  blood_type               TEXT,
  nationality              TEXT DEFAULT 'SA',
  -- Baseline body
  base_weight_kg           NUMERIC(5,2),
  target_weight_kg         NUMERIC(5,2),
  body_fat_pct             NUMERIC(4,1),
  muscle_mass_kg           NUMERIC(5,2),
  -- Health context
  medical_conditions       TEXT[],
  allergies                TEXT[],
  medications              TEXT[],
  health_notes             TEXT,
  -- BioSov config
  biosov_score             INT DEFAULT 0 CHECK (biosov_score BETWEEN 0 AND 1000),
  daily_protein_target_g   INT DEFAULT 165,
  daily_water_target_ml    INT DEFAULT 3000,
  fasting_window_hours     INT DEFAULT 18,
  -- Meta
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

SELECT attach_updated_at_trigger('profiles');
SELECT attach_audit_trigger('profiles');


-- ──────────────────────────────────────────────
-- 5.3  HEALTH_GOALS
-- ──────────────────────────────────────────────
CREATE TABLE public.health_goals (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  category      goal_category NOT NULL,
  title         TEXT NOT NULL,
  description   TEXT,
  target_value  NUMERIC,
  current_value NUMERIC,
  unit          TEXT,
  status        goal_status NOT NULL DEFAULT 'active',
  start_date    DATE NOT NULL DEFAULT CURRENT_DATE,
  target_date   DATE,
  completed_at  TIMESTAMPTZ,
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

SELECT attach_updated_at_trigger('health_goals');
SELECT attach_audit_trigger('health_goals');


-- ──────────────────────────────────────────────
-- 5.4  DAILY_LOGS  (WHOOP + daily KPIs)
-- ──────────────────────────────────────────────
CREATE TABLE public.daily_logs (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  log_date              DATE NOT NULL,
  -- WHOOP
  whoop_recovery_pct    INT CHECK (whoop_recovery_pct BETWEEN 0 AND 100),
  whoop_hrv_ms          NUMERIC(6,1),
  whoop_rhr_bpm         INT,
  whoop_strain          NUMERIC(4,1),
  whoop_sleep_score     INT CHECK (whoop_sleep_score BETWEEN 0 AND 100),
  -- Body
  weight_kg             NUMERIC(5,2),
  -- Nutrition summary
  total_protein_g       NUMERIC(6,1),
  total_calories        INT,
  total_water_ml        INT,
  fasting_hours         NUMERIC(4,1),
  last_meal_at          TIMESTAMPTZ,
  -- Scores
  daily_score           INT CHECK (daily_score BETWEEN 0 AND 100),
  biosov_score_delta    INT,
  -- Raw
  raw_whoop_json        JSONB,
  notes                 TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, log_date)
);

SELECT attach_updated_at_trigger('daily_logs');
SELECT attach_audit_trigger('daily_logs');


-- ──────────────────────────────────────────────
-- 5.5  VITAL_SIGNS
-- ──────────────────────────────────────────────
CREATE TABLE public.vital_signs (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  measured_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Cardiovascular
  systolic_bp           INT,
  diastolic_bp          INT,
  heart_rate_bpm        INT,
  hrv_ms                NUMERIC(6,1),
  spo2_pct              NUMERIC(4,1),
  -- Temperature
  body_temp_c           NUMERIC(4,1),
  -- Glucose
  blood_glucose_mmol    NUMERIC(4,1),
  glucose_context       TEXT CHECK (glucose_context IN ('fasting','post_meal_1h','post_meal_2h','random')),
  -- Respiratory
  respiratory_rate      INT,
  -- Source
  source                vital_source_type DEFAULT 'manual',
  notes                 TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

SELECT attach_audit_trigger('vital_signs');


-- ──────────────────────────────────────────────
-- 5.6  SLEEP_RECORDS  (مفصّل — يكمل daily_logs)
-- ──────────────────────────────────────────────
CREATE TABLE public.sleep_records (
  id                     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  sleep_date             DATE NOT NULL,
  start_at               TIMESTAMPTZ NOT NULL,
  end_at                 TIMESTAMPTZ NOT NULL,
  -- Stages (minutes)
  deep_sleep_min         INT,
  rem_sleep_min          INT,
  light_sleep_min        INT,
  awake_min              INT,
  -- Quality
  sleep_score            INT CHECK (sleep_score BETWEEN 0 AND 100),
  sleep_efficiency_pct   NUMERIC(4,1),
  -- Environment
  room_temp_c            NUMERIC(4,1),
  -- Factors
  caffeine_cutoff_at     TIMESTAMPTZ,
  screen_off_min_before  INT,
  -- Source
  source                 TEXT DEFAULT 'whoop',
  raw_data               JSONB,
  notes                  TEXT,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, sleep_date)
);

SELECT attach_audit_trigger('sleep_records');


-- ──────────────────────────────────────────────
-- 5.7  MOOD_LOGS
-- ──────────────────────────────────────────────
CREATE TABLE public.mood_logs (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id            UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  logged_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  mood_score         INT NOT NULL CHECK (mood_score BETWEEN 1 AND 10),
  energy_level       INT CHECK (energy_level BETWEEN 1 AND 10),
  stress_level       INT CHECK (stress_level BETWEEN 1 AND 10),
  focus_level        INT CHECK (focus_level BETWEEN 1 AND 10),
  mood_tags          TEXT[],
  context            TEXT CHECK (context IN ('morning','afternoon','evening','night')),
  positive_triggers  TEXT[],
  negative_triggers  TEXT[],
  notes              TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

SELECT attach_audit_trigger('mood_logs');


-- ──────────────────────────────────────────────
-- 5.8  MEALS
-- ──────────────────────────────────────────────
CREATE TABLE public.meals (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  eaten_at            TIMESTAMPTZ NOT NULL,
  meal_type           TEXT CHECK (meal_type IN ('breakfast','lunch','dinner','snack','iftar','suhoor')),
  -- Macros
  calories            INT,
  protein_g           NUMERIC(6,1),
  carbs_g             NUMERIC(6,1),
  fat_g               NUMERIC(6,1),
  fiber_g             NUMERIC(5,1),
  -- Content
  description         TEXT,
  ingredients         TEXT[],
  inflammatory_score  NUMERIC(4,1) CHECK (inflammatory_score BETWEEN -10 AND 10),
  -- File (Hetzner storage path)
  photo_path          TEXT,
  -- AI
  claude_analysis     JSONB,
  -- Fasting
  fasting_break       BOOLEAN DEFAULT false,
  -- Source
  source              meal_source_type DEFAULT 'manual',
  notes               TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

SELECT attach_updated_at_trigger('meals');
SELECT attach_audit_trigger('meals');


-- ──────────────────────────────────────────────
-- 5.9  WATER_LOGS
-- ──────────────────────────────────────────────
CREATE TABLE public.water_logs (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  logged_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  amount_ml  INT NOT NULL CHECK (amount_ml > 0),
  source     TEXT DEFAULT 'water' CHECK (source IN ('water','electrolyte','juice','other')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

SELECT attach_audit_trigger('water_logs');


-- ──────────────────────────────────────────────
-- 5.10  WORKOUTS
-- ──────────────────────────────────────────────
CREATE TABLE public.workouts (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  workout_date          DATE NOT NULL,
  started_at            TIMESTAMPTZ,
  ended_at              TIMESTAMPTZ,
  duration_min          INT,
  workout_type          TEXT CHECK (workout_type IN ('strength','cardio','hiit','yoga','mobility','sport','other')),
  -- Load
  total_volume_kg       NUMERIC(8,1),
  whoop_strain          NUMERIC(4,1),
  rpe                   INT CHECK (rpe BETWEEN 1 AND 10),
  -- Health markers
  knee_pain_level       INT CHECK (knee_pain_level BETWEEN 0 AND 10),
  -- Exercises (array of {name, sets, reps, weight_kg, rpe})
  exercises             JSONB,
  -- AI coaching
  coach_recommendation  TEXT,
  deload_week           BOOLEAN DEFAULT false,
  notes                 TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

SELECT attach_updated_at_trigger('workouts');
SELECT attach_audit_trigger('workouts');


-- ──────────────────────────────────────────────
-- 5.11  PR_RECORDS  (Personal Records)
-- ──────────────────────────────────────────────
CREATE TABLE public.pr_records (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  exercise_name    TEXT NOT NULL,
  pr_type          pr_type NOT NULL,
  value            NUMERIC(8,2) NOT NULL,
  unit             TEXT NOT NULL,
  achieved_at      DATE NOT NULL,
  previous_value   NUMERIC(8,2),
  improvement_pct  NUMERIC(5,2),
  workout_id       UUID REFERENCES public.workouts(id) ON DELETE SET NULL,
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

SELECT attach_audit_trigger('pr_records');


-- ──────────────────────────────────────────────
-- 5.12  SUPPLEMENTS
-- ──────────────────────────────────────────────
CREATE TABLE public.supplements (
  id                       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                  UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name                     TEXT NOT NULL,
  form                     supplement_form DEFAULT 'capsule',
  dose_amount              NUMERIC(8,2),
  dose_unit                TEXT DEFAULT 'mg',
  timing_windows           TEXT[] DEFAULT ARRAY['morning'],
  take_with_food           BOOLEAN DEFAULT false,
  is_active                BOOLEAN DEFAULT true,
  started_at               DATE,
  paused_at                DATE,
  purpose                  TEXT,
  blood_marker_correlation TEXT,
  interaction_flags        TEXT[],
  notes                    TEXT,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

SELECT attach_updated_at_trigger('supplements');
SELECT attach_audit_trigger('supplements');


-- ──────────────────────────────────────────────
-- 5.13  SUPPLEMENT_CHANGES
-- ──────────────────────────────────────────────
CREATE TABLE public.supplement_changes (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  supplement_id    UUID REFERENCES public.supplements(id) ON DELETE SET NULL,
  supplement_name  TEXT NOT NULL,
  change_type      change_type NOT NULL,
  old_value        JSONB,
  new_value        JSONB,
  suggested_by     TEXT,
  reason           TEXT,
  changed_at       DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

SELECT attach_audit_trigger('supplement_changes');


-- ──────────────────────────────────────────────
-- 5.14  LAB_RESULTS
-- ──────────────────────────────────────────────
CREATE TABLE public.lab_results (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  test_date             DATE NOT NULL,
  lab_type              TEXT NOT NULL CHECK (lab_type IN ('blood','htma','urine','cortisol','hormones','other')),
  -- JSONB for flexibility across test types
  results               JSONB NOT NULL,
  -- File (Hetzner path)
  report_path           TEXT,
  -- AI
  claude_interpretation TEXT,
  flags                 JSONB,
  -- Meta
  lab_name              TEXT,
  ordering_physician    TEXT,
  notes                 TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

SELECT attach_updated_at_trigger('lab_results');
SELECT attach_audit_trigger('lab_results');


-- ──────────────────────────────────────────────
-- 5.15  INBODY_REPORTS
-- ──────────────────────────────────────────────
CREATE TABLE public.inbody_reports (
  id                       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                  UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  report_date              DATE NOT NULL,
  -- Core metrics
  weight_kg                NUMERIC(5,2),
  bmi                      NUMERIC(4,1),
  body_fat_pct             NUMERIC(4,1),
  skeletal_muscle_mass_kg  NUMERIC(5,2),
  body_fat_mass_kg         NUMERIC(5,2),
  lean_body_mass_kg        NUMERIC(5,2),
  trunk_fat_pct            NUMERIC(4,1),
  -- Water
  total_body_water_l       NUMERIC(4,1),
  intracellular_water_l    NUMERIC(4,1),
  extracellular_water_l    NUMERIC(4,1),
  -- Metabolic
  bmr_kcal                 INT,
  visceral_fat_level       INT,
  -- File
  report_path              TEXT,
  raw_data                 JSONB,
  notes                    TEXT,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, report_date)
);

SELECT attach_audit_trigger('inbody_reports');


-- ──────────────────────────────────────────────
-- 5.16  CONVERSATIONS  (AI sessions)
-- ──────────────────────────────────────────────
CREATE TABLE public.conversations (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  specialist_id    TEXT,
  specialist_name  TEXT,
  session_type     session_type NOT NULL DEFAULT 'chat',
  title            TEXT,
  summary          TEXT,
  key_decisions    JSONB,
  recommendations  JSONB,
  started_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at         TIMESTAMPTZ,
  is_archived      BOOLEAN DEFAULT false,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

SELECT attach_updated_at_trigger('conversations');
SELECT attach_audit_trigger('conversations');


-- ──────────────────────────────────────────────
-- 5.17  MESSAGES  (within conversations)
-- ──────────────────────────────────────────────
CREATE TABLE public.messages (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role            TEXT NOT NULL CHECK (role IN ('user','assistant','system')),
  content         TEXT NOT NULL,
  specialist_id   TEXT,
  tokens_used     INT,
  model           TEXT,
  attachments     JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

SELECT attach_audit_trigger('messages');


-- ──────────────────────────────────────────────
-- 5.18  MEETING_ROOMS
-- ──────────────────────────────────────────────
CREATE TABLE public.meeting_rooms (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  conversation_id       UUID REFERENCES public.conversations(id) ON DELETE SET NULL,
  title                 TEXT,
  specialists_involved  TEXT[] NOT NULL,
  user_question         TEXT NOT NULL,
  specialist_responses  JSONB,
  consensus_summary     TEXT,
  final_decision        TEXT,
  action_items          JSONB,
  held_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

SELECT attach_updated_at_trigger('meeting_rooms');
SELECT attach_audit_trigger('meeting_rooms');


-- ──────────────────────────────────────────────
-- 5.19  MEMORY_SNAPSHOTS
-- ──────────────────────────────────────────────
CREATE TABLE public.memory_snapshots (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id              UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  specialist_id        TEXT NOT NULL,
  snapshot_type        snapshot_type DEFAULT 'periodic',
  key_insights         JSONB,
  active_protocols     JSONB,
  open_recommendations JSONB,
  context_summary      TEXT,
  version              INT NOT NULL DEFAULT 1,
  supersedes_id        UUID REFERENCES public.memory_snapshots(id) ON DELETE SET NULL,
  captured_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

SELECT attach_audit_trigger('memory_snapshots');


-- ──────────────────────────────────────────────
-- 5.20  BEHAVIORAL_SCORES
-- ──────────────────────────────────────────────
CREATE TABLE public.behavioral_scores (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id              UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  score_date           DATE NOT NULL,
  -- Components (0-100)
  sleep_score          INT CHECK (sleep_score BETWEEN 0 AND 100),
  nutrition_score      INT CHECK (nutrition_score BETWEEN 0 AND 100),
  training_score       INT CHECK (training_score BETWEEN 0 AND 100),
  supplement_score     INT CHECK (supplement_score BETWEEN 0 AND 100),
  stress_score         INT CHECK (stress_score BETWEEN 0 AND 100),
  -- Aggregated
  daily_score          INT CHECK (daily_score BETWEEN 0 AND 100),
  biosov_score         INT CHECK (biosov_score BETWEEN 0 AND 1000),
  score_delta          INT,
  streak_days          INT DEFAULT 0,
  -- Analysis
  top_positive_factors TEXT[],
  top_negative_factors TEXT[],
  claude_comment       TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, score_date)
);

SELECT attach_audit_trigger('behavioral_scores');


-- ──────────────────────────────────────────────
-- 5.21  ALERTS
-- ──────────────────────────────────────────────
CREATE TABLE public.alerts (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  alert_type      TEXT NOT NULL CHECK (alert_type IN ('supplement','hrv','sleep','weight','lab','custom','goal')),
  severity        alert_severity NOT NULL DEFAULT 'info',
  title           TEXT NOT NULL,
  message         TEXT NOT NULL,
  trigger_value   NUMERIC,
  threshold_value NUMERIC,
  is_read         BOOLEAN DEFAULT false,
  is_dismissed    BOOLEAN DEFAULT false,
  read_at         TIMESTAMPTZ,
  action_taken    TEXT,
  source          alert_source_type DEFAULT 'system',
  triggered_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

SELECT attach_audit_trigger('alerts');


-- ──────────────────────────────────────────────
-- 5.22  USER_UPLOADS  (Hetzner Supabase Storage only)
-- ──────────────────────────────────────────────
CREATE TABLE public.user_uploads (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id            UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  upload_type        upload_type NOT NULL,
  file_name          TEXT NOT NULL,
  file_size_bytes    INT CHECK (file_size_bytes > 0),
  mime_type          TEXT,
  -- Storage on Hetzner Supabase Self-Hosted — no third-party cloud
  storage_bucket     TEXT NOT NULL DEFAULT 'user-data'
                       CHECK (storage_bucket IN ('user-data','exports')),
  storage_path       TEXT NOT NULL,
  -- Processing
  is_processed       BOOLEAN DEFAULT false,
  processing_result  JSONB,
  claude_analysis    JSONB,
  -- Reference to any linked record
  linked_table       TEXT,
  linked_id          UUID,
  -- Expiry (exports bucket: 24h TTL)
  expires_at         TIMESTAMPTZ,
  is_deleted         BOOLEAN DEFAULT false,
  deleted_at         TIMESTAMPTZ,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

SELECT attach_updated_at_trigger('user_uploads');
SELECT attach_audit_trigger('user_uploads');


-- ──────────────────────────────────────────────
-- 5.23  PROGRESS_PHOTOS  (Hetzner only)
-- ──────────────────────────────────────────────
CREATE TABLE public.progress_photos (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  photo_date            DATE NOT NULL,
  -- Hetzner Supabase Storage path — no AWS/S3
  storage_path          TEXT NOT NULL,
  storage_bucket        TEXT NOT NULL DEFAULT 'user-data',
  -- Context
  angle                 photo_angle DEFAULT 'front',
  weight_at_time_kg     NUMERIC(5,2),
  body_fat_at_time_pct  NUMERIC(4,1),
  notes                 TEXT,
  is_milestone          BOOLEAN DEFAULT false,
  milestone_label       TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

SELECT attach_audit_trigger('progress_photos');


-- ──────────────────────────────────────────────
-- 5.24  ACHIEVEMENTS
-- ──────────────────────────────────────────────
CREATE TABLE public.achievements (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL,
  category         TEXT CHECK (category IN ('fitness','nutrition','sleep','supplements','consistency','lab','biosov')),
  title            TEXT NOT NULL,
  description      TEXT,
  value            NUMERIC,
  unit             TEXT,
  badge_icon       TEXT,
  badge_color      TEXT,
  points           INT DEFAULT 0,
  earned_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_notified      BOOLEAN DEFAULT false,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

SELECT attach_audit_trigger('achievements');


-- ──────────────────────────────────────────────
-- 5.25  AUDIT_LOGS  (immutable — no UPDATE/DELETE)
-- ──────────────────────────────────────────────
CREATE TABLE public.audit_logs (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action       audit_action NOT NULL,
  table_name   TEXT NOT NULL,
  record_id    UUID,
  old_data     JSONB,
  new_data     JSONB,
  ip_address   INET,
  user_agent   TEXT,
  request_id   TEXT,
  performed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  -- Intentionally no updated_at — audit logs are append-only
);

-- Prevent UPDATE and DELETE on audit_logs (immutability)
CREATE OR REPLACE RULE audit_no_update AS
  ON UPDATE TO public.audit_logs DO INSTEAD NOTHING;

CREATE OR REPLACE RULE audit_no_delete AS
  ON DELETE TO public.audit_logs DO INSTEAD NOTHING;


-- ──────────────────────────────────────────────
-- 5.26  DATA_DELETION_REQUESTS  (PDPL compliance)
-- ──────────────────────────────────────────────
CREATE TABLE public.data_deletion_requests (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID REFERENCES public.users(id) ON DELETE SET NULL,
  requested_by      UUID REFERENCES public.users(id),
  reason            TEXT,
  scope             deletion_scope NOT NULL,
  specific_tables   TEXT[],
  -- Legal
  legal_basis       TEXT DEFAULT 'PDPL Article 17 — Right to Erasure',
  reference_number  TEXT UNIQUE DEFAULT
                      'DEL-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' ||
                      LPAD(FLOOR(RANDOM() * 9999 + 1)::TEXT, 4, '0'),
  -- Status
  status            deletion_status NOT NULL DEFAULT 'pending',
  -- PDPL mandates completion within 30 days
  requested_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  acknowledged_at   TIMESTAMPTZ,
  completed_at      TIMESTAMPTZ,
  deadline_at       TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
  processed_by      UUID REFERENCES public.users(id),
  processing_notes  TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

SELECT attach_updated_at_trigger('data_deletion_requests');
SELECT attach_audit_trigger('data_deletion_requests');


-- ================================================================
-- 6. INDEXES  (performance)
-- ================================================================

-- users
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role  ON public.users(role);

-- profiles
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);

-- health_goals
CREATE INDEX idx_health_goals_user_status ON public.health_goals(user_id, status);

-- daily_logs
CREATE INDEX idx_daily_logs_user_date     ON public.daily_logs(user_id, log_date DESC);
CREATE INDEX idx_daily_logs_date          ON public.daily_logs(log_date DESC);

-- vital_signs
CREATE INDEX idx_vital_signs_user_time    ON public.vital_signs(user_id, measured_at DESC);

-- sleep_records
CREATE INDEX idx_sleep_records_user_date  ON public.sleep_records(user_id, sleep_date DESC);

-- mood_logs
CREATE INDEX idx_mood_logs_user_time      ON public.mood_logs(user_id, logged_at DESC);

-- meals
CREATE INDEX idx_meals_user_time          ON public.meals(user_id, eaten_at DESC);

-- water_logs
CREATE INDEX idx_water_logs_user_time     ON public.water_logs(user_id, logged_at DESC);

-- workouts
CREATE INDEX idx_workouts_user_date       ON public.workouts(user_id, workout_date DESC);

-- pr_records
CREATE INDEX idx_pr_records_user_exercise ON public.pr_records(user_id, exercise_name);

-- supplements
CREATE INDEX idx_supplements_user_active  ON public.supplements(user_id, is_active);

-- supplement_changes
CREATE INDEX idx_supp_changes_user_date   ON public.supplement_changes(user_id, changed_at DESC);

-- lab_results
CREATE INDEX idx_lab_results_user_date    ON public.lab_results(user_id, test_date DESC);
CREATE INDEX idx_lab_results_type         ON public.lab_results(lab_type);

-- inbody_reports
CREATE INDEX idx_inbody_user_date         ON public.inbody_reports(user_id, report_date DESC);

-- conversations
CREATE INDEX idx_conversations_user       ON public.conversations(user_id, started_at DESC);
CREATE INDEX idx_conversations_specialist ON public.conversations(specialist_id);

-- messages
CREATE INDEX idx_messages_conversation    ON public.messages(conversation_id, created_at);
CREATE INDEX idx_messages_user            ON public.messages(user_id, created_at DESC);

-- meeting_rooms
CREATE INDEX idx_meeting_rooms_user       ON public.meeting_rooms(user_id, held_at DESC);

-- memory_snapshots
CREATE INDEX idx_memory_user_specialist   ON public.memory_snapshots(user_id, specialist_id);

-- behavioral_scores
CREATE INDEX idx_bscores_user_date        ON public.behavioral_scores(user_id, score_date DESC);

-- alerts
CREATE INDEX idx_alerts_user_read         ON public.alerts(user_id, is_read, triggered_at DESC);

-- user_uploads
CREATE INDEX idx_uploads_user_type        ON public.user_uploads(user_id, upload_type);
CREATE INDEX idx_uploads_expires          ON public.user_uploads(expires_at)
  WHERE expires_at IS NOT NULL;

-- progress_photos
CREATE INDEX idx_photos_user_date         ON public.progress_photos(user_id, photo_date DESC);

-- achievements
CREATE INDEX idx_achievements_user        ON public.achievements(user_id, earned_at DESC);

-- audit_logs
CREATE INDEX idx_audit_user_time          ON public.audit_logs(user_id, performed_at DESC);
CREATE INDEX idx_audit_table_action       ON public.audit_logs(table_name, action);
CREATE INDEX idx_audit_performed_at       ON public.audit_logs(performed_at DESC);

-- data_deletion_requests
CREATE INDEX idx_deletion_status          ON public.data_deletion_requests(status, deadline_at);


-- ================================================================
-- 7. ROW LEVEL SECURITY  (على كل جدول — بدون استثناء)
-- ================================================================

-- Enable RLS on all tables
ALTER TABLE public.users                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_goals           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_logs             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vital_signs            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sleep_records          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_logs              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meals                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.water_logs             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pr_records             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplements            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplement_changes     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_results            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inbody_reports         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_rooms          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_snapshots       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.behavioral_scores      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_uploads           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_photos        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_deletion_requests ENABLE ROW LEVEL SECURITY;


-- ── RLS Policies ──────────────────────────────

-- PATTERN A: user owns rows (user_id = auth.uid())
-- Applied to all user-data tables.

-- users: can only see/edit own record
CREATE POLICY "users: own row"
  ON public.users FOR ALL
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- profiles
CREATE POLICY "profiles: own row"
  ON public.profiles FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- health_goals
CREATE POLICY "health_goals: own rows"
  ON public.health_goals FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- daily_logs
CREATE POLICY "daily_logs: own rows"
  ON public.daily_logs FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- vital_signs
CREATE POLICY "vital_signs: own rows"
  ON public.vital_signs FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- sleep_records
CREATE POLICY "sleep_records: own rows"
  ON public.sleep_records FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- mood_logs
CREATE POLICY "mood_logs: own rows"
  ON public.mood_logs FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- meals
CREATE POLICY "meals: own rows"
  ON public.meals FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- water_logs
CREATE POLICY "water_logs: own rows"
  ON public.water_logs FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- workouts
CREATE POLICY "workouts: own rows"
  ON public.workouts FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- pr_records
CREATE POLICY "pr_records: own rows"
  ON public.pr_records FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- supplements
CREATE POLICY "supplements: own rows"
  ON public.supplements FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- supplement_changes
CREATE POLICY "supplement_changes: own rows"
  ON public.supplement_changes FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- lab_results
CREATE POLICY "lab_results: own rows"
  ON public.lab_results FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- inbody_reports
CREATE POLICY "inbody_reports: own rows"
  ON public.inbody_reports FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- conversations
CREATE POLICY "conversations: own rows"
  ON public.conversations FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- messages: own conversation
CREATE POLICY "messages: own rows"
  ON public.messages FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- meeting_rooms
CREATE POLICY "meeting_rooms: own rows"
  ON public.meeting_rooms FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- memory_snapshots
CREATE POLICY "memory_snapshots: own rows"
  ON public.memory_snapshots FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- behavioral_scores
CREATE POLICY "behavioral_scores: own rows"
  ON public.behavioral_scores FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- alerts
CREATE POLICY "alerts: own rows"
  ON public.alerts FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- user_uploads
CREATE POLICY "user_uploads: own rows"
  ON public.user_uploads FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- progress_photos
CREATE POLICY "progress_photos: own rows"
  ON public.progress_photos FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- achievements
CREATE POLICY "achievements: own rows"
  ON public.achievements FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- audit_logs: read own, system inserts via SECURITY DEFINER function
CREATE POLICY "audit_logs: read own"
  ON public.audit_logs FOR SELECT
  USING (user_id = auth.uid());

-- No INSERT/UPDATE/DELETE policies on audit_logs from client — only via trigger

-- data_deletion_requests: read own, insert own
CREATE POLICY "deletion_requests: own rows"
  ON public.data_deletion_requests FOR ALL
  USING (user_id = auth.uid() OR requested_by = auth.uid())
  WITH CHECK (requested_by = auth.uid());


-- ================================================================
-- 8. STORAGE BUCKETS  (Hetzner — Supabase Self-Hosted)
-- ================================================================
-- NOTE: Run these via Supabase Dashboard > Storage > New Bucket
-- OR via the Management API — not raw SQL.
-- Included here as documentation / idempotent setup script.

-- Bucket: user-data
--   Visibility : PRIVATE
--   Encryption : enabled
--   Purpose    : all user files (photos, reports, docs)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user-data',
  'user-data',
  false,                                    -- private
  52428800,                                 -- 50 MB per file
  ARRAY[
    'image/jpeg','image/png','image/webp',
    'application/pdf',
    'text/csv','application/json'
  ]
) ON CONFLICT (id) DO NOTHING;

-- Bucket: exports
--   Visibility : PRIVATE
--   TTL        : 24 hours (enforced by expires_at in user_uploads)
--   Purpose    : temp generated exports (PDF reports, data exports)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'exports',
  'exports',
  false,
  104857600,                                -- 100 MB per export
  ARRAY['application/pdf','application/zip','text/csv','application/json']
) ON CONFLICT (id) DO NOTHING;

-- Storage RLS: user can only access their own files
CREATE POLICY "user-data: own files"
  ON storage.objects FOR ALL
  USING (bucket_id = 'user-data' AND auth.uid()::TEXT = (storage.foldername(name))[1])
  WITH CHECK (bucket_id = 'user-data' AND auth.uid()::TEXT = (storage.foldername(name))[1]);

CREATE POLICY "exports: own files"
  ON storage.objects FOR ALL
  USING (bucket_id = 'exports' AND auth.uid()::TEXT = (storage.foldername(name))[1])
  WITH CHECK (bucket_id = 'exports' AND auth.uid()::TEXT = (storage.foldername(name))[1]);


-- ================================================================
-- 9. CLEANUP FUNCTION: auto-delete expired exports
-- ================================================================
-- Run via n8n cron (daily) or pg_cron

CREATE OR REPLACE FUNCTION cleanup_expired_exports()
RETURNS INT LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  deleted_count INT;
BEGIN
  -- Mark expired uploads
  UPDATE public.user_uploads
  SET is_deleted = true, deleted_at = NOW()
  WHERE expires_at < NOW()
    AND is_deleted = false
    AND storage_bucket = 'exports';

  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  -- Optionally: delete from storage.objects here or let n8n handle it
  RETURN deleted_count;
END;
$$;


-- ================================================================
-- 10. SCHEMA SUMMARY
-- ================================================================
--
--  TABLE                    | Origin        | RLS | Audit
--  ─────────────────────────┼───────────────┼─────┼──────
--  users                    | Proposed      |  ✅  |  ✅
--  profiles                 | Brain.md      |  ✅  |  ✅
--  health_goals             | Proposed      |  ✅  |  ✅
--  daily_logs               | Brain.md      |  ✅  |  ✅
--  vital_signs              | Proposed      |  ✅  |  ✅
--  sleep_records            | Proposed      |  ✅  |  ✅
--  mood_logs                | Proposed      |  ✅  |  ✅
--  meals                    | Brain.md      |  ✅  |  ✅
--  water_logs               | Brain.md      |  ✅  |  ✅
--  workouts                 | Brain.md      |  ✅  |  ✅
--  pr_records               | Brain.md      |  ✅  |  ✅
--  supplements              | Brain.md      |  ✅  |  ✅
--  supplement_changes       | Brain.md      |  ✅  |  ✅
--  lab_results              | Brain.md      |  ✅  |  ✅
--  inbody_reports           | Brain.md      |  ✅  |  ✅
--  conversations            | Brain.md      |  ✅  |  ✅
--  messages                 | Proposed      |  ✅  |  ✅
--  meeting_rooms            | Brain.md      |  ✅  |  ✅
--  memory_snapshots         | Brain.md      |  ✅  |  ✅
--  behavioral_scores        | Brain.md      |  ✅  |  ✅
--  alerts                   | Brain.md      |  ✅  |  ✅
--  user_uploads             | Proposed      |  ✅  |  ✅
--  progress_photos          | Proposed      |  ✅  |  ✅
--  achievements             | Proposed      |  ✅  |  ✅
--  audit_logs               | Proposed      |  ✅  |  (N/A)
--  data_deletion_requests   | Proposed      |  ✅  |  ✅
--  ─────────────────────────┴───────────────┴─────┴──────
--  TOTAL: 26 tables | Storage: Hetzner only | PDPL: ✅
--
-- ================================================================

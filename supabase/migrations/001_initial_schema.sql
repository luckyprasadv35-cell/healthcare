-- ============================================================
-- Supabase Cloud PostgreSQL Migration: 001_initial_schema.sql
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. PROFILES TABLE
-- Maps 1:1 to Supabase Auth users (auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    age INT NOT NULL CHECK (age >= 13 AND age <= 120),
    weight_kg DECIMAL(5,2) NOT NULL CHECK (weight_kg >= 20 AND weight_kg <= 500),
    height_cm DECIMAL(5,2) NOT NULL CHECK (height_cm >= 50 AND height_cm <= 300),
    gender VARCHAR(20) NOT NULL CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
    activity_level VARCHAR(50) NOT NULL CHECK (activity_level IN ('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active')),
    goal VARCHAR(50) NOT NULL CHECK (goal IN ('muscle_gain', 'fat_loss', 'endurance', 'recomposition', 'mobility_recovery')),
    diet_preference VARCHAR(50) NOT NULL CHECK (diet_preference IN ('standard', 'keto', 'paleo', 'vegan', 'vegetarian', 'pescatarian')),
    equipment VARCHAR(50) NOT NULL CHECK (equipment IN ('full_gym', 'dumbbells_only', 'bodyweight_home')),
    medical_notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. USER_PLANS TABLE
-- Stores AI-generated workout and nutrition plans
-- ============================================================
CREATE TABLE IF NOT EXISTS user_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    workout_plan JSONB NOT NULL,
    nutrition_plan JSONB NOT NULL,
    macros JSONB NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_plans_active ON user_plans(user_id, is_active) WHERE is_active = TRUE;

-- ============================================================
-- 3. PROGRESS_LOGS TABLE
-- Tracks weight entries over time
-- ============================================================
CREATE TABLE IF NOT EXISTS progress_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    weight_kg DECIMAL(5,2) NOT NULL CHECK (weight_kg >= 20 AND weight_kg <= 500),
    notes TEXT DEFAULT '',
    log_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_progress_logs_user_date ON progress_logs(user_id, log_date DESC);

-- ============================================================
-- 4. FUNCTIONS & TRIGGERS
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON profiles;
CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION deactivate_old_plans()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE user_plans
    SET is_active = FALSE
    WHERE user_id = NEW.user_id
      AND id != NEW.id
      AND is_active = TRUE;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS deactivate_previous_plans ON user_plans;
CREATE TRIGGER deactivate_previous_plans
    AFTER INSERT ON user_plans
    FOR EACH ROW
    EXECUTE FUNCTION deactivate_old_plans();

-- ============================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_logs ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own profile') THEN
        CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own profile') THEN
        CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own profile') THEN
        CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
    END IF;
END $$;

-- Plans Policies
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own plans') THEN
        CREATE POLICY "Users can view own plans" ON user_plans FOR SELECT USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own plans') THEN
        CREATE POLICY "Users can insert own plans" ON user_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- Progress Policies
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own logs') THEN
        CREATE POLICY "Users can view own logs" ON progress_logs FOR SELECT USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own logs') THEN
        CREATE POLICY "Users can insert own logs" ON progress_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

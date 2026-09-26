-- ============================================================
-- Vitalis AI – Row Level Security Policies
-- Run AFTER schema.sql
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PROFILES POLICIES
-- Users can only SELECT, INSERT, UPDATE their own profile row
-- ============================================================
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- ============================================================
-- USER_PLANS POLICIES
-- Users can only SELECT and INSERT their own plans
-- ============================================================
CREATE POLICY "Users can view own plans"
    ON user_plans FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own plans"
    ON user_plans FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- PROGRESS_LOGS POLICIES
-- Users can only SELECT and INSERT their own progress logs
-- ============================================================
CREATE POLICY "Users can view own logs"
    ON progress_logs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own logs"
    ON progress_logs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

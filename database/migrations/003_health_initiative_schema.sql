-- 003_health_initiative_schema.sql
-- منصة صِحّة | من المشكلة إلى الأثر
-- يضيف طبقة المبادرة والصحة والأنشطة والنتائج والأثر والابتكار والشراكات
-- لا يحذف أو يعدّل الجداول الأساسية الموجودة.

BEGIN;

CREATE TABLE IF NOT EXISTS initiative_teams (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    academic_year_id uuid NOT NULL REFERENCES academic_years(id) ON DELETE RESTRICT,
    name text NOT NULL DEFAULT 'فريق المدارس المعززة للصحة',
    description text,
    status text NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'inactive')),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (school_id, academic_year_id)
);

CREATE TABLE IF NOT EXISTS team_members (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id uuid NOT NULL REFERENCES initiative_teams(id) ON DELETE CASCADE,
    profile_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
    member_name text,
    role_name text,
    is_leader boolean NOT NULL DEFAULT false,
    joined_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (team_id, profile_id)
);

CREATE TABLE IF NOT EXISTS health_problems (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    academic_year_id uuid NOT NULL REFERENCES academic_years(id) ON DELETE RESTRICT,
    title text NOT NULL,
    description text,
    evidence_summary text,
    analysis text,
    priority_level text NOT NULL DEFAULT 'medium'
        CHECK (priority_level IN ('low', 'medium', 'high', 'critical')),
    baseline_value numeric,
    baseline_unit text,
    baseline_date date,
    goal_value numeric,
    goal_unit text,
    goal_date date,
    status text NOT NULL DEFAULT 'identified'
        CHECK (status IN ('identified', 'prioritized', 'planned', 'in_progress', 'completed', 'closed')),
    created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS problem_measurements (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    problem_id uuid NOT NULL REFERENCES health_problems(id) ON DELETE CASCADE,
    measured_at date NOT NULL,
    value numeric,
    unit text,
    sample_size integer,
    method text,
    notes text,
    created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS problem_priorities (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    problem_id uuid NOT NULL REFERENCES health_problems(id) ON DELETE CASCADE,
    priority_score numeric,
    rationale text,
    selected boolean NOT NULL DEFAULT false,
    decided_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
    decided_at timestamptz,
    UNIQUE (problem_id)
);

CREATE TABLE IF NOT EXISTS health_plans (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    academic_year_id uuid NOT NULL REFERENCES academic_years(id) ON DELETE RESTRICT,
    problem_id uuid NOT NULL REFERENCES health_problems(id) ON DELETE RESTRICT,
    title text NOT NULL,
    main_goal text NOT NULL,
    start_date date,
    end_date date,
    status text NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'approved', 'in_progress', 'completed', 'archived')),
    resources text,
    responsible_person text,
    created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS objectives (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    health_plan_id uuid NOT NULL REFERENCES health_plans(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text,
    target_value numeric,
    target_unit text,
    target_date date,
    sort_order integer NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS activities (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    health_plan_id uuid NOT NULL REFERENCES health_plans(id) ON DELETE CASCADE,
    objective_id uuid REFERENCES objectives(id) ON DELETE SET NULL,
    title text NOT NULL,
    description text,
    activity_type text,
    start_date date,
    end_date date,
    responsible_person text,
    resources text,
    status text NOT NULL DEFAULT 'planned'
        CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')),
    completion_percentage numeric NOT NULL DEFAULT 0
        CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS activity_components (
    activity_id uuid NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    component_id uuid NOT NULL REFERENCES components(id) ON DELETE RESTRICT,
    PRIMARY KEY (activity_id, component_id)
);

CREATE TABLE IF NOT EXISTS activity_participants (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id uuid NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    profile_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
    participant_name text,
    participant_type text,
    participation_role text,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS results (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id uuid REFERENCES activities(id) ON DELETE SET NULL,
    objective_id uuid REFERENCES objectives(id) ON DELETE SET NULL,
    problem_id uuid REFERENCES health_problems(id) ON DELETE SET NULL,
    title text NOT NULL,
    description text,
    indicator_name text,
    baseline_value numeric,
    result_value numeric,
    unit text,
    measured_at date,
    result_status text,
    notes text,
    created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS impact_measurements (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    problem_id uuid NOT NULL REFERENCES health_problems(id) ON DELETE CASCADE,
    result_id uuid REFERENCES results(id) ON DELETE SET NULL,
    measurement_name text NOT NULL,
    baseline_value numeric,
    final_value numeric,
    unit text,
    change_percentage numeric,
    measured_at date,
    impact_description text,
    improvement_action text,
    created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS evidence_links (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    evidence_id uuid NOT NULL REFERENCES evidence(id) ON DELETE CASCADE,
    problem_id uuid REFERENCES health_problems(id) ON DELETE CASCADE,
    health_plan_id uuid REFERENCES health_plans(id) ON DELETE CASCADE,
    objective_id uuid REFERENCES objectives(id) ON DELETE CASCADE,
    activity_id uuid REFERENCES activities(id) ON DELETE CASCADE,
    indicator_id uuid REFERENCES indicators(id) ON DELETE CASCADE,
    result_id uuid REFERENCES results(id) ON DELETE CASCADE,
    impact_measurement_id uuid REFERENCES impact_measurements(id) ON DELETE CASCADE,
    link_note text,
    created_at timestamptz NOT NULL DEFAULT now(),
    CHECK (
        problem_id IS NOT NULL OR
        health_plan_id IS NOT NULL OR
        objective_id IS NOT NULL OR
        activity_id IS NOT NULL OR
        indicator_id IS NOT NULL OR
        result_id IS NOT NULL OR
        impact_measurement_id IS NOT NULL
    )
);

CREATE TABLE IF NOT EXISTS innovations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    academic_year_id uuid NOT NULL REFERENCES academic_years(id) ON DELETE RESTRICT,
    problem_id uuid REFERENCES health_problems(id) ON DELETE SET NULL,
    health_plan_id uuid REFERENCES health_plans(id) ON DELETE SET NULL,
    title text NOT NULL,
    idea text NOT NULL,
    implementation text,
    impact text,
    scalability text,
    sustainability text,
    status text NOT NULL DEFAULT 'idea'
        CHECK (status IN ('idea', 'in_progress', 'implemented', 'scaled', 'archived')),
    created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS partners (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    partner_type text,
    contact_name text,
    contact_phone text,
    contact_email text,
    description text,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (name)
);

CREATE TABLE IF NOT EXISTS school_partners (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    partner_id uuid NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    academic_year_id uuid REFERENCES academic_years(id) ON DELETE SET NULL,
    partnership_type text,
    objective text,
    joint_activities text,
    impact text,
    status text NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'completed', 'inactive')),
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (school_id, partner_id, academic_year_id)
);

CREATE TABLE IF NOT EXISTS school_twinning (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    partner_school_name text NOT NULL,
    partner_school_code text,
    academic_year_id uuid REFERENCES academic_years(id) ON DELETE SET NULL,
    objective text,
    activities text,
    outcomes text,
    evidence_summary text,
    status text NOT NULL DEFAULT 'planned'
        CHECK (status IN ('planned', 'active', 'completed', 'cancelled')),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reports (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    academic_year_id uuid REFERENCES academic_years(id) ON DELETE SET NULL,
    report_type text NOT NULL,
    title text NOT NULL,
    file_path text,
    external_url text,
    status text NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'generated', 'published', 'archived')),
    generated_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
    generated_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    school_id uuid REFERENCES schools(id) ON DELETE CASCADE,
    title text NOT NULL,
    message text NOT NULL,
    notification_type text,
    is_read boolean NOT NULL DEFAULT false,
    read_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_initiative_teams_school_year
    ON initiative_teams(school_id, academic_year_id);

CREATE INDEX IF NOT EXISTS idx_health_problems_school_year
    ON health_problems(school_id, academic_year_id);

CREATE INDEX IF NOT EXISTS idx_health_problems_status
    ON health_problems(status);

CREATE INDEX IF NOT EXISTS idx_problem_measurements_problem
    ON problem_measurements(problem_id, measured_at);

CREATE INDEX IF NOT EXISTS idx_health_plans_problem
    ON health_plans(problem_id);

CREATE INDEX IF NOT EXISTS idx_health_plans_school_year
    ON health_plans(school_id, academic_year_id);

CREATE INDEX IF NOT EXISTS idx_objectives_plan
    ON objectives(health_plan_id);

CREATE INDEX IF NOT EXISTS idx_activities_plan
    ON activities(health_plan_id);

CREATE INDEX IF NOT EXISTS idx_activities_status
    ON activities(status);

CREATE INDEX IF NOT EXISTS idx_activity_components_component
    ON activity_components(component_id);

CREATE INDEX IF NOT EXISTS idx_results_problem
    ON results(problem_id);

CREATE INDEX IF NOT EXISTS idx_results_activity
    ON results(activity_id);

CREATE INDEX IF NOT EXISTS idx_impact_measurements_problem
    ON impact_measurements(problem_id);

CREATE INDEX IF NOT EXISTS idx_evidence_links_evidence
    ON evidence_links(evidence_id);

CREATE INDEX IF NOT EXISTS idx_evidence_links_indicator
    ON evidence_links(indicator_id);

CREATE INDEX IF NOT EXISTS idx_innovations_school_year
    ON innovations(school_id, academic_year_id);

CREATE INDEX IF NOT EXISTS idx_school_partners_school
    ON school_partners(school_id);

CREATE INDEX IF NOT EXISTS idx_school_twinning_school
    ON school_twinning(school_id);

CREATE INDEX IF NOT EXISTS idx_reports_school_year
    ON reports(school_id, academic_year_id);

CREATE INDEX IF NOT EXISTS idx_notifications_profile_read
    ON notifications(profile_id, is_read);


-- ------------------------------------------------------------
-- Production hardening
-- ------------------------------------------------------------

-- Reusable trigger function for updated_at columns.
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Keep updated_at synchronized automatically.
DROP TRIGGER IF EXISTS trg_initiative_teams_updated_at ON initiative_teams;
CREATE TRIGGER trg_initiative_teams_updated_at
BEFORE UPDATE ON initiative_teams
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_health_problems_updated_at ON health_problems;
CREATE TRIGGER trg_health_problems_updated_at
BEFORE UPDATE ON health_problems
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_health_plans_updated_at ON health_plans;
CREATE TRIGGER trg_health_plans_updated_at
BEFORE UPDATE ON health_plans
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_activities_updated_at ON activities;
CREATE TRIGGER trg_activities_updated_at
BEFORE UPDATE ON activities
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_innovations_updated_at ON innovations;
CREATE TRIGGER trg_innovations_updated_at
BEFORE UPDATE ON innovations
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_school_twinning_updated_at ON school_twinning;
CREATE TRIGGER trg_school_twinning_updated_at
BEFORE UPDATE ON school_twinning
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- More useful uniqueness rules.
CREATE UNIQUE INDEX IF NOT EXISTS uq_team_member_profile
    ON team_members(team_id, profile_id)
    WHERE profile_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_school_partner_year
    ON school_partners(school_id, partner_id, academic_year_id)
    WHERE academic_year_id IS NOT NULL;

-- Prevent duplicate links of the same evidence to the same target.
CREATE UNIQUE INDEX IF NOT EXISTS uq_evidence_link_problem
    ON evidence_links(evidence_id, problem_id)
    WHERE problem_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_evidence_link_plan
    ON evidence_links(evidence_id, health_plan_id)
    WHERE health_plan_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_evidence_link_objective
    ON evidence_links(evidence_id, objective_id)
    WHERE objective_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_evidence_link_activity
    ON evidence_links(evidence_id, activity_id)
    WHERE activity_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_evidence_link_indicator
    ON evidence_links(evidence_id, indicator_id)
    WHERE indicator_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_evidence_link_result
    ON evidence_links(evidence_id, result_id)
    WHERE result_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_evidence_link_impact
    ON evidence_links(evidence_id, impact_measurement_id)
    WHERE impact_measurement_id IS NOT NULL;

-- Basic value validation.
ALTER TABLE impact_measurements
    DROP CONSTRAINT IF EXISTS impact_measurements_change_percentage_check;

ALTER TABLE impact_measurements
    ADD CONSTRAINT impact_measurements_change_percentage_check
    CHECK (change_percentage IS NULL OR change_percentage >= -10000);

ALTER TABLE activities
    DROP CONSTRAINT IF EXISTS activities_completion_percentage_check;

ALTER TABLE activities
    ADD CONSTRAINT activities_completion_percentage_check
    CHECK (completion_percentage >= 0 AND completion_percentage <= 100);

COMMIT;

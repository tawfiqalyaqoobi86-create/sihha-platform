-- =========================================================
-- 001_initial_schema.sql
-- منصة صِحّة - قاعدة البيانات
-- الجزء الأول: المدرسة والسنوات والمكونات والمؤشرات
-- =========================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =========================================================
-- 1. المدارس
-- =========================================================

CREATE TABLE IF NOT EXISTS schools (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    code text UNIQUE,
    description text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- =========================================================
-- 2. السنوات الدراسية
-- =========================================================

CREATE TABLE IF NOT EXISTS academic_years (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    school_id uuid NOT NULL
        REFERENCES schools(id)
        ON DELETE RESTRICT,

    name text NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    is_active boolean NOT NULL DEFAULT false,

    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT academic_year_dates_valid
        CHECK (end_date >= start_date),

    CONSTRAINT academic_year_school_name_unique
        UNIQUE (school_id, name)
);

CREATE INDEX IF NOT EXISTS idx_academic_years_school
    ON academic_years(school_id);

-- =========================================================
-- 3. مكونات المدارس المعززة للصحة
-- =========================================================

CREATE TABLE IF NOT EXISTS components (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    code text NOT NULL UNIQUE,
    name text NOT NULL,
    description text,

    max_score numeric(10,2) NOT NULL DEFAULT 0
        CHECK (max_score >= 0),

    sort_order integer NOT NULL UNIQUE,

    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- =========================================================
-- 4. بنود التقييم
-- =========================================================

CREATE TABLE IF NOT EXISTS evaluation_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    component_id uuid NOT NULL
        REFERENCES components(id)
        ON DELETE RESTRICT,

    item_number integer NOT NULL,
    title text NOT NULL,
    description text,

    max_score numeric(10,2) NOT NULL DEFAULT 0
        CHECK (max_score >= 0),

    sort_order integer NOT NULL,

    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT evaluation_item_component_number_unique
        UNIQUE (component_id, item_number),

    CONSTRAINT evaluation_item_component_order_unique
        UNIQUE (component_id, sort_order)
);

CREATE INDEX IF NOT EXISTS idx_evaluation_items_component
    ON evaluation_items(component_id);
    -- =========================================================
-- 5. معايير الحكم
-- =========================================================

CREATE TABLE IF NOT EXISTS scoring_criteria (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    evaluation_item_id uuid NOT NULL
        REFERENCES evaluation_items(id)
        ON DELETE RESTRICT,

    name text NOT NULL,
    description text,

    score numeric(10,2) NOT NULL DEFAULT 0
        CHECK (score >= 0),

    sort_order integer NOT NULL,

    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT scoring_criteria_item_order_unique
        UNIQUE (evaluation_item_id, sort_order)
);

CREATE INDEX IF NOT EXISTS idx_scoring_criteria_item
    ON scoring_criteria(evaluation_item_id);


-- =========================================================
-- 6. مصادر التقييم
-- =========================================================

CREATE TABLE IF NOT EXISTS evaluation_sources (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    evaluation_item_id uuid NOT NULL
        REFERENCES evaluation_items(id)
        ON DELETE RESTRICT,

    source_type text NOT NULL,
    title text NOT NULL,
    description text,

    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_evaluation_sources_item
    ON evaluation_sources(evaluation_item_id);


-- =========================================================
-- 7. تقييم المدرسة
-- =========================================================

CREATE TABLE IF NOT EXISTS school_evaluations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    school_id uuid NOT NULL
        REFERENCES schools(id)
        ON DELETE RESTRICT,

    academic_year_id uuid NOT NULL
        REFERENCES academic_years(id)
        ON DELETE RESTRICT,

    evaluation_type text NOT NULL
        CHECK (evaluation_type IN (
            'self',
            'external',
            'follow_up'
        )),

    status text NOT NULL DEFAULT 'draft'
        CHECK (status IN (
            'draft',
            'in_progress',
            'completed',
            'approved',
            'archived'
        )),

    total_score numeric(10,2) NOT NULL DEFAULT 0
        CHECK (total_score >= 0),

    percentage numeric(6,2)
        CHECK (
            percentage IS NULL
            OR (percentage >= 0 AND percentage <= 100)
        ),

    evaluator_notes text,

    evaluated_at timestamptz,

    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT school_evaluation_year_type_unique
        UNIQUE (school_id, academic_year_id, evaluation_type)
);

CREATE INDEX IF NOT EXISTS idx_school_evaluations_school
    ON school_evaluations(school_id);

CREATE INDEX IF NOT EXISTS idx_school_evaluations_year
    ON school_evaluations(academic_year_id);


-- =========================================================
-- 8. بنود تقييم المدرسة
-- =========================================================

CREATE TABLE IF NOT EXISTS school_evaluation_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    school_evaluation_id uuid NOT NULL
        REFERENCES school_evaluations(id)
        ON DELETE RESTRICT,

    evaluation_item_id uuid NOT NULL
        REFERENCES evaluation_items(id)
        ON DELETE RESTRICT,

    selected_criterion_id uuid
        REFERENCES scoring_criteria(id)
        ON DELETE RESTRICT,

    score numeric(10,2) NOT NULL DEFAULT 0
        CHECK (score >= 0),

    evaluator_notes text,

    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT school_evaluation_item_unique
        UNIQUE (school_evaluation_id, evaluation_item_id)
);

CREATE INDEX IF NOT EXISTS idx_school_evaluation_items_evaluation
    ON school_evaluation_items(school_evaluation_id);

CREATE INDEX IF NOT EXISTS idx_school_evaluation_items_item
    ON school_evaluation_items(evaluation_item_id);
    -- =========================================================
-- 9. المشكلات الصحية
-- =========================================================

CREATE TABLE IF NOT EXISTS health_problems (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    school_id uuid NOT NULL
        REFERENCES schools(id)
        ON DELETE RESTRICT,

    academic_year_id uuid NOT NULL
        REFERENCES academic_years(id)
        ON DELETE RESTRICT,

    title text NOT NULL,
    description text,
    evidence_summary text,

    priority_level text
        CHECK (priority_level IN (
            'high',
            'medium',
            'low'
        )),

    baseline_value numeric(12,2),
    baseline_unit text,

    status text NOT NULL DEFAULT 'identified'
        CHECK (status IN (
            'identified',
            'analyzed',
            'planned',
            'in_progress',
            'resolved',
            'archived'
        )),

    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_health_problems_school
    ON health_problems(school_id);

CREATE INDEX IF NOT EXISTS idx_health_problems_year
    ON health_problems(academic_year_id);


-- =========================================================
-- 10. قياسات المشكلة الصحية
-- =========================================================

CREATE TABLE IF NOT EXISTS problem_measurements (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    health_problem_id uuid NOT NULL
        REFERENCES health_problems(id)
        ON DELETE RESTRICT,

    measurement_date date NOT NULL,
    value numeric(12,2) NOT NULL,
    unit text,
    source text,
    notes text,

    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_problem_measurements_problem
    ON problem_measurements(health_problem_id);


-- =========================================================
-- 11. أولوية المشكلة
-- =========================================================

CREATE TABLE IF NOT EXISTS problem_priorities (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    health_problem_id uuid NOT NULL
        REFERENCES health_problems(id)
        ON DELETE RESTRICT,

    priority_score numeric(10,2),
    justification text,
    decided_at timestamptz NOT NULL DEFAULT now(),

    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_problem_priorities_problem
    ON problem_priorities(health_problem_id);


-- =========================================================
-- 12. الخطط الصحية
-- =========================================================

CREATE TABLE IF NOT EXISTS health_plans (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    school_id uuid NOT NULL
        REFERENCES schools(id)
        ON DELETE RESTRICT,

    academic_year_id uuid NOT NULL
        REFERENCES academic_years(id)
        ON DELETE RESTRICT,

    health_problem_id uuid
        REFERENCES health_problems(id)
        ON DELETE RESTRICT,

    title text NOT NULL,
    description text,

    start_date date,
    end_date date,

    status text NOT NULL DEFAULT 'draft'
        CHECK (status IN (
            'draft',
            'approved',
            'in_progress',
            'completed',
            'archived'
        )),

    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_health_plans_school
    ON health_plans(school_id);

CREATE INDEX IF NOT EXISTS idx_health_plans_year
    ON health_plans(academic_year_id);

CREATE INDEX IF NOT EXISTS idx_health_plans_problem
    ON health_plans(health_problem_id);


-- =========================================================
-- 13. أهداف الخطة
-- =========================================================

CREATE TABLE IF NOT EXISTS objectives (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    health_plan_id uuid NOT NULL
        REFERENCES health_plans(id)
        ON DELETE RESTRICT,

    title text NOT NULL,
    description text,

    target_value numeric(12,2),
    target_unit text,
    target_date date,

    sort_order integer NOT NULL DEFAULT 1,

    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_objectives_plan
    ON objectives(health_plan_id);


-- =========================================================
-- 14. الأنشطة
-- =========================================================

CREATE TABLE IF NOT EXISTS activities (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    health_plan_id uuid NOT NULL
        REFERENCES health_plans(id)
        ON DELETE RESTRICT,

    objective_id uuid
        REFERENCES objectives(id)
        ON DELETE RESTRICT,

    title text NOT NULL,
    description text,

    responsible_person text,

    start_date date,
    end_date date,

    status text NOT NULL DEFAULT 'planned'
        CHECK (status IN (
            'planned',
            'in_progress',
            'completed',
            'cancelled'
        )),

    resources text,

    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activities_plan
    ON activities(health_plan_id);

CREATE INDEX IF NOT EXISTS idx_activities_objective
    ON activities(objective_id);
    -- =========================================================
-- 15. نتائج الأنشطة
-- =========================================================

CREATE TABLE IF NOT EXISTS results (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    activity_id uuid NOT NULL
        REFERENCES activities(id)
        ON DELETE RESTRICT,

    title text NOT NULL,
    description text,

    result_value numeric(12,2),
    result_unit text,

    result_date date,

    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_results_activity
    ON results(activity_id);


-- =========================================================
-- 16. قياس الأثر
-- =========================================================

CREATE TABLE IF NOT EXISTS impact_measurements (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    health_problem_id uuid
        REFERENCES health_problems(id)
        ON DELETE RESTRICT,

    health_plan_id uuid
        REFERENCES health_plans(id)
        ON DELETE RESTRICT,

    objective_id uuid
        REFERENCES objectives(id)
        ON DELETE RESTRICT,

    measurement_date date NOT NULL,

    baseline_value numeric(12,2),
    current_value numeric(12,2),

    change_value numeric(12,2),
    change_percentage numeric(8,2),

    unit text,

    impact_description text,
    improvement_action text,

    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_impact_measurements_problem
    ON impact_measurements(health_problem_id);

CREATE INDEX IF NOT EXISTS idx_impact_measurements_plan
    ON impact_measurements(health_plan_id);


-- =========================================================
-- 17. الأدلة والشواهد
-- =========================================================

CREATE TABLE IF NOT EXISTS evidence (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    school_evaluation_id uuid NOT NULL
        REFERENCES school_evaluations(id)
        ON DELETE RESTRICT,

    school_evaluation_item_id uuid
        REFERENCES school_evaluation_items(id)
        ON DELETE RESTRICT,

    title text NOT NULL,

    evidence_type text NOT NULL
        CHECK (evidence_type IN (
            'document',
            'image',
            'video',
            'link',
            'other'
        )),

    description text,

    file_path text,
    external_url text,

    uploaded_by uuid,
    original_file_name text,
    mime_type text,
    file_size bigint,
    storage_path text,

    archived_at timestamptz,
    archived_by uuid,

    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_evidence_school_evaluation
    ON evidence(school_evaluation_id);

CREATE INDEX IF NOT EXISTS idx_evidence_evaluation_item
    ON evidence(school_evaluation_item_id);

CREATE INDEX IF NOT EXISTS idx_evidence_uploaded_by
    ON evidence(uploaded_by);

CREATE INDEX IF NOT EXISTS idx_evidence_storage_path
    ON evidence(storage_path);


-- =========================================================
-- 18. ربط الأدلة بعناصر المنصة
-- =========================================================

CREATE TABLE IF NOT EXISTS evidence_links (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    evidence_id uuid NOT NULL
        REFERENCES evidence(id)
        ON DELETE RESTRICT,

    health_problem_id uuid
        REFERENCES health_problems(id)
        ON DELETE RESTRICT,

    health_plan_id uuid
        REFERENCES health_plans(id)
        ON DELETE RESTRICT,

    objective_id uuid
        REFERENCES objectives(id)
        ON DELETE RESTRICT,

    activity_id uuid
        REFERENCES activities(id)
        ON DELETE RESTRICT,

    result_id uuid
        REFERENCES results(id)
        ON DELETE RESTRICT,

    impact_measurement_id uuid
        REFERENCES impact_measurements(id)
        ON DELETE RESTRICT,

    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_evidence_links_evidence
    ON evidence_links(evidence_id);

CREATE INDEX IF NOT EXISTS idx_evidence_links_problem
    ON evidence_links(health_problem_id);

CREATE INDEX IF NOT EXISTS idx_evidence_links_activity
    ON evidence_links(activity_id);

CREATE INDEX IF NOT EXISTS idx_evidence_links_result
    ON evidence_links(result_id);
    -- =========================================================
-- 19. بنك الابتكار الصحي
-- =========================================================

CREATE TABLE IF NOT EXISTS innovations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    school_id uuid NOT NULL
        REFERENCES schools(id)
        ON DELETE RESTRICT,

    academic_year_id uuid NOT NULL
        REFERENCES academic_years(id)
        ON DELETE RESTRICT,

    health_problem_id uuid
        REFERENCES health_problems(id)
        ON DELETE RESTRICT,

    title text NOT NULL,
    description text,

    implementation text,
    impact_description text,
    scalability_description text,

    status text NOT NULL DEFAULT 'idea'
        CHECK (status IN (
            'idea',
            'planned',
            'implemented',
            'evaluated',
            'archived'
        )),

    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_innovations_school
    ON innovations(school_id);

CREATE INDEX IF NOT EXISTS idx_innovations_year
    ON innovations(academic_year_id);


-- =========================================================
-- 20. الشركاء
-- =========================================================

CREATE TABLE IF NOT EXISTS partners (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    name text NOT NULL,
    partner_type text,
    description text,

    contact_name text,
    contact_phone text,
    contact_email text,

    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);


-- =========================================================
-- 21. شركاء المدرسة
-- =========================================================

CREATE TABLE IF NOT EXISTS school_partners (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    school_id uuid NOT NULL
        REFERENCES schools(id)
        ON DELETE RESTRICT,

    partner_id uuid NOT NULL
        REFERENCES partners(id)
        ON DELETE RESTRICT,

    academic_year_id uuid
        REFERENCES academic_years(id)
        ON DELETE RESTRICT,

    partnership_type text,
    objective text,
    joint_activities text,
    impact_description text,

    start_date date,
    end_date date,

    status text NOT NULL DEFAULT 'active'
        CHECK (status IN (
            'active',
            'completed',
            'archived'
        )),

    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT school_partner_unique
        UNIQUE (school_id, partner_id, academic_year_id)
);

CREATE INDEX IF NOT EXISTS idx_school_partners_school
    ON school_partners(school_id);


-- =========================================================
-- 22. التوأمة بين المدارس
-- =========================================================

CREATE TABLE IF NOT EXISTS school_twinning (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    school_id uuid NOT NULL
        REFERENCES schools(id)
        ON DELETE RESTRICT,

    partner_school_id uuid
        REFERENCES schools(id)
        ON DELETE RESTRICT,

    academic_year_id uuid
        REFERENCES academic_years(id)
        ON DELETE RESTRICT,

    objective text,
    joint_activities text,
    results text,
    impact_description text,

    start_date date,
    end_date date,

    status text NOT NULL DEFAULT 'active'
        CHECK (status IN (
            'active',
            'completed',
            'archived'
        )),

    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_school_twinning_school
    ON school_twinning(school_id);


-- =========================================================
-- 23. التقارير
-- =========================================================

CREATE TABLE IF NOT EXISTS reports (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    school_id uuid NOT NULL
        REFERENCES schools(id)
        ON DELETE RESTRICT,

    academic_year_id uuid
        REFERENCES academic_years(id)
        ON DELETE RESTRICT,

    report_type text NOT NULL,
    title text NOT NULL,

    file_path text,
    description text,

    created_by uuid,

    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reports_school
    ON reports(school_id);


-- =========================================================
-- 24. التنبيهات
-- =========================================================

CREATE TABLE IF NOT EXISTS notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    school_id uuid
        REFERENCES schools(id)
        ON DELETE RESTRICT,

    user_id uuid,

    title text NOT NULL,
    message text NOT NULL,

    notification_type text,
    is_read boolean NOT NULL DEFAULT false,

    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user
    ON notifications(user_id);

CREATE INDEX IF NOT EXISTS idx_notifications_school
    ON notifications(school_id);


-- =========================================================
-- 25. سجل التدقيق
-- =========================================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id uuid,

    school_id uuid
        REFERENCES schools(id)
        ON DELETE SET NULL,

    action text NOT NULL,
    table_name text NOT NULL,
    record_id uuid,

    old_data jsonb,
    new_data jsonb,

    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_school
    ON audit_logs(school_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_record
    ON audit_logs(record_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created
    ON audit_logs(created_at);
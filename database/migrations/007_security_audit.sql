-- 007_security_audit.sql
BEGIN;

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id uuid REFERENCES public.schools(id) ON DELETE SET NULL,
    profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    action text NOT NULL,
    entity_type text,
    entity_id uuid,
    details jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_school_created
    ON public.audit_logs(school_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_entity
    ON public.audit_logs(entity_type, entity_id);

COMMIT;

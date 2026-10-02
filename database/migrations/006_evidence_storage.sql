-- 006_evidence_storage.sql
-- منصة صِحّة | مستودع الأدلة والشواهد
BEGIN;

INSERT INTO storage.buckets (id, name, public)
VALUES ('sihha-evidence', 'sihha-evidence', false)
ON CONFLICT (id) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_evidence_item_created
    ON public.evidence(school_evaluation_item_id, created_at DESC);

COMMIT;

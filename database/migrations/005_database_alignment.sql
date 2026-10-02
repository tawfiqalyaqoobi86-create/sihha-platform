-- ============================================================
-- 005_database_alignment.sql
-- صِحّة | مواءمة بنية التقييم الرسمي مع النموذج الحالي
-- نسخة متوافقة مع البنية الحالية في Supabase
-- لا تحذف البيانات ولا تعيد بناء الجداول.
-- ============================================================

BEGIN;

-- ------------------------------------------------------------
-- 1. المكونات: الدرجة الرسمية
-- ------------------------------------------------------------

ALTER TABLE components
    ADD COLUMN IF NOT EXISTS official_total_score numeric(10,2);

UPDATE components
SET official_total_score =
    CASE code
        WHEN 'C1' THEN 60
        WHEN 'C2' THEN 50
        WHEN 'C3' THEN 50
        WHEN 'C4' THEN 43
        WHEN 'C5' THEN 51
        WHEN 'C6' THEN 52
        WHEN 'C7' THEN 35
        ELSE official_total_score
    END
WHERE official_total_score IS NULL;

-- ------------------------------------------------------------
-- 2. بنود التقييم
-- البنية الحالية تعتمد على indicator_id + code.
-- لا نفترض وجود component_id أو item_number في قاعدة البيانات الحالية.
-- ------------------------------------------------------------

ALTER TABLE evaluation_items
    ADD COLUMN IF NOT EXISTS indicator_id uuid
        REFERENCES indicators(id)
        ON DELETE RESTRICT;

ALTER TABLE evaluation_items
    ADD COLUMN IF NOT EXISTS code text;

CREATE INDEX IF NOT EXISTS idx_evaluation_items_indicator
    ON evaluation_items(indicator_id);

CREATE UNIQUE INDEX IF NOT EXISTS uq_evaluation_items_indicator_code
    ON evaluation_items(indicator_id, code)
    WHERE indicator_id IS NOT NULL AND code IS NOT NULL;

-- ------------------------------------------------------------
-- 3. مصادر التقييم
-- ------------------------------------------------------------

ALTER TABLE evaluation_sources
    ALTER COLUMN source_type DROP NOT NULL;

ALTER TABLE evaluation_sources
    ALTER COLUMN source_type SET DEFAULT 'official';

CREATE INDEX IF NOT EXISTS idx_evaluation_sources_item
    ON evaluation_sources(evaluation_item_id);

COMMIT;

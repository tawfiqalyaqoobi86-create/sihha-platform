-- ============================================================
-- 005_database_alignment.sql
-- صِحّة | مواءمة بنية التقييم الرسمي مع النموذج الحالي
-- لا يحذف البيانات ولا يعيد بناء الجداول.
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
-- 2. بنود التقييم: النموذج الحالي يعتمد على المؤشر + code
-- ------------------------------------------------------------

ALTER TABLE evaluation_items
    ADD COLUMN IF NOT EXISTS indicator_id uuid
        REFERENCES indicators(id)
        ON DELETE RESTRICT;

ALTER TABLE evaluation_items
    ADD COLUMN IF NOT EXISTS code text;


-- جعل الحقول القديمة غير إلزامية؛ نحتفظ بها للتوافق مع النسخة الأولى.
ALTER TABLE evaluation_items
    ALTER COLUMN component_id DROP NOT NULL;

ALTER TABLE evaluation_items
    ALTER COLUMN item_number DROP NOT NULL;


-- ربط البنود القديمة بالمؤشر الموحد للمكون عند وجودها.
UPDATE evaluation_items e
SET indicator_id = i.id
FROM indicators i
WHERE e.indicator_id IS NULL
  AND e.component_id = i.component_id
  AND i.code = 'OFFICIAL-EVALUATION';


-- توليد code للبنود القديمة التي لا تملك code.
UPDATE evaluation_items e
SET code = c.code || '.' || e.item_number::text
FROM components c
WHERE e.code IS NULL
  AND e.component_id = c.id
  AND e.item_number IS NOT NULL;


CREATE INDEX IF NOT EXISTS idx_evaluation_items_indicator
    ON evaluation_items(indicator_id);

CREATE UNIQUE INDEX IF NOT EXISTS uq_evaluation_items_indicator_code
    ON evaluation_items(indicator_id, code)
    WHERE indicator_id IS NOT NULL AND code IS NOT NULL;


-- ------------------------------------------------------------
-- 3. مصادر التقييم: source_type يصبح اختياريًا للتوافق
-- مع بيانات الدليل الرسمية، مع قيمة افتراضية واضحة.
-- ------------------------------------------------------------

ALTER TABLE evaluation_sources
    ALTER COLUMN source_type DROP NOT NULL;

ALTER TABLE evaluation_sources
    ALTER COLUMN source_type SET DEFAULT 'official';


-- ------------------------------------------------------------
-- 4. فهرس مصادر التقييم
-- ------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_evaluation_sources_item
    ON evaluation_sources(evaluation_item_id);


COMMIT;

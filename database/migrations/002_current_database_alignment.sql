-- =========================================================
-- 002_current_database_alignment.sql
-- مواءمة قاعدة البيانات الحالية
-- حماية الأدلة من الحذف التلقائي
-- =========================================================

ALTER TABLE evidence
DROP CONSTRAINT IF EXISTS evidence_school_evaluation_id_fkey;

ALTER TABLE evidence
ADD CONSTRAINT evidence_school_evaluation_id_fkey
FOREIGN KEY (school_evaluation_id)
REFERENCES school_evaluations(id)
ON DELETE RESTRICT;


ALTER TABLE evidence
DROP CONSTRAINT IF EXISTS evidence_school_evaluation_item_id_fkey;

ALTER TABLE evidence
ADD CONSTRAINT evidence_school_evaluation_item_id_fkey
FOREIGN KEY (school_evaluation_item_id)
REFERENCES school_evaluation_items(id)
ON DELETE RESTRICT;
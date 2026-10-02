BEGIN;

GRANT SELECT, INSERT, UPDATE, DELETE
ON TABLE public.activity_components
TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE
ON TABLE public.evidence_links
TO service_role;

COMMIT;

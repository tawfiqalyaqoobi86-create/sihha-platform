BEGIN;

GRANT SELECT, INSERT, UPDATE, DELETE
ON TABLE public.results
TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE
ON TABLE public.impact_measurements
TO service_role;

COMMIT;

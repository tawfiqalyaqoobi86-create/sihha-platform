BEGIN;

GRANT SELECT, INSERT, UPDATE, DELETE
ON TABLE public.partners
TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE
ON TABLE public.school_partners
TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE
ON TABLE public.school_twinning
TO service_role;

COMMIT;

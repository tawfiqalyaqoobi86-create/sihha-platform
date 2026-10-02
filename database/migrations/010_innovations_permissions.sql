BEGIN;

GRANT SELECT, INSERT, UPDATE, DELETE
ON TABLE public.innovations
TO service_role;

COMMIT;

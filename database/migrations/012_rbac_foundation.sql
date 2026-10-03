-- 012_rbac_foundation.sql
-- منصة صِحّة | أساس الأدوار والصلاحيات
-- متوافق مع جدول roles الموجود حاليًا، ولا يحذف أي بيانات سابقة.

BEGIN;

CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name text,
    email text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.roles
    ADD COLUMN IF NOT EXISTS code text;

CREATE UNIQUE INDEX IF NOT EXISTS uq_roles_code
    ON public.roles(code)
    WHERE code IS NOT NULL;

UPDATE public.roles
SET code = 'system_admin'
WHERE code IS NULL AND name = 'مدير النظام';

UPDATE public.roles
SET code = 'school_manager'
WHERE code IS NULL AND name = 'مدير المدرسة';

UPDATE public.roles
SET code = 'team_member'
WHERE code IS NULL AND name = 'عضو فريق التقويم';

UPDATE public.roles
SET code = 'viewer'
WHERE code IS NULL AND name = 'مستخدم عرض';

INSERT INTO public.roles (code, name, description) VALUES
    ('system_admin', 'مدير النظام', 'صلاحيات إدارية على مستوى المنصة.'),
    ('school_manager', 'مدير المدرسة', 'إدارة المدرسة والسجلات الرئيسية والصلاحيات التنفيذية.'),
    ('team_member', 'عضو فريق التقويم', 'العمل في التقييم والخطط والأنشطة والشواهد.'),
    ('viewer', 'مستخدم عرض', 'قراءة التقارير ولوحات المتابعة دون تعديل.')
ON CONFLICT (code) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role_id uuid NOT NULL REFERENCES public.roles(id) ON DELETE RESTRICT,
    school_id uuid REFERENCES public.schools(id) ON DELETE CASCADE,
    academic_year_id uuid REFERENCES public.academic_years(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(profile_id, role_id, school_id, academic_year_id)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_profile
    ON public.user_roles(profile_id);

CREATE INDEX IF NOT EXISTS idx_user_roles_school
    ON public.user_roles(school_id, academic_year_id);

CREATE OR REPLACE FUNCTION public.set_profiles_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_profiles_updated_at();

GRANT SELECT, INSERT, UPDATE
ON TABLE public.profiles
TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE
ON TABLE public.roles
TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE
ON TABLE public.user_roles
TO service_role;

COMMIT;

-- 012_rbac_foundation.sql
-- منصة صِحّة | أساس الأدوار والصلاحيات
-- لا يفرض تسجيل الدخول على النسخة المحلية الحالية؛ مرحلة ربط Supabase Auth تأتي لاحقًا.

BEGIN;

CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name text,
    email text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code text NOT NULL UNIQUE,
    name text NOT NULL,
    description text,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role_id uuid NOT NULL REFERENCES public.roles(id) ON DELETE RESTRICT,
    school_id uuid REFERENCES public.schools(id) ON DELETE CASCADE,
    academic_year_id uuid REFERENCES public.academic_years(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(profile_id, role_id, school_id, academic_year_id)
);

INSERT INTO public.roles (code, name, description) VALUES
    ('system_admin', 'مدير النظام', 'صلاحيات إدارية على مستوى المنصة.'),
    ('school_manager', 'مدير المدرسة', 'إدارة المدرسة والسجلات الرئيسية والصلاحيات التنفيذية.'),
    ('team_member', 'عضو فريق التقويم', 'العمل في التقييم والخطط والأنشطة والشواهد.'),
    ('viewer', 'مستخدم عرض', 'قراءة التقارير ولوحات المتابعة دون تعديل.')
ON CONFLICT (code) DO NOTHING;

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

# -*- coding: utf-8 -*-
import os
from dataclasses import dataclass
from fastapi import APIRouter, Depends, Header, HTTPException, Request
from backend.app.core.supabase import supabase

router = APIRouter(prefix="/api/auth", tags=["Authentication & RBAC"])


@dataclass
class Identity:
    profile_id: str | None
    user_id: str | None
    roles: list[str]
    role_names: list[str]
    is_dev: bool = False


def _dev_mode() -> bool:
    return os.getenv("APP_ENV", "development").lower() != "production" and os.getenv("ALLOW_DEV_AUTH", "true").lower() == "true"


def get_identity(authorization: str | None = Header(default=None)) -> Identity:
    token = None
    if authorization and authorization.lower().startswith("bearer "):
        token = authorization[7:].strip()

    if not token:
        if _dev_mode():
            return Identity(
                profile_id=None,
                user_id=None,
                roles=["school_manager"],
                role_names=["مدير المدرسة"],
                is_dev=True,
            )
        raise HTTPException(status_code=401, detail="يجب تسجيل الدخول أولًا")

    try:
        user_response = supabase.auth.get_user(token)
        user = getattr(user_response, "user", None)
        if not user:
            raise HTTPException(status_code=401, detail="جلسة الدخول غير صالحة")

        profile_id = str(user.id)
        rows = (
            supabase.table("user_roles")
            .select("role_id,roles(code,name)")
            .eq("profile_id", profile_id)
            .execute()
        ).data

        roles: list[str] = []
        names: list[str] = []
        for row in rows:
            role = row.get("roles") or {}
            if role.get("code"):
                roles.append(role["code"])
            if role.get("name"):
                names.append(role["name"])

        return Identity(
            profile_id=profile_id,
            user_id=profile_id,
            roles=list(dict.fromkeys(roles)),
            role_names=list(dict.fromkeys(names)),
            is_dev=False,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"تعذر التحقق من جلسة الدخول: {e}")


def require_roles(*allowed_roles: str):
    def dependency(identity: Identity = Depends(get_identity)) -> Identity:
        if any(role in identity.roles for role in allowed_roles):
            return identity
        raise HTTPException(status_code=403, detail="لا تملك الصلاحية لتنفيذ هذا الإجراء")
    return dependency


def ensure_school_access(identity: Identity, school_id: str, allowed_roles: tuple[str, ...]) -> None:
    if identity.is_dev:
        return
    if any(role in identity.roles for role in ("system_admin",)):
        return

    rows = (
        supabase.table("user_roles")
        .select("school_id,academic_year_id,roles(code)")
        .eq("profile_id", identity.profile_id)
        .eq("school_id", school_id)
        .execute()
    ).data

    codes = {
        (row.get("roles") or {}).get("code")
        for row in rows
        if (row.get("roles") or {}).get("code")
    }
    if not codes.intersection(set(allowed_roles)):
        raise HTTPException(status_code=403, detail="لا تملك صلاحية هذه المدرسة")


@router.get("/context")
def auth_context(request: Request, identity: Identity = Depends(get_identity)):
    school_id = request.query_params.get("school_id")
    can_manage = False
    if identity.is_dev:
        can_manage = True
    elif school_id:
        try:
            ensure_school_access(identity, school_id, ("school_manager", "system_admin"))
            can_manage = True
        except HTTPException:
            can_manage = False

    return {
        "success": True,
        "authenticated": not identity.is_dev,
        "development_mode": identity.is_dev,
        "profile_id": identity.profile_id,
        "roles": identity.roles,
        "role_names": identity.role_names,
        "can_manage": can_manage,
    }

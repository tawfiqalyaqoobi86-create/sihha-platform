# -*- coding: utf-8 -*-

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from backend.app.core.supabase import supabase
from backend.app.services.audit import audit
from backend.app.api.auth import Identity, ensure_school_access, require_roles

router = APIRouter(prefix="/api/health-problems", tags=["Health Problems"])


class ProblemRequest(BaseModel):
    school_id: str
    academic_year_id: str
    title: str = Field(min_length=2)
    description: str | None = None
    evidence_summary: str | None = None
    priority_level: str = "medium"
    baseline_value: float | None = None
    baseline_unit: str | None = None


class PriorityRequest(BaseModel):
    health_problem_id: str
    priority_score: float = Field(ge=0, le=100)
    justification: str | None = None


@router.get("/school/{school_id}/year/{academic_year_id}")
def list_problems(school_id: str, academic_year_id: str):
    try:
        rows = (
            supabase.table("health_problems")
            .select("id,title,description,evidence_summary,priority_level,baseline_value,baseline_unit,status,created_at,updated_at")
            .eq("school_id", school_id)
            .eq("academic_year_id", academic_year_id)
            .order("created_at", desc=True)
            .execute()
        )
        problems = rows.data or []
        if not problems:
            return {"success": True, "data": []}

        problem_ids = [p["id"] for p in problems]
        priorities = (
            supabase.table("problem_priorities")
            .select("problem_id,priority_score,rationale")
            .in_("problem_id", problem_ids)
            .execute()
        )
        priority_map = {p["problem_id"]: p for p in (priorities.data or [])}
        for problem in problems:
            priority = priority_map.get(problem["id"])
            problem["priority_score"] = priority.get("priority_score") if priority else None
            problem["priority_rationale"] = priority.get("rationale") if priority else None

        return {"success": True, "data": problems}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"حدث خطأ أثناء جلب المشكلات: {str(e)}")


@router.post("/")
def create_problem(payload: ProblemRequest):
    try:
        if payload.priority_level not in {"high", "medium", "low"}:
            raise HTTPException(status_code=400, detail="مستوى الأولوية غير صحيح")

        row = (
            supabase.table("health_problems")
            .insert(payload.model_dump(exclude_none=True))
            .execute()
        )
        if not row.data:
            raise RuntimeError("تعذر حفظ المشكلة الصحية")
        audit("create", "health_problem", row.data[0]["id"], payload.school_id, details={"title": payload.title})
        return {"success": True, "data": row.data[0]}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"حدث خطأ أثناء حفظ المشكلة: {str(e)}")


@router.delete("/{problem_id}")
def delete_problem(
    problem_id: str,
    identity: Identity = Depends(require_roles("school_manager", "system_admin")),
):
    try:
        existing = (
            supabase.table("health_problems")
            .select("id,school_id,title")
            .eq("id", problem_id)
            .limit(1)
            .execute()
        )
        if not existing.data:
            raise HTTPException(status_code=404, detail="المشكلة الصحية غير موجودة")

        ensure_school_access(
            identity,
            existing.data[0]["school_id"],
            ("school_manager", "system_admin"),
        )

        supabase.table("problem_priorities").delete().eq("problem_id", problem_id).execute()
        row = supabase.table("health_problems").delete().eq("id", problem_id).execute()

        audit(
            "delete",
            "health_problem",
            problem_id,
            existing.data[0].get("school_id"),
            details={"title": existing.data[0].get("title")},
        )
        return {"success": True, "data": row.data[0] if row.data else None}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"حدث خطأ أثناء حذف المشكلة: {str(e)}")


@router.post("/priority")
def set_priority(payload: PriorityRequest):
    try:
        existing = (
            supabase.table("problem_priorities")
            .select("id")
            .eq("problem_id", payload.health_problem_id)
            .limit(1)
            .execute()
        )
        data = {
            "problem_id": payload.health_problem_id,
            "priority_score": payload.priority_score,
            "rationale": payload.justification,
        }
        if existing.data:
            row = (
                supabase.table("problem_priorities")
                .update({
                    "priority_score": payload.priority_score,
                    "rationale": payload.justification,
                })
                .eq("id", existing.data[0]["id"])
                .execute()
            )
        else:
            row = supabase.table("problem_priorities").insert(data).execute()

        supabase.table("health_problems").update({
            "priority_level": "high" if payload.priority_score >= 80 else "medium" if payload.priority_score >= 50 else "low",
            "status": "prioritized",
        }).eq("id", payload.health_problem_id).execute()

        result = row.data[0] if row.data else None
        audit("create", "health_problem_priority", result.get("id") if result else None, details={"health_problem_id": payload.health_problem_id, "priority_score": payload.priority_score})
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"حدث خطأ أثناء تحديد الأولوية: {str(e)}")

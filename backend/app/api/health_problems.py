# -*- coding: utf-8 -*-

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from backend.app.core.supabase import supabase

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
    priority_score: float = Field(ge=0)
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
        return {"success": True, "data": rows.data}
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
        return {"success": True, "data": row.data[0]}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"حدث خطأ أثناء حفظ المشكلة: {str(e)}")


@router.post("/priority")
def set_priority(payload: PriorityRequest):
    try:
        existing = (
            supabase.table("problem_priorities")
            .select("id")
            .eq("health_problem_id", payload.health_problem_id)
            .limit(1)
            .execute()
        )
        data = {
            "health_problem_id": payload.health_problem_id,
            "priority_score": payload.priority_score,
            "justification": payload.justification,
        }
        if existing.data:
            row = (
                supabase.table("problem_priorities")
                .update({
                    "priority_score": payload.priority_score,
                    "justification": payload.justification,
                })
                .eq("id", existing.data[0]["id"])
                .execute()
            )
        else:
            row = supabase.table("problem_priorities").insert(data).execute()

        supabase.table("health_problems").update({
            "priority_level": "high" if payload.priority_score >= 80 else "medium" if payload.priority_score >= 50 else "low",
            "status": "analyzed",
        }).eq("id", payload.health_problem_id).execute()

        return {"success": True, "data": row.data[0] if row.data else None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"حدث خطأ أثناء تحديد الأولوية: {str(e)}")

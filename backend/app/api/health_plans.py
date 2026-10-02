# -*- coding: utf-8 -*-

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from backend.app.core.supabase import supabase
from backend.app.services.audit import audit

router = APIRouter(prefix="/api/health-plans", tags=["Health Plans"])


class PlanRequest(BaseModel):
    school_id: str
    academic_year_id: str
    problem_id: str
    title: str = Field(min_length=2)
    main_goal: str = Field(min_length=2)
    start_date: str | None = None
    end_date: str | None = None
    resources: str | None = None
    responsible_person: str | None = None


class ObjectiveRequest(BaseModel):
    health_plan_id: str
    title: str = Field(min_length=2)
    description: str | None = None
    target_value: float | None = None
    target_unit: str | None = None
    target_date: str | None = None


class ActivityRequest(BaseModel):
    health_plan_id: str
    objective_id: str | None = None
    title: str = Field(min_length=2)
    description: str | None = None
    activity_type: str | None = None
    start_date: str | None = None
    end_date: str | None = None
    responsible_person: str | None = None
    resources: str | None = None


@router.get("/school/{school_id}/year/{academic_year_id}")
def list_plans(school_id: str, academic_year_id: str):
    try:
        rows = (
            supabase.table("health_plans")
            .select("id,problem_id,title,main_goal,start_date,end_date,status,resources,responsible_person,created_at")
            .eq("school_id", school_id)
            .eq("academic_year_id", academic_year_id)
            .order("created_at", desc=True)
            .execute()
        )
        return {"success": True, "data": rows.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"حدث خطأ أثناء جلب الخطط: {str(e)}")


@router.post("/")
def create_plan(payload: PlanRequest):
    try:
        problem = (
            supabase.table("health_problems")
            .select("id,school_id,academic_year_id")
            .eq("id", payload.problem_id)
            .single()
            .execute()
        ).data

        if not problem:
            raise HTTPException(status_code=404, detail="المشكلة الصحية غير موجودة")

        if problem["school_id"] != payload.school_id or problem["academic_year_id"] != payload.academic_year_id:
            raise HTTPException(status_code=400, detail="المشكلة لا تنتمي إلى المدرسة أو العام الدراسي المحدد")

        row = (
            supabase.table("health_plans")
            .insert(payload.model_dump(exclude_none=True))
            .execute()
        )
        if not row.data:
            raise RuntimeError("تعذر حفظ الخطة الصحية")
        audit("create", "health_plan", row.data[0]["id"], payload.school_id, details={"title": payload.title, "problem_id": payload.problem_id})

        supabase.table("health_problems").update({"status": "planned"}).eq("id", payload.problem_id).execute()

        return {"success": True, "data": row.data[0]}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"حدث خطأ أثناء حفظ الخطة: {str(e)}")



@router.delete("/{plan_id}")
def delete_plan(plan_id: str):
    try:
        existing = (
            supabase.table("health_plans")
            .select("id,school_id,problem_id,title")
            .eq("id", plan_id)
            .limit(1)
            .execute()
        )
        if not existing.data:
            raise HTTPException(status_code=404, detail="الخطة الصحية غير موجودة")

        plan = existing.data[0]
        supabase.table("health_plans").delete().eq("id", plan_id).execute()

        remaining = (
            supabase.table("health_plans")
            .select("id")
            .eq("problem_id", plan["problem_id"])
            .limit(1)
            .execute()
        )
        if not remaining.data:
            supabase.table("health_problems").update({"status": "prioritized"}).eq("id", plan["problem_id"]).execute()

        audit(
            "delete",
            "health_plan",
            plan_id,
            plan["school_id"],
            details={"title": plan["title"], "problem_id": plan["problem_id"]},
        )
        return {"success": True, "message": "تم حذف الخطة الصحية بنجاح"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"حدث خطأ أثناء حذف الخطة: {str(e)}")


@router.get("/{plan_id}/objectives")
def list_objectives(plan_id: str):
    try:
        rows = (
            supabase.table("objectives")
            .select("id,title,description,target_value,target_unit,target_date,sort_order")
            .eq("health_plan_id", plan_id)
            .order("sort_order")
            .execute()
        )
        return {"success": True, "data": rows.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"حدث خطأ أثناء جلب الأهداف: {str(e)}")


@router.post("/{plan_id}/objectives")
def create_objective(plan_id: str, payload: ObjectiveRequest):
    try:
        data = payload.model_dump(exclude_none=True)
        data["health_plan_id"] = plan_id
        row = supabase.table("objectives").insert(data).execute()
        if not row.data:
            raise RuntimeError("تعذر حفظ الهدف")
        audit("create", "objective", row.data[0]["id"], details={"health_plan_id": plan_id, "title": payload.title})
        return {"success": True, "data": row.data[0]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"حدث خطأ أثناء حفظ الهدف: {str(e)}")


@router.get("/{plan_id}/activities")
def list_activities(plan_id: str):
    try:
        rows = (
            supabase.table("activities")
            .select("id,objective_id,title,description,activity_type,start_date,end_date,responsible_person,resources,status,completion_percentage")
            .eq("health_plan_id", plan_id)
            .order("start_date")
            .execute()
        )
        return {"success": True, "data": rows.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"حدث خطأ أثناء جلب الأنشطة: {str(e)}")


@router.post("/{plan_id}/activities")
def create_activity(plan_id: str, payload: ActivityRequest):
    try:
        data = payload.model_dump(exclude_none=True)
        data["health_plan_id"] = plan_id

        if payload.objective_id:
            objective = (
                supabase.table("objectives")
                .select("id,health_plan_id")
                .eq("id", payload.objective_id)
                .limit(1)
                .execute()
            )
            if not objective.data or objective.data[0]["health_plan_id"] != plan_id:
                raise HTTPException(status_code=400, detail="الهدف التفصيلي المحدد لا ينتمي إلى هذه الخطة")

        row = supabase.table("activities").insert(data).execute()
        if not row.data:
            raise RuntimeError("تعذر حفظ النشاط")
        audit(
            "create",
            "activity",
            row.data[0]["id"],
            details={
                "health_plan_id": plan_id,
                "objective_id": payload.objective_id,
                "title": payload.title,
            },
        )
        return {"success": True, "data": row.data[0]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"حدث خطأ أثناء حفظ النشاط: {str(e)}")


class ComponentLinkRequest(BaseModel):
    component_ids: list[str]


@router.post("/activities/{activity_id}/components")
def link_activity_components(activity_id: str, payload: ComponentLinkRequest):
    try:
        supabase.table("activity_components").delete().eq("activity_id", activity_id).execute()
        if payload.component_ids:
            rows = [{"activity_id": activity_id, "component_id": cid} for cid in payload.component_ids]
            supabase.table("activity_components").insert(rows).execute()
        return {"success": True, "component_ids": payload.component_ids}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"حدث خطأ أثناء ربط النشاط بالمكونات: {str(e)}")


@router.get("/activities/{activity_id}/components")
def get_activity_components(activity_id: str):
    try:
        rows = (
            supabase.table("activity_components")
            .select("component_id")
            .eq("activity_id", activity_id)
            .execute()
        )
        return {"success": True, "data": [r["component_id"] for r in rows.data]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"حدث خطأ أثناء جلب ارتباطات المكونات: {str(e)}")

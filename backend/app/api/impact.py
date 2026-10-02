# -*- coding: utf-8 -*-
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from backend.app.core.supabase import supabase
from backend.app.services.audit import audit

router = APIRouter(prefix="/api/impact", tags=["Results & Impact"])

class ResultRequest(BaseModel):
    activity_id: str | None = None
    objective_id: str | None = None
    problem_id: str | None = None
    title: str = Field(min_length=2)
    description: str | None = None
    indicator_name: str | None = None
    baseline_value: float | None = None
    result_value: float | None = None
    unit: str | None = None
    measured_at: str | None = None
    result_status: str | None = None
    notes: str | None = None

class ImpactRequest(BaseModel):
    problem_id: str
    result_id: str | None = None
    measurement_name: str = Field(min_length=2)
    baseline_value: float | None = None
    final_value: float | None = None
    unit: str | None = None
    measured_at: str | None = None
    impact_description: str | None = None
    improvement_action: str | None = None

@router.get("/objective/{objective_id}/results")
def list_results(objective_id: str):
    try:
        r = supabase.table("results").select("*").eq("objective_id", objective_id).order("measured_at", desc=True).execute()
        return {"success": True, "data": r.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"تعذر جلب النتائج: {e}")

@router.post("/results")
def create_result(payload: ResultRequest):
    try:
        data = payload.model_dump(exclude_none=True)

        if payload.objective_id:
            objective = (
                supabase.table("objectives")
                .select("id,health_plan_id")
                .eq("id", payload.objective_id)
                .limit(1)
                .execute()
            )
            if not objective.data:
                raise HTTPException(status_code=400, detail="الهدف التفصيلي غير موجود")

            if payload.activity_id:
                activity = (
                    supabase.table("activities")
                    .select("id,health_plan_id,objective_id")
                    .eq("id", payload.activity_id)
                    .limit(1)
                    .execute()
                )
                if not activity.data:
                    raise HTTPException(status_code=400, detail="النشاط المرتبط بالنتيجة غير موجود")
                if activity.data[0]["health_plan_id"] != objective.data[0]["health_plan_id"]:
                    raise HTTPException(status_code=400, detail="النشاط والهدف لا ينتميان إلى الخطة نفسها")

        r = supabase.table("results").insert(data).execute()
        if not r.data:
            raise RuntimeError("تعذر حفظ النتيجة")
        audit("create", "result", r.data[0]["id"], details={"title": payload.title})
        return {"success": True, "data": r.data[0]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"تعذر حفظ النتيجة: {e}")

@router.get("/problem/{problem_id}/measurements")
def list_impact(problem_id: str):
    try:
        r = supabase.table("impact_measurements").select("*").eq("problem_id", problem_id).order("measured_at", desc=True).execute()
        return {"success": True, "data": r.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"تعذر جلب قياسات الأثر: {e}")

@router.post("/measurements")
def create_impact(payload: ImpactRequest):
    try:
        data = payload.model_dump(exclude_none=True)
        if payload.baseline_value is not None and payload.final_value is not None and payload.baseline_value != 0:
            data["change_percentage"] = round(((payload.final_value - payload.baseline_value) / abs(payload.baseline_value)) * 100, 2)
        r = supabase.table("impact_measurements").insert(data).execute()
        if not r.data:
            raise RuntimeError("تعذر حفظ قياس الأثر")
        audit("create", "impact_measurement", r.data[0]["id"], details={"problem_id": payload.problem_id, "measurement_name": payload.measurement_name})
        return {"success": True, "data": r.data[0]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"تعذر حفظ قياس الأثر: {e}")

# -*- coding: utf-8 -*-
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from backend.app.core.supabase import supabase

router = APIRouter(prefix="/api/innovations", tags=["Health Innovation"])

class InnovationRequest(BaseModel):
    school_id: str
    academic_year_id: str
    problem_id: str | None = None
    health_plan_id: str | None = None
    title: str = Field(min_length=2)
    idea: str = Field(min_length=2)
    implementation: str | None = None
    impact: str | None = None
    scalability: str | None = None
    sustainability: str | None = None
    status: str = "idea"

@router.get("/school/{school_id}/year/{academic_year_id}")
def list_innovations(school_id: str, academic_year_id: str):
    try:
        r=supabase.table("innovations").select("*").eq("school_id",school_id).eq("academic_year_id",academic_year_id).order("created_at",desc=True).execute()
        return {"success":True,"data":r.data}
    except Exception as e: raise HTTPException(status_code=500,detail=f"تعذر جلب الابتكارات: {e}")

@router.post("/")
def create_innovation(payload: InnovationRequest):
    try:
        r=supabase.table("innovations").insert(payload.model_dump(exclude_none=True)).execute()
        if not r.data: raise RuntimeError("تعذر حفظ الابتكار")
        return {"success":True,"data":r.data[0]}
    except Exception as e: raise HTTPException(status_code=500,detail=f"تعذر حفظ الابتكار: {e}")

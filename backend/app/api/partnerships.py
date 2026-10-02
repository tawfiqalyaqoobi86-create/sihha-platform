# -*- coding: utf-8 -*-
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from backend.app.core.supabase import supabase
from backend.app.services.audit import audit

router = APIRouter(prefix="/api/partnerships", tags=["Partnerships & Twinning"])

class PartnerRequest(BaseModel):
    name: str = Field(min_length=2)
    partner_type: str | None = None
    contact_name: str | None = None
    contact_phone: str | None = None
    contact_email: str | None = None
    description: str | None = None

class SchoolPartnerRequest(BaseModel):
    school_id: str
    partner_id: str
    academic_year_id: str | None = None
    partnership_type: str | None = None
    objective: str | None = None
    joint_activities: str | None = None
    impact: str | None = None
    status: str = "active"

class TwinningRequest(BaseModel):
    school_id: str
    partner_school_name: str = Field(min_length=2)
    partner_school_code: str | None = None
    academic_year_id: str | None = None
    objective: str | None = None
    activities: str | None = None
    outcomes: str | None = None
    evidence_summary: str | None = None
    status: str = "planned"

@router.get("/partners")
def list_partners():
    try:
        r=supabase.table("partners").select("*").order("name").execute()
        return {"success":True,"data":r.data}
    except Exception as e: raise HTTPException(status_code=500,detail=f"تعذر جلب الشركاء: {e}")

@router.post("/partners")
def create_partner(payload: PartnerRequest):
    try:
        r=supabase.table("partners").insert(payload.model_dump(exclude_none=True)).execute()
        result=r.data[0] if r.data else None
        audit("create", "partner", result["id"] if result else None, details={"name": payload.name})
        return {"success":True,"data":result}
    except Exception as e: raise HTTPException(status_code=500,detail=f"تعذر حفظ الشريك: {e}")

@router.get("/school/{school_id}/year/{academic_year_id}")
def list_school_partnerships(school_id: str, academic_year_id: str):
    try:
        p=supabase.table("school_partners").select("*, partners(name,partner_type)").eq("school_id",school_id).eq("academic_year_id",academic_year_id).execute()
        t=supabase.table("school_twinning").select("*").eq("school_id",school_id).eq("academic_year_id",academic_year_id).execute()
        return {"success":True,"partnerships":p.data,"twinning":t.data}
    except Exception as e: raise HTTPException(status_code=500,detail=f"تعذر جلب الشراكات والتوأمة: {e}")

@router.post("/school")
def create_school_partnership(payload: SchoolPartnerRequest):
    try:
        r=supabase.table("school_partners").insert(payload.model_dump(exclude_none=True)).execute()
        result=r.data[0] if r.data else None
        audit("create", "school_partner", result["id"] if result else None, payload.school_id, details={"partner_id": payload.partner_id})
        return {"success":True,"data":result}
    except Exception as e: raise HTTPException(status_code=500,detail=f"تعذر حفظ الشراكة: {e}")

@router.post("/twinning")
def create_twinning(payload: TwinningRequest):
    try:
        r=supabase.table("school_twinning").insert(payload.model_dump(exclude_none=True)).execute()
        result=r.data[0] if r.data else None
        audit("create", "school_twinning", result["id"] if result else None, payload.school_id, details={"partner_school_name": payload.partner_school_name})
        return {"success":True,"data":result}
    except Exception as e: raise HTTPException(status_code=500,detail=f"تعذر حفظ التوأمة: {e}")

# -*- coding: utf-8 -*-
from fastapi import APIRouter, HTTPException
from backend.app.core.supabase import supabase

router = APIRouter(prefix="/api/competition", tags=["Competition"])

@router.get("/school/{school_id}/year/{academic_year_id}")
def competition_view(school_id: str, academic_year_id: str):
    try:
        ev=supabase.table("school_evaluations").select("total_score,percentage,status").eq("school_id",school_id).eq("academic_year_id",academic_year_id).eq("evaluation_type","self").limit(1).execute().data
        problems=supabase.table("health_problems").select("id,title,priority_level,status").eq("school_id",school_id).eq("academic_year_id",academic_year_id).execute().data
        plans=supabase.table("health_plans").select("id,title,status").eq("school_id",school_id).eq("academic_year_id",academic_year_id).execute().data
        innovations=supabase.table("innovations").select("id,title,idea,impact,status").eq("school_id",school_id).eq("academic_year_id",academic_year_id).execute().data
        twinning=supabase.table("school_twinning").select("id,partner_school_name,objective,outcomes,status").eq("school_id",school_id).eq("academic_year_id",academic_year_id).execute().data
        return {"success":True,"competition":{"evaluation":ev[0] if ev else {"total_score":0,"percentage":0},"problems":problems,"plans":plans,"innovations":innovations,"twinning":twinning}}
    except Exception as e:
        raise HTTPException(status_code=500,detail=f"تعذر إعداد وضع المسابقة: {e}")

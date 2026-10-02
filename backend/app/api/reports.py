# -*- coding: utf-8 -*-
from fastapi import APIRouter, HTTPException
from backend.app.core.supabase import supabase

router = APIRouter(prefix="/api/reports", tags=["Reports"])

@router.get("/school/{school_id}/year/{academic_year_id}")
def school_report(school_id: str, academic_year_id: str):
    try:
        school=supabase.table("schools").select("id,name,code").eq("id",school_id).single().execute().data
        year=supabase.table("academic_years").select("id,name,start_date,end_date").eq("id",academic_year_id).single().execute().data
        problems=supabase.table("health_problems").select("id,title,description,priority_level,status").eq("school_id",school_id).eq("academic_year_id",academic_year_id).execute().data
        plans=supabase.table("health_plans").select("id,title,main_goal,status,start_date,end_date,problem_id").eq("school_id",school_id).eq("academic_year_id",academic_year_id).execute().data
        innovations=supabase.table("innovations").select("id,title,status,impact").eq("school_id",school_id).eq("academic_year_id",academic_year_id).execute().data
        partnerships=supabase.table("school_partners").select("id,partner_id,partnership_type,objective,impact,status").eq("school_id",school_id).eq("academic_year_id",academic_year_id).execute().data
        twinning=supabase.table("school_twinning").select("id,partner_school_name,objective,outcomes,status").eq("school_id",school_id).eq("academic_year_id",academic_year_id).execute().data
        ev=supabase.table("school_evaluations").select("id,total_score,percentage,status").eq("school_id",school_id).eq("academic_year_id",academic_year_id).eq("evaluation_type","self").limit(1).execute().data
        return {"success":True,"school":school,"academic_year":year,"evaluation":ev[0] if ev else {"total_score":0,"percentage":0},"problems":problems,"plans":plans,"innovations":innovations,"partnerships":partnerships,"twinning":twinning}
    except Exception as e:
        raise HTTPException(status_code=500,detail=f"تعذر إعداد التقرير: {e}")

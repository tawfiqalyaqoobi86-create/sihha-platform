# -*- coding: utf-8 -*-
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from backend.app.core.supabase import supabase

router = APIRouter(prefix="/api/ai", tags=["AI Assistant"])

class AIRequest(BaseModel):
    school_id: str
    academic_year_id: str
    focus: str = Field(default="ملخص عام")

@router.post("/school-summary")
def school_summary(payload: AIRequest):
    try:
        problems = supabase.table("health_problems").select("title,description,priority_level,status").eq("school_id",payload.school_id).eq("academic_year_id",payload.academic_year_id).execute().data
        plans = supabase.table("health_plans").select("title,main_goal,status").eq("school_id",payload.school_id).eq("academic_year_id",payload.academic_year_id).execute().data
        innovations = supabase.table("innovations").select("title,idea,impact,status").eq("school_id",payload.school_id).eq("academic_year_id",payload.academic_year_id).execute().data
        evaluation = supabase.table("school_evaluations").select("total_score,percentage,status").eq("school_id",payload.school_id).eq("academic_year_id",payload.academic_year_id).eq("evaluation_type","self").limit(1).execute().data
        ev = evaluation[0] if evaluation else {"total_score":0,"percentage":0,"status":"غير مكتمل"}

        questions=[]
        if not problems: questions.append("ما أبرز مشكلة صحية يمكن تحديدها بأدلة وبيانات المدرسة؟")
        if problems and not plans: questions.append("ما الخطة المناسبة لمعالجة المشكلة ذات الأولوية؟")
        if plans and not innovations: questions.append("هل توجد ممارسة مبتكرة يمكن توثيقها وتوسيعها؟")
        if ev["percentage"] < 100: questions.append("ما البنود التي تحتاج إلى استكمال التقييم والشواهد؟")

        return {"success":True,"focus":payload.focus,"summary":{
            "evaluation":ev,
            "problems_count":len(problems),
            "plans_count":len(plans),
            "innovations_count":len(innovations),
            "questions":questions,
            "note":"هذا التحليل مبني على البيانات المسجلة في المنصة فقط، ولا يُعد حكمًا مستقلًا على المدرسة."
        }}
    except Exception as e:
        raise HTTPException(status_code=500,detail=f"تعذر إعداد التحليل الذكي: {e}")

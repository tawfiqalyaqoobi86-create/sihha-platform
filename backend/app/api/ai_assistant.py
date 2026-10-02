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


class PlanAnalysisRequest(BaseModel):
    plan_id: str


@router.post("/plan-analysis")
def plan_analysis(payload: PlanAnalysisRequest):
    try:
        from openai import OpenAI
        import os
        import json

        plan_rows = (
            supabase.table("health_plans")
            .select("id,school_id,academic_year_id,problem_id,title,main_goal,status,start_date,end_date,responsible_person")
            .eq("id", payload.plan_id)
            .limit(1)
            .execute()
        ).data
        if not plan_rows:
            raise HTTPException(status_code=404, detail="الخطة الصحية غير موجودة")

        plan = plan_rows[0]
        problems = (
            supabase.table("health_problems")
            .select("id,title,description,priority_level,status")
            .eq("id", plan["problem_id"])
            .limit(1)
            .execute()
        ).data

        priority_rows = (
            supabase.table("problem_priorities")
            .select("priority_score,rationale,selected")
            .eq("problem_id", plan["problem_id"])
            .limit(1)
            .execute()
        ).data
        priority = priority_rows[0] if priority_rows else None
        if problems:
            problems[0]["priority_score"] = priority.get("priority_score") if priority else None
            problems[0]["priority_rationale"] = priority.get("rationale") if priority else None

        objectives = (
            supabase.table("objectives")
            .select("id,title,description,target_value,target_unit,target_date")
            .eq("health_plan_id", payload.plan_id)
            .order("sort_order")
            .execute()
        ).data

        activities = (
            supabase.table("activities")
            .select("id,objective_id,title,description,activity_type,start_date,end_date,responsible_person,status,completion_percentage")
            .eq("health_plan_id", payload.plan_id)
            .order("start_date")
            .execute()
        ).data

        activity_ids = [a["id"] for a in activities]
        evidence_links = []
        evidence = []
        if activity_ids:
            evidence_links = (
                supabase.table("evidence_links")
                .select("evidence_id,activity_id,link_note")
                .in_("activity_id", activity_ids)
                .execute()
            ).data
            evidence_ids = list(dict.fromkeys(x["evidence_id"] for x in evidence_links))
            if evidence_ids:
                evidence = (
                    supabase.table("evidence")
                    .select("id,title,description,original_file_name,mime_type,created_at")
                    .in_("id", evidence_ids)
                    .order("created_at", desc=True)
                    .execute()
                ).data

        evidence_by_activity = {}
        evidence_map = {e["id"]: e for e in evidence}
        for link in evidence_links:
            evidence_by_activity.setdefault(link["activity_id"], []).append(evidence_map.get(link["evidence_id"]))

        prompt_data = {
            "plan": plan,
            "problem": problems[0] if problems else None,
            "objectives": objectives,
            "activities": [
                {**a, "evidence": [e for e in evidence_by_activity.get(a["id"], []) if e]}
                for a in activities
            ],
        }

        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="مفتاح OPENAI_API_KEY غير مضبوط في بيئة الخادم")

        model = os.getenv("OPENAI_MODEL", "gpt-6-luna")
        # التوافق مع الإعداد القديم الذي لم يعد متاحًا في API.
        if model in {"gpt-5.6-mini", "gpt-5.6-mini-latest"}:
            model = "gpt-6-luna"
        client = OpenAI(api_key=api_key)

        system_prompt = """
أنت مساعد تحليلي متخصص في منصة «صِحّة» للمدارس المعززة للصحة.
حلّل الخطة الصحية اعتمادًا حصراً على البيانات والشواهد المرسلة إليك.
لا تخترع أرقامًا أو نتائج أو شواهد غير موجودة.
إذا كانت البيانات غير كافية، اذكر بوضوح أن الاستنتاج يحتاج إلى تحقق أو بيانات إضافية.
لا تطلب من فريق المدرسة إدخال حقول إضافية لمجرد التحليل؛ استخرج أكبر قدر ممكن من المعنى من البيانات الموجودة.
أخرج JSON صالحًا فقط بالمفاتيح:
summary, objective_analysis, activity_analysis, evidence_analysis, inferred_results, impact_assessment, improvement_actions
ويكون:
summary: فقرة عربية قصيرة.
objective_analysis: قائمة من عناصر تحتوي objective وstatus وnote.
activity_analysis: قائمة من عناصر تحتوي activity وcontribution.
evidence_analysis: قائمة من عناصر تحتوي activity وevidence_count وassessment.
inferred_results: قائمة من عناصر تحتوي statement وbasis وconfidence.
impact_assessment: فقرة عربية، وإذا لم تكف البيانات فقل ذلك صراحة.
improvement_actions: قائمة من إجراءات قصيرة قابلة للتنفيذ.
استخدم لغة عربية رسمية واضحة ومختصرة.
""".strip()

        response = client.responses.create(
            model=model,
            input=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": json.dumps(prompt_data, ensure_ascii=False)},
            ],
        )

        raw = response.output_text
        try:
            analysis = json.loads(raw)
        except json.JSONDecodeError:
            analysis = {
                "summary": raw,
                "objective_analysis": [],
                "activity_analysis": [],
                "evidence_analysis": [],
                "inferred_results": [],
                "impact_assessment": "تعذر استخراج البنية المنظمة للتحليل؛ يرجى إعادة المحاولة.",
                "improvement_actions": [],
            }

        return {
            "success": True,
            "plan_id": payload.plan_id,
            "analysis": analysis,
            "note": "هذا التحليل مبني على البيانات والشواهد المسجلة في المنصة فقط، ولا يستبدل حكم الفريق."
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"تعذر إعداد التحليل الذكي للخطة: {e}")


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

class InnovationAnalysisRequest(BaseModel):
    innovation_id: str


@router.post("/innovation-analysis")
def innovation_analysis(payload: InnovationAnalysisRequest):
    try:
        import os
        import json
        from openai import OpenAI

        innovation_rows = (
            supabase.table("innovations")
            .select("id,school_id,academic_year_id,problem_id,health_plan_id,title,idea,implementation,impact,scalability,sustainability,status")
            .eq("id", payload.innovation_id)
            .limit(1)
            .execute()
        ).data
        if not innovation_rows:
            raise HTTPException(status_code=404, detail="الفكرة الابتكارية غير موجودة")

        innovation = innovation_rows[0]
        problem = None
        plan = None
        if innovation.get("problem_id"):
            rows = supabase.table("health_problems").select("title,description,priority_level,status").eq("id", innovation["problem_id"]).limit(1).execute()
            problem = rows.data[0] if rows.data else None
        if innovation.get("health_plan_id"):
            rows = supabase.table("health_plans").select("title,main_goal,status").eq("id", innovation["health_plan_id"]).limit(1).execute()
            plan = rows.data[0] if rows.data else None

        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="مفتاح OPENAI_API_KEY غير مضبوط في بيئة الخادم")
        model = os.getenv("OPENAI_MODEL", "gpt-6-luna")
        if model in {"gpt-5.6-mini", "gpt-5.6-mini-latest"}:
            model = "gpt-6-luna"

        client = OpenAI(api_key=api_key)
        system_prompt = """
أنت مساعد متخصص في تحليل الابتكار الصحي المدرسي.
اعتمد فقط على الفكرة والبيانات المرتبطة بها.
لا تخترع نتائج أو أرقامًا أو أدلة.
لا تجعل التحليل بديلًا عن قرار فريق المدرسة.
أخرج JSON صالحًا فقط بالمفاتيح:
summary, impact, scalability, sustainability, actions
وجميعها نصوص عربية واضحة، وactions قائمة قصيرة.
إذا كانت المعلومات غير كافية، اذكر ذلك صراحة.
""".strip()

        input_data = {"innovation": innovation, "problem": problem, "plan": plan}
        response = client.responses.create(
            model=model,
            input=[
                {"role":"system","content":system_prompt},
                {"role":"user","content":json.dumps(input_data, ensure_ascii=False)}
            ],
        )
        raw = response.output_text
        try:
            analysis = json.loads(raw)
        except json.JSONDecodeError:
            analysis = {
                "summary": raw,
                "impact": "تحتاج الفكرة إلى مزيد من البيانات لتقييم الأثر.",
                "scalability": "تحتاج إمكانات التوسع إلى معلومات إضافية.",
                "sustainability": "تحتاج الاستدامة إلى تحديد الموارد وآلية الاستمرار.",
                "actions": []
            }
        return {"success":True,"innovation_id":payload.innovation_id,"analysis":analysis}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"تعذر إعداد التحليل الذكي للابتكار: {e}")

class TwinningAnalysisRequest(BaseModel):
    twinning_id: str


@router.post("/twinning-analysis")
def twinning_analysis(payload: TwinningAnalysisRequest):
    try:
        import os
        import json
        from openai import OpenAI

        rows = (
            supabase.table("school_twinning")
            .select("id,school_id,academic_year_id,partner_school_name,partner_school_code,objective,activities,outcomes,evidence_summary,status")
            .eq("id", payload.twinning_id)
            .limit(1)
            .execute()
        ).data
        if not rows:
            raise HTTPException(status_code=404, detail="سجل التوأمة غير موجود")

        twinning = rows[0]
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="مفتاح OPENAI_API_KEY غير مضبوط في بيئة الخادم")
        model = os.getenv("OPENAI_MODEL", "gpt-6-luna")
        if model in {"gpt-5.6-mini", "gpt-5.6-mini-latest"}:
            model = "gpt-6-luna"

        client = OpenAI(api_key=api_key)
        system_prompt = """
أنت مساعد متخصص في تحليل التوأمة والشراكات المدرسية في منصة «صِحّة».
اعتمد فقط على بيانات سجل التوأمة.
لا تخترع نتائج أو أرقامًا أو شواهد.
لا تستبدل قرار فريق المدرسة.
أخرج JSON صالحًا فقط بالمفاتيح:
summary, value, exchange, actions
وهي نصوص عربية واضحة، وactions قائمة قصيرة.
إذا كانت البيانات غير كافية فاذكر ذلك صراحة.
""".strip()

        response = client.responses.create(
            model=model,
            input=[
                {"role":"system","content":system_prompt},
                {"role":"user","content":json.dumps(twinning, ensure_ascii=False)}
            ],
        )
        raw=response.output_text
        try:
            analysis=json.loads(raw)
        except json.JSONDecodeError:
            analysis={
                "summary":raw,
                "value":"تحتاج قيمة التوأمة إلى مزيد من البيانات.",
                "exchange":"تحتاج فرص التبادل إلى تفاصيل إضافية.",
                "actions":[]
            }
        return {"success":True,"twinning_id":payload.twinning_id,"analysis":analysis}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"تعذر إعداد التحليل الذكي للتوأمة: {e}")


class CompetitionReadinessRequest(BaseModel):
    school_id: str
    academic_year_id: str


@router.post("/competition-readiness")
def competition_readiness(payload: CompetitionReadinessRequest):
    try:
        import json
        import os
        from openai import OpenAI

        competition_rows = (
            supabase.table("school_evaluations")
            .select("id,total_score,percentage,status")
            .eq("school_id", payload.school_id)
            .eq("academic_year_id", payload.academic_year_id)
            .eq("evaluation_type", "self")
            .limit(1)
            .execute()
        ).data
        evaluation = competition_rows[0] if competition_rows else {
            "total_score": 0,
            "percentage": 0,
            "status": "غير مكتمل",
        }

        problems = (
            supabase.table("health_problems")
            .select("id,title,priority_level,status")
            .eq("school_id", payload.school_id)
            .eq("academic_year_id", payload.academic_year_id)
            .execute()
        ).data

        plans = (
            supabase.table("health_plans")
            .select("id,title,status")
            .eq("school_id", payload.school_id)
            .eq("academic_year_id", payload.academic_year_id)
            .execute()
        ).data

        plan_ids = [p["id"] for p in plans]
        objectives = (
            supabase.table("objectives")
            .select("id,health_plan_id,title")
            .in_("health_plan_id", plan_ids)
            .execute()
        ).data if plan_ids else []

        activities = (
            supabase.table("activities")
            .select("id,health_plan_id,objective_id,title,status,completion_percentage")
            .in_("health_plan_id", plan_ids)
            .execute()
        ).data if plan_ids else []

        activity_ids = [a["id"] for a in activities]
        evidence_links = (
            supabase.table("evidence_links")
            .select("activity_id,evidence_id")
            .in_("activity_id", activity_ids)
            .execute()
        ).data if activity_ids else []

        evidence = (
            supabase.table("evidence")
            .select("id,title,mime_type,created_at")
            .in_("id", list(dict.fromkeys(x["evidence_id"] for x in evidence_links)))
            .execute()
        ).data if evidence_links else []

        innovations = (
            supabase.table("innovations")
            .select("id,title,idea,status")
            .eq("school_id", payload.school_id)
            .eq("academic_year_id", payload.academic_year_id)
            .execute()
        ).data

        partnerships = (
            supabase.table("school_partners")
            .select("id,objective,joint_activities,status,partners(name,partner_type)")
            .eq("school_id", payload.school_id)
            .eq("academic_year_id", payload.academic_year_id)
            .execute()
        ).data

        twinning = (
            supabase.table("school_twinning")
            .select("id,partner_school_name,objective,activities,status")
            .eq("school_id", payload.school_id)
            .eq("academic_year_id", payload.academic_year_id)
            .execute()
        ).data

        total_evaluation_items = len(
            supabase.table("evaluation_items").select("id").execute().data
        )
        evaluated_item_rows = (
            supabase.table("school_evaluation_items")
            .select("evaluation_item_id")
            .eq("school_evaluation_id", evaluation.get("id"))
            .execute()
        ).data if evaluation.get("id") else []
        evaluated_item_ids = {row["evaluation_item_id"] for row in evaluated_item_rows}

        evaluation_evidence = (
            supabase.table("evidence")
            .select("id,school_evaluation_item_id")
            .eq("school_evaluation_id", evaluation.get("id"))
            .execute()
        ).data if evaluation.get("id") else []
        evidence_item_ids = {
            row["school_evaluation_item_id"]
            for row in evaluation_evidence
            if row.get("school_evaluation_item_id")
        }

        data = {
            "evaluation": evaluation,
            "evaluation_context": {
                "completed_items": len(evaluated_item_ids),
                "total_items": total_evaluation_items,
                "completion_percentage": round(
                    (len(evaluated_item_ids) / total_evaluation_items) * 100, 1
                ) if total_evaluation_items else 0,
                "evidence_count": len(evaluation_evidence),
                "items_with_evidence": len(evidence_item_ids),
                "evidence_coverage_percentage": round(
                    (len(evidence_item_ids) / total_evaluation_items) * 100, 1
                ) if total_evaluation_items else 0,
            },
            "problems": problems,
            "plans": plans,
            "objectives": objectives,
            "activities": activities,
            "evidence_links": evidence_links,
            "evidence": evidence,
            "innovations": innovations,
            "partnerships": partnerships,
            "twinning": twinning,
        }

        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="مفتاح OPENAI_API_KEY غير مضبوط في بيئة الخادم")

        model = os.getenv("OPENAI_MODEL", "gpt-6-luna")
        if model in {"gpt-5.6-mini", "gpt-5.6-mini-latest"}:
            model = "gpt-6-luna"

        client = OpenAI(api_key=api_key)
        system_prompt = """
أنت مساعد تحليلي متخصص في قراءة جاهزية ملف المدرسة ضمن منصة «صِحّة».
حلّل البيانات المرسلة فقط، ولا تخترع أي رقم أو نتيجة أو شاهد.
لا تضع درجة جديدة للتقييم ولا تغيّر حكم الفريق.
مؤشر الجاهزية الداخلي هو مؤشر اكتمال تشغيلي فقط وليس درجة للمسابقة.
أخرج JSON صالحًا فقط بالمفاتيح:
summary, strengths, gaps, evidence_gaps, plan_gaps, immediate_actions
حيث:
summary: فقرة عربية قصيرة تصف الحالة الحالية بدقة.
strengths: قائمة قصيرة بنقاط قوة مثبتة بالبيانات.
gaps: قائمة قصيرة بالفجوات الحالية.
evidence_gaps: قائمة قصيرة توضّح نقص التوثيق أو الأدلة دون افتراض محتوى غير موجود.
plan_gaps: قائمة قصيرة توضّح ما ينقص الخطط والأنشطة والتنفيذ.
immediate_actions: قائمة قصيرة قابلة للتنفيذ خلال الفترة القادمة.
اذكر بوضوح عندما تكون البيانات غير كافية للاستنتاج.
استخدم لغة عربية رسمية واضحة، ولا تذكر أنك نموذج ذكاء اصطناعي.
""".strip()

        response = client.responses.create(
            model=model,
            input=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": json.dumps(data, ensure_ascii=False)},
            ],
        )

        raw = response.output_text
        try:
            analysis = json.loads(raw)
        except json.JSONDecodeError:
            analysis = {
                "summary": raw,
                "strengths": [],
                "gaps": [],
                "evidence_gaps": [],
                "plan_gaps": [],
                "immediate_actions": [],
            }

        return {
            "success": True,
            "analysis": analysis,
            "note": "التحليل مبني على البيانات المسجلة في المنصة فقط، ولا يستبدل حكم فريق المدرسة.",
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"تعذر تحليل جاهزية ملف المسابقة: {e}")

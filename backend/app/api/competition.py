# -*- coding: utf-8 -*-
from fastapi import APIRouter, HTTPException
from backend.app.core.supabase import supabase

router = APIRouter(prefix="/api/competition", tags=["Competition"])


def _pct(part: float, total: float) -> float:
    if not total:
        return 0
    return round((part / total) * 100, 1)


@router.get("/school/{school_id}/year/{academic_year_id}")
def competition_view(school_id: str, academic_year_id: str):
    try:
        evaluation_rows = (
            supabase.table("school_evaluations")
            .select("id,total_score,percentage,status")
            .eq("school_id", school_id)
            .eq("academic_year_id", academic_year_id)
            .eq("evaluation_type", "self")
            .limit(1)
            .execute()
        ).data
        evaluation = evaluation_rows[0] if evaluation_rows else {
            "id": None,
            "total_score": 0,
            "percentage": 0,
            "status": "غير مكتمل",
        }

        official_items = supabase.table("evaluation_items").select("id").execute().data
        total_evaluation_items = len(official_items)

        evaluated_items = []
        if evaluation.get("id"):
            evaluated_items = (
                supabase.table("school_evaluation_items")
                .select("evaluation_item_id,score")
                .eq("school_evaluation_id", evaluation["id"])
                .execute()
            ).data
        evaluated_item_ids = {row["evaluation_item_id"] for row in evaluated_items}
        evaluation_completion = _pct(len(evaluated_item_ids), total_evaluation_items)

        evidence_rows = (
            supabase.table("evidence")
            .select("id,school_evaluation_item_id")
            .eq("school_evaluation_id", evaluation["id"])
            .execute().data
        ) if evaluation.get("id") else []
        evidence_item_ids = {
            row["school_evaluation_item_id"]
            for row in evidence_rows
            if row.get("school_evaluation_item_id")
        }
        evidence_coverage = _pct(len(evidence_item_ids), total_evaluation_items)

        problems = (
            supabase.table("health_problems")
            .select("id,title,priority_level,status")
            .eq("school_id", school_id)
            .eq("academic_year_id", academic_year_id)
            .execute()
        ).data

        plans = (
            supabase.table("health_plans")
            .select("id,title,status")
            .eq("school_id", school_id)
            .eq("academic_year_id", academic_year_id)
            .execute()
        ).data

        plan_ids = [p["id"] for p in plans]
        objectives = (
            supabase.table("objectives")
            .select("id,health_plan_id")
            .in_("health_plan_id", plan_ids)
            .execute()
        ).data if plan_ids else []

        activities = (
            supabase.table("activities")
            .select("id,health_plan_id,status,completion_percentage")
            .in_("health_plan_id", plan_ids)
            .execute()
        ).data if plan_ids else []

        objective_plan_ids = {
            o["health_plan_id"] for o in objectives if o.get("health_plan_id")
        }
        activity_plan_ids = {
            a["health_plan_id"] for a in activities if a.get("health_plan_id")
        }
        structured_plan_ids = objective_plan_ids & activity_plan_ids
        plan_completion = _pct(len(structured_plan_ids), len(plans))

        execution = round(
            sum(float(a.get("completion_percentage") or 0) for a in activities) / len(activities),
            1,
        ) if activities else 0

        activity_ids = [a["id"] for a in activities]
        activity_links = (
            supabase.table("evidence_links")
            .select("evidence_id,activity_id")
            .in_("activity_id", activity_ids)
            .execute()
        ).data if activity_ids else []
        documented_activity_ids = {
            x["activity_id"] for x in activity_links if x.get("activity_id")
        }
        activity_documentation = _pct(len(documented_activity_ids), len(activity_ids))

        innovations = (
            supabase.table("innovations")
            .select("id,title,idea,impact,status")
            .eq("school_id", school_id)
            .eq("academic_year_id", academic_year_id)
            .execute()
        ).data

        partnerships = (
            supabase.table("school_partners")
            .select("id,objective,joint_activities,status,partners(name,partner_type)")
            .eq("school_id", school_id)
            .eq("academic_year_id", academic_year_id)
            .execute()
        ).data

        twinning = (
            supabase.table("school_twinning")
            .select("id,partner_school_name,objective,activities,outcomes,status")
            .eq("school_id", school_id)
            .eq("academic_year_id", academic_year_id)
            .execute()
        ).data

        innovation_partnership = round(
            ((100 if innovations else 0) + (100 if (partnerships or twinning) else 0)) / 2,
            1,
        )

        overall_readiness = round(
            (
                evaluation_completion
                + evidence_coverage
                + plan_completion
                + execution
                + activity_documentation
                + innovation_partnership
            ) / 6,
            1,
        )

        return {
            "success": True,
            "competition": {
                "evaluation": {
                    "total_score": evaluation.get("total_score", 0),
                    "percentage": evaluation.get("percentage", 0),
                    "status": evaluation.get("status", "غير مكتمل"),
                    "completed_items": len(evaluated_item_ids),
                    "total_items": total_evaluation_items,
                },
                "metrics": {
                    "evaluation_completion": evaluation_completion,
                    "evidence_coverage": evidence_coverage,
                    "plan_completion": plan_completion,
                    "execution": execution,
                    "activity_documentation": activity_documentation,
                    "innovation_partnership": innovation_partnership,
                    "overall_readiness": overall_readiness,
                },
                "counts": {
                    "problems": len(problems),
                    "plans": len(plans),
                    "objectives": len(objectives),
                    "activities": len(activities),
                    "evidence": len(evidence_rows),
                    "innovations": len(innovations),
                    "partnerships": len(partnerships),
                    "twinning": len(twinning),
                },
                "problems": problems,
                "plans": plans,
                "innovations": innovations,
                "partnerships": partnerships,
                "twinning": twinning,
                "notes": [
                    "مؤشر الجاهزية في هذه الشاشة مؤشر داخلي لا يمثل الدرجة الرسمية للمسابقة.",
                    "الدرجة الرسمية المعروضة منفصلة عن اكتمال الملف والشواهد.",
                    "لا يتم رفع الجاهزية بمجرد زيادة عدد الأنشطة؛ بل بحسب اكتمال عناصر الملف الموثقة في المنصة.",
                ],
            },
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"تعذر إعداد وضع المسابقة: {e}")

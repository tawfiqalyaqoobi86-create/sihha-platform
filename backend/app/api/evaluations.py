# -*- coding: utf-8 -*-

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from backend.app.core.supabase import supabase

router = APIRouter(prefix="/api/evaluations", tags=["Evaluations"])


class SaveItemRequest(BaseModel):
    school_id: str
    academic_year_id: str
    evaluation_item_id: str
    score: float = Field(ge=0)
    evaluator_notes: str | None = None


def _get_or_create_evaluation(school_id: str, academic_year_id: str):
    existing = (
        supabase.table("school_evaluations")
        .select("id,status,total_score,percentage")
        .eq("school_id", school_id)
        .eq("academic_year_id", academic_year_id)
        .eq("evaluation_type", "self")
        .limit(1)
        .execute()
    )
    if existing.data:
        return existing.data[0]

    created = (
        supabase.table("school_evaluations")
        .insert({
            "school_id": school_id,
            "academic_year_id": academic_year_id,
            "evaluation_type": "self",
            "status": "in_progress",
            "total_score": 0,
            "percentage": 0,
        })
        .execute()
    )
    if not created.data:
        raise RuntimeError("تعذر إنشاء سجل التقييم")
    return created.data[0]


@router.post("/save-item")
def save_evaluation_item(payload: SaveItemRequest):
    try:
        item = (
            supabase.table("evaluation_items")
            .select("id,max_score,component_id")
            .eq("id", payload.evaluation_item_id)
            .single()
            .execute()
        ).data

        if not item:
            raise HTTPException(status_code=404, detail="بند التقييم غير موجود")

        if payload.score > float(item["max_score"]):
            raise HTTPException(
                status_code=400,
                detail=f"الدرجة لا يمكن أن تتجاوز {item['max_score']}",
            )

        evaluation = _get_or_create_evaluation(
            payload.school_id, payload.academic_year_id
        )

        current = (
            supabase.table("school_evaluation_items")
            .select("id")
            .eq("school_evaluation_id", evaluation["id"])
            .eq("evaluation_item_id", payload.evaluation_item_id)
            .limit(1)
            .execute()
        )

        data = {
            "school_evaluation_id": evaluation["id"],
            "evaluation_item_id": payload.evaluation_item_id,
            "score": payload.score,
            "evaluator_notes": payload.evaluator_notes,
        }

        if current.data:
            saved = (
                supabase.table("school_evaluation_items")
                .update({
                    "score": payload.score,
                    "evaluator_notes": payload.evaluator_notes,
                })
                .eq("id", current.data[0]["id"])
                .execute()
            )
        else:
            saved = supabase.table("school_evaluation_items").insert(data).execute()

        if not saved.data:
            raise RuntimeError("تعذر حفظ بند التقييم")

        all_items = (
            supabase.table("school_evaluation_items")
            .select("score,evaluation_item_id,evaluation_items(max_score)")
            .eq("school_evaluation_id", evaluation["id"])
            .execute()
        )

        total_score = sum(float(row.get("score") or 0) for row in all_items.data)
        total_max = sum(
            float((row.get("evaluation_items") or {}).get("max_score") or 0)
            for row in all_items.data
        )
        percentage = round((total_score / total_max) * 100, 2) if total_max else 0

        supabase.table("school_evaluations").update({
            "status": "in_progress",
            "total_score": total_score,
            "percentage": percentage,
        }).eq("id", evaluation["id"]).execute()

        return {
            "success": True,
            "evaluation_id": evaluation["id"],
            "item": saved.data[0],
            "total_score": total_score,
            "total_max": total_max,
            "percentage": percentage,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"حدث خطأ أثناء حفظ التقييم: {str(e)}",
        )


@router.get("/school/{school_id}/year/{academic_year_id}")
def get_school_evaluation(school_id: str, academic_year_id: str):
    try:
        evaluation = (
            supabase.table("school_evaluations")
            .select("id,status,total_score,percentage,evaluation_type")
            .eq("school_id", school_id)
            .eq("academic_year_id", academic_year_id)
            .eq("evaluation_type", "self")
            .limit(1)
            .execute()
        )

        if not evaluation.data:
            return {
                "success": True,
                "exists": False,
                "data": {
                    "total_score": 0,
                    "percentage": 0,
                    "items": [],
                },
            }

        ev = evaluation.data[0]
        items = (
            supabase.table("school_evaluation_items")
            .select("id,evaluation_item_id,score,evaluator_notes")
            .eq("school_evaluation_id", ev["id"])
            .execute()
        )

        return {
            "success": True,
            "exists": True,
            "data": {
                **ev,
                "items": items.data,
            },
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"حدث خطأ أثناء جلب التقييم: {str(e)}",
        )

# -*- coding: utf-8 -*-

import re
import uuid

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from backend.app.core.supabase import supabase

router = APIRouter(prefix="/api/evidence", tags=["Evidence"])

BUCKET = "sihha-evidence"
MAX_FILE_SIZE = 20 * 1024 * 1024


def _safe_name(name: str) -> str:
    name = re.sub(r"[^\w\-.\u0600-\u06FF ]+", "_", name or "evidence")
    return name.strip()[:120] or "evidence"


def _get_or_create_evaluation(school_id: str, academic_year_id: str):
    existing = (
        supabase.table("school_evaluations")
        .select("id")
        .eq("school_id", school_id)
        .eq("academic_year_id", academic_year_id)
        .eq("evaluation_type", "self")
        .limit(1)
        .execute()
    )
    if existing.data:
        return existing.data[0]["id"]

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
    return created.data[0]["id"]


@router.post("/upload")
async def upload_evidence(
    school_id: str = Form(...),
    academic_year_id: str = Form(...),
    evaluation_item_id: str = Form(...),
    title: str = Form(...),
    description: str | None = Form(None),
    file: UploadFile = File(...),
):
    try:
        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(status_code=400, detail="حجم الشاهد يتجاوز 20 ميجابايت")

        evaluation_id = _get_or_create_evaluation(school_id, academic_year_id)

        current_item = (
            supabase.table("school_evaluation_items")
            .select("id")
            .eq("school_evaluation_id", evaluation_id)
            .eq("evaluation_item_id", evaluation_item_id)
            .limit(1)
            .execute()
        )

        if current_item.data:
            evaluation_item_row_id = current_item.data[0]["id"]
        else:
            created_item = (
                supabase.table("school_evaluation_items")
                .insert({
                    "school_evaluation_id": evaluation_id,
                    "evaluation_item_id": evaluation_item_id,
                    "score": 0,
                })
                .execute()
            )
            evaluation_item_row_id = created_item.data[0]["id"]

        path = (
            f"{school_id}/{academic_year_id}/{evaluation_item_id}/"
            f"{uuid.uuid4()}-{_safe_name(file.filename or 'evidence')}"
        )

        supabase.storage.from_(BUCKET).upload(
            path,
            content,
            {"content-type": file.content_type or "application/octet-stream"},
        )

        saved = (
            supabase.table("evidence")
            .insert({
                "school_evaluation_id": evaluation_id,
                "school_evaluation_item_id": evaluation_item_row_id,
                "title": title,
                "evidence_type": "document",
                "description": description,
                "original_file_name": file.filename,
                "mime_type": file.content_type,
                "file_size": len(content),
                "storage_path": path,
            })
            .execute()
        )

        if not saved.data:
            raise RuntimeError("تعذر حفظ بيانات الشاهد")

        return {"success": True, "data": saved.data[0]}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"حدث خطأ أثناء رفع الشاهد: {str(e)}")


@router.get("/item/{evaluation_item_id}")
def get_item_evidence(evaluation_item_id: str):
    try:
        rows = (
            supabase.table("evidence")
            .select("id,title,description,original_file_name,mime_type,file_size,storage_path,created_at")
            .eq("school_evaluation_item_id", evaluation_item_id)
            .order("created_at", desc=True)
            .execute()
        )

        data = []
        for row in rows.data:
            signed = supabase.storage.from_(BUCKET).create_signed_url(
                row["storage_path"], 3600
            )
            row["signed_url"] = signed.get("signedURL") or signed.get("signed_url")
            data.append(row)

        return {"success": True, "data": data}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"حدث خطأ أثناء جلب الشواهد: {str(e)}")

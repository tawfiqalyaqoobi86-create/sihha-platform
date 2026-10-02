# -*- coding: utf-8 -*-

import re
import uuid

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from backend.app.core.supabase import supabase
from backend.app.services.audit import audit

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

        # استخدم اسمًا آمنًا ASCII للتخزين؛ نحفظ الاسم الأصلي في قاعدة البيانات
        original_name = file.filename or "evidence"
        ext = ""
        if "." in original_name:
            candidate_ext = original_name.rsplit(".", 1)[-1].lower()
            if re.fullmatch(r"[a-z0-9]{1,10}", candidate_ext):
                ext = "." + candidate_ext

        path = (
            f"{school_id}/{academic_year_id}/{evaluation_item_id}/"
            f"{uuid.uuid4().hex}{ext}"
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

        audit("create", "evidence", saved.data[0]["id"], school_id, details={"title": title, "evaluation_item_id": evaluation_item_id})
        return {"success": True, "data": saved.data[0]}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"حدث خطأ أثناء رفع الشاهد: {str(e)}")


@router.delete("/{evidence_id}")
def delete_evidence(evidence_id: str):
    try:
        row_result = (
            supabase.table("evidence")
            .select("id,storage_path,title,school_evaluation_id")
            .eq("id", evidence_id)
            .limit(1)
            .execute()
        )
        if not row_result.data:
            raise HTTPException(status_code=404, detail="الشاهد غير موجود")

        row = row_result.data[0]

        # حذف الملف الفعلي من Storage أولًا
        if row.get("storage_path"):
            supabase.storage.from_(BUCKET).remove([row["storage_path"]])

        deleted = (
            supabase.table("evidence")
            .delete()
            .eq("id", evidence_id)
            .execute()
        )

        audit(
            "delete",
            "evidence",
            evidence_id,
            details={"title": row.get("title"), "storage_path": row.get("storage_path")},
        )

        return {"success": True, "data": deleted.data[0] if deleted.data else None}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"تعذر حذف الشاهد: {e}")


@router.get("/item/{evaluation_item_id}")
def get_item_evidence(evaluation_item_id: str):
    try:
        # evidence.school_evaluation_item_id يشير إلى صف school_evaluation_items،
        # بينما المسار يستقبل evaluation_item_id الرسمي؛ نحول المعرّف أولًا.
        item_rows = (
            supabase.table("school_evaluation_items")
            .select("id")
            .eq("evaluation_item_id", evaluation_item_id)
            .execute()
        )
        item_ids = [row["id"] for row in item_rows.data]
        if not item_ids:
            return {"success": True, "data": []}

        rows = (
            supabase.table("evidence")
            .select("id,title,description,original_file_name,mime_type,file_size,storage_path,created_at")
            .in_("school_evaluation_item_id", item_ids)
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


@router.get("/activity/{activity_id}")
def get_activity_evidence(activity_id: str):
    try:
        links = (
            supabase.table("evidence_links")
            .select("evidence_id")
            .eq("activity_id", activity_id)
            .execute()
        )
        ids = [x["evidence_id"] for x in links.data]
        if not ids:
            return {"success": True, "data": []}
        rows = (
            supabase.table("evidence")
            .select("id,title,description,original_file_name,mime_type,file_size,storage_path,created_at")
            .in_("id", ids)
            .order("created_at", desc=True)
            .execute()
        )
        return {"success": True, "data": rows.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"حدث خطأ أثناء جلب أدلة النشاط: {str(e)}")


from pydantic import BaseModel

class EvidenceLinkRequest(BaseModel):
    evidence_id: str
    problem_id: str | None = None
    health_plan_id: str | None = None
    objective_id: str | None = None
    activity_id: str | None = None
    indicator_id: str | None = None
    result_id: str | None = None
    impact_measurement_id: str | None = None
    link_note: str | None = None

@router.post("/link")
def link_evidence(payload: EvidenceLinkRequest):
    try:
        targets = {k:v for k,v in {
            "problem_id": payload.problem_id,
            "health_plan_id": payload.health_plan_id,
            "objective_id": payload.objective_id,
            "activity_id": payload.activity_id,
            "indicator_id": payload.indicator_id,
            "result_id": payload.result_id,
            "impact_measurement_id": payload.impact_measurement_id,
        }.items() if v is not None}
        if not targets:
            raise HTTPException(status_code=400, detail="حدد جهة واحدة على الأقل لربط الشاهد بها")
        saved = supabase.table("evidence_links").insert({"evidence_id":payload.evidence_id, **targets, "link_note":payload.link_note}).execute()
        audit("link", "evidence", payload.evidence_id, details=targets)
        return {"success": True, "data": saved.data[0] if saved.data else None}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"تعذر ربط الشاهد: {e}")

@router.get("/result/{result_id}")
def get_result_evidence(result_id: str):
    try:
        links=supabase.table("evidence_links").select("evidence_id,link_note").eq("result_id",result_id).execute()
        ids=[x["evidence_id"] for x in links.data]
        if not ids: return {"success":True,"data":[]}
        rows=supabase.table("evidence").select("id,title,description,original_file_name,mime_type,file_size,storage_path,created_at").in_("id",ids).execute()
        return {"success":True,"data":rows.data}
    except Exception as e: raise HTTPException(status_code=500, detail=f"تعذر جلب أدلة النتيجة: {e}")

@router.get("/impact/{impact_id}")
def get_impact_evidence(impact_id: str):
    try:
        links=supabase.table("evidence_links").select("evidence_id,link_note").eq("impact_measurement_id",impact_id).execute()
        ids=[x["evidence_id"] for x in links.data]
        if not ids: return {"success":True,"data":[]}
        rows=supabase.table("evidence").select("id,title,description,original_file_name,mime_type,file_size,storage_path,created_at").in_("id",ids).execute()
        return {"success":True,"data":rows.data}
    except Exception as e: raise HTTPException(status_code=500, detail=f"تعذر جلب أدلة الأثر: {e}")


@router.get("/school/{school_id}/year/{academic_year_id}")
def get_school_evidence(school_id: str, academic_year_id: str):
    try:
        ev = supabase.table("school_evaluations").select("id").eq("school_id", school_id).eq("academic_year_id", academic_year_id).eq("evaluation_type", "self").limit(1).execute()
        if not ev.data:
            return {"success": True, "data": []}
        rows = supabase.table("evidence").select("id,title,description,original_file_name,mime_type,file_size,storage_path,created_at,school_evaluation_item_id").eq("school_evaluation_id", ev.data[0]["id"]).order("created_at", desc=True).execute()
        data=[]
        for row in rows.data:
            signed=supabase.storage.from_(BUCKET).create_signed_url(row["storage_path"],3600)
            row["signed_url"]=signed.get("signedURL") or signed.get("signed_url")
            data.append(row)
        return {"success":True,"data":data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"تعذر جلب مستودع الأدلة: {e}")

# -*- coding: utf-8 -*-
from fastapi import APIRouter, HTTPException
from backend.app.core.supabase import supabase

router = APIRouter(prefix="/api/audit", tags=["Audit"])

@router.get("/school/{school_id}")
def list_audit_logs(school_id: str, limit: int = 100):
    try:
        limit = max(1, min(limit, 500))
        r = supabase.table("audit_logs").select(
            "id,action,entity_type,entity_id,details,created_at"
        ).eq("school_id", school_id).order("created_at", desc=True).limit(limit).execute()
        return {"success": True, "data": r.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"تعذر جلب سجل العمليات: {e}")

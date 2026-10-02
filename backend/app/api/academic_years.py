# -*- coding: utf-8 -*-

from fastapi import APIRouter, HTTPException
from backend.app.core.supabase import supabase

router = APIRouter(
    prefix="/api/academic-years",
    tags=["Academic Years"],
)


@router.get("/")
def get_academic_years():
    try:
        response = (
            supabase
            .table("academic_years")
            .select("*")
            .order("start_date", desc=True)
            .execute()
        )

        return {
            "success": True,
            "count": len(response.data),
            "data": response.data,
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"حدث خطأ أثناء جلب السنوات الدراسية: {str(e)}",
        )

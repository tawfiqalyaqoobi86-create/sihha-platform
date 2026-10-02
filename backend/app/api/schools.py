# -*- coding: utf-8 -*-

from fastapi import APIRouter, HTTPException
from backend.app.core.supabase import supabase

router = APIRouter(
    prefix="/api/schools",
    tags=["Schools"],
)


@router.get("/")
def get_schools():
    try:
        response = (
            supabase
            .table("schools")
            .select("*")
            .order("name")
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
            detail=f"حدث خطأ أثناء جلب المدارس: {str(e)}",
        )

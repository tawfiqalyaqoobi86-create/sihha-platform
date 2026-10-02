# -*- coding: utf-8 -*-

from fastapi import APIRouter, HTTPException
from backend.app.core.supabase import supabase

router = APIRouter(
    prefix="/api/components",
    tags=["Health Components"],
)


@router.get("/")
def get_components():
    try:
        response = (
            supabase
            .table("components")
            .select("id,code,name,description,official_total_score,sort_order")
            .order("sort_order")
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
            detail=f"حدث خطأ أثناء جلب المكونات: {str(e)}",
        )


@router.get("/{component_id}")
def get_component(component_id: str):
    try:
        response = (
            supabase
            .table("components")
            .select("id,code,name,description,official_total_score,sort_order")
            .eq("id", component_id)
            .single()
            .execute()
        )

        return {
            "success": True,
            "data": response.data,
        }

    except Exception as e:
        raise HTTPException(
            status_code=404,
            detail=f"لم يتم العثور على المكون: {str(e)}",
        )


@router.get("/{component_id}/evaluation-items")
def get_component_evaluation_items(component_id: str):
    try:
        component = (
            supabase
            .table("components")
            .select("id,code,name")
            .eq("id", component_id)
            .single()
            .execute()
        )

        indicators = (
            supabase
            .table("indicators")
            .select("id,component_id,code,title,description,sort_order")
            .eq("component_id", component_id)
            .order("sort_order")
            .execute()
        )

        indicator_ids = [row["id"] for row in indicators.data]

        if not indicator_ids:
            return {
                "success": True,
                "component": component.data,
                "indicators": [],
                "items": [],
            }

        items = (
            supabase
            .table("evaluation_items")
            .select("id,indicator_id,code,title,description,max_score,sort_order")
            .in_("indicator_id", indicator_ids)
            .order("sort_order")
            .execute()
        )

        item_ids = [row["id"] for row in items.data]

        sources_by_item = {}

        if item_ids:
            sources = (
                supabase
                .table("evaluation_sources")
                .select("id,evaluation_item_id,source_type,title,description")
                .in_("evaluation_item_id", item_ids)
                .order("created_at")
                .execute()
            )

            for source in sources.data:
                sources_by_item.setdefault(
                    source["evaluation_item_id"], []
                ).append(source)

        enriched_items = []

        for item in items.data:
            enriched_items.append({
                **item,
                "sources": sources_by_item.get(item["id"], []),
            })

        return {
            "success": True,
            "component": component.data,
            "indicators": indicators.data,
            "items": enriched_items,
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"حدث خطأ أثناء جلب بنود تقييم المكون: {str(e)}",
        )

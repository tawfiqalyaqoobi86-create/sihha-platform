# -*- coding: utf-8 -*-
from backend.app.core.supabase import supabase

def audit(action: str, entity_type: str | None = None, entity_id: str | None = None,
          school_id: str | None = None, profile_id: str | None = None, details: dict | None = None):
    try:
        supabase.table("audit_logs").insert({
            "school_id": school_id,
            "profile_id": profile_id,
            "action": action,
            "entity_type": entity_type,
            "entity_id": entity_id,
            "details": details or {},
        }).execute()
    except Exception:
        # سجل التدقيق لا ينبغي أن يعطل العملية الأساسية.
        pass

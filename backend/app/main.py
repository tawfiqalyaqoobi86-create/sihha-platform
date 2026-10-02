# -*- coding: utf-8 -*-

from fastapi import FastAPI

from backend.app.api.schools import router as schools_router
from backend.app.api.academic_years import router as academic_years_router
from backend.app.api.components import router as components_router


app = FastAPI(
    title="صِحّة",
    description="منصة عمر بن مسعود للمدارس المعززة للصحة",
    version="0.2.0",
)


# =========================
# API Routes
# =========================

app.include_router(schools_router)
app.include_router(academic_years_router)
app.include_router(components_router)


# =========================
# Root
# =========================

@app.get("/")
def root():
    return {
        "message": "مرحبًا بك في منصة صِحّة",
        "status": "running",
        "version": "0.2.0",
    }


# =========================
# Health Check
# =========================

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "sihha-api",
    }

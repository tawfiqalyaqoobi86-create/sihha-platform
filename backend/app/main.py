# -*- coding: utf-8 -*-

from fastapi import FastAPI

from backend.app.api.schools import router as schools_router
from backend.app.api.academic_years import router as academic_years_router
from backend.app.api.components import router as components_router
from backend.app.api.evaluations import router as evaluations_router

app = FastAPI(
    title="صِحّة",
    description="منصة عمر بن مسعود للمدارس المعززة للصحة",
    version="0.3.0",
)

app.include_router(schools_router)
app.include_router(academic_years_router)
app.include_router(components_router)
app.include_router(evaluations_router)

@app.get("/")
def root():
    return {
        "message": "مرحبًا بك في منصة صِحّة",
        "status": "running",
        "version": "0.3.0",
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "sihha-api",
    }

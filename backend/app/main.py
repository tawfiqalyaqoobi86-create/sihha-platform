# -*- coding: utf-8 -*-

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.api.schools import router as schools_router
from backend.app.api.academic_years import router as academic_years_router
from backend.app.api.components import router as components_router
from backend.app.api.evaluations import router as evaluations_router
from backend.app.api.evidence import router as evidence_router
from backend.app.api.health_problems import router as health_problems_router
from backend.app.api.health_plans import router as health_plans_router
from backend.app.api.impact import router as impact_router
from backend.app.api.innovations import router as innovations_router
from backend.app.api.partnerships import router as partnerships_router
from backend.app.api.reports import router as reports_router
from backend.app.api.competition import router as competition_router

app = FastAPI(
    title="صِحّة",
    description="منصة عمر بن مسعود للمدارس المعززة للصحة",
    version="0.3.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(schools_router)
app.include_router(academic_years_router)
app.include_router(components_router)
app.include_router(evaluations_router)
app.include_router(evidence_router)
app.include_router(health_problems_router)
app.include_router(health_plans_router)
app.include_router(impact_router)
app.include_router(innovations_router)
app.include_router(partnerships_router)
app.include_router(reports_router)
app.include_router(competition_router)

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

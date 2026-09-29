from fastapi import FastAPI

app = FastAPI(
    title="صِحّة",
    description="منصة عمر بن مسعود للمدارس المعززة للصحة",
    version="0.1.0",
)


@app.get("/")
def root():
    return {
        "message": "مرحبًا بك في منصة صِحّة",
        "status": "running",
        "version": "0.1.0",
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "sihha-api",
    }
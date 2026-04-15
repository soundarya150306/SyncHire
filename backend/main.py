from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
import database

from routers import auth, jobs, candidates, dashboard

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Resume Screener", version="1.0.0")

import os

cors_origins = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173,https://sync-hire-green.vercel.app,https://synchire-ai-screener.vercel.app"
).split(",")


# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(jobs.router)
app.include_router(candidates.router)
app.include_router(dashboard.router)

# The root "/" is handled by the frontend index.html on Vercel.
# Backend routes are prefixed with /api via vercel.json.

@app.get("/")
def read_root():
    return {
        "message": "SyncHire AI Screener API is active",
        "status": "online",
        "database": "connected" if database.DATABASE_URL else "not configured",
        "version": "1.0.1"
    }

@app.get("/health")
def health_check():
    try:
        from database import SessionLocal
        from sqlalchemy import text
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        return {"status": "ok", "version": "1.0.1", "db": "connected"}
    except Exception as e:
        import traceback
        return {"status": "error", "error": str(e), "trace": traceback.format_exc()}


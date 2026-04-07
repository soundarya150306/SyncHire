from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import auth, jobs, candidates, dashboard

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Resume Screener", version="1.0.0")

import os

cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")

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

@app.get("/")
def read_root():
    return {"message": "AI Resume Screener API is running"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

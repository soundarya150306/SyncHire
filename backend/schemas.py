from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# User Schemas
class UserBase(BaseModel):
    email: str
    full_name: Optional[str] = None
    role: str = "recruiter"

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: str
    password: str

class PasswordUpdate(BaseModel):
    current_password: str
    new_password: str

# Job Schemas
class JobBase(BaseModel):
    title: str
    description: str
    requirements: str

class JobCreate(JobBase):
    pass

class JobResponse(JobBase):
    id: int
    owner_id: int
    created_at: datetime
    class Config:
        from_attributes = True

class JobDetailResponse(JobResponse):
    candidate_count: int = 0

# Candidate Schemas
class CandidateBase(BaseModel):
    first_name: str
    last_name: str
    email: str
    phone: str
    resume_path: str = ""

class CandidateCreate(CandidateBase):
    job_id: int

class CandidateResponse(CandidateBase):
    id: int
    job_id: int
    score: float
    analysis_feedback: Optional[str] = None
    status: str
    resume_text: Optional[str] = None
    applied_at: Optional[datetime] = None
    interview_slot: Optional[datetime] = None
    class Config:
        from_attributes = True

class CandidateStatusUpdate(BaseModel):
    status: str

class CandidateSlotUpdate(BaseModel):
    interview_slot: datetime

# Dashboard Schemas
class DashboardStats(BaseModel):
    total_jobs: int
    total_candidates: int
    interviews_scheduled: int

class ChartDataPoint(BaseModel):
    name: str
    applications: int

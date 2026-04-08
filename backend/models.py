from sqlalchemy import Column, Integer, String, Text, ForeignKey, Float, DateTime, LargeBinary
from sqlalchemy.orm import relationship
from database import Base
import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    role = Column(String, default="recruiter")  # recruiter, admin

    jobs = relationship("Job", back_populates="owner")

class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text)
    requirements = Column(Text)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    owner_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="jobs")
    candidates = relationship("Candidate", back_populates="job", cascade="all, delete-orphan")

class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String)
    last_name = Column(String)
    email = Column(String)
    phone = Column(String)
    resume_text = Column(Text)
    resume_binary = Column(LargeBinary, nullable=True)
    resume_mimetype = Column(String, nullable=True)
    resume_filename = Column(String, nullable=True)
    score = Column(Float, default=0.0)
    analysis_feedback = Column(Text, nullable=True)
    status = Column(String, default="Applied")  # Applied, Interview, Rejected, Hired
    interview_slot = Column(DateTime, nullable=True)
    applied_at = Column(DateTime, default=datetime.datetime.utcnow)
    job_id = Column(Integer, ForeignKey("jobs.id"))

    job = relationship("Job", back_populates="candidates")

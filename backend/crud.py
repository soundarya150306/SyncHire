from sqlalchemy.orm import Session
from sqlalchemy import func
import models, schemas

import bcrypt

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def update_user_password(db: Session, user_id: int, new_password: str):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user:
        user.hashed_password = hash_password(new_password)
        db.commit()
    return user

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = hash_password(user.password)
    db_user = models.User(
        email=user.email,
        hashed_password=hashed_password,
        full_name=user.full_name,
        role=user.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_jobs(db: Session, user_id: int = None, skip: int = 0, limit: int = 100):
    query = db.query(models.Job)
    if user_id:
        query = query.filter(models.Job.owner_id == user_id)
    return query.order_by(models.Job.created_at.desc()).offset(skip).limit(limit).all()

def get_public_jobs(db: Session, recruiter_id: int = None, skip: int = 0, limit: int = 100):
    query = db.query(models.Job)
    if recruiter_id:
        query = query.filter(models.Job.owner_id == recruiter_id)
    return query.order_by(models.Job.created_at.desc()).offset(skip).limit(limit).all()

def get_job(db: Session, job_id: int):
    return db.query(models.Job).filter(models.Job.id == job_id).first()

def create_job(db: Session, job: schemas.JobCreate, user_id: int):
    db_job = models.Job(**job.dict(), owner_id=user_id)
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    return db_job

def delete_job(db: Session, job_id: int):
    job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if job:
        db.delete(job)
        db.commit()
    return job

def get_candidates(db: Session, job_id: int):
    return db.query(models.Candidate).filter(
        models.Candidate.job_id == job_id
    ).order_by(models.Candidate.score.desc()).all()

def get_all_candidates_for_user(db: Session, user_id: int):
    # Fetch all candidates (Bypassing owner filtering for prototype visibility)
    return db.query(models.Candidate).order_by(models.Candidate.applied_at.desc()).all()

def get_candidate(db: Session, candidate_id: int):
    return db.query(models.Candidate).filter(models.Candidate.id == candidate_id).first()

def update_candidate_status(db: Session, candidate_id: int, status: str):
    candidate = db.query(models.Candidate).filter(models.Candidate.id == candidate_id).first()
    if candidate:
        candidate.status = status
        db.commit()
        db.refresh(candidate)
    return candidate

def update_candidate_slot(db: Session, candidate_id: int, slot_time: str):
    candidate = db.query(models.Candidate).filter(models.Candidate.id == candidate_id).first()
    if candidate:
        candidate.interview_slot = slot_time
        candidate.status = "Interview"
        db.commit()
        db.refresh(candidate)
    return candidate

def get_total_candidates_count(db: Session, user_id: int = None):
    if user_id:
        # Use query directly, in_() can accept a Query or select object
        job_ids = db.query(models.Job.id).filter(models.Job.owner_id == user_id)
        return db.query(func.count(models.Candidate.id)).filter(
            models.Candidate.job_id.in_(job_ids)
        ).scalar()
    return db.query(func.count(models.Candidate.id)).scalar()

def get_interviews_count(db: Session, user_id: int = None):
    if user_id:
        # Use query directly
        job_ids = db.query(models.Job.id).filter(models.Job.owner_id == user_id)
        return db.query(func.count(models.Candidate.id)).filter(
            models.Candidate.job_id.in_(job_ids),
            models.Candidate.status == "Interview"
        ).scalar()
    return db.query(func.count(models.Candidate.id)).filter(
        models.Candidate.status == "Interview"
    ).scalar()

from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List
import shutil
import os
import schemas, models, crud, database, resume_parser, matcher
from deps import get_current_user

router = APIRouter(
    prefix="/candidates",
    tags=["candidates"]
)

UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

@router.post("/apply", response_model=schemas.CandidateResponse)
def apply_for_job(
    job_id: int = Form(...),
    first_name: str = Form(...),
    last_name: str = Form(...),
    email: str = Form(...),
    phone: str = Form(...),
    resume: UploadFile = File(...),
    db: Session = Depends(database.get_db)
):
    # Save file with unique name
    import uuid
    file_ext = os.path.splitext(resume.filename)[1]
    unique_filename = f"{uuid.uuid4().hex}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(resume.file, buffer)

    # Parse Resume
    resume_text = resume_parser.parse_resume(file_path)

    # Create Candidate Record
    candidate_data = schemas.CandidateCreate(
        first_name=first_name,
        last_name=last_name,
        email=email,
        phone=phone,
        job_id=job_id,
        resume_path=file_path
    )

    # Calculate Score & Feedback
    job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # Combine job description + requirements for better matching
    job_text = f"{job.description} {job.requirements}"
    score, feedback = matcher.calculate_match_score(resume_text, job_text)

    # Save to DB
    db_candidate = models.Candidate(
        **candidate_data.dict(),
        resume_text=resume_text,
        score=score,
        analysis_feedback=feedback
    )
    db.add(db_candidate)
    db.commit()
    db.refresh(db_candidate)

    return db_candidate


@router.get("/", response_model=List[schemas.CandidateResponse])
def get_all_candidates(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    return crud.get_all_candidates_for_user(db, current_user.id)

@router.get("/{job_id}", response_model=List[schemas.CandidateResponse])
def get_candidates_for_job(job_id: int, db: Session = Depends(database.get_db)):
    return crud.get_candidates(db, job_id=job_id)

@router.patch("/{candidate_id}/status", response_model=schemas.CandidateResponse)
def update_candidate_status(
    candidate_id: int,
    status_update: schemas.CandidateStatusUpdate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    valid_statuses = ["Applied", "Interview", "Hired", "Rejected"]
    if status_update.status not in valid_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Status must be one of: {', '.join(valid_statuses)}"
        )

    candidate = crud.update_candidate_status(db, candidate_id, status_update.status)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return candidate

@router.get("/{candidate_id}/resume")
def download_resume(
    candidate_id: int,
    db: Session = Depends(database.get_db)
):
    candidate = crud.get_candidate(db, candidate_id)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    if not candidate.resume_path or not os.path.exists(candidate.resume_path):
        raise HTTPException(status_code=404, detail="Resume file not found")

    return FileResponse(
        candidate.resume_path,
        filename=f"{candidate.first_name}_{candidate.last_name}_resume{os.path.splitext(candidate.resume_path)[1]}",
        media_type="application/octet-stream"
    )

@router.patch("/{candidate_id}/interview_slot", response_model=schemas.CandidateResponse)
def schedule_interview_slot(
    candidate_id: int,
    slot_update: schemas.CandidateSlotUpdate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    candidate = crud.update_candidate_slot(db, candidate_id, slot_update.interview_slot)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return candidate

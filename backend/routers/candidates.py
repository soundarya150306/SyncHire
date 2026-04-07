import tempfile
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, Response
from sqlalchemy.orm import Session
from typing import List
import os
import schemas, models, crud, database, resume_parser, matcher
from deps import get_current_user

router = APIRouter(
    prefix="/candidates",
    tags=["candidates"]
)

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
    # Read file binary
    file_bytes = resume.file.read()
    file_ext = os.path.splitext(resume.filename)[1]
    
    # Save to a temporary file just to parse it safely across OS
    with tempfile.NamedTemporaryFile(delete=False, suffix=file_ext) as tmp:
        tmp.write(file_bytes)
        tmp_path = tmp.name

    # Parse Resume Text
    resume_text = resume_parser.parse_resume(tmp_path)
    os.unlink(tmp_path)  # Clean up temp file immediately

    # Create Candidate Record Base
    candidate_data = schemas.CandidateCreate(
        first_name=first_name,
        last_name=last_name,
        email=email,
        phone=phone,
        job_id=job_id
    )

    # Calculate Score & Feedback
    job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    job_text = f"{job.description} {job.requirements}"
    score, feedback = matcher.calculate_match_score(resume_text, job_text)

    # Save to DB exactly into the DB rows
    db_candidate = models.Candidate(
        **candidate_data.dict(),
        resume_text=resume_text,
        resume_binary=file_bytes,
        resume_mimetype=resume.content_type,
        resume_filename=resume.filename,
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
        raise HTTPException(status_code=400, detail=f"Status must be one of: {', '.join(valid_statuses)}")

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
    if not candidate.resume_binary:
        raise HTTPException(status_code=404, detail="Resume file data not found in database")

    return Response(
        content=candidate.resume_binary,
        media_type=candidate.resume_mimetype or "application/octet-stream",
        headers={"Content-Disposition": f'attachment; filename="{candidate.resume_filename or "resume.pdf"}"'}
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

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import schemas, models, crud, database
from deps import get_current_user

router = APIRouter(
    prefix="/jobs",
    tags=["jobs"]
)

@router.post("", response_model=schemas.JobResponse)
def create_job(
    job: schemas.JobCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    return crud.create_job(db=db, job=job, user_id=current_user.id)

@router.get("/public", response_model=List[schemas.JobResponse])
def read_public_jobs(recruiter_id: int = None, skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    return crud.get_public_jobs(db, recruiter_id=recruiter_id, skip=skip, limit=limit)

@router.get("", response_model=List[schemas.JobResponse])
def read_jobs(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    return crud.get_jobs(db, user_id=current_user.id, skip=skip, limit=limit)

@router.get("/{job_id}", response_model=schemas.JobDetailResponse)
def read_job(
    job_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    job = crud.get_job(db, job_id=job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    candidate_count = len(job.candidates) if job.candidates else 0
    return schemas.JobDetailResponse(
        id=job.id,
        title=job.title,
        description=job.description,
        requirements=job.requirements,
        owner_id=job.owner_id,
        created_at=job.created_at,
        candidate_count=candidate_count
    )

@router.delete("/{job_id}")
def delete_job(
    job_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    job = crud.get_job(db, job_id=job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    crud.delete_job(db, job_id)
    return {"message": "Job deleted successfully"}

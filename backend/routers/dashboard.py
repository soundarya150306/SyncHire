from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from typing import List
import models, schemas, crud, database
from deps import get_current_user

router = APIRouter(
    prefix="/dashboard",
    tags=["dashboard"]
)

@router.get("/stats", response_model=schemas.DashboardStats)
def get_dashboard_stats(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    total_jobs = db.query(func.count(models.Job.id)).filter(
        models.Job.owner_id == current_user.id
    ).scalar()

    total_candidates = crud.get_total_candidates_count(db, user_id=current_user.id)
    interviews_scheduled = crud.get_interviews_count(db, user_id=current_user.id)

    return schemas.DashboardStats(
        total_jobs=total_jobs,
        total_candidates=total_candidates,
        interviews_scheduled=interviews_scheduled
    )

@router.get("/chart", response_model=List[schemas.ChartDataPoint])
def get_chart_data(
    days: int = 7,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Use a two-step query to avoid any potential join ambiguity
    jobs = db.query(models.Job).filter(models.Job.owner_id == current_user.id).all()
    job_ids = [j.id for j in jobs]

    data = []
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)

    if not job_ids:
        for i in range(days - 1, -1, -1):
            target_day = today_start - timedelta(days=i)
            data.append(schemas.ChartDataPoint(name=target_day.strftime("%a"), applications=0))
        return data

    # Fetch all relevant active candidates' application dates in one go
    candidate_dates = db.query(models.Candidate.applied_at).filter(
        models.Candidate.job_id.in_(job_ids),
        models.Candidate.status != "Rejected"
    ).all()
    
    # Extract dates from tuples
    dates = [d[0] for d in candidate_dates if d[0]]

    for i in range(days - 1, -1, -1):
        target_day = today_start - timedelta(days=i)
        next_day = target_day + timedelta(days=1)

        count = sum(1 for d in dates if target_day <= d < next_day)

        data.append(schemas.ChartDataPoint(
            name=target_day.strftime("%a"),
            applications=count
        ))

    return data

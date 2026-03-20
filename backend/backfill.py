import database, crud, models, matcher
from sqlalchemy.orm import Session
from database import SessionLocal

db = SessionLocal()
candidates = db.query(models.Candidate).all()
for c in candidates:
    if not c.job:
        continue
    job_text = f"{c.job.description} {c.job.requirements}"
    score, feedback = matcher.calculate_match_score(c.resume_text or "", job_text)
    c.score = score
    c.analysis_feedback = feedback

db.commit()
print(f"Backfilled {len(candidates)} candidates.")

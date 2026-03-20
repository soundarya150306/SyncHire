from backend.database import SessionLocal
from backend.models import Candidate

db = SessionLocal()
c = Candidate(first_name="A", last_name="B", email="C", phone="D", resume_text="E", resume_path="F", score=0.0, job_id=1)
print("Before add, status =", c.status)
db.add(c)
try:
    db.commit()
    db.refresh(c)
    print("After commit, status =", c.status)
except Exception as e:
    print("Exception:", e)
    db.rollback()

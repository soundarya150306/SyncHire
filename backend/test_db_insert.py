import sys
sys.path.append(".")
from database import SessionLocal
from models import Candidate
import traceback

db = SessionLocal()
c = Candidate(first_name="A", last_name="B", email="C", phone="D", resume_text="E", resume_path="F", score=0.0, job_id=1)
db.add(c)
try:
    db.commit()
    db.refresh(c)
    print("Success")
except Exception as e:
    print("Full Exception trace:")
    traceback.print_exc()
    db.rollback()

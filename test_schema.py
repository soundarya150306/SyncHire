from backend import schemas
c = schemas.CandidateCreate(first_name="A", last_name="B", email="C", phone="D", resume_path="E", job_id=1)
print(c.dict())

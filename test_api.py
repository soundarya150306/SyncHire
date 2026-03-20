import requests
import os

BASE_URL = "http://localhost:8000"

def test_api():
    print("Starting API Verification...")
    
    # 1. Register
    user_data = {
        "email": "api_test@example.com",
        "password": "password123",
        "full_name": "API Tester",
        "role": "recruiter"
    }
    
    # Try register, if exists, just login
    try:
        reg_res = requests.post(f"{BASE_URL}/auth/register", json=user_data)
        if reg_res.status_code == 200:
            print("[PASS] User Registration")
        elif reg_res.status_code == 400 and "registered" in reg_res.text:
            print("[INFO] User already registered")
        else:
            print(f"[FAIL] Registration: {reg_res.text}")
    except Exception as e:
        print(f"[FAIL] Server not reachable: {e}")
        return

    # 2. Login
    login_data = {"email": "api_test@example.com", "password": "password123"}
    login_res = requests.post(f"{BASE_URL}/auth/login", json=login_data)
    
    if login_res.status_code != 200:
        print(f"[FAIL] Login: {login_res.text}")
        return
        
    token = login_res.json()["access_token"]
    user_id = login_res.json()["user_id"]
    print(f"[PASS] Login (Token received)")

    # 3. Create Job
    job_data = {
        "title": "Backend Developer",
        "description": "Python developer needed.",
        "requirements": "Python, FastAPI, SQL"
    }
    job_res = requests.post(f"{BASE_URL}/jobs/", json=job_data, params={"user_id": user_id})
    
    if job_res.status_code != 200:
        print(f"[FAIL] Create Job: {job_res.text}")
        return
        
    job_id = job_res.json()["id"]
    print(f"[PASS] Job Created (ID: {job_id})")

    # 4. Upload Resume
    # Ensure test resume exists
    if not os.path.exists("test_resume.docx"):
        print("[FAIL] Test resume file not found")
        return

    with open("test_resume.docx", "rb") as f:
        files = {"resume": ("test_resume.docx", f, "application/vnd.openxmlformats-officedocument.wordprocessingml.document")}
        data = {
            "job_id": job_id,
            "first_name": "API",
            "last_name": "Candidate",
            "email": "candidate@test.com",
            "phone": "555-0199"
        }
        upload_res = requests.post(f"{BASE_URL}/candidates/apply", data=data, files=files)
        
    if upload_res.status_code != 200:
        print(f"[FAIL] Upload Resume: {upload_res.text}")
        return
        
    candidate = upload_res.json()
    score = candidate["score"]
    print(f"[PASS] Resume Uploaded & Analyzed")
    print(f"       Candidate: {candidate['first_name']} {candidate['last_name']}")
    print(f"       Match Score: {score}%")
    
    # 5. Verify Candidate List
    list_res = requests.get(f"{BASE_URL}/candidates/{job_id}")
    if list_res.status_code == 200 and len(list_res.json()) > 0:
        print(f"[PASS] Candidate List Retrieval")
    else:
        print(f"[FAIL] Candidate List: {list_res.text}")

if __name__ == "__main__":
    test_api()

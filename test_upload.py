import requests

with open("test_resume.docx", "rb") as f:
    files = {"resume": ("test_resume.docx", f, "application/vnd.openxmlformats-officedocument.wordprocessingml.document")}
    data = {
        "job_id": 1,
        "first_name": "API",
        "last_name": "Candidate",
        "email": "candidate@test.com",
        "phone": "555-0199"
    }
    upload_res = requests.post("http://localhost:8000/candidates/apply", data=data, files=files)
    
print("Status:", upload_res.status_code)
print("Response:", upload_res.text)

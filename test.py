import requests

BASE_URL = "https://synchire-ai-screener.vercel.app/api"
JOB_ID = 2

def test_upload():
    # Write a dummy resume
    with open("dummy.txt", "w") as f:
        f.write("John Doe\njohn.doe@example.com\nExperienced Software Engineer with 5 years of Python and React experience. Built scalable web applications. Strong team player.")

    url = f"{BASE_URL}/candidates/apply"
    data = {
        "job_id": JOB_ID,
        "first_name": "Test",
        "last_name": "User",
        "email": "testuserx123@example.com",
        "phone": "555-0101"
    }
    files = {"resume": ("dummy.docx", open("dummy.docx", "rb"), "application/vnd.openxmlformats-officedocument.wordprocessingml.document")}

    print(f"Testing POST {url} for Job {JOB_ID}...")
    try:
        response = requests.post(url, data=data, files=files)
        print(f"Status: {response.status_code}")
        res = response.json()
        print(f"Feedback: {res.get('analysis_feedback')}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_upload()

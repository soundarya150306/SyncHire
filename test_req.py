import requests

url = "https://synchire-ai-screener.vercel.app/api/auth/register"
data = {
    "email": "pycurl_test@example.com",
    "password": "password123",
    "full_name": "PyCurl Test",
    "role": "recruiter"
}
try:
    res = requests.post(url, json=data)
    with open("out.txt", "w") as f:
        f.write(str(res.status_code) + "\n" + res.text)
except Exception as e:
    with open("out.txt", "w") as f:
        f.write("Error: " + str(e))

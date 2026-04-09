import json
import os
import google.generativeai as genai
from typing import Tuple
from dotenv import load_dotenv

# Ensure we always load from the backend folder, regardless of where uvicorn was started from
dotenv_path = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(dotenv_path)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

def calculate_match_score(resume_text: str, job_text: str) -> Tuple[float, str]:
    """
    Score resume against job using Google's Gemini API.
    """
    if not resume_text or not job_text:
        return 0.0, '{"matched_skills": [], "missing_skills": [], "summary": "Resume could not be parsed or lacks enough text."}'

    if not GEMINI_API_KEY:
        return 0.0, '{"matched_skills": [], "missing_skills": [], "summary": "Gemini API key is not configured."}'

    # Initialize model
    model = genai.GenerativeModel('gemini-2.5-flash')

    prompt = f"""
    You are an expert technical recruiter analyzing a resume against a job description.
    Analyze the candidate's resume based on the job requirements to determine if they are suitable for the role.

    Job Description/Requirements:
    {job_text}

    Resume:
    {resume_text}

    Please provide your analysis in the following strict JSON format:
    {{
        "score": <float between 0 and 100 representing the match percentage based on suitability>,
        "matched_skills": [<list of key strengths from the resume that match the job>],
        "missing_skills": [<list of key requirements from the job missing from the resume>],
        "summary": "<a short, professional executive summary outlining why the candidate is or isn't suitable for this specific role>"
    }}

    IMPORTANT: Analyze carefully whether the person is suitable for the job. Do not invent details. Return ONLY valid JSON, without any markdown formatting blocks.
    """

    response = model.generate_content(prompt)
    resp_text = response.text.strip()
    
    # Clean markdown code blocks if the model includes them
    if resp_text.startswith("```json"):
        resp_text = resp_text[7:-3].strip()
    elif resp_text.startswith("```"):
        resp_text = resp_text[3:-3].strip()
        
    result = json.loads(resp_text)
    
    score_val = float(result.get("score", 0.0))
    feedback = {
        "matched_skills": result.get("matched_skills", []),
        "missing_skills": result.get("missing_skills", []),
        "summary": result.get("summary", "No summary provided by API.")
    }
    return score_val, json.dumps(feedback)

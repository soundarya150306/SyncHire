from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import re

def clean_text(text: str) -> str:
    # Simple cleaning: remove special chars, lowercase
    text = re.sub(r'\s+', ' ', text)
    text = re.sub(r'[^\w\s]', '', text)
    return text.lower()

import json

from typing import Tuple

def calculate_match_score(resume_text: str, job_text: str) -> Tuple[float, str]:
    if not resume_text or not job_text:
        return 0.0, '{"matched_skills": [], "missing_skills": [], "summary": "Resume could not be parsed or lacks enough text."}'

    cleaned_resume = clean_text(resume_text)
    
    # We expect job_text to contain the requirements comma separated for explicit matching.
    # We will try to extract keywords explicitly by splitting commas.
    # The application concatenates description + requirements. We'll extract words to search for.
    # To be robust, let's just split the job_text by punctuation or spaces to get "keywords"
    # But usually, it's safer to extract key phrases.
    # For this rewrite, let's treat the job_text as a comma-separated list of requirements 
    # if it has commas, otherwise space-separated words (excluding stopwords ideally, but we'll do simple).
    
    if ',' in job_text:
        raw_keywords = [k.strip() for k in job_text.split(',')]
    else:
        raw_keywords = [w.strip() for w in job_text.split() if len(w) > 2]
        
    # Clean the keywords for matching
    keywords = list(set([clean_text(k) for k in raw_keywords if clean_text(k)]))
    
    if not keywords:
        return 0.0, '{"matched_skills": [], "missing_skills": [], "summary": "No specific keywords provided."}'

    matched_keywords = []
    missing_keywords = []

    for word in keywords:
        # Match using word boundaries if it's a single word, or just simple inclusion
        if f" {word} " in f" {cleaned_resume} ":
            matched_keywords.append(word)
        else:
            missing_keywords.append(word)

    total = len(keywords)
    matched_count = len(matched_keywords)
    
    if total > 0:
        score_val = round((matched_count / total) * 100, 2)
    else:
        score_val = 0.0

    # Build AI-like feedback
    summary_phrases = []
    if score_val >= 80:
        summary_phrases.append("Candidate exhibits an exceptionally strong technical alignment with the requirements.")
    elif score_val >= 50:
        summary_phrases.append("Candidate shows moderate alignment with the core technical requirements.")
    else:
        summary_phrases.append("Candidate appears to lack several of the foundational technical requirements.")
        
    summary_phrases.append(f"They possess {matched_count} of the {total} key proficiencies identified in the job description.")
    
    if matched_keywords:
        top_skills = ", ".join(matched_keywords[:3]).title()
        summary_phrases.append(f"Notable strengths include solid demonstrated experience in {top_skills}.")
        
    if missing_keywords:
        top_gaps = ", ".join(missing_keywords[:2]).title()
        summary_phrases.append(f"However, experience with {top_gaps} is not explicitly evident in the provided resume context.")

    summary = " ".join(summary_phrases)

    feedback = {
        "matched_skills": [k.title() for k in matched_keywords[:15]],
        "missing_skills": [k.title() for k in missing_keywords[:15]],
        "summary": summary
    }

    return score_val, json.dumps(feedback)

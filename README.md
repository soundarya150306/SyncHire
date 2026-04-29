# SyncHire (AI Resume Screener)

**Live Demo:** [https://synchire-ai-screener.vercel.app](https://synchire-ai-screener.vercel.app)

## 1. Technical Stack

**Frontend (Client)**
- **Framework:** React v18+
- **Build Tool:** Vite
- **Styling:** Tailwind CSS, `clsx`, `tailwind-merge`
- **Animations:** Framer Motion (Smooth page transitions and micro-interactions)
- **Analytics UI:** Recharts (Dynamic application graphs)
- **Routing:** React-Router-DOM v6
- **HTTP Client:** Axios
- **Icons:** `lucide-react`

**Backend (Server)**
- **Framework:** FastAPI (Python 3.8+)
- **Server:** Uvicorn (local) / Vercel Serverless (production)
- **Authentication:** JWT-based stateless authentication (`python-jose`), Passwords hashed via `passlib[bcrypt]`
- **Database ORM:** SQLAlchemy
- **AI Integration:** Google Gemini API (Model: `gemini-2.5-flash`)

**Document Parsing Libraries**
- **PDF Files:** `pdfminer.six`
- **Word Documents:** `python-docx`

---

## 2. Database & Storage

- **Database Engine:** PostgreSQL (Production) / SQLite (Local/Fallback)
- **Persistence:** Configured for cloud persistence using PostgreSQL (e.g., Vercel Postgres, Neon) ensuring authentication state and candidate data persists reliably across serverless instances.
- **Connection Management:** Connection pooling tailored for serverless environments to prevent connection exhaustion.
- **Storage Strategy:** Uses remote DB for structured data. File attachments (resumes) in production are handled ephemerally during AI processing due to the read-only file system on serverless architectures.

**Data Tables:**
- `users`: Stores emails, hashed passwords, and roles (Recruiter/Standard).
- `jobs`: Stores job details, descriptions, and requirements.
- `candidates`: Stores PII, parsed resume text, Gemini-generated match score, and structured feedback (JSON).

---

## 3. Intelligent Resume Analysis (Gemini AI)

The core engine (`backend/matcher.py`) uses **Google Gemini 1.5/2.x Flash** for high-performance AI analysis.

**How it works:**
1. **Extraction:** The system extracts raw text from PDF/Word documents.
2. **Contextual Analysis:** The resume text and job description are sent to the Gemini API with a specialized recruitment prompt.
3. **Scoring:** The AI calculates a match score (0-100) based on suitability, experience, and skill alignment.
4. **Structured Feedback:** The AI returns a structured JSON response containing:
   - **Matched Skills:** Identified key strengths aligned with the job.
   - **Missing Skills:** Critical gaps found in the candidate's profile.
   - **Executive Summary:** A professional assessment of the candidate's fit.

---

## 4. Key Highlights & Features

- **Advanced AI Matching:** Leverages Large Language Models to provide "human-like" screening, understanding context beyond simple word counts.
- **Recruiter-Focused UI:** The "Candidates" section is styled and integrated as "Interview Schedules", focusing workflow on active pipeline management. Candidates rejected by AI screening are automatically hidden to keep dashboards clean.
- **Modern Pro Analytics:** Integrated dashboard with visual data representations for application trends over time.
- **Clean UI/UX:** A premium recruiter experience built with modern design principles, including glassmorphism and subtle animations.
- **Serverless Architecture:** Re-architected API endpoints using a standardized `/api` prefix, seamlessly linking the React frontend with the FastAPI backend without 404 errors.

---

## 5. Deployment Information

- **Hosting Platform:** Vercel
- **Frontend Deployment:** Deployed as a single-page application using `@vercel/static-build`.
- **Backend Deployment:** Deployed via Vercel Serverless Functions (`@vercel/python` routing through `api/index.py`).
- **Routing Rules:** Custom `vercel.json` rewrite configurations map `/api/*` to the FastAPI backend, while routing client-side requests back to `index.html`.

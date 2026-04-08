# Project Details: SyncHire (AI Resume Screener)

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
- **Server:** Uvicorn
- **Authentication:** JWT-based stateless authentication (`python-jose`), Passwords hashed via `passlib[bcrypt]`
- **Database ORM:** SQLAlchemy
- **AI Integration:** Google Gemini API (Model: `gemini-2.5-flash`)

**Document Parsing Libraries**
- **PDF Files:** `pdfminer.six`
- **Word Documents:** `python-docx`

---

## 2. Database & Storage

- **Database Engine:** SQLite
- **Persistence:** Configured for cloud persistence using Render Persistent Disks.
- **File Locations (Production):** 
  - Database: `/data/cv_screening.db`
  - Resume Uploads: `/data/uploads/`
- **Local File Location:** `backend/cv_screening.db`

**Data Tables:**
- `users`: Stores emails, hashed passwords, and roles (Recruiter/Standard).
- `jobs`: Stores job details, descriptions, and requirements.
- `candidates`: Stores PII, parsed resume text, Gemini-generated match score, and structured feedback (JSON).

---

## 3. Intelligent Resume Analysis (Gemini AI)

The core engine (`backend/matcher.py`) has been upgraded from simple keyword matching to high-performance AI analysis using **Google Gemini 1.5/2.x Flash**.

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
- **Modern Pro Analytics:** Integrated dashboard with visual data representations for application trends over time.
- **Enterprise-Ready Deployment:** Docker-compatible configuration (Render) with persistent localized storage for high-security environments.
- **Clean UI/UX:** A premium recruiter experience built with modern design principles, including glassmorphism and subtle animations.
- **Extensible Architecture:** Decoupled router-based FastAPI structure allows for easy scaling of features like automated emailing or interview scheduling.

---

## 5. Deployment Information

- **Hosting Platform:** Render
- **Frontend:** Deployed as a Static Site (SyncHire-frontend)
- **Backend:** Deployed as a Web Service (SyncHire-backend)
- **Storage:** Attaches a 1GB Persistent Disk to the backend to ensure data persists across redeployments.


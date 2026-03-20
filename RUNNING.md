# Running the AI Resume Screener

The project is located at: `C:\Users\iswar\.gemini\antigravity\scratch`

## 1. Project Directory

First, navigate to the project directory:
```powershell
cd "C:\Users\iswar\.gemini\antigravity\scratch"
```

---

## 2. Backend Setup (FastAPI)

Prerequisites: Python 3.8+

1.  **Navigate to backend**:
    ```powershell
    cd backend
    ```

2.  **Activate Virtual Environment** (if it exists):
    ```powershell
    .\venv\Scripts\activate
    ```

3.  **Install Dependencies**:
    Since `requirements.txt` might be missing, install the core dependencies:
    ```powershell
    pip install fastapi uvicorn sqlalchemy python-multipart pdfminer.six python-docx scikit-learn python-jose[cryptography] passlib[bcrypt]
    ```

4.  **Run the Server**:
    ```powershell
    uvicorn main:app --reload
    ```
    The API will be available at `http://localhost:8000`.

---

## 3. Frontend Setup (React + Vite)

Prerequisites: Node.js (v18+)

1.  **Navigate to frontend** (from root):
    ```powershell
    cd "C:\Users\iswar\.gemini\antigravity\scratch\frontend"
    ```

2.  **Install Dependencies**:
    ```powershell
    npm install
    ```

3.  **Start Dev Server**:
    ```powershell
    npm run dev
    ```
    The app will be available at `http://localhost:5173`.

---

## 4. Summary

- **Backend**: `http://localhost:8000`
- **Frontend**: `http://localhost:5173`
- **Common Issue**: If you see "Cannot find path", ensure you are using the full path `C:\Users\iswar\.gemini\antigravity\scratch`.

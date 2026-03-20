from pdfminer.high_level import extract_text
import docx
import os

def extract_text_from_pdf(pdf_path: str) -> str:
    try:
        return extract_text(pdf_path)
    except Exception as e:
        print(f"Error reading PDF: {e}")
        return ""

def extract_text_from_docx(docx_path: str) -> str:
    try:
        doc = docx.Document(docx_path)
        return "\n".join([para.text for para in doc.paragraphs])
    except Exception as e:
        print(f"Error reading DOCX: {e}")
        return ""

def parse_resume(file_path: str) -> str:
    if not os.path.exists(file_path):
        return ""
        
    if file_path.endswith(".pdf"):
        return extract_text_from_pdf(file_path)
    elif file_path.endswith(".docx"):
        return extract_text_from_docx(file_path)
    else:
        return ""

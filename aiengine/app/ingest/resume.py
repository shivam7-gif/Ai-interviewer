import io
import re
from pypdf import PdfReader

MAX_BYTES = 5 * 1024 * 1024
MAX_PAGES = 4
MAX_CHARS = 12000


class ResumeError(ValueError):
    pass


def extract_resume_text(pdf: bytes) -> str:
    if len(pdf) > MAX_BYTES:
        raise ResumeError("File is larger than 5 MB.")
    if not pdf.startswith(b"%PDF"):
        raise ResumeError("This is not a PDF file.")
    try:
        reader = PdfReader(io.BytesIO(pdf))
    except Exception:
        raise ResumeError("Could not read this PDF.")
    if reader.is_encrypted:
        raise ResumeError("This PDF is password protected.")

    text = "\n".join((p.extract_text() or "") for p in reader.pages[:MAX_PAGES])
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text).strip()

    if len(text.split()) < 50:
        raise ResumeError(
            "Almost no text found. This looks like a scanned image. "
            "Upload a text-based PDF or paste the text instead."
        )
    return text[:MAX_CHARS]
